import {pathToFileURL} from 'node:url';
import {fixture,gatheringPoint} from '../iem-middle-lead-2026-10-25/audit.mjs';
export const pairIds=Object.freeze(['iem-local-lead-12','iem-local-lead-13','iem-local-lead-14']);
export function pairAudit(){
 const{parent}=fixture(),wires=parent.getObjectsByProperty('name','iem-harness-cable');
 const samples=wires.map(w=>({wire:w,id:w.userData.connectionId,r:w.geometry.parameters.radius,points:w.geometry.parameters.path.getSpacedPoints(800)}));
 return pairIds.map(id=>{
  const wire=wires.find(w=>w.userData.connectionId===id),path=wire.geometry.parameters.path;
  let gap=Infinity,terminalGap=Infinity,closest;
  for(const p of path.getSpacedPoints(1100))for(const other of samples){if(other.wire===wire)continue;
   for(const q of other.points){const d=p.distanceTo(q)-.0045-other.r;
    if(gatheringPoint(p)&&gatheringPoint(q)){terminalGap=Math.min(terminalGap,d);continue;}
    if(d<gap){gap=d;closest={other:other.id,p:p.toArray(),q:q.toArray()};}
   }
  }
  return{id,lengthM:path.getLength(),freeSpanMinSurfaceGapM:gap,terminalMinSurfaceGapM:terminalGap,closest,
   limits:'EST; sampled free span outside unchanged terminal gathering zone, not flight installation.'};
 });
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const report=pairAudit();
 if(process.argv.includes('--write')){const{writeFile}=await import('node:fs/promises');const{iemLeadAudit}=await import('../iem-service-bends-2026-10-24/audit.mjs');
  await writeFile(new URL('route-checks.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  await writeFile(new URL('endpoints.json',import.meta.url),JSON.stringify(iemLeadAudit(),null,2)+'\n');
 }
 console.log(JSON.stringify(report,null,2));
}
