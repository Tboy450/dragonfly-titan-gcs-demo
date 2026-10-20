// Titan Hive outpost (Claude, October 2026): the Swarmfall Hive dug in on the Dragonfly
// simulator's own Titan terrain (Ahmakiq Undae dunes, haze and rocks, titan-terrain.mjs).
// Drop pods come down on a loop under the simulator's aeroshell and parachutes
// (arrival-hardware.mjs, edl.mjs); NASA's Dragonfly (the research model) sits parked and flies a
// slow circuit; the game's drone models hover in squads. The Hive spire, pads, domes and sheds
// are original procedural art [EST]. Titan's real light is far dimmer; brightened to read.
import { THREE, rng, range, Batches, paint, unitBox, unitCylinder, unitCone, unitSphere, unitTorus, lathe, trs, movers, shape } from "../kit/core.mjs?v=dev";
import { createTitanTerrain } from "../../../titan-terrain.mjs?v=dev";
import { createArrivalHardware } from "../../../arrival-hardware.mjs?v=dev";
import { edlStateAt } from "../../../edl.mjs?v=dev";
import { droneModels, dragonflyTemplate } from "../../models.mjs?v=dev";

const SWARM_CYAN = 0x7ce7ff;
const DRAGONFLY_SCALE = 1; // true size here (3.85 m), next to true-scale pads and domes
const PODS = [{ x: 46, z: 10, phase: 0 }, { x: -38, z: 30, phase: 9 }, { x: 8, z: -52, phase: 17 }];
const POD_CYCLE = 26;

