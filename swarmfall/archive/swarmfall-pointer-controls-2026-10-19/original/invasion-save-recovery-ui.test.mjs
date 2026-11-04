// Actual entry-point wiring with DOM/storage/download stand-ins. No browser/GPU acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createProgress, SAVE_KEY } from '../dist/invasion/campaign.mjs';
import { recoveryBackupPrefix } from '../dist/invasion/save-recovery.mjs';
import { createBattle, requestDrop } from '../dist/invasion/battle.mjs';
import { planetById } from '../dist/invasion/campaign.mjs';
import { missionCheckpoint } from '../dist/invasion/mission-save.mjs';

const entry=new URL('../dist/invasion/main.mjs',import.meta.url),source=readFileSync(entry,'utf8');
const html=readFileSync(new URL('../dist/invasion/index.html',import.meta.url),'utf8');
const importPattern=/^import[\s\S]*?from\s+["']([^"']+)["'];?\r?$/gm;
const bindings={};
for(const match of source.matchAll(importPattern)){
  if(match[1].includes('scene.mjs')){bindings.createInvasionScene=()=>{throw new Error('No renderer in this test');};continue;}
  if(match[1].includes('galaxy.mjs')){Object.assign(bindings,{drawStarfield(){},drawGalaxy:()=>[]});continue;}
  Object.assign(bindings,await import(new URL(match[1],entry).href));
}

function harness(raw=null,{renderer=false}={}){
  const data=new Map(raw===null?[]:[[SAVE_KEY,raw]]),writes=[],nodes=new Map(),blobs=[],revoked=[];
  let failRead=false,failBackup=false,failPrimary=false;
  const storage={get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:key=>data.get(key)??null,
    setItem(key,value){if(failPrimary&&key===SAVE_KEY||failBackup&&key.startsWith(recoveryBackupPrefix))throw new Error('quota');writes.push({key,value});data.set(key,value);}};
  class Element{
    constructor(id='',tag='div'){this.id=id;this.tagName=tag;this.hidden=false;this.disabled=false;this.open=false;this.value='';this.children=[];this.handlers={};this.dataset={};this.style={setProperty(){}};this.queries=new Map();this.classList={toggle(){},add(){},remove(){},contains:()=>false};this.clientWidth=800;this.clientHeight=600;}
    addEventListener(kind,fn){(this.handlers[kind]??=[]).push(fn);}
    async click(){if(this.disabled)return;this.onclick?.();await Promise.all((this.handlers.click||[]).map(fn=>fn({currentTarget:this,target:this})));}
    showModal(){this.open=true;}
    close(){this.open=false;queueMicrotask(()=>this.onclose?.());}
    append(child){this.children.push(child);if(this.id==='save-backup-choice'&&this.children.length===1)this.value=child.value;}
    replaceChildren(){this.children=[];this.value='';}
    setAttribute(){} remove(){} focus(){} contains(){return false;}
    getContext(){return {setTransform(){}};}
    querySelector(selector){if(!this.queries.has(selector))this.queries.set(selector,new Element());return this.queries.get(selector);}
    querySelectorAll(){return [];}
  }
  for(const tag of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){
    const node=new Element(tag[1]);node.hidden=/\bhidden(?:\s|>)/.test(tag[0]);nodes.set(tag[1],node);
  }
  const document={body:new Element(),getElementById:id=>nodes.get(id)||null,
    querySelectorAll:selector=>selector==='.screen'?[...nodes.values()].filter(n=>n.id.startsWith('screen-')):[],
    querySelector:()=>null,createElement:tag=>new Element('',tag),addEventListener(){}};
  class DownloadURL extends URL{
    static createObjectURL(blob){blobs.push(blob);return 'blob:test-'+blobs.length;}
    static revokeObjectURL(url){revoked.push(url);}
  }
  const context=vm.createContext({...bindings,document,window:{devicePixelRatio:1,addEventListener(){}},location:{hostname:'unit-test'},
    URL:DownloadURL,Blob,console,performance,queueMicrotask,requestAnimationFrame(){},setInterval(){},setTimeout(fn){queueMicrotask(fn);},addEventListener(){}});
  if(renderer)context.createInvasionScene=()=>({load(){},resize(){}});
  Object.defineProperty(context,'localStorage',{get(){if(failRead)throw new Error('permission denied');return storage;}});
  const start=()=>vm.runInContext(source.replace(importPattern,''),context,{filename:'Swarmfall entry-point unit harness'});
  const click=id=>nodes.get(id).click();
  async function confirmAction(id,answer=true){const pending=click(id);assert.equal(nodes.get('confirm-dialog').open,true);await click(answer?'confirm-yes':'confirm-no');await pending;}
  return {data,writes,nodes,blobs,revoked,storage,context,start,click,confirmAction,
    failReading(value){failRead=value;},failBackup(value){failBackup=value;},failPrimary(value){failPrimary=value;}};
}

