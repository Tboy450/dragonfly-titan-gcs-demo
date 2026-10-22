import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../dist/vendor/three/three.module.min.js";
import { buildSideWall, sideWallAsset as W, portWallAsset as P } from "../dist/side-wall.mjs";
import { buildWallEndJoints, wallJointAsset as J, aftJointZ } from "../dist/wall-end-joints.mjs";
import { noseBulkheadAsset as N } from "../dist/nose-bulkhead.mjs";
import { aftBulkheadAsset as A } from "../dist/aft-bulkhead.mjs";
import { createInspectionVisibility } from "../dist/inspection-visibility.mjs";
import { inspectionGroups, inspectionSubassemblies } from "../dist/vehicle-inspector.mjs";
import { buildSideCameras, sideCamerasAsset } from "../dist/side-cameras.mjs";
import { buildIem } from "../dist/iem.mjs";
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const build=()=>{
  const port=new T.Group(),joints=new T.Group();
  const p=buildSideWall({parent:port,mesh,side:-1}),j=buildWallEndJoints({parent:joints,mesh});
  port.updateMatrixWorld(true);joints.updateMatrixWorld(true);return{port,joints,...p,...j};
};
test("Port wall retains published face thickness, negative-x installation and its own reliefs",()=>{
  const {port,outer,inner}=build();
  assert.equal(P.faceM,.000254);assert.equal(P.cameraReliefs.length,2);
  assert.equal(port.userData.inspectionTitle,"Port structural wall");assert.equal(port.userData.label,undefined);
  for(const group of [outer,inner]){
    const face=group.children.find(o=>o.name.includes('aluminum-face')),b=new T.Box3().setFromObject(face);
    assert.ok(b.max.x<0 && Math.abs(b.max.x-b.min.x-P.faceM)<1e-7);
  }
});
test("Port camera reliefs are open while the untouched starboard face remains solid there",()=>{
  const {outer,inner}=build(),starboard=new T.Group();buildSideWall({parent:starboard,mesh});starboard.updateMatrixWorld(true);
  const ray=new T.Raycaster();
  for(const [z,y] of [[.16,-.25],[.37,-.22]]){
    ray.set(new T.Vector3(-.5,y,z),new T.Vector3(1,0,0));assert.equal(ray.intersectObjects([outer,inner],true).length,0);
  }
  ray.set(new T.Vector3(.5,-.22,.37),new T.Vector3(-1,0,0));assert.ok(ray.intersectObject(starboard,true).length>0);
  ray.set(new T.Vector3(-.5,-.10,.37),new T.Vector3(1,0,0));assert.ok(ray.intersectObjects([outer,inner],true).length>=2);
});
test("Both nose returns reach the existing bulkhead side edge without rescaling it",()=>{
  const {nose}=build();
  for(const side of [-1,1]){
    const g=nose.getObjectByName(`nose-wall-joint-${side<0?'port':'starboard'}`);
    const r=g.getObjectByName('nose-wall-joint-return'),b=new T.Box3().setFromObject(r);
    assert.ok(Math.abs((side<0?b.max.x:b.min.x)-side*N.widthM/2)<1e-7);
    assert.ok(Math.abs(b.max.z-(N.position[2]+N.depthM/2))<1e-7);
    const web=new T.Box3().setFromObject(g.getObjectByName('nose-wall-joint-web'));
    assert.ok(web.min.z<W.frontZ && web.max.z>W.frontZ);
  }
});
test("Aft returns follow the existing25-degree bulkhead, not a vertical approximation",()=>{
  const {aft}=build(),angle=A.tiltDeg*Math.PI/180;
  for(const side of [-1,1]){
    const root=aft.getObjectByName(`aft-wall-joint-${side<0?'port':'starboard'}`);
    const frame=root.getObjectByName('aft-wall-joint-canted-return');assert.equal(frame.rotation.x,-angle);
    const face=root.getObjectByName('aft-wall-joint-web'),p=face.geometry.attributes.position;
    let low=false,high=false;
    for(let i=0;i<p.count;i++){
      const y=p.getY(i),z=p.getZ(i);
      if(Math.abs(y-J.bottomY)<1e-7 && Math.abs(z-aftJointZ(J.bottomY))<1e-7)low=true;
      if(Math.abs(y-J.topY)<1e-7 && Math.abs(z-aftJointZ(J.topY))<1e-7)high=true;
    }
    assert.ok(low&&high);assert.ok(aftJointZ(J.bottomY)-aftJointZ(J.topY)>.1);
    assert.ok(aftJointZ(J.topY)>W.aftZ);
  }
});
test("Port and joint masks restore independently; original24 numbers are not reused",()=>{
  const {port,joints,nose,aft,outer,inner,edges}=build();
  assert.deepEqual(inspectionSubassemblies(port),[outer,inner,edges]);assert.deepEqual(inspectionSubassemblies(joints),[nose,aft]);
  assert.equal(joints.userData.label,undefined);assert.equal(joints.userData.dimensionConfidence,'EST');
  const layers=createInspectionVisibility({'port-wall':port,'wall-end-joints':joints});
  for(const [name,ids] of [['port-wall',['equipment-covers','equipment-casings','mounts']],['wall-end-joints',['mounts','interfaces']]]){
    for(const id of ids){assert.equal(layers.available(id,name),true);const previous=new Map();
      layers.apply({hiddenPartLayers:{[name]:[id]}},previous);assert.ok(previous.size);
      for(const [o,v]of previous){assert.equal(o.visible,false);o.visible=v;}
    }
  }
  const previous=new Map();layers.apply({hiddenLayers:['structural-panels']},previous);
  assert.equal(port.visible,false);assert.equal(joints.visible,false);for(const[o,v]of previous)o.visible=v;
  assert.deepEqual(inspectionGroups('wall-end-joints'),['wall-end-joints','starboard-wall','port-wall','nose-bulkhead','aft-bulkhead']);
});
test("New geometry is finite and bounded; no invented core, seal, hardware internals or load solver",()=>{
  const {port,joints}=build();let count=0;
  for(const group of[port,joints])group.traverse(o=>{assert.doesNotMatch(o.name,/honeycomb-cell|seal|bondline|adhesive|wire/);if(o.isMesh){count++;
    const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){
      const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);assert.ok(Number.isFinite(v.length()));
      assert.ok(Math.abs(v.x)<.377 && v.y>-.325 && v.y<.075 && v.z>-1.56 && v.z<1.17);
    }
  }});
  assert.ok(count<180,count);
});
test("Unchanged port optics retain their published drill-site aim and clear the new wall/joints",()=>{
  const {port,joints}=build(),parent=new T.Group(),{cameras}=buildSideCameras({parent,mesh});parent.updateMatrixWorld(true);
  for(const name of ['microscopic-camera','led-array','port-down-camera']){
    const camera=cameras.find(c=>c.group.name===name);
    assert.ok(camera,`camera ${name}`);
    const dir=new T.Vector3(0,0,1).applyQuaternion(camera.group.quaternion);
    const start=new T.Vector3(0,0,name==='microscopic-camera'?.085:.04).applyMatrix4(camera.group.matrixWorld);
    const ray=new T.Raycaster(start,dir,.0001,1.1);
    assert.equal(ray.intersectObjects([port,joints],true).length,0,name);
  }
  const mi=cameras.find(c=>c.group.name==='microscopic-camera');
  assert.ok(Math.abs(mi.group.position.distanceTo(new T.Vector3(...sideCamerasAsset.drillSite))-.986)<1e-6);
});
test("IEM's pre-existing wall-bolt tips meet the inner face; only the estimated bond endpoint embeds shallowly",()=>{
  const iem=new T.Group();buildIem({parent:iem,mesh});iem.updateMatrixWorld(true);let bolts=0;
  iem.traverse(o=>{if(!o.isMesh)return;
    if(o.name==='iem-wall-bolt'){
      const b=new T.Box3().setFromObject(o);assert.ok(Math.abs(b.min.x+P.innerX)<1e-7);bolts++;
    }
    if(o.name==='iem-ground-strap-braid'){
      const b=new T.Box3().setFromObject(o),depth=-P.innerX-b.min.x;
      assert.ok(depth>0 && depth<.002);assert.ok(b.min.z>-.29 && b.max.z<-.26);
    }
  });assert.equal(bolts,6);
});
