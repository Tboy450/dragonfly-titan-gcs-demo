import * as THREE from "./vendor/three/three.module.min.js";
import { batteryAsset } from "./battery.mjs?v=dev";

// [PUB] TFAWS2023 slides7/9 identify a battery-temperature control input, not a
// flight sensor package. [EST] This target is an annotation beside the modeled
// battery, not hardware, an exact sensing point, or a statement of sensor count.
export const batteryMeasurementAsset = Object.freeze({
  revision: "battery-measurement-annotation-2026-10-20",
  radiusM: .024, strokeM: .0015,
  anchor: Object.freeze([
    batteryAsset.center[0] + batteryAsset.enclosure.widthM / 2 + .016,
    -.07, batteryAsset.center[1] + .07,
  ]),
});

export function buildBatteryMeasurement({ parent, mesh }) {
  const A = batteryMeasurementAsset;
  Object.assign(parent.userData, {
    assetRevision: A.revision, annotation: true, hardwareReconstructed: false,
    dimensionConfidence: "EST-annotation", measurementZone: "battery",
    labelAnchor: new THREE.Vector3(...A.anchor),
  });
  const target = new THREE.Group(); target.name = "battery-temperature-annotation";
  target.position.fromArray(A.anchor); target.rotation.y = Math.PI / 2; parent.add(target);
  target.userData.annotation = true;
  const ink = new THREE.MeshBasicMaterial({ color: 0x9fe870 });
  const ring = mesh(new THREE.TorusGeometry(A.radiusM, A.strokeM, 6, 40), ink, [0, 0, 0], target);
  ring.name = "battery-measurement-target";
  for (const axis of [0, 1]) {
    const mark = mesh(new THREE.BoxGeometry(.018, .0015, .0015), ink, [0, 0, 0], target);
    mark.rotation.z = axis * Math.PI / 2; mark.name = "battery-measurement-crosshair";
  }
  return { target, ring };
}
