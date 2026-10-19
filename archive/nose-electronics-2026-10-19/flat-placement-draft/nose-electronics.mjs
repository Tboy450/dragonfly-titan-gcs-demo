import * as THREE from "./vendor/three/three.module.min.js";

// Part 05: a dimensional study, NOT a photo-matched flight enclosure. Amzajerdian,
// NASA MSS 2023, page 6: Ocellus MEB 24.19 x 18.54 x 12.04 cm; FEB 23.4 x 23.2 x
// 12.7 cm [PUB, 2023 design]. Native axes below: x=first, z=second, y=third dimension.
// [EST] installed poses, neutral display finish, wall/lid/feet construction and fasteners.
// Do not copy the larger Kodiak heritage hardware, CAD internal colors or boards/optics.
const unit = (name, label, dimensions, position, yaw) => Object.freeze({
  name, label, dimensions: Object.freeze(dimensions), position: Object.freeze(position), yaw,
});
export const noseElectronicsAsset = Object.freeze({
  revision: "nose-electronics-dimension-study-2026-10-19",
  floorY: -0.284,
  units: Object.freeze([
    unit("ocellus-meb", "Ocellus MEB (2023 design envelope)", [0.2419,0.1204,0.1854],[-0.207,-0.284,-1.39],Math.PI/2),
    unit("ocellus-feb", "Ocellus FEB (2023 design envelope)", [0.234,0.127,0.232],[0.055,-0.284,-1.393],0),
  ]),
  // Retain both legacy cubes exactly until their own hardware reference is found.
  imus: Object.freeze([
    unit("imu-a-placeholder", "IMU A (unresolved placeholder)",[0.09,0.09,0.09],[0.25,-0.28,-1.42],0),
    unit("imu-b-placeholder", "IMU B (unresolved placeholder)",[0.09,0.09,0.09],[0.25,-0.28,-1.28],0),
  ]),
});

export function buildNoseElectronics({parent,mesh}) {
  const A=noseElectronicsAsset, assembly=new THREE.Group();
  assembly.name="nose-navigation-assemblies";parent.add(assembly);
  const anchor=new THREE.Vector3(-0.207,A.floorY+A.units[0].dimensions[1],-1.39);
  Object.assign(parent.userData,{
    assetRevision:A.revision,partialRebuild:true,dimensionConfidence:"PUB-2023-design+EST-installation",
    appearanceEvidence:"Ocellus nominal envelopes only, not hardware-photo matched; IMUs unresolved",
    labelAnchor:anchor,
  });
  const silver=new THREE.MeshStandardMaterial({color:0xb2bdc2,metalness:0.5,roughness:0.46});
  const lidMaterial=new THREE.MeshStandardMaterial({color:0xc4cbce,metalness:0.5,roughness:0.48});
  const steel=new THREE.MeshStandardMaterial({color:0x6c747a,metalness:0.7,roughness:0.4});
  const unresolved=new THREE.MeshStandardMaterial({color:0x5f8fa3,metalness:0.2,roughness:0.6});
  const box=(name,size,p,material,target)=>{
    const o=mesh(new THREE.BoxGeometry(...size),material,p,target);o.name=name;return o;
  };
  const units=A.units.map(spec=>{
    const group=new THREE.Group();group.name=spec.name;group.position.fromArray(spec.position);
    group.rotation.y=spec.yaw;group.userData.inspectionLabel=spec.label;
    group.userData.dimensionConfidence="PUB-2023-design";
    const [W,H,D]=spec.dimensions,wall=0.002,base=0.006;
    group.userData.labelAnchor=new THREE.Vector3(...spec.position).add(new THREE.Vector3(0,H,0));
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
    const group=new THREE.Group();group.name=spec.name;group.userData.inspectionLabel=spec.label;
    group.userData.labelAnchor=new THREE.Vector3(...spec.position);
    group.userData.unresolvedHardware=true;assembly.add(group);
    box(spec.name,spec.dimensions,spec.position,unresolved,group);
    return group;
  });
  return {assembly,units,imus};
}
