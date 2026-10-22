import * as THREE from "./vendor/three/three.module.min.js";
import { poseMmrtg } from "./aft-bulkhead.mjs?v=dev";
import { mmrtgAsset } from "./mmrtg.mjs?v=dev";

// [PUB] NASA/APL TFAWS2023 names fin-root feedback; NASA rates the MMRTG fin root
// at157 C. Omega F2020 Class B is a real 2x2x0.8 mm RTD family rated -70..500 C,
// with two10 mm x0.2 mm leads. No source identifies it as Dragonfly hardware.
// [EST] finish proportions, bond, exact sensing point and routing. Current generator
// envelope/pose is provisional; recheck this installation during the MMRTG-body pass.
export const mmrtgMeasurementAsset = Object.freeze({
  revision: "fin-root-rtd-family-fit-2026-10-22",
  referenceFamily: "Omega F2020 Class B (Dragonfly adoption unconfirmed)",
  elementM: Object.freeze([.002, .002, .0008]),
  leadLengthM: .010, leadDiameterM: .0002,
  familyRangeC: Object.freeze([-70, 500]),
  bondThicknessM: .0002, bondWidthM: .0045,
  housingRadiusM: mmrtgAsset.housingRadiusM, finThicknessM: mmrtgAsset.finThicknessM, finCount: mmrtgAsset.finCount,
  // Generator frame (poseMmrtg): +z along its axis, aft and up; the top fin is at 90 degrees.
  angleDeg: 78,     // 12 degrees to starboard of the top fin
  axialM: 0.05,     // a little aft of the housing's middle
});

export function buildMmrtgMeasurement({ parent, mesh }) {
  const A = mmrtgMeasurementAsset;
  const frame = poseMmrtg(new THREE.Group());
  frame.name = "mmrtg-measurement-frame";
  frame.updateMatrix();
  parent.add(frame);
  const angle = THREE.MathUtils.degToRad(A.angleDeg), radial = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
  const local = radial.clone().multiplyScalar(A.housingRadiusM).setZ(A.axialM);
  const mounting = new THREE.Group(); mounting.name = "fin-root-installation-frame";
  mounting.position.copy(local);
  const tangent = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0), axial = new THREE.Vector3(0, 0, 1);
  mounting.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tangent, axial, radial));
  frame.add(mounting);
  const anchor = new THREE.Vector3(0, 0, A.bondThicknessM + A.elementM[2] / 2)
    .applyQuaternion(mounting.quaternion).add(local).applyMatrix4(frame.matrix);
  Object.assign(parent.userData, {
    assetRevision: A.revision, annotation: false, hardwareReconstructed: false, hardwareApproximation: true,
    referenceFamily: A.referenceFamily, dimensionConfidence: "PUB-family+EST-installation", measurementZone: "mmrtg",
    labelAnchor: anchor,
  });
  const assembly = (name, label, radius) => {
    const g = new THREE.Group(); g.name = name;
    Object.assign(g.userData, { inspectionLabel: label, inspectionMinimumRadiusM: radius, labelAnchor: anchor.clone() });
    mounting.add(g); return g;
  };
  const head = assembly("fin-root-rtd-element", "Platinum RTD element (family estimate)", .003);
  const installation = assembly("fin-root-rtd-installation", "Bond and paired leads (estimated)", .009);
  const layer = (target, name, category) => {
    const g = new THREE.Group(); g.name = name; g.userData.inspectionLayer = category; target.add(g); return g;
  };
  const body = layer(head, "fin-root-rtd-package", "equipment-casings");
  const mounts = layer(installation, "fin-root-rtd-bond", "mounts");
  const leads = layer(installation, "fin-root-rtd-leads", "harnesses");
  const ceramic = new THREE.MeshStandardMaterial({ color: 0xe4e2d6, roughness: .68 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x34498d, roughness: .28, metalness: .06 });
  const bond = new THREE.MeshStandardMaterial({ color: 0xb9b7aa, roughness: .85 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xbfc3c7, metalness: .7, roughness: .35 });
  const base = mesh(new THREE.BoxGeometry(.002, .002, .00062), ceramic, [0, 0, A.bondThicknessM + .00031], body);
  base.name = "fin-root-rtd-ceramic";
  const coating = mesh(new THREE.BoxGeometry(.00192, .00192, .00018), glass, [0, 0, A.bondThicknessM + .00071], body);
  coating.name = "fin-root-rtd-glass-coating";
  // [EST] curved underside contacts the current cylindrical housing; flat top
  // supports the ceramic. The bond material and its qualification are unknown.
  const shape = new THREE.Shape(), half = A.bondWidthM / 2;
  shape.moveTo(-half, A.bondThicknessM); shape.lineTo(half, A.bondThicknessM);
  for (let i = 0; i <= 16; i++) {
    const x = half - i / 16 * A.bondWidthM;
    shape.lineTo(x, Math.sqrt(A.housingRadiusM ** 2 - x ** 2) - A.housingRadiusM);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: A.bondWidthM, bevelEnabled: false, curveSegments: 1 });
  geometry.rotateX(Math.PI / 2); geometry.translate(0, half, 0);
  const pad = mesh(geometry, bond, [0, 0, 0], mounts); pad.name = "fin-root-rtd-estimated-bond";
  for (const sign of [-1, 1]) {
    const start = new THREE.Vector3(sign * .0004, .001, .0006);
    const points = [start, new THREE.Vector3(sign * .00048, .003, .0005), new THREE.Vector3(sign * .00055, .011, .0004)];
    const initial = new THREE.CatmullRomCurve3(points), scale = A.leadLengthM / initial.getLength();
    const curve = new THREE.CatmullRomCurve3(points.map(p => p.clone().sub(start).multiplyScalar(scale).add(start)));
    const lead = mesh(new THREE.TubeGeometry(curve, 24, A.leadDiameterM / 2, 8, false), metal, [0, 0, 0], leads);
    lead.name = `fin-root-rtd-lead-${sign < 0 ? 1 : 2}`;
    lead.userData.lengthM = curve.getLength(); lead.userData.destinationUnmodeled = true;
  }
  return { frame, mounting, head, installation, body, base, coating, mounts, pad, leads };
}
