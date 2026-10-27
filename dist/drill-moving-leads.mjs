import * as THREE from './vendor/three/three.module.min.js?v=dev';

// [EST] local moving accommodation, not a reconstruction of DrACO flight wiring.
// Existing motor-cap endpoints retained. Fixed ends are retention points on the
// upper body mount, not controller connectors. Round 6 mm envelopes retain the
// earlier illustrative diameter; conductor count, jacket and cryogenic life unknown.
export const drillLeadAsset = Object.freeze({
  revision:'drill-moving-leads-2026-10-27', radiusM:.003, strokeM:.13,
  segments:64, radialSegments:8,
  motorCaps:Object.freeze([Object.freeze([.02,.455,-.025]),Object.freeze([0,.315,-.072])]),
  fixed:Object.freeze([Object.freeze([-.092,-.30,-.031]),Object.freeze([-.082,-.30,-.060])]),
  topSlackM:Object.freeze([.065,.09]),
});

// Two straight vertical legs and a translating semicircle have constant length.
// Arc height drops by feed/2; ends remain tangent, with no elastic cable stretching.
export class RollingLeadCurve extends THREE.Curve {
  constructor(moving, fixed, topSlack) {
    super(); this.origin=moving.clone(); this.fixed=fixed.clone();
    this.direction=fixed.clone().sub(moving); this.direction.y=0;
    this.radius=this.direction.length()/2; this.direction.normalize();
    this.normal=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),this.direction).normalize();
    this.length=2*(Math.max(moving.y,fixed.y)+topSlack)-moving.y-fixed.y+Math.PI*this.radius;
    this.setFeed(0);
  }
  setFeed(feed) {
    this.feed=THREE.MathUtils.clamp(Number.isFinite(feed)?feed:0,0,drillLeadAsset.strokeM);
    this.startY=this.origin.y-this.feed;
    this.joinY=(this.length+this.startY+this.fixed.y-Math.PI*this.radius)/2;
    this.firstLength=this.joinY-this.startY;
  }
  getLength(){return this.length;}
  getPointAt(t,target){return this.getPoint(t,target);}
  getTangentAt(t,target){return this.getTangent(t,target);}
  getPoint(t,target=new THREE.Vector3()) {
    const s=THREE.MathUtils.clamp(t,0,1)*this.length;
    if(s<=this.firstLength)return target.set(this.origin.x,this.startY+s,this.origin.z);
    const arc=s-this.firstLength;
    if(arc>=Math.PI*this.radius)return target.set(this.fixed.x,this.joinY-(arc-Math.PI*this.radius),this.fixed.z);
    const a=arc/this.radius,offset=this.radius*(1-Math.cos(a));
    return target.set(this.origin.x+this.direction.x*offset,this.joinY+this.radius*Math.sin(a),this.origin.z+this.direction.z*offset);
  }
  getTangent(t,target=new THREE.Vector3()) {
    const s=THREE.MathUtils.clamp(t,0,1)*this.length;
    if(s<=this.firstLength)return target.set(0,1,0);
    const a=(s-this.firstLength)/this.radius;
    if(a>=Math.PI)return target.set(0,-1,0);
    return target.set(this.direction.x*Math.sin(a),Math.cos(a),this.direction.z*Math.sin(a));
  }
}

function cableGeometry(path) {
  const {segments,radialSegments:radials,radiusM:radius}=drillLeadAsset;
  const geometry=new THREE.BufferGeometry(),count=(segments+1)*(radials+1),indices=[];
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(count*3),3).setUsage(THREE.DynamicDrawUsage));
  for(let i=0;i<segments;i++)for(let j=0;j<radials;j++){
    const a=i*(radials+1)+j,b=a+radials+1;
    indices.push(a,a+1,b,b,a+1,b+1);
  }
  geometry.setIndex(indices);
  geometry.parameters={path,radius,tubularSegments:segments,radialSegments:radials,closed:false};
  const point=new THREE.Vector3(),tangent=new THREE.Vector3(),radial=new THREE.Vector3(),across=new THREE.Vector3();
  geometry.userData.update=()=>{
    const positions=geometry.attributes.position,normals=geometry.attributes.normal;
    for(let i=0;i<=segments;i++){
      path.getPoint(i/segments,point);path.getTangent(i/segments,tangent);
      across.crossVectors(tangent,path.normal).normalize();
      for(let j=0;j<=radials;j++){
        const a=j/radials*Math.PI*2,index=i*(radials+1)+j;
        radial.copy(path.normal).multiplyScalar(Math.cos(a)).addScaledVector(across,Math.sin(a));
        positions.setXYZ(index,point.x+radius*radial.x,point.y+radius*radial.y,point.z+radius*radial.z);
        normals.setXYZ(index,radial.x,radial.y,radial.z);
      }
    }
    positions.needsUpdate=true;normals.needsUpdate=true;
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
  };
  geometry.userData.update();return geometry;
}

export function buildDrillMovingLeads({drill,carriage,mesh,side,stowedY,black,silver,grey}) {
  const leads=new THREE.Group();leads.name=`drill-${side<0?'port':'starboard'}-motor-leads`;
  leads.userData.inspectionLayer='harnesses';drill.add(leads);
  const supports=new THREE.Group();supports.name='drill-fixed-cable-supports';supports.userData.inspectionLayer='mounts';drill.add(supports);
  const boots=new THREE.Group();boots.name='drill-moving-cable-boots';boots.userData.inspectionLayer='interfaces';carriage.add(boots);
  const cables=drillLeadAsset.motorCaps.map(([x,y,z],i)=>{
    const moving=new THREE.Vector3(side*x,stowedY+y,z);
    const [fx,fy,fz]=drillLeadAsset.fixed[i],fixed=new THREE.Vector3(side*fx,fy,fz);
    const path=new RollingLeadCurve(moving,fixed,drillLeadAsset.topSlackM[i]);
    const geometry=cableGeometry(path),part=mesh(geometry,black,[0,0,0],leads);
    part.name='drill-motor-lead';part.userData.motor=i===0?'percussion':'rotation';
    const boot=mesh(new THREE.CylinderGeometry(.0045,.0045,.009,12),black,[side*x,y+.0045,z],boots);
    boot.name='drill-cable-boot';
    const band=mesh(new THREE.TorusGeometry(.0038,.0008,6,16),silver,fixed.toArray(),supports);
    band.rotation.x=Math.PI/2;band.name='drill-cable-seat';
    // Tabs return to the front face of the existing upper body mount (local z=-.025).
    // Start behind the ring's outer surface, keeping the solid tab out of the wire bore.
    const ringBack=fz+.0046,depth=-.025-ringBack;
    mesh(new THREE.BoxGeometry(.009,.008,depth),grey,[fixed.x,fy,(ringBack-.025)/2],supports).name='drill-cable-support';
    return {mesh:part,path,fixed,motorLocal:new THREE.Vector3(side*x,y,z)};
  });
  let previous=0;
  const setFeed=feed=>{
    const next=THREE.MathUtils.clamp(Number.isFinite(feed)?feed:0,0,drillLeadAsset.strokeM);
    carriage.position.y=stowedY-next;
    if(next===previous)return;
    previous=next;
    for(const cable of cables){cable.path.setFeed(next);cable.mesh.geometry.userData.update();}
  };
  return {leads,supports,boots,cables,setFeed};
}