export async function build({ scene, renderer, camera, quality }) {
  const high = quality !== "low";
  const random = rng(4501);
  const group = new THREE.Group();
  group.name = "Titan Hive outpost";
  const animations = [], nightLights = [];

  // ---- The simulator's Titan: terrain, rocks, haze and sky ----
  const terrain = createTitanTerrain(scene, renderer);
  terrain.setDaylight(1);
  terrain.update(0, 0);
  terrain.group.traverse((part) => { if (part.name === "survey-marker" || part.name.startsWith("site-")) part.visible = false; });
  terrain.group.traverse((part) => { if (part.isMesh) part.userData.damageProtected = true; });
  const ground = (x, z) => terrain.heightAt(x, z);
  for (const light of scene.children) {
    if (light.isHemisphereLight) { light.color.set(0xe3a65e); light.groundColor.set(0x4d3522); light.intensity = 2.3; }
    if (light.isDirectionalLight && light.castShadow) { light.color.set(0xffc98c); light.intensity = 1.2; }
  }

  const parts = new Batches(group);
  const hull = paint(0x2a3036, { metal: 0.6, rough: 0.4 }), plate = paint(0x8f979c, { metal: 0.55, rough: 0.45 });
  const cyan = paint(SWARM_CYAN, { glow: 0.9 });
  nightLights.push({ material: cyan, day: 0.9, night: 2.6 });

  // ---- The Hive spire with turning halos ----
  const base = ground(0, 0);
  parts.add(unitCylinder(6), hull, trs(0, base - 1, 0, 0, 9, 4, 9));
  parts.add(shape("hive-spire", () => new THREE.ConeGeometry(1, 1, 6, 1).translate(0, 0.5, 0)), hull, trs(0, base + 3, 0, 0, 6, 34, 6));
  for (let k = 0; k < 6; k += 1) parts.add(unitBox(), plate, trs(Math.cos(k * Math.PI / 3) * 6.5, base, Math.sin(k * Math.PI / 3) * 6.5, -k * Math.PI / 3, 1.2, 14, 3, 0.18, 0));
  const halos = [];
  for (const [y, r] of [[22, 7], [28, 5], [33, 3.2]]) {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(r, 0.35, 8, 48), cyan);
    halo.position.set(0, base + y, 0);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
    halos.push(halo);
  }
  animations.push((time) => halos.forEach((halo, k) => { halo.rotation.z = time * (0.4 + k * 0.25) * (k % 2 ? -1 : 1); halo.rotation.x = Math.PI / 2 + Math.sin(time * 0.5 + k) * 0.08; }));

  // ---- Landing pads, each with a marked ring ----
  const padTop = paint(0x3a3f44, { metal: 0.3, rough: 0.7 });
  for (const pod of PODS) {
    const y = ground(pod.x, pod.z);
    parts.add(unitCylinder(32), padTop, trs(pod.x, y - 0.6, pod.z, 0, 9, 1, 9));
    parts.add(unitTorus(0.04, 48), cyan, trs(pod.x, y + 0.45, pod.z, 0, 7.5, 2, 7.5));
    for (let k = 0; k < 4; k += 1) parts.add(unitBox(), paint(0xd9a640, { glow: 0.4 }), trs(pod.x + Math.cos(k * Math.PI / 2) * 8.5, y + 0.4, pod.z + Math.sin(k * Math.PI / 2) * 8.5, -k * Math.PI / 2, 0.6, 0.3, 2.5));
  }

  // ---- Habitat domes joined by tunnels, with lit interiors ----
  const glass = new THREE.MeshStandardMaterial({ color: 0xbfe6f0, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.38, depthWrite: false });
  const warm = paint(0xffcf86, { glow: 0.6 });
  nightLights.push({ material: warm, day: 0.6, night: 2.2 });
  const domes = [[-22, -18, 9], [-36, -2, 7], [-14, -36, 6]];
  for (const [x, z, r] of domes) {
    const y = ground(x, z);
    parts.add(unitCylinder(32), plate, trs(x, y - 0.5, z, 0, r + 0.6, 1.4, r + 0.6));
    const dome = new THREE.Mesh(shape("dome", () => new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)), glass);
    dome.position.set(x, y + 0.9, z);
    dome.scale.setScalar(r);
    group.add(dome);
    for (let k = 0; k < 5; k += 1) parts.add(unitBox(), k % 2 ? warm : plate, trs(x + range(random, -0.5, 0.5) * r, y + 0.9, z + range(random, -0.5, 0.5) * r, random() * 3, range(random, 1, 2.5), range(random, 1.5, r * 0.5), range(random, 1, 2.5)));
  }
  for (const [a, b] of [[0, 1], [0, 2]]) {
    const [x1, z1] = domes[a], [x2, z2] = domes[b], length = Math.hypot(x2 - x1, z2 - z1);
    parts.add(shape("tunnel", () => new THREE.CylinderGeometry(1.4, 1.4, 1, 12).rotateX(Math.PI / 2)), plate,
      trs((x1 + x2) / 2, ground((x1 + x2) / 2, (z1 + z2) / 2) + 1.2, (z1 + z2) / 2, Math.atan2(x2 - x1, z2 - z1), 1, 1, length));
  }

  // ---- Fabricator sheds and a relay dish ----
  for (const [x, z, ry] of [[26, -28, 0.4], [34, -14, 0.4], [-6, 40, -0.3]]) {
    const y = ground(x, z);
    parts.add(unitBox(), plate, trs(x, y - 0.3, z, ry, 10, 5.5, 16));
    for (let k = 0; k < 5; k += 1) parts.add(shape("shed-rib", () => new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2)), hull, trs(x + Math.sin(ry) * (k * 3.4 - 6.8), y + 5.1, z + Math.cos(ry) * (k * 3.4 - 6.8), ry, 1.2, 10.4, 5.2));
    parts.add(unitBox(), cyan, trs(x + Math.cos(ry) * 5.05, y + 1, z - Math.sin(ry) * 5.05, ry, 0.1, 0.4, 12));
  }
  const dishY = ground(-30, 24);
  parts.add(unitCylinder(12), hull, trs(-30, dishY, 24, 0, 0.8, 7, 0.8));
  parts.add(lathe("relay-dish", [[0.02, 0], [0.5, 0.06], [0.85, 0.18], [1, 0.3]], 32), plate, trs(-30, dishY + 7, 24, -0.6, 4.5, 4.5, 4.5, -0.8, 0));
  parts.finish();

  // ---- NASA's Dragonfly: one parked by the domes, one flying a slow circuit ----
  const dragonflyBase = dragonflyTemplate();
  dragonflyBase.traverse((part) => { if (part.isMesh && part.material.transparent) part.material.opacity = 0.3; });
  const parked = dragonflyBase.clone();
  parked.position.set(14, ground(14, 16) + 0.86 * DRAGONFLY_SCALE, 16);
  parked.rotation.y = 2.3;
  parked.scale.setScalar(DRAGONFLY_SCALE);
  group.add(parked);
  const flying = dragonflyBase.clone();
  flying.scale.setScalar(DRAGONFLY_SCALE);
  const rotors = [];
  flying.traverse((part) => { if (part.userData.spin) rotors.push(part); });
  group.add(flying);
  animations.push((time) => {
    const a = time * 0.06;
    const x = Math.cos(a) * 70, z = Math.sin(a) * 55;
    flying.position.set(x, ground(x, z) + 22 + Math.sin(time * 0.7) * 2, z);
    flying.rotation.set(-0.06, -a + Math.PI, Math.sin(time * 0.5) * 0.05);
    for (const rotor of rotors) rotor.rotation.y += rotor.userData.spin * 0.7;
  });

  // ---- Swarm squads hovering around the Hive (the game's drone models) ----
  const models = droneModels();
  const dronePaint = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.45, roughness: 0.45 });
  const squads = [
    { type: "scout", count: high ? 12 : 6, cx: 0, cz: 0, radius: 26, height: 14, speed: 0.22 },
    { type: "striker", count: high ? 6 : 3, cx: 30, cz: 30, radius: 14, height: 20, speed: -0.15 },
    { type: "link", count: high ? 5 : 3, cx: -28, cz: -10, radius: 12, height: 11, speed: 0.12 },
    { type: "breacher", count: high ? 3 : 2, cx: 10, cz: -40, radius: 9, height: 16, speed: -0.1 },
  ];
  let drones = 0;
  for (const squad of squads) {
    const model = models[squad.type];
    const place = (i, time, o) => {
      const a = time * squad.speed + i / squad.count * Math.PI * 2, x = squad.cx + Math.cos(a) * squad.radius, z = squad.cz + Math.sin(a) * squad.radius;
      o.position.set(x, ground(x, z) + squad.height + Math.sin(time * 1.6 + i) * 0.8, z);
      o.rotation.set(0.12, -a + (squad.speed > 0 ? 0 : Math.PI), 0, "YXZ");
      o.scale.setScalar(model.scale * 0.55);
    };
    animations.push(movers(group, model.body, dronePaint, squad.count, place));
    animations.push(movers(group, model.glow, cyan, squad.count, place));
    drones += squad.count;
  }

  // ---- Drop pods: the simulator's aeroshell and parachutes, landing on the pads in turn ----
  const upAxis = new THREE.Vector3(0, 1, 0);
  const podScout = models.scout;
  const pods = PODS.map((pad) => {
    const craft = new THREE.Group();
    for (let k = 0; k < 6; k += 1) {
      const drone = new THREE.Mesh(podScout.body, dronePaint);
      drone.scale.setScalar(0.5);
      drone.position.set(Math.cos(k) * 0.9, (k % 2) * 0.3 - 0.2, Math.sin(k) * 0.9);
      craft.add(drone);
    }
    scene.add(craft);
    return { pad, craft, hardware: createArrivalHardware(scene, craft, upAxis) };
  });
  animations.push((time) => {
    for (const { pad, craft, hardware } of pods) {
      const t = (time + pad.phase) % POD_CYCLE, landing = 14;
      if (t > landing + 6) { hardware.pose(null); craft.visible = false; continue; }
      const u = Math.min(1, t / landing);
      // Start under the main parachute (edl t = 17) and release the swarm just above the pad.
      const edlT = t <= landing ? 17 + u * 24 : 41 + (t - landing) * 1.5;
      const altitude = t <= landing ? 4 + 360 * (1 - u) ** 2 : 4;
      craft.position.set(pad.x, ground(pad.x, pad.z) + altitude + 0.9, pad.z);
      craft.rotation.y = t * 0.2;
      hardware.pose({ ...edlStateAt(edlT), altitudeM: altitude, renderAltitudeM: altitude, speedCue: 0 }, camera.position);
      if (t > landing) craft.visible = false;
    }
  });

  return {
    group,
    target: new THREE.Vector3(0, base + 8, 0),
    moving: [],
    noDamage: true,
    status: `simulator terrain · ${drones} drones in 4 squads · 2 Dragonflies · ${PODS.length} pads with pods landing`,
    tour: { radius: 150, height: base + 70, swing: 30 },
    bounds: 3000, floor: base - 5, ceiling: 2000,
    animate(time) { for (const step of animations) step(time); },
    setDusk(on, { sun, hemi }) {
      for (const light of nightLights) light.material.emissiveIntensity = on ? light.night : light.day;
      terrain.setDaylight(on ? 0.15 : 1);
      hemi.intensity = on ? 0.5 : 2.3;
      sun.intensity = on ? 0.05 : 1.2;
    },
  };
}
