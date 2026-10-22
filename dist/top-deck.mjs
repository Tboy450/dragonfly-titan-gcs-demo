import * as THREE from "./vendor/three/three.module.min.js";
import { hgaAsset } from "./hga-gimbal.mjs?v=dev";
import { sideWallAsset } from "./side-wall.mjs?v=dev";

// [PUB] NASA April23,2026: honeycomb primary panels,0.01in aluminum facesheets;
// ICES2020/2023: TWTA under top deck; HGA above. [EST] detailed deck outline,
//12mm depth, cutout, closeouts, supports and attic-edge lip. Not flight CAD/layup.
export const topDeckAsset = Object.freeze({
  revision: "top-deck-2026-10-22", faceM: .000254,
  bottomY: hgaAsset.deckY, topY: hgaAsset.deckY+.012,
  halfWidthM: sideWallAsset.outerX, frontZ: -.73, aftZ: sideWallAsset.aftZ,
  cornerM: .018, cutoutRadiusM: .121, cutoutCenter: Object.freeze([hgaAsset.hinge[0],hgaAsset.hinge[2]]),
  atticLipHeightM: .018, supportTopY: hgaAsset.foamTop,
});
export function buildTopDeck({parent,mesh}) {
  const A=topDeckAsset,W=A.halfWidthM,C=A.cornerM;
  Object.assign(parent.userData,{
    inspectionTitle:"Top deck / attic edge",assetRevision:A.revision,dimensionConfidence:"PUB+EST",
    coreMicrostructureModeled:false,
    source:"NASA/APL April2026 real top-deck fit check; NASA0.01in aluminum face thickness; ICES2020/2023 deck/TWTA/HGA arrangement. Outline, depth, closeouts, supports and attic-edge lip estimated",
  });
  const focus=(name,label)=>{const g=new THREE.Group();g.name=name;g.userData.inspectionLabel=label;parent.add(g);return g;};
  const layer=(owner,name,category)=>{const g=new THREE.Group();g.name=name;g.userData.inspectionLayer=category;owner.add(g);return g;};
  const faces=focus('deck-faces-focus','Deck aluminum faces (0.254 mm)');
  const edges=focus('deck-edges-focus','Deck edges / antenna opening / attic lip (estimated)');
  const supports=focus('deck-supports-focus','Stow-lock foundation examples (estimated)');
  const upper=layer(faces,'deck-upper-face','equipment-covers');
  const lower=layer(faces,'deck-lower-face','equipment-casings');
  const mounts=layer(edges,'deck-edge-mounts','mounts');
  const interfaces=layer(edges,'deck-opening-interface','interfaces');
  const pads=layer(supports,'deck-lock-foundations','mounts');
  const silver=new THREE.MeshStandardMaterial({color:0xbec5ca,metalness:.65,roughness:.4,side:THREE.DoubleSide});
  const edgeMat=new THREE.MeshStandardMaterial({color:0x969fa7,metalness:.65,roughness:.45,side:THREE.DoubleSide});
  const steel=new THREE.MeshStandardMaterial({color:0x626f79,metalness:.8,roughness:.35});
  const outline=[[-W+C,A.frontZ],[W-C,A.frontZ],[W,A.frontZ+C],[W,A.aftZ-C],
    [W-C,A.aftZ],[-W+C,A.aftZ],[-W,A.aftZ-C],[-W,A.frontZ+C]];
  const shape=new THREE.Shape();outline.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();
  const hole=new THREE.Path();hole.absarc(...A.cutoutCenter,A.cutoutRadiusM,0,Math.PI*2,true);shape.holes.push(hole);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:A.faceM,bevelEnabled:false,curveSegments:48});
  geometry.rotateX(Math.PI/2);geometry.translate(0,A.faceM,0);
  const face=(name,y,owner)=>{const o=mesh(geometry,silver,[0,y,0],owner);o.name=name;return o;};
  face('deck-upper-aluminum-face',A.topY-A.faceM,upper);face('deck-lower-aluminum-face',A.bottomY,lower);
  const box=(name,size,p,owner=mounts)=>{const o=mesh(new THREE.BoxGeometry(...size),edgeMat,p,owner);o.name=name;return o;};
  const depth=A.topY-A.bottomY-2*A.faceM,cy=(A.topY+A.bottomY)/2;
  for(let i=0;i<outline.length;i++){
    const p=outline[i],q=outline[(i+1)%outline.length],dx=q[0]-p[0],dz=q[1]-p[1],length=Math.hypot(dx,dz),width=.01;
    const o=box('deck-perimeter-closeout',[width,depth,length],
      [(p[0]+q[0])/2-dz/length*width/2,cy,(p[1]+q[1])/2+dx/length*width/2]);
    o.rotation.y=Math.atan2(dx,dz);
  }
  const [hx,hz]=A.cutoutCenter;
  const rim=mesh(new THREE.CylinderGeometry(A.cutoutRadiusM,A.cutoutRadiusM,depth,48,1,true),edgeMat,[hx,cy,hz],interfaces);
  rim.name='deck-gimbal-opening-wall';
  for(const y of[A.bottomY,A.topY]){
    const o=mesh(new THREE.RingGeometry(A.cutoutRadiusM,A.cutoutRadiusM+.003,48),edgeMat,[hx,y,hz],interfaces);
    o.name='deck-gimbal-opening-rim';o.rotation.x=-Math.PI/2;
  }
  box('deck-attic-edge-lip',[2*W-.05,A.atticLipHeightM,.002],
    [0,A.topY+A.atticLipHeightM/2,A.frontZ+.001]);
  const screwGeometry=new THREE.CylinderGeometry(.0023,.0023,.0012,8);
  for(const x of[-W+.013,W-.013])for(let z=A.frontZ+.05;z<A.aftZ-.025;z+=.11){
    const o=mesh(screwGeometry,steel,[x,A.topY+.0006,z],mounts);o.name='deck-edge-fastener';
  }
  const [lx,lz]=hgaAsset.launchLock;
  box('deck-launch-lock-foundation',[.05,A.supportTopY-A.topY,.05],[lx,(A.supportTopY+A.topY)/2,lz],pads);
  for(const side of[-1,1]){
    const a=side*hgaAsset.flightLockAngleDeg*Math.PI/180,r=hgaAsset.flightLockRadiusM;
    const o=box('deck-flight-lock-foundation',[.035,A.supportTopY-A.topY,.035],
      [Math.sin(a)*r,(A.supportTopY+A.topY)/2,hgaAsset.stowedDishCenter[2]+Math.cos(a)*r],pads);o.rotation.y=a;
  }
  return{faces,edges,supports,upper,lower,mounts,interfaces,pads};
}
