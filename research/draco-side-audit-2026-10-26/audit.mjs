import * as THREE from '../../dist/vendor/three/three.module.min.js';
import {buildDrill} from '../../dist/drills.mjs';
import {buildSampleLines,buildBlowers} from '../../dist/draco-plumbing.mjs';
import {buildSideCameras} from '../../dist/side-cameras.mjs';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const mesh=(geometry,material,position,parent)=>{
  const part=new THREE.Mesh(geometry,material);part.position.fromArray(position);parent.add(part);return part;
};
export function fixture(drillBuilder=buildDrill,linesBuilder=buildSampleLines,blowerBuilder=buildBlowers){
  const root=new THREE.Group(),drills=[-1,1].map(side=>drillBuilder({parent:root,mesh,side}));
  const lines=linesBuilder({parent:root,mesh}),blowers=blowerBuilder({parent:root,mesh});
  root.updateMatrixWorld(true);return {root,drills,lines,blowers};
}
export function counts(group){
  const rows={};group.traverse(object=>{if(object.isMesh)rows[object.name]=(rows[object.name]??0)+1;});
  return Object.fromEntries(Object.entries(rows).sort(([a],[b])=>a.localeCompare(b)));
}
export function fingerprint(root){
  root.updateMatrixWorld(true);const rows=[];
  root.traverse(object=>{
    if(!object.isMesh)return;
    const geometry=object.geometry,hash=createHash('sha256');
    for(const [name,attribute] of Object.entries(geometry.attributes).sort(([a],[b])=>a.localeCompare(b))){
      hash.update(name);hash.update(Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength));
    }
    if(geometry.index)hash.update(Buffer.from(geometry.index.array.buffer));
    const materials=(Array.isArray(object.material)?object.material:[object.material]).map(m=>({
      type:m.type,color:m.color?.getHex(),roughness:m.roughness,metalness:m.metalness,
      opacity:m.opacity,transparent:m.transparent,side:m.side,
    }));
    rows.push({name:object.name,matrix:object.matrixWorld.toArray(),geometry:hash.digest('hex'),materials});
  });return rows;
}
export async function baseline(){
  async function load(file){
    let source=await readFile(new URL(`../../archive/draco-side-audit-2026-10-26/${file}`,import.meta.url),'utf8');
    source=source.replaceAll('./vendor/three/three.module.min.js?v=dev',new URL('../../dist/vendor/three/three.module.min.js?v=dev',import.meta.url).href)
      .replaceAll('./drills.mjs?v=dev',new URL('../../dist/drills.mjs?v=dev',import.meta.url).href);
    return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  }
  const drill=await load('drills.mjs'),plumbing=await load('draco-plumbing.mjs');
  return fixture(drill.buildDrill,plumbing.buildSampleLines,plumbing.buildBlowers);
}
export function report(){
  const f=fixture(),cameraRoot=new THREE.Group(),cameras=buildSideCameras({parent:cameraRoot,mesh});
  const namedBounds=group=>{group.updateMatrixWorld(true);const rows=[];group.traverse(o=>{
    if(o.isMesh){const b=new THREE.Box3().setFromObject(o);rows.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});}
  });return rows;};
  const drillCounts=f.drills.map(d=>counts(d.drill));
  const tubes=[];f.lines.lines.traverse(o=>{if(o.isMesh&&o.geometry.parameters.path)tubes.push({
    name:o.name,diameterM:2*o.geometry.parameters.radius,
    start:o.geometry.parameters.path.getPoint(0).toArray(),end:o.geometry.parameters.path.getPoint(1).toArray(),
  });});
  const result={scope:'Model inventory, not a flight bill of materials or network qualification',
    port:drillCounts[0],starboard:drillCounts[1],pairedInventoryEqual:JSON.stringify(drillCounts[0])===JSON.stringify(drillCounts[1]),
    drillMeshCount:drillCounts.map(c=>Object.values(c).reduce((a,b)=>a+b,0)),
    bounds:f.drills.map(d=>namedBounds(d.drill)),sampleTransport:tubes,
    clamps:{port:0,starboard:0},blowers:counts(f.blowers.group),
    cameras:cameras.cameras.map(c=>({name:c.group.name,position:c.group.position.toArray()})),
    open:['Exact flight blower positions and fittings','Complete moving drill/Z-feed and blower/diverter wiring',
      'Identified DrACO avionics and endpoints','Separate elevator path geometry','Flight guards and hidden brackets'],
  };
  f.lines.clamps.traverse(o=>{if(o.name==='draco-tube-clamp')result.clamps[o.position.x<0?'port':'starboard']++;});
  return result;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const output=report();await writeFile(new URL('inventory.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({paired:output.pairedInventoryEqual,drillMeshes:output.drillMeshCount,clamps:output.clamps,
    tubes:output.sampleTransport.map(r=>r.name),cameras:output.cameras.map(r=>r.name)},null,2));
}
