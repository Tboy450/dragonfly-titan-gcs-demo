import {readFile,writeFile} from 'node:fs/promises';
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {fixture,gatheringPoint} from '../iem-middle-lead-2026-10-25/audit.mjs';

// Local repair of gathering-zone approaches. Screen contacts more tightly
// than acceptance; do not enlarge the inherited 16 mm own-terminal exception.
const url=new URL('candidate-routes.json',import.meta.url),rows=JSON.parse(await readFile(url,'utf8'));
const{parent}=fixture(),ties=parent.getObjectsByProperty('name','iem-harness-tie');
for(const id of [15,16,18,19,20,21]){
 const row=rows.find(r=>r.id===`iem-local-lead-${id}`),points=row.points.map(p=>new T.Vector3(...p)),end=points.at(-1);
 const begin=points.findIndex((p,i)=>i>0&&p.x<-.14&&p.y<.022&&points.slice(i).every(gatheringPoint));
 if(begin<0)throw Error('No bounded terminal approach '+id);
 const start=points[begin],boxes=ties.map(o=>new T.Box3().setFromCenterAndSize(o.position,new T.Vector3(.016,.014,.012)));
 const neighbors=parent.getObjectsByProperty('name','iem-harness-cable')
  .filter(o=>o.userData.connectionId!==row.id&&Number(o.userData.connectionId.split('-').at(-1))<=21)
  .flatMap(o=>o.geometry.parameters.path.getSpacedPoints(1400).map(p=>({p,clearance:['iem-local-lead-5','iem-local-lead-7'].includes(o.userData.connectionId)?.0122:.01115})))
  .filter(({p})=>!gatheringPoint(p)&&p.distanceTo(end)<.065);
 const clear=p=>(p.distanceTo(end)<.012||boxes.every(b=>b.distanceToPoint(p)>.0048))
  &&neighbors.every(q=>p.distanceToSquared(q.p)>q.clearance**2);
 const origin=start.clone(),step=.001,queue=[{v:[0,0,0],g:0,f:start.distanceTo(end)}],distance=new Map([['0,0,0',0]]),previous=new Map();
 const point=v=>new T.Vector3(...v).multiplyScalar(step).add(origin),key=v=>v.join(',');
 let finish,visits=0;
 while(queue.length&&visits++<200000){
  queue.sort((a,b)=>b.f-a.f);const row=queue.pop(),p=point(row.v),k=key(row.v);if(row.g!==distance.get(k))continue;
  if(p.distanceTo(end)<.0015){finish=row.v;break;}
  for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
   const v=row.v.map((n,i)=>n+d[i]),q=point(v),k2=key(v);
   if(q.x<-.185||q.x>-.14||q.y<.005||q.y>.022||q.z<-.209||q.z>-.118||!clear(q))continue;
   const g=row.g+step;if(g>=(distance.get(k2)??Infinity))continue;
   distance.set(k2,g);previous.set(k2,row.v);queue.push({v,g,f:g+q.distanceTo(end)});
  }
 }
 if(!finish)throw Error('No terminal corridor '+id);
 const tail=[];for(let v=finish;v;v=previous.get(key(v)))tail.push(point(v));tail.reverse();tail.push(end);
 // Keep dense controls at the contact boundary; no line shortcut across an exclusion.
 row.points=[...points.slice(0,begin),...tail].map(p=>p.toArray());
 console.log(id,visits,tail.length);
}
await writeFile(url,JSON.stringify(rows,null,2)+'\n');
