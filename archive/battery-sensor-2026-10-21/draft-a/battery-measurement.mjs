import * as THREE from "./vendor/three/three.module.min.js";
import { batteryAsset } from "./battery.mjs?v=dev";

// [PUB] TE TESS-ANDO-DS0059: 44909 epoxy bead <=2.4 mm, two 32 AWG leads,
// >=76 mm long. DS0050: black body/gray end. NOT identified as Dragonfly hardware.
// [EST] Use the diameter limit as a modeling envelope; profile, bond pads and
// side-wall installation are illustrative. No pins, hidden electronics or sensor law.
const panelX = batteryAsset.center[0] - batteryAsset.enclosure.widthM / 2;
export const batteryMeasurementAsset = Object.freeze({
  revision: "battery-sensor-family-estimate-2026-10-21",
  referenceFamily: "TE / Measurement Specialties 44909 (not confirmed for Dragonfly)",
  maxDiameterM: .0024,
  bodyDepthM: .00132,
  leadLengthM: .0762,
  // [CALC] nominal bare 32 AWG diameter; plating thickness is not reconstructed.
  leadDiameterM: .000202,
  bondThicknessM: .0002,
  panelX,
  anchor: Object.freeze([panelX - .00086, -.07, batteryAsset.center[1] + .07]),
});

export function buildBatteryMeasurement({ parent, mesh }) {
  const A = batteryMeasurementAsset, [x, y, z] = A.anchor;
  Object.assign(parent.userData, {
    assetRevision: A.revision, annotation: false, hardwareReconstructed: false,
    hardwareApproximation: true, dimensionConfidence: "PUB-family-envelope+EST-installation",
    referenceFamily: A.referenceFamily, measurementZone: "battery",
    labelAnchor: new THREE.Vector3(...A.anchor),
  });
  const assembly = (name, label, minimumRadiusM) => {
    const group = new THREE.Group(); group.name = name;
    Object.assign(group.userData, { inspectionLabel: label, inspectionMinimumRadiusM: minimumRadiusM,
      labelAnchor: new THREE.Vector3(...A.anchor) });
    parent.add(group); return group;
  };
  const head = assembly("battery-sensor-head", "Thermistor bead (family estimate)", .003);
  const installation = assembly("battery-sensor-installation", "Bonding and paired leads (estimated)", .012);
  const category = (target, name, layer) => {
    const group = new THREE.Group(); group.name = name; group.userData.inspectionLayer = layer;
    target.add(group); return group;
  };
  const body = category(head, "battery-sensor-encapsulation", "equipment-casings");
  const mounts = category(installation, "battery-sensor-bond-pads", "mounts");
  const leads = category(installation, "battery-sensor-paired-leads", "harnesses");
  const epoxy = new THREE.MeshStandardMaterial({ color: 0x181b1c, roughness: .48 });
  const gray = new THREE.MeshStandardMaterial({ color: 0x8b9094, roughness: .58 });
  const adhesive = new THREE.MeshStandardMaterial({ color: 0xb9b5a5, roughness: .85 });
  const solder = new THREE.MeshStandardMaterial({ color: 0xbbc3c7, metalness: .65, roughness: .38 });
  const bead = mesh(new THREE.SphereGeometry(A.maxDiameterM / 2, 24, 16), epoxy, [x, y, z], body);
  bead.name = "battery-sensor-epoxy-bead"; bead.scale.set(.55, 1, .92);
  const tip = mesh(new THREE.SphereGeometry(.00102, 20, 12), gray, [x, y, z + .00062], body);
  tip.name = "battery-sensor-gray-end"; tip.scale.set(.55, .8, .48);
  const pad = (atZ, height, width, atY = y, thickness = A.bondThicknessM) => {
    const part = mesh(new THREE.BoxGeometry(thickness, height, width), adhesive,
      [A.panelX - thickness / 2, atY, atZ], mounts);
    part.name = "battery-sensor-estimated-bond-pad"; return part;
  };
  pad(z, .004, .0045);
  for (const sign of [-1, 1]) {
    const start = new THREE.Vector3(x, y + sign * .00046, z + .00094);
    const points = [start, new THREE.Vector3(x - .0001, y + sign * .001, z + .005),
      new THREE.Vector3(x - .00015, y + .002 + sign * .0011, z + .034),
      new THREE.Vector3(x - .00015, y + .003 + sign * .0012, z + .077)];
    // Preserve the datasheet lead length while routing only a local, unconnected pair.
    const initial = new THREE.CatmullRomCurve3(points);
    const scale = A.leadLengthM / initial.getLength();
    const curve = new THREE.CatmullRomCurve3(points.map(p => p.clone().sub(start).multiplyScalar(scale).add(start)));
    const lead = mesh(new THREE.TubeGeometry(curve, 36, A.leadDiameterM / 2, 8, false), solder, [0, 0, 0], leads);
    lead.name = `battery-sensor-lead-${sign < 0 ? 1 : 2}`;
    lead.userData.lengthM = curve.getLength();
    lead.userData.destinationUnmodeled = true;
  }
  // [EST] adhesive tacks encapsulate the fine leads, not floating cable clamps.
  pad(z + .029, .006, .002, y + .0018, .00112);
  pad(z + .058, .006, .002, y + .0028, .00112);
  return { head, installation, body, bead, tip, mounts, leads };
}
