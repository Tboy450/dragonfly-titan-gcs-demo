import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from '../dist/vendor/three/three.module.min.js?v=dev';
import {builders,buildFamily,installationAudit} from '../research/avionics-installation-2026-10-25/audit.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {installationFamilies,installationSources,installationLimits} from '../dist/avionics-installation.mjs';
const files={iem:'iem.mjs','power-units':'power-units.mjs','frontier-radio':'frontier-radio.mjs','nose-electronics':'nose-electronics.mjs',battery:'battery.mjs'};
const fingerprint=root=>{
 const rows=[];root.updateMatrixWorld(true);
 root.traverse(o=>{if(!o.isMesh||o.userData.installationExample)return;
 if(['iem-local-lead-5','iem-local-lead-6','iem-local-lead-7','iem-local-lead-8','iem-local-lead-9','iem-local-lead-10','iem-local-lead-11','iem-local-lead-12','iem-local-lead-13','iem-local-lead-14'].includes(o.userData.connectionId)&&['iem-harness-cable','iem-harness-label'].includes(o.name))return;
 rows.push(JSON.stringify({name:o.name,matrix:o.matrixWorld.toArray(),positions:[...o.geometry.attributes.position.array],
 indices:o.geometry.index?[...o.geometry.index.array]:null,color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));
 });return createHash('sha256').update(rows.sort().join('\n')).digest('hex');
};
for(const[id,builder]of Object.entries(builders))test(id+': pre-existing meshes stay exact except separately tested IEM route revisions',async()=>{
 let code=await readFile(new URL('../archive/avionics-installation-2026-10-25/'+files[id],import.meta.url),'utf8');
 code=code.replace('./vendor/three/three.module.min.js?v=dev',new URL('../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href);
 const module=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const before=buildFamily(module[builder.name]),after=buildFamily(builder);
 assert.equal(fingerprint(after.parent),fingerprint(before.parent));
});

test('Five-family register distinguishes eighteen support examples, unassigned electrical routes and mechanical tether',()=>{
 const report=installationAudit();assert.equal(report.families.length,5);
 assert.deepEqual(report.families.map(f=>f.supports.length),[10,2,3,0,3]);
 assert.equal(report.families.find(f=>f.id==='nose-electronics').rows.length,0);
 assert.equal(report.families.find(f=>f.id==='nose-electronics').additions.length,24);
 assert.ok(report.families.flatMap(f=>f.rows).every(r=>r.confidence==='EST'&&!r.flightMatingConfirmed));
 assert.equal(report.families.find(f=>f.id==='frontier-radio').rows.filter(r=>r.medium==='mechanical tether').length,1);
});

test('Every support has an anchored pad, a continuous post, and a cushion centered on its unchanged wire',()=>{
 for(const builder of Object.values(builders)){const{parent}=buildFamily(builder);
 parent.traverse(wire=>{for(const s of wire.userData.installationSupports??[]){
  const pad=parent.getObjectByName('install-'+s.id+'-pad'),post=parent.getObjectByName('install-'+s.id+'-post'),ring=parent.getObjectByName('install-'+s.id+'-cushion');
  const f=new T.Vector3(...s.foot),n=new T.Vector3(...s.normal),p=wire.geometry.parameters.path.getPointAt(s.fraction);
  assert.ok(pad.position.clone().addScaledVector(n,-.0006).distanceTo(f)<1e-12);
  assert.ok(ring.position.distanceTo(p)<1e-12);
  const direction=new T.Vector3(0,1,0).applyQuaternion(post.quaternion),half=post.geometry.parameters.height/2;
  const start=post.position.clone().addScaledVector(direction,-half),end=post.position.clone().addScaledVector(direction,half);
  assert.ok(start.distanceTo(f.clone().addScaledVector(n,.0012))<1e-12);
  assert.ok(Math.abs(end.distanceTo(p)-s.radiusM-.0006)<1e-12);
 }});
 }
});

test('New installation hardware follows independent mount/wire masks and focus targets are not nested',()=>{
 for(const[id,builder]of Object.entries(builders)){
  const{parent}=buildFamily(builder),mask=createInspectionVisibility({[id]:parent}),targets=inspectionSubassemblies(parent);
  for(const target of targets)for(let p=target.parent;p&&p!==parent;p=p.parent)assert.ok(!targets.includes(p),id+' nested target');
  for(const layer of ['mounts','harnesses']){
   const previous=new Map();mask.apply({hiddenPartLayers:{[id]:[layer]}},previous);
   parent.traverse(o=>{if(!o.userData.installationExample)return;
    const visible=()=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
    const isWire=o.name.endsWith('-lacing');
    assert.equal(visible(),layer==='mounts'?isWire:!isWire,id+' '+o.name);
   });
   for(const[o,v]of previous)o.visible=v;
  }
 }
});

test('Support posts clear existing connector bodies and other wire curves outside their own surface attachment',()=>{
 for(const[id,builder]of Object.entries(builders)){
  const{parent}=buildFamily(builder),wires=[],boxes=[];
  parent.traverse(o=>{if(!o.isMesh||o.userData.installationExample)return;
   if(o.geometry.parameters.path)wires.push(o);
   else if(o.geometry.type==='BoxGeometry')boxes.push({o,box:new T.Box3().setFromBufferAttribute(o.geometry.attributes.position),inverse:o.matrixWorld.clone().invert()});
  });
  for(const wire of wires)for(const s of wire.userData.installationSupports??[]){
   const post=parent.getObjectByName('install-'+s.id+'-post'),direction=new T.Vector3(0,1,0).applyQuaternion(post.quaternion),h=post.geometry.parameters.height;
   for(let i=4;i<=40;i++){
    const p=post.position.clone().addScaledVector(direction,h*(i/40-.5)).applyMatrix4(post.parent.matrixWorld);
    const foot=new T.Vector3(...s.foot).applyMatrix4(post.parent.matrixWorld);
    if(p.distanceTo(foot)<.003)continue; // bounded face attachment, not a whole-equipment exception
    for(const {o,box,inverse}of boxes)assert.ok(box.distanceToPoint(p.clone().applyMatrix4(inverse))>.0009,id+' '+s.id+' post vs '+o.name);
    for(const other of wires){if(other===wire)continue;
     const curve=other.geometry.parameters.path,r=other.geometry.parameters.radius;
     for(const q of curve.getSpacedPoints(160))assert.ok(p.distanceTo(q.applyMatrix4(other.matrixWorld))>r+.0009,id+' '+s.id+' post vs '+other.name+' '+(other.userData.connectionId??''));
    }
   }
  }
 }
});

test('Five-family UI records expose valid non-nested targets and leave flight interfaces explicitly open',()=>{
 assert.equal(installationFamilies.length,5);assert.ok(Object.isFrozen(installationFamilies));
 for(const row of installationFamilies){
  assert.ok(Object.isFrozen(row));assert.equal(row.confidence,'EST');assert.equal(row.flightMatingConfirmed,false);
  if(row.azimuth!==undefined){assert.ok(Number.isFinite(row.azimuth));assert.ok(Math.abs(row.elevation)<=1.35);}
  assert.ok(installationSources[row.source].url.startsWith('https://'));
  const{parent}=buildFamily(builders[row.inspect]);
  assert.ok(inspectionSubassemblies(parent).some(o=>o.name===row.subassembly),row.id);
 }
 assert.match(installationLimits.boundary,/No electrical/);
});

test('New clamp rings and lacing do not penetrate other existing wire curves',()=>{
 for(const[id,builder]of Object.entries(builders)){
  const{parent}=buildFamily(builder),wires=[],rings=[];
  parent.traverse(o=>{if(!o.isMesh)return;if(o.geometry.parameters.path)wires.push(o);
   if(o.userData.installationExample&&o.geometry.type==='TorusGeometry')rings.push(o);
  });
  for(const ring of rings){
   const box=new T.Box3().setFromObject(ring),vertices=ring.geometry.attributes.position;
   for(const wire of wires){if((wire.userData.connectionId??wire.name)===ring.userData.wireId)continue;
    const radius=wire.geometry.parameters.radius,points=wire.geometry.parameters.path.getSpacedPoints(160).map(p=>p.applyMatrix4(wire.matrixWorld));
    const near=points.filter(p=>box.distanceToPoint(p)<radius);if(!near.length)continue;
    for(let i=0;i<vertices.count;i++)for(const p of near){
     const v=new T.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(ring.matrixWorld);
     assert.ok(v.distanceTo(p)>radius-.00015,id+' '+ring.name+' vs '+(wire.userData.connectionId??wire.name));
    }
   }
  }
 }
});

test('Navigation retention heads sit on exposed pads without penetrating casing ribs or returns',()=>{
 const{parent}=buildFamily(builders['nose-electronics']),heads=[],boxes=[];
 parent.traverse(o=>{if(!o.isMesh)return;
  if(o.name.startsWith('install-')&&o.name.endsWith('-retention-head'))heads.push(o);
  if(!o.userData.installationExample&&o.geometry.type==='BoxGeometry')
   boxes.push({o,box:new T.Box3().setFromBufferAttribute(o.geometry.attributes.position),inverse:o.matrixWorld.clone().invert()});
 });
 assert.equal(heads.length,16);
 for(const head of heads){const vertices=head.geometry.attributes.position;
  for(const {o,box,inverse}of boxes)for(let i=0;i<vertices.count;i++){
   const p=new T.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(head.matrixWorld).applyMatrix4(inverse);
   if(box.distanceToPoint(p)>1e-7)continue;
   // A face contact is permitted; a vertex strictly inside an old box is not.
   const inset=box.clone().expandByScalar(-1e-7);
   assert.ok(!inset.containsPoint(p),head.name+' vs '+o.name);
  }
 }
});
