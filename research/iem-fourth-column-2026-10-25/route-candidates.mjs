// Offline geometric search only: no flight routing, circuit or bend qualification.
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {fixture,gatheringPoint} from '../iem-middle-lead-2026-10-25/audit.mjs';
import {buildMainHarness} from '../../dist/main-harness.mjs';
import {readFile,writeFile} from 'node:fs/promises';
let baseline=await readFile(new URL('../../archive/iem-fourth-column-2026-10-25/iem.mjs',import.meta.url),'utf8');
for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs'])baseline=baseline.replace('./'+name+'?v=dev',new URL('../../dist/'+name+'?v=dev',import.meta.url).href);
const builder=(await import('data:text/javascript;base64,'+Buffer.from(baseline).toString('base64'))).buildIem;
const {parent,assembly}=fixture(builder),inverse=assembly.matrixWorld.clone().invert();
const selected=new Set(['iem-local-lead-12','iem-local-lead-13','iem-local-lead-14']);
const wires=parent.getObjectsByProperty('name','iem-harness-cable'),buckets=new Map(),cell=.016;
const bucket=p=>p.toArray().map(v=>Math.floor(v/cell));
function add(box,row){
 const a=bucket(box.min),b=bucket(box.max);
 for(let x=a[0];x<=b[0];x++)for(let y=a[1];y<=b[1];y++)for(let z=a[2];z<=b[2];z++){
  const key=[x,y,z].join(',');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(row);
 }
}
function addPath(path,radius,id,main=false,end=null){
 for(const p of path.getSpacedPoints(Math.ceil(path.getLength()/.001))){
  const margin=radius+.0045+(main?.0015:.003),box=new T.Box3().setFromCenterAndSize(p,new T.Vector3(1,1,1).multiplyScalar(2*margin));
  add(box,{p,radius,id,main,end});
 }
}
for(const w of wires)if(!selected.has(w.userData.connectionId))addPath(w.geometry.parameters.path,w.geometry.parameters.radius,w.userData.connectionId);
parent.traverse(o=>{
 if(!o.isMesh||o.name==='iem-harness-cable'||(selected.has(o.userData.connectionId)&&o.name==='iem-harness-label'))return;
 const box=new T.Box3().setFromObject(o).applyMatrix4(inverse);
 add(box.clone().expandByScalar(.005),{box,name:o.name,id:o.userData.connectionId});
});
const main=new T.Group();buildMainHarness({parent:main,mesh:(g,m,p,owner)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);owner.add(o);return o;}});main.updateMatrixWorld(true);
main.traverse(o=>{if(!o.geometry?.parameters?.path)return;
 const points=o.geometry.parameters.path.getSpacedPoints(700).map(p=>p.applyMatrix4(o.matrixWorld).applyMatrix4(inverse));
 const path=new T.CatmullRomCurve3(points,false,'centripetal');addPath(path,o.geometry.parameters.radius,o.name,true,points.at(-1));
});
const origin=new T.Vector3(-.184,.007,-.207),step=.003,limits=[116,84,30];
const point=v=>new T.Vector3(v[0]*step,v[1]*step,v[2]*step).add(origin);
const key=v=>v.join(','),neighbors=[];
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)if(x||y||z)neighbors.push([x,y,z]);
const outputs=[];
for(const id of selected){
 const wire=wires.find(o=>o.userData.connectionId===id),start=wire.geometry.parameters.path.getPoint(0),end=wire.geometry.parameters.path.getPoint(1);
 const cache=new Map(),heap=[],distance=new Map(),previous=new Map();
 function clear(p){
  for(const row of buckets.get(bucket(p).join(','))??[]){
   if(row.box){
    if(row.id===id&&row.name==='iem-harness-backshell'&&p.distanceTo(start)<.014)continue;
    if(row.name==='iem-harness-tie'&&gatheringPoint(p)&&p.distanceTo(end)<.016)continue;
    if(row.box.distanceToPoint(p)<.005)return false;
   }else{
    if(row.main){
     if(row.id==='main-harness-iem'&&row.p.distanceTo(row.end)<.03)continue;
     if(Math.max(Math.abs(p.x-row.p.x),Math.abs(p.y-row.p.y),Math.abs(p.z-row.p.z))<row.radius+.0055)return false;
    }else if(!(gatheringPoint(p)&&gatheringPoint(row.p))&&p.distanceTo(row.p)<row.radius+.0075)return false;
   }
  }return true;
 }
 function valid(v){const k=key(v);if(!cache.has(k))cache.set(k,v.every((n,i)=>n>=0&&n<=limits[i])&&clear(point(v)));return cache.get(k);}
 function push(row){heap.push(row);let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j].f<=row.f)break;heap[i]=heap[j];i=j;}heap[i]=row;}
 function pop(){const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let j=2*i+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=last.f)break;heap[i]=heap[j];i=j;}heap[i]=last;}return top;}
 const initial=start.clone().sub(origin).divideScalar(step).toArray().map(Math.round);
 push({v:initial,g:0,f:start.distanceTo(end)});distance.set(key(initial),0);let finish,visits=0;
 while(heap.length&&visits++<300000){
  const row=pop(),k=key(row.v);if(row.g!==distance.get(k))continue;const p=point(row.v);
  if(p.distanceTo(end)<.0045){finish=row.v;break;}
  for(const d of neighbors){const v=row.v.map((n,i)=>n+d[i]);if(!valid(v))continue;
   const g=row.g+Math.hypot(...d)*step,k2=key(v);if(g>=(distance.get(k2)??Infinity))continue;
   distance.set(k2,g);previous.set(k2,row.v);push({v,g,f:g+point(v).distanceTo(end)});
  }
 }
 if(!finish)throw new Error(id+' no corridor after '+visits+' visits');
 let nodes=[];for(let v=finish;v;v=previous.get(key(v)))nodes.push(point(v));nodes.reverse();nodes=[start,...nodes,end];
 const lineClear=(a,b)=>{const n=Math.ceil(a.distanceTo(b)/.001);for(let i=1;i<n;i++)if(!clear(a.clone().lerp(b,i/n)))return false;return true;};
 const reduced=[nodes[0]];let from=0;
 while(from<nodes.length-1){let to=nodes.length-1;while(to>from+1&&!lineClear(nodes[from],nodes[to]))to--;reduced.push(nodes[to]);from=to;}
 // Short control spans limit spline overshoot; the ordinary tests still decide acceptance.
 const controls=[reduced[0]];for(let i=1;i<reduced.length;i++){const a=reduced[i-1],b=reduced[i],n=Math.ceil(a.distanceTo(b)/.012);for(let j=1;j<=n;j++)controls.push(a.clone().lerp(b,j/n));}
 const curve=new T.CatmullRomCurve3(controls,false,'centripetal');
 outputs.push({id,visits,points:controls.map(p=>p.toArray().map(n=>+n.toFixed(6))),lengthM:curve.getLength()});addPath(curve,.0045,id);
 console.log(id,visits,controls.length,curve.getLength());
}
await writeFile(new URL('candidate-routes.json',import.meta.url),JSON.stringify(outputs,null,2)+'\n');
