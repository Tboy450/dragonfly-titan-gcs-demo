import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {fixture,baseline,retainedBeforeDrive,driveChangedNames,report} from '../research/drill-drive-2026-10-27/audit.mjs';
import {fingerprint} from '../research/draco-side-audit-2026-10-26/audit.mjs';
import {fullModel,triangles} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
import {createFlightState} from '../dist/flight-model.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {fixedFeedChangedNames} from '../research/drill-fixed-feed-lead-2026-10-27/audit.mjs';
const bound=o=>new T.Box3().setFromObject(o),touch=(a,b)=>bound(a).expandByScalar(1e-7).intersectsBox(bound(b));
const mounts=d=>d.stage.getObjectsByProperty('name','drill-body-mount').sort((a,b)=>b.position.y-a.position.y);

test('Drive pass retains archived motors/gearboxes, entire carriage/head/bit, sleeves and moving leads at all poses',async()=>{
 const before=await baseline(),after=fixture();
 for(const feed of [0,.065,.13]){
  for(const f of [before,after])for(const d of f.drills)d.setFeed(feed);
  assert.deepEqual(fingerprint(after.root).filter(retainedBeforeDrive),fingerprint(before.root).filter(retainedBeforeDrive));
 }
});

test('Archive reproduces the 80 mm output gap and upper-mount crossing; new relief is a subset and lower mount stays exact',async()=>{
 const data=await report();for(const row of data.rows){
  assert.ok(Math.abs(row.oldGapAboveScrewM-.08)<1e-6);assert.equal(row.oldUpperMountCrossesScrew,true);
  assert.ok(row.upperMountToScrewGapM>.0119);
 }
 const before=await baseline(),after=fixture();
 for(let i=0;i<2;i++){
  const old=mounts(before.drills[i]),now=mounts(after.drills[i]);
  assert.deepEqual(fingerprint(old[1]),fingerprint(now[1]));
  assert.deepEqual(old[0].position.toArray().slice(0,2),now[0].position.toArray().slice(0,2));
  assert.ok(bound(old[0]).expandByScalar(1e-8).containsBox(bound(now[0])));
  assert.ok(touch(now[0],after.drills[i].stage.getObjectByName('drill-z-rail')));
 }
});

test('Three side panels remain exact after the later pigtail relief; original bottom/top openings clear their fitted interfaces',async()=>{
 const before=await baseline(),after=fixture();
 for(let i=0;i<2;i++){
  const old=before.drills[i],d=after.drills[i];
  const previous=old.feedStage.covers.children.filter(o=>o.name==='drill-feed-actuator-cover');
  const panels=d.feedStage.covers.children.filter(o=>o.name==='drill-feed-actuator-cover');
  assert.equal(panels.length,6);assert.equal(panels.filter(o=>o.userData.mountingReliefIllustration).length,1);
  // The later fixed-lead suite separately checks only its new rear-panel hole.
  const untouched=o=>!o.userData.mountingReliefIllustration&&!o.userData.inputReliefIllustration&&!o.userData.pigtailReliefIllustration;
  assert.deepEqual(panels.filter(untouched).map(o=>fingerprint(o)),previous.filter((o,j)=>![2,3,4].includes(j)).map(o=>fingerprint(o)));
  const floor=panels.find(o=>o.userData.mountingReliefIllustration);
  const oldFloor=previous[2],ray=new T.Raycaster();let oldHits=0;
  const motorX=d.feedStage.drive.motor.position.x,side=i===0?-1:1;
  for(const dx of [-.017,0,.021])for(const dz of [-.014,0,.014]){
   const origin=d.drill.localToWorld(new T.Vector3(motorX-side*dx,-.29,.020+dz));
   ray.set(origin,new T.Vector3(0,-1,0));ray.far=.03;
   assert.equal(ray.intersectObject(floor,false).length,0);
   oldHits+=ray.intersectObject(oldFloor,false).length;
  }
  assert.ok(oldHits>=9,'retained closed floor would cross the expanded foot');
  const cap=panels.find(o=>o.userData.inputReliefIllustration);
  const origin=d.drill.localToWorld(new T.Vector3(motorX,-.19,.020));
  ray.set(origin,new T.Vector3(0,-1,0));ray.far=.015;
  assert.equal(ray.intersectObject(cap,false).length,0,'input has a real opening through top panel');
  assert.ok(ray.intersectObject(previous[3],false).length>0,'old top was closed');
 }
});

