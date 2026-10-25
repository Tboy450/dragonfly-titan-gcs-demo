import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three/three.module.min.js?v=dev';
import {buildIem,iemServiceAsset as A} from '../dist/iem.mjs';
import {createInspectionVisibility,applyInspectionAccessPreset} from '../dist/inspection-visibility.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
import {iemLeadAudit} from '../research/iem-service-bends-2026-10-24/audit.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const fixture=(builder=buildIem)=>{const parent=new T.Group();const r=builder({parent,mesh});parent.updateMatrixWorld(true);return{parent,...r};};
async function oldBuilder(){let source=await readFile(new URL('../archive/iem-service-bends-2026-10-24/iem.mjs',import.meta.url),'utf8');source=source.replace('./vendor/three/three.module.min.js?v=dev',new URL('../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href);return(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildIem;}
const leads=root=>{const rows=[];root.traverse(o=>{if(o.name==='iem-harness-cable')rows.push(o);});return rows;};
const manifest=(root,exclude)=>{const rows=[];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||exclude.has(o)||o.name.startsWith('iem-service-')||o.userData.installationExample)return;rows.push(JSON.stringify({name:o.name,matrix:o.matrixWorld.toArray(),vertices:[...o.geometry.attributes.position.array],indices:o.geometry.index?[...o.geometry.index.array]:null,color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));});return rows.sort();};

test('IEM service passes preserve unrelated mesh/material/pose and all26 original lead endpoints',async()=>{
 const before=fixture(await oldBuilder()),after=fixture(),old=leads(before.parent),current=leads(after.parent);
 assert.equal(current.length,26);assert.equal(old.length,26);
 const labels=root=>{const found=[];root.traverse(o=>{if(o.name==='iem-harness-label')found.push(o);});return found.slice(0,11);};
 assert.deepEqual(manifest(after.parent,new Set([...current.slice(0,11),...labels(after.parent)])),manifest(before.parent,new Set([...old.slice(0,11),...labels(before.parent)])));
 for(let i=0;i<26;i++){const a=old[i].geometry.parameters.path,b=current[i].geometry.parameters.path;
  assert.ok(a.getPoint(0).distanceTo(b.getPoint(0))<1e-12);assert.ok(a.getPoint(1).distanceTo(b.getPoint(1))<1e-12);
  assert.equal(current[i].geometry.parameters.radius,old[i].geometry.parameters.radius);
  if(i<2)assert.ok(b.getLength()>a.getLength(),'service bow adds local slack');
 }
 const report=iemLeadAudit();assert.equal(report.rows.length,26);assert.equal(report.rows.filter(r=>r.servicePair).length,4);
 assert.ok(report.rows.every(r=>r.confidence==='EST'&&r.flightMatingConfirmed===false));
});

test('IEM connector face and upper pair are non-nested focus targets with reversible masks',()=>{
 const{parent,assembly,connectors,harness,mounts,servicePair}=fixture();
 assert.deepEqual(inspectionSubassemblies(parent).map(o=>o.name),['iem-connectors','iem-upper-service-pair','iem-lower-service-pair','iem-second-column','iem-third-upper-pair','iem-third-lower-pair']);
 const mask=createInspectionVisibility({iem:parent}),matrix=assembly.matrixWorld.clone();
 for(const layer of ['interfaces','harnesses','mounts']){const previous=new Map();mask.apply({hiddenPartLayers:{iem:[layer]}},previous);
  assert.equal(connectors.visible,layer!=='interfaces');assert.equal(harness.visible,layer!=='harnesses');assert.equal(mounts.visible,layer!=='mounts');
  for(const[o,v]of previous)o.visible=v;
 }
 assert.equal(servicePair.getObjectsByProperty('name','iem-service-lacing').length,4);
 const i={};applyInspectionAccessPreset(i,'open');mask.apply(i,new Map());assert.equal(harness.visible,true);assert.deepEqual(assembly.matrixWorld,matrix);
});

test('IEM estimated supports meet the existing face and the service-wire underside',()=>{
 const{parent,mounts}=fixture();const wires=leads(parent).slice(0,4);
 wires.forEach((wire,i)=>{
  const p=wire.geometry.parameters.path.getPointAt(A.supportFractions[i]),id=wire.userData.connectionId;
  const foot=mounts.children.find(o=>o.name==='iem-service-support-foot'&&o.userData.connectionId===id);
  const stand=mounts.children.find(o=>o.name==='iem-service-support-stand'&&o.userData.connectionId===id);
  assert.ok(Math.abs(foot.position.z+foot.geometry.parameters.depth/2+.114)<1e-12);
  assert.ok(Math.abs(stand.position.y+stand.geometry.parameters.height/2-(p.y-A.radiusM))<1e-12);
  assert.ok(Math.abs(stand.position.z-stand.geometry.parameters.depth/2-p.z)<1e-12);
  assert.ok(new T.Box3().setFromObject(foot).expandByScalar(1e-8).intersectsBox(new T.Box3().setFromObject(stand)), 'Float32 mesh contact within 10 nm');
 });
});

test('New IEM bows clear case/connector hardware and each other outside the retained gathering ends',()=>{
 const{assembly,parent}=fixture(),wires=leads(parent).slice(0,4),obstacles=[];
 assembly.updateMatrixWorld(true);
 assembly.traverse(o=>{if(!o.isMesh||o.name==='iem-harness-cable')return;
  const p=o.geometry.attributes.position,index=o.geometry.index,triangles=[],transform=o.matrixWorld.clone().premultiply(assembly.matrixWorld.clone().invert());
  const vertex=n=>new T.Vector3().fromBufferAttribute(p,index?index.getX(n):n).applyMatrix4(transform);
  for(let n=0;n<(index?index.count:p.count);n+=3)triangles.push(new T.Triangle(vertex(n),vertex(n+1),vertex(n+2)));
  const box=new T.Box3();for(const triangle of triangles)box.expandByPoint(triangle.a).expandByPoint(triangle.b).expandByPoint(triangle.c);
  obstacles.push({o,triangles,box});
 });
 const nearest=new T.Vector3();
 for(const wire of wires){const path=wire.geometry.parameters.path;
  for(const point of path.getSpacedPoints(420))for(const{o,box,triangles}of obstacles){
   if(box.distanceToPoint(point)>A.radiusM)continue;
   if(o.name.startsWith('iem-service-')&&o.userData.connectionId===wire.userData.connectionId)continue;
   if(o.name==='iem-harness-backshell'&&o.userData.connectionId===wire.userData.connectionId&&point.distanceTo(path.getPoint(0))<.014)continue;
   if(o.name==='iem-harness-label'&&o.userData.connectionId===wire.userData.connectionId&&point.distanceTo(path.getPointAt(wire.userData.labelFraction??.12))<.015)continue;
   if(o.name==='iem-harness-tie'&&point.x<-.135&&point.y<.025&&point.distanceTo(path.getPoint(1))<.016)continue;
   for(const triangle of triangles){triangle.closestPointToPoint(point,nearest);assert.ok(point.distanceTo(nearest)>A.radiusM-.0001,`${wire.userData.connectionId} vs ${o.name} (${o.userData.connectionId || 'case'}) at ${point.toArray()}`);}
  }
 }
 for(let i=0;i<wires.length;i++)for(let j=i+1;j<wires.length;j++){
 const a=wires[i].geometry.parameters.path,b=wires[j].geometry.parameters.path;
 for(const p of a.getSpacedPoints(400))for(const q of b.getSpacedPoints(400)){
  if(p.x<-.135&&q.x<-.135&&p.y<.025&&q.y<.025)continue;
  assert.ok(p.distanceTo(q)>2*A.radiusM-.0001,`new pair outside estimated shared gathering zone: ${p.toArray()} / ${q.toArray()}`);
 }
 }
});
