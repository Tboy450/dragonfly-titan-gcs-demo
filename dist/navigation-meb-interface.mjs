import * as T from "./vendor/three/three.module.min.js?v=dev";
import {noseElectronicsAsset} from "./nose-electronics.mjs?v=dev";

// [EST] External installation example, NOT an identified Ocellus flight connector.
// Workmanship reference: NASA-STD-8739.4A §§7.2/8.1 (stress relief), not port identity.
// Fit against the existing MEB wall between its external ribs; no box/board change.
const meb=noseElectronicsAsset.units.find(u=>u.name==='ocellus-meb');
const wallZ=meb.position[2]+(meb.dimensions[0]-.014)/2-.004;
const x=meb.position[0]+(meb.dimensions[2]-.049)/8,y=-.235;
export const navigationMebInterface=Object.freeze({
 revision:'navigation-meb-interface-2026-10-27',confidence:'EST',flightMatingConfirmed:false,
 centerX:x,centerY:y,wallZ,flangeM:.026,flangeDepthM:.003,boreRadiusM:.0081,
 seat:Object.freeze([x,y,wallZ+.035]),
 cableControls:Object.freeze([[0,-.284+.012+.004,-1],[-.12,-.27,-1.02],[x,y,-1.18],[x,y,wallZ+.055],[x,y,wallZ+.035]].map(Object.freeze)),
});

export function buildNavigationMebInterface({parent,mesh}){
 const A=navigationMebInterface;
 Object.assign(parent.userData,{confidence:'EST',flightMatingConfirmed:false,
  source:'Generic external interface/strain-relief illustration; exact Ocellus port and circuit unknown'});
 const interfaces=new T.Group();interfaces.name='navigation-meb-interface';
 interfaces.userData.inspectionLayer='interfaces';parent.add(interfaces);
 const metal=new T.MeshStandardMaterial({color:0xb2bdc2,metalness:.65,roughness:.4});
 const dark=new T.MeshStandardMaterial({color:0x343c40,metalness:.1,roughness:.75});
 const add=(g,m,z,name)=>{const o=mesh(g,m,[x,y,z],interfaces);o.name=name;return o;};
 // Blind panel-facing flange: external geometry only, no fabricated pins or wall bore.
 add(new T.BoxGeometry(A.flangeM,A.flangeM,A.flangeDepthM),metal,wallZ+.0015,'navigation-meb-est-flange');
 const sleeve=(r0,a,b,m,name)=>{
  const s=new T.Shape();s.absarc(0,0,r0,0,2*Math.PI,false);
  const h=new T.Path();h.absarc(0,0,A.boreRadiusM,0,2*Math.PI,true);s.holes.push(h);
  const g=new T.ExtrudeGeometry(s,{depth:b-a,bevelEnabled:false,curveSegments:32});
  // The boot is cylindrical; no claimed cable construction, thermal seal or qualification.
  return add(g,m,a,name);
 };
 sleeve(.0105,wallZ+.003,wallZ+.011,metal,'navigation-meb-est-receptacle-shell');
 sleeve(.0115,wallZ+.011,wallZ+.017,metal,'navigation-meb-est-coupling');
 sleeve(.010,wallZ+.017,wallZ+.028,metal,'navigation-meb-est-backshell');
 sleeve(.0095,wallZ+.028,wallZ+.042,dark,'navigation-meb-est-strain-relief');
 for(const dx of [-.009,.009])for(const dy of [-.009,.009]){
  const bolt=mesh(new T.CylinderGeometry(.0013,.0013,.002,6),metal,
   [x+dx,y+dy,wallZ+.004],interfaces);bolt.rotation.x=Math.PI/2;bolt.name='navigation-meb-est-flange-fastener';
 }
 return {interfaces};
}