test('Healthy title save controls export the exact original through Blob without changing storage',async()=>{
  const raw=JSON.stringify({...createProgress(),activeMission:null},null,2),h=harness(raw);h.start();
  assert.equal(h.nodes.get('save-notice').hidden,true);assert.deepEqual(h.writes,[]);
  await h.click('save-files-button');assert.equal(h.nodes.get('save-dialog').open,true);
  await h.click('save-download-original');assert.equal(await h.blobs[0].text(),raw);
  assert.match(h.nodes.get('save-action-status').textContent,/download requested/);
  assert.equal(h.revoked.length,1);assert.deepEqual(h.writes,[]);
});

test('A blocked download reports failure without deleting or rewriting the saved file',async()=>{
  const raw='{broken',h=harness(raw);h.start();await h.click('save-review');
  vm.runInContext("URL.createObjectURL=()=>{throw new Error('downloads blocked');};",h.context);
  await h.click('save-download-original');assert.match(h.nodes.get('save-action-status').textContent,/download could not start/i);
  assert.equal(h.data.get(SAVE_KEY),raw);assert.deepEqual(h.writes,[]);
});

test('Recovery confirmation cancel keeps the original; confirmed recovery exposes its preserved backup',async()=>{
  const raw=JSON.stringify({...createProgress(),matter:321,activeMission:{version:999}}),h=harness(raw);h.start();
  assert.equal(h.nodes.get('play-button').disabled,true);assert.equal(h.nodes.get('save-notice').hidden,false);
  await h.click('save-review');await h.confirmAction('save-resolve',false);assert.deepEqual(h.writes,[]);
  await h.confirmAction('save-resolve');assert.equal(h.nodes.get('play-button').disabled,false);
  assert.equal(JSON.parse(h.data.get(SAVE_KEY)).matter,321);assert.equal(JSON.parse(h.data.get(SAVE_KEY)).activeMission,null);
  assert.ok(h.writes[0].key.startsWith(recoveryBackupPrefix));assert.equal(h.writes[0].value,raw);
  assert.equal(h.nodes.get('save-backups').hidden,false);await h.click('save-download-backup');
  assert.equal(await h.blobs[0].text(),raw);
});

test('Backup failure keeps recovery blocked and shows a useful explanation in the dialog',async()=>{
  const raw='{broken',h=harness(raw);h.failBackup(true);h.start();await h.click('save-review');await h.confirmAction('save-resolve');
  assert.equal(h.data.get(SAVE_KEY),raw);assert.equal(h.nodes.get('play-button').disabled,true);
  assert.match(h.nodes.get('save-summary').textContent,/backup could not be stored/i);
  h.failBackup(false);await h.confirmAction('save-resolve');assert.equal(h.nodes.get('play-button').disabled,false);
});

test('Storage access failure offers temporary play and can retry reading the original campaign',async()=>{
  const h=harness(JSON.stringify({...createProgress(),matter:777,activeMission:null}));h.failReading(true);h.start();
  assert.equal(h.nodes.get('play-button').textContent,'Play without saving');assert.equal(h.nodes.get('play-button').disabled,false);
  assert.equal(h.nodes.get('reset-button').disabled,true);await h.click('save-files-button');
  await h.click('save-retry-read');assert.match(h.nodes.get('save-action-status').textContent,/storage is unavailable/i);
  h.failReading(false);await h.click('save-retry-read');assert.match(h.nodes.get('save-record').textContent,/777 matter/);
  assert.equal(h.nodes.get('save-notice').hidden,true);assert.deepEqual(h.writes,[]);
});

