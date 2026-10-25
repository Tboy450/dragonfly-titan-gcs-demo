import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three/three.module.min.js?v=dev';
import {buildIem,iemServiceAsset as A} from '../dist/iem.mjs';
import {inspectionSubassemblies,selectInspectionSubassembly,inspectionSubassembly} from '../dist/vehicle-inspector.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const fixture=builder=>{const parent=new T.Group();const result=builder({parent,mesh});parent.updateMatrixWorld(true);return{parent,...result};};
const newIds=new Set(['iem-local-lead-3','iem-local-lead-4']);
const manifest=root=>{const rows=[];root.updateMatrixWorld(true);root.traverse(o=>{
 if(!o.isMesh||newIds.has(o.userData.connectionId)||o.userData.installationExample)return;
 if(['iem-local-lead-5','iem-local-lead-6','iem-local-lead-7','iem-local-lead-8','iem-local-lead-9','iem-local-lead-10','iem-local-lead-11'].includes(o.userData.connectionId)&&['iem-harness-cable','iem-harness-label'].includes(o.name))return;
 rows.push(JSON.stringify({name:o.name,id:o.userData.connectionId,matrix:o.matrixWorld.toArray(),
 vertices:[...o.geometry.attributes.position.array],indices:o.geometry.index?[...o.geometry.index.array]:null,
 color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));
});return rows.sort();};

test('Lower IEM pass preserves the complete upper pair and every unrelated mesh/material/installed pose',async()=>{
 let source=await readFile(new URL('../archive/iem-lower-pair-2026-10-24/iem.mjs',import.meta.url),'utf8');
 source=source.replace('./vendor/three/three.module.min.js?v=dev',new URL('../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href);
 const before=fixture((await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildIem),after=fixture(buildIem);
 assert.deepEqual(manifest(after.parent),manifest(before.parent));
 const wires=root=>{const map=new Map();root.traverse(o=>{if(o.name==='iem-harness-cable')map.set(o.userData.connectionId,o);});return map;};
 const old=wires(before.parent),current=wires(after.parent);
 for(const[id,wire]of current){const a=old.get(id).geometry.parameters.path,b=wire.geometry.parameters.path;
  assert.ok(a.getPoint(0).distanceTo(b.getPoint(0))<1e-12);assert.ok(a.getPoint(1).distanceTo(b.getPoint(1))<1e-12);
  assert.equal(wire.geometry.parameters.radius,old.get(id).geometry.parameters.radius);
  if(newIds.has(id))assert.ok(b.getLength()>b.getPoint(0).distanceTo(b.getPoint(1))*1.02,'bow retains local slack relative to a taut straight lead');
 }
});

test('Lower pair is a third independent focus with four ties and reversible wire/mount masks',()=>{
 const{parent,harness,mounts,lowerServicePair}=fixture(buildIem);parent.name='iem';
 assert.deepEqual(inspectionSubassemblies(parent).map(o=>o.name),['iem-connectors','iem-upper-service-pair','iem-lower-service-pair','iem-second-column','iem-third-upper-pair','iem-third-lower-pair']);
 assert.equal(lowerServicePair.getObjectsByProperty('name','iem-service-lacing').length,4);
 const state={inspector:{focusPart:'iem',followSampling:false}};
 selectInspectionSubassembly(state,parent,'iem-lower-service-pair');
 assert.equal(inspectionSubassembly(parent,state.inspector),lowerServicePair);
 const mask=createInspectionVisibility({iem:parent});
 for(const layer of ['harnesses','mounts']){const previous=new Map();mask.apply({hiddenPartLayers:{iem:[layer]}},previous);
  assert.equal(harness.visible,layer!=='harnesses');assert.equal(mounts.visible,layer!=='mounts');
  for(const[o,v]of previous)o.visible=v;
 }
 assert.equal(lowerServicePair.userData.flightMatingConfirmed,false);
 assert.deepEqual(A.leadIndices,[0,1,2,3]);
});

test('Lower labels actually meet their own wires; support fixtures clear connector hardware',()=>{
 const{parent,mounts,connectors}=fixture(buildIem),found=[];
 parent.traverse(o=>{if(o.isMesh&&newIds.has(o.userData.connectionId))found.push(o);});
 for(const id of newIds){
  const wire=found.find(o=>o.name==='iem-harness-cable'&&o.userData.connectionId===id);
  const label=found.find(o=>o.name==='iem-harness-label'&&o.userData.connectionId===id);
  const point=wire.geometry.parameters.path.getPointAt(wire.userData.labelFraction).applyMatrix4(wire.matrixWorld);
  assert.ok(new T.Box3().setFromObject(label).distanceToPoint(point)<=A.radiusM,'label is attached, not floating');
 }
 const hardware=[];connectors.traverse(o=>{if(o.isMesh)hardware.push(o);});
 parent.traverse(o=>{if(o.name==='iem-harness-backshell')hardware.push(o);});
 for(const support of mounts.children.filter(o=>newIds.has(o.userData.connectionId)&&o.name!=='iem-service-clip'))
  for(const connector of hardware){
   const a=new T.Box3().setFromObject(support),b=new T.Box3().setFromObject(connector);
   assert.ok(!a.intersectsBox(b),support.userData.connectionId+' support vs '+connector.name);
  }
});
