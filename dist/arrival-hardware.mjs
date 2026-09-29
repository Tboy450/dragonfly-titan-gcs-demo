// Aeroshell, heat shield, parachutes and bridle lines for the arrival sequence (timeline in edl.mjs).
import * as THREE from "./vendor/three/three.module.min.js";

export function createArrivalHardware(scene, craft, upAxis) {
  // ---- Entry, descent and landing hardware for the arrival sequence (timeline in edl.mjs) ----
  // 4.5 m, 60-degree sphere-cone aeroshell; 8.25 m drogue and 16.7 m main parachutes [PUB].
  // Colors, riser lengths and the bridle geometry are illustrative.
  const edlGroup = new THREE.Group();
  edlGroup.visible = false;
  scene.add(edlGroup);
  const shellWhite = new THREE.MeshStandardMaterial({ color: 0xd9d4ca, metalness: 0.15, roughness: 0.65 });
  const shieldBrown = new THREE.MeshStandardMaterial({ color: 0x3b2b21, metalness: 0.1, roughness: 0.85 });
  const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0xf1e7d2, roughness: 0.9, side: THREE.DoubleSide });
  const canopyBand = new THREE.MeshStandardMaterial({ color: 0xc8643a, roughness: 0.9, side: THREE.DoubleSide });
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x8f8574 });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const unitLine = new THREE.CylinderGeometry(1, 1, 1, 6);
  function line(parent, radius = 0.015) {
    const part = new THREE.Mesh(unitLine, lineMaterial);
    part.scale.set(radius, 1, radius);
    parent.add(part);
    return part;
  }
  const lineStart = new THREE.Vector3(), lineEnd = new THREE.Vector3(), lineAxis = new THREE.Vector3();
  function stretch(part, from, to, radius = 0.015) {
    lineAxis.subVectors(to, from);
    part.position.addVectors(from, to).multiplyScalar(0.5);
    part.scale.set(radius, Math.max(0.001, lineAxis.length()), radius);
    part.quaternion.setFromUnitVectors(upAxis, lineAxis.normalize());
  }
  // The backshell, parachutes and their lines move together; the origin is the backshell rim.
  const backshellAssembly = new THREE.Group();
  edlGroup.add(backshellAssembly);
  const backshell = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 2.25, 1.9, 48), shellWhite);
  backshell.position.y = 0.95;
  backshellAssembly.add(backshell);
  function parachute(radius, riser) {
    const group = new THREE.Group();
    const opening = Math.PI * 0.42;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 10, 0, Math.PI * 2, 0, opening), canopyMaterial);
    dome.position.y = riser;
    group.add(dome);
    const band = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.002, 32, 3, 0, Math.PI * 2, opening * 0.72, opening * 0.14), canopyBand);
    band.position.y = riser;
    group.add(band);
    const apex = new THREE.Vector3(0, 1.9, 0);
    for (let i = 0; i < 16; i += 1) {
      const angle = i / 16 * Math.PI * 2;
      const rim = new THREE.Vector3(Math.cos(angle) * radius * Math.sin(opening), riser + radius * Math.cos(opening), Math.sin(angle) * radius * Math.sin(opening));
      stretch(line(group, 0.012), apex, rim, 0.012);
    }
    backshellAssembly.add(group);
    return group;
  }
  const drogueChute = parachute(4.125, 14);
  const mainChute = parachute(8.35, 26);
  const heatShield = new THREE.Mesh(new THREE.ConeGeometry(2.25, 1.3, 48), shieldBrown);
  heatShield.rotation.x = Math.PI;
  edlGroup.add(heatShield);
  const entryGlow = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), glowMaterial);
  entryGlow.scale.set(3.3, 1.7, 3.3);
  edlGroup.add(entryGlow);
  const bridles = [0, 1, 2].map(() => line(edlGroup, 0.014));
  const shieldFall = new THREE.Vector3();

  function poseArrival(e) {
    edlGroup.visible = !!e;
    // The lander is enclosed in the aeroshell until it is lowered out for the pose.
    craft.visible = !e || e.pose > 0.01;
    if (!e) return;
    const lander = craft.position;
    // Posed: the lander hangs below the backshell. Released: the backshell and chute drift up and away.
    const rise = 4.5 * e.pose + (e.released ? e.separation * 2.6 : 0);
    const drift = e.released ? e.separation * 3.4 : 0;
    backshellAssembly.visible = e.separation < 14;
    backshellAssembly.position.set(lander.x - drift, lander.y - 0.3 + rise, lander.z + drift * 0.4);
    backshellAssembly.rotation.y = craft.rotation.y;
    drogueChute.visible = e.chute === "drogue";
    mainChute.visible = e.chute === "main";
    const open = Math.max(0.04, e.chuteOpen);
    (e.chute === "main" ? mainChute : drogueChute).scale.set(open, 0.35 + 0.65 * open, open);
    const fall = 0.5 * 5 * e.heatShieldDrop ** 2;
    heatShield.visible = e.heatShieldDrop < 5;
    shieldFall.set(lander.x, lander.y - 0.95 - fall, lander.z);
    heatShield.position.copy(shieldFall);
    entryGlow.visible = e.glow > 0.01;
    entryGlow.position.set(lander.x, lander.y - 1.6, lander.z);
    glowMaterial.opacity = 0.55 * e.glow;
    const hanging = e.pose > 0.02 && !e.released;
    bridles.forEach((bridle, index) => {
      bridle.visible = hanging;
      if (!hanging) return;
      const angle = index / 3 * Math.PI * 2 + craft.rotation.y;
      lineStart.set(backshellAssembly.position.x + Math.cos(angle) * 0.9, backshellAssembly.position.y, backshellAssembly.position.z + Math.sin(angle) * 0.9);
      lineEnd.set(lander.x + Math.cos(angle) * 0.2, lander.y + 0.2, lander.z + Math.sin(angle) * 0.2);
      stretch(bridle, lineStart, lineEnd, 0.014);
    });
  }

  return { group: edlGroup, pose: poseArrival };
}
