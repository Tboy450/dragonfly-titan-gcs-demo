import * as THREE from "./vendor/three/three.module.min.js";

// Subtract an estimated rectangular optical corridor from an existing surface mesh.
// Attribute interpolation retains its finish/shading; this is not a flight bore drawing.
export function cutSurfacePort(geometry,toPort,halfWidth,from,to){
  const source=geometry.index?geometry.toNonIndexed():geometry,attrs=Object.entries(source.attributes),output=Object.fromEntries(attrs.map(([k])=>[k,[]]));
  const position=new THREE.Vector3();
  const vertex=i=>Object.fromEntries(attrs.map(([k,a])=>[k,Array.from(a.array.slice(i*a.itemSize,(i+1)*a.itemSize))]));
  const distance=(v,axis,sign,limit)=>{position.fromArray(v.position).applyMatrix4(toPort);return sign*position.getComponent(axis)-limit;};
  const interpolate=(a,b,t)=>Object.fromEntries(attrs.map(([k])=>[k,a[k].map((n,j)=>n+(b[k][j]-n)*t)]));
  const clip=(poly,axis,sign,limit,inside)=>{
    const result=[];for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],da=distance(a,axis,sign,limit),db=distance(b,axis,sign,limit);
      const ia=inside?da<=0:da>0,ib=inside?db<=0:db>0;
      if(ia)result.push(a);if(ia!==ib)result.push(interpolate(a,b,da/(da-db)));
    }return result;
  };
  const planes=[[0,1,halfWidth],[0,-1,halfWidth],[1,1,halfWidth],[1,-1,halfWidth],[2,1,to],[2,-1,-from]];
  const emit=poly=>{for(let j=1;j<poly.length-1;j++){
    const tri=[poly[0],poly[j],poly[j+1]],a=new THREE.Vector3().fromArray(tri[0].position),b=new THREE.Vector3().fromArray(tri[1].position),c=new THREE.Vector3().fromArray(tri[2].position);
    if(b.sub(a).cross(c.sub(a)).lengthSq()<1e-20)continue;
    for(const v of tri)for(const[k]of attrs)output[k].push(...v[k]);
  }};
  for(let i=0;i<source.attributes.position.count;i+=3){
    let remaining=[vertex(i),vertex(i+1),vertex(i+2)];
    for(const[axis,sign,limit]of planes){
      emit(clip(remaining,axis,sign,limit,false));
      remaining=clip(remaining,axis,sign,limit,true);if(!remaining.length)break;
    }
  }
  const result=new THREE.BufferGeometry();for(const[k,a]of attrs)result.setAttribute(k,new THREE.BufferAttribute(new a.array.constructor(output[k]),a.itemSize,a.normalized));
  result.computeBoundingBox();result.computeBoundingSphere();if(source!==geometry)source.dispose();return result;
}

export function openInsulationOpticalPorts(body,cameras){
  body.updateWorldMatrix(true,true);
  for(const parts of cameras){
    const port=parts.window.userData.opticalPort;if(!port)continue;
    parts.group.updateWorldMatrix(true,false);
    const toCamera=parts.group.matrixWorld.clone().invert();
    body.traverse(o=>{if(!o.isMesh)return;
      const next=cutSurfacePort(o.geometry,toCamera.clone().multiply(o.matrixWorld),port.halfWidth,port.from,port.to);
      o.geometry.dispose();o.geometry=next;
    });
  }
  body.userData.opticalPorts="Estimated optical corridors from installed lower cameras; outer profile otherwise retained";
}
export const openBodyCameraPorts=openInsulationOpticalPorts;
