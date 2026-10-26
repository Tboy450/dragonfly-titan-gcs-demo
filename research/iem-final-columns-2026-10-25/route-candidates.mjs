// Offline geometric search only: no flight routing, circuit or bend qualification.
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {buildMainHarness} from '../../dist/main-harness.mjs';
import {readFile,writeFile} from 'node:fs/promises';
let baseline=await readFile(new URL('../../archive/iem-final-columns-2026-10-25/iem.mjs',import.meta.url),'utf8');
for(const name of ['vendor/three/three.module.min.js','cable-installation.mjs','iem-next-service-routes.mjs'])baseline=baseline.replace('./'+name+'?v=dev',new URL('../../dist/'+name+'?v=dev',import.meta.url).href);
const builder=process.env.IEM_CURRENT?(await import('../../dist/iem.mjs')).buildIem:(await import('data:text/javascript;base64,'+Buffer.from(baseline).toString('base64'))).buildIem;
const gatheringPoint=p=>p.x<-.135&&p.y<.025;
function fixture(build){
 const parent=new T.Group(),mesh=(g,m,p,owner)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);owner.add(o);return o;};
 const result=build({parent,mesh});parent.updateMatrixWorld(true);return{parent,...result};
}
const {parent,assembly}=fixture(builder),inverse=assembly.matrixWorld.clone().invert();
const selected=new Set((process.env.IEM_ORDER??'26,25,23,24,22,13,21,4').split(',').map(n=>'iem-local-lead-'+Number(n)));
const legacy=new Set();
const seed=Number(process.env.IEM_SEED??0);
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
for(const w of wires)if(!selected.has(w.userData.connectionId)&&!legacy.has(w.userData.connectionId))addPath(w.geometry.parameters.path,w.geometry.parameters.radius,w.userData.connectionId);
// Reserve each untouched connector's outward approach before routing its neighbors.
const approaches=wires.filter(w=>selected.has(w.userData.connectionId)).map(w=>{
 const a=w.geometry.parameters.path.getPoint(0),b=a.clone().add(new T.Vector3(0,0,-.022));
 return{id:w.userData.connectionId,line:new T.Line3(a,b)};
});
parent.traverse(o=>{
 if(!o.isMesh||o.name==='iem-harness-cable'||selected.has(o.userData.wireId)||((selected.has(o.userData.connectionId)||legacy.has(o.userData.connectionId))&&o.name==='iem-harness-label'))return;
 if(selected.has(o.userData.connectionId)&&o.name.startsWith('iem-service-'))return;
 if(process.env.IEM_DIAGNOSTIC_TAG21&&o.name==='iem-harness-label'&&o.userData.connectionId==='iem-local-lead-21')return;
 if(process.env.IEM_DIAGNOSTIC_FITTINGS&&(o.name==='iem-harness-label'||o.userData.installationExample||o.name.startsWith('iem-service-')))return;
 const matrix=inverse.clone().multiply(o.matrixWorld),localInverse=matrix.clone().invert();
 o.geometry.computeBoundingBox();
 const box=o.geometry.boundingBox.clone().applyMatrix4(matrix),triangles=[];
 if(o.geometry.type!=='BoxGeometry'){
  const a=o.geometry.attributes.position,indices=o.geometry.index;
  const vertex=n=>new T.Vector3().fromBufferAttribute(a,indices?indices.getX(n):n).applyMatrix4(matrix);
  for(let n=0;n<(indices?indices.count:a.count);n+=3)triangles.push(new T.Triangle(vertex(n),vertex(n+1),vertex(n+2)));
 }
 add(box.clone().expandByScalar(.005),{box,name:o.name,id:o.userData.connectionId,triangles,localInverse,localBox:o.geometry.boundingBox});
});
const main=new T.Group();buildMainHarness({parent:main,mesh:(g,m,p,owner)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);owner.add(o);return o;}});main.updateMatrixWorld(true);
main.traverse(o=>{if(!o.geometry?.parameters?.path)return;
 const points=o.geometry.parameters.path.getSpacedPoints(700).map(p=>p.applyMatrix4(o.matrixWorld).applyMatrix4(inverse));
 const path=new T.CatmullRomCurve3(points,false,'centripetal');addPath(path,o.geometry.parameters.radius,o.name,true,points.at(-1));
});
const origin=new T.Vector3(-.185,.005,-.209);let step=.002,limits=[174,137,46];
const point=v=>new T.Vector3(v[0]*step,v[1]*step,v[2]*step).add(origin);
const key=v=>v.join(','),neighbors=[];
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)if(x||y||z)neighbors.push([x,y,z]);
 const outputs=process.env.IEM_CURRENT?JSON.parse(await readFile(new URL('candidate-routes.json',import.meta.url),'utf8')).filter(row=>!selected.has(row.id)):[];
