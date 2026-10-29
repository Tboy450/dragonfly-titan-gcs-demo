import * as THREE from "./vendor/three/three.module.min.js?v=dev";
import {navigationMebInterface,buildNavigationMebInterface} from "./navigation-meb-interface.mjs?v=dev";
import {frontierBayInterface,buildFrontierBayInterface} from './frontier-bay-interface.mjs?v=dev';
import {addCableSupport} from './cable-installation.mjs?v=dev';

// Main wiring harness on the equipment-bay floor (owner, October 20: "a lot of connecting
// equipment is left"). NASA/APL's September 2, 2026 photo of the flight fuselage being wired
// (research/nose-bulkhead-2026-10-19/nasa-apl-harness-integration.jpg; NASA/Johns Hopkins
// APL/Ed Whitman) shows silver-sheathed bundles, roughly 1-3 cm across, laid in a network on the
// bay floor and up the walls, laced at tie points and clamped to the structure, branching to each
// unit's connectors. Drawn here: one trunk down the floor's centerline and branches that pick up
// the cable stubs the unit passes already left (power units, IEM, battery) or end at a unit's
// connector face (radio, rotor drive electronics, navigation units, lower cameras' wall
// pass-throughs). Routes, sizes and clamp spacing are [EST]; the photo does not give a wiring
// diagram, and no pin, signal or power assignment is implied. The attic's harness is not drawn.
const floorY = -0.284;
const onFloor = (r) => floorY + r + 0.004;   // on low standoffs
const T = onFloor(0.012);
const B = -0.27;   // branches' floor height: 4-5 mm above the floor and the units' mounting flanges
export const mainHarnessAsset = Object.freeze({
  revision: "main-harness-2026-10-28-radio-interface",
  trunk: Object.freeze({ radiusM: 0.012, points: Object.freeze([[0, T, -1.0], [0, T, -0.75], [0, T, -0.4], [0, T, -0.1], [0, T, 0.12], [-0.02, T, 0.27]].map(Object.freeze)) }),
  // [name, radius, points]: each branch starts on the trunk and ends at its unit.
  branches: Object.freeze([
    ["iem", 0.009, [[0, T, -0.36], [-0.045, B, -0.355], [-0.088, B, -0.341]]],
    ["power-unit-2", 0.009, [[0, T, -0.30], [0.06, B, -0.29], [0.122, B, -0.278]]],
    ["power-unit-1", 0.009, [[0, T, 0.03], [-0.06, B, 0.031], [-0.122, B, 0.032]]],
    ["battery", 0.007, [[-0.02, T, 0.27], [-0.1, B, 0.281], [-0.17, B, 0.281], [-0.213, -0.264, 0.29]]],
    ["radio", frontierBayInterface.cableRadiusM, frontierBayInterface.cableControls],
    ["rde-1", 0.007, [[0, T, -0.75], [-0.08, B, -0.735], [-0.16, -0.25, -0.70]]],
    ["rde-2", 0.007, [[0, T, -0.75], [0.08, B, -0.735], [0.16, -0.25, -0.70]]],
    ["navigation-feb-imu", 0.008, [[0, T, -1.0], [0.1, B, -1.005], [0.2, -0.24, -1.014]]],
    ["navigation-meb", 0.008, navigationMebInterface.cableControls],
    // Lower cameras: explicit stub endpoints measured in the construction frame. These are
    // illustrative bundled joins, not flight splices, pinouts or assigned circuits.
    ["starboard-down-camera", 0.005, [[0.058, B, 0.12], [0.2, B, 0.118], [0.33, B, 0.125], [0.345, -0.24, 0.15], [0.362, -0.2065, 0.16]]],
    ["microscopic-camera", 0.005, [[-0.1, B, 0.281], [-0.3, B, 0.282], [-0.335, B, 0.29], [-0.341, B, 0.31], [-0.341, -0.255, 0.37], [-0.345, -0.21, 0.41], [-0.362, -0.180706, 0.414581]]],
    ["led-array", 0.004, [[-0.341, -0.255, 0.37], [-0.345, -0.258, 0.42], [-0.362, -0.258631, 0.432243]]],
    // [EST] bypass PSU1 aft, use the existing microscope wall relief, then follow the
    // outboard panel face to the Down Camera relief. No new wall hole or equipment move.
    ["port-down-camera", 0.003, [[-0.345, -0.21, 0.41], [-0.345, -0.205, 0.44], [-0.36, -0.2, 0.446], [-0.38, -0.19, 0.446], [-0.381, -0.13, 0.44], [-0.381, -0.12, 0.37], [-0.381, -0.12, 0.25], [-0.381, -0.15, 0.20], [-0.378, -0.19, 0.16], [-0.362, -0.2065, 0.16]]],
    // Second pass (October 21): bundles beside the trunk between neighbors, and runs up the walls
    // and back past the battery, as the photo's wall runs and denser floor suggest [EST].
    ["iem-to-power-unit-1", 0.008, [[-0.045, B, -0.355], [-0.05, B, -0.25], [-0.05, B, -0.05], [-0.06, B, 0.031]]],
    ["power-unit-2-to-radio", 0.008, [[0.06, B, -0.29], [0.055, B, -0.15], [0.055, B, -0.015], [0.058, B, 0.12], [0.07, B, 0.172]]],
    // Up the starboard wall just aft of power unit 2 to the TWTA power supply's cable end.
    ["twta-power-supply", 0.0065, [[0.055, B, -0.015], [0.2, B, -0.013], [0.325, B, -0.012], [0.343, -0.258, -0.011], [0.348, -0.2, -0.011], [0.348, -0.1, -0.010], [0.347, -0.058, -0.010]]],
    // Up the port wall forward of drive-electronics box 1 to the antenna gimbal drive's cable end.
    ["antenna-gimbal-drive", 0.006, [[-0.08, B, -0.735], [-0.2, B, -0.745], [-0.325, B, -0.73], [-0.335, -0.2, -0.70], [-0.335, -0.05, -0.66], [-0.32, 0.03, -0.64], [-0.304, 0.055, -0.632]]],
    // Back along the starboard wall in the gap beside the battery to the circulation fans.
    ["circulation-fans", 0.006, [[-0.02, T, 0.27], [0.1, B, 0.283], [0.3, B, 0.283], [0.333, B, 0.292], [0.344, B, 0.33], [0.344, B, 0.55], [0.343, B, 0.80], [0.25, -0.24, 0.93], [0.15, -0.2, 0.99]]],
  ].map(([name, r, pts]) => Object.freeze({ name, radiusM: r, points: Object.freeze(pts.map(Object.freeze)) }))),
  // Third pass: thinner strands laid with the trunk (the photo's bundles travel in groups), as
  // [dx, dy] offsets from the trunk's path, and two more cross-floor bundles [EST].
  strands: Object.freeze([
    Object.freeze({ name: "trunk-strand-port", radiusM: 0.005, offset: Object.freeze([-0.019, -0.006]) }),
    Object.freeze({ name: "trunk-strand-starboard", radiusM: 0.005, offset: Object.freeze([0.019, -0.006]) }),
    Object.freeze({ name: "trunk-strand-top", radiusM: 0.0045, offset: Object.freeze([0.004, 0.0155]) }),
  ]),
  crossBundles: Object.freeze([
    ["iem-to-radio", 0.0055, [[-0.05, B, -0.25], [-0.02, B, -0.2], [0.03, B, -0.15], [0.055, B, -0.15]]],
    ["power-unit-1-to-rde-1", 0.005, [[-0.05, B, -0.05], [-0.031, B, -0.2], [-0.031, B, -0.4], [-0.031, B, -0.69], [-0.045, B, -0.722], [-0.08, B, -0.735]]],
  ].map(([name, r, pts]) => Object.freeze({ name, radiusM: r, points: Object.freeze(pts.map(Object.freeze)) }))),
  clampSpacingM: 0.16,
});

