import {writeFile} from 'node:fs/promises';
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {fixture} from '../iem-middle-lead-2026-10-25/audit.mjs';
import {nextIds,legacyIds} from './audit.mjs';

const{parent}=fixture(),wires=parent.getObjectsByProperty('name','iem-harness-cable');
const samples=wires.filter(w=>!legacyIds.has(w.userData.connectionId))
 .map(w=>({id:w.userData.connectionId,points:w.geometry.parameters.path.getSpacedPoints(1500)}));
const fixed=[];
parent.traverse(o=>{if(o.isMesh&&o.name!=='iem-harness-cable'&&!(o.name==='iem-harness-label'&&(nextIds.includes(o.userData.connectionId)||legacyIds.has(o.userData.connectionId)))){
 o.geometry.computeBoundingBox();fixed.push({id:o.userData.connectionId,box:o.geometry.boundingBox.clone().applyMatrix4(o.matrix)});
}});
const results=[];
for(const id of nextIds){
 const wire=wires.find(w=>w.userData.connectionId===id),path=wire.geometry.parameters.path;
 const label=parent.getObjectsByProperty('name','iem-harness-label').find(o=>o.userData.connectionId===id);
 label.geometry.computeBoundingBox();let chosen;
 const fractions=Array.from({length:89},(_,i)=>.02+i*.01).sort((a,b)=>Math.abs(a-.18)-Math.abs(b-.18));
 search:for(const roll of [0,Math.PI/2,Math.PI/4,-Math.PI/4])for(const offset of [-.005,.005,-.006,.006])for(const fraction of fractions){
  const anchor=path.getPointAt(fraction);label.position.copy(anchor);label.position.z+=offset;
  label.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),path.getTangentAt(fraction));
  label.quaternion.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),roll));label.updateMatrix();
  const inverse=label.matrix.clone().invert(),box=label.geometry.boundingBox,worldBox=box.clone().applyMatrix4(label.matrix);
  if(worldBox.min.y<-.0009)continue;
  if(fixed.some(o=>o.id!==id&&worldBox.intersectsBox(o.box)))continue;
  if(samples.some(row=>row.points.some(p=>!(row.id===id&&p.distanceTo(anchor)<.015)
   &&box.distanceToPoint(p.clone().applyMatrix4(inverse))<.0047)))continue;
  chosen={fraction:+fraction.toFixed(2),offset,roll};fixed.push({id,box:worldBox});break search;
 }
 if(chosen===undefined)throw Error('No clear tag placement '+id);
 results.push({id,labelFraction:chosen.fraction,labelOffsetZ:chosen.offset,labelRoll:chosen.roll});console.log(id,chosen);
}
await writeFile(new URL('label-placements.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
