import * as T from './vendor/three/three.module.min.js?v=dev';

// [PUB] Adams et al., AMS2024 figs.6,10-11: EM1 spherical nut and six crossed
// crowned cam rollers. Fig.11 is an engineering illustration, not a photograph.
// [EST] fitted dimensions, pocket/fasteners and guide cross-section. No flight CAD.
export const drillCarriageAsset=Object.freeze({
 revision:'drill-carriage-2026-10-27',rollerRadiusM:.0045,rollerWidthM:.005,
 rollerYs:Object.freeze([.175,.190,.205]),nutY:.190,nutBoreRadiusM:.005,
 railHalfWidthM:.015,railHalfDepthM:.008,grooveRootM:.010,
});

export function drillGuideGeometry(length){
 const outline=[[-.015,-.008],[.015,-.008],[.015,-.005],[.010,0],[.015,.005],
  [.015,.008],[-.015,.008],[-.015,.005],[-.010,0],[-.015,-.005]];
 const shape=new T.Shape(outline.map(p=>new T.Vector2(...p)));
 const g=new T.ExtrudeGeometry(shape,{depth:length,bevelEnabled:false,steps:1});
 g.translate(0,0,-length/2);g.rotateX(Math.PI/2);return g;
}

export function buildDrillCarriage({carriage,head,mesh,railX,silver,grey}){
 const mounts=new T.Group();mounts.name='drill-carriage-mounts';
 mounts.userData.inspectionLayer='mounts';carriage.add(mounts);
 const interfaces=new T.Group();interfaces.name='drill-carriage-interfaces';
 interfaces.userData.inspectionLayer='interfaces';carriage.add(interfaces);
 const dark=new T.MeshStandardMaterial({color:0x44484a,roughness:.40,metalness:.7});
 // Muted brown is illustrative DFL appearance, not the bare bronze in fig.6.
 const nutMaterial=new T.MeshStandardMaterial({color:0x79674c,roughness:.48,metalness:.65});
 const box=(size,at,mat,parent,name)=>{const o=mesh(new T.BoxGeometry(...size),mat,at,parent);o.name=name;return o;};
 const turned=(points,at,mat,parent,name)=>{
  const o=mesh(new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),24),mat,at,parent);o.name=name;return o;
 };
 // A rear bridge carries the drill head; it does not fill the rail or screw.
 const bridge=box([.052,.044,.003],[railX,.19,.0075],grey,head,'drill-carriage-bracket');
 const rollers=[];
 for(const s of [-1,1])for(let i=0;i<3;i++){
  const t=(i+(s>0?1:0))%2?1:-1,y=drillCarriageAsset.rollerYs[i],r=drillCarriageAsset.rollerRadiusM;
  // Contact is halfway along one V flank. Opposite/adjacent roller axes cross.
  const normal=new T.Vector3(s,0,-t).normalize(),axis=new T.Vector3(s,0,t).normalize();
  const contact=new T.Vector3(railX+s*.0125,y,.02+t*.0025);
  const center=contact.clone().addScaledVector(normal,r);
  const axle=new T.Group();axle.name='drill-roller-axle';axle.position.copy(center);
  axle.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis);mounts.add(axle);
  const wheel=turned([[.0015,-.0025],[.0041,-.0025],[r,0],[.0041,.0025],
   [.0015,.0025],[.0015,-.0025]],[0,0,0],dark,axle,'drill-cam-roller');
  const extent=(.0225-Math.abs(center.x-railX))*Math.SQRT2;
  const stud=mesh(new T.CylinderGeometry(.0015,.0015,extent-.0025,12),silver,
   [0,(extent+.0025)/2,0],axle);stud.name='drill-roller-stud';
  const end=center.clone().addScaledVector(axis,extent);
  const top=i===1?.0475:end.z+.0015;
  box([.003,.009,top-.009],[railX+s*.0225,y,(top+.009)/2],grey,mounts,'drill-roller-support');
  const cap=turned([[0,0],[.0025,0],[.0025,.0015],[0,.0015]],
   [0,extent,0],silver,axle,'drill-roller-stud-cap');
  cap.userData.eccentricAdjustmentIllustration=(s<0); // three on one side; offset unmodeled
  rollers.push({wheel,axis,normal,contact,center,sign:s*t});
 }
 // Hollow spherical nut and a separate pocket, consistent with ETU/EM1.
 // No EM2 trunnion transplant, helical thread, bearing needles or joint solver.
 const sphere=[];for(let i=0;i<=12;i++){
  const y=-.007+i*.014/12;sphere.push([Math.sqrt(.010**2-y*y),y]);
 }
 const nut=turned([[.005,-.007],...sphere,[.005,.007],[.005,-.007]],
  [railX,.19,.045],nutMaterial,interfaces,'drill-lead-nut');
 const pocket=turned([[.006,-.014],[.014,-.014],[.014,-.010],[.0135,-.010],
  [.0135,.008],[.0072,.008],[.0072,.0072],...sphere.slice().reverse().map(([x,y])=>[x+.00025,y]),
  [.0072,-.0072],[.006,-.0072],[.006,-.014]],
  [railX,.19,.045],grey,interfaces,'drill-nut-pocket');
 for(const s of [-1,1]){
  box([.011,.008,.005],[railX+s*.0185,.19,.045],grey,mounts,'drill-nut-pocket-ear');
  const bolt=mesh(new T.CylinderGeometry(.002,.002,.002,6),silver,
   [railX+s*.0225,.195,.045],interfaces);bolt.name='drill-carriage-bolt';
 }
 // Surface-only rolling illustration; radii are estimated, not a bearing solver.
 const setFeed=feed=>{
  const value=T.MathUtils.clamp(Number.isFinite(feed)?feed:0,0,.13);
  for(const roller of rollers)roller.wheel.rotation.y=roller.sign*value/drillCarriageAsset.rollerRadiusM;
 };
 setFeed(0);return{mounts,interfaces,bridge,nut,pocket,rollers,setFeed};
}
