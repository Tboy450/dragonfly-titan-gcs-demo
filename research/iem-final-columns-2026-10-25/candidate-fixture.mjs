import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
export const approvedIds=[4,13,21,22,23,24,25,26].map(n=>'iem-local-lead-'+n);
export async function baselineBuilder(){
 let source=await readFile(new URL('../../archive/iem-final-columns-2026-10-25/iem.mjs',import.meta.url),'utf8');
 for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs','iem-next-service-routes.mjs'])source=source.replace('./'+name+'?v=dev',new URL('../../dist/'+name+'?v=dev',import.meta.url).href);
 return(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildIem;
}
export async function candidateBuilder(){
 const rows=JSON.parse(await readFile(new URL('candidate-routes.json',import.meta.url),'utf8'));
 assert.deepEqual(rows.map(r=>r.id).sort(),[...approvedIds].sort(),'Complete approved set required');
 const routes={};
 for(const row of rows){
  const vertices=row.points.map(p=>new T.Vector3(...p)),points=[vertices[0].toArray()];
  for(let i=1;i<vertices.length;i++){
   const a=vertices[i-1],b=vertices[i],n=Math.ceil(a.distanceTo(b)/.001);
   for(let j=1;j<=n;j++)points.push(a.clone().lerp(b,j/n).toArray());
  }
  routes[row.id]=points.slice(1,-1);
 }
 let fittings={};try{fittings=JSON.parse(await readFile(new URL('fitting-placements.json',import.meta.url),'utf8'));}catch{}
 for(const id of approvedIds)fittings[id]??={supportFraction:.15,labelFraction:.25,labelOffsetZ:-.005,labelRoll:0,lacingFractions:[.35,.60]};
 let source=await readFile(new URL('../../archive/iem-final-columns-2026-10-25/iem.mjs',import.meta.url),'utf8');
 for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs','iem-next-service-routes.mjs'])source=source.replace('./'+name+'?v=dev',new URL('../../dist/'+name+'?v=dev',import.meta.url).href);
 source='const finalRoutes='+JSON.stringify(routes)+';\nconst finalFittings='+JSON.stringify(fittings)+';\n'+source;
 source=source.replace('harness.add(sixthColumn);','harness.add(sixthColumn);\n'+
  'const seventhColumn=new THREE.Group();seventhColumn.name="iem-seventh-column";seventhColumn.userData.inspectionLabel="Seventh-column service routing (estimate)";harness.add(seventhColumn);\n'+
  'const eighthColumn=new THREE.Group();eighthColumn.name="iem-eighth-column";eighthColumn.userData.inspectionLabel="Eighth-column service routing (estimate)";harness.add(eighthColumn);');
 source=source.replace('const target = lower ?', 'const target = i>=21 ? (i<23?seventhColumn:eighthColumn) : lower ?');
 source=source.replace('const points = next ?', 'const points = finalRoutes[`iem-local-lead-${i+1}`] ? [start,...finalRoutes[`iem-local-lead-${i+1}`],end] : next ?');
 source=source.replace('next ? 180 : service ? 80','finalRoutes[`iem-local-lead-${i+1}`] ? 180 : next ? 180 : service ? 80');
 source=source.replace('    if(next){',`    if(finalRoutes[cable.userData.connectionId]){
      const fit=finalFittings[cable.userData.connectionId],path=cable.geometry.parameters.path,p=path.getPointAt(fit.supportFraction);
      addCableSupport({wire:cable,fraction:fit.supportFraction,foot:fit.foot??[p.x,p.y,face-.004],normal:[0,0,-1],mounts,id:'iem-'+(i+1)});
      for(const f of fit.lacingFractions)addCableLacing({wire:cable,fraction:f,parent:target,id:'iem-'+(i+1)+'-'+f});
      cable.userData.routingReviewed=true;cable.userData.labelFraction=fit.labelFraction;
      label.position.copy(path.getPointAt(fit.labelFraction));label.position.z+=fit.labelOffsetZ;
      label.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),path.getTangentAt(fit.labelFraction));
      label.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),fit.labelRoll));
      return;
    }
    if(next){`);
 const builder=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildIem;
 return{builder,routes,fittings};
}
export async function candidateFixture(){
 const{builder}=await candidateBuilder(),parent=new T.Group();
 const mesh=(g,m,p,owner)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);owner.add(o);return o;};
 const result=builder({parent,mesh});parent.updateMatrixWorld(true);return{parent,...result};
}
