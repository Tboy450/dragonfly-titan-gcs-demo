import * as T from './vendor/three/three.module.min.js?v=dev';
import {frontierRadioAsset as R} from './frontier-radio.mjs?v=dev';

// [EST] external mating-shell example at the photo-labeled J22 location.
// The photo identifies a connector, NOT this branch's circuit or flight mating.
const slice2=R.widthM/2-R.slicesM[0]-R.slicesM[1]/2;
const center=[R.position[0]-R.lengthM/2-.0062,R.position[1]+.032,R.position[2]-(slice2-.0065)];
const [x,y,z]=center;
export const frontierBayInterface=Object.freeze({
 revision:'frontier-bay-interface-2026-10-28',confidence:'EST',photoPort:'J22',
 flightMatingConfirmed:false,circuitAssigned:false,boreRadiusM:.0031,cableRadiusM:.003,
 face:Object.freeze(center),seat:Object.freeze([x-.008,y,z]),
 cableControls:Object.freeze([[0,-.284+.012+.004,.17],[.07,-.27,.172],[x-.038,y,z],[x-.024,y,z],[x-.008,y,z]].map(Object.freeze)),
});
export function buildFrontierBayInterface({parent,mesh}){
 Object.assign(parent.userData,{confidence:'EST',flightMatingConfirmed:false,
  source:'Estimated shell/strain relief at photo J22; no assigned flight power/data circuit'});
 const interfaces=new T.Group();interfaces.name='frontier-bay-interface';interfaces.userData.inspectionLayer='interfaces';parent.add(interfaces);
 const metal=new T.MeshStandardMaterial({color:0xaab5bb,metalness:.65,roughness:.4});
 const dark=new T.MeshStandardMaterial({color:0x343c40,metalness:.1,roughness:.75});
 const add=(g,m,a,name)=>{g.rotateY(Math.PI/2);const o=mesh(g,m,[a,y,z],interfaces);o.name=name;return o;};
 const profile=(w,h)=>{const c=.002,s=new T.Shape();
  [[-w/2+c,-h/2],[w/2-c,-h/2],[w/2,-h/2+c],[w/2,h/2-c],[w/2-c,h/2],[-w/2+c,h/2],[-w/2,h/2-c],[-w/2,-h/2+c]].forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));s.closePath();return s;};
 const shell=(w,h,a,b,bore,name)=>{const s=profile(w,h);if(bore){const hole=new T.Path();hole.absarc(0,0,bore,0,Math.PI*2,true);s.holes.push(hole);}
  return add(new T.ExtrudeGeometry(s,{depth:b-a,bevelEnabled:false,curveSegments:32}),metal,a,name);};
 // Closed mating face: no reconstructed contacts or receptacle alteration.
 shell(.012,.024,x-.002,x,0,'frontier-bay-est-mating-shell');
 shell(.014,.026,x-.004,x-.002,0,'frontier-bay-est-flange');
 shell(.016,.022,x-.018,x-.004,.0031,'frontier-bay-est-backshell');
 const ring=new T.Shape();ring.absarc(0,0,.0055,0,Math.PI*2,false);
 const hole=new T.Path();hole.absarc(0,0,.0031,0,Math.PI*2,true);ring.holes.push(hole);
 add(new T.ExtrudeGeometry(ring,{depth:.008,bevelEnabled:false,curveSegments:32}),dark,x-.022,'frontier-bay-est-strain-relief');
 return {interfaces};
}
