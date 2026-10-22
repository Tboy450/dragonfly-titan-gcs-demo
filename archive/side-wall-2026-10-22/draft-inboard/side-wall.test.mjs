import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../dist/vendor/three/three.module.min.js";
import { buildSideWall, sideWallAsset as A } from "../dist/side-wall.mjs";
import { createInspectionVisibility } from "../dist/inspection-visibility.mjs";
import { inspectionSubassemblies } from "../dist/vehicle-inspector.mjs";

const mesh = (g,m,p,parent) => { const o=new T.Mesh(g,m); o.position.fromArray(p); parent.add(o); return o; };
const build = () => { const parent = new T.Group(); const parts=buildSideWall({parent,mesh}); parent.updateMatrixWorld(true); return {parent,...parts}; };
test("Two actual aluminum faces use the published0.01-inch thickness", () => {
  const {outer,inner,parent}=build();
  assert.equal(A.faceM,.01*.0254);
  for (const g of [outer,inner]) {
    const face=g.children.find(o=>o.name.includes('aluminum-face'));
    const b=new T.Box3().setFromObject(face);
    assert.ok(Math.abs(b.max.x-b.min.x-A.faceM)<1e-7);
    assert.ok(Math.abs(b.min.z-A.frontZ)<1e-6 && Math.abs(b.max.z-A.aftZ)<1e-6);
    assert.ok(Math.abs(b.min.y-A.bottomY)<1e-6 && Math.abs(b.max.y-A.topY)<1e-6);
  }
  assert.equal(parent.userData.dimensionConfidence,"PUB+EST");
  assert.equal(parent.userData.coreMicrostructureModeled,false);
});
test("Starboard structural assembly is unnumbered and does not replace equipment covers", () => {
  const {parent,outer,inner,edges}=build();
  assert.equal(parent.userData.inspectionTitle,"Starboard structural wall");
  assert.equal(parent.userData.label,undefined);
  assert.deepEqual(inspectionSubassemblies(parent),[outer,inner,edges]);
  assert.deepEqual([outer,inner,edges].map(g=>g.userData.inspectionLayer),["equipment-covers","equipment-casings","mounts"]);
  parent.traverse(o=>assert.doesNotMatch(o.name,/honeycomb-cell|adhesive|foam|sensor|camera-body/));
});
test("Camera relief is open through both faces, not a painted dark rectangle", () => {
  const {outer,inner}=build(), ray=new T.Raycaster();
  ray.set(new T.Vector3(.5,-.25,.16),new T.Vector3(-1,0,0));
  assert.equal(ray.intersectObjects([outer,inner],true).length,0);
  for(const [y,z] of [[-.15,.16],[-.25,.28],[-.25,.04]]) {
    ray.set(new T.Vector3(.5,y,z),new T.Vector3(-1,0,0));
    assert.ok(ray.intersectObjects([outer,inner],true).length>=2);
  }
});
test("Panel and its three masks restore independently without moving any hardware", () => {
  const {parent,outer,inner,edges}=build();
  const layers=createInspectionVisibility({'starboard-wall':parent});
  const original=[]; parent.traverse(o=>original.push(o.matrixWorld.toArray()));
  for(const [id,object] of [["equipment-covers",outer],["equipment-casings",inner],["mounts",edges]]) {
    const previous=new Map(); layers.apply({hiddenPartLayers:{'starboard-wall':[id]}},previous);
    assert.equal(object.visible,false); assert.equal(previous.size,1);
    for(const [o,v] of previous) o.visible=v;
  }
  assert.equal(layers.available("structural-panels"),true);
  const previous=new Map(); layers.apply({hiddenLayers:["structural-panels"]},previous);
  assert.equal(parent.visible,false); for(const [o,v] of previous) o.visible=v;
  const restored=[]; parent.updateMatrixWorld(true); parent.traverse(o=>restored.push(o.matrixWorld.toArray()));
  assert.deepEqual(restored,original);
});
test("Panel stays inside the prior body outline with bounded finite geometry", () => {
  const {parent}=build(); let count=0;
  parent.traverse(o=>{if(o.isMesh){ count++;
    const p=o.geometry.attributes.position;
    for(let i=0;i<p.count;i++) {
      const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
      assert.ok(Number.isFinite(v.length()));
      assert.ok(v.x>.349 && v.x<.366 && v.y>-.325 && v.y<.075 && v.z>-1.51 && v.z<1);
    }
  }});
  assert.ok(count<110,count);
});
