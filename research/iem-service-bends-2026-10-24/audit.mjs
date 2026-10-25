import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {pathToFileURL} from 'node:url';
import {buildIem,iemAsset} from '../../dist/iem.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
export function iemLeadAudit(){
 const parent=new T.Group();buildIem({parent,mesh});parent.updateMatrixWorld(true);const rows=[];
 parent.traverse(o=>{if(o.name!=='iem-harness-cable')return;const path=o.geometry.parameters.path;
 rows.push({id:o.userData.connectionId,servicePair:o.userData.servicePair,confidence:'EST',flightMatingConfirmed:false,
 start:path.getPoint(0).applyMatrix4(o.matrixWorld).toArray(),end:path.getPoint(1).applyMatrix4(o.matrixWorld).toArray(),radiusM:o.geometry.parameters.radius,lengthM:path.getLength(),
 limits:'Photo-inspired model lead only; connector identity, flight destination and electrical topology unverified.'});});
 return{revision:iemAsset.revision,frame:'construction metres: +x starboard, +y up, +z aft',rows,missing:`Remaining ${rows.filter(r=>!r.servicePair).length} local leads retain prior paths; full IEM installation, redundancy and circuit identities remain unresolved. Bay branch endpoints unchanged.`};
}
if(process.argv.includes('--write')&&process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){const{writeFile}=await import('node:fs/promises');const report=iemLeadAudit();await writeFile(new URL('endpoints.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({leads:report.rows.length,refined:report.rows.filter(r=>r.servicePair).length}));}
