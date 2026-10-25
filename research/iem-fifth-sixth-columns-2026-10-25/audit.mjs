import {pathToFileURL} from 'node:url';
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {fixture,gatheringPoint} from '../iem-middle-lead-2026-10-25/audit.mjs';
export const nextIds=Object.freeze(Array.from({length:7},(_,i)=>`iem-local-lead-${i+15}`));
export const legacyIds=new Set(Array.from({length:5},(_,i)=>`iem-local-lead-${i+22}`));

export function routeAudit(){
 const{parent}=fixture(),wires=parent.getObjectsByProperty('name','iem-harness-cable');
 const samples=wires.map(w=>({wire:w,id:w.userData.connectionId,r:w.geometry.parameters.radius,points:w.geometry.parameters.path.getSpacedPoints(1000)}));
 return nextIds.map(id=>{
  const wire=wires.find(w=>w.userData.connectionId===id),path=wire.geometry.parameters.path;
  const row={id,lengthM:path.getLength(),directM:path.getPoint(0).distanceTo(path.getPoint(1)),
   freeSpanMinSurfaceGapM:Infinity,terminalMinSurfaceGapM:Infinity,legacyFreeSpanMinSurfaceGapM:Infinity};
  for(const p of path.getSpacedPoints(1200))for(const other of samples){if(other.wire===wire)continue;
   for(const q of other.points){const d=p.distanceTo(q)-.0045-other.r;
    if(gatheringPoint(p)&&gatheringPoint(q)){row.terminalMinSurfaceGapM=Math.min(row.terminalMinSurfaceGapM,d);continue;}
    if(legacyIds.has(other.id)){row.legacyFreeSpanMinSurfaceGapM=Math.min(row.legacyFreeSpanMinSurfaceGapM,d);continue;}
    if(d<row.freeSpanMinSurfaceGapM){row.freeSpanMinSurfaceGapM=d;row.closest={other:other.id,p:p.toArray(),q:q.toArray()};}
   }
  }
  return row;
 });
}

export function meshObstacles(parent,assembly){
 const inverse=assembly.matrixWorld.clone().invert(),obstacles=[];
 parent.traverse(o=>{if(!o.isMesh||o.name==='iem-harness-cable'||(o.name==='iem-harness-label'&&legacyIds.has(o.userData.connectionId)))return;
  const p=o.geometry.attributes.position,index=o.geometry.index,m=inverse.clone().multiply(o.matrixWorld),triangles=[],box=new T.Box3();
  const vertex=n=>new T.Vector3().fromBufferAttribute(p,index?index.getX(n):n).applyMatrix4(m);
  for(let n=0;n<(index?index.count:p.count);n+=3){const t=new T.Triangle(vertex(n),vertex(n+1),vertex(n+2));triangles.push(t);box.expandByPoint(t.a).expandByPoint(t.b).expandByPoint(t.c);}
  obstacles.push({o,triangles,box});
 });return obstacles;
}

export function surfaceAudit({legacy=false}={}){
 const{parent,assembly}=fixture(),obstacles=meshObstacles(parent,assembly),nearest=new T.Vector3(),rows=[];
 // Both directions: new wires versus every rebuilt fitting, and the old fourteen
 // wires versus newly added fittings. Legacy 22-26 labels remain placeholders.
 for(const wire of parent.getObjectsByProperty('name','iem-harness-cable')){
  const id=wire.userData.connectionId;if(legacy!==legacyIds.has(id))continue;
  const path=wire.geometry.parameters.path;let gap=Infinity,closest;
  for(const point of path.getSpacedPoints(1200))for(const{o,triangles,box}of obstacles){
   if(!nextIds.includes(id)&&!nextIds.includes(o.userData.wireId)&&!nextIds.includes(o.userData.connectionId))continue;
   if(box.distanceToPoint(point)>.006||o.userData.wireId===id)continue;
   if(o.userData.connectionId===id&&o.name==='iem-harness-backshell'&&point.distanceTo(path.getPoint(0))<.014)continue;
   if(o.userData.connectionId===id&&o.name==='iem-harness-label'&&point.distanceTo(path.getPointAt(wire.userData.labelFraction))<.015)continue;
   if(o.name==='iem-harness-tie'&&gatheringPoint(point)&&point.distanceTo(path.getPoint(1))<.016)continue;
   for(const t of triangles){t.closestPointToPoint(point,nearest);const d=point.distanceTo(nearest)-.0045;
    if(d<gap){gap=d;closest={name:o.name,id:o.userData.connectionId??o.userData.wireId,point:point.toArray()};}
   }
  }
  rows.push({id,minSurfaceGapM:Number.isFinite(gap)?gap:null,closest});
 }return rows;
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const report={routes:routeAudit(),surfaces:surfaceAudit(),legacyFittingContacts:surfaceAudit({legacy:true}),limits:'EST; dense sampled screens, not continuous collision certification. Fixed terminal region unchanged; legacy 22-26 wire/label/fitting interference deferred and reported separately.'};
 if(process.argv.includes('--write')){
  const{writeFile}=await import('node:fs/promises');const{iemLeadAudit}=await import('../iem-service-bends-2026-10-24/audit.mjs');
  await writeFile(new URL('route-checks.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  await writeFile(new URL('endpoints.json',import.meta.url),JSON.stringify(iemLeadAudit(),null,2)+'\n');
 }
 console.log(JSON.stringify(report,null,2));
}
