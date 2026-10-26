import {finalRefitMesh as changed} from './iem-final-compat.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from '../dist/vendor/three/three.module.min.js?v=dev';
import {fixture} from '../research/iem-middle-lead-2026-10-25/audit.mjs';
import {finalIds,reroutedIds,pairAudit,surfaceAudit} from '../research/iem-final-columns-2026-10-25/audit.mjs';
import {iemFinalServiceAsset as A} from '../dist/iem.mjs';
import {iemFinalServiceRoutes} from '../dist/iem-final-service-routes.mjs';
import {iemLeadAudit} from '../research/iem-service-bends-2026-10-24/audit.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
import {baselineBuilder} from '../research/iem-final-columns-2026-10-25/candidate-fixture.mjs';
const fingerprint=root=>{
 const rows=[];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||changed(o))return;
  rows.push(JSON.stringify({name:o.name,matrix:o.matrixWorld.toArray(),positions:[...o.geometry.attributes.position.array],indices:o.geometry.index?[...o.geometry.index.array]:null,color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));});
 return createHash('sha256').update(rows.sort().join('\n')).digest('hex');
};
const find=(parent,id,name)=>parent.getObjectsByProperty('name',name).find(o=>o.userData.connectionId===id);

test('Final columns preserve eighteen installations and all twenty-six original endpoints/radii',async()=>{
 let code=await readFile(new URL('../archive/iem-final-columns-2026-10-25/iem.mjs',import.meta.url),'utf8');
 for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs','iem-next-service-routes.mjs'])code=code.replace('./'+name+'?v=dev',new URL('../dist/'+name+'?v=dev',import.meta.url).href);
 const before=fixture((await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))).buildIem),after=fixture();
 assert.equal(fingerprint(after.parent),fingerprint(before.parent));
 const wires=after.parent.getObjectsByProperty('name','iem-harness-cable');assert.equal(wires.length,26);
 for(const wire of wires){const id=wire.userData.connectionId,prior=find(before.parent,id,'iem-harness-cable'),a=prior.geometry.parameters.path,b=wire.geometry.parameters.path;
  assert.ok(a.getPoint(0).distanceTo(b.getPoint(0))<1e-12);assert.ok(a.getPoint(1).distanceTo(b.getPoint(1))<1e-12);
  assert.equal(wire.geometry.parameters.radius,prior.geometry.parameters.radius);
  if(reroutedIds.includes(id))assert.ok(b.getLength()>b.getPoint(0).distanceTo(b.getPoint(1))*1.05,id+' retains service slack');
 }
});

test('All 325 IEM cable pairs clear outside unchanged gathering limits, including the second-column 3 mm guard',()=>{
 const pairs=pairAudit();assert.equal(pairs.length,325);
 for(const row of pairs){
  const guarded=['iem-local-lead-5','iem-local-lead-7'].some(id=>row.a===id||row.b===id);
  assert.ok(row.freeSpanMinSurfaceGapM>(guarded?.003:.002),JSON.stringify(row));
 }
 assert.ok(pairs.some(row=>row.terminalMinSurfaceGapM<0),'Fixed terminal overlaps must still be reported');
});

test('All twenty-six swept IEM cables clear; the earlier lead8 own-tag contact stays in the historical record',async()=>{
 const rows=surfaceAudit();assert.equal(rows.length,26);
 const accepted=JSON.parse(await readFile(new URL('../research/iem-final-columns-2026-10-25/candidate-checks.json',import.meta.url),'utf8'));
 assert.deepEqual(accepted.inheritedContacts.map(r=>r.id),['iem-local-lead-8']);
 assert.deepEqual(surfaceAudit(await baselineBuilder()).find(r=>r.id==='iem-local-lead-8'),accepted.inheritedContacts[0]);
 for(const row of rows)assert.ok(row.minSurfaceGapM===null||row.minSurfaceGapM>-.0001,JSON.stringify(row));
});

test('Last five have attached tags, one support and two ties each, with immutable estimated route records',()=>{
 const{parent}=fixture();
 for(const id of reroutedIds){
  const wire=find(parent,id,'iem-harness-cable'),label=find(parent,id,'iem-harness-label'),path=wire.geometry.parameters.path;
  assert.ok(new T.Box3().setFromObject(label).distanceToPoint(path.getPointAt(wire.userData.labelFraction).applyMatrix4(wire.matrixWorld))<=.0045);
  assert.equal(wire.userData.installationSupports.length,1);assert.equal(wire.userData.installationSupports[0].fraction,A.fittings[id].supportFraction);
  assert.equal(wire.userData.routingReviewed,true);assert.equal(wire.userData.flightMatingConfirmed,false);
  const ties=[];parent.traverse(o=>{if(o.userData.wireId===id&&o.name.endsWith('-lacing'))ties.push(o);});assert.equal(ties.length,2);
  for(let i=0;i<2;i++)assert.ok(ties[i].position.distanceTo(path.getPointAt(A.fittings[id].lacingFractions[i]))<1e-12);
 }
 assert.ok(Object.isFrozen(A)&&Object.isFrozen(A.leadIndices)&&Object.isFrozen(iemFinalServiceRoutes));
 for(const points of Object.values(iemFinalServiceRoutes))assert.ok(Object.isFrozen(points)&&points.every(Object.isFrozen));
});

test('All eight columns have non-nested focus access and all twenty-six routes remain explicitly estimated',()=>{
 const{parent}=fixture(),targets=inspectionSubassemblies(parent);assert.equal(targets.length,11);
 for(const id of ['iem-seventh-column','iem-eighth-column'])assert.ok(targets.some(o=>o.name===id));
 for(const target of targets)for(let p=target.parent;p&&p!==parent;p=p.parent)assert.ok(!targets.includes(p));
 const report=iemLeadAudit();assert.equal(report.rows.length,26);assert.ok(report.rows.every(r=>r.routingReviewed&&!r.flightMatingConfirmed));
 assert.match(report.missing,/Remaining 0/);assert.match(A.confidence,/EST/);
});
