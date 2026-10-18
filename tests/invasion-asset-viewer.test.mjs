import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import * as THREE from '../dist/vendor/three/three.module.min.js';
import { assetCatalog, assetById, createAssetDisplay, loadAssetDisplay } from '../dist/invasion/environments/asset-viewer.mjs';

test('Public asset catalog uses known bundled models and retains creator/license links',()=>{
  assert.equal(new Set(assetCatalog.map(a=>a.id)).size,assetCatalog.length);
  assert.equal(assetCatalog.length,18);
  assert.equal(assetById('../../private-file'),null);
  for(const entry of assetCatalog){
    assert.ok(entry.creator&&entry.license&&entry.category);
    assert.match(entry.source,/^https:\/\//);
    if(entry.url)assert.ok(existsSync(new URL(`../dist/invasion/environments/${entry.url}`,import.meta.url)),entry.id);
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
