import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createBattle, requestDrop, stepBattle, orderSquads, flatTerrain } from '../dist/invasion/battle.mjs';
import { planetById } from '../dist/invasion/campaign.mjs';
import { restoreCommandState } from '../dist/invasion/command-state.mjs';
import { missionCheckpoint, validMissionCheckpoint, restoreMissionCheckpoint } from '../dist/invasion/mission-save.mjs';

const cam={focus:{x:-220,z:180},distance:340,yaw:.6,pitch:.8};
function mission(){
  const b=createBattle(planetById('titan'),{matter:1000});
  assert.ok(requestDrop(b,{x:b.zones[0].x,z:b.zones[0].z,payload:{scout:4,link:2}}).ok);
  return {battle:b,cam,selected:new Set([1]),payload:{scout:0,link:2},dropPanelOpen:true};
}
const run=(b,s)=>{for(let i=0;i<Math.round(s*20);i++)stepBattle(b,.05);};

test('Command checkpoint retains selection, camera, zero counts and panel state without mutating the mission',()=>{
  const m=mission(),before=structuredClone({cam:m.cam,payload:m.payload,selected:[...m.selected]});
  const saved=missionCheckpoint(m),restored=restoreMissionCheckpoint(saved,flatTerrain);
  assert.ok(restored);assert.deepEqual(restored.cam,cam);
  assert.deepEqual(restored.command,{version:1,selected:[1],payload:{scout:0,link:2},dropPanelOpen:true});
  restored.command.payload.link=99;restored.command.selected.push(42);
  assert.deepEqual({cam:m.cam,payload:m.payload,selected:[...m.selected]},before);
});

test('Selection includes inbound squads but drops empty, unknown and duplicate squad references',()=>{
  const m=mission();m.battle.squads.push({id:2,name:'Empty',color:'#ffffff'});
  const command=restoreCommandState({version:1,selected:[1,1,2,999,'1'],payload:{}},m.battle);
  assert.deepEqual(command.selected,[1]);
  run(m.battle,17);m.battle.units=[];
  assert.deepEqual(restoreCommandState({version:1,selected:[1]},m.battle).selected,[]);
});

test('A draft can exceed current budget/capacity without becoming a purchase or corrupting battle state',()=>{
  const m=mission();m.payload={scout:44,link:44};
  const before={matter:m.battle.matter,stats:structuredClone(m.battle.stats),pods:JSON.parse(JSON.stringify(m.battle.pods))};
  const restored=restoreMissionCheckpoint(missionCheckpoint(m),flatTerrain);assert.ok(restored);
  assert.deepEqual(restored.command.payload,m.payload);
  assert.equal(restored.battle.matter,before.matter);assert.deepEqual(restored.battle.stats,before.stats);assert.deepEqual(restored.battle.pods,before.pods);
});

test('Unknown/locked/invalid draft fields are omitted and explicit empty payloads stay empty',()=>{
  const m=mission();
  const state=restoreCommandState({version:1,payload:{scout:NaN,link:1.5,striker:2,constructor:3,unknown:4},selected:[]},m.battle);
  assert.deepEqual(state.payload,{});
  assert.deepEqual(restoreCommandState({version:1,payload:{},dropPanelOpen:false},m.battle).payload,{});
  assert.equal(restoreCommandState({version:1,payload:null},m.battle).payload,null);
});

test('Bad or future optional command metadata cannot discard a valid paid mission',()=>{
  const saved=missionCheckpoint(mission()),core=structuredClone(saved.battle);
  const cyclic={version:1,payload:{}};cyclic.payload.scout=cyclic;
  for(const command of [null,42,{version:999,selected:[1]},{version:1,selected:Array(5001).fill(1),payload:{scout:Infinity}},cyclic]){
    const value={...saved,command};const valid=validMissionCheckpoint(value);assert.ok(valid);
    assert.deepEqual(valid.battle,core);assert.deepEqual(valid.command.selected,[]);
  }
  const corrupt=structuredClone(saved);corrupt.battle.units=[{id:1}];assert.equal(validMissionCheckpoint(corrupt),null,'core battle validation stays strict');
});

test('Legacy checkpoints without command metadata keep paid cargo and get safe UI defaults',()=>{
  for(const name of ['mission-v1-mid-drop.json','mission-v2-between-arrivals.json']){
    const old=JSON.parse(readFileSync(new URL('./fixtures/invasion/'+name,import.meta.url))),before=structuredClone(old);
    const restored=restoreMissionCheckpoint(old,flatTerrain);assert.ok(restored);
    assert.deepEqual(restored.command,{version:1,selected:[],payload:null,dropPanelOpen:false});
    assert.deepEqual(restored.battle.pods.map(p=>p.payload),old.battle.pods.map(p=>p.payload));assert.deepEqual(old,before);
  }
});

test('Reload before, between and after sibling arrivals preserves issued orders and never replays placement',()=>{
  const m=mission(),goal={kind:'move',x:0,z:40};orderSquads(m.battle,[1],goal);
  m.placing=true;m.dropPoint={x:123,z:456};m.dropPreview={ok:true};m.speed=3;m.cleanView=true;
  for(const seconds of [0,10.05,.2]){
    run(m.battle,seconds);const saved=missionCheckpoint(m),restored=restoreMissionCheckpoint(saved,flatTerrain);assert.ok(restored);
    assert.equal(Object.hasOwn(saved.command,'placing'),false);assert.equal(Object.hasOwn(saved.command,'dropPoint'),false);
    assert.equal(Object.hasOwn(saved.command,'dropPreview'),false);assert.equal(Object.hasOwn(saved.command,'speed'),false);
    assert.equal(restored.battle.squads[0].order.kind,'move');assert.deepEqual(restored.command.selected,[1]);
    const originalMatter=m.battle.matter;run(m.battle,.05);run(restored.battle,.05);
    assert.equal(restored.battle.stats.dronesDropped,m.battle.stats.dronesDropped);assert.equal(restored.battle.matter,m.battle.matter);
    assert.ok(restored.battle.matter>=originalMatter);
  }
});
