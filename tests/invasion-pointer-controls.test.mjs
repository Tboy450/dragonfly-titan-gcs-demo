import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './helpers/invasion-ui-harness.mjs';
import { pointerIntent } from '../dist/invasion/pointer-controls.mjs';

// Real entry-point listeners and battle orders; projection/capture/DOM are stand-ins.
function arena() {
  const h = harness(null, { renderer: true }); h.start();
  h.run(`startMission(planetById('titan')); closeDropPanel();
    mission.battle.matter=2000;
    for(let i=0;i<2;i++){
      const home=mission.battle.zones[0];
      mission.battle.lastDropAt=-100;
      requestDrop(mission.battle,{x:home.x,z:home.z,payload:{scout:1}});
      for(let j=0;j<110;j++)stepBattle(mission.battle,.1);
    }
    mission.battle.units.forEach((u,i)=>{u.x=100+i*200;u.z=100;});
    const target=createBattle(planetById('velm')).units.find(u=>u.side==='native');
    Object.assign(target,{id:9001,x:200,z:200});mission.battle.units.push(target);
    mission.selected.clear();
    mission.battle.zones[0].x=500;mission.battle.zones[0].z=500;
    mission.battle.zones[1].x=600;mission.battle.zones[1].z=400;
    mission.paused=true;mission.battle.events=[];updateSquadBar();`);
  h.pointer = (type, extra = {}) => h.dispatch('mission-overlay', type, extra);
  h.tap = (extra = {}) => {
    h.pointer('pointerdown', { buttons: extra.button === 2 ? 2 : extra.button === 1 ? 4 : 1, ...extra });
    h.pointer('pointerup', { ...extra, buttons: 0 });
  };
  h.orders = () => h.json('mission.battle.events.filter(e=>e.kind==="order")');
  h.selected = () => h.json('[...mission.selected]');
  return h;
}

test('Desktop left-click selects or clears, and never gives an order on ground or enemies', () => {
  const h=arena();h.tap();assert.deepEqual(h.selected(),[1]);
  h.tap();assert.deepEqual(h.selected(),[1],'another primary click keeps the same squad selected');
  h.tap({clientX:700,clientY:550});assert.deepEqual(h.selected(),[]);
  h.tap();h.tap({clientX:200,clientY:200});assert.deepEqual(h.selected(),[]);
  assert.deepEqual(h.orders(),[]);
});

test('Shift, Ctrl and Meta clicks toggle additional squads; additive empty clicks keep selection', () => {
  for(const modifier of ['shiftKey','ctrlKey','metaKey']){
    const h=arena();h.tap();h.tap({clientX:300,[modifier]:true});
    assert.deepEqual(h.selected(),[1,2]);
    h.tap({clientX:700,clientY:550,[modifier]:true});assert.deepEqual(h.selected(),[1,2]);
    h.tap({clientX:300,[modifier]:true});assert.deepEqual(h.selected(),[1]);
    assert.deepEqual(h.orders(),[]);
  }
});

test('Right-click attacks enemies, captures zones or moves without changing selected squads', () => {
  const h=arena();h.tap();
  h.tap({button:2,clientX:200,clientY:200});assert.equal(h.orders().at(-1).target,9001);
  h.tap({button:2,clientX:600,clientY:400});assert.equal(h.orders().at(-1).order,'capture');
  h.tap({button:2,clientX:700,clientY:550});assert.equal(h.orders().at(-1).order,'move');
  h.tap({button:2,clientX:300});assert.deepEqual(h.selected(),[1]);
  assert.equal(h.orders().at(-1).order,'move');assert.equal(h.run('mission.paused'),true);
  assert.equal(h.run('mission.battle.squads[1].order?.kind'),undefined,'unselected squad receives no order');
});

test('Right-click without selection does not select the drone under it or issue an order', () => {
  const h=arena();h.tap({button:2});assert.deepEqual(h.selected(),[]);assert.deepEqual(h.orders(),[]);
});

