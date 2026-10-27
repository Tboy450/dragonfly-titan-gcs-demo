import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {fixture,baseline,retainedBeforeCarriage} from '../research/drill-carriage-2026-10-27/audit.mjs';
import {fingerprint} from '../research/draco-side-audit-2026-10-26/audit.mjs';
import {fullModel,triangles} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
import {createFlightState} from '../dist/flight-model.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';

test('Carriage pass preserves all archived head/bit/hoses/leads/drive covers and bellows outside explicit mechanical names',async()=>{
 const a=fixture(),b=await baseline();
 for(const feed of [0,.065,.13]){
  for(const f of [a,b])for(const d of f.drills)d.setFeed(feed);
  assert.deepEqual(fingerprint(a.root).filter(retainedBeforeCarriage),fingerprint(b.root).filter(retainedBeforeCarriage));
 }
});

test('Six crowned rollers per drill touch alternating V flanks without entering the guide over 41 strokes',()=>{
 const f=fixture(),closest=new T.Vector3();
 for(const d of f.drills){
  const rail=d.stage.getObjectByName('drill-z-rail'),rc=d.rollerCarriage;
  assert.equal(rc.rollers.length,6);
  for(let i=0;i<=40;i++){
   d.setFeed(i*.13/40);f.root.updateMatrixWorld(true);
   const faces=triangles(rail);
   for(const roller of rc.rollers){
    const point=d.carriage.localToWorld(roller.contact.clone());
    assert.ok(Math.min(...faces.map(face=>{face.closestPointToPoint(point,closest);return point.distanceTo(closest);}))<1e-7);
    const p=roller.wheel.geometry.attributes.position;
    for(let j=0;j<p.count;j++){
     const v=rail.worldToLocal(roller.wheel.localToWorld(new T.Vector3().fromBufferAttribute(p,j)));
     const boundary=Math.abs(v.z)<.005?.010+Math.abs(v.z):.015;
     assert.ok(Math.abs(v.x)>=boundary-1e-7||Math.abs(v.z)>=.008-1e-7,'roller does not cut into guide');
    }
   }
  }
  for(let i=0;i<2;i++)assert.ok(Math.abs(rc.rollers[i].axis.dot(rc.rollers[i+1].axis))<1e-9,'neighbor axes cross at 90 degrees');
 }
});

test('Nut and pocket have an open shaft corridor, a separate spherical seat and supported ears',()=>{
 const f=fixture();
 for(const d of f.drills){
  const rc=d.rollerCarriage;
  for(const part of [rc.nut,rc.pocket]){
   const p=part.geometry.attributes.position;
   for(let j=0;j<p.count;j++)assert.ok(Math.hypot(p.getX(j),p.getZ(j))>=.0049999,'no solid box across the screw');
  }
  const b=o=>new T.Box3().setFromObject(o).expandByScalar(1e-8);
  for(const ear of rc.mounts.children.filter(o=>o.name==='drill-nut-pocket-ear')){
   assert.ok(b(ear).intersectsBox(b(rc.pocket)));
   assert.ok(rc.mounts.children.some(o=>o.name==='drill-roller-support'&&b(ear).intersectsBox(b(o))));
  }
  for(const support of rc.mounts.children.filter(o=>o.name==='drill-roller-support'))assert.ok(b(support).intersectsBox(b(rc.bridge)));
 }
});

test('Roller rolling transform reverses/retracts without moving feed endpoints or allocating new geometry',()=>{
 const {drills}=fixture();
 for(const d of drills){
  const objects=d.rollerCarriage.rollers.map(r=>r.wheel.geometry);
  for(const feed of [.13,.04,0,.13]){
   d.setFeed(feed);
   d.rollerCarriage.rollers.forEach((r,i)=>{
    assert.equal(r.wheel.geometry,objects[i]);assert.ok(Math.abs(r.wheel.rotation.y-r.sign*feed/.0045)<1e-9);
    const treadVelocity=r.axis.clone().cross(r.normal.clone().multiplyScalar(-.0045)).multiplyScalar(r.sign/.0045);
    assert.ok(treadVelocity.distanceTo(new T.Vector3(0,1,0))<1e-9,'tread motion cancels downward carriage travel at guide');
   });
   assert.ok(Math.abs(d.carriage.position.y-(-.72-feed))<1e-9);
  }
 }
});

test('Carriage mounting metal and nut interfaces have independently removable inspection layers',()=>{
 const {root,drills}=fixture(),v=createInspectionVisibility({drills:root});
 for(const layer of ['mounts','interfaces','equipment-covers']){
  const saved=new Map();v.apply({hiddenPartLayers:{drills:[layer]}},saved);
  for(const d of drills){
   assert.equal(d.rollerCarriage.mounts.visible,layer!=='mounts');
   assert.equal(d.rollerCarriage.interfaces.visible,layer!=='interfaces');
  }
  for(const[o,visible]of saved)o.visible=visible;
 }
});

test('New carriage external surfaces clear retained head/lead/drive/bellows surfaces in installed sampling poses',()=>{
 const f=fullModel(),state=createFlightState();state.science.sampling=true;
 const newNames=new Set(['drill-cam-roller','drill-roller-stud','drill-roller-stud-cap',
  'drill-roller-support','drill-nut-pocket','drill-nut-pocket-ear','drill-lead-nut']);
 // Only head/bridge and shaft/nut are intended mechanical interfaces; their geometry
 // is separately checked above. All other model surfaces remain obstacles.
 const intended=new Set(['drill-z-rail','drill-carriage-bracket','drill-carriage-bolt','drill-lead-screw']);
 const near=new T.Vector3();let checks=0;
 for(let i=0;i<=12;i++){
  state.science.sampleSeconds=i*2/3;f.poseSampling(state,'internal');f.root.updateMatrixWorld(true);
  const parts=[],obstacles=[];f.root.traverse(o=>{
   if(!o.isMesh)return;
   if(newNames.has(o.name))parts.push(o);
   else if(!intended.has(o.name))obstacles.push({o,box:new T.Box3().setFromObject(o)});
  });
  for(const part of parts){
   const box=new T.Box3().setFromObject(part).expandByScalar(.00015),p=part.geometry.attributes.position;
   for(const candidate of obstacles.filter(c=>box.intersectsBox(c.box))){
    const faces=triangles(candidate.o);
    for(let j=0;j<p.count;j++){
     const v=part.localToWorld(new T.Vector3().fromBufferAttribute(p,j));
     if(candidate.box.distanceToPoint(v)>.00015)continue;
     for(const face of faces){face.closestPointToPoint(v,near);assert.ok(v.distanceTo(near)>.0001,part.name+' vs '+candidate.o.name);checks++;}
    }
   }
  }
 }
 console.log('Carriage narrow-phase candidates: '+checks);
});
