import * as T from '../../dist/vendor/three/three.module.min.js';
import {buildWarmDuct,thermalLoopAsset} from '../../dist/thermal-loop.mjs';
import {warmDuctPassageAsset,warmDuctNoseSections,warmDuctChangedNames} from '../../dist/warm-duct-passages.mjs';
import {fullModel} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {bodyHits} from '../draco-blower-pair-2026-10-27/audit.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
export function build(builder=buildWarmDuct){const root=new T.Group();builder({parent:root,mesh});root.updateMatrixWorld(true);return root;}
export async function baseline(){let src=await readFile(new URL('../../archive/warm-duct-passages-2026-10-30/thermal-loop.mjs',import.meta.url),'utf8');
 src=src.replace(/from "(\.\/[^"\n]+)"/g,(_,p)=>'from "'+new URL('../../dist/'+p.slice(2),import.meta.url).href+'"');
 return import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
}
export function snapshots(root,omit=()=>false){const rows=[];root.traverse(o=>{if(o.isMesh&&!omit(o.name))rows.push({name:o.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),vertices:Array.from(o.geometry.attributes.position.array),indices:o.geometry.index?Array.from(o.geometry.index.array):null});});return rows;}
export async function report(){
 const previous=await baseline(),f=fullModel(),owner=f.subsystems['underfloor-duct'];
 const currentContacts=bodyHits(f.root,owner),bounds={};
 owner.traverse(o=>{if(o.isMesh&&warmDuctChangedNames.includes(o.name)){const b=new T.Box3().setFromObject(o);bounds[o.name]={min:b.min.toArray(),max:b.max.toArray()};}});
 const children=[...owner.children];owner.clear();previous.buildWarmDuct({parent:owner,mesh});f.root.updateMatrixWorld(true);
 const originalContacts=bodyHits(f.root,owner);owner.clear();children.forEach(o=>owner.add(o));f.root.updateMatrixWorld(true);
 const keys=new Set(originalContacts.map(o=>JSON.stringify(o))),nose=warmDuctNoseSections(thermalLoopAsset.duct);
 return {scope:'Part18 generic open shells; no complete fluid path or flight interface claim',asset:warmDuctPassageAsset,
  noseRadiusM:nose.radiusM,noseTurnDeg:nose.angleRad*180/Math.PI,bounds,currentContacts,originalContacts,
  newContactPairs:currentContacts.filter(o=>!keys.has(JSON.stringify(o))),
  remaining:'Unchanged trim risers/flaps, cold-duct openings and aft collar/bulkhead penetration remain unresolved. No simulated gas/power/temperature inputs changed.'};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){const data=await report();await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify(data,null,2));}
