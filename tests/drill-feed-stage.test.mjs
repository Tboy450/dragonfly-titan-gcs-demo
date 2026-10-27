import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {fixture,baseline,retainedBeforeFeedStage} from '../research/drill-feed-stage-2026-10-27/audit.mjs';
import {fingerprint} from '../research/draco-side-audit-2026-10-26/audit.mjs';
import {fullModel,triangles} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
import {drillFeedAsset} from '../dist/drill-feed-stage.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {createFlightState} from '../dist/flight-model.mjs';

test('Feed update retains the entire drill head/bit/ports, mechanics outside its allowlist and complete moving leads at every pose',async()=>{
 const after=fixture(),before=await baseline();
 for(const feed of [0,.065,.13]){
  for(const f of [after,before])for(const d of f.drills)d.setFeed(feed);
  assert.deepEqual(fingerprint(after.root).filter(retainedBeforeFeedStage),fingerprint(before.root).filter(retainedBeforeFeedStage));
 }
});

test('Paired bellows follow the adapter at both ends, stay above the lower bracket and have positive fold pitch over 41 positions',()=>{
 const f=fixture();
 for(const d of f.drills)for(let i=0;i<=40;i++){
  const feed=i*.13/40;d.setFeed(feed);f.root.updateMatrixWorld(true);
  for(const[key,expected]of [['upper',[drillFeedAsset.upperMovingY-.72-feed,drillFeedAsset.upperFixedY]],['lower',[drillFeedAsset.lowerFixedY,drillFeedAsset.lowerMovingY-.72-feed]]]){
   const g=d.feedStage[key].geometry,b=g.boundingBox;
   assert.ok(Math.abs(b.min.y-expected[0])<1e-7);assert.ok(Math.abs(b.max.y-expected[1])<1e-7);
   assert.ok((b.max.y-b.min.y)/(drillFeedAsset.folds*2)>.0008,'visible folds do not invert or collapse');
   assert.ok(b.min.y>-.76,'sleeves stay above the fixed lower bracket');
  }
 }
});

test('Bellows have an open screw corridor and outward triangles; dynamic geometry and normals are reused',()=>{
 const{drills}=fixture();
 for(const d of drills)for(const part of [d.feedStage.upper,d.feedStage.lower]){
  const g=part.geometry,positions=g.attributes.position.array,normals=g.attributes.normal.array;
  for(let i=0;i<100;i++)d.setFeed(i%2?.13:0);
  assert.equal(g.attributes.position.array,positions);assert.equal(g.attributes.normal.array,normals);
  const p=g.attributes.position,idx=g.index;
  for(let i=0;i<p.count;i++)assert.ok(Math.hypot(p.getX(i),p.getZ(i))>.0129,'shaft radius4 mm is clear');
  for(let i=0;i<idx.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,idx.getX(i)),b=new T.Vector3().fromBufferAttribute(p,idx.getX(i+1)),c=new T.Vector3().fromBufferAttribute(p,idx.getX(i+2));
   const normal=new T.Triangle(a,b,c).getNormal(new T.Vector3()),center=a.clone().add(b).add(c).divideScalar(3);center.y=0;assert.ok(normal.dot(center)>0);
  }
 }
});

test('Drive cover panels enclose their provisional motor and sleeves/collars meet their intended interfaces',()=>{
 const f=fixture();
 for(const d of f.drills){
  const motor=d.feedStage.casings.getObjectByName('drill-z-motor');
  const covers=d.feedStage.covers.children.filter(o=>o.name==='drill-feed-actuator-cover');
  const coverBox=new T.Box3();for(const o of covers)coverBox.union(new T.Box3().setFromObject(o));
  assert.ok(coverBox.containsBox(new T.Box3().setFromObject(motor)));assert.equal(covers.length,6);
  for(const feed of [0,.13]){d.setFeed(feed);f.root.updateMatrixWorld(true);
   for(const[key,ids]of [['upper',['drill-bellows-upper-fixed-collar','drill-bellows-upper-moving-collar']],['lower',['drill-bellows-lower-fixed-collar','drill-bellows-lower-moving-collar']]]){
    const sleeve=new T.Box3().setFromObject(d.feedStage[key]);
    for(const id of ids){const collar=new T.Box3().setFromObject(d.drill.getObjectByName(id));assert.ok(sleeve.clone().expandByScalar(1e-7).intersectsBox(collar),id);}
   }
  }
 }
});

