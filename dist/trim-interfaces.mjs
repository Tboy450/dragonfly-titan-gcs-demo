import * as T from './vendor/three/three.module.min.js?v=dev';
import {cutSurfacePort} from './foam-optical-ports.mjs?v=dev';

// [PUB] Fore/aft diverters and exposed cold bypass: TFAWS23 slide4;
// real DTM/test context: TFAWS24 slides9,15,16. All fitted sections below [EST].
export const trimInterfaceAsset=Object.freeze({
 revision:'trim-interfaces-2026-11-01',wallM:.0015,portWidthM:.131,portLengthM:.093,
 riserWidthM:.134,riserLengthM:.096,throatM:.006,foamClearanceM:.002,
 flightGeometryConfirmed:false,foamSurfaceOnly:true,
});
export const trimChangedNames=Object.freeze(['cold-duct-channel','front-diverter-riser','aft-diverter-riser','front-diverter-housing','aft-diverter-housing']);

function frameGeometry(w,h,length,t){
 const s=new T.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();
 const p=new T.Path();p.moveTo(-w/2+t,-h/2+t);p.lineTo(-w/2+t,h/2-t);p.lineTo(w/2-t,h/2-t);p.lineTo(w/2-t,-h/2+t);p.closePath();s.holes.push(p);
 const g=new T.ExtrudeGeometry(s,{depth:length,bevelEnabled:false,steps:1});g.translate(0,0,-length/2);return g;
}
// Cut only the warm run's floor, preserving roof, sides and outside envelope.
// Rectangular edge faces retain visible wall thickness at each opening.
export function openWarmTrimPorts(run,layout,diverters){
 const A=trimInterfaceAsset,half=A.portWidthM/2,ratio=A.portWidthM/A.portLengthM;
 const floor=layout.y-layout.height/2;run.updateWorldMatrix(true,false);
 for(const z of Object.values(diverters)){
  const toPort=new T.Matrix4().set(1,0,0,0,0,0,ratio,-z*ratio,0,1,0,0,0,0,0,1).multiply(run.matrixWorld);
  const next=cutSurfacePort(run.geometry,toPort,half,floor-.001,floor+A.wallM+.001);run.geometry.dispose();run.geometry=next;
 }
 const verts=Array.from(run.geometry.attributes.position.array),local=run.matrixWorld.clone().invert();
 const q=(a,b,c,d)=>verts.push(...a,...b,...c,...a,...c,...d);
 for(const z of Object.values(diverters)){
  const ring=[[-half,z-A.portLengthM/2],[half,z-A.portLengthM/2],[half,z+A.portLengthM/2],[-half,z+A.portLengthM/2]];
  const lo=ring.map(([x,zz])=>new T.Vector3(x,floor,zz).applyMatrix4(local).toArray());
  const hi=ring.map(([x,zz])=>new T.Vector3(x,floor+A.wallM,zz).applyMatrix4(local).toArray());
  for(let i=0;i<4;i++){const j=(i+1)%4;q(lo[i],hi[i],hi[j],lo[j]);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.computeVertexNormals();run.geometry.dispose();run.geometry=g;
}

export function trimRiserRings(warm,cold,diverters,end){
 const A=trimInterfaceAsset,dir=end==='aft'?1:-1,z=diverters[end],floor=warm.y-warm.height/2;
 const endZ=end==='aft'?cold.back:cold.front;
 const ring=(width,height,y,zz,vy,vz)=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,v])=>[x*width/2,y+v*height*vy/2,zz+v*height*vz/2]);
 return {dir,centerZ:z,endZ,outer:[ring(A.riserWidthM,A.riserLengthM,floor,z,0,1),ring(A.riserWidthM,A.riserLengthM,floor-A.throatM,z,0,1),ring(cold.width,cold.height,cold.y,endZ,-dir,0)],
  inner:[ring(A.portWidthM,A.portLengthM,floor,z,0,1),ring(A.portWidthM,A.portLengthM,floor-A.throatM,z,0,1),ring(cold.width-2*A.wallM,cold.height-2*A.wallM,cold.y,endZ,-dir,0)]};
}
function riserGeometry(rings){
 const {outer:o,inner:n}=rings,vertices=[],q=(a,b,c,d)=>vertices.push(...a,...b,...c,...a,...c,...d);
 for(let i=0;i<4;i++){const j=(i+1)%4;
  for(let k=0;k<o.length-1;k++){q(o[k][i],o[k][j],o[k+1][j],o[k+1][i]);q(n[k][j],n[k][i],n[k+1][i],n[k+1][j]);}
  q(o[0][j],o[0][i],n[0][i],n[0][j]);q(o.at(-1)[i],o.at(-1)[j],n.at(-1)[j],n.at(-1)[i]);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
}
export function openColdDuct(channel,layout){
 channel.geometry.dispose();channel.geometry=frameGeometry(layout.width,layout.height,layout.back-layout.front,trimInterfaceAsset.wallM);
 channel.userData.inspectionLabel='Cold bypass duct (estimated open section)';channel.userData.inspectionMinimumRadiusM=.06;
}
export function buildTrimRiser({mesh,parent,material,warm,cold,diverters,end}){
 const rings=trimRiserRings(warm,cold,diverters,end),riser=mesh(riserGeometry(rings),material,[0,0,0],parent);
 riser.name=end+'-diverter-riser';riser.userData.inspectionLabel=(end==='aft'?'Aft':'Front')+' bypass connector (estimated)';riser.userData.inspectionMinimumRadiusM=.065;
 return {riser,rings};
}
// Surface-only cut in the retained foam outline. Does not infer flight foam
// thickness, tile cuts or sealing/fastening details from the DTM mock-up.
export function openTrimFoam(housing,rings){
 const b=new T.Box3().setFromPoints(rings.outer.flat().map(p=>new T.Vector3(...p))).expandByScalar(trimInterfaceAsset.foamClearanceM);
 const cy=(b.min.y+b.max.y)/2,half=b.max.x,ratio=half/((b.max.y-b.min.y)/2);
 housing.updateWorldMatrix(true,false);
 const toPort=new T.Matrix4().set(1,0,0,0,0,ratio,0,-cy*ratio,0,0,1,0,0,0,0,1).multiply(housing.matrixWorld);
 const g=cutSurfacePort(housing.geometry,toPort,half,b.min.z,b.max.z);housing.geometry.dispose();housing.geometry=g;housing.userData.surfaceOnly=true;
}
