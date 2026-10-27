import * as T from './vendor/three/three.module.min.js?v=dev';

// [PUB] Adams et al., AMS2024 fig.2: covered actuator, gearbox and covered U-joint.
// [EST] fitted envelopes/fasteners/supports. The photo does not reveal the joint
// forks, gears, motor internals or flight mounting/load path. Do not invent those.
export const drillDriveAsset=Object.freeze({
 revision:'drill-drive-2026-10-27',jointBoreRadiusM:.006,shaftRadiusM:.004,
 outputBottomY:-.28,outputTopY:-.20,mountFrontZ:.029,
});

export function buildDrillDrive({mesh,side,railX,silver,grey,stage,covers,casings,interfaces}){
 const dark=new T.MeshStandardMaterial({color:0x293034,roughness:.46,metalness:.5});
 const box=(size,at,material,parent,name)=>{
  const o=mesh(new T.BoxGeometry(...size),material,at,parent);o.name=name;return o;
 };
 const cylinder=(r,h,at,material,parent,name,sides=20)=>{
  const o=mesh(new T.CylinderGeometry(r,r,h,sides),material,at,parent);o.name=name;return o;
 };
 const ring=(ri,ro,h,at,material,parent,name)=>{
  const pts=[[ri,-h/2],[ro,-h/2],[ro,h/2],[ri,h/2],[ri,-h/2]].map(p=>new T.Vector2(...p));
  const o=mesh(new T.LatheGeometry(pts,24),material,at,parent);o.name=name;return o;
 };
 const motorX=railX+side*.045;
 const motor=cylinder(.018,.080,[motorX,-.25,.020],grey,casings,'drill-z-motor');
 const center=[motorX,-.25,.020],size=[.044,.10,.050],t=.0015;
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
  const dims=[...size],p=[...center];dims[axis]=t;p[axis]+=sign*(size[axis]-t)/2;
  if(axis===1&&sign===-1){
   // [EST] Open mounting relief, not a bracket passing through a closed panel.
   const outline=[[-.022,-.025],[.022,-.025],[.022,-.0153],[-.0183,-.0153],
    [-.0183,.0153],[.022,.0153],[.022,.025],[-.022,.025]];
   const shape=new T.Shape(outline.map(([x,z])=>new T.Vector2(-side*x,z)));
   const g=new T.ExtrudeGeometry(shape,{depth:t,bevelEnabled:false,steps:1});
   g.translate(0,0,-t/2);g.rotateX(Math.PI/2);
   const floor=mesh(g,silver,p,covers);floor.name='drill-feed-actuator-cover';
   floor.userData.mountingReliefIllustration=true;
  }else box(dims,p,silver,covers,'drill-feed-actuator-cover');
 }
 const gearbox=box([.10,.040,.060],[railX+side*.0225,-.18,.035],dark,casings,'drill-z-gearhead');
 // Estimated seating geometry connects the retained motor envelope to its foot
 // and gearbox. Contact is visual fit, not a structural strength/load calculation.
 const foot=box([.063,.009,.030],[railX+side*.0315,-.30,.020],grey,stage,'drill-feed-actuator-foot');
 const shoe=box([.036,.0055,.030],[motorX,-.29275,.020],grey,stage,'drill-drive-motor-shoe');
 const input=ring(.006,.012,.010,[motorX,-.205,.020],silver,interfaces,'drill-drive-input-neck');
 const inputShaft=cylinder(.004,.010,[motorX,-.205,.020],grey,interfaces,'drill-drive-input-envelope');
 // The neutral shaft envelope closes the old drawing gap when Covers is hidden.
 // It does NOT represent a rigid replacement for the real two-DOF universal joint.
 const outputShaft=cylinder(.004,.080,[railX,-.24,.045],grey,interfaces,'drill-drive-output-envelope');
 outputShaft.userData.mechanismDetail='Unresolved covered universal joint; continuity envelope only';
 const flange=ring(.006,.020,.010,[railX,-.205,.045],silver,interfaces,'drill-drive-output-flange');
 const jointCover=ring(.006,.014,.080,[railX,-.25,.045],dark,covers,'drill-feed-joint-cover');
 const adapter=ring(.006,.010,.016,[railX,-.298,.045],silver,interfaces,'drill-drive-lower-adapter');
 // Fastener arrangement is a fitted visual approximation, not a flight bolt count.
 for(const dx of [-.040,.040])for(const z of [.015,.055]){
  cylinder(.0022,.003,[railX+side*.0225+dx,-.1585,z],silver,interfaces,'drill-drive-gearbox-fastener',6);
 }
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3;
  cylinder(.0015,.004,[railX+Math.cos(a)*.016,-.212,.045+Math.sin(a)*.016],
   grey,interfaces,'drill-drive-flange-fastener',6);
 }
 return{motor,gearbox,foot,shoe,input,inputShaft,outputShaft,flange,jointCover,adapter};
}
