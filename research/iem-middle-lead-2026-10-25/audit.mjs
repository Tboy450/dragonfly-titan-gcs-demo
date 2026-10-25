import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {pathToFileURL} from 'node:url';
import {buildIem} from '../../dist/iem.mjs';
export function fixture(builder=buildIem){
  const parent=new T.Group(),mesh=(g,m,p,owner)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);owner.add(o);return o;};
  const result=builder({parent,mesh});parent.updateMatrixWorld(true);return{parent,...result};
}
export const gatheringPoint=p=>p.x<-.135&&p.y<.025;
export function middleLeadAudit(builder=buildIem){
  const f=fixture(builder),wires=[];
  f.parent.traverse(o=>{if(o.name==='iem-harness-cable')wires.push(o);});
  const wire=wires.find(o=>o.userData.connectionId==='iem-local-lead-6'),curve=wire.geometry.parameters.path;
  let minGap=Infinity,closest=null,terminalMinGap=Infinity;
  const others=wires.filter(o=>o!==wire).map(o=>({id:o.userData.connectionId,r:o.geometry.parameters.radius,points:o.geometry.parameters.path.getSpacedPoints(700)}));
  for(const p of curve.getSpacedPoints(1000))for(const other of others)for(const q of other.points){
    const gap=p.distanceTo(q)-wire.geometry.parameters.radius-other.r;
    if(gatheringPoint(p)&&gatheringPoint(q)){terminalMinGap=Math.min(terminalMinGap,gap);continue;}
    if(gap<minGap){minGap=gap;closest={other:other.id,point:p.toArray(),neighbor:q.toArray()};}
  }
  return{lead:wire.userData.connectionId,start:curve.getPoint(0).toArray(),end:curve.getPoint(1).toArray(),
    radiusM:wire.geometry.parameters.radius,lengthM:curve.getLength(),freeSpanMinSurfaceGapM:minGap,closest,
    terminalMinSurfaceGapM:terminalMinGap,gatheringBoundary:'local x < -0.135 m AND y < 0.025 m for both samples',
    limits:'Dense sampled curve screen, not a qualified cable or continuous collision solver. Fixed gathering endpoints overlap; no remote circuit assigned.'};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const report=middleLeadAudit();
  if(process.argv.includes('--write')){
    const{writeFile}=await import('node:fs/promises');
    const{iemLeadAudit}=await import('../iem-service-bends-2026-10-24/audit.mjs');
    await writeFile(new URL('route-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
    await writeFile(new URL('endpoints.json',import.meta.url),JSON.stringify(iemLeadAudit(),null,2)+'\n');
  }
  console.log(JSON.stringify(report,null,2));
}
