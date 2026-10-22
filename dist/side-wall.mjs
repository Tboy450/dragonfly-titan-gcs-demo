import * as THREE from "./vendor/three/three.module.min.js";

// [PUB] NASA April23,2026: aluminum facesheets0.01in thick, honeycomb primary panels
// designed by APL/manufactured by Lockheed Martin. [EST] this panel's outline,12mm
// separation, edge closeout, fasteners/tape and camera relief fit the existing model.
// Real May2026 frame photograph informs appearance; no flight core pitch/alloy/adhesive
// or verified removable hatch is claimed. Core microstructure is deliberately unmodeled.
export const sideWallAsset = Object.freeze({
  revision: "starboard-wall-2026-10-22", faceM: 0.000254,
  innerX: 0.3605, outerX: 0.3725, frontZ: -1.50, aftZ: 0.99,
  bottomY: -0.31, topY: 0.07, edgeM: 0.012,
  cameraRelief: Object.freeze({ frontZ: 0.10, aftZ: 0.22, topY: -0.19 }),
});
export const portWallAsset = Object.freeze({
  ...sideWallAsset, revision: "port-wall-2026-10-22",
  cameraReliefs: Object.freeze([
    sideWallAsset.cameraRelief,
    Object.freeze({ frontZ: .29, aftZ: .455, topY: -.148 }),
  ]),
});

export function buildSideWall({ parent, mesh, side = 1 }) {
  const port = side === -1, A = port ? portWallAsset : sideWallAsset;
  const reliefs = A.cameraReliefs ?? [A.cameraRelief], prefix = port ? "port-wall" : "side-wall";
  const target = port ? new THREE.Group() : parent;
  if (port) { target.name = "port-wall-reflection"; target.scale.x = -1; parent.add(target); }
  Object.assign(parent.userData, {
    inspectionTitle: port ? "Port structural wall" : "Starboard structural wall", assetRevision: A.revision,
    dimensionConfidence: "PUB+EST", coreMicrostructureModeled: false,
    source: "NASA/APL real2026 frame photo; NASA April23 aluminum facesheet thickness. Outline, separation, closeouts and camera relief estimated",
  });
  const layer = (name, label, category) => {
    const g = new THREE.Group(); g.name = name;
    Object.assign(g.userData, { inspectionLabel: label, inspectionLayer: category }); target.add(g); return g;
  };
  const outer = layer(`${prefix}-outer-focus`, "Outer aluminum face (0.254 mm)", "equipment-covers");
  const inner = layer(`${prefix}-inner-focus`, "Inner aluminum face (0.254 mm)", "equipment-casings");
  const edges = layer(`${prefix}-edge-focus`, "Estimated edge closeouts and fasteners", "mounts");
  const silver = new THREE.MeshStandardMaterial({ color: 0xb8bec3, metalness: 0.72, roughness: 0.4, side: THREE.DoubleSide });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x929ca4, metalness: 0.65, roughness: 0.45 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x6b7378, metalness: 0.8, roughness: 0.3 });
  const tape = new THREE.MeshStandardMaterial({ color: 0xcda937, metalness: 0.15, roughness: 0.52 });
  const outline = [
    [A.frontZ, A.bottomY + .025], [A.frontZ + .025, A.bottomY],
    ...reliefs.flatMap(C => [[C.frontZ, A.bottomY], [C.frontZ, C.topY], [C.aftZ, C.topY], [C.aftZ, A.bottomY]]),
    [A.aftZ - .025, A.bottomY], [A.aftZ, A.bottomY + .025],
    [A.aftZ, A.topY - .012], [A.aftZ - .012, A.topY],
    [A.frontZ + .012, A.topY], [A.frontZ, A.topY - .012],
  ];
  const shape = new THREE.Shape();
  outline.forEach(([z,y],i) => i ? shape.lineTo(z,y) : shape.moveTo(z,y)); shape.closePath();
  const faceGeometry = new THREE.ExtrudeGeometry(shape, { depth: A.faceM, bevelEnabled: false });
  // Shape local horizontal is vehicle z; extrusion local z becomes vehicle +x.
  faceGeometry.rotateY(-Math.PI/2); faceGeometry.translate(A.faceM,0,0);
  const facing = (name, x, owner) => {
    const o = mesh(faceGeometry, silver, [x,0,0], owner); o.name = name; return o;
  };
  facing(`${prefix}-outer-aluminum-face`, A.outerX - A.faceM, outer);
  facing(`${prefix}-inner-aluminum-face`, A.innerX, inner);
  const box = (name, dimensions, p, mat, owner = edges) => {
    const o = mesh(new THREE.BoxGeometry(...dimensions), mat, p, owner); o.name = name; return o;
  };
  const middleX = (A.innerX + A.outerX)/2, depth = A.outerX - A.innerX - 2*A.faceM;
  // Closed perimeter strips avoid pretending the absent core is an empty flight chamber.
  const rail = (from, to) => {
    const dy = to[1] - from[1], dz = to[0] - from[0], length = Math.hypot(dy,dz);
    const o = box("side-wall-edge-closeout", [depth, A.edgeM, length],
      [middleX,(from[1]+to[1])/2,(from[0]+to[0])/2], edgeMat);
    o.rotation.x = -Math.atan2(dy,dz);
  };
  for (let i=0; i<outline.length; i++) {
    const p=outline[i], q=outline[(i+1)%outline.length];
    // Move each strip inward by half its width in the polygon's counterclockwise plane.
    const dz=q[0]-p[0], dy=q[1]-p[1], len=Math.hypot(dz,dy);
    rail([p[0]-dy/len*A.edgeM/2,p[1]+dz/len*A.edgeM/2],
      [q[0]-dy/len*A.edgeM/2,q[1]+dz/len*A.edgeM/2]);
  }
  const screwGeometry = new THREE.CylinderGeometry(.0023,.0023,.0013,8);
  const screw = (z,y) => {
    const o = mesh(screwGeometry, steel,[A.outerX+.00065,y,z],edges);
    o.rotation.z=Math.PI/2; o.name="side-wall-edge-fastener";
  };
  for (let z=A.frontZ+.045; z<A.aftZ-.025; z+=.075) {
    screw(z,A.topY-.012);
    if (reliefs.every(C => z<C.frontZ-.012 || z>C.aftZ+.012)) screw(z,A.bottomY+.012);
  }
  for (const z of [A.frontZ+.012,A.aftZ-.012]) for (const y of [-.24,-.16,-.08,0]) screw(z,y);
  for (const z of [-1.28,-.93,-.38,.36,.68]) {
    box("side-wall-local-gold-tape", [.0002,.024,.018], [A.outerX+.0001,A.topY-.015,z],tape,outer);
  }
  return { outer, inner, edges };
}
