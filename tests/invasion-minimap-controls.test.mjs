import test from 'node:test';
import assert from 'node:assert/strict';
import { minimapWorldPoint } from '../dist/invasion/minimap-controls.mjs';
import { harness } from './helpers/invasion-ui-harness.mjs';

const rect={left:20,top:30,width:200,height:100};
const pointClose=(actual,expected)=>{assert.ok(Math.abs(actual.x-expected.x)<1e-8);assert.ok(Math.abs(actual.z-expected.z)<1e-8);};
function arena(){
  const h=harness(null,{renderer:true});h.start();
  h.run(`startMission(planetById('titan'));closeDropPanel();mission.battle.matter=1000;
    const home=mission.battle.zones[0],drop=requestDrop(mission.battle,{x:home.x,z:home.z,payload:{scout:1}});
    for(let i=0;i<110;i++)stepBattle(mission.battle,.1);
    mission.selected=new Set([drop.squad.id]);mission.paused=true;
    const map=mission.battle.map,target=createBattle(planetById('velm')).units.find(u=>u.side==='native');
    Object.assign(target,{id:mission.battle.nextId++,x:map.centerX+map.half*.6,z:map.centerZ+map.half*.6,home:home.id});mission.battle.units.push(target);
    mission.battle.events=[];`);
  h.nodes.get('minimap').getBoundingClientRect=()=>rect;
  h.pointer=(type,extra={})=>h.dispatch('minimap',type,extra);
  h.pixel=point=>{const map=h.json('mission.battle.map');return {clientX:rect.left+(point.x-map.centerX+map.half)/(map.half*2)*rect.width,clientY:rect.top+(point.z-map.centerZ+map.half)/(map.half*2)*rect.height};};
  h.tap=(point,extra={})=>{const event={...h.pixel(point),...extra};h.pointer('pointerdown',{buttons:extra.button===2?2:1,...event});h.pointer('pointerup',{...event,buttons:0});};
  h.move=h.json('({x:mission.battle.map.centerX+mission.battle.map.half*.9,z:mission.battle.map.centerZ-mission.battle.map.half*.9})');
  h.orders=()=>h.json('mission.battle.events.filter(e=>e.kind==="order")');
  return h;
}

test('Minimap input maps CSS offsets/corners/center to world coordinates and rejects invalid/outside points',()=>{
  const map={centerX:50,centerZ:-30,half:400};
  assert.deepEqual(minimapWorldPoint(20,30,rect,map),{x:-350,z:-430});
  assert.deepEqual(minimapWorldPoint(120,80,rect,map),{x:50,z:-30});
  assert.deepEqual(minimapWorldPoint(220,130,rect,map),{x:450,z:370});
  for(const [x,y] of [[19,30],[221,80],[120,131],[NaN,80]])assert.equal(minimapWorldPoint(x,y,rect,map),null);
  assert.equal(minimapWorldPoint(120,80,{...rect,width:0},map),null);
  assert.equal(minimapWorldPoint(120,80,rect,{...map,half:-1}),null);
});

test('Default mouse/touch minimap taps move only the camera and leave selection/orders alone',()=>{
  for(const pointerType of ['mouse','touch']){
    const h=arena(),selected=h.json('[...mission.selected]');h.tap(h.move,{pointerType});
    pointClose(h.json('mission.cam.focus'),h.move);assert.deepEqual(h.orders(),[]);
    assert.deepEqual(h.json('[...mission.selected]'),selected);assert.equal(h.nodes.get('minimap-mode').textContent,'Map: View');
  }
});

test('Right-click minimap orders attack/capture/move while preserving camera and paused state',()=>{
  const h=arena(),camera=h.json('mission.cam');
  const target=h.json("mission.battle.units.find(u=>u.side==='native')");h.tap(target,{button:2});assert.equal(h.orders().at(-1).target,target.id);
  h.tap(h.json('mission.battle.zones[1]'),{button:2});assert.equal(h.orders().at(-1).order,'capture');
  h.tap(h.move,{button:2});assert.equal(h.orders().at(-1).order,'move');
  assert.deepEqual(h.json('mission.cam'),camera);assert.equal(h.run('mission.paused'),true);
  assert.ok(Math.abs(h.run('mission.minimapPing.x')-h.move.x)<1e-8);assert.ok(Number.isFinite(h.run('mission.minimapPing.at')));
});

test('Orders toggle enables touch/pen taps, switches back to camera taps and does not duplicate synthetic clicks',async()=>{
  const h=arena(),camera=h.json('mission.cam');await h.click('minimap-mode');assert.equal(h.nodes.get('minimap-mode').textContent,'Map: Orders');
  h.tap(h.move,{pointerType:'touch'});h.dispatch('minimap','click',h.pixel(h.move));assert.equal(h.orders().length,1);
  h.tap(h.move,{pointerType:'pen'});assert.equal(h.orders().length,2);assert.deepEqual(h.json('mission.cam'),camera);
  await h.click('minimap-mode');h.tap(h.move,{pointerType:'touch'});assert.equal(h.orders().length,2);pointClose(h.json('mission.cam.focus'),h.move);
});

