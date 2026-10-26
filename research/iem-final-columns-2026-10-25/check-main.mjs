import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {candidateFixture} from './candidate-fixture.mjs';
import {buildMainHarness} from '../../dist/main-harness.mjs';
const{parent}=await candidateFixture(),root=new T.Group(),mesh=(g,m,p,owner)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);owner.add(o);return o;};
buildMainHarness({parent:root,mesh});root.updateMatrixWorld(true);
const branch=root.getObjectByName('main-harness-iem'),path=branch.geometry.parameters.path,end=path.getPoint(1).applyMatrix4(branch.matrixWorld),hits=[];
const wires=parent.getObjectsByProperty('name','iem-harness-cable');
for(let i=0;i<=120;i++){
 const p=path.getPoint(i/120).applyMatrix4(branch.matrixWorld);if(p.distanceTo(end)<.03)continue;
 const box=new T.Box3().setFromCenterAndSize(p,new T.Vector3(1,1,1).multiplyScalar(2*branch.geometry.parameters.radius-.002));
 for(const w of wires)for(let j=0;j<=60;j++){
  const q=w.geometry.parameters.path.getPoint(j/60).applyMatrix4(w.matrixWorld),r=w.geometry.parameters.radius;
  if(box.intersectsBox(new T.Box3().setFromCenterAndSize(q,new T.Vector3(1,1,1).multiplyScalar(2*r))))hits.push({id:w.userData.connectionId,p:p.toArray(),q:q.toArray(),endDistance:p.distanceTo(end)});
 }
}
console.log(JSON.stringify(hits,null,2));
