import * as THREE from "./vendor/three/three.module.min.js";

// [PUB] ICES-2023-389 pp. 5/7: two RDE boxes with internal fans.
// [EST] All visual details below. The CAPS 2024 test photo does not resolve flight
// casing geometry. Codex's provisional enclosures (October 15/19) are kept unchanged.
// Owner-approved design approximation (October 21; Claude): APL builds the RDE (APL G-RADNEXT
// 2026 abstract), so the boxes gain the look of APL's photographed avionics on this vehicle:
// the IEM's black finned heat-sink top, the power units' slice seams and their mated,
// backshelled connectors with short cables to the main harness. Not a photo of the RDE.
export const rdeAsset = Object.freeze({
  revision: "rde-2026-10-21-service-loops",
  confidence: "EST",
  unitCount: 2,
  centers: Object.freeze([Object.freeze([-0.16, -0.55]), Object.freeze([0.16, -0.55])]),
  widthM: 0.24, depthM: 0.26, bottomY: -0.266, topY: -0.09, floorY: -0.284,
  fanRadiusM: 0.031,
  leadRadiusM: 0.0025, leadControlReachM: 0.075,
});

export function buildRotorDriveElectronics({ parent, mesh }) {
  const assembly = new THREE.Group();
  assembly.name = "rde-provisional-assemblies";
  parent.add(assembly);
  Object.assign(parent.userData, { assetRevision: rdeAsset.revision, dimensionConfidence: "EST",
    appearanceEvidence: "Owner-approved design approximation in the style of APL's photographed avionics; no resolved flight-casing photo",
    approvedApproximation: true, flightConfigurationConfirmed: false });
  const silver = new THREE.MeshStandardMaterial({ color: 0xb4bec3, metalness: 0.6, roughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x343d43, metalness: 0.4, roughness: 0.53 });
  const fastener = new THREE.MeshStandardMaterial({ color: 0x747c82, metalness: 0.7, roughness: 0.32 });
  const box = (size, at, material, target, name) => {
    const o = mesh(new THREE.BoxGeometry(...size), material, at, target); o.name = name; return o;
  };
  const { widthM: w, depthM: d, bottomY: bottom, topY: top, floorY, fanRadiusM: r } = rdeAsset;
  const h = top - bottom, cy = (top + bottom) / 2, skin = 0.003;
  const units = rdeAsset.centers.map(([x, z], i) => {
    const prefix = `rde-${i + 1}`;
    // Identity roots preserve every existing vehicle-frame mesh position and the original part 09.
    const group = new THREE.Group(); group.name = prefix; assembly.add(group);
    Object.assign(group.userData, {
      inspectionLabel: `RDE ${i + 1} (approved approximation)`,
      labelAnchor: new THREE.Vector3(x, top + skin, z), dimensionConfidence: "EST",
      flightConfigurationConfirmed: false, unmodeledInternals: true,
    });
    const layers = {};
    for (const [key, category] of Object.entries({
      mounts: "mounts", casings: "equipment-casings", covers: "equipment-covers",
      cooling: "interfaces", connectors: "interfaces", harnesses: "harnesses",
    })) {
      const g = new THREE.Group(); g.name = `${prefix}-${key}`;
      g.userData.inspectionLayer = category; group.add(g); layers[key] = g;
    }
    // Separate cover and hollow casing; hiding a cover never reveals invented boards.
    box([w, skin, d], [x, bottom + skin / 2, z], silver, layers.casings, `${prefix}-floor`);
    box([w, skin, d], [x, top + skin / 2, z], silver, layers.covers, `${prefix}-lid`);
    for (const side of [-1, 1]) {
      box([skin, h, d], [x + side * (w - skin) / 2, cy, z], silver, layers.casings, `${prefix}-side`);
      for (const dz of [-0.09, 0.09]) {
        box([0.026, bottom - floorY, 0.036], [x + side * 0.102, (bottom + floorY) / 2, z + dz], dark, layers.mounts, `${prefix}-foot`);
        const bolt = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.002, 6), fastener,
          [x + side * 0.104, top + skin + 0.001, z + dz], layers.covers);
        bolt.name = `${prefix}-lid-fastener`;
      }
    }
    // Real openings, not painted-on dark discs. Number/size/location are illustrative.
    for (const end of [-1, 1]) {
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2, bottom); shape.lineTo(w / 2, bottom);
      shape.lineTo(w / 2, top); shape.lineTo(-w / 2, top); shape.closePath();
      for (const fx of [-0.061, 0.061]) {
        const hole = new THREE.Path(); hole.absarc(fx, cy, r + 0.002, 0, Math.PI * 2, true);
        shape.holes.push(hole);
      }
      const panel = new THREE.ExtrudeGeometry(shape, { depth: skin, bevelEnabled: false, curveSegments: 24 });
      mesh(panel, silver, [x, 0, z + end * d / 2 - skin / 2], layers.casings).name = `${prefix}-vent-panel`;
      for (const fx of [-0.061, 0.061]) {
        const ring = mesh(new THREE.TorusGeometry(r + 0.002, 0.002, 6, 32), fastener,
          [x + fx, cy, z + end * (d / 2 + 0.002)], layers.cooling);
        ring.name = `${prefix}-vent-rim`;
        for (const offset of [-0.014, 0, 0.014]) {
          const length = 2 * Math.sqrt(r * r - offset * offset);
          box([length, 0.002, 0.002], [x + fx, cy + offset, z + end * (d / 2 + 0.002)], dark, layers.cooling, `${prefix}-guard`);
        }
        // A static internal impeller signifies published forced cooling, not a new fan solver.
        if (end === -1) {
          const hub = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 16), dark,
            [x + fx, cy, z - d / 2 + 0.014], layers.cooling);
          hub.rotation.x = Math.PI / 2; hub.name = `${prefix}-fan-hub`;
          for (let k = 0; k < 5; k++) {
            const a = k * Math.PI * 2 / 5;
            const blade = box([0.012, 0.024, 0.002], [x + fx + Math.sin(a) * 0.017,
              cy + Math.cos(a) * 0.017, z - d / 2 + 0.014], dark, layers.cooling, `${prefix}-fan-blade`);
            blade.rotation.z = -a; blade.rotation.y = 0.35;
          }
        }
      }
    }
    // Connector blanks only: no claimed flight pinout, channel allocation or cable route.
    for (const dx of [-0.06, 0.06]) {
      box([0.036, 0.014, 0.006], [x + dx, bottom + 0.022, z - d / 2 - 0.004], dark, layers.connectors, `${prefix}-connector-blank`);
    }
    // ---- Approximation detail (October 21): names carry "-approx-" ----
    const black = new THREE.MeshStandardMaterial({ color: 0x1f2326, metalness: 0.45, roughness: 0.5 });
    const shell = new THREE.MeshStandardMaterial({ color: 0x9aa1a6, metalness: 0.75, roughness: 0.32 });
    const wrap = new THREE.MeshStandardMaterial({ color: 0xc9ced2, metalness: 0.72, roughness: 0.38 });
    // Black finned heat sink on the lid, clear of the lid fasteners (IEM style) and 2 mm under
    // the TWTA waveguide flange above box 2.
    box([0.19, 0.002, d - 0.03], [x, top + skin + 0.001, z], black, layers.covers, `${prefix}-approx-heat-sink-base`);
    for (let k = 0; k < 11; k += 1) {
      box([0.0028, 0.009, d - 0.034], [x - 0.09 + k * 0.018, top + skin + 0.0065, z], black, layers.covers, `${prefix}-approx-heat-sink-fin`);
    }
    // Slice seams on both sides (power-unit style).
    for (const side of [-1, 1]) for (const dz of [-0.065, 0, 0.065]) {
      box([0.0008, h - 0.012, 0.003], [x + side * (w / 2 + 0.0004), cy, z + dz], black, layers.casings, `${prefix}-approx-slice-seam`);
    }
    // Mated plugs and backshells on Codex's connector blanks, with short cables that meet the
    // main harness branch in front of the box (main-harness.mjs).
    const face = z - d / 2 - 0.007;
    for (const dx of [-0.06, 0.06]) {
      box([0.034, 0.016, 0.004], [x + dx, bottom + 0.022, face - 0.002], shell, layers.connectors, `${prefix}-approx-plug`);
      box([0.022, 0.013, 0.007], [x + dx, bottom + 0.022, face - 0.0075], wrap, layers.connectors, `${prefix}-approx-backshell`);
      // [EST] Broad slack bow, not an identified flight route or a certified bend radius.
      // Endpoints retain Claude's backshell and main-harness interfaces; no electrical splice implied.
      const lead = new THREE.CubicBezierCurve3(
        new THREE.Vector3(x + dx, bottom + 0.016, face - 0.008),
        new THREE.Vector3(x + dx, -0.242, face - 0.008 - rdeAsset.leadControlReachM),
        new THREE.Vector3(x, -0.242, face - 0.01 - rdeAsset.leadControlReachM),
        new THREE.Vector3(x, -0.252, face - 0.01),
      );
      const cable = mesh(new THREE.TubeGeometry(lead, 40, rdeAsset.leadRadiusM, 8, false), wrap, [0, 0, 0], layers.harnesses);
      cable.name = `${prefix}-approx-lead`;
      cable.userData.routeConfidence = "EST";
      const lacing = new THREE.MeshStandardMaterial({ color: 0x5fb3a6, metalness: 0.05, roughness: 0.6 });
      for (const t of [0.22, 0.72]) {
        const tie = mesh(new THREE.TorusGeometry(rdeAsset.leadRadiusM + 0.0006, 0.0006, 4, 12),
          lacing, lead.getPointAt(t).toArray(), layers.harnesses);
        tie.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), lead.getTangentAt(t));
        tie.name = `${prefix}-approx-lead-tie`;
      }
    }
    return { group, ...layers };
  });
  return { assembly, units };
}