test('Minimap orders with no selection explain what to do and never move the camera or spend matter',async()=>{
  const h=arena();h.run('mission.selected.clear()');const camera=h.json('mission.cam'),matter=h.run('mission.battle.matter');
  await h.click('minimap-mode');h.tap(h.move,{pointerType:'touch'});
  assert.deepEqual(h.orders(),[]);assert.deepEqual(h.json('mission.cam'),camera);assert.equal(h.run('mission.battle.matter'),matter);
  assert.match(h.nodes.get('toasts').children.at(-1).textContent,/Select a squad first/);
});

test('Drag, release displacement, button chords, unsupported buttons and out-of-map release cannot issue minimap orders',()=>{
  for(const interruption of ['move','release','chord','middle','outside','changed-button']){
    const h=arena(),point=h.pixel(h.move);
    h.pointer('pointerdown',{...point,button:interruption==='middle'?1:2,buttons:interruption==='middle'?4:2});
    if(interruption==='move')h.pointer('pointermove',{...point,clientX:point.clientX-20,buttons:2});
    if(interruption==='chord')h.pointer('pointermove',{...point,buttons:3});
    h.pointer('pointerup',{...point,clientX:interruption==='release'?point.clientX-20:interruption==='outside'?400:point.clientX,button:interruption==='changed-button'?0:2,buttons:0});
    assert.deepEqual(h.orders(),[],interruption);
  }
});

test('Cancel, lost capture, blur, hidden pages, dialogs, outcomes and Clean view suppress minimap commands',()=>{
  for(const interruption of ['pointercancel','lostpointercapture','blur','hidden','dialog','outcome','clean']){
    const h=arena(),point=h.pixel(h.move);h.pointer('pointerdown',{...point,button:2,buttons:2});
    if(interruption==='pointercancel'||interruption==='lostpointercapture')h.pointer(interruption);
    if(interruption==='blur')h.dispatch('window','blur');
    if(interruption==='hidden'){h.run('document.hidden=true');h.dispatch('document','visibilitychange');}
    if(interruption==='dialog')h.nodes.get('save-dialog').showModal();
    if(interruption==='outcome')h.run('mission.battle.outcome="won"');
    if(interruption==='clean')h.run('setCleanView(true)');
    h.pointer('pointerup',{...point,button:2,buttons:0});assert.deepEqual(h.orders(),[],interruption);
    assert.equal(h.run('minimapPointers.size'),0);
  }
});

test('Multi-touch minimap gestures never turn into a tap command when fingers lift',async()=>{
  const h=arena(),point=h.pixel(h.move);await h.click('minimap-mode');
  h.pointer('pointerdown',{...point,pointerType:'touch',pointerId:1});
  h.pointer('pointerdown',{...point,pointerType:'touch',pointerId:2});
  h.pointer('pointerup',{...point,pointerType:'touch',pointerId:1,buttons:0});
  h.pointer('pointerup',{...point,pointerType:'touch',pointerId:2,buttons:0});assert.deepEqual(h.orders(),[]);
  h.tap(h.move,{pointerType:'touch'});assert.equal(h.orders().length,1,'a fresh single touch works');
});

test('View taps can navigate during placement; minimap order input cancels placement without a purchase or order',()=>{
  const h=arena(),matter=h.run('mission.battle.matter'),drops=h.run('mission.battle.stats.drops');
  h.run('mission.placing=true;mission.dropPoint={x:10,z:20};mission.dropPreview={ok:true};');
  h.tap(h.move);assert.equal(h.run('mission.placing'),true);pointClose(h.json('mission.cam.focus'),h.move);
  h.tap(h.move,{button:2});assert.equal(h.run('mission.placing'),false);assert.equal(h.run('mission.dropPoint'),null);
  assert.equal(h.nodes.get('placement-launch').disabled,true);assert.equal(h.run('mission.battle.matter'),matter);
  assert.equal(h.run('mission.battle.stats.drops'),drops);assert.deepEqual(h.orders(),[]);
});

test('Resuming defaults to safe View mode with no ping or stale gesture; browser context menu stays suppressed',async()=>{
  const h=arena();await h.click('minimap-mode');h.tap(h.move,{pointerType:'touch'});
  const point=h.pixel(h.move);h.pointer('pointerdown',{...point,pointerType:'touch'});
  h.run("checkpointMission()");assert.ok(h.run("restoreMissionCheckpoint(savedMission,mission.terrain)"),'fixture checkpoint remains valid');h.run("startMission(planetById('titan'),savedMission)");
  assert.equal(h.run('mission.minimapOrders'),false);assert.equal(h.run('mission.minimapPing'),null);assert.equal(h.run('minimapPointers.size'),0);
  assert.equal(h.nodes.get('minimap-mode').textContent,'Map: View');
  assert.equal(h.pointer('contextmenu').defaultPrevented,true);
});
