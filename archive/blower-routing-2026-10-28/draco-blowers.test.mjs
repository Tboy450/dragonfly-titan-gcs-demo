import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three/three.module.min.js';
import {fixture,unitBounds,routeHits,bodyHits,installedFixture,surfacesCross,mesh} from '../research/draco-blower-pair-2026-10-27/audit.mjs';
import {buildDrill,drillAsset} from '../dist/drills.mjs';
import {blowerLayout} from '../dist/draco-blowers.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {createFlightState} from '../dist/flight-model.mjs';
import {inspectionPartNumber} from '../dist/inspection-catalog.mjs';

test('Two photo-referenced units fit the supplier nominal envelope without silently sizing their installed plumbing',()=>{
 const f=fixture();assert.equal(f.blowers.units.length,2);assert.equal(blowerLayout.flightInstallationConfirmed,false);
 for(const u of f.blowers.units){const size=unitBounds(u).getSize(new T.Vector3());
  assert.ok(Math.abs(size.z-.345)<1e-8);assert.ok(Math.abs(size.y-.168)<1e-8);assert.ok(size.x<=.168);
  assert.ok(f.root.getObjectByName(`draco-${u.name}-blower-motor`));
  assert.ok(f.root.getObjectByName(`draco-${u.name}-blower-intake-cone`));
  assert.equal(u.poses.casings.getObjectsByProperty('name',`draco-${u.name}-blower-motor-retaining-band`).length,6);
  assert.equal(u.poses.mounts.getObjectsByProperty('name',`draco-${u.name}-blower-foot`).length,2);
 }
 const boxes=f.blowers.units.map(u=>new T.Box3().setFromObject(u.poses.casings));assert.ok(!boxes[0].intersectsBox(boxes[1]));
 assert.equal(f.root.getObjectsByProperty('name','impeller').length,0);
 assert.equal(inspectionPartNumber('drill-blower'),24);
});

test('Upstream sample routes and the existing selector are preserved exactly against the archived model',async()=>{
 const code=await readFile(new URL('../dist/draco-plumbing.mjs',import.meta.url),'utf8');
 const before=await readFile(new URL('../archive/draco-blower-pair-2026-10-27/draco-plumbing.mjs',import.meta.url),'utf8');
 const sample=s=>s.slice(s.indexOf('export function buildSampleLines'),s.indexOf('export function buildBlowers')).trim();
 assert.equal(sample(code),sample(before));
 const f=fixture(),selector=f.root.getObjectByName('draco-blower-flow-diverter'),act=f.root.getObjectByName('draco-blower-diverter-actuator');
 assert.deepEqual(selector.position.toArray(),[-.462,-.175,-.5975]);
 assert.deepEqual([selector.geometry.parameters.width,selector.geometry.parameters.height,selector.geometry.parameters.depth],[.03,.025,.11]);
 assert.deepEqual(act.position.toArray(),[-.462,-.1525,-.5975]);
});

test('Each branch seats in its selector and hollow inlet; outlet starts inside its bore and exits open',()=>{
 const f=fixture(),selector=new T.Box3().setFromObject(f.root.getObjectByName('draco-blower-flow-diverter')).expandByScalar(1e-9);
 for(const u of f.blowers.units){
  const path=u.inlet.geometry.parameters.path;assert.ok(selector.containsPoint(path.getPoint(0)));
  const end=u.poses.ports.worldToLocal(path.getPoint(1));assert.ok(Math.abs(end.z-.1695)<1e-8);assert.ok(Math.hypot(end.x,end.y)<1e-8);
  const exhaust=u.exhaust.geometry.parameters.path,start=u.poses.ports.worldToLocal(exhaust.getPoint(0));
  assert.ok(Math.abs(start.y-.081)<1e-8&&Math.abs(start.z+.012)<1e-8);
  assert.ok(exhaust.getPoint(1).x<u.center[0]&&exhaust.getPoint(1).y<u.center[1]);
  assert.ok(f.root.getObjectByName(`draco-${u.name}-blower-intake-mating-flange`));
  assert.ok(f.root.getObjectByName(`draco-${u.name}-blower-discharge-mating-flange`));
  // Straight approach through all annular mating faces: no bend sweeping through a flange.
  for(let k=0;k<20;k++)assert.ok(Math.abs(path.getPoint(1-k/1000).x-u.center[0])<1e-6);
 }
});

