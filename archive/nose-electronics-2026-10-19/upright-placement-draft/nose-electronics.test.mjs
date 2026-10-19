import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as T from "../dist/vendor/three/three.module.min.js";
import {buildNoseElectronics,noseElectronicsAsset as A} from "../dist/nose-electronics.mjs";
import {buildNoseBulkhead} from "../dist/nose-bulkhead.mjs";
import {buildNoseCameras} from "../dist/nose-cameras.mjs";
import {buildNoseSensors} from "../dist/nose-sensors.mjs";
import {buildSampleCarousel} from "../dist/sample-carousel.mjs";
import {buildWonderwall} from "../dist/wonderwall.mjs";
import {buildDramsAssembly} from "../dist/drams-assembly.mjs";
import {buildBattery} from "../dist/battery.mjs";
import {buildRotorDriveElectronics} from "../dist/rotor-drive-electronics.mjs";
import {buildPowerUnits} from "../dist/power-units.mjs";
import {buildIem} from "../dist/iem.mjs";
import {buildFrontierRadio} from "../dist/frontier-radio.mjs";
import {buildTwta} from "../dist/twta.mjs";
import {buildHgaGimbal} from "../dist/hga-gimbal.mjs";
import {buildAftBulkhead} from "../dist/aft-bulkhead.mjs";
import {buildFans,buildWarmDuct,buildTrimDevice} from "../dist/thermal-loop.mjs";
import {buildSampleLines,buildBlowers} from "../dist/draco-plumbing.mjs";
import {buildDrill} from "../dist/drills.mjs";
import {buildSideCameras} from "../dist/side-cameras.mjs";
import {createInspectionVisibility} from "../dist/inspection-visibility.mjs";
import {inspectionSubassemblies,createInspector,selectInspectionSubassembly} from "../dist/vehicle-inspector.mjs";
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const fixture=()=>{const parent=new T.Group();parent.name="nose-electronics";const r=buildNoseElectronics({parent,mesh});parent.updateMatrixWorld(true);return{parent,...r};};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ~= ${b}`);
const pieces=group=>{
 const result=[];group.updateMatrixWorld(true);group.traverse(o=>{
  if(!o.isMesh)return;
  const path=o.geometry.parameters?.path,r=o.geometry.parameters?.radius;
  if(path)for(let i=0;i<=200;i++)result.push([o.name,new T.Box3().setFromCenterAndSize(path.getPoint(i/200).applyMatrix4(o.matrixWorld),new T.Vector3().setScalar(r*2))]);
  else result.push([o.name,new T.Box3().setFromObject(o)]);
 });return result;
};

test("Ocellus boxes retain the published 2023 design dimensions, including estimated mounts",()=>{
 const {parent,units}=fixture();assert.equal(parent.userData.partialRebuild,true);
 assert.match(parent.userData.dimensionConfidence,/PUB-2023-design/);
 assert.match(parent.userData.appearanceEvidence,/not hardware-photo matched/);
 assert.deepEqual(A.units.map(u=>u.dimensions),[[.2419,.1204,.1854],[.234,.127,.232]]);
 for(const u of units){
  const frame=u.group.matrixWorld.clone().invert(),b=new T.Box3();
  u.group.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).applyMatrix4(frame));}});
  const s=b.getSize(new T.Vector3());u.spec.dimensions.forEach((v,i)=>near(s.getComponent(i),v));near(b.min.y,0);
  const installed=new T.Box3().setFromObject(u.group);near(installed.min.y,A.floorY);
  assert.ok(installed.min.x>-.36&&installed.max.x<.36&&installed.min.z> -1.54&&installed.max.y<-.04);
 }
});

test("Two IMUs remain unchanged unresolved cubes, not guessed commercial hardware",()=>{
 const {imus}=fixture();assert.equal(imus.length,2);
 imus.forEach((g,i)=>{
  assert.equal(g.userData.unresolvedHardware,true);
  assert.match(g.userData.inspectionLabel,/unresolved placeholder/);
  assert.deepEqual(g.children[0].position.toArray(),[[.25,-.28,-1.42],[.25,-.28,-1.28]][i]);
  assert.deepEqual(new T.Box3().setFromObject(g).getSize(new T.Vector3()).toArray().map(x=>Number(x.toFixed(5))),[.09,.09,.09]);
 });
});

test("Part 05 exposes independent MEB/FEB/IMU focus, masks and stable anchors",()=>{
 const {parent,units}=fixture(),children=inspectionSubassemblies(parent);
 assert.deepEqual(children.map(g=>g.name),["ocellus-meb","ocellus-feb","imu-a-placeholder","imu-b-placeholder"]);
 const state={inspector:createInspector(),selectedPart:null};state.inspector.focusPart="nose-electronics";
 selectInspectionSubassembly(state,parent,"ocellus-feb");assert.equal(state.inspector.subassembly,"ocellus-feb");
 const visibility=createInspectionVisibility({"nose-electronics":parent}),previous=new Map();
 visibility.apply({hiddenPartLayers:{"nose-electronics":["equipment-covers"]}},previous);
 for(const u of units){assert.equal(u.cover.visible,false);assert.equal(u.casing.visible,true);assert.equal(u.mounts.visible,true);}
 for(const [o,v]of previous)o.visible=v;
 for(const u of units){assert.equal(u.cover.visible,true);assert.ok(u.group.userData.labelAnchor.y>-.17);}
});

test("Dimension-study enclosures do not invent optics, circuit boards, pinouts or harnesses",()=>{
 const {units}=fixture();
 for(const u of units){
  const names=pieces(u.group).map(([n])=>n);
  assert.ok(!names.some(n=>/laser|mirror|pcb|circuit|connector|pinout|cable/.test(n)));
  assert.equal(u.cover.getObjectByName(`${u.group.name}-lid`).geometry.parameters.height,.002);
 }
});

test("New lidar envelopes clear each other, the retained IMUs and the rebuilt neighbor set",()=>{
 const {units,imus}=fixture(),groups=[...units.map(u=>u.group),...imus];
 for(let a=0;a<groups.length;a++)for(let b=a+1;b<groups.length;b++){
  const other=new T.Box3().setFromObject(groups[b]);assert.ok(!new T.Box3().setFromObject(groups[a]).intersectsBox(other),`${groups[a].name} vs ${groups[b].name}`);
 }
 const builders=[buildNoseBulkhead,buildNoseCameras,buildNoseSensors,buildSampleCarousel,buildWonderwall,buildDramsAssembly,
  buildBattery,buildRotorDriveElectronics,buildPowerUnits,buildIem,buildFrontierRadio,buildTwta,buildHgaGimbal,
  buildAftBulkhead,buildFans,buildWarmDuct,buildTrimDevice,buildSampleLines,buildBlowers,buildSideCameras,
  kit=>{for(const side of [-1,1])buildDrill({...kit,side});}];
 for(const build of builders){const root=new T.Group();build({parent:root,mesh});const others=pieces(root);
  for(const u of units){const b=new T.Box3().setFromObject(u.group);const hit=others.find(([,p])=>b.intersectsBox(p));assert.ok(!hit,`${u.group.name} vs ${build.name}/${hit?.[0]}`);}
 }
 // The old IMUs' known floor/duct issues remain research debt; this test does not
 // distort either new lidar box to pretend those untouched placeholders are complete.
});

test("Part 05 remains unchecked with explicit provisional app assumptions",()=>{
 const html=readFileSync(new URL("../dist/index.html",import.meta.url),"utf8"),todo=readFileSync(new URL("../INTERIOR-REALISM-TODO.md",import.meta.url),"utf8");
 assert.match(html,/19 of the 24 interior parts/);assert.match(html,/data-provisional="nose-electronics"/);
 assert.match(todo,/- \[ \] \*\*05 IMU\/lidar electronics/);
});
