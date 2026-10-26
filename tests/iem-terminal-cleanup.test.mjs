import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as T from '../dist/vendor/three/three.module.min.js?v=dev';
import {fixture} from '../research/iem-middle-lead-2026-10-25/audit.mjs';
import {baselineBuilder} from '../research/iem-terminal-cleanup-2026-10-26/check.mjs';
import {pairAudit,surfaceAudit} from '../research/iem-final-columns-2026-10-25/audit.mjs';
import {mainHarnessAsset} from '../dist/main-harness.mjs';
const changed=o=>o.name==='iem-harness-tie'||(o.name==='iem-harness-label'&&o.userData.connectionId==='iem-local-lead-8');
const fingerprint=root=>{
 const rows=[];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||changed(o))return;
  rows.push(JSON.stringify({name:o.name,matrix:o.matrixWorld.toArray(),vertices:[...o.geometry.attributes.position.array],indices:o.geometry.index?[...o.geometry.index.array]:null,color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));});
 return createHash('sha256').update(rows.sort().join('\n')).digest('hex');
};
test('Tag/wrap cleanup preserves all26 complete cables, every other fitting/material/pose and all325 pair measurements',async()=>{
 const builder=await baselineBuilder(),before=fixture(builder),after=fixture();
 assert.equal(fingerprint(after.parent),fingerprint(before.parent));
 assert.deepEqual(pairAudit(),pairAudit(builder));
});
test('Lead8 label is tangent to the actual cable surface, without penetration anywhere on the sampled cable',()=>{
 const{parent}=fixture(),wire=parent.getObjectsByProperty('name','iem-harness-cable').find(o=>o.userData.connectionId==='iem-local-lead-8');
 const label=parent.getObjectsByProperty('name','iem-harness-label').find(o=>o.userData.connectionId===wire.userData.connectionId),path=wire.geometry.parameters.path;
 label.geometry.computeBoundingBox();const box=label.geometry.boundingBox,inverse=label.matrix.clone().invert(),r=wire.geometry.parameters.radius;
 const gaps=path.getSpacedPoints(3000).map(p=>box.distanceToPoint(p.clone().applyMatrix4(inverse))-r);
 assert.ok(Math.min(...gaps)>=-1e-8);assert.ok(Math.min(...gaps)<1e-6,'Tag remains surface-attached');
 assert.ok(label.position.distanceTo(path.getPointAt(wire.userData.labelFraction))<.00600001);
});
test('Three terminal wraps have hollow cross sections and preserve the prior outer footprints',()=>{
 const{parent}=fixture(),pieces=parent.getObjectsByProperty('name','iem-harness-tie');assert.equal(pieces.length,12);
 for(let k=0;k<3;k++){
  const group=pieces.filter(o=>o.userData.terminalWrapIndex===k);assert.equal(group.length,4);
  const bounds=new T.Box3();for(const p of group){p.geometry.computeBoundingBox();bounds.union(p.geometry.boundingBox.clone().applyMatrix4(p.matrix));assert.equal(p.userData.flightMatingConfirmed,false);}
  const center=bounds.getCenter(new T.Vector3());
  assert.ok(bounds.getSize(new T.Vector3()).distanceTo(new T.Vector3(.016,.014,.012))<1e-8);
  for(const p of group)assert.ok(p.geometry.boundingBox.distanceToPoint(center.clone().applyMatrix4(p.matrix.clone().invert()))>.005,'No solid center');
 }
});
test('All26 swept wires clear the installed mesh set without a lead8 exception or enlarged contact limits',()=>{
 for(const row of surfaceAudit())assert.ok(row.minSurfaceGapM===null||row.minSurfaceGapM>-.0001,JSON.stringify(row));
});
test('The modeled terminal capacity mismatch remains explicit rather than treated as a literal26-to-one merge',()=>{
 const wires=fixture().parent.getObjectsByProperty('name','iem-harness-cable'),r=mainHarnessAsset.branches.find(b=>b.name==='iem').radiusM;
 const ratio=wires.reduce((sum,w)=>sum+w.geometry.parameters.radius**2,0)/r**2;
 assert.ok(Math.abs(ratio-6.5)<1e-10);assert.ok(2*r*Math.sqrt(ratio)>.045);
});
