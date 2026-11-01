import * as T from '../../dist/vendor/three/three.module.min.js';
import {fullModel} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {bodyHits,surfacesCross} from '../draco-blower-pair-2026-10-27/audit.mjs';
import {buildWarmDuct,buildTrimDevice,thermalLoopAsset} from '../../dist/thermal-loop.mjs';
import {trimInterfaceAsset,trimRiserRings} from '../../dist/trim-interfaces.mjs';
import {snapshots,mesh} from '../warm-duct-passages-2026-10-30/audit.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export {mesh,snapshots,surfacesCross};
export function build(warm=buildWarmDuct,trim=buildTrimDevice){const root=new T.Group();warm({parent:root,mesh});const device=trim({parent:root,mesh});root.updateMatrixWorld(true);return {root,device};}
export async function baseline(){
 const imports=s=>s.replace(/from ["'](\.\/[^"'\n]+)["']/g,(_,p)=>'from "'+new URL('../../dist/'+p.slice(2),import.meta.url).href+'"');
 const warm='data:text/javascript;base64,'+Buffer.from(imports(await readFile(new URL('../../archive/trim-interfaces-2026-11-01/warm-duct-passages.mjs',import.meta.url),'utf8'))).toString('base64');
 let src=await readFile(new URL('../../archive/trim-interfaces-2026-11-01/thermal-loop.mjs',import.meta.url),'utf8');
 src=src.replace('"./warm-duct-passages.mjs?v=dev"',JSON.stringify(warm));
 return import('data:text/javascript;base64,'+Buffer.from(imports(src)).toString('base64'));
}
export async function report(){
 const f=fullModel(),owner=f.subsystems['trim-chimneys'],warm=f.subsystems['underfloor-duct'];
 const contacts=bodyHits(f.root,owner),warmContacts=bodyHits(f.root,warm);
 const original=await baseline(),a=[...owner.children],b=[...warm.children];owner.clear();warm.clear();
 original.buildTrimDevice({parent:owner,mesh});original.buildWarmDuct({parent:warm,mesh});f.root.updateMatrixWorld(true);
 const oldContacts=bodyHits(f.root,owner),oldWarmContacts=bodyHits(f.root,warm);
 owner.clear();warm.clear();a.forEach(o=>owner.add(o));b.forEach(o=>warm.add(o));f.root.updateMatrixWorld(true);
 const local=build(),motion=[];
 for(let deg=0;deg<=24;deg++){
  for(const {hinge,dir}of local.device.flaps)hinge.rotation.x=dir*deg*Math.PI/180;local.root.updateMatrixWorld(true);
  const fixed=[];local.root.traverse(o=>{if(o.isMesh&&!o.name.endsWith('diverter-flap'))fixed.push(o);});
  for(const {hinge}of local.device.flaps)for(const flap of hinge.children)for(const target of fixed){
   if(new T.Box3().setFromObject(flap).intersectsBox(new T.Box3().setFromObject(target))&&surfacesCross(flap,target))motion.push({deg,flap:flap.name,other:target.name});
  }
 }
 const oldKeys=new Set(oldContacts.map(o=>JSON.stringify(o)));
 return {asset:trimInterfaceAsset,contacts,oldContacts,warmContacts,oldWarmContacts,newContactPairs:contacts.filter(o=>!oldKeys.has(JSON.stringify(o))),motion,
  rings:Object.fromEntries(['front','aft'].map(end=>[end,trimRiserRings(thermalLoopAsset.duct,thermalLoopAsset.coldDuct,thermalLoopAsset.diverters,end)])),
  scope:'Estimated fitted inspection shells. No fluid solver, flight interface, foam thickness or seal qualification.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const data=await report();await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({...data,rings:'See measurements.json'},null,2));}
