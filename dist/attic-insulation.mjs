import * as THREE from "./vendor/three/three.module.min.js?v=dev";
import { splitSurfaceGeometry } from "./insulation-surfaces.mjs?v=dev";

export const atticInsulationAsset=Object.freeze({
  revision:"attic-insulation-2026-10-22",surfaceOnly:true,localThicknessModeled:false,
  source:"ICES2023 warm/cold attic layout; NASA2025/NESC2026 body-foam test hardware. Outer profile estimated and retained; regions are not flight tile cuts.",
});
export const atticInsulationRegions=Object.freeze([
  {id:"attic-foam-top",label:"Attic arched cover surface"},
  {id:"attic-foam-port",label:"Attic port insulation surface"},
  {id:"attic-foam-starboard",label:"Attic starboard insulation surface"},
  {id:"attic-foam-belly",label:"Attic lower closing surface"},
  {id:"attic-foam-ends",label:"Attic nose / aft closing surfaces"},
].map(Object.freeze));
export function atticInsulationGeometry(){
  const shape=new THREE.Shape();shape.moveTo(-1.87,.04);
  shape.bezierCurveTo(-1.90,.25,-1.63,.51,-1.39,.55);
  shape.quadraticCurveTo(-1.10,.59,-.80,.56);shape.quadraticCurveTo(-.73,.55,-.73,.49);
  shape.lineTo(-.73,.04);shape.closePath();
  const g=new THREE.ExtrudeGeometry(shape,{depth:.87-2*.055,bevelEnabled:true,bevelThickness:.055,bevelSize:.055,bevelSegments:5,curveSegments:18});
  g.rotateY(-Math.PI/2);g.translate((.87-2*.055)/2,0,0);return g;
}
export function buildAtticInsulation({parent,mesh,material}){
  Object.assign(parent.userData,atticInsulationAsset,{inspectionTitle:"Attic cover / insulation (surface estimate)"});
  const original=atticInsulationGeometry(),surfaces=splitSurfaceGeometry(original);original.dispose();
  for(const{id,label}of atticInsulationRegions){
    const group=new THREE.Group();group.name=id;
    Object.assign(group.userData,{inspectionLabel:label,inspectionLayer:"insulation",insulationRegion:id,surfaceOnly:true});
    parent.add(group);mesh(surfaces.get(id.replace("attic-foam-","")),material,[0,0,0],group).name=id+"-surface";
  }
}
