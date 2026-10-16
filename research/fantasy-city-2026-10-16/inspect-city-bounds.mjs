import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three/three.module.min.js';
const data=readFileSync('dist/invasion/environments/assets/source-scenes/cyberpunk.glb');
const doc=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));
const boxes=[];
const exactBounds=new THREE.Box3();
const binStart=28+data.readUInt32LE(12);
function visit(id,parent){
  const n=doc.nodes[id],local=new THREE.Matrix4();
  if(n.matrix)local.fromArray(n.matrix);else local.compose(new THREE.Vector3().fromArray(n.translation||[0,0,0]),new THREE.Quaternion().fromArray(n.rotation||[0,0,0,1]),new THREE.Vector3().fromArray(n.scale||[1,1,1]));
  const matrix=parent.clone().multiply(local);
  if(n.mesh!==undefined)for(const p of doc.meshes[n.mesh].primitives){
    const a=doc.accessors[p.attributes.POSITION],v=doc.bufferViews[a.bufferView];
    boxes.push({name:n.name,box:new THREE.Box3(new THREE.Vector3().fromArray(a.min),new THREE.Vector3().fromArray(a.max)).applyMatrix4(matrix)});
    const offset=binStart+(v.byteOffset||0)+(a.byteOffset||0),point=new THREE.Vector3();
    for(let i=0;i<a.count;i++){const b=offset+i*(v.byteStride||12);point.set(data.readFloatLE(b),data.readFloatLE(b+4),data.readFloatLE(b+8)).applyMatrix4(matrix);exactBounds.expandByPoint(point);}
  }
  for(const child of n.children||[])visit(child,matrix);
}
for(const id of doc.scenes[doc.scene||0].nodes)visit(id,new THREE.Matrix4());
const bounds=exactBounds;
const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=2000/Math.max(size.x,size.z);
const result=boxes.map(({name,box})=>{const s=box.getSize(new THREE.Vector3()).multiplyScalar(scale),m=box.getCenter(new THREE.Vector3());return {name,x:(m.x-center.x)*scale,z:(m.z-center.z)*scale,bottom:(box.min.y-bounds.min.y)*scale,top:(box.max.y-bounds.min.y)*scale,width:s.x,depth:s.z,height:s.y};});
writeFileSync('research/fantasy-city-2026-10-16/environment-tests/cyberpunk-bounds.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result.filter(b=>b.width>35&&b.depth>35&&b.height>45).sort((a,b)=>b.width*b.depth*b.height-a.width*a.depth*a.height).slice(0,65),null,2));
