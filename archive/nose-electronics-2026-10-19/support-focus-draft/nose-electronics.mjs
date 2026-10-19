import * as THREE from "./vendor/three/three.module.min.js";

// Part 05: Ocellus dimension study + photo-referenced Honeywell MIMU FAMILY approximation.
// The exact Dragonfly MIMU variant/installation is not established. Amzajerdian,
// NASA MSS 2023, page 6: Ocellus MEB 24.19 x 18.54 x 12.04 cm; FEB 23.4 x 23.2 x
// 12.7 cm [PUB, 2023 design]. Native axes below: x=first, z=second, y=third dimension.
// [EST] installed poses, neutral display finish, wall/lid/feet construction and fasteners.
// Do not copy the larger Kodiak heritage hardware, CAD internal colors or boards/optics.
const unit = (name, label, dimensions, position, yaw) => Object.freeze({
  name, label, dimensions: Object.freeze(dimensions), position: Object.freeze(position), yaw,
});
export const noseElectronicsAsset = Object.freeze({
  revision: "nose-electronics-mimu-family-2026-10-19",
  floorY: -0.284,
  units: Object.freeze([
    unit("ocellus-meb", "Ocellus MEB (2023 design envelope)", [0.2419,0.1204,0.1854],[-0.207,-0.284,-1.39],Math.PI/2),
    unit("ocellus-feb", "Ocellus FEB (2023 design envelope)", [0.234,0.127,0.232],[0.205,-0.284,-1.393],0),
  ]),
  // [PUB] Honeywell June 2026 family upper envelope, NOT exact flight dimensions.
  // [EST] exterior proportions from supplier hardware imagery; all installation coordinates.
  mimuEnvelope: Object.freeze({diameterM:0.2337,heightM:0.1699,kind:"published-family-upper-bound"}),
  imus: Object.freeze([
    unit("imu-a", "IMU A (Honeywell MIMU family approximation)",[0.2337,0.1699,0.2337],[0.205,-0.1,-1.393],0),
    unit("imu-b", "IMU B (Honeywell MIMU family approximation)",[0.2337,0.1699,0.2337],[0.205,-0.1,-1.145],Math.PI),
  ]),
});

