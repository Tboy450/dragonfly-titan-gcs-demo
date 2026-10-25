import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from '../dist/vendor/three/three.module.min.js?v=dev';
import {iemMiddleLeadAsset as A} from '../dist/iem.mjs';
import {fixture,middleLeadAudit} from '../research/iem-middle-lead-2026-10-25/audit.mjs';
import {iemLeadAudit} from '../research/iem-service-bends-2026-10-24/audit.mjs';
import {installationFamilies} from '../dist/avionics-installation.mjs';
const id=A.connectionId;
async function oldBuilder(){
 let code=await readFile(new URL('../archive/iem-middle-lead-2026-10-25/iem.mjs',import.meta.url),'utf8');
 for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs'])code=code.replace('./'+name+'?v=dev',new URL('../dist/'+name+'?v=dev',import.meta.url).href);
 return(await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))).buildIem;
}
const changed=o=>(o.userData.connectionId===id&&['iem-harness-cable','iem-harness-label'].includes(o.name))||o.userData.wireId===id;
const fingerprint=root=>{
 const rows=[];root.updateMatrixWorld(true);
 root.traverse(o=>{if(!o.isMesh||changed(o))return;rows.push(JSON.stringify({name:o.name,matrix:o.matrixWorld.toArray(),vertices:[...o.geometry.attributes.position.array],indices:o.geometry.index?[...o.geometry.index.array]:null,color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));});
 return createHash('sha256').update(rows.sort().join('\n')).digest('hex');
};
const find=(parent,name)=>parent.getObjectsByProperty('name',name).find(o=>o.userData.connectionId===id);

test('Middle-lead pass preserves every other mesh including completed fittings, and all 26 endpoints/radii',async()=>{
 const before=fixture(await oldBuilder()),after=fixture();
 assert.equal(fingerprint(after.parent),fingerprint(before.parent));
 const old=before.parent.getObjectsByProperty('name','iem-harness-cable'),now=after.parent.getObjectsByProperty('name','iem-harness-cable');
 assert.equal(now.length,26);
 for(const wire of now){const prior=old.find(o=>o.userData.connectionId===wire.userData.connectionId),a=prior.geometry.parameters.path,b=wire.geometry.parameters.path;
  assert.ok(a.getPoint(0).distanceTo(b.getPoint(0))<1e-12);assert.ok(a.getPoint(1).distanceTo(b.getPoint(1))<1e-12);
  assert.equal(wire.geometry.parameters.radius,prior.geometry.parameters.radius);
 }
 assert.ok(find(after.parent,'iem-harness-cable').geometry.parameters.path.getLength()>find(before.parent,'iem-harness-cable').geometry.parameters.path.getLength());
});

test('Middle free span clears all 25 neighbor curves outside the exact pre-existing gathering boundary',()=>{
 const report=middleLeadAudit();assert.ok(report.freeSpanMinSurfaceGapM>.002,JSON.stringify(report.closest));
 assert.ok(report.terminalMinSurfaceGapM<0,'Fixed terminal overlap is reported, not silently exempted as clear');
});

test('Middle cable swept radius clears actual equipment triangles outside bounded own-contact surfaces',()=>{
 const{parent,assembly}=fixture(),wire=find(parent,'iem-harness-cable'),path=wire.geometry.parameters.path,obstacles=[];
 const inverse=assembly.matrixWorld.clone().invert();
 parent.traverse(o=>{if(!o.isMesh||o.name==='iem-harness-cable')return;
  // Own contact hardware intentionally touches the cable; verified separately below.
  if(o.userData.wireId===id)return;
  const positions=o.geometry.attributes.position,index=o.geometry.index,transform=inverse.clone().multiply(o.matrixWorld),triangles=[],box=new T.Box3();
  const vertex=n=>new T.Vector3().fromBufferAttribute(positions,index?index.getX(n):n).applyMatrix4(transform);
  for(let n=0;n<(index?index.count:positions.count);n+=3){const t=new T.Triangle(vertex(n),vertex(n+1),vertex(n+2));triangles.push(t);box.expandByPoint(t.a).expandByPoint(t.b).expandByPoint(t.c);}
  obstacles.push({o,triangles,box});
 });
 const nearest=new T.Vector3();
 for(const p of path.getSpacedPoints(900))for(const{o,triangles,box}of obstacles){
  if(box.distanceToPoint(p)>.0045)continue;
  if(o.userData.connectionId===id&&o.name==='iem-harness-backshell'&&p.distanceTo(path.getPoint(0))<.014)continue;
  if(o.userData.connectionId===id&&o.name==='iem-harness-label'&&p.distanceTo(path.getPointAt(A.labelFraction))<.015)continue;
  if(o.name==='iem-harness-tie'&&p.x<-.135&&p.y<.025&&p.distanceTo(path.getPoint(1))<.016)continue;
  for(const t of triangles){t.closestPointToPoint(p,nearest);assert.ok(p.distanceTo(nearest)>.0044,`${o.name} ${o.userData.connectionId??o.userData.wireId??''} at ${p.toArray()}`);}
 }
});

test('Middle label meets its own cable, two lacing examples follow tangents and the new support has continuous contact',()=>{
 const{parent}=fixture(),wire=find(parent,'iem-harness-cable'),path=wire.geometry.parameters.path,label=find(parent,'iem-harness-label');
 const local=path.getPointAt(A.labelFraction).applyMatrix4(wire.matrixWorld);
 assert.ok(new T.Box3().setFromObject(label).distanceToPoint(local)<=.0045);
 assert.equal(wire.userData.flightMatingConfirmed,false);assert.equal(wire.userData.routeConfidence,'EST');
 assert.equal(wire.userData.installationSupports.length,1);
 const rings=[];parent.traverse(o=>{if(o.userData.wireId===id&&o.name.endsWith('-lacing'))rings.push(o);});assert.equal(rings.length,2);
 for(let i=0;i<rings.length;i++){
  assert.ok(rings[i].position.distanceTo(path.getPointAt(A.lacingFractions[i]))<1e-12);
  assert.ok(new T.Vector3(0,0,1).applyQuaternion(rings[i].quaternion).dot(path.getTangentAt(A.lacingFractions[i]))>1-1e-12);
 }
 const support=wire.userData.installationSupports[0],pad=parent.getObjectByName('install-iem-6-pad');
 assert.ok(Math.abs(pad.position.z+.0006+.114)<1e-12);
 assert.equal(support.fraction,A.supportFraction);
 const report=iemLeadAudit();assert.equal(report.rows.filter(r=>r.routingReviewed).length,5);
 assert.match(report.missing,/Remaining 21/);
 assert.match(installationFamilies.find(row=>row.id==='iem').modeled,/21 remain/);
});
