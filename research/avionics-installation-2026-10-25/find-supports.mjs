import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {builders,buildFamily} from './audit.mjs';
const {parent}=buildFamily(builders.iem),wires=[],boxes=[];
parent.traverse(o=>{if(!o.isMesh||o.userData.installationExample)return;
 if(o.geometry.parameters.path)wires.push(o);
 else if(o.geometry.type==='BoxGeometry')boxes.push({box:new T.Box3().setFromBufferAttribute(o.geometry.attributes.position),inverse:o.matrixWorld.clone().invert()});
});
const sampled=new Map(wires.map(w=>[w,w.geometry.parameters.path.getSpacedPoints(300).map(p=>p.applyMatrix4(w.matrixWorld))]));
for(const id of ['iem-local-lead-5','iem-local-lead-6','iem-local-lead-7']){
 const wire=wires.find(w=>w.userData.connectionId===id),path=wire.geometry.parameters.path,r=wire.geometry.parameters.radius,good=[];
 for(let f=.02;f<.8;f+=.01)for(const side of [-.02,-.015,.015,.02]){
  const p=path.getPointAt(f),pw=p.clone().applyMatrix4(wire.matrixWorld);
  if(wires.some(w=>w!==wire&&sampled.get(w).some(q=>q.distanceTo(pw)<r+w.geometry.parameters.radius+.0013)))continue;
  const foot=new T.Vector3(p.x+side,p.y,-.114),start=foot.clone().add(new T.Vector3(0,0,-.0012));
  const d=p.clone().sub(start).normalize(),end=p.clone().addScaledVector(d,-r-.0006);
  let clear=true;
  for(let j=4;j<=40&&clear;j++){
   const q=start.clone().lerp(end,j/40).applyMatrix4(wire.matrixWorld),fw=foot.clone().applyMatrix4(wire.matrixWorld);
   if(q.distanceTo(fw)<.003)continue;
   if(boxes.some(({box,inverse})=>box.distanceToPoint(q.clone().applyMatrix4(inverse))<=.0009))clear=false;
   if(wires.some(w=>w!==wire&&sampled.get(w).some(v=>q.distanceTo(v)<=w.geometry.parameters.radius+.0009)))clear=false;
  }
  if(clear)good.push({fraction:Number(f.toFixed(3)),side});
 }
 console.log(id,JSON.stringify(good.slice(0,12)));
}
