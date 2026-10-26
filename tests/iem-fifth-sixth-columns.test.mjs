import {finalRefitMesh,finalFit} from './iem-final-compat.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from '../dist/vendor/three/three.module.min.js?v=dev';
import {fixture} from '../research/iem-middle-lead-2026-10-25/audit.mjs';
import {nextIds,legacyIds,routeAudit,surfaceAudit} from '../research/iem-fifth-sixth-columns-2026-10-25/audit.mjs';
import {iemNextServiceAsset as A} from '../dist/iem.mjs';
import {iemLeadAudit} from '../research/iem-service-bends-2026-10-24/audit.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
const changed=o=>(nextIds.includes(o.userData.connectionId)&&['iem-harness-cable','iem-harness-label'].includes(o.name))||nextIds.includes(o.userData.wireId);
const fingerprint=root=>{
 const rows=[];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||finalRefitMesh(o)||changed(o))return;
 rows.push(JSON.stringify({name:o.name,matrix:o.matrixWorld.toArray(),positions:[...o.geometry.attributes.position.array],indices:o.geometry.index?[...o.geometry.index.array]:null,color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));});
 return createHash('sha256').update(rows.sort().join('\n')).digest('hex');
};
const find=(parent,id,name)=>parent.getObjectsByProperty('name',name).find(o=>o.userData.connectionId===id);

test('Next seven preserve all fourteen completed routes/fittings, five placeholders, casing and every endpoint/radius',async()=>{
 let code=await readFile(new URL('../archive/iem-fifth-sixth-columns-2026-10-25/iem.mjs',import.meta.url),'utf8');
 for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs'])code=code.replace('./'+name+'?v=dev',new URL('../dist/'+name+'?v=dev',import.meta.url).href);
 const before=fixture((await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))).buildIem),after=fixture();
 assert.equal(fingerprint(after.parent),fingerprint(before.parent));
 const now=after.parent.getObjectsByProperty('name','iem-harness-cable');assert.equal(now.length,26);
 for(const wire of now){const prior=find(before.parent,wire.userData.connectionId,'iem-harness-cable'),a=prior.geometry.parameters.path,b=wire.geometry.parameters.path;
  assert.ok(a.getPoint(0).distanceTo(b.getPoint(0))<1e-12);assert.ok(a.getPoint(1).distanceTo(b.getPoint(1))<1e-12);
  assert.equal(wire.geometry.parameters.radius,prior.geometry.parameters.radius);
  if(nextIds.includes(wire.userData.connectionId))assert.ok(b.getLength()>b.getPoint(0).distanceTo(b.getPoint(1))*1.05);
 }
});

test('Seven free spans retain clearance and the historical legacy-contact record is preserved',async()=>{
 const rows=routeAudit();assert.equal(rows.length,7);
 for(const row of rows){assert.ok(row.freeSpanMinSurfaceGapM>.002,JSON.stringify(row));assert.ok(row.terminalMinSurfaceGapM<0);}
 const historical=JSON.parse(await readFile(new URL('../research/iem-fifth-sixth-columns-2026-10-25/route-checks.json',import.meta.url),'utf8'));
 assert.ok(historical.routes.some(row=>row.legacyFreeSpanMinSurfaceGapM<0),'Retain the earlier placeholder interference record');
 assert.deepEqual([...legacyIds],['iem-local-lead-22','iem-local-lead-23','iem-local-lead-24','iem-local-lead-25','iem-local-lead-26']);
});

test('Rebuilt wires clear actual casing, connector, label and support triangles with unchanged bounded own contacts',()=>{
 for(const row of surfaceAudit())assert.ok(row.minSurfaceGapM===null||row.minSurfaceGapM>-.0001,JSON.stringify(row));
});

test('Seven attached tags, supports and fourteen lacing ties are estimates, not identified flight circuits',()=>{
 const{parent}=fixture();
 for(const[n,id]of nextIds.entries()){
  const wire=find(parent,id,'iem-harness-cable'),label=find(parent,id,'iem-harness-label'),path=wire.geometry.parameters.path;
  assert.ok(new T.Box3().setFromObject(label).distanceToPoint(path.getPointAt(wire.userData.labelFraction).applyMatrix4(wire.matrixWorld))<=.0045);
  assert.equal(wire.userData.routingReviewed,true);assert.equal(wire.userData.flightMatingConfirmed,false);
  assert.equal(wire.userData.labelFraction,(finalFit(id)?.labelFraction??A.labelFractions[n]));
  assert.equal(wire.userData.installationSupports.length,1);assert.equal(wire.userData.installationSupports[0].fraction,(finalFit(id)?.supportFraction??A.supportFractions[n]));
  const ties=[];parent.traverse(o=>{if(o.userData.wireId===id&&o.name.endsWith('-lacing'))ties.push(o);});assert.equal(ties.length,2);
  for(let i=0;i<ties.length;i++)assert.ok(ties[i].position.distanceTo(path.getPointAt((finalFit(id)?.lacingFractions[i]??A.lacingFractions[i])))<1e-12);
 }
});

test('Fifth/sixth focuses are non-nested and reversible layers retain all twenty-six installed leads',()=>{
 const{parent}=fixture(),targets=inspectionSubassemblies(parent);assert.equal(targets.length,11);
 for(const name of ['iem-fifth-column','iem-sixth-column','iem-seventh-column','iem-eighth-column'])assert.ok(targets.some(o=>o.name===name));
 for(const target of targets)for(let p=target.parent;p&&p!==parent;p=p.parent)assert.ok(!targets.includes(p));
 const mask=createInspectionVisibility({iem:parent});
 for(const layer of ['harnesses','interfaces','mounts']){
  const previous=new Map();mask.apply({hiddenPartLayers:{iem:[layer]}},previous);
  for(const[o,v]of previous)o.visible=v;
  assert.ok(parent.getObjectsByProperty('name','iem-harness-cable').every(o=>o.visible));
 }
 const report=iemLeadAudit();assert.equal(report.rows.filter(r=>r.routingReviewed).length,26);assert.match(report.missing,/Remaining 0/);
 assert.ok(report.rows.every(r=>!r.flightMatingConfirmed));assert.ok(Object.isFrozen(A)&&Object.isFrozen(A.leadIndices));
});
