import {pathToFileURL} from 'node:url';
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {fixture,gatheringPoint} from '../iem-middle-lead-2026-10-25/audit.mjs';
import {iemServiceAsset} from '../../dist/iem.mjs';
export const finalIds=Object.freeze(Array.from({length:5},(_,i)=>`iem-local-lead-${i+22}`));
export const reroutedIds=Object.freeze(['iem-local-lead-4','iem-local-lead-13','iem-local-lead-21',...finalIds]);
export const legacyIds=new Set();

export function pairAudit(builder){
 const{parent}=fixture(builder),samples=parent.getObjectsByProperty('name','iem-harness-cable').map(w=>({
  id:w.userData.connectionId,r:w.geometry.parameters.radius,
  points:w.geometry.parameters.path.getSpacedPoints(1200).map(p=>({x:p.x,y:p.y,z:p.z,gathering:gatheringPoint(p)})),
 })),pairs=[];
 for(let i=0;i<samples.length;i++)for(let j=i+1;j<samples.length;j++){
  const a=samples[i],b=samples[j];let free=Infinity,terminal=Infinity,closest;
  for(const p of a.points)for(const q of b.points){
   const inTerminal=p.gathering&&q.gathering,limit=inTerminal?terminal:free;
   const dx=p.x-q.x;if(dx*dx>=limit)continue;
   const dy=p.y-q.y;if(dx*dx+dy*dy>=limit)continue;
   const dz=p.z-q.z,d=dx*dx+dy*dy+dz*dz;if(d>=limit)continue;
   if(inTerminal)terminal=d;else{free=d;closest={a:[p.x,p.y,p.z],b:[q.x,q.y,q.z]};}
  }
  pairs.push({a:a.id,b:b.id,freeSpanMinSurfaceGapM:Math.sqrt(free)-a.r-b.r,
   terminalMinSurfaceGapM:Math.sqrt(terminal)-a.r-b.r,closest});
 }
 return pairs;
}

export function surfaceAudit(builder){
 const{parent,assembly}=fixture(builder),inverse=assembly.matrixWorld.clone().invert(),obstacles=[],nearest=new T.Vector3();
 parent.traverse(o=>{if(!o.isMesh||o.name==='iem-harness-cable')return;
  const position=o.geometry.attributes.position,index=o.geometry.index,m=inverse.clone().multiply(o.matrixWorld),triangles=[],box=new T.Box3();
  const vertex=n=>new T.Vector3().fromBufferAttribute(position,index?index.getX(n):n).applyMatrix4(m);
  for(let n=0;n<(index?index.count:position.count);n+=3){const t=new T.Triangle(vertex(n),vertex(n+1),vertex(n+2));triangles.push(t);box.expandByPoint(t.a).expandByPoint(t.b).expandByPoint(t.c);}
  obstacles.push({o,triangles,box});
 });
 return parent.getObjectsByProperty('name','iem-harness-cable').map(wire=>{
  const id=wire.userData.connectionId,path=wire.geometry.parameters.path;let gap=Infinity,closest;
  for(const p of path.getSpacedPoints(1400))for(const{o,triangles,box}of obstacles){
   if(box.distanceToPoint(p)>.006||o.userData.wireId===id)continue;
   if(o.userData.connectionId===id){
    if(o.name==='iem-harness-backshell'&&p.distanceTo(path.getPoint(0))<.014)continue;
    if(o.name==='iem-harness-label'&&Number.isFinite(wire.userData.labelFraction)&&p.distanceTo(path.getPointAt(wire.userData.labelFraction))<.015)continue;
    if(o.name==='iem-service-lacing'&&p.distanceTo(o.position)<.014)continue;
    const n=Number(id.split('-').at(-1))-1;
    if(n<4&&o.name.startsWith('iem-service-')&&p.distanceTo(path.getPointAt(iemServiceAsset.supportFractions[n]))<.015)continue;
   }
   if(o.name==='iem-harness-tie'&&gatheringPoint(p)&&p.distanceTo(path.getPoint(1))<.016)continue;
   for(const t of triangles){t.closestPointToPoint(p,nearest);const d=p.distanceTo(nearest)-wire.geometry.parameters.radius;
    if(d<gap){gap=d;closest={name:o.name,id:o.userData.connectionId??o.userData.wireId,point:p.toArray()};}
   }
  }
  return{id,minSurfaceGapM:Number.isFinite(gap)?gap:null,closest};
 });
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const{iemLeadAudit}=await import('../iem-service-bends-2026-10-24/audit.mjs');
 const report={pairs:pairAudit(),surfaces:surfaceAudit(),
  limits:'EST; all 26 local routes, no legacy exclusions. Sampled free spans only; fixed terminal gathering and bounded own contacts unchanged. No flight qualification.'};
 if(process.argv.includes('--write')){
  const{writeFile}=await import('node:fs/promises');
  await writeFile(new URL('route-checks.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  await writeFile(new URL('endpoints.json',import.meta.url),JSON.stringify(iemLeadAudit(),null,2)+'\n');
 }
 console.log(JSON.stringify({pairs:report.pairs.length,
  badFree:report.pairs.filter(r=>r.freeSpanMinSurfaceGapM<=.002),
  badSurfaces:report.surfaces.filter(r=>r.minSurfaceGapM!==null&&r.minSurfaceGapM<=-.0001)},null,2));
}
