import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as T from "../dist/vendor/three/three.module.min.js?v=dev";
import { buildSampleCarousel, carouselAsset } from "../dist/sample-carousel.mjs";
import { carouselDriveAsset as A } from "../dist/carousel-warm-drives.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildNoseElectronics } from "../dist/nose-electronics.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildSampleLines } from "../dist/draco-plumbing.mjs";
import { createInspectionVisibility, applyInspectionAccessPreset } from "../dist/inspection-visibility.mjs";
import { inspectionSubassemblies } from "../dist/vehicle-inspector.mjs";
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const fixture=(builder=buildSampleCarousel)=>{const parent=new T.Group();const result=builder({parent,mesh});parent.updateMatrixWorld(true);return{parent,...result};};
const inDrives=o=>{for(let p=o;p;p=p.parent)if(p.name==='carousel-warm-drives')return true;return false;};
function manifest(root){const rows=[];root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||inDrives(o))return;rows.push(JSON.stringify({name:o.name,matrix:o.matrixWorld.toArray(),position:[...o.geometry.attributes.position.array],index:o.geometry.index?[...o.geometry.index.array]:null,instances:o.instanceMatrix?[...o.instanceMatrix.array]:null,color:o.material.color?.getHex(),metalness:o.material.metalness,roughness:o.material.roughness}));});return rows.sort();}

