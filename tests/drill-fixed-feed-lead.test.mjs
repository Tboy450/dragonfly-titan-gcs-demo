import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {fixture,baseline,retainedBeforeFixedFeed} from '../research/drill-fixed-feed-lead-2026-10-27/audit.mjs';
import {fingerprint} from '../research/draco-side-audit-2026-10-26/audit.mjs';
import {fullModel,triangles} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
import {createFlightState} from '../dist/flight-model.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {drillFixedLeadAsset as asset} from '../dist/drill-fixed-feed-lead.mjs';

test('Fixed feed lead retains every archived mechanism/moving lead except the specifically relieved rear panel',async()=>{
 const a=fixture(),b=await baseline();
 for(const feed of [0,.065,.13]){
  for(const f of [a,b])for(const d of f.drills)d.setFeed(feed);
  assert.deepEqual(fingerprint(a.root).filter(retainedBeforeFixedFeed),fingerprint(b.root).filter(retainedBeforeFixedFeed));
 }
 for(let i=0;i<2;i++){
  const panels=d=>d.feedStage.covers.children.filter(o=>o.name==='drill-feed-actuator-cover');
  assert.deepEqual(panels(a.drills[i]).filter(o=>!o.userData.pigtailReliefIllustration).map(o=>fingerprint(o)),
   panels(b.drills[i]).filter((o,j)=>j!==4).map(o=>fingerprint(o)));
 }
});

test('Fixed-frame endpoints/buffers stay stationary through 41 independent carriage poses and both sides mirror correctly',()=>{
 const f=fixture(),points=[];
 for(const d of f.drills){
  const c=d.fixedFeedLead,initial=fingerprint(c.leads),geometry=c.cable.geometry;
  for(let i=0;i<=40;i++){
   d.setFeed(i*.13/40);f.root.updateMatrixWorld(true);
   assert.deepEqual(fingerprint(c.leads),initial);assert.equal(c.cable.geometry,geometry);
  }
  points.push(c.path.getPoint(0).applyMatrix4(d.drill.matrixWorld));
 }
 assert.ok(Math.abs(points[0].x+points[1].x)<1e-9);
 assert.equal(points[0].y,points[1].y);assert.equal(points[0].z,points[1].z);
});

test('Lead has exact tangent semicircle accommodation and measured constant length; it claims no qualified wire construction',()=>{
 const {drills}=fixture();
 for(const d of drills){
  const c=d.fixedFeedLead,p=c.path;
  assert.ok(Math.abs(p.radius-.0385)<1e-9);
  let length=0,last=p.getPoint(0);
  for(let i=1;i<=8192;i++){const point=p.getPoint(i/8192);length+=point.distanceTo(last);last=point;}
  assert.ok(Math.abs(length-p.getLength())<1e-7);
  for(const s of [p.firstLength,p.firstLength+Math.PI*p.radius]){
   assert.ok(p.getTangent((s-1e-10)/p.length).distanceTo(p.getTangent((s+1e-10)/p.length))<1e-7);
  }
  assert.deepEqual(p.getPoint(0).toArray(),[c.path.x,asset.exitY,asset.motorRearZ]);
  assert.ok(p.getPoint(1).distanceTo(new T.Vector3(p.x,asset.retentionY,asset.retentionZ))<1e-9);
  assert.equal(c.cable.userData.flightMatingConfirmed,false);
  assert.match(c.cable.userData.endpointRole,/remote continuation unmodeled/);
 }
});

test('New rear cover has an actual aperture; original solid panel would block the coaxial pigtail',async()=>{
 const a=fixture(),b=await baseline(),ray=new T.Raycaster();
 for(let i=0;i<2;i++){
  const d=a.drills[i],c=d.fixedFeedLead;
  const panel=d.feedStage.covers.children.find(o=>o.userData.pigtailReliefIllustration);
  const old=b.drills[i].feedStage.covers.children.filter(o=>o.name==='drill-feed-actuator-cover')[4];
  const origin=d.drill.localToWorld(new T.Vector3(c.path.x,asset.exitY,-.015));
  ray.set(origin,new T.Vector3(0,0,1));ray.far=.02;
  assert.equal(ray.intersectObject(panel,false).length,0);
  assert.ok(ray.intersectObject(old,false).length>0);
  const vertices=c.grommet.geometry.attributes.position;
  for(let j=0;j<vertices.count;j++)assert.ok(Math.hypot(vertices.getX(j),vertices.getZ(j))>=asset.grommetBoreRadiusM-1e-8);
 }
});

test('Retention ring supports the wire at a local frame point and its tab meets the drive foot without filling the wire bore',()=>{
 const {drills}=fixture(),b=o=>new T.Box3().setFromObject(o).expandByScalar(1e-7);
 for(const d of drills){
  const c=d.fixedFeedLead;
  assert.ok(b(c.tab).intersectsBox(b(c.retention)));
  assert.ok(b(c.tab).intersectsBox(b(d.feedStage.drive.foot)));
  assert.ok(b(c.tab).max.y<d.drill.localToWorld(c.path.getPoint(1)).y-asset.radiusM-.0005);
 }
});

test('Harnesses, Interfaces and Mounts independently hide fixed lead, exit relief and retention without extra part numbers',()=>{
 const {root,drills}=fixture(),v=createInspectionVisibility({drills:root});
 for(const layer of ['harnesses','interfaces','mounts']){
  const saved=new Map();v.apply({hiddenPartLayers:{drills:[layer]}},saved);
  for(const d of drills){
   const c=d.fixedFeedLead;
   assert.equal(c.leads.visible,layer!=='harnesses');assert.equal(c.interfaces.visible,layer!=='interfaces');
   assert.equal(c.supports.visible,layer!=='mounts');
   assert.equal(c.leads.userData.inspectionLabel,undefined);
  }
  for(const[o,visible]of saved)o.visible=visible;
 }
});

test('Fixed lead centers clear actual installed hardware and moving leads during sampling, except the short motor-entry seat',()=>{
 const f=fullModel(),s=createFlightState(),near=new T.Vector3();s.science.sampling=true;
 const cables=[];f.root.traverse(o=>{if(o.name==='drill-feed-service-lead')cables.push(o);});
 let checks=0;
 for(let i=0;i<=12;i++){
  s.science.sampleSeconds=i*2/3;f.poseSampling(s,'internal');f.root.updateMatrixWorld(true);
  for(const cable of cables){
   const path=cable.geometry.parameters.path,motor=cable.parent.parent.getObjectByName('drill-z-motor');
   const box=new T.Box3().setFromObject(cable).expandByScalar(.0002),obstacles=[];
   f.root.traverse(o=>{if(o.isMesh&&o!==cable&&box.intersectsBox(new T.Box3().setFromObject(o)))
    obstacles.push({o,box:new T.Box3().setFromObject(o),faces:triangles(o)});});
   for(let j=0;j<=128;j++){
    const point=cable.localToWorld(path.getPoint(j/128));
    for(const c of obstacles){
     if(c.o===motor&&j/128*path.length<=.0021)continue;
     if(c.box.distanceToPoint(point)>asset.radiusM+.0001)continue;
     for(const face of c.faces){face.closestPointToPoint(point,near);
      assert.ok(point.distanceTo(near)>asset.radiusM+.0001,cable.name+' vs '+c.o.name+' at feed '+i+' point '+j);checks++;
     }
    }
   }
  }
 }
 assert.equal(cables.length,2);console.log('Fixed lead narrow-phase candidates: '+checks);
});
