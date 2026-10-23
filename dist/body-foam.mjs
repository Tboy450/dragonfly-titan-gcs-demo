import * as THREE from "./vendor/three/three.module.min.js";
import { aftFaceZ } from "./aft-bulkhead.mjs?v=dev";
import { splitSurfaceGeometry } from "./insulation-surfaces.mjs?v=dev";

export const bodyFoamAsset = Object.freeze({
  revision: "body-foam-2026-10-22", surfaceOnly: true,
  nominalSourceThicknessM: .076, localThicknessModeled: false,
  sourceMaterial: "Solimide-based foam (NASA 2025); Solimide 16 selection (NESC May 2026)",
});
export const bodyFoamRegions = Object.freeze([
  { id: "body-foam-top", label: "Body top / deck insulation surface" },
  { id: "body-foam-port", label: "Body port insulation surface" },
  { id: "body-foam-starboard", label: "Body starboard insulation surface" },
  { id: "body-foam-belly", label: "Body belly insulation surface" },
  { id: "body-foam-ends", label: "Body nose / aft insulation surfaces" },
].map(Object.freeze));

export function bodyFoamGeometry() {
  const outline = new THREE.Shape();
  [[-1.90,-.05],[-1.78,-.27],[-1.48,-.36],[aftFaceZ(-.36),-.36],
    [aftFaceZ(.10),.10],[-1.83,.10]].forEach(([z,y],i)=>i?outline.lineTo(z,y):outline.moveTo(z,y));
  outline.closePath();
  const geometry = new THREE.ExtrudeGeometry(outline, {
    depth: .86-2*.05, bevelEnabled: true, bevelThickness: .05,
    bevelSize: .05, bevelSegments: 5, curveSegments: 18,
  });
  geometry.rotateY(-Math.PI/2); geometry.translate((.86-2*.05)/2,0,0);
  return geometry;
}

// Inspection ownership only: retain each original triangle and its shading/UVs.
// The dominant geometric normal defines broad regions, not flight tile cut lines.
export function splitBodyFoamSurface(geometry) {
  const parts=splitSurfaceGeometry(geometry);
  return new Map(bodyFoamRegions.map(({id})=>[id,parts.get(id.replace("body-foam-",""))]));
}

export function buildBodyFoam({parent,mesh,material}) {
  Object.assign(parent.userData,bodyFoamAsset,{
    inspectionTitle:"Body insulation regions (surface estimate)",
    dimensionConfidence:"EST; source nominal thickness not modeled",
    source:"NASA September 2025 foam test hardware; NASA NESC May 2026 foam development. Existing estimated outer profile retained; inspection regions are not flight tiles or volumetric foam.",
  });
  const geometry=bodyFoamGeometry(),surfaces=splitBodyFoamSurface(geometry);geometry.dispose();
  for(const{id,label}of bodyFoamRegions){
    const group=new THREE.Group();group.name=id;
    Object.assign(group.userData,{inspectionLabel:label,inspectionLayer:"insulation",bodyFoamRegion:id,surfaceOnly:true});
    parent.add(group);const o=mesh(surfaces.get(id),material,[0,0,0],group);o.name=`${id}-surface`;
  }
  return surfaces;
}
