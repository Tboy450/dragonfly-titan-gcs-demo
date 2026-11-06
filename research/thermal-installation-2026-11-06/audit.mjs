import * as T from '../../dist/vendor/three/three.module.min.js';
import {fullModel} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {bodyHits} from '../draco-blower-pair-2026-10-27/audit.mjs';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

// Numerical geometry screen only. This 0.1 micrometre epsilon is not an
// engineering clearance, manufacturing tolerance or NASA workmanship limit.
export const numericalEpsilonM=1e-7;
export const modelFloorYM=-.284;
function boundsInFrame(object,reference){
 const box=new T.Box3(),p=object.geometry.attributes.position;
 const transform=reference.matrixWorld.clone().invert().multiply(object.matrixWorld);
 for(let i=0;i<p.count;i++)box.expandByPoint(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(transform));
 return box;
}
// Explicit supporting-plane test for this one floor seat. It does not infer
// solid penetration from triangle crossings or a global rotated AABB alone.
export function floorSeat(foot,flange,reference){
 reference.updateWorldMatrix(true,true);
 const a=boundsInFrame(foot,reference),b=boundsInFrame(flange,reference),e=numericalEpsilonM;
 const planeResidualM=Math.max(Math.abs(a.min.y-modelFloorYM),Math.abs(b.max.y-modelFloorYM));
 const overlapXZ=[Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x),Math.min(a.max.z,b.max.z)-Math.max(a.min.z,b.min.z)];
 return {classification:planeResidualM<=e&&overlapXZ.every(n=>n>e)?'numerical-floor-seat':'not-a-floor-seat',
  planeYM:modelFloorYM,planeResidualM,signedGapM:a.min.y-b.max.y,overlapXZM:overlapXZ,
  footBoundsM:{min:a.min.toArray(),max:a.max.toArray()},flangeBoundsM:{min:b.min.toArray(),max:b.max.toArray()}};
}
export function inspect(){
 const f=fullModel(),clamps=[],flanges=[];
 f.root.traverse(o=>{if(o.name==='main-harness-clamp')clamps.push(o);if(o.name==='warm-duct-flange')flanges.push(o);});
 const seats=[];
 for(const foot of clamps)for(const flange of flanges){const seat=floorSeat(foot,flange,f.root);
  if(seat.classification==='numerical-floor-seat')seats.push({route:foot.userData.routeName,foot:foot.name,flange:flange.name,...seat});
 }
 const cold=f.root.getObjectByName('cold-duct-channel'),belly=f.root.getObjectByName('body-foam-belly-surface');
 return {baseline:'83b3e9583757b4eef0982587173011eb91a6caad',numericalEpsilonM,seats,
  rawWarmContacts:bodyHits(f.root,f.subsystems['underfloor-duct']),
  rawTrimContacts:bodyHits(f.root,f.subsystems['trim-chimneys']),
  coldDuctBoundsM:boundsInFrame(cold,f.root),bellyBoundsM:boundsInFrame(belly,f.root),
  unchangedGeometry:true,
  limitations:['Seat is geometric only; flight clamp, floor structure, attachment and thermal isolation unconfirmed.',
   'Two actual housing/belly surface intersections remain. Belly also obscures cold duct from below.',
   'Resolve local insulation/exposed-channel boundary together; no inferred flight tile seam, thickness, seal or heat-leak coefficient.']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const result=inspect();
 await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));}