test('Warm-drive pass preserves every cold carousel mesh, material, instance and installed transform',async()=>{
 let source=await readFile(new URL('../archive/carousel-warm-drives-2026-10-24/sample-carousel.mjs',import.meta.url),'utf8');
 source=source.replace('./vendor/three/three.module.min.js?v=dev',new URL('../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href);
 const old=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 assert.deepEqual(manifest(fixture().parent),manifest(fixture(old.buildSampleCarousel).parent));
 assert.deepEqual(carouselAsset.position,old.carouselAsset.position);assert.equal(carouselAsset.diameterM,old.carouselAsset.diameterM);
});

test('Three warm drives keep old nominal can dimensions and positions with explicit approximation limits',()=>{
 const {driveUnits,drives}=fixture();assert.equal(driveUnits.length,3);
 assert.equal(drives.userData.thermalZone,'equipment-bay');assert.equal(drives.userData.flightConfigurationConfirmed,false);
 driveUnits.forEach(({unit,casing,covers},i)=>{
  assert.deepEqual(unit.position.toArray(),[A.centers[i][0],0,A.centers[i][1]]);
  assert.equal(unit.userData.unmodeledInternals,true);assert.match(unit.userData.inspectionLabel,/estimate/);
  const can=casing.getObjectByName(`${unit.name}-can`);assert.equal(can.geometry.parameters.radiusTop,A.casingRadiusM);assert.equal(can.geometry.parameters.height,A.casingHeightM);
  assert.equal(can.material.transparent,false);assert.ok(covers.children.length);
 });
 const b=new T.Box3().setFromObject(drives);assert.ok(b.min.y>-.10&&b.max.y<.074,'below baseplate and above bay equipment');
});

test('Drive focus targets and casing, cover, mounts, interface and wire masks are independent and reversible',()=>{
 const {parent,driveUnits,carrier}=fixture();const targets=inspectionSubassemblies(parent);
 assert.deepEqual(targets.filter(o=>/^carousel-drive-\d$/.test(o.name)).map(o=>o.name),driveUnits.map(u=>u.unit.name));
 for(const {unit} of driveUnits)for(let p=unit.parent;p;p=p.parent)assert.equal(p.userData.inspectionLabel,undefined);
 const masks=createInspectionVisibility({'sample-carousel':parent});
 for(const [layer,key]of [['equipment-casings','casing'],['equipment-covers','covers'],['mounts','mounts'],['interfaces','interfaces'],['harnesses','harness']]){
  const previous=new Map();masks.apply({hiddenPartLayers:{'sample-carousel':[layer]}},previous);
  for(const u of driveUnits)for(const k of ['casing','covers','mounts','interfaces','harness'])assert.equal(u[k].visible,k!==key);
  for(const [o,v]of previous)o.visible=v;
 }
 const matrices=driveUnits.map(u=>u.unit.matrixWorld.clone());carrier.rotation.y=2;parent.updateMatrixWorld(true);
 driveUnits.forEach((u,i)=>assert.deepEqual(u.unit.matrixWorld,matrices[i]));
 const inspector={};applyInspectionAccessPreset(inspector,'open');masks.apply(inspector,new Map());
 driveUnits.forEach(u=>assert.equal(u.harness.visible,true));
});

test('Local lead examples have a socket contact, retained scale and explicitly unresolved remote ends',()=>{
 const {driveUnits}=fixture();
 for(const {unit,cable,mounts}of driveUnits){
  const path=cable.geometry.parameters.path;
  assert.equal(cable.geometry.parameters.radius,A.cableRadiusM);assert.equal(cable.userData.flightMatingConfirmed,false);assert.equal(cable.userData.remoteEndUnmodeled,true);
  assert.ok(path.getPoint(0).distanceTo(new T.Vector3(...A.leadPoints[0]))<1e-12);
  assert.ok(path.getPoint(1).distanceTo(new T.Vector3(...A.leadPoints.at(-1)))<1e-12);
  const socket=unit.getObjectByName(`${unit.name}-socket-example`);assert.ok(Math.abs(socket.position.z+socket.geometry.parameters.height/2-path.getPoint(0).z)<1e-10);
  assert.equal(unit.getObjectsByProperty('name',`${unit.name}-lacing-example`).length,2);
  const foot=mounts.getObjectByName(`${unit.name}-support-foot`),p=path.getPointAt(A.clipFraction);
  assert.ok(Math.abs(foot.position.y+foot.geometry.parameters.height/2+.0065)<1e-10,'support touches baseplate underside');
  assert.ok(Math.abs(foot.position.y-foot.geometry.parameters.height/2-p.y)<1e-10);
  assert.ok(Math.hypot(unit.position.x,unit.position.z)+p.z+.002<.188,'support below plate footprint');
 }
});

test('New local wires clear actual carousel and rebuilt neighbor surfaces apart from named socket contacts',()=>{
 const {parent,driveUnits}=fixture(),roots=[parent,...[buildDramsAssembly,buildWonderwall,buildNoseElectronics,buildNoseCameras,buildSampleLines].map(b=>fixture(b).parent)];
 const obstacles=[];
 for(const root of roots)root.traverse(o=>{
  if(!o.isMesh||/-local-lead|-lacing-example|-clip-example|-support-foot/.test(o.name))return;
  const p=o.geometry.attributes.position,index=o.geometry.index,triangles=[];const vertex=n=>new T.Vector3().fromBufferAttribute(p,index?index.getX(n):n).applyMatrix4(o.matrixWorld);
  for(let i=0;i<(index?index.count:p.count);i+=3)triangles.push(new T.Triangle(vertex(i),vertex(i+1),vertex(i+2)));
  obstacles.push({o,box:new T.Box3().setFromObject(o),triangles});
 });
 const nearest=new T.Vector3();
 for(const {unit,cable}of driveUnits)for(const local of cable.geometry.parameters.path.getSpacedPoints(300)){
  const point=local.clone().applyMatrix4(cable.matrixWorld);
  for(const {o,box,triangles}of obstacles){
   if(box.distanceToPoint(point)>A.cableRadiusM)continue;
   if(o.name===`${unit.name}-socket-example`&&local.distanceTo(new T.Vector3(...A.leadPoints[0]))<.003)continue;
   for(const triangle of triangles){triangle.closestPointToPoint(point,nearest);assert.ok(point.distanceTo(nearest)>A.cableRadiusM-.0001,`${unit.name} cable vs ${o.name} at ${point.toArray()}`);}
  }
 }
});
