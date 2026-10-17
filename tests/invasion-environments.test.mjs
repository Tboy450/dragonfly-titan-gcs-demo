import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as THREE from '../dist/vendor/three/three.module.min.js';
import { convexHull, lowFootprint, createCityFoundation, structuralContacts } from '../dist/invasion/environments/foundation.mjs';
import { bakeSourceGeometry } from '../dist/invasion/environments/source-geometry.mjs';
import { createCityFoundation as createPreferredCoast } from '../dist/invasion/environments/history/contour-v2.mjs';

test('City footing follows low architecture rather than an upper overhang', () => {
  const root = new THREE.Group();
  const footing = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 30));footing.position.set(6, 4, -3);root.add(footing);
  const overhang = new THREE.Mesh(new THREE.BoxGeometry(90, 4, 70));overhang.position.set(6, 70, -3);root.add(overhang);
  assert.deepEqual(lowFootprint(root, 80), [[-4, -18], [16, -18], [16, 12], [-4, 12]]);
  assert.deepEqual(convexHull([[0, 0], [1, 0], [2, 0], [0, 0], [NaN, 2]]), [[0, 0], [2, 0]]);
  assert.throws(() => createCityFoundation([[0, 0], [1, 0]]), /non-degenerate/);
});

test('Coastal ground seats different structural contacts without one uniform raised deck', () => {
  const anchors = [{x:-200,z:0,bottom:30,width:50,depth:50},{x:200,z:0,bottom:0,width:50,depth:50}];
  const ground = createPreferredCoast([[-400,-300],[400,-300],[400,300],[-400,300]], anchors);
  assert.equal(ground.userData.heightAt(-200,0),27);
  assert.equal(ground.userData.heightAt(200,0),-3);
  assert.equal(ground.userData.architectureFootings,2);
  assert.ok(Number.isFinite(ground.userData.heightAt(0,0)));
});

test('Preserved high-envelope experiment covers broad bases but is not the preferred gallery terrain', () => {
  const parts = [
    {name:'wide block',x:0,z:0,bottom:350,top:850,width:760,depth:710,height:500},
    {name:'stacked roof',x:0,z:0,bottom:840,top:1040,width:80,depth:80,height:200},
    {name:'NurbsPath.001',x:1200,z:0,bottom:700,top:1000,width:200,depth:200,height:300},
    {name:'bridge',x:0,z:1000,bottom:300,top:310,width:700,depth:30,height:10},
    ...Array.from({length:110},(_,i)=>({name:`tower ${i}`,x:1500+i*70,z:500,bottom:200+i,top:600+i,width:30,depth:30,height:400}))
  ];
  const contacts=structuralContacts(parts);
  assert.equal(contacts.length,111);
  assert.ok(!contacts.some(a=>['stacked roof','bridge','NurbsPath.001'].includes(a.name)));
  const foundation=createCityFoundation([[-900,-900],[900,-900],[900,900],[-900,900]],contacts.slice(0,1));
  for(const dx of [-380,0,380])for(const dz of [-355,0,355])assert.equal(foundation.userData.heightAt(dx,dz),347);
  const pad=foundation.getObjectByName('Individual foundation pads'),matrix=new THREE.Matrix4();pad.getMatrixAt(0,matrix);
  assert.equal(new THREE.Vector3().setFromMatrixPosition(matrix).y,348.5);
});

test('Preserved high-envelope experiment has contact coverage (burial still requires visual review)', () => {
  const parts=JSON.parse(readFileSync(new URL('../research/fantasy-city-2026-10-16/environment-tests/cyberpunk-bounds.json',import.meta.url),'utf8'));
  const contacts=structuralContacts(parts);
  assert.ok(contacts.length>40);
  assert.ok(contacts.some(a=>a.width>700));
  assert.ok(contacts.some(a=>a.bottom>600));
  const foundation=createCityFoundation([[-1000,-1000],[1000,-1000],[1000,1000],[-1000,1000]],contacts);
  // Sample the actual triangulated surface, not just the continuous height function.
  const p=foundation.getObjectByName('Ground fitted to architecture').geometry.attributes.position;
  function renderedHeight(x,z){
    const u=(x+3600)/15,v=(z+3600)/15,c=Math.floor(u),r=Math.floor(v),fx=u-c,fz=v-r;
    // PlaneGeometry's z runs from -3600 to +3600 after the X rotation.
    const a=p.getY(r*481+c),b=p.getY(r*481+c+1),d=p.getY((r+1)*481+c),e=p.getY((r+1)*481+c+1);
    return fx+fz<=1?a+(b-a)*fx+(d-a)*fz:e+(d-e)*(1-fx)+(b-e)*(1-fz);
  }
  for(const a of contacts)for(const dx of [-.5,0,.5])for(const dz of [-.5,0,.5]) {
    const x=a.x+a.width*dx,z=a.z+a.depth*dz;
    assert.ok(renderedHeight(x,z)>=a.bottom-3.01,`ground gap under ${a.name} at ${x},${z}`);
  }
});

