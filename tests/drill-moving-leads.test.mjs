import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {fixture,baseline,fullModel,triangles,unchangedDrillMesh} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
import {fingerprint} from '../research/draco-side-audit-2026-10-26/audit.mjs';
import {drillLeadAsset} from '../dist/drill-moving-leads.mjs';
import {createFlightState} from '../dist/flight-model.mjs';
import {samplingSequence} from '../dist/science.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {retainedBeforeFeedStage} from '../research/drill-feed-stage-2026-10-27/audit.mjs';

test('Moving accommodation preserves every mechanical mesh and both original motor-cap endpoints/diameters',async()=>{
 const current=fixture(),before=await baseline();
 assert.deepEqual(fingerprint(current.root).filter(unchangedDrillMesh).filter(retainedBeforeFeedStage),fingerprint(before.root).filter(unchangedDrillMesh).filter(retainedBeforeFeedStage));
 for(const [i,d]of current.drills.entries()){
  const old=[];before.drills[i].leads.traverse(o=>{if(o.name==='drill-motor-lead')old.push(o);});
  for(const [j,c]of d.cables.entries()){
   const a=old[j].geometry.parameters.path.getPoint(0).applyMatrix4(old[j].matrixWorld);
   const b=c.path.getPoint(0).applyMatrix4(c.mesh.matrixWorld);
   assert.ok(a.distanceTo(b)<1e-12);assert.equal(c.mesh.geometry.parameters.radius,old[j].geometry.parameters.radius);
  }
 }
});

test('Both leads keep fixed ends, constant length and smooth tangent transitions through 41 stroke positions',()=>{
 const {drills,root}=fixture();
 for(const d of drills)for(let n=0;n<=40;n++){
  const feed=n*.13/40;d.setFeed(feed);root.updateMatrixWorld(true);
  for(const c of d.cables){
   const start=c.motorLocal.clone().applyMatrix4(d.carriage.matrixWorld),end=c.fixed.clone().applyMatrix4(d.drill.matrixWorld);
   assert.ok(c.path.getPoint(0).applyMatrix4(c.mesh.matrixWorld).distanceTo(start)<1e-12);
   assert.ok(c.path.getPoint(1).applyMatrix4(c.mesh.matrixWorld).distanceTo(end)<1e-12);
   assert.ok(c.path.firstLength>.02&&c.path.joinY-c.fixed.y>.02,'both free straight legs remain positive');
   const points=c.path.getPoints(2000),length=points.slice(1).reduce((sum,p,i)=>sum+p.distanceTo(points[i]),0);
   assert.ok(Math.abs(length-c.path.length)<2e-6,`${length} vs ${c.path.length}`);
   for(const t of [c.path.firstLength/c.path.length,(c.path.firstLength+Math.PI*c.path.radius)/c.path.length])
    assert.ok(c.path.getTangent(t-1e-7).angleTo(c.path.getTangent(t+1e-7))<1e-5);
   assert.ok(c.path.radius>.04,'estimated bend envelope, not a qualified cable limit');
  }
 }
});

test('Repeated motion reuses geometry/buffers and outward surface winding',()=>{
 const{drills}=fixture();
 for(const d of drills){
  const storage=d.cables.map(c=>[c.mesh.geometry,c.mesh.geometry.attributes.position.array,c.mesh.geometry.attributes.normal.array]);
  for(let n=0;n<200;n++)d.setFeed(n%2?.13:0);
  for(const[i,c]of d.cables.entries()){
   const g=c.mesh.geometry;assert.equal(g,storage[i][0]);assert.equal(g.attributes.position.array,storage[i][1]);assert.equal(g.attributes.normal.array,storage[i][2]);
   const p=g.attributes.position,idx=g.index,norm=g.attributes.normal;
   for(let j=0;j<idx.count;j+=3){const a=idx.getX(j),b=idx.getX(j+1),cc=idx.getX(j+2);
    const normal=new T.Triangle(new T.Vector3().fromBufferAttribute(p,a),new T.Vector3().fromBufferAttribute(p,b),new T.Vector3().fromBufferAttribute(p,cc)).getNormal(new T.Vector3());
    assert.ok(normal.dot(new T.Vector3().fromBufferAttribute(norm,a))>0,'outward triangles');
   }
  }
 }
});

