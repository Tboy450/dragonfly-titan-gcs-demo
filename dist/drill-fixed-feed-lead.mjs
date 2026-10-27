import * as T from './vendor/three/three.module.min.js?v=dev';

// [EST] One local feed-drive service-lead example, not a flight cable count,
// circuit assignment, connector or cryogenic harness qualification.
export const drillFixedLeadAsset=Object.freeze({
 revision:'drill-fixed-feed-lead-2026-10-27',
 radiusM:.002,exitY:-.223,motorRearZ:.002,joinZ:-.030,
 retentionY:-.30,retentionZ:-.018,coverHoleRadiusM:.0036,grommetBoreRadiusM:.0023,
});

// Fixed-frame path: two tangent straight legs joined by a true semicircle.
// No flexing/stretched wire is implied when the independent drill carriage moves.
export class FixedFeedLeadCurve extends T.Curve{
 constructor(x){
  super();this.x=x;this.radius=(drillFixedLeadAsset.exitY-drillFixedLeadAsset.retentionY)/2;
  this.firstLength=drillFixedLeadAsset.motorRearZ-drillFixedLeadAsset.joinZ;
  this.length=this.firstLength+Math.PI*this.radius+drillFixedLeadAsset.retentionZ-drillFixedLeadAsset.joinZ;
 }
 getLength(){return this.length;}
 getPointAt(t,target){return this.getPoint(t,target);}
 getTangentAt(t,target){return this.getTangent(t,target);}
 getPoint(t,target=new T.Vector3()){
  const a=drillFixedLeadAsset,s=T.MathUtils.clamp(t,0,1)*this.length;
  if(s<=this.firstLength)return target.set(this.x,a.exitY,a.motorRearZ-s);
  const arc=s-this.firstLength;
  if(arc>=Math.PI*this.radius)return target.set(this.x,a.retentionY,a.joinZ+arc-Math.PI*this.radius);
  const theta=arc/this.radius;
  return target.set(this.x,a.exitY-this.radius*(1-Math.cos(theta)),a.joinZ-this.radius*Math.sin(theta));
 }
 getTangent(t,target=new T.Vector3()){
  const s=T.MathUtils.clamp(t,0,1)*this.length;
  if(s<=this.firstLength)return target.set(0,0,-1);
  const theta=(s-this.firstLength)/this.radius;
  if(theta>=Math.PI)return target.set(0,0,1);
  return target.set(0,-Math.sin(theta),-Math.cos(theta));
 }
}

export function buildFixedFeedLead({drill,mesh,drive,black,silver,grey}){
 const group=(name,inspectionLayer)=>{const g=new T.Group();g.name=name;g.userData.inspectionLayer=inspectionLayer;drill.add(g);return g;};
 const leads=group('drill-fixed-feed-service-leads','harnesses');
 const interfaces=group('drill-fixed-feed-lead-interfaces','interfaces');
 const supports=group('drill-fixed-feed-lead-supports','mounts');
 const x=drive.motor.position.x,a=drillFixedLeadAsset,path=new FixedFeedLeadCurve(x);
 const cable=mesh(new T.TubeGeometry(path,64,a.radiusM,8,false),black,[0,0,0],leads);
 cable.name='drill-feed-service-lead';
 cable.userData.flightMatingConfirmed=false;
 cable.userData.electricalRole='Unresolved feed-drive service-lead example';
 cable.userData.endpointRole='Local retention only; remote continuation unmodeled';
 const ri=a.grommetBoreRadiusM;
 const profile=[[ri,-.008],[.0035,-.008],[.0048,-.003],[.0048,-.0015],
  [.0033,-.0015],[.0033,.0015],[ri,.0015],[ri,-.008]];
 const grommet=mesh(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),24),
  black,[x,a.exitY,-.0035],interfaces);
 grommet.rotation.x=Math.PI/2;grommet.name='drill-feed-cover-grommet';
 const retention=mesh(new T.TorusGeometry(.003,.0006,8,24),silver,
  [x,a.retentionY,a.retentionZ],supports);retention.name='drill-feed-retention-ring';
 const tab=mesh(new T.BoxGeometry(.007,.003,.024),grey,[x,-.3048,-.006],supports);
 tab.name='drill-feed-retention-tab';
 return{leads,interfaces,supports,cable,path,grommet,retention,tab};
}
