import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {fixture} from '../iem-middle-lead-2026-10-25/audit.mjs';
import {pairAudit,surfaceAudit} from '../iem-final-columns-2026-10-25/audit.mjs';
export async function baselineBuilder(){
 let source=await readFile(new URL('../../archive/iem-terminal-cleanup-2026-10-26/iem.mjs',import.meta.url),'utf8');
 for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs','iem-next-service-routes.mjs','iem-final-service-routes.mjs'])source=source.replace('./'+name+'?v=dev',new URL('../../dist/'+name+'?v=dev',import.meta.url).href);
 return(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildIem;
}
export async function candidateBuilder(){
 let source=await readFile(new URL('../../archive/iem-terminal-cleanup-2026-10-26/iem.mjs',import.meta.url),'utf8');
 source=source.replace(/\r\n/g,'\n');
 for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs','iem-next-service-routes.mjs','iem-final-service-routes.mjs'])source=source.replace('./'+name+'?v=dev',new URL('../../dist/'+name+'?v=dev',import.meta.url).href);
 source=source.replace('label.position.z-=.005;\n      label.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),path.getTangentAt(cable.userData.labelFraction));\n    }\n    if(middle)',`label.position.z-=.005;
      label.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),path.getTangentAt(cable.userData.labelFraction));
      if(i===7){
        const normal=new THREE.Vector3(0,0,1).applyQuaternion(label.quaternion);
        if(normal.z>0)normal.negate();
        label.position.copy(path.getPointAt(cable.userData.labelFraction)).addScaledVector(normal,iemServiceAsset.radiusM+label.geometry.parameters.depth/2);
      }
    }
    if(middle)`);
 source=source.replace('for (const k of [0, 1, 2]) box([0.016, 0.014, 0.012], [-PW / 2 - 0.026, 0.01, z0 - 0.024 + k * 0.007], kapton, harness, "iem-harness-tie");',`
  const wrapThickness=.0003,wrapWidth=.016,wrapHeight=.014,wrapDepth=.012,wrapY=.01,wrapX=-PW/2-.026;
  for(const k of [0,1,2]){
    const wrapZ=z0-.024+k*.007;
    for(const sign of [-1,1]){
      box([wrapWidth,wrapThickness,wrapDepth],[wrapX,wrapY+sign*(wrapHeight-wrapThickness)/2,wrapZ],kapton,harness,"iem-harness-tie");
      box([wrapThickness,wrapHeight-2*wrapThickness,wrapDepth],[wrapX+sign*(wrapWidth-wrapThickness)/2,wrapY,wrapZ],kapton,harness,"iem-harness-tie");
    }
  }`);
 return(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildIem;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const builder=await candidateBuilder(),before=await baselineBuilder(),surfaces=surfaceAudit(builder),pairs=pairAudit(builder);
 const report={baselineLead8:surfaceAudit(before).find(r=>r.id==='iem-local-lead-8'),surfaces,
  pairsUnchanged:JSON.stringify(pairs)===JSON.stringify(pairAudit(before)),
  badSurfaces:surfaces.filter(r=>r.minSurfaceGapM!==null&&r.minSurfaceGapM<=-.0001)};
 await writeFile(new URL('candidate-checks.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({lead8:surfaces.find(r=>r.id==='iem-local-lead-8'),pairsUnchanged:report.pairsUnchanged,badSurfaces:report.badSurfaces},null,2));
}
