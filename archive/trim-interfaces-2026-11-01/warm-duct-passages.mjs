import * as T from './vendor/three/three.module.min.js?v=dev';

// [PUB] Forward ducted flow, then open return through the body (TFAWS23 slide4).
// [EST] This is an inspection shell, not a flight duct, material specification,
// pressure-loss model or reconstructed trim/bulkhead interface.
export const warmDuctPassageAsset=Object.freeze({
 revision:'warm-duct-passages-2026-10-30',wallM:.0015,
 outletFrame:Object.freeze({widthM:.146,lengthM:.075,thicknessM:.006,angleRad:.55}),
 flightGeometryConfirmed:false,
});
export const warmDuctChangedNames=Object.freeze(['warm-duct-run','warm-duct-flange','warm-duct-nose-outlet','warm-duct-outlet-grille']);

function rectangularFrame(w,h,iw,ih,depth){
 const s=new T.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();
 const p=new T.Path();p.moveTo(-iw/2,-ih/2);p.lineTo(-iw/2,ih/2);p.lineTo(iw/2,ih/2);p.lineTo(iw/2,-ih/2);p.closePath();s.holes.push(p);
 const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,steps:1});g.translate(0,0,-depth/2);return g;
}
// Sections follow a planar elbow. v is its transverse direction in the yz plane.
// Four outer walls, four inner walls and end rims; never a face across the bore.
function shellGeometry(sections,wall){
 // These sections run toward -z, unlike the positive-z fan transition.
 const vertices=[],quad=(a,b,c,d)=>vertices.push(...a,...c,...b,...a,...d,...c);
 const ring=(s,inset)=>{const w=s.w-2*inset,h=s.h-2*inset;
  return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>[x*w/2,s.y+y*h*s.v[0]/2,s.z+y*h*s.v[1]/2]);};
 const outer=sections.map(s=>ring(s,0)),inner=sections.map(s=>ring(s,wall));
 for(let k=0;k<sections.length-1;k++)for(let i=0;i<4;i++){const j=(i+1)%4;
  quad(outer[k][i],outer[k][j],outer[k+1][j],outer[k+1][i]);
  quad(inner[k][j],inner[k][i],inner[k+1][i],inner[k+1][j]);
 }
 for(let i=0;i<4;i++){const j=(i+1)%4;
  quad(outer[0][j],outer[0][i],inner[0][i],inner[0][j]);
  quad(outer.at(-1)[i],outer.at(-1)[j],inner.at(-1)[j],inner.at(-1)[i]);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
}

// The circle is fitted to the retained run mouth and retained outlet-frame pose.
// These are model dimensions [EST], not measurements from the test-article CAD.
export function warmDuctNoseSections(layout){
 const {width:w,height:h,y,front}=layout,F=warmDuctPassageAsset.outletFrame,wall=F.thicknessM/2;
 const angle=Math.PI/2+F.angleRad,normal=[Math.cos(F.angleRad),Math.sin(F.angleRad)];
 const endY=-.18-normal[0]*wall,endZ=front-.15-normal[1]*wall;
 const radius=(endY-y)/(1-Math.cos(angle)),startZ=endZ+radius*Math.sin(angle);
 const sections=[{w,h,y,z:front,v:[1,0]}];
 for(let k=0;k<=12;k++){const t=k/12,a=t*angle;sections.push({
  w:w+(F.widthM-w)*t,h:h+(F.lengthM-h)*t,
  y:y+radius*(1-Math.cos(a)),z:startZ-radius*Math.sin(a),v:[Math.cos(a),Math.sin(a)],
 });}
 return {sections,radiusM:radius,angleRad:angle,endY,endZ};
}

export function buildWarmDuctPassages({parent,mesh,layout,duct,steel,transition}){
 const {width:W,height:H,y,front,back}=layout,A=warmDuctPassageAsset,t=A.wallM;
 const run=mesh(rectangularFrame(W,H,W-2*t,H-2*t,back-front),duct,[0,y,(front+back)/2],parent);
 run.name='warm-duct-run';run.userData.inspectionLabel='Main warm duct (estimated open section)';run.userData.inspectionMinimumRadiusM=.06;
 for(let z=front+.3;z<back;z+=.42)mesh(rectangularFrame(W+.012,H+.012,W-2*t,H-2*t,.012),steel,[0,y,z],parent).name='warm-duct-flange';
 const nose=warmDuctNoseSections(layout),outlet=mesh(shellGeometry(nose.sections,t),transition,[0,0,0],parent);
 outlet.name='warm-duct-nose-outlet';outlet.userData.inspectionLabel='Nose return elbow (estimated open shell)';outlet.userData.inspectionMinimumRadiusM=.07;
 const F=A.outletFrame,frameGeometry=rectangularFrame(F.widthM,F.lengthM,F.widthM-2*t,F.lengthM-2*t,F.thicknessM);
 frameGeometry.rotateX(Math.PI/2);
 const frame=mesh(frameGeometry,steel,[0,-.18,front-.15],parent);frame.rotation.x=F.angleRad;
 frame.name='warm-duct-outlet-grille';frame.userData.inspectionLabel='Outlet frame (grille detail unconfirmed)';frame.userData.inspectionMinimumRadiusM=.04;
 return {run,outlet,frame};
}
