import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildSampleCarousel, carouselAsset } from "../dist/sample-carousel.mjs";

function fixture() {
  const parent = new THREE.Group();
  const mesh = (geometry, material, position, target) => {
    const part = new THREE.Mesh(geometry, material);
    part.position.fromArray(position);
    target.add(part);
    return part;
  };
  return { parent, ...buildSampleCarousel({ parent, mesh }) };
}

test("Carousel replacement is enclosed, photo-referenced and explicit about estimated dimensions", () => {
  const { parent, assembly } = fixture();
  assert.equal(parent.userData.assetRevision, carouselAsset.revision);
  assert.equal(parent.userData.dimensionConfidence, "EST");
  assert.equal(assembly.getObjectByName("carousel-cover").geometry.parameters.radiusTop * 2, carouselAsset.diameterM);
  assert.equal(assembly.getObjectByName("carousel-sealed-lid").material.transparent, false);
  assert.equal(assembly.getObjectByName("sample-carousel-pan"), undefined);
  const fins = assembly.getObjectByName("carousel-cooling-fins");
  assert.ok(fins.isInstancedMesh && fins.count > 200, "dense fins share a single draw call");
  assert.ok(fins.count < 600, "bound the close-up geometry budget");
  assert.equal(fins.geometry.parameters.radialSegments, 4, "pyramid fin approximation");
  const drives = assembly.getObjectByName("carousel-warm-drives");
  assert.equal(drives.userData.thermalZone, "equipment-bay");
  const bounds = new THREE.Box3().setFromObject(drives);
  assert.ok(bounds.max.y <= carouselAsset.position[1], "drives remain below the baseplate");
});

test("Carousel fits the modeled bay and attic envelope without fitting around legacy components", () => {
  const { parent, assembly, inletWorld } = fixture();
  const bounds = new THREE.Box3().setFromObject(parent);
  assert.ok(bounds.min.x > -0.36 && bounds.max.x < 0.36, "inside side insulation");
  assert.ok(bounds.min.y > -0.33 && bounds.max.y < 0.46, "inside bay floor and local attic roof");
  assert.ok(bounds.min.z > -1.52 && bounds.max.z < -1.05, "forward attic footprint");
  assert.ok(inletWorld.distanceTo(new THREE.Vector3(...carouselAsset.inlet).add(assembly.position)) < 1e-9);
  // No collision assertions against the old Wonderwall/DraMS/line placeholders by owner request.
});

test("Carousel indexing keeps the cover, fins, inlet and drive mounts fixed", () => {
  const { assembly, carrier } = fixture();
  assembly.updateMatrixWorld(true);
  const names = ["carousel-cover", "carousel-cooling-fins", "carousel-sample-inlet", "carousel-warm-drives"];
  const before = names.map(name => assembly.getObjectByName(name).matrixWorld.clone());
  carrier.rotation.y = Math.PI / 2;
  assembly.updateMatrixWorld(true);
  names.forEach((name, i) => assert.deepEqual(assembly.getObjectByName(name).matrixWorld, before[i]));
  assert.equal(carrier.rotation.y, Math.PI / 2);
});
