// Asteroid colony (Claude, October 2026): a cratered asteroid wrapped in a habitat ring, with
// mining derricks and conveyors on its surface, a refinery, a drifting debris field, ore
// haulers and Swarmfall's own Scout drones working the rigs. Original procedural art [EST];
// the Scout model is the game's (models.mjs).
import { THREE, rng, pick, range, fbm, noise, Batches, paint, unitBox, unitCylinder, unitCone, unitSphere, unitTorus, trs, movers, shape } from "../kit/core.mjs?v=dev";
import { stars, planet } from "../kit/scenery.mjs?v=dev";
import { droneModels } from "../../models.mjs?v=dev";

const ROCK = new THREE.Vector3(0, 300, 0), ROCK_RADIUS = 240;

function glowTexture() {
  const element = document.createElement("canvas");
  element.width = element.height = 128;
  const ctx = element.getContext("2d"), g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,0.6)"); g.addColorStop(0.45, "rgba(255,255,255,0.15)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const map = new THREE.CanvasTexture(element);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

// A lumpy, cratered rock: an icosphere pushed in and out by noise, with bowl-shaped craters.
function asteroidGeometry(radius, detail, seed, craterCount) {
  const random = rng(seed);
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  const position = geometry.attributes.position, v = new THREE.Vector3();
  const craters = Array.from({ length: craterCount }, () => ({ dir: new THREE.Vector3(range(random, -1, 1), range(random, -1, 1), range(random, -1, 1)).normalize(), size: range(random, 0.08, 0.3), depth: range(random, 0.03, 0.09) }));
  const colors = new Float32Array(position.count * 3), dark = new THREE.Color("#3b342f"), light = new THREE.Color("#8a7d70"), c = new THREE.Color();
  for (let i = 0; i < position.count; i += 1) {
    v.fromBufferAttribute(position, i).normalize();
    let r = 1 + 0.28 * (fbm(v.x * 2 + seed, v.z * 2 + v.y, seed) - 0.5) + 0.08 * (noise(v.x * 9, v.y * 9 + v.z * 3, seed + 3) - 0.5);
    let shade = 0.5 + (fbm(v.x * 6, v.y * 6 + v.z, seed + 9) - 0.5);
    for (const crater of craters) {
      const d = v.angleTo(crater.dir) / crater.size;
      if (d < 1.25) {
        r -= crater.depth * Math.max(0, 1 - d * d) - (d > 0.85 ? crater.depth * 0.4 * Math.sin((d - 0.85) / 0.4 * Math.PI) : 0);
        shade -= 0.2 * Math.max(0, 1 - d);
      }
    }
    position.setXYZ(i, v.x * radius * r, v.y * radius * r, v.z * radius * r);
    c.copy(dark).lerp(light, Math.max(0, Math.min(1, shade)));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export async function build({ scene, quality }) {
  const high = quality !== "low";
  const random = rng(5520);
  const group = new THREE.Group();
  group.name = "Asteroid colony";
  const animations = [], nightLights = [];
  scene.fog.density = 0;
  for (const light of scene.children) if (light.isHemisphereLight) { light.color.set(0x9a86c8); light.groundColor.set(0x1a1222); light.intensity = 1; }

  // ---- Sky: stars, a violet nebula and a distant ringed world ----
  stars(group, { count: high ? 5000 : 2500, radius: 9500, size: 7, seed: 12 });
  const glow = glowTexture();
  for (const [x, y, z, size, color, opacity] of [[-5000, 2500, -6000, 11000, 0x6a2a9a, 0.55], [-2000, -1500, -7000, 8000, 0xb03a7a, 0.4], [3000, 3500, -5000, 7000, 0x2a5aa0, 0.45], [6000, 500, 3000, 6000, 0x8a3a8a, 0.35]]) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, opacity, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    sprite.position.set(x, y, z);
    sprite.scale.set(size, size, 1);
    group.add(sprite);
  }
  planet(group, { radius: 900, position: new THREE.Vector3(5200, 1800, -6400), colors: ["#5a7fb0", "#7fa3cf", "#3f5f8a", "#a9c3df"], bands: 12, ring: { inner: 1.4, outer: 2.2, color: "200,210,230" }, seed: 63, tilt: -0.3 });

  // ---- The asteroid ----
  const rock = new THREE.Mesh(asteroidGeometry(ROCK_RADIUS, high ? 7 : 5, 41, 26), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  rock.position.copy(ROCK);
  rock.castShadow = rock.receiveShadow = true;
  group.add(rock);
  // The hangar mouth: a lit bore into the rock facing the camera side.
  const bore = new THREE.Group();
  bore.position.copy(ROCK).add(new THREE.Vector3(0.62, 0.15, 0.77).normalize().multiplyScalar(ROCK_RADIUS * 0.93));
  bore.lookAt(ROCK.x + 1000 * 0.62, ROCK.y + 1000 * 0.15, ROCK.z + 1000 * 0.77);
  group.add(bore);
  const boreGlow = paint(0xffb35a, { glow: 1.4 });
  nightLights.push({ material: boreGlow, day: 1.4, night: 2.6 });
  bore.add(new THREE.Mesh(new THREE.CircleGeometry(46, 48), paint(0x120d0a)));
  for (let k = 0; k < 4; k += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(48 - k * 6, 1.6, 8, 64), k % 2 ? paint(0x6a6f74, { metal: 0.7 }) : boreGlow);
    ring.position.z = 2 - k * 10;
    bore.add(ring);
  }

  const parts = new Batches(group);
  const metal = paint(0xaab2b8, { metal: 0.75, rough: 0.35 }), dark = paint(0x3c4248, { metal: 0.6, rough: 0.5 }), hull = paint(0xd7d9d4, { metal: 0.3, rough: 0.5 });
  const windowGlow = paint(0xffd796, { glow: 0.5 });
  nightLights.push({ material: windowGlow, day: 0.5, night: 2.2 });

  // ---- Habitat ring: a truss around the equator carrying pods, tied to the rock by struts ----
  const ringRadius = ROCK_RADIUS * 1.42;
  parts.add(unitTorus(0.012, 160), metal, trs(ROCK.x, ROCK.y, ROCK.z, 0, ringRadius, ringRadius * 4, ringRadius));
  parts.add(unitTorus(0.012, 160), metal, trs(ROCK.x, ROCK.y + 14, ROCK.z, 0, ringRadius, ringRadius * 4, ringRadius));
  const pods = high ? 36 : 22;
  for (let k = 0; k < pods; k += 1) {
    const a = k / pods * Math.PI * 2, x = ROCK.x + Math.cos(a) * ringRadius, z = ROCK.z + Math.sin(a) * ringRadius;
    const kind = k % 3;
    if (kind === 0) parts.add(shape("pod-capsule", () => new THREE.CapsuleGeometry(9, 26, 6, 16)), hull, trs(x, ROCK.y + 7, z, -a, 1, 1, 1, 0, Math.PI / 2));
    else if (kind === 1) parts.add(unitSphere(20), hull, trs(x, ROCK.y + 7, z, 0, 13));
    else parts.add(unitCylinder(16), hull, trs(x, ROCK.y - 6, z, 0, 10, 26, 10));
    for (let w = 0; w < 5; w += 1) parts.add(unitBox(), windowGlow, trs(x + Math.cos(a) * 9.5, ROCK.y + 3 + w * 2.2, z + Math.sin(a) * 9.5, -a + Math.PI / 2, 6, 0.8, 0.4));
    if (k % 4 === 0) {
      const strut = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      parts.add(unitCylinder(8), dark, trs(ROCK.x + strut.x * ROCK_RADIUS * 0.85, ROCK.y, ROCK.z + strut.z * ROCK_RADIUS * 0.85, -a, 2.2, ringRadius - ROCK_RADIUS * 0.85, 2.2, 0, -Math.PI / 2));
    }
  }

  // ---- Mining rigs on the surface: derricks, drills, ore glow and conveyors ----
  const surface = rock.geometry.attributes.position, normals = rock.geometry.attributes.normal;
  const ore = paint(0xff7a2a, { glow: 1.2 });
  nightLights.push({ material: ore, day: 1.2, night: 2.4 });
  const up = new THREE.Vector3(0, 1, 0), point = new THREE.Vector3(), normal = new THREE.Vector3();
  const rigSites = [];
  for (let k = 0; k < (high ? 22 : 12); k += 1) {
    const index = Math.floor(random() * surface.count);
    point.fromBufferAttribute(surface, index).add(ROCK);
    normal.fromBufferAttribute(normals, index).normalize();
    if (normal.dot(new THREE.Vector3(0.62, 0.15, 0.77)) > 0.9) continue; // keep the hangar clear
    const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
    const at = (x, y, z, sx, sy, sz, yaw = 0) => new THREE.Matrix4().compose(
      point.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(q)), q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(up, yaw)), new THREE.Vector3(sx, sy, sz));
    const h = range(random, 24, 46);
    for (const [dx, dz] of [[-5, -5], [5, -5], [5, 5], [-5, 5]]) parts.add(unitCylinder(6), dark, at(dx, 0, dz, 0.6, h, 0.6));
    for (let y = 8; y < h; y += 9) parts.add(unitBox(), metal, at(0, y, 0, 11, 0.6, 11));
    parts.add(unitCone(12), metal, at(0, h, 0, 5, 9, 5));
    parts.add(unitCylinder(12), ore, at(0, -1, 0, 4, 2, 4));
    parts.add(unitBox(), hull, at(12, 0, 4, 10, 7, 14, 0.3));
    rigSites.push(point.clone().add(normal.clone().multiplyScalar(h + 12)));
  }
  // Conveyors from a few rigs to the hangar.
  const tube = paint(0x8a8f94, { metal: 0.5, rough: 0.5 });
  for (const site of rigSites.slice(0, 6)) {
    const curve = new THREE.CatmullRomCurve3([site, site.clone().lerp(bore.position, 0.5).add(new THREE.Vector3(0, 40, 0)), bore.position.clone()]);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 2.4, 8, false), tube);
    mesh.castShadow = true;
    group.add(mesh);
  }

  // ---- Refinery: tanks, a processing stack and flare towers ----
  const refinery = new THREE.Vector3(820, 420, -520);
  for (let k = 0; k < 6; k += 1) parts.add(unitSphere(20), hull, trs(refinery.x + (k % 3) * 34 - 34, refinery.y + Math.floor(k / 3) * 34, refinery.z, 0, 15));
  parts.add(unitBox(), dark, trs(refinery.x, refinery.y - 40, refinery.z, 0.3, 140, 22, 60));
  for (let k = 0; k < 4; k += 1) {
    parts.add(unitCylinder(12), metal, trs(refinery.x - 50 + k * 30, refinery.y - 20, refinery.z + 40, 0, 4, 90, 4));
    parts.add(unitSphere(10), ore, trs(refinery.x - 50 + k * 30, refinery.y + 72, refinery.z + 40, 0, 4));
  }
  parts.add(unitTorus(0.05, 64), windowGlow, trs(refinery.x, refinery.y + 10, refinery.z, 0, 90, 1, 90));

  // ---- Debris field: hundreds of rocks drifting in a wide band ----
  const debris = new THREE.Group();
  debris.position.copy(ROCK);
  group.add(debris);
  const pebble = shape("debris-rock", () => asteroidGeometry(1, 2, 7, 3));
  const rocks = new Batches(debris, { shadows: false });
  const rockPaint = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true });
  for (let k = 0; k < (high ? 700 : 300); k += 1) {
    const a = random() * Math.PI * 2, r = range(random, 520, 1900), y = range(random, -1, 1) * (60 + r * 0.12);
    const s = range(random, 2, 9) * (random() < 0.06 ? 5 : 1);
    rocks.add(pebble, rockPaint, trs(Math.cos(a) * r, y, Math.sin(a) * r, random() * 6, s * range(random, 0.7, 1.3), s, s * range(random, 0.7, 1.3), random() * 6, random() * 6));
  }
  rocks.finish();
  animations.push((time) => { debris.rotation.y = time * 0.006; });
  parts.finish();

  // ---- Ore haulers between the hangar and the refinery ----
  const hauler = shape("hauler", () => {
    const pieces = [new THREE.BoxGeometry(10, 8, 30), new THREE.BoxGeometry(14, 10, 14).translate(0, 0, -20), new THREE.CylinderGeometry(3, 4, 6, 8).rotateX(Math.PI / 2).translate(0, 0, -30)].map(g => g.toNonIndexed());
    const merged = new THREE.BufferGeometry();
    for (const name of ["position", "normal"]) {
      const arrays = pieces.map(p => p.attributes[name].array);
      const joined = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
      let offset = 0;
      for (const array of arrays) { joined.set(array, offset); offset += array.length; }
      merged.setAttribute(name, new THREE.BufferAttribute(joined, 3));
    }
    return merged;
  });
  const routes = Array.from({ length: high ? 16 : 8 }, () => ({ phase: random(), speed: range(random, 0.02, 0.04), lift: range(random, -60, 60) }));
  const start = bore.position.clone().add(new THREE.Vector3(0.62, 0.15, 0.77).multiplyScalar(60)), mid = new THREE.Vector3(), at = new THREE.Vector3(), next = new THREE.Vector3();
  const pathAt = (u, lift, out) => {
    mid.copy(start).lerp(refinery, 0.5).add(new THREE.Vector3(0, 160 + lift, 120));
    const a = start.clone().lerp(mid, u), b = mid.clone().lerp(refinery, u);
    return out.copy(a).lerp(b, u);
  };
  animations.push(movers(group, hauler, paint(0xd8b25a, { metal: 0.4, rough: 0.45 }), routes.length, (i, time, o) => {
    const route = routes[i], cycle = (route.phase + time * route.speed) % 2, u = cycle < 1 ? cycle : 2 - cycle;
    pathAt(u, route.lift, at);
    pathAt(Math.min(1, Math.max(0, u + (cycle < 1 ? 0.01 : -0.01))), route.lift, next);
    o.position.copy(at);
    o.lookAt(next);
  }));

  // ---- Swarmfall Scouts working the rigs (the game's own drone model) ----
  const scout = droneModels().scout;
  const scoutPaint = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.45, roughness: 0.45 });
  const swarm = rigSites.flatMap((site, s) => Array.from({ length: 4 }, (_, k) => ({ site, s, k, phase: random() * 6 })));
  animations.push(movers(group, scout.body, scoutPaint, swarm.length, (i, time, o) => {
    const d = swarm[i], a = time * 0.6 + d.phase;
    o.position.set(d.site.x + Math.cos(a) * 18, d.site.y + Math.sin(time * 1.3 + d.k) * 4, d.site.z + Math.sin(a) * 18);
    o.rotation.y = -a;
    o.scale.setScalar(scout.scale * 1.4);
  }));

  return {
    group,
    target: ROCK.clone(),
    moving: [],
    noDamage: true,
    status: `${pods} habitat pods · ${rigSites.length} mining rigs · ${routes.length} haulers · ${swarm.length} Scout drones`,
    tour: { radius: 1500, height: 600, swing: 300 },
    bounds: 6000, floor: -3000, ceiling: 6000,
    animate(time) { for (const step of animations) step(time); },
    setDusk(on, { sun }) {
      for (const light of nightLights) light.material.emissiveIntensity = on ? light.night : light.day;
      sun.intensity = on ? 0.45 : 3.2;
    },
  };
}