export function buildMainHarness({ parent, mesh, navigationParent = parent, radioParent = parent }) {
  const A = mainHarnessAsset;
  const harness = new THREE.Group();
  harness.name = "main-harness";
  harness.userData.inspectionLayer = "harnesses";
  parent.add(harness);
  const mounts = new THREE.Group(); mounts.name = "main-harness-clamps"; mounts.userData.inspectionLayer = "mounts";
  parent.add(mounts);
  Object.assign(parent.userData, { assetRevision: A.revision, dimensionConfidence: "EST",
    inspectionTitle: "Bay harness (routing estimate)",
    source: "NASA/APL September2026 wiring photo; routes and supports estimated, circuit identities unverified" });
  // Silver overwrap as photographed; blue-green lacing at tie points; dark clamps.
  const sheath = new THREE.MeshStandardMaterial({ color: 0xc9ced2, roughness: 0.38, metalness: 0.72 });
  const lacing = new THREE.MeshStandardMaterial({ color: 0x5fb3a6, roughness: 0.6, metalness: 0.05 });
  const clamp = new THREE.MeshStandardMaterial({ color: 0x4d5257, roughness: 0.5, metalness: 0.5 });
  const run = (name, r, points) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, "centripetal", 0.5);
    const bundle = mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 16), r, 10, false), sheath, [0, 0, 0], harness);
    bundle.name = `main-harness-${name}`;
    bundle.userData.routeName = name;
    if (["port-down-camera", "starboard-down-camera", "microscopic-camera", "led-array"].includes(name)) {
      Object.assign(bundle.userData, { inspectionLabel: `${name.replaceAll("-", " ")} route (estimate)`,
        routeConfidence: "EST", flightTopologyConfirmed: false });
    }
    // Lacing ties about every 6 cm and floor clamps every clampSpacingM where the run is low.
    const length = curve.getLength();
    for (let s = 0.03; s < length - 0.02; s += 0.06) {
      const t = s / length, p = curve.getPointAt(t), d = curve.getTangentAt(t);
      const tie = mesh(new THREE.TorusGeometry(r + 0.0012, 0.0012, 4, 12), lacing, p.toArray(), harness);
      tie.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d); tie.name = "main-harness-tie";
      tie.userData.routeName = name;
    }
    for (let s = 0.08; s < length - 0.04; s += A.clampSpacingM) {
      if(name==='radio')continue; // Replaced below by one fitted local support.
      const t = s / length, p = curve.getPointAt(t), d = curve.getTangentAt(t);
      if (p.y > floorY + r + 0.02 || Math.abs(d.y) > 0.3) continue;
      const foot = mesh(new THREE.BoxGeometry(0.03, 0.003, 0.012), clamp, [p.x, floorY + 0.0015, p.z], mounts);
      foot.rotation.y = Math.atan2(d.x, d.z); foot.name = "main-harness-clamp";   // across the run
      foot.userData.routeName=name;
    }
    return bundle;
  };
  run("trunk", A.trunk.radiusM, A.trunk.points);
  for (const b of A.branches) run(b.name, b.radiusM, b.points);
  for (const s of A.strands) run(s.name, s.radiusM, A.trunk.points.map(([x, y, z]) => [x + s.offset[0], y + s.offset[1], z]));
  for (const b of A.crossBundles) run(b.name, b.radiusM, b.points);
  // [EST] small outboard stand-off anchored to the modeled wall between its reliefs.
  const foot = mesh(new THREE.BoxGeometry(0.002, 0.018, 0.016), clamp, [-0.3735, -0.12, 0.25], mounts);
  foot.name = "main-harness-port-camera-support-foot";
  const stand = mesh(new THREE.BoxGeometry(0.0065, 0.004, 0.012), clamp, [-0.37775, -0.125, 0.25], mounts);
  stand.name = "main-harness-port-camera-support-stand";
  Object.assign(foot.userData, { routeConfidence: "EST", routeName: "port-down-camera", matingStructure: "port-wall-outer-aluminum-face" });
  stand.userData.routeName = "port-down-camera";
  // One shared context root, not duplicate wires. Both inspector owners can reveal it.
  const navigationWire=new THREE.Group();navigationWire.name='navigation-meb-wire';
  navigationWire.userData.inspectionLayer='harnesses';navigationParent.add(navigationWire);
  for(const object of [...harness.children])if(object.userData.routeName==='navigation-meb')navigationWire.add(object);
  const navigationInterface=buildNavigationMebInterface({parent:navigationParent,mesh});
  const radioWire=new THREE.Group();radioWire.name='frontier-bay-wire';radioWire.userData.inspectionLayer='harnesses';radioParent.add(radioWire);
  const radioMounts=new THREE.Group();radioMounts.name='frontier-bay-supports';radioMounts.userData.inspectionLayer='mounts';radioParent.add(radioMounts);
  for(const o of [...harness.children])if(o.userData.routeName==='radio')radioWire.add(o);
  for(const o of [...mounts.children])if(o.userData.routeName==='radio')radioMounts.add(o);
  const radioInterface=buildFrontierBayInterface({parent:radioParent,mesh});
  const radioBundle=radioWire.getObjectByName('main-harness-radio'),p=radioBundle.geometry.parameters.path.getPointAt(.75);
  const radioSupport=addCableSupport({wire:radioBundle,fraction:.75,foot:[p.x,floorY,p.z],normal:[0,1,0],mounts:radioMounts,id:'radio-bay'});
  return { harness, mounts, navigationWire, navigationInterface, radioWire, radioMounts, radioInterface, radioSupport };
}
