import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {fixture} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {driveChangedNames} from '../drill-drive-2026-10-27/audit.mjs';
export {fixture};
export const carriageChangedNames=new Set(['drill-z-rail','drill-guide-groove',
 'drill-carriage-bracket','drill-carriage-bolt','drill-lead-nut','drill-cam-roller',
 'drill-roller-stud','drill-roller-stud-cap','drill-roller-support','drill-nut-pocket','drill-nut-pocket-ear']);
// The next drive pass separately guards its exact archive; do not weaken carriage checks.
export const retainedBeforeCarriage=row=>!carriageChangedNames.has(row.name)&&!driveChangedNames.has(row.name);
export async function baseline(){
 let source=await readFile(new URL('../../archive/drill-carriage-2026-10-27/drills.mjs',import.meta.url),'utf8');
 let feed=await readFile(new URL('../../archive/drill-carriage-2026-10-27/drill-feed-stage.mjs',import.meta.url),'utf8');
 const three=new URL('../../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href;
 feed=feed.replace('./vendor/three/three.module.min.js?v=dev',three);
 source=source.replace('./vendor/three/three.module.min.js?v=dev',three)
  .replace('./drill-moving-leads.mjs?v=dev',new URL('../../dist/drill-moving-leads.mjs?v=dev',import.meta.url).href)
  .replace('./drill-feed-stage.mjs?v=dev','data:text/javascript;base64,'+Buffer.from(feed).toString('base64'));
 return fixture((await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildDrill);
}
export function report(){
 const f=fixture();return{scope:'EM1-informed exterior approximation, not flight geometry or a friction solver',
  rollerCountPerDrill:6,rollerRadiusM:.0045,rollerWidthM:.005,nutBoreRadiusM:.005,
  shaftRadiusM:.004,radialShaftGapM:.001,
  poses:[0,.065,.13].map(feed=>({feedM:feed,rollerAngleMagnitudeRad:feed/.0045,
   contactY:[.175,.190,.205].map(y=>-.72-feed+y)})),
  preserved:['130 mm feed','Bit depth','All hose paths','All moving lead paths','Drive covers and sleeves'],
  open:['Flight configuration/dimensions','Upper drive universal-joint interior','Helical threads and needle rollers',
   'Friction, eccentric adjustment, thermal contraction and bearing fatigue','Feed/sensor and remote wiring']};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(report(),null,2)+'\n');
}
