import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProgress, SAVE_KEY } from '../dist/invasion/campaign.mjs';
import { inspectCampaignSave, readCampaignSave, writeCampaignSave, listRecoveryBackups, recoveryBackupPrefix, recoveryFailureMessage } from '../dist/invasion/save-recovery.mjs';

const fixture=name=>JSON.parse(readFileSync(new URL('./fixtures/invasion/'+name,import.meta.url)));
const envelope=(activeMission=null)=>({...createProgress(),activeMission});
function memory(raw=null){
  const data=new Map(raw===null?[]:[[SAVE_KEY,raw]]),writes=[];
  const storage={get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:key=>data.get(key)??null,
    setItem(key,value){writes.push({key,value});data.set(key,value);}};
  return {data,writes,storage,access:()=>storage};
}

test('Empty/current saves load without writes; healthy battles and campaign totals remain available',()=>{
  const empty=memory();assert.equal(readCampaignSave(empty.access).status,'empty');assert.deepEqual(empty.writes,[]);
  const raw=envelope(fixture('mission-v2-between-arrivals.json'));raw.captured.titan=true;raw.matter=321;
  const store=memory(JSON.stringify(raw)),state=readCampaignSave(store.access);
  assert.equal(state.status,'ready');assert.equal(state.progress.matter,321);assert.equal(state.progress.captured.titan,true);
  assert.equal(state.activeMission.version,3);assert.equal(state.needsBackup,true);assert.deepEqual(store.writes,[]);
});

test('Invalid JSON and unknown campaign versions stay protected and export their exact original bytes',()=>{
  for(const raw of [' { broken file\n',JSON.stringify({...envelope(),version:999})]){
    const store=memory(raw),state=readCampaignSave(store.access);
    assert.equal(state.status,'recovery');assert.equal(state.issue.canKeepCampaign,false);assert.equal(state.raw,raw);
    assert.equal(writeCampaignSave(store.access,createProgress(),null,state).reason,'protected');
    assert.equal(store.storage.getItem(SAVE_KEY),raw);assert.deepEqual(store.writes,[]);
  }
});

test('An unsupported or damaged battle preserves its valid campaign until explicit recovery',()=>{
  for(const mission of [{version:999,battle:{}},{version:3,battle:{}},[],42]){
    const raw=envelope(mission);raw.captured.titan=true;raw.stars.titan=3;raw.matter=777;
    const original=JSON.stringify(raw,null,2),store=memory(original),state=readCampaignSave(store.access);
    assert.equal(state.status,'recovery');assert.equal(state.issue.canKeepCampaign,true);
    assert.equal(state.progress.matter,777);assert.equal(state.progress.stars.titan,3);assert.equal(state.activeMission,null);
    const done=writeCampaignSave(store.access,state.progress,null,state,{resolve:true});assert.ok(done.ok);
    assert.equal(store.storage.getItem(done.backupKey),original);assert.ok(done.backupKey.startsWith(recoveryBackupPrefix));
    assert.equal(JSON.parse(store.storage.getItem(SAVE_KEY)).captured.titan,true);
    assert.equal(store.writes[0].key,done.backupKey,'backup is written before replacement');
    assert.equal(store.writes[1].key,SAVE_KEY);
  }
});

test('Damaged campaign fields recover readable data and never inject inherited unlock definitions',()=>{
  const raw=envelope();raw.matter=500;raw.captured.titan=true;raw.unlocks.push('constructor',{toString:null});delete raw.stats.dronesLost;
  const state=inspectCampaignSave(JSON.stringify(raw));
  assert.equal(state.status,'recovery');assert.equal(state.issue.kind,'damaged-progress');
  assert.equal(state.progress.matter,500);assert.equal(state.progress.captured.titan,true);
  assert.deepEqual(state.progress.unlocks,['scout','link']);
  const store=memory(state.raw),done=writeCampaignSave(store.access,state.progress,null,state,{resolve:true});
  assert.ok(done.ok);assert.equal(done.state.status,'ready');
});

test('Real old campaign and mission fixtures migrate only after retaining their exact original file',()=>{
  for(const name of ['mission-v1-mid-drop.json','mission-v2-between-arrivals.json']){
    const campaign=fixture('progress-v1-after-titan.json');campaign.activeMission=fixture(name);
    const original=JSON.stringify(campaign,null,2),store=memory(original),state=readCampaignSave(store.access);
    assert.equal(state.status,'ready');assert.equal(state.needsBackup,true);
    const done=writeCampaignSave(store.access,state.progress,state.activeMission,state);assert.ok(done.ok);
    const disk=JSON.parse(store.storage.getItem(SAVE_KEY));
    assert.equal(disk.version,2);assert.equal(disk.activeMission.version,3);
    assert.equal(disk.activeMission.battle.matter,campaign.activeMission.battle.matter);
    assert.deepEqual(disk.activeMission.battle.pods.map(p=>p.payload),campaign.activeMission.battle.pods.map(p=>p.payload));
    assert.equal(store.storage.getItem(done.backupKey),original);assert.equal(done.state.needsBackup,false);
    assert.ok(writeCampaignSave(store.access,done.state.progress,done.state.activeMission,done.state).ok);
    assert.equal(listRecoveryBackups(store.access).length,1,'ordinary later saves do not duplicate the migration backup');
  }
});

