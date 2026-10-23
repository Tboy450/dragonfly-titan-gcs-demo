import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from '../dist/vendor/three/three.module.min.js';
import { assetCatalog, assetById, createAssetDisplay, loadAssetDisplay } from '../dist/invasion/environments/asset-viewer.mjs';

test('Public asset catalog uses known bundled models and retains creator/license links',()=>{
  assert.equal(new Set(assetCatalog.map(a=>a.id)).size,assetCatalog.length);
  assert.equal(assetCatalog.length,34);
  assert.equal(assetById('../../private-file'),null);
  for(const entry of assetCatalog){
    assert.ok(entry.creator&&entry.license&&entry.category);
    assert.match(entry.source,/^https:\/\//);
    if(entry.url)assert.ok(existsSync(new URL(`../dist/invasion/environments/${entry.url}`,import.meta.url)),entry.id);
    else if(entry.piece)assert.match(entry.piece,/^(dragonfly|figure:[1-5]|interceptor|structure:(watchtower|flak|radar|sam|jammer|laser|shield)|houses|city:(metropolis|forge|town))$/);
    else assert.ok(['scout','link','striker','breacher'].includes(entry.drone));
  }
});

test('Asset inspection frames off-center geometry on a stand without claiming real dimensions',()=>{
  const root=new THREE.Group();const mesh=new THREE.Mesh(new THREE.BoxGeometry(2,6,4),new THREE.MeshStandardMaterial());
  mesh.position.set(80,13,-20);root.add(mesh);
  const world=createAssetDisplay(root,assetById('building-large'));
  world.group.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(world.group.getObjectByName('Inspection asset'));
  assert.ok(Math.abs(bounds.min.y)<1e-5);assert.ok(Math.abs(bounds.max.y-100)<1e-5);
  assert.ok(Math.abs(bounds.min.x+bounds.max.x)<1e-5);
  assert.ok(Math.abs(bounds.min.z+bounds.max.z)<1e-5);
  assert.deepEqual(world.group.userData.asset.sourceSize,[2,6,4]);
  assert.equal(world.asset,true);
  assert.throws(()=>createAssetDisplay(new THREE.Group(),assetCatalog[0]),/no finite visible geometry/);
});

test('All four playable drone models can be inspected without changing battle state',async()=>{
  for(const entry of assetCatalog.filter(a=>a.drone)){
    const world=await loadAssetDisplay(entry,null);
    assert.equal(world.group.userData.asset.id,entry.id);
    assert.ok(world.group.getObjectByName('Inspection asset'));
    assert.ok(world.target.toArray().every(Number.isFinite));
    world.group.traverse(object=>{
      if(object.isMesh)assert.ok([...object.geometry.attributes.position.array].every(Number.isFinite));
    });
  }
});

test('Historical Scout inspection template exactly reproduces its preserved pre-polish geometry',async()=>{
  const {originalScoutModel}=await import('../dist/invasion/environments/history/scout-original.mjs');
  const baseline=JSON.parse(readFileSync(new URL('../archive/scout-polish-2026-10-19/baseline-geometry.json',import.meta.url),'utf8'));
  const model=originalScoutModel();
  try{
    assert.equal(model.scale,baseline.scale);assert.deepEqual(model.rotors,baseline.rotors);
    for(const part of ['body','glow'])for(const [attribute,field] of [['position','positions'],['normal','normals'],['color','colors']])
      assert.deepEqual([...model[part].getAttribute(attribute).array],baseline[part][field]);
  }finally{model.body.dispose();model.glow.dispose();}
});

test('Original and polished Scout lab routes keep the same footprint/stand scale, with a safe unknown-version fallback',async()=>{
  const entry=assetById('drone-scout');
  const views=await Promise.all(['original','polished','unknown'].map(scoutVersion=>loadAssetDisplay(entry,null,{scoutVersion})));
  try{
    const [original,polished,fallback]=views;
    const asset=view=>view.group.userData.asset;
    const body=view=>view.group.getObjectByName('Inspection asset').children[0].children[0].geometry;
    assert.equal(asset(original).version,'original');assert.equal(asset(polished).version,'polished');assert.equal(asset(fallback).version,'polished');
    assert.equal(asset(original).displayScale,asset(polished).displayScale);
    assert.equal(asset(original).sourceSize[0],asset(polished).sourceSize[0]);
    assert.equal(asset(original).sourceSize[2],asset(polished).sourceSize[2]);
    assert.equal(body(original).getAttribute('position').count,432*3);
    assert.equal(body(polished).getAttribute('position').count,584*3);
    assert.deepEqual(body(fallback).getAttribute('position').array,body(polished).getAttribute('position').array);
  }finally{
    for(const view of views){
      const geometries=new Set(),materials=new Set();
      view.group.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});
      for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
    }
  }
});

test('Swarmfall defenders, defenses and settlements inspect from the game\'s own models, intact',async()=>{
  const pieces=assetCatalog.filter(a=>a.piece&&!['dragonfly'].includes(a.piece)&&!a.piece.startsWith('city:'));
  assert.equal(pieces.length,12);
  for(const entry of pieces){
    const world=await loadAssetDisplay(entry,null);
    assert.equal(world.group.userData.asset.id,entry.id);
    assert.equal(entry.intact,true);
    let meshes=0;
    world.group.getObjectByName('Inspection asset').traverse(object=>{
      if(!object.isMesh)return;meshes+=1;
      assert.ok([...object.geometry.attributes.position.array].every(Number.isFinite),entry.id);
    });
    assert.ok(meshes>=1,entry.id);
  }
  const houses=await loadAssetDisplay(assetById('settlements'),null);
  assert.equal(houses.group.getObjectByName('Inspection asset').children[0].children.length,9,'a hut and four houses with roofs');
});

test('Asset search matches every word across name, category, description and creator',async()=>{
  const {searchAssets}=await import('../dist/invasion/environments/asset-viewer.mjs');
  assert.equal(searchAssets('').length,assetCatalog.length);
  assert.deepEqual(searchAssets('flak').map(a=>a.id),['defense-flak']);
  assert.deepEqual(searchAssets('  FORGE  city ').map(a=>a.id),['city-forge']);
  assert.ok(searchAssets('kenney roof').every(a=>a.creator==='Kenney'&&/roof/i.test(a.name+a.description)));
  assert.equal(searchAssets('swarmfall defenses').filter(a=>a.category==='Swarmfall defenses').length,7);
  assert.deepEqual(searchAssets('no such thing anywhere'),[]);
});
