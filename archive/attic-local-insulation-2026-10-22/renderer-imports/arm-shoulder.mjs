import * as THREE from "./vendor/three/three.module.min.js";

// Arm shoulder fitting (owner, October 15: "it looks more like a little hexagon at the shoulder").
// Drawn from NASA/APL's May 2026 photo of the flight lander frame in its tap test
// (research/rotor-heads-2026-10-15/nasa-apl-lander-frame-tap-test-2026-05.jpg; crops in
// research/arm-shoulder-2026-10-20): each arm tube ends in a dark machined fitting bolted to the
// body's side panel. The fitting narrows outward along the arm as a faceted, roughly hexagonal
// collar with ribs at its edges, and ends in a round flange whose ring of bolts holds the arm tube.
// Its flanged, pocketed base plate on the panel is under the body's foam in this model and is not
// drawn; the lifting lug on its top in the photo (a shackle hangs from it) may be ground-handling
// only and is not drawn. All sizes [EST], proportioned on the photo against the arm tube.
export const armShoulderAsset = Object.freeze({
  revision: "arm-shoulder-2026-10-20",
  skinX: 0.43,                 // the body's foam surface at the arm roots (vehicle-research.mjs)
  baseAcrossFlatsM: 0.15,      // collar where it leaves the foam
  neckAcrossFlatsM: 0.11,      // collar at the flange
  collarLengthM: 0.09,
  flangeRadiusM: 0.066, flangeThicknessM: 0.012,
  bolts: 12, boltCircleRadiusM: 0.056,
});

const circumradius = acrossFlats => acrossFlats / Math.sqrt(3);

// root and hub in the model frame; the fitting starts at root and points along the arm toward hub.
// Returns the point on the flange's outboard face where the arm continues.
export function buildArmShoulder({ parent, mesh, root, hub }) {
  const A = armShoulderAsset;
  const start = new THREE.Vector3(...root), along = new THREE.Vector3(...hub).sub(start).normalize();
  const fitting = new THREE.Group();
  fitting.name = "arm-shoulder-fitting";
  fitting.position.copy(start);
  // Local +y along the arm, local +x straight up (square to the arm), so the collar's flats face
  // up and down whatever the arm's angle.
  const up = new THREE.Vector3(0, 1, 0).addScaledVector(along, -along.y).normalize();
  fitting.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(up, along, new THREE.Vector3().crossVectors(up, along)));
  fitting.userData.assetRevision = A.revision;
  parent.add(fitting);
  // Machined dark gray as photographed; bolt heads steel.
  const machined = new THREE.MeshStandardMaterial({ color: 0x55595d, metalness: 0.6, roughness: 0.42 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xa4a9ad, metalness: 0.8, roughness: 0.3 });
  const L = A.collarLengthM, rBase = circumradius(A.baseAcrossFlatsM), rNeck = circumradius(A.neckAcrossFlatsM);
  // Six-sided collar, flats up and down (no vertex at local +-x, which the pose points up).
  const collar = mesh(new THREE.CylinderGeometry(rNeck, rBase, L, 6), machined, [0, L / 2, 0], fitting);
  collar.name = "arm-shoulder-collar";
  // A rib along each edge of the collar, following its taper.
  const slope = Math.atan2(rBase - rNeck, L);
  for (let k = 0; k < 6; k += 1) {
    const theta = k / 6 * Math.PI * 2, r = (rBase + rNeck) / 2 + 0.004;
    const rib = mesh(new THREE.BoxGeometry(0.006, L / Math.cos(slope), 0.012), machined, [Math.sin(theta) * r, L / 2, Math.cos(theta) * r], fitting);
    rib.rotation.set(0, theta, 0); rib.rotateX(-slope); rib.name = "arm-shoulder-rib";
  }
  const flangeY = L + A.flangeThicknessM / 2;
  const flange = mesh(new THREE.CylinderGeometry(A.flangeRadiusM, A.flangeRadiusM, A.flangeThicknessM, 32), machined, [0, flangeY, 0], fitting);
  flange.name = "arm-shoulder-flange";
  for (let k = 0; k < A.bolts; k += 1) {
    const theta = (k + 0.5) / A.bolts * Math.PI * 2;
    const bolt = mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.007, 8), steel,
      [Math.sin(theta) * A.boltCircleRadiusM, L + A.flangeThicknessM + 0.0035, Math.cos(theta) * A.boltCircleRadiusM], fitting);
    bolt.name = "arm-shoulder-bolt";
  }
  return start.clone().addScaledVector(along, L + A.flangeThicknessM).toArray();
}
