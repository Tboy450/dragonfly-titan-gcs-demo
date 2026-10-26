import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {fixture,gatheringPoint} from '../iem-middle-lead-2026-10-25/audit.mjs';
const ids=[4,13,21,22,23,24,25,26].map(n=>'iem-local-lead-'+n);
const{parent}=fixture(),wires=parent.getObjectsByProperty('name','iem-harness-cable');
const cell=.012,key=p=>p.toArray().map(v=>Math.floor(v/cell));
function sampled(path){
 const points=path.getSpacedPoints(Math.ceil(path.getLength()/.0005)),buckets=new Map();
 for(const p of points){p.gathering=gatheringPoint(p);const k=key(p).join(',');if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(p);}
 return{path,points,buckets};
}
let lastBlock;
function clear(a,b,gap=.00201){
 const d2=(.009+gap)**2;
 for(const p of a.points){const[x,y,z]=key(p);
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++)for(const q of b.buckets.get([x+i,y+j,z+k].join(','))??[])
   if(!(p.gathering&&q.gathering)&&p.distanceToSquared(q)<=d2){lastBlock={other:b.id,p:p.toArray(),q:q.toArray(),gap:p.distanceTo(q)-.009};return false;}
 }return true;
}
function candidate(row,dy=0,dz=0){
 const old=wires.find(w=>w.userData.connectionId===row.id).geometry.parameters.path;
 const vertices=row.points.map(p=>new T.Vector3(...p));vertices[0]=old.getPoint(0);vertices[vertices.length-1]=old.getPoint(1);
 // Offset boundary approaches slightly; the actual gathering test stays exact.
 for(let i=1;i<vertices.length-1;i++){
  const p=vertices[i];if(p.y>=.025)continue;
  const taper=T.MathUtils.clamp(Math.min((p.x+.147)/.01,(-.123-p.x)/.01),0,1);
  p.y=Math.max(.0036,p.y+dy*taper);
  p.z=Math.max(-.2094,p.z+dz*taper);
 }
 const controls=[vertices[0]];
 for(let i=1;i<vertices.length;i++){
  const a=vertices[i-1],b=vertices[i],n=Math.ceil(a.distanceTo(b)/.001);
  for(let j=1;j<=n;j++)controls.push(a.clone().lerp(b,j/n));
 }
 return{...row,...sampled(new T.CatmullRomCurve3(controls,false,'centripetal'))};
}
export async function selectCompatible({write=false}={}){
 let pool=[];try{pool=JSON.parse(await readFile(new URL('candidate-pool.json',import.meta.url),'utf8'));}catch{return{complete:false,counts:{},reason:'No candidate pool'};}
 const fixed=wires.filter(w=>!ids.includes(w.userData.connectionId)).map(w=>({id:w.userData.connectionId,...sampled(w.geometry.parameters.path)}));
 let serial=0;const domains=new Map(ids.map(id=>[id,[]])),rejected=[];
 for(const row of pool){if(!domains.has(row.id))continue;for(const[dy,dz]of[[0,0],[-.0007,0],[-.0007,-.0003],[.0005,0],[0,-.0005],[0,.0005]]){const c=candidate(row,dy,dz);c.serial=serial++;
  if(c.path.getLength()<c.path.getPoint(0).distanceTo(c.path.getPoint(1))*1.05)continue;
  if(fixed.some(f=>!clear(c,f,['iem-local-lead-5','iem-local-lead-7'].includes(f.id)?.00301:.00201))){rejected.push({id:row.id,seed:row.seed,...lastBlock});continue;}
  domains.get(row.id).push(c);
 }
 }
 for(const values of domains.values())values.sort((a,b)=>a.path.getLength()-b.path.getLength());
 const memo=new Map();let visits=0;
 const compatible=(a,b)=>{const key=[Math.min(a.serial,b.serial),Math.max(a.serial,b.serial)].join(',');if(!memo.has(key))memo.set(key,clear(a,b));return memo.get(key);};
 function solve(pending,chosen=[]){
  if(!pending.size)return chosen;if(visits++>200000)return null;
  const [id,values]=[...pending].sort((a,b)=>a[1].length-b[1].length)[0];
  for(const c of values){const remaining=new Map();let valid=true;
   for(const[other,options]of pending){if(other===id)continue;const filtered=options.filter(o=>compatible(c,o));if(!filtered.length){valid=false;break;}remaining.set(other,filtered);}
   if(valid){const result=solve(remaining,[...chosen,c]);if(result)return result;}
  }return null;
 }
 const pairOptions=[];
 const selected=solve(domains);let partial;
 if(!selected)for(const omitted of ids){const pending=new Map(domains);pending.delete(omitted);const found=solve(pending);if(found){partial={omitted,rows:found};break;}}
 const serialize=rows=>rows.map(({id,points:_,buckets,path,serial,...row})=>({id,...row,points:path.points.map(p=>p.toArray()),lengthM:path.getLength()}));
 if(partial)await writeFile(new URL('partial-selection.json',import.meta.url),JSON.stringify(serialize(partial.rows),null,2)+'\n');
 const report={complete:!!selected,partial:partial?{count:partial.rows.length,omitted:partial.omitted}:null,counts:Object.fromEntries([...domains].map(([id,d])=>[id,d.length])),visits,pairChecks:memo.size,pairOptions,rejected};
 if(selected&&write)await writeFile(new URL('candidate-routes.json',import.meta.url),JSON.stringify(selected.map(({id,points:_,buckets,path,serial,...row})=>({id,...row,points:path.points.map(p=>p.toArray()),lengthM:path.getLength()})),null,2)+'\n');
 return report;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)console.log(JSON.stringify(await selectCompatible({write:process.argv.includes('--write')})));
