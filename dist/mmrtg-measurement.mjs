import * as THREE from "./vendor/three/three.module.min.js";
import { poseMmrtg } from "./aft-bulkhead.mjs?v=dev";

// Part 21: the MMRTG fin-root temperature. [PUB] NASA/APL's 2023 thermal-controller talk (TFAWS,
// slides 7 and 9) names it as the second controller input (battery temperature is the first) and
// says it is sensitive to the fans' flow; NASA's MMRTG fact sheet rates the fin root at 157 C. No
// public source shows Dragonfly's fin-root sensor: its package, maker, count, exact point or wiring.
// So, like part 20, this is an annotation, not hardware: a target lying flat on the generator's
// housing beside the root of its top fin, posed with the generator. [EST] Its position and size.
// The housing and fin numbers below are those of the modeled MMRTG in vehicle-research.mjs, not
// published MMRTG drawings; tests/mmrtg-measurement.test.mjs flags them if that model changes.
export const mmrtgMeasurementAsset = Object.freeze({
  revision: "mmrtg-measurement-annotation-2026-10-20",
  radiusM: 0.024, strokeM: 0.0015,
  housingRadiusM: 0.2, finThicknessM: 0.02, finCount: 8,
  // Generator frame (poseMmrtg): +z along its axis, aft and up; the top fin is at 90 degrees.
  angleDeg: 78,     // 12 degrees to starboard of the top fin
  axialM: 0.05,     // a little aft of the housing's middle
  liftM: 0.002,     // just off the housing surface
});

export function buildMmrtgMeasurement({ parent, mesh }) {
  const A = mmrtgMeasurementAsset;
  const frame = poseMmrtg(new THREE.Group());
  frame.name = "mmrtg-measurement-frame";
  frame.updateMatrix();
  parent.add(frame);
  const angle = THREE.MathUtils.degToRad(A.angleDeg), radial = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
  const local = radial.clone().multiplyScalar(A.housingRadiusM + A.liftM).setZ(A.axialM);
  Object.assign(parent.userData, {
    assetRevision: A.revision, annotation: true, hardwareReconstructed: false,
    dimensionConfidence: "EST-annotation", measurementZone: "mmrtg",
    labelAnchor: local.clone().applyMatrix4(frame.matrix),
  });
  // The target's plane is tangent to the housing (its normal points out from the axis).
  const target = new THREE.Group(); target.name = "mmrtg-fin-root-annotation";
  target.position.copy(local);
  target.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), radial);
  target.userData.annotation = true;
  frame.add(target);
  const ink = new THREE.MeshBasicMaterial({ color: 0x9fe870 });
  const ring = mesh(new THREE.TorusGeometry(A.radiusM, A.strokeM, 6, 40), ink, [0, 0, 0], target);
  ring.name = "mmrtg-measurement-target";
  for (const axis of [0, 1]) {
    const mark = mesh(new THREE.BoxGeometry(0.018, 0.0015, 0.0015), ink, [0, 0, 0], target);
    mark.rotation.z = axis * Math.PI / 2; mark.name = "mmrtg-measurement-crosshair";
  }
  return { frame, target, ring };
}
