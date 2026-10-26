import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {candidateBuilder,candidateFixture,baselineBuilder,approvedIds} from './candidate-fixture.mjs';
import {pairAudit,surfaceAudit} from './audit.mjs';
const labels=JSON.parse(await readFile(new URL('label-placements.json',import.meta.url),'utf8'));
const fits=JSON.parse(await readFile(new URL('fitting-placements.json',import.meta.url),'utf8'));
for(const row of labels){const{id,...rest}=row;Object.assign(fits[id],rest);}
await writeFile(new URL('fitting-placements.json',import.meta.url),JSON.stringify(fits,null,2)+'\n');
const{builder}=await candidateBuilder(),pairs=pairAudit(builder),surfaces=surfaceAudit(builder),{parent}=await candidateFixture();
const baselineSurfaces=surfaceAudit(await baselineBuilder());
const bounds=new T.Box3().setFromObject(parent),mesh=(g,m,p,owner)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);owner.add(o);return o;};
const neighbors=[],neighborHits=[];
const newWires=parent.getObjectsByProperty('name','iem-harness-cable').filter(w=>approvedIds.includes(w.userData.connectionId));
for(const[file,name]of[['wonderwall.mjs','buildWonderwall'],['sample-carousel.mjs','buildSampleCarousel'],['drams-assembly.mjs','buildDramsAssembly'],['frontier-radio.mjs','buildFrontierRadio'],['power-units.mjs','buildPowerUnits'],['battery.mjs','buildBattery']]){
 const root=new T.Group();(await import('../../dist/'+file))[name]({parent:root,mesh});root.updateMatrixWorld(true);
 neighbors.push({name,boxOverlap:bounds.intersectsBox(new T.Box3().setFromObject(root))});
 const boxes=[];root.traverse(o=>{if(o.isMesh)boxes.push({name:o.name,box:new T.Box3().setFromObject(o)});});
 for(const wire of newWires)for(const p of wire.geometry.parameters.path.getSpacedPoints(1400)){
  p.applyMatrix4(wire.matrixWorld);for(const other of boxes)if(other.box.distanceToPoint(p)<wire.geometry.parameters.radius)neighborHits.push({wire:wire.userData.connectionId,unit:name,mesh:other.name});
 }
}
const inheritedContacts=surfaces.filter(r=>r.minSurfaceGapM!==null&&r.minSurfaceGapM<=-.0001&&JSON.stringify(r)===JSON.stringify(baselineSurfaces.find(b=>b.id===r.id)));
const rows=JSON.parse(await readFile(new URL('candidate-routes.json',import.meta.url),'utf8'));
const sourceHash=createHash('sha256').update(JSON.stringify({rows,fits})).digest('hex');
const report={sourceHash,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},neighbors,neighborHits:[...new Map(neighborHits.map(r=>[JSON.stringify(r),r])).values()],pairs,surfaces,inheritedContacts,
 badPairs:pairs.filter(r=>r.freeSpanMinSurfaceGapM<=([r.a,r.b].some(id=>['iem-local-lead-5','iem-local-lead-7'].includes(id))?.003:.002)),
 badSurfaces:surfaces.filter(r=>r.minSurfaceGapM!==null&&r.minSurfaceGapM<=-.0001&&!inheritedContacts.includes(r)),
 limits:'Isolated candidate, not installed. All26 endpoints/radii retained; other18 routes/fittings fixed. Sampled screens, not continuous collision or flight qualification.'};
await writeFile(new URL('candidate-checks.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,pairs:report.pairs.length,surfaces:report.surfaces.length},null,2));