test('The coastal terrain has dry footings, lower water, supported access and finite geometry', () => {
  const foundation = createPreferredCoast([[-800, -650], [850, -650], [850, 700], [-800, 700]]);
  assert.equal(foundation.userData.accessRamps, 4);
  assert.ok(foundation.userData.seaElevation < foundation.userData.deckElevation);
  assert.ok(foundation.userData.groundElevation < foundation.userData.seaElevation);
  assert.ok(foundation.getObjectByName('Coastal ocean'));
  const texture = foundation.getObjectByName('Coastal ocean').material.normalMap;
  foundation.userData.animate(20);assert.notEqual(texture.offset.x, 0);
  foundation.updateMatrixWorld(true);
  foundation.traverse(object => {
    if (!object.isMesh) return;
    assert.ok([...object.geometry.attributes.position.array].every(Number.isFinite), object.name);
    object.geometry.computeBoundingBox();assert.ok(!object.geometry.boundingBox.isEmpty());
    if (object.isInstancedMesh) assert.ok([...object.instanceMatrix.array].every(Number.isFinite));
  });
});

test('Source batching preserves front faces after negative scale without changing the original', () => {
  const original = new THREE.BoxGeometry(2, 3, 4), positions = original.attributes.position.array.slice();
  const object = new THREE.Mesh(original);object.scale.set(-2, 1, 1);object.position.set(20, 7, -5);object.updateMatrixWorld(true);
  const baked = bakeSourceGeometry(object), p = baked.attributes.position, n = baked.attributes.normal;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), normal = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);b.fromBufferAttribute(p, i + 1);c.fromBufferAttribute(p, i + 2);
    const cross = b.sub(a).cross(c.sub(a));normal.fromBufferAttribute(n, i);
    assert.ok(cross.dot(normal) > 0, 'front-face winding agrees with transformed normal');
  }
  assert.deepEqual(original.attributes.position.array, positions);
  assert.equal(original.index.count, 36);
});

test('Blender evaluated support keeps tops fixed and projects bottoms onto the preserved coast', () => {
  const report=JSON.parse(readFileSync(new URL('../research/fantasy-city-2026-10-16/foundation-authoring/fit-report.json',import.meta.url),'utf8'));
  assert.equal(report.method,'Geometry Nodes Raycast');
  assert.equal(report.originals_modified,false);assert.equal(report.coast_modified,false);
  assert.ok(report.support_cells>1000);
  const v=report.verification;
  assert.ok(v.checked_top_vertices>10000);assert.equal(v.checked_bottom_vertices,v.checked_top_vertices);
  assert.equal(v.bottom_ray_misses,0);assert.ok(v.max_bottom_embed_error<.001);
  assert.equal(v.max_top_shift,0);
  assert.ok(v.max_top_distance_to_actual_underside<=v.underside_distance_tolerance);
  assert.ok(v.vertices_already_below_baseline_coast>0,'pre-existing burial is reported, not hidden');
});

function documents(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...documents(name));
    else if (entry.name.endsWith('.gltf')) result.push([name, JSON.parse(readFileSync(name, 'utf8'))]);
    else if (entry.name.endsWith('.glb')) {
      const data = readFileSync(name);
      assert.equal(data.toString('ascii', 0, 4), 'glTF', name);
      assert.equal(data.readUInt32LE(4), 2, name);assert.equal(data.readUInt32LE(8), data.length, name);
      const length = data.readUInt32LE(12);assert.equal(data.toString('ascii', 16, 20), 'JSON', name);
      result.push([name, JSON.parse(data.toString('utf8', 20, 20 + length))]);
    }
  }
  return result;
}

test('Published test assets retain all case-correct external buffers and textures', () => {
  const root = fileURLToPath(new URL('../dist/invasion/environments/assets/', import.meta.url));
  const docs = ['downtown', 'fantasy', 'source-scenes'].flatMap(folder => documents(path.join(root, folder)));
  assert.ok(docs.length >= 16, 'selected modular pieces and two complete scenes are present');
  for (const [file, document] of docs) for (const resource of [...(document.buffers || []), ...(document.images || [])]) {
    if (!resource.uri || resource.uri.startsWith('data:')) continue;
    assert.ok(!/^https?:/.test(resource.uri), 'runtime sources are local');
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(resource.uri));
    assert.ok(resolved.startsWith(root), 'resource stays inside asset tree');
    assert.ok(readdirSync(path.dirname(resolved)).includes(path.basename(resolved)), `case-correct dependency: ${resolved}`);
  }
  for (const name of ['cyberpunk.glb', 'drone.glb']) {
    const document = docs.find(([file]) => path.basename(file) === name)?.[1];
    assert.ok(document.meshes.length > 100, `${name} contains a complete source scene`);
  }
});