test('New pipes clear their own motor/case and the full installed set through the drill travel',()=>{
 const f=installedFixture(),state=createFlightState();state.science.sampling=true;
 for(const seconds of [0,4,8]){state.science.sampleSeconds=seconds;f.poseSampling(state,'internal');f.root.updateMatrixWorld(true);
  assert.deepEqual(routeHits(f.root,f.subsystems['drill-blower'],true),[]);
 }
 // Independently stroke both drills, including the normally stowed redundant side.
 const holder=f.subsystems.drills;holder.clear();
 const drills=[-1,1].map(side=>buildDrill({parent:holder,mesh,side}));
 for(const feed of [0,.065,.13]){for(const d of drills){d.carriage.position.y=drillAsset.stowedY-feed;d.setFeed(feed);}
  f.root.updateMatrixWorld(true);assert.deepEqual(routeHits(f.root,f.subsystems['drill-blower'],true),[]);
 }
});

test('Separate inlet/exhaust pipes do not cross each other',()=>{
 const f=fixture(),tubes=f.blowers.plumbing.children;
 for(let a=0;a<tubes.length;a++)for(let b=a+1;b<tubes.length;b++){
  const p=tubes[a].geometry.parameters.path,q=tubes[b].geometry.parameters.path;
  for(let i=0;i<=240;i++)for(let j=0;j<=240;j++)assert.ok(p.getPoint(i/240).distanceToSquared(q.getPoint(j/240))>.013**2,`${tubes[a].name} / ${tubes[b].name}`);
 }
});

test('Housings/supports clear installed hardware; wall brackets contact structure through local insulation openings',()=>{
 const f=installedFixture(),blowers=f.subsystems['drill-blower'];
 assert.deepEqual(bodyHits(f.root,blowers),[{mesh:'draco-blower-flow-diverter',other:'draco-return-tube',owner:'draco-transfer-tubes'}]);
 const wall=f.root.getObjectByName('port-wall-outer-aluminum-face'),supports=blowers.getObjectsByProperty('name','draco-forward-blower-wall-bracket').concat(blowers.getObjectsByProperty('name','draco-aft-blower-wall-bracket'));
 assert.equal(supports.length,4);const wallBox=new T.Box3().setFromObject(wall).expandByScalar(1e-7);
 for(const support of supports){const box=new T.Box3().setFromObject(support),point=box.getCenter(new T.Vector3());point.x=blowerLayout.wallX;
  assert.ok(wallBox.containsPoint(point));const ray=new T.Raycaster(point.clone().add(new T.Vector3(-.01,0,0)),new T.Vector3(1,0,0));
  assert.ok(ray.intersectObject(wall).length>0,'mount reaches an actual panel face, not its empty bounds');
  assert.equal(surfacesCross(support,f.root.getObjectByName('body-foam-port-surface')),false);
 }
 assert.match(f.subsystems.fuselage.userData.blowerMountPorts,/Four estimated 20 mm/);
});

test('All five inspection categories independently hide and restore without ungrouping the pair',()=>{
 const f=fixture(),subsystems={'drill-blower':f.root},visibility=createInspectionVisibility(subsystems);
 for(const layer of ['equipment-casings','equipment-covers','interfaces','mounts','plumbing']){
  const saved=new Map();visibility.apply({hiddenPartLayers:{'drill-blower':[layer]}},saved);
  for(const g of f.blowers.group.children)assert.equal(g.visible,g.userData.inspectionLayer!==layer);
  for(const[o,value]of saved)o.visible=value;
  for(const g of f.blowers.group.children)assert.equal(g.visible,true);
 }
});