export function buildNoseElectronics({parent,mesh}) {
  const A=noseElectronicsAsset, assembly=new THREE.Group();
  assembly.name="nose-navigation-assemblies";parent.add(assembly);
  const anchor=new THREE.Vector3(-0.207,A.floorY+A.units[0].dimensions[1],-1.39);
  Object.assign(parent.userData,{
    assetRevision:A.revision,partialRebuild:true,dimensionConfidence:"PUB-design+PUB-family-limit+EST-installation",
    appearanceEvidence:"Ocellus not hardware-photo matched; Honeywell MIMU family photo, exact flight variant unconfirmed",
    labelAnchor:anchor,
  });
  const silver=new THREE.MeshStandardMaterial({color:0xb2bdc2,metalness:0.5,roughness:0.46});
  const lidMaterial=new THREE.MeshStandardMaterial({color:0xc4cbce,metalness:0.5,roughness:0.48});
  const steel=new THREE.MeshStandardMaterial({color:0x6c747a,metalness:0.7,roughness:0.4});
  const dark=new THREE.MeshStandardMaterial({color:0x35332f,metalness:0.25,roughness:0.68});
  const ribs=new THREE.MeshStandardMaterial({color:0x242522,metalness:0.3,roughness:0.62});
  const sockets=new THREE.MeshStandardMaterial({color:0x101312,metalness:0.1,roughness:0.7});
  const box=(name,size,p,material,target)=>{
    const o=mesh(new THREE.BoxGeometry(...size),material,p,target);o.name=name;return o;
  };
  const units=A.units.map(spec=>{
    const group=new THREE.Group();group.name=spec.name;group.position.fromArray(spec.position);
    group.rotation.y=spec.yaw;group.userData.inspectionLabel=spec.label;
    group.userData.dimensionConfidence="PUB-2023-design";
    const [W,H,D]=spec.dimensions,wall=0.002,base=0.006;
    group.userData.labelAnchor=new THREE.Vector3(0,H,0).applyEuler(group.rotation).add(group.position);
    assembly.add(group);
    const layer=(name,category)=>{
      const g=new THREE.Group();g.name=`${spec.name}-${name}`;g.userData.inspectionLayer=category;group.add(g);return g;
    };
    const casing=layer("casing","equipment-casings"),cover=layer("cover","equipment-covers"),mounts=layer("mounts","mounts");
    // Keep the complete representation INSIDE the published design envelope, including
    // estimated feet and screw heads. No fabricated connector pinouts or internal devices.
    const w=W-0.014,d=D-0.014;
    box(`${spec.name}-base`,[w,wall,d],[0,base+wall/2,0],silver,casing);
    for(const s of [-1,1]){
      box(`${spec.name}-side`,[wall,H-base-2*wall,d],[s*(w-wall)/2,(H+base)/2-wall/2,0],silver,casing);
      box(`${spec.name}-end`,[w-2*wall,H-base-2*wall,wall],[0,(H+base)/2-wall/2,s*(d-wall)/2],silver,casing);
    }
    box(`${spec.name}-lid`,[w,wall,d],[0,H-wall*1.5,0],lidMaterial,cover);
    for(const x of [-1,1])for(const z of [-1,1]){
      box(`${spec.name}-mount-foot`,[0.022,base,0.027],[x*(W-0.022)/2,base/2,z*(D-0.027)/2],silver,mounts);
      const head=mesh(new THREE.CylinderGeometry(0.0027,0.0027,wall,8),steel,
        [x*(w/2-0.007),H-wall/2,z*(d/2-0.007)],cover);head.name=`${spec.name}-cover-fastener`;
    }
    return {spec,group,casing,cover,mounts};
  });
  const imus=A.imus.map(spec=>{
    const group=new THREE.Group();group.name=spec.name;group.position.fromArray(spec.position);group.rotation.y=spec.yaw;
    Object.assign(group.userData,{inspectionLabel:spec.label,hardwareFamily:"Honeywell space MIMU",
      flightVariantConfirmed:false,dimensionConfidence:"PUB-family-upper-bound+EST-proportions",
      labelAnchor:new THREE.Vector3(...spec.position).add(new THREE.Vector3(0,0.1699,0))});
    assembly.add(group);
    const layer=(name,category)=>{const g=new THREE.Group();g.name=`${spec.name}-${name}`;
      g.userData.inspectionLayer=category;group.add(g);return g;};
    const casing=layer("casing","equipment-casings"),cover=layer("cover","equipment-covers"),
      mounts=layer("mounts","mounts"),interfaces=layer("interfaces","interfaces");
    const cylinder=(name,r,h,y,material,target)=>{
      const o=mesh(new THREE.CylinderGeometry(r,r,h,64),material,[0,y,0],target);o.name=`${spec.name}-${name}`;return o;
    };
    // Hollow exterior only. The supplier's exploded CAD is not an interior hardware photo.
    const wall=new THREE.Mesh(new THREE.CylinderGeometry(.104,.104,.111,64,1,true),dark);
    wall.position.y=.0615;wall.material=dark.clone();wall.material.side=THREE.DoubleSide;
    wall.name=`${spec.name}-ribbed-housing`;casing.add(wall);
    cylinder("floor",.104,.003,.0045,dark,casing);
    cylinder("lower-flange",.11685,.003,.0015,ribs,mounts);
    cylinder("cover-flange",.112,.004,.119,dark,cover);
    for(const y of [.007,.044,.080,.115]){
      const ring=mesh(new THREE.TorusGeometry(.105,.0016,6,64),ribs,[0,y,0],casing);
      ring.rotation.x=Math.PI/2;ring.name=`${spec.name}-circumferential-rib`;
    }
    for(let i=0;i<16;i++){
      const a=i*Math.PI/8;
      const rib=box(`${spec.name}-vertical-rib`,[.0025,.108,.0035],[Math.sin(a)*.105,.0615,Math.cos(a)*.105],ribs,casing);
      rib.rotation.y=a;
      const bolt=mesh(new THREE.CylinderGeometry(.002,.002,.002,8),steel,[Math.sin(a)*.108,.122,Math.cos(a)*.108],cover);
      bolt.name=`${spec.name}-flange-fastener`;
    }
    const profile=[[0,.121],[.104,.121],[.104,.142],[.103,.151],[.099,.159],[.092,.166],[.085,.1699],[0,.1699]];
    const capGeometry=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),64);
    const vertices=capGeometry.attributes.position;
    for(let i=0;i<vertices.count;i++)vertices.setZ(i,Math.max(vertices.getZ(i),-.080));
    capGeometry.computeVertexNormals();const cap=mesh(capGeometry,dark,[0,0,0],cover);cap.name=`${spec.name}-rounded-top-cover`;
    box(`${spec.name}-power-supply-cover`,[.074,.070,.005],[0,.044,-.108],dark,cover);
    for(const x of [-.032,.032])for(const y of [.013,.075]){
      const screw=mesh(new THREE.CylinderGeometry(.0018,.0018,.0018,8),steel,[x,y,-.1115],cover);
      screw.rotation.x=Math.PI/2;screw.name=`${spec.name}-side-cover-fastener`;
    }
    // External connector shells/capped faces, not fabricated pins, wiring or socket function.
    for(const x of [-.033,0,.033]){
      const r=x===0?.010:.007;
      for(const [suffix,radius,depth,z,material] of [["collar",r+.002,.004,-.082,steel],["shell",r,.018,-.093,steel],["capped-face",r*.85,.006,-.105,sockets]]){
        const port=mesh(new THREE.CylinderGeometry(radius,radius,depth,20),material,[x,.143,z],interfaces);
        port.rotation.x=Math.PI/2;port.name=`${spec.name}-connector-${suffix}`;
      }
    }
    const service=box(`${spec.name}-side-interface-shell`,[.042,.014,.006],[0,.091,-.106],steel,interfaces);
    service.userData.pinoutUnknown=true;
    for(let i=0;i<4;i++){
      const a=Math.PI/4+i*Math.PI/2;
      const pad=mesh(new THREE.CylinderGeometry(.006,.006,.003,16),steel,[Math.sin(a)*.108,.003,Math.cos(a)*.108],mounts);
      pad.name=`${spec.name}-mount-pad`;
    }
    return group;
  });
  // [EST] inspection-layout support shelf, not an asserted Dragonfly flight bracket.
  const support=new THREE.Group();support.name="imu-estimated-support";support.userData.inspectionLayer="mounts";assembly.add(support);
  box("imu-estimated-support-shelf",[.254,.004,.49],[.205,-.102,-1.269],silver,support);
  for(const z of [-1.50,-1.04]){
    box("imu-estimated-support-post",[.008,.18,.016],[.338,-.194,z],silver,support);
    box("imu-estimated-support-foot",[.024,.004,.026],[.338,-.282,z],silver,support);
  }
  return {assembly,units,imus,support};
}
