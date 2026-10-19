// Offline geometry check, not a browser/WebGL or material acceptance test.
import { readFileSync, writeFileSync } from 'node:fs';
import * as THREE from '../../dist/vendor/three/three.module.min.js';
import { buildWorld } from '../../dist/invasion/environments/worlds.mjs';
import { assetCatalog, createAssetDisplay } from '../../dist/invasion/environments/asset-viewer.mjs';
import { collectDamageParts, damageAnchors, createCityDamageVariant, disposeCityDamageVariant } from '../../dist/invasion/environments/city-damage.mjs';
import { createCityAftermath } from '../../dist/invasion/environments/aftermath.mjs';

const vendor=new URL('../../dist/vendor/three/',import.meta.url),base=new URL('../../dist/invasion/environments/',import.meta.url);
const dataModule=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
const utils=dataModule(readFileSync(new URL('addons/utils/BufferGeometryUtils.js',vendor),'utf8').replace("'three'",JSON.stringify(new URL('three.module.min.js',vendor).href)));
const loaderCode=readFileSync(new URL('addons/loaders/GLTFLoader.js',vendor),'utf8')
  .replace("'three'",JSON.stringify(new URL('three.module.min.js',vendor).href)).replace("'../utils/BufferGeometryUtils.js'",JSON.stringify(utils));
const { GLTFLoader }=await import(dataModule(loaderCode));
globalThis.ProgressEvent=class {constructor(type,values){this.type=type;Object.assign(this,values);}};
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const loader=new GLTFLoader();

async function geometryOnly(relative){
  const file=new URL(relative,base),bytes=readFileSync(file);let doc,bin;
  if(relative.endsWith('.glb')){
    doc=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
    let offset=20+bytes.readUInt32LE(12);
    while(offset<bytes.length){const length=bytes.readUInt32LE(offset);if(bytes.readUInt32LE(offset+4)===0x004e4942)bin=bytes.subarray(offset+8,offset+8+length);offset+=8+length;}
  }else doc=JSON.parse(bytes.toString('utf8'));
  // Preserve all vertex/index/transform data. Only omit images/materials for Node.
  delete doc.images;delete doc.textures;delete doc.materials;
  for(const mesh of doc.meshes||[])for(const primitive of mesh.primitives)delete primitive.material;
  for(const buffer of doc.buffers||[]){const data=buffer.uri?readFileSync(new URL(buffer.uri,file)):bin;buffer.uri='data:application/octet-stream;base64,'+data.toString('base64');}
  return (await loader.parseAsync(JSON.stringify(doc),'')).scene;
}

const result={kind:'offline geometry only; no WebGL, image/material, visual or phone verification',cities:[],assets:[]};
function inspect(root,id,stages){
  const source=collectDamageParts(root),rows=[];
  for(const stage of stages){
    const variant=createCityDamageVariant(source.parts,stage,{type:id}),fx=createCityAftermath(variant.userData.effectSources,stage);
    for(const s of variant.userData.effectSources)if(!s.position.every(Number.isFinite))throw new Error('Nonfinite source '+id);
    rows.push({stage,anchors:variant.userData.damage.anchors,fractures:variant.userData.effectSources.length,sites:fx.stats.sites,instances:fx.stats.instances});
    fx.dispose();disposeCityDamageVariant(variant);
  }
  return rows;
}

for(const type of ['alien','metropolis','citadel','cyberpunk','drone']){
  let root;
  if(['cyberpunk','drone'].includes(type)){
    root=await geometryOnly(`assets/source-scenes/${type}.glb`);root.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),scale=2000/Math.max(size.x,size.z);
    const normalized=new THREE.Group();normalized.add(root);normalized.scale.setScalar(scale);normalized.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);root=normalized;
  }else{
    const assets={};
    if(type==='metropolis')for(const name of ['Building_Large_2','Building_Medium_2_001','Building_Small_1','Prop_ACUnit','Prop_Planter_Single']){
      const model=await geometryOnly(`assets/downtown/${name}.gltf`),box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3());model.position.set(-center.x,-box.min.y,-center.z);assets[name]=model;
    }
    if(type==='citadel')assets['wall-wood-window-shutters']=await geometryOnly('assets/fantasy/wall-wood-window-shutters.glb');
    root=buildWorld(type,assets).group;
  }
  const stages=inspect(root,type,['damaged','heavy','ruins']);
  if(stages.some(s=>!s.sites))throw new Error('No fracture effects for '+type);
  result.cities.push({type,stages});console.log(type,JSON.stringify(stages));
}
for(const entry of assetCatalog.filter(a=>a.url)){
  const world=createAssetDisplay(await geometryOnly(entry.url),entry),root=world.group.getObjectByName('Inspection asset');
  const supported=damageAnchors(collectDamageParts(root).parts).length>0;
  result.assets.push({id:entry.id,supported,stages:supported?inspect(root,entry.category.startsWith('Fantasy')?'citadel':'metropolis',['heavy','ruins']):[]});
}
writeFileSync(new URL('geometry-probe.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log('Saved geometry-probe.json');
