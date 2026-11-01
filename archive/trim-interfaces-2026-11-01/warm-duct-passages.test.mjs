import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {buildFans,buildTrimDevice,thermalLoopAsset,airLoopPaths} from '../dist/thermal-loop.mjs';
import {warmDuctPassageAsset as A,warmDuctChangedNames,warmDuctNoseSections} from '../dist/warm-duct-passages.mjs';
import {baseline,build,snapshots,report,mesh} from '../research/warm-duct-passages-2026-10-30/audit.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
const isChanged=n=>warmDuctChangedNames.includes(n);
const close=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
function ray(a,b,objects){const v=b.clone().sub(a);return new T.Raycaster(a,v.clone().normalize(),0,v.length()).intersectObjects(objects,false);}

test('Main warm duct and all joint flanges have an open bore and solid rims from either end',()=>{
 const root=build(),d=thermalLoopAsset.duct,parts=[];root.traverse(o=>{if(o.isMesh&&['warm-duct-run','warm-duct-flange'].includes(o.name))parts.push(o);});
 assert.equal(parts.length,6);assert.equal(A.flightGeometryConfirmed,false);
 for(const direction of [-1,1])for(const x of [-.05,0,.05])for(const dy of [-.015,0,.015]){
  const a=new T.Vector3(x,d.y+dy,direction<0?d.back+.01:d.front-.01),b=new T.Vector3(x,d.y+dy,direction<0?d.front-.01:d.back+.01);
  assert.equal(ray(a,b,parts).length,0,'no cap across a run or flange');
 }
 for(const x of [-d.width/2+A.wallM/2,d.width/2-A.wallM/2])assert.ok(ray(new T.Vector3(x,d.y,d.front-.01),new T.Vector3(x,d.y,d.back+.01),parts).length>0);
});

test('Nose elbow has a continuous open bore and outward-facing walls along the fitted bend',()=>{
 const root=build(),outlet=root.getObjectByName('warm-duct-nose-outlet'),sections=warmDuctNoseSections(thermalLoopAsset.duct).sections;
 for(let k=0;k<sections.length-1;k++){
  const a=sections[k],b=sections[k+1];
  for(const x of [-.04,0,.04])assert.equal(ray(new T.Vector3(x,a.y,a.z),new T.Vector3(x,b.y,b.z),[outlet]).length,0,'open centerline segment');
  const center=new T.Vector3(0,(a.y+b.y)/2,(a.z+b.z)/2);
  for(const side of [-1,1]){
   assert.ok(ray(center.clone().setX(side*.12),center,[outlet]).length>0,'external side wall is front-facing');
   assert.ok(ray(center,center.clone().setX(side*.12),[outlet]).length>0,'internal side wall is front-facing');
  }
 }
});

test('Nose shell and open outlet frame share their complete end rings without a blocked plate',()=>{
 const root=build(),d=thermalLoopAsset.duct,F=A.outletFrame,frame=root.getObjectByName('warm-duct-outlet-grille'),end=warmDuctNoseSections(d).sections.at(-1);
 const normal=new T.Vector3(0,Math.cos(F.angleRad),Math.sin(F.angleRad)),center=new T.Vector3(0,-.18,d.front-.15);
 const bottom=center.clone().addScaledVector(normal,-F.thicknessM/2);close(bottom.y,end.y);close(bottom.z,end.z);
 for(const [sx,sy]of [[-1,-1],[1,-1],[1,1],[-1,1]]){
  const actual=new T.Vector3(sx*end.w/2,end.y+sy*end.h*end.v[0]/2,end.z+sy*end.h*end.v[1]/2);
  const expected=new T.Vector3(sx*F.widthM/2,-F.thicknessM/2,sy*F.lengthM/2).applyMatrix4(frame.matrixWorld);
  assert.ok(actual.distanceTo(expected)<1e-7);
 }
 for(const direction of [-1,1]){
  assert.equal(ray(center.clone().addScaledVector(normal,-direction*.02),center.clone().addScaledVector(normal,direction*.02),[frame]).length,0);
  const rim=center.clone().setX(F.widthM/2-A.wallM/2);
  assert.ok(ray(rim.clone().addScaledVector(normal,-direction*.02),rim.clone().addScaledVector(normal,direction*.02),[frame]).length>0);
 }
});

test('Only main-run, flange, nose and outlet shapes change; completed fan transition and simulation stay exact',async()=>{
 const old=await baseline(),current=build(),previous=build(old.buildWarmDuct);
 assert.deepEqual(snapshots(current,isChanged),snapshots(previous,isChanged));
 for(const name of ['warm-duct-run','warm-duct-flange','warm-duct-outlet-grille']){
  const aa=[],bb=[];current.traverse(o=>{if(o.isMesh&&o.name===name)aa.push(new T.Box3().setFromObject(o));});previous.traverse(o=>{if(o.isMesh&&o.name===name)bb.push(new T.Box3().setFromObject(o));});
  assert.equal(aa.length,bb.length);aa.forEach((a,i)=>assert.ok(a.min.distanceTo(bb[i].min)<1e-7&&a.max.distanceTo(bb[i].max)<1e-7,name+' outer envelope retained'));
 }
 for(const [a,b]of [[buildFans,old.buildFans],[buildTrimDevice,old.buildTrimDevice]]){
  const x=new T.Group(),y=new T.Group();a({parent:x,mesh});b({parent:y,mesh});assert.deepEqual(snapshots(x),snapshots(y));
 }
 assert.deepEqual(thermalLoopAsset.duct,old.thermalLoopAsset.duct);assert.deepEqual(airLoopPaths(),old.airLoopPaths());
});

test('Full installed-model audit adds no contacts; retained trim and clamp contacts remain explicitly recorded',async()=>{
 const result=await report();assert.deepEqual(result.newContactPairs,[]);
 assert.deepEqual(result.currentContacts,result.originalContacts);
 assert.equal(result.currentContacts.length,5,'four retained trim contacts and one retained harness clamp contact');
 assert.ok(result.currentContacts.every(o=>o.mesh!=='warm-duct-nose-outlet'&&o.mesh!=='warm-duct-outlet-grille'));
});

test('Part18 exposes all four inspection details without adding a top-level part or moving hidden geometry',()=>{
 const root=build(),before=snapshots(root),details=inspectionSubassemblies(root).map(o=>o.name);
 assert.deepEqual(details,['warm-duct-run','warm-duct-nose-outlet','warm-duct-outlet-grille','warm-duct-fan-transition']);
 root.children[0].visible=false;assert.deepEqual(snapshots(root),before);root.children[0].visible=true;
 assert.equal(root.children[0].userData.inspectionLayer,'equipment-casings');
});
