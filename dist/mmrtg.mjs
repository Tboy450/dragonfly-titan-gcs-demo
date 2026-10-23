import * as THREE from "./vendor/three/three.module.min.js?v=dev";
import { poseMmrtg } from "./aft-bulkhead.mjs?v=dev";

// [PUB] NASA fact sheet / Cataldo-Bennett fig12:64 cm fin-tip diameter,66 cm
// overall length, eight fins. [EST] detailed profile/finish from real PIA23306
// pre-fueling hardware photo; that Mars unit does not establish Dragonfly finish.
export const mmrtgAsset = Object.freeze({
  revision: "mmrtg-body-2026-10-22",
  finCount: 8, finTipRadiusM: .32,
  axialMinM: -.34, axialMaxM: .32,
  housingRadiusM: .145, housingLengthM: .48,
  finThicknessM: .0025, finLengthM: .48,
  rootRadiusM: .145, rootRailThicknessM: .01,
});

export function buildMmrtg({ parent, mesh }) {
  const A = mmrtgAsset, frame = poseMmrtg(new THREE.Group());
  frame.name = "mmrtg-assembly"; frame.updateMatrix(); parent.add(frame);
  Object.assign(parent.userData, {
    assetRevision: A.revision, dimensionConfidence: "PUB-envelope+EST-detail",
    inspectionTitle: "MMRTG generator body", thermalZone: "mmrtg",
    source: "NASA PIA23306 real MMRTG photograph; NASA64 x66 cm envelope; detailed profile, finish and Dragonfly installation estimated",
  });
  const assembly = (name, title) => {
    const g = new THREE.Group(); g.name = name; g.userData.inspectionLabel = title;
    g.userData.labelAnchor = new THREE.Vector3(0, 0, 0).applyMatrix4(frame.matrix);
    frame.add(g); return g;
  };
  const layer = (target, name, category) => {
    const g = new THREE.Group(); g.name = name; g.userData.inspectionLayer = category;
    target.add(g); return g;
  };
  const housingAssembly = assembly("mmrtg-housing-focus", "Housing (interior unmodeled)");
  const finAssembly = assembly("mmrtg-fins-focus", "Eight radiator fins and roots");
  const endAssembly = assembly("mmrtg-ends-focus", "End covers and mounting interface");
  const housing = layer(housingAssembly, "mmrtg-housing", "equipment-casings");
  const fins = layer(finAssembly, "mmrtg-radiator-fins", "equipment-casings");
  const roots = layer(finAssembly, "mmrtg-root-attachments", "mounts");
  const covers = layer(endAssembly, "mmrtg-end-covers", "equipment-covers");
  const mount = layer(endAssembly, "mmrtg-mounting-collar", "mounts");
  const interfaces = layer(endAssembly, "mmrtg-interfaces", "interfaces");
  const white = new THREE.MeshStandardMaterial({ color: 0xe6e5d9, roughness: .7, metalness: .06 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xbec3c7, roughness: .28, metalness: .72 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x343a3f, roughness: .52, metalness: .5 });
  const cylinder = (name, radius, height, z, material, group, topRadius = radius, open = false) => {
    const m = mesh(new THREE.CylinderGeometry(topRadius, radius, height, 64, 1, open), material, [0, 0, z], group);
    m.rotation.x = Math.PI / 2; m.name = name; return m;
  };
  cylinder("mmrtg-housing-shell", A.housingRadiusM, A.housingLengthM, 0, white, housing, A.housingRadiusM, true);

  // [EST] shallow outer-edge expansion slots and clipped corners follow the
  // photographed plate appearance. No hidden thermoelectric/fuel geometry.
  const outline = new THREE.Shape();
  outline.moveTo(A.rootRadiusM, -.24); outline.lineTo(.30, -.24); outline.lineTo(.32, -.22);
  for (const z of [-.12, 0, .12]) {
    outline.lineTo(.32, z - .0004); outline.lineTo(.24, z - .0004);
    outline.lineTo(.24, z + .0004); outline.lineTo(.32, z + .0004);
  }
  outline.lineTo(.32, .22); outline.lineTo(.30, .24); outline.lineTo(A.rootRadiusM, .24); outline.closePath();
  const plate = new THREE.ExtrudeGeometry(outline, { depth: A.finThicknessM, bevelEnabled: false, curveSegments: 1 });
  plate.rotateX(Math.PI / 2); plate.translate(0, A.finThicknessM / 2, 0);
  const finGroups = [];
  for (let i = 0; i < A.finCount; i++) {
    const angle = i * Math.PI * 2 / A.finCount;
    const g = new THREE.Group(); g.name = `mmrtg-fin-${i + 1}`; g.rotation.z = angle; fins.add(g); finGroups.push(g);
    const panel = mesh(plate, white, [0, 0, 0], g); panel.name = `mmrtg-fin-${i + 1}-plate`;
    const root = new THREE.Group(); root.name = `mmrtg-fin-${i + 1}-root`; root.rotation.z = angle; roots.add(root);
    const rail = mesh(new THREE.BoxGeometry(.009, A.rootRailThicknessM, .46), white, [.147, 0, 0], root);
    rail.name = "mmrtg-fin-root-rail";
    for (const z of [-.18, -.06, .06, .18]) for (const side of [-1, 1]) {
      const tab = mesh(new THREE.BoxGeometry(.024, .003, .012), white, [.157, side * .004, z], root);
      tab.name = "mmrtg-fin-root-tab";
      const fastener = mesh(new THREE.CylinderGeometry(.0022, .0022, .0015, 6), dark, [.163, side * .00625, z], root);
      fastener.name = "mmrtg-fin-root-fastener";
    }
  }
  // [EST] end-cover proportions and fasteners from photo; fixed pose and
  // published overall envelope retained. Shipping frame/lifting fixture omitted.
  cylinder("mmrtg-mounting-end-cover", .146, .047, -.2635, metal, covers);
  cylinder("mmrtg-mounting-flange", .162, .014, -.285, metal, mount);
  cylinder("mmrtg-mounting-neck", .11, .051, -.3145, metal, mount);
  cylinder("mmrtg-fueling-end-cover", .145, .025, .2525, metal, covers);
  cylinder("mmrtg-fueling-shoulder", .145, .020, .275, metal, covers, .10);
  cylinder("mmrtg-fueling-rim", .10, .016, .293, metal, covers);
  cylinder("mmrtg-end-boss", .045, .019, .3105, metal, covers);
  for (const z of [-.242, .242]) {
    cylinder("mmrtg-housing-end-ring", .153, .007, z, metal, covers);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const bolt = mesh(new THREE.CylinderGeometry(.003, .003, .003, 6), dark,
        [.129 * Math.cos(a), .129 * Math.sin(a), z + Math.sign(z) * .005], covers);
      bolt.rotation.x = Math.PI / 2; bolt.name = "mmrtg-cover-fastener";
    }
  }
  const portAngle = Math.PI / 4, radial = new THREE.Vector3(Math.cos(portAngle), Math.sin(portAngle), 0);
  const port = mesh(new THREE.CylinderGeometry(.010, .010, .018, 16), metal,
    [radial.x * .151, radial.y * .151, -.19], interfaces);
  port.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), radial);
  port.name = "mmrtg-covered-connector-example";
  port.userData.pinoutUnmodeled = true;
  return { frame, housingAssembly, finAssembly, endAssembly, housing, fins, roots, covers, mount, interfaces, finGroups };
}
