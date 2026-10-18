import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three/three.module.min.js';
import { damagePart, damageAnchors, collectDamageParts, clipAtFracture, fractureHeight,
  createCityDamageVariant, disposeCityDamageVariant } from '../dist/invasion/environments/city-damage.mjs';

const material = new THREE.MeshStandardMaterial({ color: 0xb0c2ce });
function part(w, h, d, x, y, z, id) {
  return damagePart(new THREE.BoxGeometry(w, h, d), material, new THREE.Matrix4().makeTranslation(x, y, z), id);
}

test('Damage joins roof decorations to their supporting tower, retaining separate neighboring buildings', () => {
  const parts = [part(50, 160, 50, 0, 80, 0, 'tower'), part(8, 30, 8, 18, 170, 0, 'crown'),
    part(35, 70, 35, 70, 35, 0, 'neighbor')];
  const anchors = damageAnchors(parts);
  assert.equal(anchors.length, 2);
  assert.equal(anchors.find(a => a.id === 'tower').top, 185);
  assert.ok(anchors.some(a => a.id === 'neighbor'));
});

test('Fracture clips facade triangles at the break, preserving finite UVs and lower foundations', () => {
  const geometry = new THREE.BoxGeometry(24, 100, 24).translate(0, 50, 0).toNonIndexed();
  const anchor = { x: 0, z: 0, bottom: 0, top: 100, height: 100, width: 24, depth: 24 };
  const {geometry: clipped, cuts} = clipAtFracture(geometry, anchor, 'heavy');
  clipped.computeBoundingBox();
  assert.ok(cuts.length > 4, 'broken walls have intersections for exposed caps');
  assert.equal(clipped.boundingBox.min.y, 0);
  assert.ok(clipped.boundingBox.max.y < 65);
  assert.ok(clipped.boundingBox.max.y > 20);
  for (const a of Object.values(clipped.attributes)) assert.ok([...a.array].every(Number.isFinite));
  assert.equal(clipped.attributes.position.count, clipped.attributes.normal.count);
  assert.equal(clipped.attributes.position.count, clipped.attributes.uv.count);
  for (const x of [-10, 0, 10]) for (const z of [-10, 0, 10]) {
    assert.ok(fractureHeight(anchor, x, z, 'damaged') > fractureHeight(anchor, x, z, 'heavy'));
    assert.ok(fractureHeight(anchor, x, z, 'heavy') > fractureHeight(anchor, x, z, 'ruins'));
  }
});

test('All five city styles get repeatable progressive geometry and leave intact sources untouched', () => {
  const parts = Array.from({length: 12}, (_, i) => part(30, 120, 30, i * 55 - 300, 60, i % 3 * 80, `building-${i}`));
  const originals = parts.map(p => [...p.geometry.attributes.position.array]);
  for (const type of ['alien', 'metropolis', 'citadel', 'cyberpunk', 'drone']) {
    let previous = 0;
    for (const stage of ['damaged', 'heavy', 'ruins']) {
      const group = createCityDamageVariant(parts, stage, {type}), stats = group.userData.damage;
      assert.ok(stats.affected >= previous); previous = stats.affected;
      assert.ok(stats.cutComponents > 0);
      assert.ok(group.getObjectByName('Exposed broken floors and wall sections'));
      assert.ok(group.getObjectByName('Settled facade and roof rubble'));
      group.traverse(o => { if (o.isMesh) for (const a of Object.values(o.geometry.attributes)) assert.ok([...a.array].every(Number.isFinite)); });
      disposeCityDamageVariant(group);
    }
  }
  parts.forEach((p, i) => assert.deepEqual([...p.geometry.attributes.position.array], originals[i]));
  assert.equal(material.color.getHex(), 0xb0c2ce);
  const a = createCityDamageVariant(parts, 'heavy'), b = createCityDamageVariant(parts, 'heavy');
  assert.deepEqual(a.userData.damage, b.userData.damage);
  assert.deepEqual(a.children[0].geometry.attributes.position.array, b.children[0].geometry.attributes.position.array);
  disposeCityDamageVariant(a);disposeCityDamageVariant(b);
});

test('Protected terrain and water are excluded; instanced architecture keeps its world placement', () => {
  const root = new THREE.Group(), ground = new THREE.Mesh(new THREE.BoxGeometry(1000, 5, 1000), material);
  ground.userData.damageProtected = true;root.add(ground);
  const towers = new THREE.InstancedMesh(new THREE.BoxGeometry(10, 40, 10), material, 2);
  towers.setMatrixAt(0, new THREE.Matrix4().makeTranslation(10, 20, 0));
  towers.setMatrixAt(1, new THREE.Matrix4().makeTranslation(80, 20, 0));root.add(towers);
  root.position.set(15, 0, -3);
  const {parts, originals} = collectDamageParts(root);
  assert.equal(parts.length, 2);assert.equal(originals.size, 1);
  assert.ok(originals.has(towers));assert.ok(!originals.has(ground));
  assert.equal(parts[0].box.min.x, 20);assert.equal(parts[1].box.min.x, 90);
});
