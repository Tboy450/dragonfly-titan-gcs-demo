import * as T from './vendor/three/three.module.min.js?v=dev';

// Anchor on an actual triangle of the part's currently visible hardware, not its
// bounding-box center. Cache triangle+barycentric coordinates so the pin follows
// moving/deforming meshes without scanning geometry every frame.
export function createInspectionAnchorResolver(){
 const cache=new WeakMap(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),
  q=new T.Vector3(),triangle=new T.Triangle(),inverse=new T.Matrix4();
 const visible=(mesh,owner)=>{let belongs=false;for(let p=mesh;p;p=p.parent){if(!p.visible)return false;if(p===owner)belongs=true;}return belongs;};
 const vertices=(mesh,indices,world)=>{
  const pos=mesh.geometry.attributes.position;
  [a,b,c].forEach((v,i)=>{v.fromBufferAttribute(pos,indices[i]);if(world)v.applyMatrix4(mesh.matrixWorld);});
  triangle.set(a,b,c);
 };
 return function resolve(owner,reference,hint=owner.userData.labelAnchor){
  let entry=cache.get(owner);
  const hintKey=hint?hint.toArray():null;
  if(!entry||entry.geometry!==entry.mesh.geometry||!visible(entry.mesh,owner)
   ||String(entry.hint)!==String(hintKey)){
   entry=null;const candidates=[],bounds=new T.Box3();
   owner.traverseVisible(mesh=>{if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.geometry.attributes.position||!visible(mesh,owner))return;
    const bounds=new T.Box3().setFromObject(mesh);if(!bounds.isEmpty())candidates.push({mesh,bounds});
   });
   if(!candidates.length)return null;
   const target=hint?hint.clone().applyMatrix4(reference.matrixWorld):
    candidates.reduce((all,item)=>all.union(item.bounds),bounds).getCenter(new T.Vector3());
   for(const item of candidates)item.distance=item.bounds.distanceToPoint(target);
   candidates.sort((x,y)=>x.distance-y.distance);
   let best=Infinity;
   for(const {mesh,distance}of candidates){
    if(distance>best+1e-9)break;
    const pos=mesh.geometry.attributes.position,index=mesh.geometry.index,count=index?index.count:pos.count;
    for(let i=0;i<count;i+=3){
     const indices=[0,1,2].map(j=>index?index.getX(i+j):i+j);
     vertices(mesh,indices,true);if(triangle.getArea()<1e-14)continue;
     triangle.closestPointToPoint(target,q);const distance=q.distanceTo(target);
     if(distance<best){best=distance;entry={mesh,indices,barycentric:triangle.getBarycoord(q,new T.Vector3()),geometry:mesh.geometry,hint:hintKey};}
    }
   }
   if(!entry)return null;cache.set(owner,entry);
  }
  vertices(entry.mesh,entry.indices,false);
  const weights=entry.barycentric;
  const point=a.clone().multiplyScalar(weights.x).addScaledVector(b,weights.y).addScaledVector(c,weights.z)
   .applyMatrix4(entry.mesh.matrixWorld).applyMatrix4(inverse.copy(reference.matrixWorld).invert());
  return {point,mesh:entry.mesh};
 };
}
