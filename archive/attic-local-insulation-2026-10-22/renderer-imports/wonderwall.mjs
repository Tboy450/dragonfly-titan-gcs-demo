import * as THREE from "./vendor/three/three.module.min.js";

// NASA SciTech 2024 figs. 2/11 and SVS 15003 establish the shaped attic interface.
// All detail geometry is [EST]. ICES-2023's ~5 cm is instrument separation, NOT wall thickness.
// Codex's October 12 panel; Claude's October 20 detail pass adds what NASA's SVS 15003 photos
// show on it (owner: "something may be missing"): khaki facesheets, the machined pocketed frame
// around the port on the carousel side, the port's spoked fitting, orange Kapton covers and the
// clip tabs along the edges. Positions and sizes are traced on the photos [EST]; the earlier
// panel is in archive/wonderwall-2026-10-20.
export const wonderwallAsset = Object.freeze({
  revision: "wonderwall-2026-10-20",
  position: Object.freeze([0.095, 0.08, -1.26]),
  coreThicknessM: 0.022,
  aperture: Object.freeze([-0.02, 0.245, 0.046]),
  outline: Object.freeze([[-0.30, 0], [0.31, 0], [0.31, 0.35], [0.25, 0.40],
    [-0.10, 0.40], [-0.23, 0.32], [-0.30, 0.17]].map(Object.freeze)),
});

