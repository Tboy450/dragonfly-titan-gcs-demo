import * as THREE from "./vendor/three/three.module.min.js";

// Part 12: Integrated Electronics Module (IEM), Dragonfly's core avionics box (command and data
// handling, guidance and navigation, communications). The look follows NASA/APL's March 2026
// integration photos (engineering model and flight-line testing): a dark chassis with a black
// finned top, a front face of silver card panels carrying gold micro-D connectors, harnesses
// plugged into the face, bolted to the lander structure. No size is published: the box is
// scaled from the gloved hands in those photos [EST], about 26 cm wide, 22 cm tall and 24 cm
// deep. The card count, connector layout, fin count, harness runs and its place on the
// starboard bay floor with the connector face inboard are also [EST]. The red handles in the
// photos are ground handling gear and are not drawn.
export const iemAsset = Object.freeze({
  revision: "iem-2026-10-13",
  widthM: 0.26, heightM: 0.22, depthM: 0.24,
  cardCount: 9,
  // Base center on the bay floor; same footprint center as the old placeholder [EST].
  position: Object.freeze([0.2, -0.284, -0.12]),
  // The connector face (local -z) turns inboard toward the centerline harness run [EST].
  yaw: Math.PI / 2,
  bounds: Object.freeze({ min: [0.025, -0.285, -0.27], max: [0.34, -0.04, 0.06] }),
});

export function buildIem({ parent, mesh }) {
  const { widthM: W, heightM: H, depthM: D, cardCount, position, yaw } = iemAsset;
  const assembly = new THREE.Group();
  assembly.name = "iem-assembly";
  assembly.position.fromArray(position);
  assembly.rotation.y = yaw;
  parent.add(assembly);
  Object.assign(parent.userData, { assetRevision: iemAsset.revision, dimensionConfidence: "EST" });
  const group = (name, inspectionLayer) => {
    const g = new THREE.Group(); g.name = name; g.userData.inspectionLayer = inspectionLayer;
    assembly.add(g); return g;
  };
  const chassis = group("iem-chassis", "equipment-casings");
  const mounts = group("iem-mounts", "mounts");
  const connectors = group("iem-connectors", "interfaces");
  const harness = group("iem-harness", "harnesses");
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c3134, roughness: 0.55, metalness: 0.35 });
  const black = new THREE.MeshStandardMaterial({ color: 0x17191b, roughness: 0.6, metalness: 0.3 });
  const panel = new THREE.MeshStandardMaterial({ color: 0xbfc5c8, roughness: 0.35, metalness: 0.7 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.32, metalness: 0.85 });
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
  const face = -D / 2, finH = 0.014, bodyH = H - finH;

  // Chassis and the black finned top (fins run front to back, spread across the width).
  box([W, bodyH, D], [0, bodyH / 2, 0], dark, chassis, "iem-chassis-body");
  box([W, 0.004, D], [0, bodyH + 0.002, 0], black, chassis, "iem-fin-base");
  const fins = Math.floor(W / 0.009);
  for (let i = 0; i < fins; i += 1) {
    const x = -W / 2 + 0.0045 + i * (W - 0.009) / (fins - 1);
    box([0.0022, finH - 0.004, D - 0.006], [x, bodyH + 0.004 + (finH - 0.004) / 2, 0], black, chassis, "iem-top-fin");
  }

  // Card front panels across the connector face, each with captive screws and gold micro-Ds.
  // Connector rows per card [EST], left to right as seen from in front of the face (+x is left).
  const pitch = W / cardCount;
  const layout = [[0.15, 0.08], [0.16, 0.11, 0.06], [0.15, 0.08], [0.12], [0.16, 0.11, 0.06], [0.15, 0.08], [0.15, 0.08], [0.16, 0.11, 0.06], [0.12]];
  const plugs = [];
  for (let c = 0; c < cardCount; c += 1) {
    const x = W / 2 - pitch * (c + 0.5);
    box([pitch - 0.0016, bodyH - 0.008, 0.003], [x, bodyH / 2, face - 0.0015], panel, chassis, `iem-card-${c + 1}-front`);
    for (const y of [0.012, bodyH - 0.012]) {
      const screw = mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.003, 8), steel, [x, y, face - 0.0045], chassis);
      screw.rotation.x = Math.PI / 2; screw.name = "iem-captive-screw";
    }
    for (const y of layout[c]) {
      box([0.0085, 0.032, 0.005], [x, y, face - 0.0055], gold, connectors, `iem-card-${c + 1}-micro-d`);
      plugs.push([x, y]);
    }
  }
  box([W, bodyH, 0.004], [0, bodyH / 2, D / 2 + 0.002], dark, chassis, "iem-rear-cover");

  // Mounting: a bolted flange at the base of each side (the photos show the box fastened to a
  // structural panel; its exact interface is not published [EST]).
  for (const side of [-1, 1]) {
    box([0.016, 0.005, D], [side * (W / 2 + 0.008), 0.0025, 0], dark, mounts, "iem-mounting-flange");
    for (const z of [-D * 0.4, 0, D * 0.4]) {
      const bolt = mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.004, 6), steel, [side * (W / 2 + 0.008), 0.007, z], mounts);
      bolt.name = "iem-mount-bolt";
    }
  }

  // Harness: a backshell on each connector, its cable dropping to the floor in front of the face
  // and running along the base of the face to a trunk at one end (silver-wrapped, as
  // photographed) [EST routes].
  const z0 = face - 0.02;
  plugs.forEach(([x, y], i) => {
    box([0.011, 0.034, 0.012], [x, y, face - 0.014], wrap, harness, "iem-harness-backshell");
    const run = -W / 2 - 0.02 - (i % 4) * 0.006;
    tube([[x, y - 0.006, z0], [x, y - 0.02, z0 - 0.012], [x, 0.014, z0 - 0.02], [(x + run) / 2, 0.008, z0 - 0.024], [run, 0.008, z0 - 0.026 + (i % 3) * 0.004]],
      0.0035, wrap, harness, "iem-harness-cable");
  });
  // Bundle ties (Kapton-taped, like the photographed harness) where the cables join the trunk.
  for (const k of [0, 1, 2]) box([0.014, 0.012, 0.012], [-W / 2 - 0.028, 0.009, z0 - 0.024 + k * 0.006], kapton, harness, "iem-harness-tie");
  return { assembly, chassis, mounts, connectors, harness };
}
