import test from 'node:test';
import assert from 'node:assert/strict';
import { projectedDiameter, tinyDroneMarker, tinyDroneThreshold } from '../dist/invasion/drone-markers.mjs';
import { harness } from './helpers/invasion-ui-harness.mjs';

test('Perspective marker sizing follows camera depth, viewport height and model bounds in CSS pixels',()=>{
  assert.equal(projectedDiameter(3,300,2,600),12);
  assert.equal(projectedDiameter(3,600,2,600),6);
  assert.equal(projectedDiameter(3,300,2,300),6);
  for(const args of [[3,-10,2,600],[3,0,2,600],[NaN,300,2,600],[3,300,2,0],[3,Infinity,2,600]])
    assert.equal(projectedDiameter(...args),Infinity,'invalid/behind-camera points do not invent a tiny marker');
});

test('Only tiny, visible in-viewport projections receive a marker, with a fixed CSS-pixel footprint',()=>{
  const point={x:40,y:30,visible:true};assert.deepEqual(tinyDroneMarker(point,2,800,600),{x:40,y:38,radius:3});
  for(const size of [tinyDroneThreshold,20,Infinity,NaN,-1])assert.equal(tinyDroneMarker(point,size,800,600),null);
  for(const p of [{...point,visible:false},{...point,x:-1},{...point,y:598},{...point,x:NaN}])assert.equal(tinyDroneMarker(p,2,800,600),null);
  assert.equal(tinyDroneMarker(point,2,0,600),null);
});

test('Actual overlay marks healthy unselected drones in squad color, retains health/selection cues and honors Clean view',()=>{
  const h=harness(null,{renderer:true});h.start();
  h.run(`startMission(planetById('titan')); closeDropPanel();
    mission.battle.matter=1000;
    const home=mission.battle.zones[0];requestDrop(mission.battle,{x:home.x,z:home.z,payload:{scout:1}});
    for(let i=0;i<110;i++)stepBattle(mission.battle,.1);
    mission.battle.zones=[];mission.dropPreview=null;mission.selected.clear();
    const drone=mission.battle.units.find(isDrone);mission.battle.units=[drone];drone.x=100;drone.z=100;
    scene.project=()=>({x:100,y:100,visible:true});scene.unitPixelSize=()=>2;scene.heightAt=()=>0;`);
  const context={fills:[],arcs:[],rects:[],clearRect(){this.fills=[];this.arcs=[];this.rects=[];},measureText(){return {width:20};},fill(){this.fills.push(this.fillStyle);},arc(...args){this.arcs.push(args);},fillRect(...args){this.rects.push(args);}};
  h.context.markerContext=new Proxy(context,{get:(target,key)=>key in target?target[key]:()=>{}});
  h.run('overlay.getContext=()=>markerContext;drawOverlay()');
  assert.deepEqual(context.fills,[h.run('mission.battle.squads[0].color')]);assert.equal(context.arcs.length,0);
  const before=h.json('mission.battle.units');h.run('drawOverlay()');assert.deepEqual(h.json('mission.battle.units'),before,'presentation does not mutate units');
  h.run('scene.unitPixelSize=()=>20;drawOverlay()');assert.deepEqual(context.fills,[]);
  h.run('scene.unitPixelSize=()=>2;mission.selected.add(1);mission.battle.units[0].hp=1;drawOverlay()');
  assert.equal(context.fills.length,1);assert.equal(context.arcs.length,1);assert.equal(context.rects.length,2);
  h.run('mission.cleanView=true;drawOverlay()');assert.deepEqual(context.fills,[]);assert.deepEqual(context.arcs,[]);assert.deepEqual(context.rects,[]);
  h.run(`mission.cleanView=false;mission.selected.clear();const original=mission.battle.units[0];
    mission.battle.units=[{...original,side:'native'},{...original,id:999,alive:false}];drawOverlay()`);
  assert.deepEqual(context.fills,[],'native or dead units never get friendly drone markers');
});