test('Drive seating forms continuous modeled contact from supported motor through gearbox to retained screw and sleeve collar',()=>{
 const f=fixture();
 for(const d of f.drills){
  const a=d.feedStage.drive;
  for(const [x,y]of [[a.foot,mounts(d)[0]],[a.foot,a.shoe],[a.shoe,a.motor],
   [a.motor,a.input],[a.motor,a.inputShaft],[a.input,a.gearbox],[a.inputShaft,a.gearbox],
   [a.gearbox,a.outputShaft],[a.gearbox,a.flange],[a.flange,a.jointCover],
   [a.jointCover,a.adapter],[a.adapter,d.feedStage.interfaces.getObjectByName('drill-bellows-upper-fixed-collar')],
   [a.outputShaft,d.stage.getObjectByName('drill-lead-screw')]]){
   assert.ok(touch(x,y),x.name+' joins '+y.name);
  }
  assert.ok(touch(a.foot,d.stage.getObjectByName('drill-z-rail')));
  // This checks geometric interfaces only, never strength or actual flight load paths.
 }
});

test('Output cover/flange/adapter retain an open corridor around the illustrative shaft; lower screw end remains free',()=>{
 const {drills}=fixture();
 for(const d of drills){
  const a=d.feedStage.drive;
  for(const part of [a.input,a.flange,a.jointCover,a.adapter]){
   const p=part.geometry.attributes.position;
   for(let i=0;i<p.count;i++)assert.ok(Math.hypot(p.getX(i),p.getZ(i))>=.0059999);
  }
  assert.equal(a.outputShaft.geometry.parameters.radiusTop,.004);
  assert.ok(a.outputShaft.userData.mechanismDetail.includes('continuity envelope only'));
  const bottom=d.feedStage.interfaces.getObjectByName('drill-bellows-lower-stand');
  const p=bottom.geometry.attributes.position;
  for(let i=0;i<p.count;i++)assert.ok(Math.hypot(p.getX(i),p.getZ(i))>=.0069999,'no lower shaft bearing added');
 }
});

test('Covers, Interfaces and Mounts independently expose drive casing, couplings and shoe without losing the shaft link',()=>{
 const {root,drills}=fixture(),v=createInspectionVisibility({drills:root});
 for(const layer of ['equipment-covers','interfaces','mounts']){
  const saved=new Map();v.apply({hiddenPartLayers:{drills:[layer]}},saved);
  for(const d of drills){
   assert.equal(d.feedStage.covers.visible,layer!=='equipment-covers');
   assert.equal(d.feedStage.interfaces.visible,layer!=='interfaces');
   assert.equal(d.stage.visible,layer!=='mounts');
   assert.equal(d.feedStage.casings.visible,true);
  }
  for(const[o,visible]of saved)o.visible=visible;
 }
});

test('New drive fittings/foot clear installed old hardware through sampling except specific intended seating contacts',()=>{
 const f=fullModel(),s=createFlightState();s.science.sampling=true;
 const contacts=new Map([
  ['drill-feed-actuator-foot',new Set(['drill-body-mount','drill-z-rail'])],
  ['drill-drive-motor-shoe',new Set(['drill-z-motor'])],
  ['drill-drive-input-neck',new Set(['drill-z-motor','drill-z-gearhead'])],
  ['drill-drive-input-envelope',new Set(['drill-z-motor','drill-z-gearhead'])],
  ['drill-drive-output-envelope',new Set(['drill-z-gearhead','drill-lead-screw'])],
  ['drill-drive-output-flange',new Set(['drill-z-gearhead'])],
  ['drill-drive-lower-adapter',new Set(['drill-bellows-upper-fixed-collar'])],
  ['drill-drive-gearbox-fastener',new Set(['drill-z-gearhead'])],
 ]);
 const newNames=new Set([...driveChangedNames].filter(n=>!fixedFeedChangedNames.has(n)&&!['drill-body-mount','drill-feed-actuator-cover'].includes(n)));
 const near=new T.Vector3();let checked=0;
 for(let i=0;i<=12;i++){
  s.science.sampleSeconds=i*2/3;f.poseSampling(s,'internal');f.root.updateMatrixWorld(true);
  const added=[],obstacles=[];
  f.root.traverse(o=>{if(!o.isMesh)return;
   if(newNames.has(o.name))added.push(o);else obstacles.push({o,box:bound(o)});
  });
  for(const part of added){
   const box=bound(part).expandByScalar(.00015),p=part.geometry.attributes.position;
   for(const c of obstacles.filter(c=>box.intersectsBox(c.box)&&!contacts.get(part.name)?.has(c.o.name))){
    const faces=triangles(c.o);
    for(let j=0;j<p.count;j++){
     const point=part.localToWorld(new T.Vector3().fromBufferAttribute(p,j));
     if(c.box.distanceToPoint(point)>.00015)continue;
     for(const face of faces){face.closestPointToPoint(point,near);
      assert.ok(point.distanceTo(near)>.0001,part.name+' vs '+c.o.name+' at '+point.toArray());checked++;
     }
    }
   }
  }
 }
 console.log('Drive narrow-phase candidates: '+checked);
});
