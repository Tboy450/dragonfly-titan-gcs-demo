import * as THREE from "./vendor/three/three.module.min.js";

// Part 11: the two Power Switching Units (PSUs), which control the flow of power to Dragonfly's
// instruments and systems. NASA reports "the IEM and both PSUs" passed their first power checks
// in March 2026, so there are two units [PUB]. The look follows NASA/APL's testing photo (Ed
// Whitman): a silver connector face built from horizontal slices with rows of tall connectors
// (capped in pink for testing; drawn mated to the harness here), a black top and black side
// covers. No size is published: each unit is scaled from the gloved hands in the photo [EST],
// about 24 cm wide, 22 cm tall and 20 cm deep. Slice heights, connector rows, cable routes and
// their places on the port bay floor with the faces inboard are [EST]. The red handles in the
// photo are ground handling gear and are not drawn.
export const powerUnitsAsset = Object.freeze({
  revision: "power-units-2026-10-13",
  unitCount: 2,
  widthM: 0.24, heightM: 0.22, depthM: 0.20,
  // Base centers on the bay floor, at the old placeholders' centers [EST].
  positions: Object.freeze([Object.freeze([-0.22, -0.284, -0.2]), Object.freeze([-0.22, -0.284, 0.12])]),
  // The connector faces (local -z) turn inboard, toward +x [EST].
  yaw: -Math.PI / 2,
  bounds: Object.freeze({ min: [-0.33, -0.285, -0.345], max: [-0.06, -0.06, 0.265] }),
});

export function buildPowerUnits({ parent, mesh }) {
  const { widthM: W, heightM: H, depthM: D, positions, yaw } = powerUnitsAsset;
  const assembly = new THREE.Group();
  assembly.name = "power-units-assembly";
  parent.add(assembly);
  Object.assign(parent.userData, { assetRevision: powerUnitsAsset.revision, dimensionConfidence: "EST" });
  const dark = new THREE.MeshStandardMaterial({ color: 0x23272a, roughness: 0.55, metalness: 0.35 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xc3c8cb, roughness: 0.33, metalness: 0.72 });
  const shell = new THREE.MeshStandardMaterial({ color: 0x9fa6aa, roughness: 0.35, metalness: 0.8 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xa9b0b4, roughness: 0.38, metalness: 0.75 });
  const wrap = new THREE.MeshStandardMaterial({ color: 0xc8ccce, roughness: 0.3, metalness: 0.8 });
  const kapton = new THREE.MeshStandardMaterial({ color: 0xc8892e, roughness: 0.5, metalness: 0.2 });
  const box = (size, at, material, target, name) => {
    const part = mesh(new THREE.BoxGeometry(...size), material, at, target);
    part.name = name; return part;
  };
  const tube = (points, radius, material, target, name) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, "centripetal");
    const part = mesh(new THREE.TubeGeometry(curve, 20, radius, 6, false), material, [0, 0, 0], target);
    part.name = name; return part;
  };
  const face = -D / 2, topH = 0.012, bodyH = H - topH;
  // Slices from the bottom up, and the connector columns on each (x across the face, +x is the
  // viewer's left) [EST from the photo: a full upper row, a short middle row, a lower row].
  const slices = [
    { h: 0.044, plugs: [] },
    { h: 0.056, plugs: [0.08, 0.055, 0.03, -0.01, -0.035, -0.07] },
    { h: 0.048, plugs: [0.085, 0.06, 0.0] },
    { h: bodyH - 0.148, plugs: [0.085, 0.06, 0.035, 0.01, -0.02, -0.05] },
  ];
  const units = positions.map((position, u) => {
    const unit = new THREE.Group();
    unit.name = `psu-${u + 1}`;
    unit.position.fromArray(position);
    unit.rotation.y = yaw;
    assembly.add(unit);
    const layer = (name, inspectionLayer) => {
      const g = new THREE.Group(); g.name = `psu-${u + 1}-${name}`; g.userData.inspectionLayer = inspectionLayer;
      unit.add(g); return g;
    };
    const casing = layer("casing", "equipment-casings");
    const mounts = layer("mounts", "mounts");
    const connectors = layer("connectors", "interfaces");
    const harness = layer("harness", "harnesses");

    box([W, bodyH, D], [0, bodyH / 2, 0], dark, casing, "psu-chassis");
    box([W + 0.002, topH, D + 0.002], [0, bodyH + topH / 2, 0], dark, casing, "psu-top-cover");
    // Silver slice faces with dark seams between them.
    let y = 0;
    const plugs = [];
    slices.forEach((slice, s) => {
      box([W - 0.004, slice.h - 0.0016, 0.003], [0, y + slice.h / 2, face - 0.0015], silver, casing, `psu-slice-${s + 1}-face`);
      for (const x of slice.plugs) {
        box([0.012, Math.min(0.034, slice.h - 0.012), 0.006], [x, y + slice.h / 2, face - 0.006], shell, connectors, "psu-connector");
        plugs.push([x, y + slice.h / 2]);
      }
      y += slice.h;
    });
    for (const x of [W / 2 - 0.008, -W / 2 + 0.008]) for (const yy of [0.012, bodyH - 0.012]) {
      const screw = mesh(new THREE.CylinderGeometry(0.0024, 0.0024, 0.003, 8), steel, [x, yy, face - 0.0045], casing);
      screw.rotation.x = Math.PI / 2; screw.name = "psu-face-screw";
    }
    // Base flanges with bolts on both sides [EST].
    for (const side of [-1, 1]) {
      box([0.016, 0.005, D], [side * (W / 2 + 0.008), 0.0025, 0], dark, mounts, "psu-mounting-flange");
      for (const z of [-D * 0.38, D * 0.38]) mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.004, 6), steel, [side * (W / 2 + 0.008), 0.007, z], mounts).name = "psu-mount-bolt";
    }
    // Mated backshells; cables drop in front of the face and gather toward the gap between the
    // two units, where they join a shared trunk [EST].
    const toward = u === 0 ? 1 : -1;
    const z0 = face - 0.022;
    plugs.forEach(([x, py], i) => {
      box([0.014, 0.036, 0.014], [x, py, face - 0.016], wrap, harness, "psu-harness-backshell");
      const run = toward * (W / 2 + 0.02 + (i % 4) * 0.005);
      tube([[x, py - 0.008, z0], [x, py - 0.024, z0 - 0.012], [x, 0.014, z0 - 0.02], [(x + run) / 2, 0.009, z0 - 0.024], [run, 0.009, z0 - 0.026 + (i % 3) * 0.004]],
        0.0038, wrap, harness, "psu-harness-cable");
    });
    for (const k of [0, 1]) box([0.012, 0.014, 0.012], [toward * (W / 2 + 0.028), 0.01, z0 - 0.022 + k * 0.008], kapton, harness, "psu-harness-tie");
    return { unit, casing, mounts, connectors, harness };
  });
  return { assembly, units };
}
