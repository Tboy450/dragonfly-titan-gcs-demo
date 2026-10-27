import * as T from '../../dist/vendor/three/three.module.min.js';
import {buildDrill} from '../../dist/drills.mjs';
import {buildResearchModel} from '../../dist/vehicle-research.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export const changedNames=new Set(['drill-motor-lead','drill-cable-boot','drill-cable-seat','drill-cable-support']);
export const unchangedDrillMesh = row => !changedNames.has(row.name);
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
export function fixture(builder=buildDrill){const root=new T.Group(),drills=[-1,1].map(side=>builder({parent:root,mesh,side}));root.updateMatrixWorld(true);return{root,drills};}
export async function baseline(){
  let source=await readFile(new URL('../../archive/drill-moving-leads-2026-10-27/drills.mjs',import.meta.url),'utf8');
  source=source.replace('./vendor/three/three.module.min.js?v=dev',new URL('../../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href);
  return fixture((await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildDrill);
}
export function fullModel(){
  const root=new T.Group();let target=root;
  const metal=new T.MeshStandardMaterial(),deck=metal.clone(),gold=metal.clone();
  const part=(g,m,p,parent=target)=>mesh(g,m,p,parent);
  const strut=(from,to,r=.026,m=metal)=>{const a=new T.Vector3(...from),b=new T.Vector3(...to),d=b.clone().sub(a);const o=part(new T.CylinderGeometry(r,r,d.length(),10),m,a.add(b).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;};
  // Geometry-only fixture: mock paint calls for decorative textures, never hardware.
  // Browser verification separately checks the real canvas/WebGL rendering.
  const originalDocument=globalThis.document;
  const paint=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},
    {get:(o,key)=>key in o?o[key]:()=>{}});
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>paint})};
  let model;
  try{model=buildResearchModel({group:root,mesh:part,strut,metal,deck,gold,upAxis:new T.Vector3(0,1,0),setTarget:g=>{target=g??root;}});}
  finally{if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;}
  root.updateMatrixWorld(true);return{root,...model};
}
export function triangles(object){
  const p=object.geometry.attributes.position,index=object.geometry.index,rows=[];
  const vertex=i=>new T.Vector3().fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(object.matrixWorld);
  for(let i=0;i<(index?index.count:p.count);i+=3)rows.push(new T.Triangle(vertex(i),vertex(i+1),vertex(i+2)));
  return rows;
}
export function report(){
 const {drills}=fixture();return{scope:'Local estimated moving leads, not a flight harness or fatigue qualification',
  rows:drills.flatMap((d,side)=>d.cables.map((c,i)=>({side:side===0?'port':'starboard',motor:c.mesh.userData.motor,
   lengthM:c.path.length,radiusM:c.path.radius,cableDiameterM:.006,fixedLocal:c.fixed.toArray(),motorLocal:c.motorLocal.toArray(),
   strokeM:.13,topAtStowedM:c.path.joinY+c.path.radius,flightMatingConfirmed:false}))),
  open:['Wire construction and cryogenic life','Remote controller and body-side continuation','Z-feed motor and sensor leads','Flight clamps and guards','2024 feed-stage/bellows geometry and stroke reconciliation']};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(report(),null,2)+'\n');console.log(JSON.stringify(report(),null,2));}
