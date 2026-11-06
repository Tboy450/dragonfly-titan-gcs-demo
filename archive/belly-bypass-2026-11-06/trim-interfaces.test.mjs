import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {buildFans,thermalLoopAsset as L,airLoopPaths} from '../dist/thermal-loop.mjs';
import {trimInterfaceAsset as A,trimChangedNames,trimRiserRings} from '../dist/trim-interfaces.mjs';
import {build,baseline,mesh,snapshots,report} from '../research/trim-interfaces-2026-11-01/audit.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
const ray=(a,b,parts)=>{const v=b.clone().sub(a);return new T.Raycaster(a,v.clone().normalize(),0,v.length()).intersectObjects(parts,false);};
const center=ring=>ring.map(p=>new T.Vector3(...p)).reduce((a,p)=>a.add(p),new T.Vector3()).multiplyScalar(.25);

test('Both warm-floor ports are open with retained roof and side rims',()=>{
 const {root}=build(),run=root.getObjectByName('warm-duct-run'),floor=L.duct.y-L.duct.height/2;
 for(const z of Object.values(L.diverters)){
  for(const x of [-.05,0,.05])assert.equal(ray(new T.Vector3(x,floor+.004,z),new T.Vector3(x,floor-.004,z),[run]).length,0);
  assert.ok(ray(new T.Vector3(.068,floor+.004,z),new T.Vector3(.068,floor-.004,z),[run]).length>0,'side rim retained');
  assert.ok(ray(new T.Vector3(0,L.duct.y+L.duct.height/2+.004,z),new T.Vector3(0,L.duct.y,z),[run]).length>0,'roof intact');
 }
 assert.equal(A.flightGeometryConfirmed,false);
});
test('Fitted hollow risers meet both cold duct end planes without the old 10/30mm gaps',()=>{
 const {root}=build(),cold=root.getObjectByName('cold-duct-channel'),d=L.coldDuct;
 assert.equal(ray(new T.Vector3(0,d.y,d.front-.001),new T.Vector3(0,d.y,d.back+.001),[cold]).length,0);
 for(const end of ['front','aft']){
  const rings=trimRiserRings(L.duct,d,L.diverters,end),riser=root.getObjectByName(end+'-diverter-riser');
  for(let k=0;k<rings.inner.length-1;k++)for(const x of [-.04,0,.04]){
   const a=center(rings.inner[k]).setX(x),b=center(rings.inner[k+1]).setX(x);assert.equal(ray(a,b,[riser]).length,0,'uncapped connecting passage');
  }
  for(const p of rings.outer.at(-1)){assert.ok(Math.abs(p[2]-(end==='front'?d.front:d.back))<1e-12);assert.ok(Math.abs(Math.abs(p[0])-d.width/2)<1e-12);}
  const c=center(rings.outer[1]);for(const side of [-1,1]){
   assert.ok(ray(c.clone().setX(side*.1),c,[riser]).length>0,'outer wall remains visible');
   assert.ok(ray(c,c.clone().setX(side*.1),[riser]).length>0,'inner wall remains visible');
  }
 }
});
test('Closed flaps cover the central openings; opened flaps expose the bypass without shell interference',async()=>{
 const {root,device}=build(),floor=L.duct.y-L.duct.height/2;
 for(const {hinge,dir}of device.flaps){
  const z=hinge.position.z-dir*.08,flap=hinge.children[0];
  assert.ok(ray(new T.Vector3(0,floor-.01,z),new T.Vector3(0,floor+.006,z),[flap]).length>0);
  hinge.rotation.x=dir*24*Math.PI/180;root.updateMatrixWorld(true);
  assert.equal(ray(new T.Vector3(0,floor-.01,z),new T.Vector3(0,floor+.006,z),[flap]).length,0);
 }
 const result=await report();assert.deepEqual(result.motion,[],'both flaps clear all fixed local geometry at every integer degree');
});
test('Exact baseline preserves flaps, hinges, actuators, ribs, fans, completed nose and arrow curves',async()=>{
 const old=await baseline(),a=build(),b=build(old.buildWarmDuct,old.buildTrimDevice);
 const omit=n=>trimChangedNames.includes(n)||n==='warm-duct-run';
 assert.deepEqual(snapshots(a.root,omit),snapshots(b.root,omit));
 const x=new T.Group(),y=new T.Group();buildFans({parent:x,mesh});old.buildFans({parent:y,mesh});assert.deepEqual(snapshots(x),snapshots(y));
 for(const key of ['duct','fans','coldDuct','diverters','maxFlapDeg','bellyY'])assert.deepEqual(L[key],old.thermalLoopAsset[key]);
 assert.deepEqual(airLoopPaths(),old.airLoopPaths());
});
test('Installed contact audit removes four warm/trim conflicts and adds none; unresolved foam/clamp remain named',async()=>{
 const r=await report();assert.deepEqual(r.newContactPairs,[]);
 assert.deepEqual(r.warmContacts,[{mesh:'warm-duct-flange',other:'main-harness-clamp',owner:'main-harness-clamps'}]);
 assert.equal(r.oldWarmContacts.length-r.warmContacts.length,4);
 assert.deepEqual(r.contacts.map(o=>o.other),['body-foam-belly-surface','body-foam-belly-surface']);
});
test('Three part19 details and independently removable insulation retain positions',()=>{
 const {root,device}=build(),before=snapshots(root);
 assert.deepEqual(inspectionSubassemblies(device.group).map(o=>o.name),['cold-duct-channel','front-diverter-riser','aft-diverter-riser']);
 assert.deepEqual([device.ductLayer,device.housings,device.valves,device.actuators].map(g=>g.userData.inspectionLayer),['equipment-casings','insulation','interfaces','equipment-casings']);
 device.housings.visible=false;assert.deepEqual(snapshots(root),before);device.housings.visible=true;
});
