import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildNoseBulkhead, noseBulkheadAsset as A } from "../dist/nose-bulkhead.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildNoseSensors } from "../dist/nose-sensors.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildBattery } from "../dist/battery.mjs";
import { buildRotorDriveElectronics } from "../dist/rotor-drive-electronics.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildTwta } from "../dist/twta.mjs";
import { buildHgaGimbal } from "../dist/hga-gimbal.mjs";
import { buildAftBulkhead } from "../dist/aft-bulkhead.mjs";
import { buildFans, buildWarmDuct, buildTrimDevice } from "../dist/thermal-loop.mjs";
import { buildSampleLines, buildBlowers } from "../dist/draco-plumbing.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildDrill } from "../dist/drills.mjs";
import { createInspectionVisibility } from "../dist/inspection-visibility.mjs";
const mesh = (g,m,p,parent) => { const o=new THREE.Mesh(g,m); o.position.fromArray(p); parent.add(o); return o; };
const fixture = () => { const parent=new THREE.Group(); return {parent,...buildNoseBulkhead({parent,mesh})}; };
const meshes = root => { const out=[]; root.updateMatrixWorld(true); root.traverse(o=>{if(o.isMesh)out.push(o);}); return out; };

test("Provisional nose panel preserves the original envelope and labels its evidence limits", () => {
  const {parent,assembly}=fixture();
  assert.deepEqual(assembly.position.toArray(),[0,-0.13,-1.56]);
  assert.equal(A.widthM,0.7); assert.equal(A.heightM,0.4); assert.equal(A.depthM,0.02);
  assert.equal(parent.userData.partialRebuild,true);
  assert.equal(parent.userData.dimensionConfidence,"EST");
  assert.match(parent.userData.appearanceEvidence,/complete nose face unresolved/);
  assert.ok(meshes(parent).every(o=>o.material.isMeshStandardMaterial));
  const b=new THREE.Box3().setFromObject(parent);
  assert.ok(b.min.x>=-0.351&&b.max.x<=0.351&&b.min.y>=-0.331&&b.max.y<=0.071);
  assert.ok(b.min.z>=-1.573&&b.max.z<=-1.539,"only mounts extend aft of original panel");
});

test("Face, perimeter and mounts are independently removable; label sits on the upper rail", () => {
  const {parent,frame,face,mounts}=fixture(), visibility=createInspectionVisibility({"nose-bulkhead":parent});
  for(const id of ["equipment-casings","equipment-covers","mounts"])assert.ok(visibility.available(id,"nose-bulkhead"));
  const previous=new Map(); visibility.apply({hiddenPartLayers:{"nose-bulkhead":["equipment-covers"]}},previous);
  assert.equal(face.visible,false);assert.equal(frame.visible,true);assert.equal(mounts.visible,true);
  for(const [o,v]of previous)o.visible=v;
  assert.equal(face.visible,true);
  const p=parent.userData.labelAnchor;
  assert.deepEqual(p.toArray(),A.labelAnchor);
  assert.ok(p.y>0.05&&p.y<0.07&&p.z< -1.56);
});

test("Panel is one thin estimated face, not invented apertures, honeycomb cells or electronics",()=>{
  const {parent}=fixture(), list=meshes(parent);
  assert.equal(list.filter(o=>o.name==="nose-bulkhead-face-sheet").length,1);
  const sheet=list.find(o=>o.name==="nose-bulkhead-face-sheet");
  assert.equal(sheet.geometry.parameters.options.depth,0.003);
  assert.equal(sheet.geometry.parameters.shapes.holes.length,0);
  assert.ok(!list.some(o=>/honeycomb|circuit|optical|duct|core-cell/.test(o.name)));
});

test("Nose panel clears individually rebuilt hardware without moving it",()=>{
  const {parent}=fixture(), panel=new THREE.Box3().setFromObject(parent), hits=[];
  const builders=[buildNoseCameras,buildNoseSensors,buildSampleCarousel,buildWonderwall,
    buildDramsAssembly,buildBattery,buildRotorDriveElectronics,buildPowerUnits,buildIem,
    buildFrontierRadio,buildTwta,buildHgaGimbal,buildAftBulkhead,buildFans,buildWarmDuct,
    buildTrimDevice,buildSampleLines,buildBlowers,buildSideCameras,
    kit => { for (const side of [-1,1]) buildDrill({...kit,side}); }];
  for(const build of builders){
    const root=new THREE.Group();build({parent:root,mesh,head:new THREE.Group()});
    for(const o of meshes(root)){
      // Do not let a curved cable's whole AABB falsely fill the space between its ends.
      const path=o.geometry.parameters?.path,r=o.geometry.parameters?.radius;
      const boxes=path?Array.from({length:201},(_,i)=>new THREE.Box3().setFromCenterAndSize(
        path.getPoint(i/200).applyMatrix4(o.matrixWorld),new THREE.Vector3().setScalar(2*r))):[new THREE.Box3().setFromObject(o)];
      if(boxes.some(b=>panel.intersectsBox(b)))hits.push(`${build.name}/${o.name}`);
    }
  }
  assert.deepEqual(hits,[]);
});

test("Provisional panel does not increment the completed-part count",()=>{
  const html=readFileSync(new URL("../dist/index.html",import.meta.url),"utf8");
  assert.doesNotMatch(html,/data-assumption="nose-bulkhead"/);
  assert.match(html,/data-provisional="nose-bulkhead"/);
  const todo=readFileSync(new URL("../INTERIOR-REALISM-TODO.md",import.meta.url),"utf8");
  assert.match(todo,/- \[ \] \*\*03 Nose bulkhead/);
});
