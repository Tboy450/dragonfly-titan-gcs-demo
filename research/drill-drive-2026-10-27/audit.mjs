import * as T from '../../dist/vendor/three/three.module.min.js';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {fixture} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {fixedFeedChangedNames} from '../drill-fixed-feed-lead-2026-10-27/audit.mjs';
export {fixture};
export const driveChangedNames=new Set(['drill-body-mount','drill-feed-actuator-foot',
 'drill-feed-joint-cover','drill-feed-actuator-cover','drill-drive-motor-shoe',
 'drill-drive-input-neck','drill-drive-input-envelope','drill-drive-output-envelope',
 'drill-drive-output-flange','drill-drive-lower-adapter','drill-drive-gearbox-fastener','drill-drive-flange-fastener',...fixedFeedChangedNames]);
export const retainedBeforeDrive=row=>!driveChangedNames.has(row.name);
export async function baseline(){
 let source=await readFile(new URL('../../archive/drill-drive-2026-10-27/drills.mjs',import.meta.url),'utf8');
 let feed=await readFile(new URL('../../archive/drill-drive-2026-10-27/drill-feed-stage.mjs',import.meta.url),'utf8');
 const three=new URL('../../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href;
 feed=feed.replace('./vendor/three/three.module.min.js?v=dev',three);
 source=source.replace('./vendor/three/three.module.min.js?v=dev',three)
  .replace('./drill-moving-leads.mjs?v=dev',new URL('../../dist/drill-moving-leads.mjs?v=dev',import.meta.url).href)
  .replace('./drill-carriage.mjs?v=dev',new URL('../../dist/drill-carriage.mjs?v=dev',import.meta.url).href)
  .replace('./drill-feed-stage.mjs?v=dev','data:text/javascript;base64,'+Buffer.from(feed).toString('base64'));
 return fixture((await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildDrill);
}
export async function report(){
 const before=await baseline(),after=fixture(),rows=[];
 for(let i=0;i<2;i++){
  const old=before.drills[i],d=after.drills[i],bound=o=>new T.Box3().setFromObject(o);
  const mount=g=>g.stage.getObjectsByProperty('name','drill-body-mount').sort((a,b)=>b.position.y-a.position.y)[0];
  const oldScrew=bound(old.stage.getObjectByName('drill-lead-screw'));
  const oldGearbox=bound(old.feedStage.casings.getObjectByName('drill-z-gearhead'));
  const screw=bound(d.stage.getObjectByName('drill-lead-screw')),m=bound(mount(d));
  rows.push({side:d.drill.name,oldGapAboveScrewM:oldGearbox.min.y-oldScrew.max.y,
   oldUpperMountCrossesScrew:bound(mount(old)).intersectsBox(oldScrew),
   upperMountFrontZLocalM:.029,upperMountToScrewGapM:screw.min.z-m.max.z,
   outputEnvelopeYLocalM:[-.28,-.20],jointBoreRadiusM:.006,shaftRadiusM:.004,
   boreRadialGapM:.002,lowerMountAndCarriageRetained:true});
 }
 return{scope:'Geometric seating and relief only; no actual flight load-path/strength validation',rows,
  open:['Covered joint forks and gearbox internals','Flight motor, dimensions and mount design','Feed/sensor and remote wiring','Physical alignment/friction/thermal contraction']};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)
 await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(await report(),null,2)+'\n');
