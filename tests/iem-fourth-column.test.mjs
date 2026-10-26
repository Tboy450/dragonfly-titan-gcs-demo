import {finalRefitMesh,finalFit} from './iem-final-compat.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from '../dist/vendor/three/three.module.min.js?v=dev';
import {fixture} from '../research/iem-middle-lead-2026-10-25/audit.mjs';
import {pairAudit,pairIds} from '../research/iem-fourth-column-2026-10-25/audit.mjs';
import {iemFourthColumnAsset as A} from '../dist/iem.mjs';
import {iemLeadAudit} from '../research/iem-service-bends-2026-10-24/audit.mjs';
const ids=new Set(pairIds);
const changedIds=new Set([...ids,'iem-local-lead-15','iem-local-lead-16','iem-local-lead-17','iem-local-lead-18','iem-local-lead-19','iem-local-lead-20','iem-local-lead-21']);
const ownChange=o=>(changedIds.has(o.userData.connectionId)&&['iem-harness-cable','iem-harness-label'].includes(o.name))||changedIds.has(o.userData.wireId);
const fingerprint=root=>{
 const rows=[];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||finalRefitMesh(o)||ownChange(o))return;
 rows.push(JSON.stringify({name:o.name,matrix:o.matrixWorld.toArray(),positions:[...o.geometry.attributes.position.array],indices:o.geometry.index?[...o.geometry.index.array]:null,color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));});
 return createHash('sha256').update(rows.sort().join('\n')).digest('hex');
};
const find=(parent,id,name)=>parent.getObjectsByProperty('name',name).find(o=>o.userData.connectionId===id);

test('Fourth column preserves all eleven reviewed routes, fittings, unrelated meshes and every endpoint',async()=>{
 let code=await readFile(new URL('../archive/iem-fourth-column-2026-10-25/iem.mjs',import.meta.url),'utf8');
 for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs'])code=code.replace('./'+name+'?v=dev',new URL('../dist/'+name+'?v=dev',import.meta.url).href);
 const before=fixture((await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))).buildIem),after=fixture();
 assert.equal(fingerprint(after.parent),fingerprint(before.parent));
 const old=before.parent.getObjectsByProperty('name','iem-harness-cable'),now=after.parent.getObjectsByProperty('name','iem-harness-cable');assert.equal(now.length,26);
 for(const wire of now){const previous=old.find(o=>o.userData.connectionId===wire.userData.connectionId),a=previous.geometry.parameters.path,b=wire.geometry.parameters.path;
  assert.ok(a.getPoint(0).distanceTo(b.getPoint(0))<1e-12);assert.ok(a.getPoint(1).distanceTo(b.getPoint(1))<1e-12);
  assert.equal(wire.geometry.parameters.radius,previous.geometry.parameters.radius);
  if(ids.has(wire.userData.connectionId))assert.ok(b.getLength()>b.getPoint(0).distanceTo(b.getPoint(1))*1.05,'screened relief retains slack relative to a taut direct lead');
 }
});

test('All fourth-column free spans clear neighbors outside the unchanged terminal exclusion',()=>{
 for(const row of pairAudit()){
  assert.ok(row.freeSpanMinSurfaceGapM>.002,JSON.stringify(row));
  assert.ok(row.terminalMinSurfaceGapM<0,'Inherited terminal overlaps are still reported');
 }
});

test('All three revised swept cables clear actual casing, labels and completed support surfaces outside bounded own contacts',()=>{
 const{parent,assembly}=fixture(),inverse=assembly.matrixWorld.clone().invert(),obstacles=[];
 parent.traverse(o=>{if(!o.isMesh||o.name==='iem-harness-cable')return;
  const p=o.geometry.attributes.position,index=o.geometry.index,m=inverse.clone().multiply(o.matrixWorld),triangles=[],box=new T.Box3();
  const vertex=n=>new T.Vector3().fromBufferAttribute(p,index?index.getX(n):n).applyMatrix4(m);
  for(let n=0;n<(index?index.count:p.count);n+=3){const t=new T.Triangle(vertex(n),vertex(n+1),vertex(n+2));triangles.push(t);box.expandByPoint(t.a).expandByPoint(t.b).expandByPoint(t.c);}
  obstacles.push({o,triangles,box});
 });
 const nearest=new T.Vector3();
 for(const id of pairIds){const wire=find(parent,id,'iem-harness-cable'),path=wire.geometry.parameters.path;
  for(const point of path.getSpacedPoints(1000))for(const{o,triangles,box}of obstacles){
   if(box.distanceToPoint(point)>.0045||o.userData.wireId===id)continue;
   if(o.userData.connectionId===id&&o.name==='iem-harness-backshell'&&point.distanceTo(path.getPoint(0))<.014)continue;
   if(o.userData.connectionId===id&&o.name==='iem-harness-label'&&point.distanceTo(path.getPointAt(wire.userData.labelFraction))<.015)continue;
   if(o.name==='iem-harness-tie'&&point.x<-.135&&point.y<.025&&point.distanceTo(path.getPoint(1))<.016)continue;
   for(const t of triangles){t.closestPointToPoint(point,nearest);assert.ok(point.distanceTo(nearest)>.0044,`${id} vs ${o.name} ${o.userData.connectionId??o.userData.wireId??''} at ${point.toArray()}`);}
  }
 }
});

test('Revised labels meet their own cables and all three supports and lacing remain source-labeled estimates',()=>{
 const{parent}=fixture();
 for(const [n,id]of pairIds.entries()){
  const wire=find(parent,id,'iem-harness-cable'),label=find(parent,id,'iem-harness-label'),path=wire.geometry.parameters.path;
  assert.ok(new T.Box3().setFromObject(label).distanceToPoint(path.getPointAt(wire.userData.labelFraction).applyMatrix4(wire.matrixWorld))<=.0045);
  assert.equal(wire.userData.routingReviewed,true);assert.equal(wire.userData.flightMatingConfirmed,false);
  assert.equal(wire.userData.installationSupports.length,1);assert.equal(wire.userData.installationSupports[0].fraction,(finalFit(id)?.supportFraction??A.supportFractions[n]));
  const ties=[];parent.traverse(o=>{if(o.userData.wireId===id&&o.name.endsWith('-lacing'))ties.push(o);});assert.equal(ties.length,2);
  for(let i=0;i<ties.length;i++)assert.ok(ties[i].position.distanceTo(path.getPointAt((finalFit(id)?.lacingFractions[i]??A.lacingFractions[i])))<1e-12);
 }
});

test('IEM review register records twenty-six local routes and no placeholders without assigning flight circuits',()=>{
 const report=iemLeadAudit();assert.equal(report.rows.length,26);assert.equal(report.rows.filter(row=>row.routingReviewed).length,26);
 assert.match(report.missing,/Remaining 0/);assert.ok(report.rows.every(row=>!row.flightMatingConfirmed));
 assert.ok(Object.isFrozen(A)&&Object.isFrozen(A.leadIndices));
});
