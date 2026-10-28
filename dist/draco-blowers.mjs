import * as T from './vendor/three/three.module.min.js?v=dev';
import {cutSurfacePort} from './foam-optical-ports.mjs?v=dev';

// [PUB] BNCP-74-000 supplier nominal size 345 x168 mm; real EM photos guide visible
// exterior only. [EST] proportional details, vertical installation, mounts and ports.
// Diameter is used as the nominal transverse package reference, not a flight ICD.
export const blowerLayout=Object.freeze({
 revision:'draco-blowers-bncp74-2026-10-27',lengthM:.345,transverseM:.168,
 centers:Object.freeze([Object.freeze([-.525,-.28,-.65]),Object.freeze([-.525,-.28,-.20])]),
 unitYawX:Math.PI/2,caseRadiusM:.0625,wallX:-.3725,
 flightInstallationConfirmed:false,
});
const v=p=>new T.Vector3(...p);

export function buildSupplierBlowers({parent,mesh,diverter}){
 const group=new T.Group();group.name='draco-blowers';parent.add(group);
 Object.assign(parent.userData,{assetRevision:blowerLayout.revision,dimensionConfidence:'PUB-nominal+EST-proportions/install',
  appearanceEvidence:'Barber-Nichols real BNCP-74 engineering models; not installed flight hardware',flightInstallationConfirmed:false});
 const layer=(name,category)=>{const g=new T.Group();g.name=name;g.userData.inspectionLayer=category;group.add(g);return g;};
 const casings=layer('draco-blower-casings','equipment-casings'),covers=layer('draco-blower-covers','equipment-covers'),
  ports=layer('draco-blower-ports','interfaces'),mounts=layer('draco-blower-mounts','mounts'),plumbing=layer('draco-blower-pipes','plumbing');
 const silver=new T.MeshStandardMaterial({color:0xb7bec1,metalness:.72,roughness:.35,side:T.DoubleSide}),
  bronze=new T.MeshStandardMaterial({color:0xad6429,metalness:.75,roughness:.34}),
  gold=new T.MeshStandardMaterial({color:0xada468,metalness:.6,roughness:.42}),
  dark=new T.MeshStandardMaterial({color:0x343b3e,metalness:.35,roughness:.5});
 const selectorMetal=new T.MeshStandardMaterial({color:0x9aa3a8,roughness:.38,metalness:.75}),
  selectorDark=new T.MeshStandardMaterial({color:0x23272a,roughness:.5,metalness:.4});
 const add=(g,m,p,target,name)=>{const o=mesh(g,m,p,target);o.name=name;return o;};
 const box=(size,p,m,target,name)=>add(new T.BoxGeometry(...size),m,p,target,name);
 const cylinder=(r0,r1,a,b,m,target,name)=>{
  const g=new T.CylinderGeometry(r1,r0,b-a,40,1,true);g.rotateX(Math.PI/2);
  return add(g,m,[0,0,(a+b)/2],target,name);
 };
 const ring=(outer,inner,a,b,m,target,name)=>{
  const shape=new T.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);
  const hole=new T.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);
  return add(new T.ExtrudeGeometry(shape,{depth:b-a,bevelEnabled:false,curveSegments:32}),m,[0,0,a],target,name);
 };
 const profile=(points,m,target,name)=>{
  const g=new T.LatheGeometry(points.map(([z,r])=>new T.Vector2(r,z)),64);g.rotateX(Math.PI/2);
  return add(g,m,[0,0,0],target,name);
 };
 const tube=(points,target,name)=>{
  const path=new T.CatmullRomCurve3(points.map(v),false,'centripetal');
  return add(new T.TubeGeometry(path,96,.0065,10,false),silver,[0,0,0],target,name);
 };
 // Existing selector/return interface retained exactly; hidden valve internals unmodeled.
 const [dx,dy,dz]=diverter;
 box([.03,.025,.11],[dx,dy,dz],selectorMetal,ports,'draco-blower-flow-diverter');
 const actuator=add(new T.CylinderGeometry(.009,.009,.02,12),selectorDark,[dx,dy+.0225,dz],ports,'draco-blower-diverter-actuator');
 const units=[];
 for(const [index,center]of blowerLayout.centers.entries()){
  const name=index?'aft':'forward',prefix=`draco-${name}-blower`;
  const poses={};
  for(const [key,target]of Object.entries({casings,covers,ports,mounts})){
   const pose=new T.Group();pose.name=`${prefix}-${key}`;pose.position.fromArray(center);pose.rotation.x=blowerLayout.unitYawX;
   target.add(pose);poses[key]=pose;
  }
  const C=poses.casings,P=poses.ports,M=poses.mounts,V=poses.covers;
  cylinder(.032,.032,-.1675,-.027,bronze,C,`${prefix}-motor`);
  // Visible bronze exterior and axial traces follow the EM photo, not an internal coil model.
  for(let k=0;k<24;k++){
   const a=k*Math.PI/12;
   const bar=box([.0018,.0018,.116],[Math.sin(a)*.0324,Math.cos(a)*.0324,-.103],bronze,C,`${prefix}-visible-motor-strip`);bar.rotation.z=-a;
  }
  for(const z of [-.158,-.134,-.110,-.086,-.062,-.040])ring(.035,.031,z-.002,z+.002,silver,C,`${prefix}-motor-retaining-band`);
  const rear=add(new T.CylinderGeometry(.032,.032,.005,40),silver,[0,0,-.170],V,`${prefix}-rear-cover`);rear.rotation.x=Math.PI/2;
  ring(.0625,.027,-.032,-.025,gold,V,`${prefix}-backplate`);
  profile([[-.025,.0625],[-.019,.0625],[-.012,.057],[.002,.043],[.020,.027],[.032,.019],[.042,.017]],silver,C,`${prefix}-volute`);
  ring(.028,.015,.039,.047,silver,P,`${prefix}-intake-root-flange`);
  cylinder(.017,.0088,.047,.166,silver,P,`${prefix}-intake-cone`);
  ring(.014,.0073,.166,.1725,silver,P,`${prefix}-inlet`);
  for(let k=0;k<12;k++){
   const a=k*Math.PI/6;
   const bolt=add(new T.CylinderGeometry(.0021,.0021,.005,6),silver,[Math.sin(a)*.056,Math.cos(a)*.056,-.0225],V,`${prefix}-case-bolt`);bolt.rotation.x=Math.PI/2;
  }
  for(const z of [-.130,-.027]){
   box([.008,.048,.012],[0,-.057,z],silver,M,`${prefix}-foot-leg`);
   box([.028,.006,.025],[0,-.081,z],silver,M,`${prefix}-foot`);
   const at=v([0,-.081,z]).applyEuler(new T.Euler(blowerLayout.unitYawX,0,0)).add(v(center));
   // [EST] bracket to the existing port structural wall outer face. No new fuselage hole.
   box([Math.abs(blowerLayout.wallX-at.x),.006,.018],[(blowerLayout.wallX+at.x)/2,at.y,at.z],silver,mounts,`${prefix}-wall-bracket`);
  }
  // Tangential discharge bore and square flange, as in the real bench photograph.
  add(new T.CylinderGeometry(.011,.011,.026,32,1,true),silver,[0,.065,-.012],P,`${prefix}-discharge-neck`);
  const shape=new T.Shape();shape.moveTo(-.013,-.013);shape.lineTo(.013,-.013);shape.lineTo(.013,.013);shape.lineTo(-.013,.013);shape.closePath();
  const hole=new T.Path();hole.absarc(0,0,.008,0,Math.PI*2,true);shape.holes.push(hole);
  const flange=new T.ExtrudeGeometry(shape,{depth:.006,bevelEnabled:false,curveSegments:24});flange.rotateX(-Math.PI/2);
  add(flange,silver,[0,.078,-.012],P,`${prefix}-discharge-flange`);
  // [EST] installed mating pieces, outside the supplier unit's nominal envelope.
  // These depict external continuity only, without a flight seal/material/ICD claim.
  const mating=new T.Group();mating.name=`${prefix}-mating-adapters`;
  mating.position.fromArray(center);mating.rotation.x=blowerLayout.unitYawX;ports.add(mating);
  ring(.014,.0065,.1725,.173,dark,mating,`${prefix}-intake-interface`);
  ring(.014,.0065,.173,.1785,silver,mating,`${prefix}-intake-mating-flange`);
  const matingShape=new T.Shape();matingShape.moveTo(-.013,-.013);matingShape.lineTo(.013,-.013);matingShape.lineTo(.013,.013);matingShape.lineTo(-.013,.013);matingShape.closePath();
  const matingHole=new T.Path();matingHole.absarc(0,0,.0065,0,Math.PI*2,true);matingShape.holes.push(matingHole);
  const matingFlange=new T.ExtrudeGeometry(matingShape,{depth:.006,bevelEnabled:false,curveSegments:24});matingFlange.rotateX(-Math.PI/2);
  add(matingFlange,silver,[0,.084,-.012],mating,`${prefix}-discharge-mating-flange`);
  const [x,y,z]=center;
  const out=[x,y+.012,z+.081];
  const exhaust=tube([out,[x,y+.012,z+.095],[x,y+.012,z+.110],[x-.095,y-.025,z+.110],[x-.14,y-.08,z+.084],[x-.14,y-.14,z+.084]],plumbing,`${prefix}-exhaust`);
  const seat=[x,y-.1695,z];
  const route=index
   ? [[dx,dy-.0125,dz+.025],[dx,-.215,dz+.025],[-.52,-.23,-.5725],[-.665,-.24,-.5725],[-.665,-.24,-.4],[-.665,-.25,-.05],[-.665,-.49,-.05],[-.665,-.49,z],[x,-.49,z],[x,-.47,z],seat]
   : [[dx+.009,dy-.0125,dz-.025],[dx+.009,-.24,dz-.025],[dx+.009,-.34,dz-.025],[-.665,-.35,dz-.025],[-.665,-.35,-.75],[-.665,-.49,-.75],[-.665,-.49,z],[x,-.49,z],[x,-.47,z],seat];
  const inlet=tube(route,plumbing,`${prefix}-selector-inlet`);
  units.push({name,center,poses,inlet,exhaust,intakeSeat:seat,dischargeSeat:out});
 }
 return {group,casings,covers,ports,mounts,plumbing,units,actuator};
}

// [EST] four local support clearances in the existing surface-only insulation.
// No foam thickness, seal, strength or thermal bridge calculation is implied.
export function openBlowerMountPorts(body,mounts){
 body.updateWorldMatrix(true,true);mounts.updateWorldMatrix(true,true);
 for(const support of mounts.children.filter(o=>o.name.endsWith('-wall-bracket'))){
  const at=support.getWorldPosition(new T.Vector3());
  const frame=new T.Matrix4().compose(new T.Vector3(-.43,at.y,at.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2),new T.Vector3(1,1,1)).invert();
  body.traverse(o=>{if(!o.isMesh||o.name!=='body-foam-port-surface')return;
   const next=cutSurfacePort(o.geometry,frame.clone().multiply(o.matrixWorld),.010,-.03,.065);
   o.geometry.dispose();o.geometry=next;
  });
 }
 body.userData.blowerMountPorts='Four estimated 20 mm support clearances; surface-only foam, not flight seals';
}
