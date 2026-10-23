import * as THREE from "./vendor/three/three.module.min.js";

export function surfaceDirection(a,b,c) {
  const x=(a.x+b.x+c.x)/3,n=b.clone().sub(a).cross(c.clone().sub(a));
  const nx=Math.abs(n.x),ny=Math.abs(n.y),nz=Math.abs(n.z);
  return nx>=ny&&nx>=nz?(x<0?"port":"starboard"):ny>=nz?(n.y>0?"top":"belly"):"ends";
}

// Split inspection ownership without changing triangles, winding, normals or UVs.
export function splitSurfaceGeometry(geometry,classify=surfaceDirection) {
  const source=geometry.index?geometry.toNonIndexed():geometry,buckets=new Map();
  const p=source.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<p.count;i+=3){
    a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);
    const id=classify(a,b,c);if(!buckets.has(id))buckets.set(id,[]);buckets.get(id).push(i,i+1,i+2);
  }
  const result=new Map();
  for(const[id,vertices]of buckets){
    const part=new THREE.BufferGeometry();
    for(const[name,attribute]of Object.entries(source.attributes)){
      const values=new attribute.array.constructor(vertices.length*attribute.itemSize);
      vertices.forEach((vertex,i)=>values.set(attribute.array.subarray(vertex*attribute.itemSize,(vertex+1)*attribute.itemSize),i*attribute.itemSize));
      part.setAttribute(name,new THREE.BufferAttribute(values,attribute.itemSize,attribute.normalized));
    }
    part.computeBoundingBox();part.computeBoundingSphere();result.set(id,part);
  }
  if(source!==geometry)source.dispose();return result;
}