export function buildWonderwall({ parent, mesh }) {
  const wall = new THREE.Group();
  wall.name = "wonderwall-interface";
  wall.position.fromArray(wonderwallAsset.position);
  parent.add(wall);
  Object.assign(parent.userData, { assetRevision: wonderwallAsset.revision, dimensionConfidence: "EST" });
  const layer = (name, category, thermalZone) => {
    const group = new THREE.Group();
    group.name = name;
    group.userData = { inspectionLayer: category, subsystem: "wonderwall", thermalZone };
    wall.add(group);
    return group;
  };
  // Independent groups allow future peel-away controls without translating installed hardware.
  // These presentation layers are not an asserted flight material stack or ply schedule.
  const insulation = layer("wonderwall-insulation", "insulation", "cold-attic");
  const coldFace = layer("wonderwall-cold-face", "interface-faces", "cold-attic");
  const warmFace = layer("wonderwall-warm-face", "interface-faces", "equipment-bay");
  const mounts = layer("wonderwall-mounts", "mounts", "equipment-bay");
  const core = new THREE.MeshStandardMaterial({ color: 0xc4c5ad, roughness: 0.92, metalness: 0 });
  const facing = new THREE.MeshStandardMaterial({ color: 0xc6c19f, roughness: 0.6, metalness: 0.12 });
  const warmFacing = new THREE.MeshStandardMaterial({ color: 0xcbc6a5, roughness: 0.6, metalness: 0.12 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xadb6bb, roughness: 0.43, metalness: 0.57 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x626865, roughness: 0.73, metalness: 0.16 });

  function panel(thickness, material, x, target, name) {
    const shape = new THREE.Shape();
    wonderwallAsset.outline.forEach(([u, y], i) => i ? shape.lineTo(u, y) : shape.moveTo(u, y));
    shape.closePath();
    const [u, y, r] = wonderwallAsset.aperture;
    const opening = new THREE.Path();
    opening.absarc(u, y, r, 0, Math.PI * 2, true);
    shape.holes.push(opening);
    const slot = new THREE.Path();
    slot.moveTo(0.07, 0.20); slot.lineTo(0.07, 0.29); slot.lineTo(0.091, 0.29);
    slot.lineTo(0.091, 0.20); slot.closePath();
    shape.holes.push(slot);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 32 });
    geometry.rotateY(-Math.PI / 2);
    geometry.translate(thickness / 2, 0, 0);
    mesh(geometry, material, [x, 0, 0], target).name = name;
  }
  panel(wonderwallAsset.coreThicknessM, core, 0, insulation, "wonderwall-estimated-core");
  panel(0.0014, facing, -0.0118, coldFace, "wonderwall-cold-facing");
  panel(0.0014, warmFacing, 0.0118, warmFace, "wonderwall-warm-facing");

  function rib(from, to, radius, material, target) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), d = b.clone().sub(a);
    const part = mesh(new THREE.CylinderGeometry(radius, radius, d.length(), 6), material,
      a.add(b).multiplyScalar(0.5).toArray(), target);
    part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  }
  // Perimeter and sparse stiffeners follow the photographic silhouette, not a structural model.
  for (const [i, [u, y]] of wonderwallAsset.outline.entries()) {
    const [nextU, nextY] = wonderwallAsset.outline[(i + 1) % wonderwallAsset.outline.length];
    rib([0.015, y, u], [0.015, nextY, nextU], 0.004, metal, warmFace);
    rib([-0.013, y, u], [-0.013, nextY, nextU], 0.0014, dark, coldFace);
  }
  for (const u of [-0.16, 0.13, 0.27]) rib([0.016, 0.012, u], [0.016, u < 0 ? 0.345 : 0.35, u], 0.0035, metal, warmFace);
  rib([0.016, 0.125, -0.265], [0.016, 0.125, 0.29], 0.0035, metal, warmFace);
  const [u, y, r] = wonderwallAsset.aperture;
  for (const [x, target] of [[-0.014, coldFace], [0.016, warmFace]]) {
    const collar = mesh(new THREE.RingGeometry(r, r + 0.012, 48), metal, [x, y, u], target);
    collar.material = metal.clone();
    collar.material.side = THREE.DoubleSide;
    collar.rotation.y = Math.PI / 2;
    collar.name = x < 0 ? "wonderwall-cold-interface-rim" : "wonderwall-warm-interface-rim";
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const fastener = mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.003, 6), dark,
        [x + Math.sign(x) * 0.001, y + Math.sin(a) * (r + 0.007), u + Math.cos(a) * (r + 0.007)], target);
      fastener.rotation.z = Math.PI / 2;
    }
  }
  for (const u of [-0.23, 0.03, 0.25]) {
    mesh(new THREE.BoxGeometry(0.033, 0.008, 0.029), metal, [0.027, 0, u], mounts);
    mesh(new THREE.BoxGeometry(0.008, 0.03, 0.029), metal, [0.016, 0.013, u], mounts);
    mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.004, 6), dark, [0.031, 0.006, u], mounts);
  }
  // ---- Detail from the photos (Claude, October 20) ----
  const machined = new THREE.MeshStandardMaterial({ color: 0x9ea2a5, roughness: 0.45, metalness: 0.6 });
  const pocketShade = new THREE.MeshStandardMaterial({ color: 0x5b5f62, roughness: 0.7, metalness: 0.4 });
  const kapton = new THREE.MeshStandardMaterial({ color: 0xf0a21c, roughness: 0.32, metalness: 0.1, emissive: 0x2a1600 });
  const frame = layer("wonderwall-port-frame", "mounts", "cold-attic");
  const covers = layer("wonderwall-kapton-covers", "equipment-covers", "cold-attic");
  const clips = layer("wonderwall-edge-clips", "mounts", "equipment-bay");
  const coldSurface = -0.0125;
  // Machined frame on the carousel side: from the top edge down to the Kapton, around the port.
  const top = (uu) => uu > -0.10 ? 0.40 : 0.40 - (-0.10 - uu) * (0.08 / 0.13);
  const outline = new THREE.Shape();
  [[-0.16, 0.17], [0.12, 0.17], [0.12, top(0.12) - 0.004], [-0.10, top(-0.10) - 0.004], [-0.16, top(-0.16) - 0.004]]
    .forEach(([uu, yy], i) => i ? outline.lineTo(uu, yy) : outline.moveTo(uu, yy));
  outline.closePath();
  const portHole = new THREE.Path(); portHole.absarc(u, y, r, 0, Math.PI * 2, true); outline.holes.push(portHole);
  const plate = new THREE.ExtrudeGeometry(outline, { depth: 0.002, bevelEnabled: false, curveSegments: 32 });
  plate.rotateY(-Math.PI / 2);   // shape (u, y) -> (z, y); extrudes toward the carousel (-x)
  mesh(plate, machined, [coldSurface, 0, 0], frame).name = "wonderwall-port-frame-plate";
  // Rectangular pockets in rows, as photographed; none crosses the port.
  const pockets = [
    [-0.085, -0.035, 0.345, 0.385], [-0.025, 0.025, 0.345, 0.385], [0.035, 0.075, 0.345, 0.385], [0.085, 0.11, 0.345, 0.385],
    [-0.13, -0.09, 0.315, 0.335], [-0.08, -0.04, 0.315, 0.335], [0.02, 0.06, 0.315, 0.335], [0.07, 0.11, 0.315, 0.335],
    [0.05, 0.11, 0.24, 0.30], [0.05, 0.11, 0.18, 0.23], [-0.15, -0.09, 0.25, 0.30], [-0.15, -0.09, 0.18, 0.24],
  ];
  for (const [u0, u1, y0, y1] of pockets) {
    mesh(new THREE.BoxGeometry(0.0006, y1 - y0, u1 - u0), pocketShade, [coldSurface - 0.0023, (y0 + y1) / 2, (u0 + u1) / 2], frame).name = "wonderwall-frame-pocket";
  }
  // The port's fitting: a cross of spokes out to the bolted ring. The middle stays open for the
  // modeled DraMS neck (0.024 m); whether the photo's hub is that neck is not established.
  for (let k = 0; k < 4; k += 1) {
    const a = k * Math.PI / 2, rm = (0.029 + r) / 2;
    const spoke = mesh(new THREE.BoxGeometry(0.006, r - 0.029, 0.007), machined, [coldSurface + 0.002, y + Math.sin(a) * rm, u + Math.cos(a) * rm], frame);
    spoke.rotation.x = -a + Math.PI / 2; spoke.name = "wonderwall-port-spoke";
  }
  const hub = mesh(new THREE.RingGeometry(0.029, 0.034, 32), machined, [coldSurface - 0.0006, y, u], frame);
  hub.material = machined.clone(); hub.material.side = THREE.DoubleSide; hub.rotation.y = Math.PI / 2; hub.name = "wonderwall-port-hub-ring";
  // Orange Kapton over the lower frame and to the right of the port (aft), as photographed.
  mesh(new THREE.BoxGeometry(0.0006, 0.158, 0.32), kapton, [coldSurface - 0.0004, 0.012 + 0.079, -0.01], covers).name = "wonderwall-kapton";
  mesh(new THREE.BoxGeometry(0.0006, 0.10, 0.105), kapton, [coldSurface - 0.0026, 0.22, 0.0975], covers).name = "wonderwall-kapton";
  // Clip tabs along the edges (both faces), about every 5.5 cm where the frame and Kapton leave room.
  const tabAt = (uu, yy, angle) => {
    for (const side of [-1, 1]) {
      const tab = mesh(new THREE.BoxGeometry(0.003, 0.022, 0.013), machined, [side * 0.014, yy, uu], clips);
      tab.rotation.x = angle; tab.name = "wonderwall-edge-clip";
      const bolt = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.003, 8), dark, [side * 0.017, yy, uu], clips);
      bolt.rotation.z = Math.PI / 2; bolt.name = "wonderwall-edge-clip-bolt";
    }
  };
  const edges = [[[0.25, 0.40], [-0.10, 0.40]], [[-0.10, 0.40], [-0.23, 0.32]], [[-0.23, 0.32], [-0.30, 0.17]], [[-0.30, 0.012], [0.31, 0.012]]];
  for (const [[u0, y0], [u1, y1]] of edges) {
    const length = Math.hypot(u1 - u0, y1 - y0), steps = Math.floor(length / 0.055);
    const angle = Math.atan2(y1 - y0, u1 - u0);
    for (let k = 1; k < steps; k += 1) {
      const t = k / steps, uu = u0 + (u1 - u0) * t, yy = y0 + (y1 - y0) * t;
      const inside = y0 > 0.1 ? 0.012 : 0;   // top edges: tab just inside the edge
      const onFrame = uu > -0.17 && uu < 0.13;
      if (onFrame) continue;
      // The outline runs counterclockwise, so the inward normal is to the left of each edge.
      tabAt(uu - Math.sin(angle) * inside, yy + Math.cos(angle) * inside, -angle);
    }
  }
  return { wall, insulation, coldFace, warmFace, mounts, frame, covers, clips };
}
