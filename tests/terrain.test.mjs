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

test("Rain-darkened ground is landable and the methane puddle sits below its banks", async () => {
  const { pools, dampGround, overLiquid, surveySite } = await import("../dist/mission-systems.mjs");
  const { poolLevels } = await import("../dist/titan-terrain.mjs");
  const pool = pools[0];
  // The puddle is small; most of the darkened interdune is ordinary landable ground.
  assert.ok(pool.rx < dampGround.rx / 4 && pool.rz < dampGround.rz / 4);
  assert.equal(overLiquid(dampGround.x - dampGround.rx * 0.5, dampGround.z), false);
  assert.equal(overLiquid(pool.x, pool.z), true);
  assert.ok(terrainHeight(pool.x, pool.z) < poolLevels[0], "the puddle floor is below its surface");
  for (let i = 0; i < 36; i++) {
    const a = i / 36 * Math.PI * 2;
    const x = pool.x + Math.cos(a) * pool.rx * 1.6, z = pool.z - Math.sin(a) * pool.rz * 1.6;
    assert.ok(terrainHeight(x, z) >= poolLevels[0], "banks stay above the liquid surface");
  }
  assert.equal(overLiquid(surveySite.x, surveySite.z), false);
});

test("Arrival haze thins with altitude but never reveals the terrain edge", async () => {
  const { arrivalHazeDensity, hazeDensity, terrainReachM } = await import("../dist/titan-terrain.mjs");
  const contrast = (density, distance) => Math.exp(-((density * distance) ** 2));
  assert.equal(arrivalHazeDensity(0), hazeDensity);
  for (const altitude of [0, 200, 800, 1500, 2500, 4200]) {
    const density = arrivalHazeDensity(altitude);
    assert.ok(contrast(density, Math.hypot(altitude, terrainReachM - 250)) < 0.05, `edge shows at ${altitude} m`);
  }
  // From 2 km up the ground straight below is clearly visible.
  assert.ok(contrast(arrivalHazeDensity(2000), 2000) > 0.4);
});
