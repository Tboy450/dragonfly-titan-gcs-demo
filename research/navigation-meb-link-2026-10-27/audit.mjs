import * as T from '../../dist/vendor/three/three.module.min.js';
import {buildMainHarness} from '../../dist/main-harness.mjs';
import {buildNoseElectronics} from '../../dist/nose-electronics.mjs';
import {navigationMebInterface as A} from '../../dist/navigation-meb-interface.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
export function audit(){
 const parent=new T.Group(),navigation=new T.Group(),equipment=new T.Group();
 buildMainHarness({parent,mesh,navigationParent:navigation});buildNoseElectronics({parent:equipment,mesh});
 equipment.updateMatrixWorld(true);navigation.updateMatrixWorld(true);
 const wire=navigation.getObjectByName('main-harness-navigation-meb'),path=wire.geometry.parameters.path;
 const triangles=[];equipment.traverse(o=>{if(!o.isMesh)return;const pos=o.geometry.attributes.position,idx=o.geometry.index;
  for(let i=0;i<(idx?idx.count:pos.count);i+=3){const v=j=>new T.Vector3().fromBufferAttribute(pos,idx?idx.getX(j):j).applyMatrix4(o.matrixWorld);
   const t=new T.Triangle(v(i),v(i+1),v(i+2));if(t.getArea()>1e-14)triangles.push({name:o.name,t});}
 });
 let closest={gap:Infinity};const q=new T.Vector3();
 for(const [i,p]of path.getSpacedPoints(600).entries())for(const {name,t}of triangles){
  t.closestPointToPoint(p,q);const gap=p.distanceTo(q);if(gap<closest.gap)closest={gap,name,u:i/600,point:p.toArray()};
 }
 return {interface:A,centerlineNearestNavigation:closest,cableSurfaceClearanceM:closest.gap-.008,
  terminalTangent:path.getTangent(1).toArray(),flightMatingConfirmed:false};
}
if(process.argv.includes('--write')){const {writeFile}=await import('node:fs/promises');await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(audit(),null,2));}
else console.log(JSON.stringify(audit()));