test('A settled checkpoint never resumes or receives a second result',()=>{
  const mission=fixture('mission-v2-between-arrivals.json'),first=inspectCampaignSave(JSON.stringify(envelope(mission)));
  const progress=createProgress();progress.settledMissions[first.activeMission.battle.missionId]={planetId:'titan',outcome:'won'};
  const state=inspectCampaignSave(JSON.stringify({...progress,activeMission:first.activeMission}));
  assert.equal(state.status,'ready');assert.equal(state.activeMission,null);assert.equal(state.needsBackup,true);
});

test('Unreadable storage is distinct from a missing save and cannot be overwritten by temporary play',()=>{
  const access=()=>{throw new Error('permission denied');},state=readCampaignSave(access);
  assert.equal(state.status,'unavailable');assert.match(state.issue.message,/temporary campaign/);
  assert.equal(writeCampaignSave(access,createProgress(),null,state).reason,'unavailable');
  assert.equal(listRecoveryBackups(access).length,0);
});

test('Backup quota failure and a non-retaining storage implementation leave the original untouched',()=>{
  for(const silent of [false,true]){
    const original='{invalid',store=memory(original),state=readCampaignSave(store.access);
    store.storage.setItem=(key,value)=>{if(key!==SAVE_KEY){if(silent)return;throw new Error('quota');}throw new Error('must not write primary');};
    const result=writeCampaignSave(store.access,createProgress(),null,state,{resolve:true});
    assert.equal(result.reason,'backup');assert.equal(store.storage.getItem(SAVE_KEY),original);
  }
});

test('A failed final write retains both original primary and backup; retry reuses rather than overwrites it',()=>{
  const original='{invalid',store=memory(original),state=readCampaignSave(store.access),set=store.storage.setItem;
  store.storage.setItem=(key,value)=>{if(key===SAVE_KEY)throw new Error('quota');set(key,value);};
  const failed=writeCampaignSave(store.access,createProgress(),null,state,{resolve:true});
  assert.equal(failed.reason,'write');assert.equal(store.storage.getItem(SAVE_KEY),original);
  assert.equal(store.storage.getItem(failed.backupKey),original);
  store.storage.setItem=set;
  const done=writeCampaignSave(store.access,createProgress(),null,state,{resolve:true});assert.ok(done.ok);
  assert.equal(done.backupKey,failed.backupKey);assert.equal(listRecoveryBackups(store.access).length,1);
});

test('Another-tab changes before or during backup prevent overwriting that newer save',()=>{
  const original='{invalid';
  for(const duringBackup of [false,true]){
    const store=memory(original),state=readCampaignSave(store.access),newer=JSON.stringify({...envelope(),matter:999});
    if(duringBackup){const set=store.storage.setItem;store.storage.setItem=(key,value)=>{set(key,value);if(key!==SAVE_KEY)store.data.set(SAVE_KEY,newer);};}
    else store.data.set(SAVE_KEY,newer);
    assert.equal(writeCampaignSave(store.access,createProgress(),null,state,{resolve:true}).reason,'changed');
    assert.equal(store.storage.getItem(SAVE_KEY),newer);
  }
});

test('Backup key collisions preserve older copies and use a verified alternate key',()=>{
  const original='{invalid',store=memory(original),state=readCampaignSave(store.access),get=store.storage.getItem;
  let firstKey;
  store.storage.getItem=key=>{if(key.startsWith(recoveryBackupPrefix)&&!key.endsWith('-1')){firstKey=key;return 'older copy';}return get(key);};
  const done=writeCampaignSave(store.access,createProgress(),null,state,{resolve:true});assert.ok(done.ok);
  assert.equal(done.backupKey,firstKey+'-1');assert.equal(get(done.backupKey),original);
  assert.ok(!store.writes.some(w=>w.key===firstKey));
});

test('Invalid session data refuses a write, and every failure has a usable recovery explanation',()=>{
  const store=memory(),state=readCampaignSave(store.access);
  assert.equal(writeCampaignSave(store.access,createProgress(),{version:999},state).reason,'invalid');
  assert.deepEqual(store.writes,[]);
  for(const reason of ['protected','backup','changed','unavailable','invalid','write'])assert.ok(recoveryFailureMessage(reason).length>30);
});
