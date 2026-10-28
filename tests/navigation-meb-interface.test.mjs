import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three/three.module.min.js';
import {navigationMebInterface as A} from '../dist/navigation-meb-interface.mjs';
import {buildMainHarness,mainHarnessAsset} from '../dist/main-harness.mjs';
import {buildNoseElectronics} from '../dist/nose-electronics.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {inspectionGroups} from '../dist/vehicle-inspector.mjs';
import {buildEndpointAudit} from '../research/harness-endpoints-2026-10-23/audit.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} vs ${b}`);
function fixture(){
 const parent=new T.Group(),navigation=new T.Group(),equipment=new T.Group();
 const built=buildMainHarness({parent,mesh,navigationParent:navigation});
 const units=buildNoseElectronics({parent:equipment,mesh});
 parent.updateMatrixWorld(true);navigation.updateMatrixWorld(true);equipment.updateMatrixWorld(true);
 return {parent,navigation,equipment,...built,...units};
}
test('Only the MEB tail changes; all other branch points, trunk, cable sizes and enclosures remain exact',async()=>{
 const prior=await readFile(new URL('../archive/navigation-meb-link-2026-10-27/main-harness.mjs',import.meta.url),'utf8');
 const vendor=new URL('../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href;
 const old=(await import('data:text/javascript;base64,'+Buffer.from(prior.replace('./vendor/three/three.module.min.js?v=dev',vendor)).toString('base64'))).mainHarnessAsset;
 for(const key of ['trunk','strands','crossBundles','clampSpacingM'])assert.deepEqual(mainHarnessAsset[key],old[key]);
 for(const run of mainHarnessAsset.branches){const b=old.branches.find(r=>r.name===run.name);assert.equal(run.radiusM,b.radiusM);
  if(run.name==='navigation-meb')assert.deepEqual(run.points.slice(0,2),b.points.slice(0,2));else assert.deepEqual(run,b);
 }
 assert.equal(A.flightMatingConfirmed,false);assert.equal(A.confidence,'EST');
});
test('Single branch seats inside the open strain-relief bore with a straight terminal tangent',()=>{
 const {parent,navigation,navigationWire}=fixture();
 assert.equal(parent.getObjectByName('main-harness-navigation-meb'),undefined);
 const wire=navigationWire.getObjectByName('main-harness-navigation-meb'),p=wire.geometry.parameters.path;
 p.getPoint(1).toArray().forEach((v,i)=>near(v,A.seat[i]));
 const tangent=p.getTangent(1);assert.ok(tangent.z<-.9999&&Math.abs(tangent.x)<1e-6&&Math.abs(tangent.y)<1e-6);
 const boot=navigation.getObjectByName('navigation-meb-est-strain-relief');
 const box=new T.Box3().setFromObject(boot);assert.ok(A.seat[2]>box.min.z&&A.seat[2]<box.max.z);
 assert.ok(A.boreRadiusM>wire.geometry.parameters.radius);
 for(const [name,a,b]of [['receptacle-shell',.003,.011],['coupling',.011,.017],['backshell',.017,.028],['strain-relief',.028,.042]]){
  const part=navigation.getObjectByName('navigation-meb-est-'+name),bounds=new T.Box3().setFromObject(part);
  near(bounds.min.z,A.wallZ+a);near(bounds.max.z,A.wallZ+b);
 }
 const audit=buildEndpointAudit().routes.find(r=>r.owner==='navigation-meb');
 assert.equal(audit.status,'geometric-contact-only');assert.equal(audit.flightTopologyConfirmed,false);near(audit.targetStubs[0].centerlineGapM,0);
});
test('Flange sits on the actual MEB wall between ribs; route and interface clear the other navigation units',()=>{
 const {navigation,equipment,units,imus,support}=fixture(),flange=navigation.getObjectByName('navigation-meb-est-flange');
 const box=new T.Box3().setFromObject(flange),meb=units.find(u=>u.spec.name==='ocellus-meb');
 const wall=meb.casing.children.find(o=>o.name==='ocellus-meb-side'&&o.position.x<0);
 near(box.min.z,new T.Box3().setFromObject(wall).max.z);
 for(const rib of meb.casing.children.filter(o=>o.name.endsWith('-external-stiffener'))){
  assert.ok(!box.intersectsBox(new T.Box3().setFromObject(rib)),'flange vs rib');
 }
 const triangles=[];equipment.traverse(o=>{if(!o.isMesh)return;const pos=o.geometry.attributes.position,idx=o.geometry.index;
  for(let i=0;i<(idx?idx.count:pos.count);i+=3){const v=j=>new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(j):j).applyMatrix4(o.matrixWorld);
   const triangle=new T.Triangle(v(i),v(i+1),v(i+2));if(triangle.getArea()>1e-14)triangles.push(triangle);}
 });
 const wire=navigation.getObjectByName('main-harness-navigation-meb'),p=wire.geometry.parameters.path,q=new T.Vector3();
 for(const v of p.getSpacedPoints(300))for(const t of triangles){t.closestPointToPoint(v,q);assert.ok(v.distanceTo(q)>=.00799,'wire vs navigation solid');}
 for(const group of [units[1].group,...imus,support]){
  const other=new T.Box3().setFromObject(group);assert.ok(!new T.Box3().setFromObject(navigation).intersectsBox(other),group.name);
 }
});
test('Part 5 and Bay harness share a single context link; isolated IMUs/FEB and camera routes omit it',()=>{
 assert.deepEqual(inspectionGroups('nose-electronics'),['nose-electronics','navigation-meb-link']);
 assert.ok(inspectionGroups('nose-electronics','ocellus-meb').includes('navigation-meb-link'));
 for(const sub of ['imu-a','imu-b','ocellus-feb','imu-estimated-support'])assert.deepEqual(inspectionGroups('nose-electronics',sub),['nose-electronics']);
 assert.ok(inspectionGroups('main-harness').includes('navigation-meb-link'));
 assert.deepEqual(inspectionGroups('main-harness','main-harness-port-down-camera'),['main-harness']);
 const {parent,navigation,equipment,navigationWire,navigationInterface}=fixture();
 const masks=createInspectionVisibility({'main-harness':parent,'navigation-meb-link':navigation,'nose-electronics':equipment});
 for(const owner of ['main-harness','nose-electronics'])for(const category of ['harnesses','interfaces']){
  const before=new Map();masks.apply({hiddenPartLayers:{[owner]:[category]}},before);
  assert.equal(category==='harnesses'?navigationWire.visible:navigationInterface.interfaces.visible,false);
  assert.equal(category==='harnesses'?navigationInterface.interfaces.visible:navigationWire.visible,true);
  for(const [o,v]of before)o.visible=v;
 }
});