test('Touch and pen retain select-then-tap-to-order controls', () => {
  for(const pointerType of ['touch','pen']){
    const h=arena();h.tap({pointerType});assert.deepEqual(h.selected(),[1]);
    h.tap({pointerType,clientX:200,clientY:200});assert.equal(h.orders().at(-1).order,'attack');
    h.tap({pointerType,clientX:600,clientY:400});assert.equal(h.orders().at(-1).order,'capture');
  }
  assert.equal(pointerIntent({pointerType:'pen',button:2}),null,'pen barrel click is not a touch command');
});

test('Primary drag pans, secondary/middle/Alt drags rotate, with no command on release', () => {
  for(const extra of [{button:0,buttons:1},{button:2,buttons:2},{button:1,buttons:4},{button:0,buttons:1,altKey:true}]){
    const h=arena();h.tap();const before=h.json('mission.cam');
    h.pointer('pointerdown',extra);h.pointer('pointermove',{...extra,clientX:140,clientY:125});
    h.pointer('pointerup',{...extra,buttons:0,clientX:140,clientY:125});
    const after=h.json('mission.cam');
    if(extra.button===0&&!extra.altKey)assert.notDeepEqual(after.focus,before.focus);
    else assert.notEqual(after.yaw,before.yaw);
    assert.deepEqual(h.selected(),[1]);assert.deepEqual(h.orders(),[]);
  }
});

test('Middle, Alt and unsupported button clicks are camera-only and cannot select or order', () => {
  const h=arena();h.tap();
  for(const extra of [{button:1},{altKey:true},{button:3}])h.tap({...extra,clientX:200,clientY:200});
  assert.deepEqual(h.selected(),[1]);assert.deepEqual(h.orders(),[]);
});

test('A displaced pointerup and mouse button chords cannot leak orders', () => {
  const h=arena();h.tap();
  h.pointer('pointerdown',{button:2,buttons:2});
  h.pointer('pointerup',{button:2,buttons:0,clientX:200,clientY:200});
  h.pointer('pointerdown',{button:2,buttons:2});
  h.pointer('pointermove',{button:-1,buttons:3});
  h.pointer('pointermove',{button:-1,buttons:2});
  h.pointer('pointerup',{button:2,buttons:0});
  assert.deepEqual(h.orders(),[]);assert.deepEqual(h.selected(),[1]);
});

test('Cancellation, capture loss and blur discard gestures and allow a fresh click', () => {
  for(const interruption of ['pointercancel','lostpointercapture','blur']){
    const h=arena();h.tap();h.pointer('pointerdown',{button:2,buttons:2,clientX:200,clientY:200});
    if(interruption==='blur')h.dispatch('window','blur');else h.pointer(interruption);
    h.pointer('pointerup',{button:2,buttons:0,clientX:200,clientY:200});
    assert.deepEqual(h.orders(),[]);assert.equal(h.run('pointers.size'),0);
    h.tap({button:2,clientX:200,clientY:200});assert.equal(h.orders().length,1);
  }
});

test('Hidden pages, modal transitions, changed screens and ended battles block pointer commands', async () => {
  for(const interruption of ['hidden','modal','screen','outcome']){
    const h=arena();h.tap();h.pointer('pointerdown',{button:2,buttons:2,clientX:200,clientY:200});
    if(interruption==='hidden'){h.run('document.hidden=true');h.dispatch('document','visibilitychange');}
    if(interruption==='modal'){await h.click('save-files-button');h.nodes.get('save-dialog').close();}
    if(interruption==='screen')h.run('show("galaxy")');
    if(interruption==='outcome')h.run('mission.battle.outcome="won"');
    h.pointer('pointerup',{button:2,buttons:0,clientX:200,clientY:200});
    assert.deepEqual(h.orders(),[]);assert.equal(h.run('pointers.size'),0);
  }
});

