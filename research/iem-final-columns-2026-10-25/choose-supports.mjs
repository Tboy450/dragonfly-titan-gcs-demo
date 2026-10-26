// Search fittings in the isolated candidate assembly before installing any app geometry.
import {writeFile} from 'node:fs/promises';
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {candidateFixture,approvedIds} from './candidate-fixture.mjs';
import {addCableSupport,addCableLacing} from '../../dist/cable-installation.mjs';
const{parent,assembly,mounts}=await candidateFixture(),inverse=assembly.matrixWorld.clone().invert();
const wires=parent.getObjectsByProperty('name','iem-harness-cable');
const samples=wires.map(w=>({id:w.userData.connectionId,points:w.geometry.parameters.path.getSpacedPoints(1500)}));
const remove=[];parent.traverse(o=>{if(approvedIds.includes(o.userData.wireId)||(o.name==='iem-harness-label'&&approvedIds.includes(o.userData.connectionId)))remove.push(o);});
for(const o of remove)o.removeFromParent();
const boxes=[];parent.updateMatrixWorld(true);
parent.traverse(o=>{if(!o.isMesh||o.geometry.type!=='BoxGeometry'||o.userData.installationExample)return;
 o.geometry.computeBoundingBox();boxes.push({box:o.geometry.boundingBox,inverse:inverse.clone().multiply(o.matrixWorld).invert()});
});
function fits(objects,id){
 for(const o of objects){o.updateMatrix();const inv=o.matrix.clone().invert();o.geometry.computeBoundingBox();
  if(o.geometry.type==='CylinderGeometry'){
   const direction=new T.Vector3(0,1,0).applyQuaternion(o.quaternion),h=o.geometry.parameters.height;
   for(let i=4;i<=80;i++){const p=o.position.clone().addScaledVector(direction,h*(i/80-.5));
    if(boxes.some(b=>b.box.distanceToPoint(p.clone().applyMatrix4(b.inverse))<.0011))return false;
   }
  }
  const pos=o.geometry.attributes.position,index=o.geometry.index,triangles=[];
  const vertex=n=>new T.Vector3().fromBufferAttribute(pos,index?index.getX(n):n).applyMatrix4(o.matrix);
  for(let n=0;n<(index?index.count:pos.count);n+=3)triangles.push(new T.Triangle(vertex(n),vertex(n+1),vertex(n+2)));
  const box=o.geometry.boundingBox.clone().applyMatrix4(o.matrix),nearest=new T.Vector3();
  if(box.min.y<-.0009)return false;
  for(const row of samples){if(row.id===id)continue;for(const p of row.points){if(box.distanceToPoint(p)>.005)continue;
   for(const tri of triangles){tri.closestPointToPoint(p,nearest);if(p.distanceTo(nearest)<.0047)return false;}
  }}
 }return true;
}
const results={};
for(const id of approvedIds){
 const wire=wires.find(w=>w.userData.connectionId===id),path=wire.geometry.parameters.path;
 const fractions=Array.from({length:83},(_,i)=>.05+i*.01).sort((a,b)=>Math.abs(a-.16)-Math.abs(b-.16));let chosen;
 for(const fraction of fractions){
  const p=path.getPointAt(fraction),holder=new T.Group();
  const foot=[p.x,p.y,-.114];
  const made=addCableSupport({wire,fraction,foot,normal:[0,0,-1],mounts:holder,id:'candidate'});
  wire.userData.installationSupports.pop();
  if(fits(holder.children,id)){chosen={supportFraction:+fraction.toFixed(2),foot};mounts.add(...holder.children.slice());break;}
 }
 if(!chosen)throw Error('No clear support '+id);
 const ties=[];
 for(const target of [.35,.60]){
  const choices=fractions.slice().sort((a,b)=>Math.abs(a-target)-Math.abs(b-target));let selected;
  for(const fraction of choices){if(ties.some(f=>Math.abs(f-fraction)<.08))continue;
   const holder=new T.Group(),ring=addCableLacing({wire,fraction,parent:holder,id:'candidate'});
   if(fits([ring],id)){selected=+fraction.toFixed(2);break;}
  }
  if(selected===undefined)throw Error('No clear lacing '+id);ties.push(selected);
 }
 results[id]={...chosen,lacingFractions:ties,labelFraction:.25,labelOffsetZ:-.005,labelRoll:0};console.log(id,results[id]);
}
await writeFile(new URL('fitting-placements.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
