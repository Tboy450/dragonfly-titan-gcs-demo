import * as THREE from "./vendor/three/three.module.min.js";
import { sideWallAsset as W } from "./side-wall.mjs?v=dev";
import { noseBulkheadAsset as N } from "./nose-bulkhead.mjs?v=dev";
import { aftBulkheadAsset as A } from "./aft-bulkhead.mjs?v=dev";

// [EST] simple side webs/edge returns bridge this model's wall-to-bulkhead gaps.
// Real NASA/APL April/May2026 photos support bolted panel edges, not these hidden
// fitting dimensions, fastener counts, materials or load paths. No sealed-joint,
// insert, bondline, structural analysis or verified flight-disassembly claim.
export const wallJointAsset = Object.freeze({
  revision: "wall-end-joints-2026-10-22", thicknessM: .0015,
  bottomY: -.285, topY: .04, aftRimLocalZ: -.035,
});
export function aftJointZ(y) {
  const angle = A.tiltDeg*Math.PI/180;
  return A.interfaceCenter[2]-(y-A.interfaceCenter[1])*Math.tan(angle)
    +wallJointAsset.aftRimLocalZ/Math.cos(angle);
}
export function buildWallEndJoints({ parent, mesh }) {
  const J=wallJointAsset, t=J.thicknessM;
  Object.assign(parent.userData, {
    inspectionTitle: "Wall end joints (estimated)", assetRevision: J.revision,
    dimensionConfidence: "EST",
    source: "NASA/APL2026 real structure photos show bolted panel edges; modeled joint webs/returns, dimensions and fastening are estimates, not flight details",
  });
  const silver=new THREE.MeshStandardMaterial({color:0xa8b2ba,metalness:.7,roughness:.4});
  const steel=new THREE.MeshStandardMaterial({color:0x68747e,metalness:.8,roughness:.3});
  const focus=(name,label) => {
    const g=new THREE.Group(); g.name=name; g.userData.inspectionLabel=label; parent.add(g);return g;
  };
  const nose=focus("nose-joints-focus","Nose joint pair (estimated)");
  const aft=focus("aft-joints-focus","Canted aft joint pair (estimated)");
  const end=(owner,name,side) => {
    const root=new THREE.Group();root.name=`${name}-${side<0?'port':'starboard'}`;root.scale.x=side;owner.add(root);
    const mounts=new THREE.Group();mounts.name=`${root.name}-webs`;mounts.userData.inspectionLayer="mounts";root.add(mounts);
    const interfaces=new THREE.Group();interfaces.name=`${root.name}-fasteners`;interfaces.userData.inspectionLayer="interfaces";root.add(interfaces);
    return {root,mounts,interfaces};
  };
  const box=(name,size,p,group) => {const o=mesh(new THREE.BoxGeometry(...size),silver,p,group);o.name=name;return o;};
  const web=(name,outline,group) => {
    const shape=new THREE.Shape();outline.forEach(([z,y],i)=>i?shape.lineTo(z,y):shape.moveTo(z,y));shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:t,bevelEnabled:false});
    g.rotateY(-Math.PI/2);g.translate(W.outerX+t,0,0);
    const o=mesh(g,silver,[0,0,0],group);o.name=name;return o;
  };
  const boltGeometry=new THREE.CylinderGeometry(.0025,.0025,.0013,8);
  const bolt=(y,z,group) => {
    const o=mesh(boltGeometry,steel,[W.outerX+t+.00065,y,z],group);
    o.name="wall-joint-fastener";o.rotation.z=Math.PI/2;
  };
  const forwardFace=N.position[2]+N.depthM/2;
  for(const side of [-1,1]) {
    const n=end(nose,"nose-wall-joint",side), a=end(aft,"aft-wall-joint",side);
    web("nose-wall-joint-web",[[forwardFace-t,J.bottomY],[W.frontZ+.012,J.bottomY],
      [W.frontZ+.012,J.topY],[forwardFace-t,J.topY]],n.mounts);
    box("nose-wall-joint-return",[W.outerX+t-N.widthM/2,J.topY-J.bottomY,t],
      [(W.outerX+t+N.widthM/2)/2,(J.topY+J.bottomY)/2,forwardFace-t/2],n.mounts);
    web("aft-wall-joint-web",[[W.aftZ-.012,J.bottomY],[aftJointZ(J.bottomY),J.bottomY],
      [aftJointZ(J.topY),J.topY],[W.aftZ-.012,J.topY]],a.mounts);
    const frame=new THREE.Group();frame.name="aft-wall-joint-canted-return";
    frame.position.fromArray(A.interfaceCenter);frame.rotation.x=-A.tiltDeg*Math.PI/180;a.mounts.add(frame);
    const angle=A.tiltDeg*Math.PI/180;
    const localY=y=>(y-A.interfaceCenter[1]-J.aftRimLocalZ*Math.sin(angle))/Math.cos(angle);
    const low=localY(J.bottomY),high=localY(J.topY);
    box("aft-wall-joint-return",[W.outerX+t-A.plate.width/2,high-low,t],
      [(W.outerX+t+A.plate.width/2)/2,(high+low)/2,J.aftRimLocalZ-t/2],frame);
    for(const y of [-.25,-.165,-.08,.005]) {
      for(const z of [forwardFace+.012,W.frontZ+.001]) bolt(y,z,n.interfaces);
      for(const z of [W.aftZ-.002,aftJointZ(y)-.009]) bolt(y,z,a.interfaces);
    }
  }
  return {nose,aft};
}