test('A failed reset never replaces the current in-memory campaign and retains the disk original',async()=>{
  const raw=JSON.stringify({...createProgress(),matter:555,activeMission:null}),h=harness(raw);h.start();h.failPrimary(true);
  await h.confirmAction('reset-button');assert.equal(h.data.get(SAVE_KEY),raw);
  assert.match(h.nodes.get('save-record').textContent,/555 matter/);assert.ok(h.writes.every(w=>w.key!==SAVE_KEY));
  assert.match(h.nodes.get('save-summary').textContent,/could not be written/i);
});

test('Cross-tab conflict preserves unsaved session data; reading newer data requires an explicit choice',async()=>{
  const raw=JSON.stringify({...createProgress(),activeMission:null}),h=harness(raw);h.start();
  h.data.set(SAVE_KEY,JSON.stringify({...createProgress(),matter:999,activeMission:null}));
  vm.runInContext('progress.matter=444;saveProgress();',h.context);await h.click('save-files-button');
  assert.equal(h.nodes.get('play-button').disabled,true);await h.click('save-download-session');
  assert.equal(JSON.parse(await h.blobs[0].text()).matter,444);
  await h.confirmAction('save-retry-read',false);assert.match(h.nodes.get('save-record').textContent,/444 matter/);
  await h.confirmAction('save-retry-read');assert.match(h.nodes.get('save-record').textContent,/999 matter/);
  assert.equal(h.nodes.get('play-button').disabled,false);assert.deepEqual(h.writes,[]);
});

function savedCommandMission(dropPanelOpen){
  const battle=createBattle(planetById('titan'),{matter:1000});
  assert.ok(requestDrop(battle,{x:battle.zones[0].x,z:battle.zones[0].z,payload:{scout:4,link:2}}).ok);
  return missionCheckpoint({battle,cam:{focus:{x:-220,z:180},distance:340,yaw:.6,pitch:.8},
    selected:new Set([1]),payload:{scout:0,link:2},dropPanelOpen,placing:true,dropPoint:{x:999,z:999},speed:3});
}

test('Actual Resume restores command intent while cancelling placement and keeping the battle paused',async()=>{
  const checkpoint=savedCommandMission(true),raw=JSON.stringify({...createProgress(),activeMission:checkpoint});
  const h=harness(raw,{renderer:true});h.start();await h.click('resume-button');
  const restored=JSON.parse(vm.runInContext('JSON.stringify({paused:mission.paused,speed:mission.speed,selected:[...mission.selected],payload:mission.payload,cam:mission.cam,placing:mission.placing,dropPoint:mission.dropPoint,cleanView:mission.cleanView,matter:mission.battle.matter})',h.context));
  assert.equal(restored.paused,true);assert.equal(restored.speed,1);assert.deepEqual(restored.selected,[1]);
  assert.deepEqual(restored.payload,checkpoint.command.payload);assert.deepEqual(restored.cam,checkpoint.cam);
  assert.equal(restored.placing,false);assert.equal(restored.dropPoint,null);assert.equal(restored.cleanView,false);
  assert.equal(restored.matter,checkpoint.battle.matter);assert.equal(h.nodes.get('placement-hint').hidden,true);
  assert.equal(h.nodes.get('placement-launch').disabled,true);assert.equal(h.nodes.get('drop-panel').hidden,false);
  assert.deepEqual(JSON.parse(h.data.get(SAVE_KEY)).activeMission.command.selected,[1],'selection remains saved across VM realms');
});

test('A saved closed drop panel stays closed on Resume and no pod is launched by a stale preview',async()=>{
  const checkpoint=savedCommandMission(false),h=harness(JSON.stringify({...createProgress(),activeMission:checkpoint}),{renderer:true});
  h.start();await h.click('resume-button');assert.equal(h.nodes.get('drop-panel').hidden,true);
  await h.click('placement-launch');
  const disk=JSON.parse(h.data.get(SAVE_KEY));assert.equal(disk.activeMission.battle.stats.drops,1);
  assert.equal(disk.activeMission.battle.pods.length,checkpoint.battle.pods.length);
  assert.equal(disk.activeMission.command.dropPanelOpen,false);
});