test('Cable support tabs contact the retained upper mounts; guides retain their wire ends',()=>{
 const {drills,root}=fixture();root.updateMatrixWorld(true);
 for(const d of drills){
  const mount=d.stage.getObjectsByProperty('name','drill-body-mount').sort((a,b)=>b.position.y-a.position.y)[0];
  const box=new T.Box3().setFromObject(mount).expandByScalar(1e-8);
  for(const o of d.supports.children.filter(o=>o.name==='drill-cable-support'))assert.ok(box.intersectsBox(new T.Box3().setFromObject(o)));
  const seats=d.supports.children.filter(o=>o.name==='drill-cable-seat');
  seats.forEach((o,i)=>assert.ok(o.position.distanceTo(d.cables[i].fixed)<1e-12));
 }
});

test('Harnesses, mounting supports and motor boots remain independently hideable and restore',()=>{
 const{root,drills}=fixture(),visibility=createInspectionVisibility({drills:root});
 for(const layer of ['harnesses','mounts','interfaces']){
  const saved=new Map();visibility.apply({hiddenPartLayers:{drills:[layer]}},saved);
  for(const d of drills){assert.equal(d.leads.visible,layer!=='harnesses');assert.equal(d.supports.visible,layer!=='mounts');assert.equal(d.boots.visible,layer!=='interfaces');}
  for(const[o,value]of saved)o.visible=value;
  for(const d of drills)assert.equal(d.leads.visible&&d.supports.visible&&d.boots.visible,true);
 }
});

test('Actual vehicle sampling pose updates the active leads and retains the other drill stowed',()=>{
 const f=fullModel(),s=createFlightState();s.science.sampling=true;
 for(const seconds of [0,3,8,19,20]){
  s.science.sampleSeconds=seconds;f.poseSampling(s,'internal');f.root.updateMatrixWorld(true);
  const expected=samplingSequence(s).drillFeed;
  for(const[name,feed]of [['drill-port',expected],['drill-starboard',0]]){
   const d=f.root.getObjectByName(name),wires=d.getObjectsByProperty('name','drill-motor-lead');
   assert.equal(wires.length,2);for(const w of wires)assert.equal(w.geometry.parameters.path.feed,feed);
  }
 }
});

test('New cable envelopes clear actual installed meshes and each other over the feed stroke',()=>{
 const f=fullModel(),s=createFlightState();s.science.sampling=true;
 const cables=[];f.root.traverse(o=>{if(o.name==='drill-motor-lead')cables.push(o);});
 const nearest=new T.Vector3();let checked=0;
 for(let step=0;step<=12;step++){
  // Sample the real pose path; direct both-side stroke constraints are covered above.
  s.science.sampleSeconds=step/12*8;f.poseSampling(s,'internal');f.root.updateMatrixWorld(true);
  const obstacles=[];f.root.traverse(o=>{if(!o.isMesh||o.name==='drill-motor-lead'||o.userData.sampleMarker)return;
   const b=new T.Box3().setFromObject(o);
   if(cables.some(w=>b.intersectsBox(new T.Box3().setFromObject(w).expandByScalar(.012))))obstacles.push({o,b,triangles:triangles(o)});
  });
  const worldPoints=cables.map(w=>w.geometry.parameters.path.getPoints(160).map(p=>p.applyMatrix4(w.matrixWorld)));
  for(const [i,w]of cables.entries())for(const p of worldPoints[i])for(const {o,b,triangles:faces}of obstacles){
   if(b.distanceToPoint(p)>.012)continue;
   // Own boot and guide contacts are designed retention interfaces, not free-span clearance.
   const sameDrill=(o.parent===w.parent.parent||o.parent?.parent===w.parent.parent||o.parent?.parent?.parent===w.parent.parent);
   const start=worldPoints[i][0],end=worldPoints[i].at(-1);
   if(sameDrill&&o.name==='drill-cable-boot'&&p.distanceTo(start)<.009+drillLeadAsset.radiusM)continue;
   if(sameDrill&&o.name==='drill-cable-seat'&&p.distanceTo(end)<.006)continue;
   if(sameDrill&&['drill-percussion-actuator','drill-rotation-actuator'].includes(o.name)&&p.distanceTo(start)<.0031)continue;
   for(const face of faces){face.closestPointToPoint(p,nearest);assert.ok(p.distanceTo(nearest)>.003-1e-7,`${w.parent.parent.name} lead ${w.userData.motor} vs ${o.name} at ${p.toArray()}`);checked++;}
  }
  for(let i=0;i<worldPoints.length;i++)for(let j=i+1;j<worldPoints.length;j++)for(const p of worldPoints[i])for(const q of worldPoints[j])assert.ok(p.distanceToSquared(q)>.006**2);
 }
 assert.ok(checked>0,'actual triangle candidates checked');
});
