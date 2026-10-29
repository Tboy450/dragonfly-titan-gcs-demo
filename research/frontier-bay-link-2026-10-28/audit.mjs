import * as T from '../../dist/vendor/three/three.module.min.js';
import {frontierBayInterface as A} from '../../dist/frontier-bay-interface.mjs';
import {fullModel} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {buildEndpointAudit} from '../harness-endpoints-2026-10-23/audit.mjs';
import {bodyHits} from '../draco-blower-pair-2026-10-27/audit.mjs';
import {writeFile} from 'node:fs/promises';
const f=fullModel(),link=f.subsystems['radio-harness-link'],wire=link.getObjectByName('main-harness-radio'),path=wire.geometry.parameters.path;
let minRadiusM=Infinity;
for(let i=1;i<1000;i++){
 const a=path.getPointAt((i-1)/1000),b=path.getPointAt(i/1000),c=path.getPointAt((i+1)/1000),ab=b.clone().sub(a),bc=c.clone().sub(b),cross=ab.clone().cross(bc).length();
 if(cross>1e-12)minRadiusM=Math.min(minRadiusM,ab.length()*bc.length()*c.distanceTo(a)/(2*cross));
}
const row=buildEndpointAudit().routes.find(o=>o.owner==='radio');
await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify({
 scope:'Illustrative external mating at photo J22; not assigned flight wiring',interface:A,
 cableDiameterM:2*A.cableRadiusM,oldEstimatedDiameterM:.014,lengthM:path.getLength(),
 sampledMinimumCenterlineRadiusM:minRadiusM,ratedBendLimitKnown:false,
 end:path.getPoint(1).toArray(),terminalTangent:path.getTangent(1).toArray(),
 bodySurfaceContacts:bodyHits(f.root,link),intendedContact:'J22 insert front plane; numerical face contact, no changed receptacle',
 endpointStatus:row.status,flightTopologyConfirmed:row.flightTopologyConfirmed,
 sourceRadioGeometryChanged:false,otherHarnessRoutesChanged:false,
},null,2)+'\n');
