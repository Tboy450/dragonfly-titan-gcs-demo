import * as THREE from "./vendor/three/three.module.min.js";
import { splitSurfaceGeometry } from "./insulation-surfaces.mjs?v=dev";

export const localInsulationAsset=Object.freeze({
  revision:"local-insulation-2026-10-22",cameraRimWidthM:.010,cameraRimDepthM:.010,
  cameraNominalHistoricalCoverM:.025,hgaNominalHistoricalDomeM:.05,
  source:"ICES2020 p5 preliminary isolation covers; DragonCam2026 p3 window/enclosure. Window surrounds estimated; no complete flight camera blister or local foam volume reconstructed.",
});

export function buildHgaDomeSurfaces({parent,mesh,material,radius,axisY}){
  const root=new THREE.Group();root.name="hga-rohacell-dome";
  Object.assign(root.userData,{shell:true,inspectionLabel:"HGA insulation dome (surface estimate)",inspectionGlobalLayer:"hga-insulation",surfaceOnly:true});
  parent.add(root);
  const geometry=new THREE.CapsuleGeometry(radius,.13,6,20);
  const pieces=splitSurfaceGeometry(geometry,(a,b,c)=>(a.x+b.x+c.x)/3>=0?"upper":"lower");geometry.dispose();
  for(const[name,g]of pieces){
    const group=new THREE.Group();group.name="hga-dome-"+name;
    Object.assign(group.userData,{inspectionLabel:"HGA dome "+name+" surface (estimated split)",surfaceOnly:true});
    root.add(group);const o=mesh(g,material,[0,axisY,0],group);o.rotation.z=Math.PI/2;o.name=group.name+"-surface";o.userData.shell=true;
  }
  return root;
}

export function buildCameraWindowSurround({parts,mesh,lensFront,radius,exitDistance}){
  const A=localInsulationAsset,group=new THREE.Group(),name=parts.group.name;
  group.name=name+"-insulation-surround";
  Object.assign(group.userData,{inspectionLabel:name.replaceAll("-"," ")+" window surround (estimated)",
    inspectionLayer:"insulation",inspectionGlobalLayer:"camera-insulation",assetRevision:A.revision});
  parts.group.add(group);parts.cavity.userData.inspectionGlobalLayer="camera-insulation";
  const material=new THREE.MeshStandardMaterial({color:0xdcd3c1,metalness:.04,roughness:.82});
  const inner=radius+.005,outer=inner+A.cameraRimWidthM,z=lensFront+exitDistance-.0015,depth=A.cameraRimDepthM;
  const tube=(r,inside)=>{
    const g=new THREE.CylinderGeometry(r,r,depth,32,1,true);g.rotateX(Math.PI/2);
    const o=mesh(g,material,[0,0,z-depth/2],group);o.name=name+(inside?"-surround-bore":"-surround-outer");
    if(inside){o.material=material.clone();o.material.side=THREE.BackSide;}
  };
  tube(inner,true);tube(outer,false);
  for(const dz of [0,-depth]){
    const o=mesh(new THREE.RingGeometry(inner,outer,32),material,[0,0,z+dz],group);
    if(dz)o.rotation.y=Math.PI;o.name=name+"-surround-face";
  }
  parts.insulation=group;
  Object.assign(parts.group.userData,{inspectionLabel:name.replaceAll("-"," ")+" / window",inspectionMinimumRadiusM:.08});
  return group;
}
