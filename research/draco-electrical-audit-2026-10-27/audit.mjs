import * as T from '../../dist/vendor/three/three.module.min.js';
import {buildBlowers,dracoPlumbingAsset} from '../../dist/draco-plumbing.mjs';
import {dracoBlowerReference} from '../../dist/draco-electrical-evidence.mjs';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function report(){
 const root=new T.Group(),mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
 const b=buildBlowers({parent:root,mesh});root.updateMatrixWorld(true);
 const centers=dracoPlumbingAsset.blowerCenters.map(p=>new T.Vector3(...p));
 const unitMeshes=[[],[]],bodyMeshes=[[],[]];
 b.group.traverse(o=>{
  if(!o.isMesh||['draco-blower-flow-diverter','draco-blower-diverter-actuator'].includes(o.name))return;
  const p=o.getWorldPosition(new T.Vector3()),index=p.distanceTo(centers[0])<p.distanceTo(centers[1])?0:1;
  unitMeshes[index].push(o);if(o.parent===b.casings)bodyMeshes[index].push(o);
 });
 const size=objects=>{const box=new T.Box3();for(const o of objects)box.union(new T.Box3().setFromObject(o));return box.getSize(new T.Vector3()).toArray();};
 const rows=centers.map((c,i)=>{
  const body=size(bodyMeshes[i]),full=size(unitMeshes[i]);
  return{unit:i===0?'forward':'aft',modelCenterM:c.toArray(),modelFullLocalSizeM:full,
   modelHousingLocalSizeM:body,currentMotorAxis:'Y',supplierLengthM:dracoBlowerReference.lengthM,
   supplierDiameterM:dracoBlowerReference.diameterM,
   axialLengthRatio:dracoBlowerReference.lengthM/full[1],
   housingDiameterRatio:dracoBlowerReference.diameterM/Math.max(body[0],body[2])};
 });
 const distance=Math.hypot(centers[1].x-centers[0].x,centers[1].z-centers[0].z);
 return{scope:'Scale/space screening of existing placeholders; not flight installation or actual solid collision proof',rows,
  sameAxisEnvelopeScreen:{parallelAxisAssumed:'Y as currently modeled',transverseCenterSpacingM:distance,
   supplierCylinderDiameterM:dracoBlowerReference.diameterM,
   cylinderEnvelopeOverlapM:dracoBlowerReference.diameterM-distance,
   warning:'Bounding cylinders overlap at current centers; actual shaped solids/flight orientation not established.'},
  next:'Rebuild part24 housing pair and reconcile centers/inlet/exhaust/mounts before electrical routing. Keep two redundant blowers; do not add a third inferred cone unit.'};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)
 await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(report(),null,2)+'\n');
