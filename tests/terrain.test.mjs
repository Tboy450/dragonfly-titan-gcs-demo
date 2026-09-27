import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { sampleTerrainSurface, terrainHeight } from "../dist/titan-terrain.mjs";

test("Triangle sampling matches the rendered mesh on slopes and after recentering", () => {
  const segments = 24;
  const geometry = new THREE.PlaneGeometry(1, 1, segments, segments);
  const positions = geometry.attributes.position;
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  const ray = new THREE.Raycaster();
  for (const [anchorX, anchorZ] of [[0, 0], [400, 800], [-1200, 2000]]) {
    for (let row = 0; row <= segments; row++) {
      const v = row / segments * 2 - 1;
      for (let column = 0; column <= segments; column++) {
        const u = column / segments * 2 - 1;
        const x = anchorX + u * 70 + Math.sign(u) * u ** 2 * 4800;
        const z = anchorZ + v * 70 + Math.sign(v) * v ** 2 * 4800;
        positions.setXYZ(row * (segments + 1) + column, x, terrainHeight(x, z), z);
      }
    }
    geometry.computeBoundingSphere();
    mesh.updateMatrixWorld();
    for (let i = 0; i < 80; i++) {
      const x = anchorX + Math.sin(i * 17.2) * 4600 + 0.123;
      const z = anchorZ + Math.cos(i * 8.3) * 4600 + 0.247;
      const sample = sampleTerrainSurface(x, z, positions.array, segments);
      ray.set(new THREE.Vector3(x, 1000, z), new THREE.Vector3(0, -1, 0));
      const hit = ray.intersectObject(mesh)[0];
      assert.ok(hit);
      assert.ok(Math.abs(sample.height - hit.point.y) < 1e-7);
      assert.ok(new THREE.Vector3(...sample.normal).dot(hit.face.normal) > 0.99999);
    }
  }
});

test("Both triangle halves and diagonal preserve exact vertex heights", () => {
  const positions = new Float32Array([0, 1, 0, 2, 3, 0, 0, 5, 4, 2, 12, 4]);
  for (const [x, z, expected] of [[0, 0, 1], [2, 0, 3], [0, 4, 5], [2, 4, 12], [1, 2, 4]]) {
    assert.equal(sampleTerrainSurface(x, z, positions, 1).height, expected);
  }
});
