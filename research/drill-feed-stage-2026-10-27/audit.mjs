import * as T from '../../dist/vendor/three/three.module.min.js';
import {buildDrill} from '../../dist/drills.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {carriageChangedNames} from '../drill-carriage-2026-10-27/audit.mjs';

// Every allowed change is checked against an archive in the new feed-stage suite.
export const feedChangedNames=new Set(['drill-z-rail','drill-z-motor','drill-z-gearhead',
 'drill-carriage-bracket','drill-carriage-bolt','drill-guide-groove','drill-body-mount',
 'drill-feed-actuator-cover','drill-feed-joint-cover','drill-upper-dust-bellows','drill-lower-dust-bellows',
 'drill-bellows-upper-fixed-collar','drill-bellows-lower-fixed-collar','drill-bellows-upper-moving-collar','drill-bellows-lower-moving-collar',
 'drill-bellows-lower-stand','drill-feed-actuator-foot',...carriageChangedNames]);
export const retainedBeforeFeedStage=row=>!feedChangedNames.has(row.name);
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
export function fixture(builder=buildDrill){const root=new T.Group(),drills=[-1,1].map(side=>builder({parent:root,mesh,side}));root.updateMatrixWorld(true);return{root,drills};}
export async function baseline(){
 let source=await readFile(new URL('../../archive/drill-feed-stage-2026-10-27/drills.mjs',import.meta.url),'utf8');
 for(const file of ['vendor/three/three.module.min.js','drill-moving-leads.mjs'])source=source.replace(`./${file}?v=dev`,new URL(`../../dist/${file}?v=dev`,import.meta.url).href);
 return fixture((await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildDrill);
}
export function report(){
 const f=fixture(),rows=[];
 for(const d of f.drills)for(const feed of [0,.065,.13]){
  d.setFeed(feed);f.root.updateMatrixWorld(true);
  const bounds=o=>{const b=new T.Box3().setFromObject(o);return{min:b.min.toArray(),max:b.max.toArray(),lengthM:b.max.y-b.min.y};};
  rows.push({side:d.drill.name,feedM:feed,upper:bounds(d.feedStage.upper),lower:bounds(d.feedStage.lower),
   bitTipY:bounds(d.bit).min[1],wireLengthsM:d.cables.map(c=>c.path.length)});
 }
 return{scope:'Photo-informed exterior feed-stage illustration; geometry and travel remain estimated',rows,
  open:['Detailed roller carriage/V grooves','Self-aligning leadnut and universal joint internals','Actual flight stroke and envelope','Actuator and feed wiring','Film thickness/creases and fatigue mechanics']};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(report(),null,2)+'\n');console.log(JSON.stringify(report(),null,2));}
