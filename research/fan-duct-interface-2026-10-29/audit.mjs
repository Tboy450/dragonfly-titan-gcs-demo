import * as T from '../../dist/vendor/three/three.module.min.js';
import {buildWarmDuct,fanDuctInterfaceAsset,thermalLoopAsset} from '../../dist/thermal-loop.mjs';
import {fullModel} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {bodyHits} from '../draco-blower-pair-2026-10-27/audit.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export const targetName='warm-duct-fan-transition';
export const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
export function build(builder=buildWarmDuct){const root=new T.Group();const result=builder({parent:root,mesh});root.updateMatrixWorld(true);return{root,result,transition:root.getObjectByName(targetName)};}
export async function baseline(){
 let source=await readFile(new URL('../../archive/fan-duct-interface-2026-10-29/thermal-loop.mjs',import.meta.url),'utf8');
 source=source.replace(/from "(\.\/[^"\n]+)"/g,(_,p)=>'from "'+new URL('../../dist/'+p.slice(2),import.meta.url).href+'"');
 return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
export async function report(){
 const f=fullModel(),current=f.root.getObjectByName(targetName),old=build((await baseline()).buildWarmDuct).transition;
 const now=new T.Box3().setFromObject(current),before=new T.Box3().setFromObject(old);
 const contacts=bodyHits(f.root,current),g=current.geometry,p=current.position.clone(),q=current.quaternion.clone();
 current.geometry=old.geometry;current.position.copy(old.position);current.quaternion.copy(old.quaternion);f.root.updateMatrixWorld(true);
 const originalContacts=bodyHits(f.root,current);
 current.geometry=g;current.position.copy(p);current.quaternion.copy(q);f.root.updateMatrixWorld(true);
 const peers=['fan-a','fan-b'].map(name=>{
  const flange=f.root.getObjectByName(name+'-flange'),b=new T.Box3().setFromObject(flange);
  return{fan:name,flangeFrontZ:b.min.z,oldGapM:b.min.z-before.max.z,newGapM:b.min.z-now.max.z};
 });
 const runBox=new T.Box3().setFromObject(f.root.getObjectByName('warm-duct-run'));
 return{scope:'Generic one-piece transition shell; no complete fluid path/flight attachment claim',asset:fanDuctInterfaceAsset,oldBounds:{min:before.min.toArray(),max:before.max.toArray()},newBounds:{min:now.min.toArray(),max:now.max.toArray()},ductSeatGapM:now.min.z-runBox.max.z,peers,contacts,originalContacts,remaining:'Main run/nose outlet and aft adapter/bulkhead internals remain unresolved; no solver or geometry changes there',sourceFanCenters:thermalLoopAsset.fans.centers};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const r=await report();await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));}
