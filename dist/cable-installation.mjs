import * as T from "./vendor/three/three.module.min.js?v=dev";

// Inspection-level fittings only. No flight fastener, cable construction or qualification claim.
export function addCableSupport({wire, fraction, foot, normal, mounts, id}) {
  const path=wire.geometry.parameters.path,r=wire.geometry.parameters.radius;
  const p=path.getPointAt(fraction),n=new T.Vector3(...normal).normalize(),f=new T.Vector3(...foot);
  const metal=new T.MeshStandardMaterial({color:0xb6bec2,metalness:.65,roughness:.4});
  const cushion=new T.MeshStandardMaterial({color:0x424a4c,metalness:0,roughness:.85});
  const tag=o=>{o.name="install-"+id+"-"+o.name;
    Object.assign(o.userData,{installationExample:true,confidence:"EST",flightMatingConfirmed:false,supportId:id,wireId:wire.userData.connectionId??wire.name});
    mounts.add(o);return o;};
  const pad=tag(new T.Mesh(new T.BoxGeometry(.009,.007,.0012),metal));
  pad.name="install-"+id+"-pad";pad.position.copy(f).addScaledVector(n,.0006);
  pad.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);
  const start=f.clone().addScaledVector(n,.0012),direction=p.clone().sub(start).normalize();
  const end=p.clone().addScaledVector(direction,-r-.0006),length=start.distanceTo(end);
  const post=tag(new T.Mesh(new T.CylinderGeometry(.001,.001,length,8),metal));
  post.name="install-"+id+"-post";post.position.copy(start).add(end).multiplyScalar(.5);
  post.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction);
  const rings=[];
  for(const [suffix,radius,thickness,material]of[["cushion",r+.00025,.00055,cushion],["strap",r+.0008,.0005,metal]]){
    const ring=tag(new T.Mesh(new T.TorusGeometry(radius,thickness,6,24),material));
    ring.name="install-"+id+"-"+suffix;ring.position.copy(p);
    ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),path.getTangentAt(fraction));rings.push(ring);
  }
  const record={id,fraction,foot:[...foot],normal:n.toArray(),radiusM:r,flightMatingConfirmed:false};
  wire.userData.installationSupports=[...(wire.userData.installationSupports??[]),record];
  return {wire,pad,post,rings,record};
}

export function addCableLacing({wire,fraction,parent,id}){
  const path=wire.geometry.parameters.path,r=wire.geometry.parameters.radius;
  const ring=new T.Mesh(new T.TorusGeometry(r+.0004,.0004,6,20),
    new T.MeshStandardMaterial({color:0xe7e7df,roughness:.85}));
  ring.name="install-"+id+"-lacing";ring.position.copy(path.getPointAt(fraction));
  ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),path.getTangentAt(fraction));
  Object.assign(ring.userData,{installationExample:true,confidence:"EST",flightMatingConfirmed:false,wireId:wire.userData.connectionId??wire.name});
  parent.add(ring);return ring;
}