test('Pinch zoom never issues a tap and lifting one finger does not jump the camera', () => {
  const h=arena();h.tap();const before=h.run('mission.cam.distance');
  h.pointer('pointerdown',{pointerType:'touch',pointerId:1});
  h.pointer('pointerdown',{pointerType:'touch',pointerId:2,clientX:300});
  h.pointer('pointermove',{pointerType:'touch',pointerId:2,clientX:340});
  assert.ok(h.run('mission.cam.distance')<before);
  h.pointer('pointerup',{pointerType:'touch',pointerId:1,buttons:0});
  const focus=h.json('mission.cam.focus');
  h.pointer('pointermove',{pointerType:'touch',pointerId:2,clientX:340});
  assert.deepEqual(h.json('mission.cam.focus'),focus);
  h.pointer('pointerup',{pointerType:'touch',pointerId:2,clientX:340,buttons:0});
  assert.deepEqual(h.orders(),[]);assert.deepEqual(h.selected(),[1]);
});

test('Drop placement only previews on primary/touch; right-click cancels without spending matter', async () => {
  const h=arena();h.tap();const matter=h.run('mission.battle.matter'),drops=h.run('mission.battle.stats.drops');
  // Keep the real landing planner on land inside a held court for this UI fixture.
  h.run('mission.battle.lastDropAt=-100;mission.battle.terrain={heightAt:()=>0,isLand:()=>true};mission.payload={scout:1};mission.battle.zones[0].x=0;mission.battle.zones[0].z=0;scene.pickGround=()=>({x:0,z:0})');
  await h.click('drop-pick');h.tap({clientX:500,clientY:500});
  assert.ok(h.run('mission.dropPreview.ok'));assert.equal(h.nodes.get('placement-launch').disabled,false);
  assert.equal(h.run('mission.battle.matter'),matter);assert.equal(h.run('mission.battle.stats.drops'),drops);
  h.tap({button:2,clientX:500,clientY:500});assert.equal(h.run('mission.placing'),false);
  assert.equal(h.run('mission.dropPoint'),null);assert.equal(h.run('mission.dropPreview'),null);
  assert.equal(h.nodes.get('placement-launch').disabled,true);assert.equal(h.nodes.get('placement-hint').hidden,true);
  await h.click('placement-launch');assert.equal(h.run('mission.battle.stats.drops'),drops);assert.deepEqual(h.orders(),[]);
  await h.click('drop-pick');h.tap({pointerType:'touch',clientX:500,clientY:500});
  assert.ok(h.run('mission.dropPreview.ok'));await h.click('placement-launch');
  assert.equal(h.run('mission.battle.stats.drops'),drops+1);assert.ok(h.run('mission.battle.matter')<matter);
});

test('Battlefield suppresses its native context menu', () => {
  const h=arena();assert.equal(h.pointer('contextmenu').defaultPrevented,true);
});

test('Shift+drag selects every squad with a drone in the box; an empty box keeps the selection and never pans', () => {
  const h = arena();
  const drag = (x0, y0, x1, y1) => {
    h.pointer('pointerdown', { clientX: x0, clientY: y0, shiftKey: true });
    h.pointer('pointermove', { clientX: x1, clientY: y1, shiftKey: true });
    h.pointer('pointerup', { clientX: x1, clientY: y1, shiftKey: true, buttons: 0 });
  };
  drag(50, 50, 350, 150); assert.deepEqual(h.selected(), [1, 2]);
  drag(150, 150, 50, 50); assert.deepEqual(h.selected(), [1], 'any corner order');
  const before = h.json('mission.cam');
  drag(500, 500, 600, 560); assert.deepEqual(h.selected(), [1]);
  assert.deepEqual(h.json('mission.cam'), before);
  assert.equal(h.json('mission.selectBox'), null);
  assert.deepEqual(h.orders(), []);
});
