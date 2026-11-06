import * as T from '../../dist/vendor/three/three.module.min.js';
import {fullModel,triangles} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {bodyHits,surfacesCross} from '../draco-blower-pair-2026-10-27/audit.mjs';
import {bypassReliefBounds} from '../../dist/belly-bypass.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export {fullModel,triangles,surfacesCross};
export async function baseline(){
 const rewrite=(src,base)=>src.replace(/from ["'](\.{1,2}\/[^"'\n]+)["']/g,(_,p)=>'from '+JSON.stringify(new URL(p,base).href));
 const moduleURL=new URL('../../dist/vehicle-research.mjs',import.meta.url);
 const vehicle='data:text/javascript;base64,'+Buffer.from(rewrite(await readFile(new URL('../../archive/belly-bypass-2026-11-06/vehicle-research.mjs',import.meta.url),'utf8'),moduleURL)).toString('base64');
 const helper=new URL('../drill-moving-leads-2026-10-27/audit.mjs',import.meta.url);
 const src=rewrite(await readFile(helper,'utf8'),helper).replace(JSON.stringify(moduleURL.href),JSON.stringify(vehicle));
 return (await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'))).fullModel();
}
export function manifest(root,omit='body-foam-belly-surface'){
 const rows=[];root.traverse(o=>{if(!o.isMesh||o.name===omit)return;
  const hash=createHash('sha256');for(const [name,a]of Object.entries(o.geometry.attributes))hash.update(name).update(new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength));
  if(o.geometry.index)hash.update(new Uint8Array(o.geometry.index.array.buffer));
  rows.push({name:o.name,parent:o.parent.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),geometry:hash.digest('hex')});
 });return rows;
}
export function ray(from,to,objects){
 const direction=to.clone().sub(from),length=direction.length();return new T.Raycaster(from,direction.divideScalar(length),0,length).intersectObjects(objects,false);
}
export async function report(){
 const f=fullModel(),old=await baseline(),trim=f.subsystems['trim-chimneys'];
 const motion=[],belly=f.root.getObjectByName('body-foam-belly-surface');
 const flaps=[];trim.traverse(o=>{if(o.name.endsWith('diverter-flap'))flaps.push(o);});
 for(let angle=0;angle<=24;angle++)for(const flap of flaps){
  flap.parent.rotation.x=(flap.name.startsWith('aft')?1:-1)*angle*Math.PI/180;f.root.updateMatrixWorld(true);
  if(surfacesCross(flap,belly))motion.push({angle,flap:flap.name});
 }
 return {baseline:'874a0d6',footprints:bypassReliefBounds(f.subsystems.fuselage,trim),
  previousContacts:bodyHits(old.root,old.subsystems['trim-chimneys']),contacts:bodyHits(f.root,trim),flapBellyContacts:motion,
  unchangedOtherGeometry:JSON.stringify(manifest(f.root))===JSON.stringify(manifest(old.root)),
  scope:'Connected estimated surface-only opening. No local foam thickness, closing walls, flight tile seam, seal or thermal coefficient reconstructed.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const r=await report();await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r,null,2));}