test('Lower return retains the fitted guide contact and fixed fittings stay supported; upper relief is guarded by drive suite',async()=>{
 const after=fixture(),before=await baseline();
 for(let i=0;i<2;i++){
  const d=after.drills[i],old=before.drills[i];
  const mounts=d.stage.getObjectsByProperty('name','drill-body-mount').sort((a,b)=>b.position.y-a.position.y);
  const previous=old.stage.getObjectsByProperty('name','drill-body-mount').sort((a,b)=>b.position.y-a.position.y);
  // Later drive pass cuts only the upper forward return, now tested against its archive.
  assert.deepEqual(mounts[1].position.toArray().slice(0,2),previous[1].position.toArray().slice(0,2));
  assert.equal(mounts[1].geometry.parameters.depth,.040);
  const b=o=>new T.Box3().setFromObject(o).expandByScalar(1e-8);
  assert.ok(b(mounts[1]).intersectsBox(b(d.stage.getObjectByName('drill-z-rail'))));
  const foot=d.stage.getObjectByName('drill-feed-actuator-foot');assert.ok(b(foot).intersectsBox(b(mounts[0])));
  const spacer=d.feedStage.interfaces.getObjectByName('drill-bellows-lower-stand');
  assert.ok(b(spacer).intersectsBox(b(d.stage.getObjectByName('drill-lower-bracket'))));
  assert.ok(b(spacer).intersectsBox(b(d.feedStage.interfaces.getObjectByName('drill-bellows-lower-fixed-collar'))));
 }
});

test('Covers independently reveal the lead screw and actuator; Casings and Interfaces remain separate',()=>{
 const{root,drills}=fixture(),visibility=createInspectionVisibility({drills:root});
 for(const layer of ['equipment-covers','equipment-casings','interfaces']){
  const saved=new Map();visibility.apply({hiddenPartLayers:{drills:[layer]}},saved);
  for(const d of drills){assert.equal(d.feedStage.covers.visible,layer!=='equipment-covers');assert.equal(d.feedStage.casings.visible,layer!=='equipment-casings');assert.equal(d.feedStage.interfaces.visible,layer!=='interfaces');assert.equal(d.stage.visible,true);}
  for(const[o,v]of saved)o.visible=v;
 }
});

test('Installed bellows clear all other mesh surfaces during actual sampling, except their end collars',()=>{
 const f=fullModel(),s=createFlightState();s.science.sampling=true;
 const sleeves=[];f.root.traverse(o=>{if(/drill-(upper|lower)-dust-bellows/.test(o.name))sleeves.push(o);});
 const near=new T.Vector3();let checks=0;
 for(let i=0;i<=16;i++){
  s.science.sampleSeconds=i*.5;f.poseSampling(s,'internal');f.root.updateMatrixWorld(true);
  const obstacles=[];f.root.traverse(o=>{
   if(!o.isMesh||sleeves.includes(o)||o.name.startsWith('drill-bellows-'))return;
   const box=new T.Box3().setFromObject(o);
   if(sleeves.some(a=>new T.Box3().setFromObject(a).expandByScalar(.002).intersectsBox(box)))obstacles.push({o,box,faces:triangles(o)});
  });
  for(const sleeve of sleeves){
   const p=sleeve.geometry.attributes.position;
   for(let j=0;j<p.count;j++){
    const point=new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(sleeve.matrixWorld);
    for(const {o,box,faces}of obstacles){if(box.distanceToPoint(point)>.002)continue;
     for(const face of faces){face.closestPointToPoint(point,near);assert.ok(point.distanceTo(near)>.0001,`${sleeve.name} vs ${o.name} at ${point.toArray()}`);checks++;}
    }
   }
  }
 }
 // Broad-phase empty is valid clearance; candidate checks are reported for transparency.
 assert.ok(sleeves.length===4);console.log(`Bellows triangle candidates checked: ${checks}`);
});
