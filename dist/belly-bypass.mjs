import * as T from './vendor/three/three.module.min.js?v=dev';
import {cutSurfacePort} from './foam-optical-ports.mjs?v=dev';

// [PUB] Exposed cold bypass: NASA/APL TFAWS2024 slides3/9.
// [EST] Connected inspection relief in the existing surface-only belly. This
// does not reconstruct local foam thickness, a sealed recess or flight tile seams.
export const bellyBypassAsset=Object.freeze({revision:'belly-bypass-2026-11-06',
 clearanceM:.002,surfaceOnly:true,flightEdgeConfirmed:false});
export const bypassReliefNames=Object.freeze(['cold-duct-channel','front-diverter-housing','aft-diverter-housing']);

// Derive the footprint from actual installed vertices in the body's frame,
// including its bevel. Never use the old nominal bellyY as a physical surface.
export function bypassReliefBounds(body,trim){
 body.updateWorldMatrix(true,true);trim.updateWorldMatrix(true,true);
 const inverse=body.matrixWorld.clone().invert();
 return bypassReliefNames.map(name=>{
  const object=trim.getObjectByName(name);if(!object)throw Error('Missing bypass surface: '+name);
  const matrix=inverse.clone().multiply(object.matrixWorld),p=object.geometry.attributes.position,b=new T.Box3();
  for(let i=0;i<p.count;i++)b.expandByPoint(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix));
  b.expandByScalar(bellyBypassAsset.clearanceM);return {name,min:b.min.toArray(),max:b.max.toArray()};
 });
}
export function openBellyBypass(body,trim){
 const surface=body.getObjectByName('body-foam-belly-surface');if(!surface)return;
 const bounds=bypassReliefBounds(body,trim),toBody=body.matrixWorld.clone().invert().multiply(surface.matrixWorld);
 for(const {min,max}of bounds){
  const cx=(min[0]+max[0])/2,cz=(min[2]+max[2])/2,half=(max[0]-min[0])/2,ratio=(max[0]-min[0])/(max[2]-min[2]);
  // x,z footprint becomes the clipper's cross-section; depth runs along y.
  const toPort=new T.Matrix4().set(1,0,0,-cx,0,0,ratio,-cz*ratio,0,1,0,0,0,0,0,1).multiply(toBody);
  const next=cutSurfacePort(surface.geometry,toPort,half,-10,10);surface.geometry.dispose();surface.geometry=next;
 }
 Object.assign(surface.userData,{bypassRelief:bellyBypassAsset.revision,surfaceOnly:true});
 body.userData.bypassRelief='Estimated connected cold-bypass opening; edge construction, local thickness and seals unmodeled';
 return bounds;
}
