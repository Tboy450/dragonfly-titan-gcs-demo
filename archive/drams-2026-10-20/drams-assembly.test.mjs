import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildDramsAssembly, dramsAsset } from "../dist/drams-assembly.mjs";
import { buildWonderwall, wonderwallAsset } from "../dist/wonderwall.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
function mesh(geometry,material,position,parent){
  const p=new THREE.Mesh(geometry,material);p.position.fromArray(position);parent.add(p);return p;
}
function fixture(){const parent=new THREE.Group();return {parent,...buildDramsAssembly({parent,mesh})};}

test("DraMS has enclosed cases and independently removable service covers",()=>{
  const {parent,assembly,cases,covers,frame}=fixture();
  assert.equal(parent.userData.dimensionConfidence,"EST");
  assert.equal(parent.userData.assetRevision,dramsAsset.revision);
  assert.equal(cases.userData.inspectionLayer,"equipment-casings");
  assert.equal(covers.userData.inspectionLayer,"equipment-covers");
  for(const name of ["electronics","laser-enclosure","gc-enclosure"]){
    assert.ok(cases.getObjectByName(`drams-${name}-floor`));
    assert.ok(covers.getObjectByName(`drams-${name}-lid`));
  }
  const pose=assembly.position.clone();covers.visible=false;
  assert.equal(cases.visible,true);assert.equal(frame.visible,true);assert.deepEqual(assembly.position,pose);
});
test("DraMS fits the attic and clears both updated neighbors apart from its designed aperture route",()=>{
  const {parent,assembly,interfaces}=fixture();
  const wall=new THREE.Group(),carousel=new THREE.Group();
  buildWonderwall({parent:wall,mesh});buildSampleCarousel({parent:carousel,mesh});
  const b=new THREE.Box3().setFromObject(parent),w=new THREE.Box3().setFromObject(wall),c=new THREE.Box3().setFromObject(carousel);
  assert.ok(b.min.x>0.07&&b.max.x<0.36&&b.min.y>0.075&&b.max.y<0.46);
  assert.ok(b.min.z>-1.55&&b.max.z<-0.95);
  assert.equal(b.intersectsBox(c),false,"carousel and DraMS do not overlap");
  for(const g of assembly.children)if(g!==interfaces){
    const p=new THREE.Box3().setFromObject(g);
    assert.equal(p.intersectsBox(w),false,`${g.name} clears the updated Wonderwall`);
    const expected=dramsAsset.bodyBounds;
    for(const [i,axis] of ["x","y","z"].entries())assert.ok(p.min[axis]>=expected.min[i]&&p.max[axis]<=expected.max[i],g.name);
  }
  const [x,y,z]=dramsAsset.interfaceCenter;
  assert.equal(y,wonderwallAsset.position[1]+wonderwallAsset.aperture[1]);
  assert.equal(z,wonderwallAsset.position[2]+wonderwallAsset.aperture[0]);
  for(const p of interfaces.children){
    assert.ok(Math.abs(p.position.y-y)<1e-10&&Math.abs(p.position.z-z)<1e-10);
    assert.ok(p.geometry.parameters.radiusTop<wonderwallAsset.aperture[2]-0.005,"coaxial fitting clears the real opening");
  }
  const neck=interfaces.getObjectByName("drams-interface-neck");
  assert.ok(neck.position.x-neck.geometry.parameters.height/2<x-wonderwallAsset.coreThicknessM/2);
  assert.ok(neck.position.x+neck.geometry.parameters.height/2>x+wonderwallAsset.coreThicknessM/2);
});
test("Analysis marker anchor is on the replacement analyzer, not the archived blocks",()=>{
  const {assembly}=fixture();
  const analyzer=assembly.getObjectByName("drams-analyzer-housing");
  assert.equal(dramsAsset.analysisAnchor[1],analyzer.position.y);
  assert.equal(dramsAsset.analysisAnchor[2],analyzer.position.z);
  assert.ok(dramsAsset.analysisAnchor[0]>analyzer.position.x);
});
