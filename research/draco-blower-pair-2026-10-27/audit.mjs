import * as T from '../../dist/vendor/three/three.module.min.js';
import {buildBlowers} from '../../dist/draco-plumbing.mjs';
import {fullModel,triangles} from '../drill-moving-leads-2026-10-27/audit.mjs';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export {triangles};
export const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
export function fixture(){const root=new T.Group(),blowers=buildBlowers({parent:root,mesh});root.updateMatrixWorld(true);return{root,blowers};}
export function unitBounds(unit){const b=new T.Box3();for(const pose of Object.values(unit.poses))pose.traverse(o=>{if(!o.isMesh)return;
 const inv=pose.matrixWorld.clone().invert(),p=o.geometry.attributes.position;
 for(let i=0;i<p.count;i++)b.expandByPoint(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv));
 });return b;}
export function routeHits(root,blowerRoot,includeOwn=false){
 root.updateMatrixWorld(true);const others=[],tubes=[];
 root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;
  if(o.geometry.parameters?.path&&blowerRoot.getObjectById(o.id))tubes.push(o);
  else if((includeOwn||!blowerRoot.getObjectById(o.id))&&!o.name.includes('airflow'))others.push({mesh:o,box:new T.Box3().setFromObject(o)});
 });
 const hits=[];const q=new T.Vector3();
 for(const tube of tubes){const path=tube.geometry.parameters.path,r=tube.geometry.parameters.radius;
  const bounds=new T.Box3().setFromObject(tube).expandByScalar(r);
  const candidates=others.filter(o=>o.box.intersectsBox(bounds)).map(o=>({...o,box:o.box.clone().expandByScalar(r),tri:triangles(o.mesh).filter(t=>t.getArea()>1e-14)}));
  for(let i=0;i<=400;i++){const p=path.getPoint(i/400).applyMatrix4(tube.matrixWorld);
   for(const o of candidates){if(!o.box.containsPoint(p))continue;
    if(o.mesh.name==='draco-blower-flow-diverter'&&i<12&&tube.name.endsWith('selector-inlet'))continue;
    // The existing shared return intentionally seats in the selector, not these new branches.
    if(o.tri.some(t=>t.closestPointToPoint(p,q).distanceTo(p)<r-.00005)){
     if(!hits.some(h=>h.tube===tube.name&&h.mesh===o.mesh.name))hits.push({tube:tube.name,mesh:o.mesh.name,owner:o.mesh.parent.name,point:p.toArray()});
    }
   }
  }
 }
 return hits;
}
export function installedFixture(){return fullModel();}
export function surfacesCross(a,b){
 const aa=triangles(a).filter(t=>t.getArea()>1e-14),bb=triangles(b).filter(t=>t.getArea()>1e-14),q=new T.Vector3();
 const edges=(list,targets)=>{for(const t of list)for(const [p,end]of [[t.a,t.b],[t.b,t.c],[t.c,t.a]]){
  const direction=end.clone().sub(p),len=direction.length();if(len<1e-8)continue;
  const ray=new T.Ray(p,direction.divideScalar(len)),box=new T.Box3().setFromPoints([p,end]).expandByScalar(1e-8);
  for(const target of targets){if(!target.intersectsBox(box))continue;
   if(ray.intersectTriangle(target.a,target.b,target.c,false,q)&&q.distanceTo(p)>1e-7&&q.distanceTo(p)<len-1e-7)return true;
  }
 }return false;};
 return edges(aa,bb)||edges(bb,aa);
}
export function bodyHits(root,blowerRoot){root.updateMatrixWorld(true);const other=[],own=[],hits=[];
 root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;
  if(blowerRoot.getObjectById(o.id)){if(!o.geometry.parameters?.path)own.push(o);}
  else other.push({mesh:o,box:new T.Box3().setFromObject(o)});
 });
 for(const a of own){const box=new T.Box3().setFromObject(a);for(const b of other){
  if(box.intersectsBox(b.box)&&surfacesCross(a,b.mesh))hits.push({mesh:a.name,other:b.mesh.name,owner:b.mesh.parent.name});
 }}return hits;
}
export function report(){
 const f=fixture(),installed=installedFixture(),owner=installed.subsystems['drill-blower'];
 return{scope:'Illustrative supplier-referenced exteriors and estimated installation; geometric checks, not flight qualification',
  units:f.blowers.units.map(u=>({name:u.name,centerM:u.center,unitLocalSizeM:unitBounds(u).getSize(new T.Vector3()).toArray(),
   catalogSizeM:[.345,.168],diameterInterpretation:'Transverse unit package reference; detailed case/feet proportions estimated',installedAdaptersExcluded:true})),
  routeSurfaceHits:routeHits(installed.root,owner,true),bodySurfaceContacts:bodyHits(installed.root,owner),
  intendedContact:'Retained shared return enters retained blower selector',
  testedSeparately:'Both drill strokes, route-to-route clearance, structural support contact, independent inspection masks',
  flightInstallationConfirmed:false,electricalInterfaceConfirmed:false,dynamicCatalogInputsAdded:false};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(report(),null,2)+'\n');