for(const id of selected){
 step=.001;
 limits=[348,277,93];
 origin.set(-.1854,.0036,-.2094);
 const extraDepth=Number(process.env.IEM_EXTRA_DEPTH??0);
 origin.z-=extraDepth;limits[2]+=Math.round(extraDepth/step);
 const extraSide=Number(process.env.IEM_EXTRA_SIDE??0);
 origin.x-=extraSide;limits[0]+=Math.round(extraSide/step);
 const preferredZ=-.123-((Number(id.split('-').at(-1))*3+seed*5)%8)*.011;
 const wire=wires.find(o=>o.userData.connectionId===id),start=wire.geometry.parameters.path.getPoint(0),end=wire.geometry.parameters.path.getPoint(1);
 const searchStart=process.env.IEM_REVERSE?end:start,searchEnd=process.env.IEM_REVERSE?start:end;
 let cache=new Map(),heap=[],distance=new Map(),previous=new Map();
 function clear(p){
  for(const approach of approaches)if(approach.id!==id&&approach.line.closestPointToPoint(p,true,new T.Vector3()).distanceTo(p)<.0112)return false;
  for(const row of buckets.get(bucket(p).join(','))??[]){
   if(row.box){
    if(row.id===id&&row.name==='iem-harness-backshell'&&p.distanceTo(start)<.014)continue;
    if(row.name==='iem-harness-tie'&&gatheringPoint(p)&&p.distanceTo(end)<.0153)continue;
    if(row.box.distanceToPoint(p)<.0047){
     if(!row.triangles.length){if(row.localBox.distanceToPoint(p.clone().applyMatrix4(row.localInverse))<.0047)return false;}
     else{const nearest=new T.Vector3();for(const triangle of row.triangles){triangle.closestPointToPoint(p,nearest);if(p.distanceTo(nearest)<.0047)return false;}}
    }
   }else{
    if(row.main){
     if(row.id==='main-harness-iem'&&row.p.distanceTo(row.end)<.028)continue;
     if(Math.max(Math.abs(p.x-row.p.x),Math.abs(p.y-row.p.y),Math.abs(p.z-row.p.z))<row.radius+.0042)return false;
    }else if(!(p.x<-.1365&&p.y<.0235&&row.p.x<-.1365&&row.p.y<.0235)&&p.distanceTo(row.p)<row.radius+(['iem-local-lead-5','iem-local-lead-7'].includes(row.id)?.0078:.0068))return false;
   }
  }return true;
 }
 function valid(v){const k=key(v);if(!cache.has(k))cache.set(k,v.every((n,i)=>n>=0&&n<=limits[i])&&clear(point(v)));return cache.get(k);}
 const lineClear=(a,b)=>{const n=Math.ceil(a.distanceTo(b)/.0004);for(let i=1;i<n;i++)if(!clear(a.clone().lerp(b,i/n)))return false;return true;};
 function push(row){heap.push(row);let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j].f<=row.f)break;heap[i]=heap[j];i=j;}heap[i]=row;}
 function pop(){const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let j=2*i+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=last.f)break;heap[i]=heap[j];i=j;}heap[i]=last;}return top;}
 console.log(id,JSON.stringify({clearStart:clear(start),clearEnd:clear(end)}));
 let nodes=[],visits=0;
 const laneDepths={22:-.198-extraDepth,23:-.176-extraDepth,24:-.198-extraDepth,25:-.176-extraDepth,26:-.151-extraDepth};
 const lane=process.env.IEM_LANES&&laneDepths[Number(id.split('-').at(-1))];
 let waypoint=lane?new T.Vector3(start.x,start.y-.018,lane):null;
 if(waypoint&&!clear(waypoint)){
  const options=[];for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++)for(let z=-12;z<=12;z++)options.push(new T.Vector3(x*.002,y*.002,z*.002));
  options.sort((a,b)=>a.lengthSq()-b.lengthSq());
  const chosen=options.map(d=>waypoint.clone().add(d)).find(p=>p.z>=-.207-extraDepth&&p.z<=-.12&&clear(p));
  if(!chosen)throw Error(id+' lane waypoint blocked '+JSON.stringify(waypoint.toArray()));waypoint=chosen;
 }
 const goals=waypoint?[waypoint,searchEnd]:[searchEnd];let phaseStart=searchStart;
 for(const phaseEnd of goals){
 cache=new Map();heap=[];distance=new Map();previous=new Map();
 const closed=new Set();
 const initial=phaseStart.clone().sub(origin).divideScalar(step).toArray().map(Math.round);
 push({v:initial,g:0,f:phaseStart.distanceTo(phaseEnd)});distance.set(key(initial),0);let finish,nearestGoal={distance:Infinity,point:null},phaseVisits=0;
 while(heap.length&&phaseVisits++<Number(process.env.IEM_MAX_VISITS??650000)){
  const row=pop(),k=key(row.v);if(row.g!==distance.get(k)||closed.has(k))continue;closed.add(k);const p=point(row.v);
  if(p.distanceTo(phaseEnd)<nearestGoal.distance)nearestGoal={distance:p.distanceTo(phaseEnd),point:p.toArray()};
  if(p.distanceTo(phaseEnd)<.008&&lineClear(p,phaseEnd)){finish=row.v;break;}
  for(const d of neighbors){const v=row.v.map((n,i)=>n+d[i]);if(closed.has(key(v))||!valid(v))continue;
   const g=row.g+Math.hypot(...d)*step*(1+Math.abs(point(v).z-preferredZ)*28),k2=key(v);if(g>=(distance.get(k2)??Infinity))continue;
   distance.set(k2,g);previous.set(k2,row.v);push({v,g,f:g+point(v).distanceTo(phaseEnd)*Number(process.env.IEM_HEURISTIC??4)});
  }
 }
 visits+=phaseVisits;
 if(!finish)throw new Error(id+' no corridor after '+visits+' visits; nearest '+JSON.stringify(nearestGoal));
 let segment=[];for(let v=finish;v;v=previous.get(key(v)))segment.push(point(v));segment.reverse();nodes.push(phaseStart,...segment,phaseEnd);phaseStart=phaseEnd;
 }
 if(process.env.IEM_REVERSE)nodes.reverse();
 const reduced=[nodes[0]];let from=0;
 while(from<nodes.length-1){let to=nodes.length-1;while(to>from+1&&!lineClear(nodes[from],nodes[to]))to--;reduced.push(nodes[to]);from=to;}
 // Short control spans limit spline overshoot; the ordinary tests still decide acceptance.
 const controls=[reduced[0]];for(let i=1;i<reduced.length;i++){const a=reduced[i-1],b=reduced[i],n=Math.ceil(a.distanceTo(b)/.002);for(let j=1;j<=n;j++)controls.push(a.clone().lerp(b,j/n));}
 const curve=new T.CatmullRomCurve3(controls,false,'centripetal');
 outputs.push({id,visits,points:controls.map(p=>p.toArray().map(n=>+n.toFixed(6))),lengthM:curve.getLength()});
 const poolUrl=new URL('candidate-pool.json',import.meta.url);let pool=[];
 try{pool=JSON.parse(await readFile(poolUrl,'utf8'));}catch{}
 const candidate={...outputs.at(-1),seed,order:[...selected]};
 if(!pool.some(row=>row.id===id&&JSON.stringify(row.points)===JSON.stringify(candidate.points)))pool.push(candidate);
 await writeFile(poolUrl,JSON.stringify(pool,null,2)+'\n');
 await writeFile(new URL('candidate-routes.json',import.meta.url),JSON.stringify(outputs,null,2)+'\n');
 if(!process.env.IEM_INDEPENDENT)addPath(curve,.0045,id);
 console.log(id,visits,controls.length,curve.getLength());
}
await writeFile(new URL('candidate-routes.json',import.meta.url),JSON.stringify(outputs,null,2)+'\n');
