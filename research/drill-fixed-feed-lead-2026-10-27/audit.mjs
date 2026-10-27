import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {fixture} from '../drill-moving-leads-2026-10-27/audit.mjs';
export {fixture};
export const fixedFeedChangedNames=new Set(['drill-feed-actuator-cover','drill-feed-service-lead',
 'drill-feed-cover-grommet','drill-feed-retention-ring','drill-feed-retention-tab']);
export const retainedBeforeFixedFeed=row=>!fixedFeedChangedNames.has(row.name);
export async function baseline(){
 const dir='../../archive/drill-fixed-feed-lead-2026-10-27/';
 const three=new URL('../../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href;
 let drive=(await readFile(new URL(dir+'drill-drive.mjs',import.meta.url),'utf8')).replace('./vendor/three/three.module.min.js?v=dev',three);
 let feed=(await readFile(new URL(dir+'drill-feed-stage.mjs',import.meta.url),'utf8'))
  .replace('./vendor/three/three.module.min.js?v=dev',three)
  .replace('./drill-drive.mjs?v=dev','data:text/javascript;base64,'+Buffer.from(drive).toString('base64'));
 let source=(await readFile(new URL(dir+'drills.mjs',import.meta.url),'utf8')).replace('./vendor/three/three.module.min.js?v=dev',three)
  .replace('./drill-feed-stage.mjs?v=dev','data:text/javascript;base64,'+Buffer.from(feed).toString('base64'));
 for(const file of ['drill-moving-leads.mjs','drill-carriage.mjs'])
  source=source.replace('./'+file+'?v=dev',new URL('../../dist/'+file+'?v=dev',import.meta.url).href);
 return fixture((await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildDrill);
}
export function report(){
 const f=fixture();return{scope:'One estimated fixed feed-drive service-lead example per drill; no flight circuit/connector count',
  rows:f.drills.map(d=>({side:d.drill.name,diameterM:.004,lengthM:d.fixedFeedLead.path.getLength(),
   bendRadiusM:d.fixedFeedLead.path.radius,motorLocal:d.fixedFeedLead.path.getPoint(0).toArray(),
   retentionLocal:d.fixedFeedLead.path.getPoint(1).toArray(),fixedFrame:true,flightMatingConfirmed:false})),
  open:['Exact motor electrical exit/circuit assignment','Flight cable construction','Sensor count/type','Remote controller continuation']};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)
 await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(report(),null,2)+'\n');
