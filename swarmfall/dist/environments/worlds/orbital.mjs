// Orbital ring (Claude, October 2026): a habitat wheel 1.6 km across, standing on edge so the
// Street view stands on its inner floor at the lowest point and sees the land curve up ahead.
// Fields, lakes, towns and wall cities line the floor; a docking hub, spokes, solar wings and
// ship traffic sit at the center, over a banded gas giant. All original procedural art [EST].
import { THREE, rng, pick, range, fbm, Batches, paint, unitBox, unitCylinder, unitCone, unitSphere, unitTorus, trs, movers, shape } from "../kit/core.mjs?v=dev";
import { facadeMaterials, stars, planet } from "../kit/scenery.mjs?v=dev";

const CENTER_Y = 900, RADIUS = 800, WIDTH = 220; // the wheel turns about the x axis

// Point on the inner floor at angle a (0 = the bottom) and across-position x, with "up" toward
// the axis. Buildings use this frame so they stand on the curved floor.
function floorMatrix(a, x, lift = 0, yaw = 0, sx = 1, sy = 1, sz = 1) {
  const r = RADIUS - lift;
  // Local to the wheel group, which already sits at CENTER_Y.
  const position = new THREE.Vector3(x, -r * Math.cos(a), r * Math.sin(a));
  const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-a, 0, 0)).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw));
  return new THREE.Matrix4().compose(position, rotation, new THREE.Vector3(sx, sy, sz));
}

function canvasTexture(width, height, draw, repeat = [1, 1]) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  draw(element.getContext("2d"), width, height);
  const map = new THREE.CanvasTexture(element);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(...repeat);
  map.anisotropy = 4;
  return map;
}

export async function build({ scene, quality }) {
  const high = quality !== "low";
  const random = rng(77031);
  const group = new THREE.Group();
  group.name = "Orbital ring";
  const wheel = new THREE.Group();
  wheel.position.y = CENTER_Y;
  group.add(wheel);
  const animations = [];
  const nightLights = [];
  // Space: no haze, a dim fill light and a strong sun from the lab's sun direction.
  scene.fog.density = 0;
  for (const light of scene.children) if (light.isHemisphereLight) { light.color.set(0x8fa4c8); light.groundColor.set(0x1a1410); light.intensity = 0.9; }

  // ---- Sky: stars, nebula glows, the gas giant and a moon ----
  stars(group, { count: high ? 5000 : 2500, radius: 9500, size: 7, seed: 5 });
  stars(group, { count: 700, radius: 9400, size: 12, seed: 6, color: 0xffd9b0 });
  const glow = canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,0.55)"); g.addColorStop(0.4, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  for (const [x, y, z, size, color] of [[-6000, 4000, -5000, 9000, 0x4a2a7a], [5000, 2500, -6500, 7000, 0x1f4a7a], [7000, -1500, 2500, 6000, 0x6a2a4a]]) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, opacity: 0.5, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    sprite.position.set(x, y, z);
    sprite.scale.set(size, size, 1);
    group.add(sprite);
  }
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xfff1d8, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  sunGlow.position.set(4500, 8100, 2700);
  sunGlow.scale.set(2600, 2600, 1);
  group.add(sunGlow);
  planet(group, { radius: 3200, position: new THREE.Vector3(-4200, -2400, -5200), colors: ["#c99a6b", "#e8cfa3", "#a8744b", "#f3e3c4", "#b98a5c"], bands: 22, ring: { inner: 1.25, outer: 1.8 }, seed: 41, tilt: 0.35 });
  planet(group, { radius: 260, position: new THREE.Vector3(3800, 2600, -4600), colors: ["#9aa0a6", "#b8bdc2", "#7f858a"], bands: 3, seed: 9, tilt: 0.1 });

  // ---- The wheel: inner floor, outer hull, rim walls ----
  const floorTexture = canvasTexture(2048, 256, (ctx, w, h) => {
    ctx.fillStyle = "#5f8a4a";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 380; i += 1) {
      const x = random() * w, y = random() * h, fw = 20 + random() * 70, fh = 10 + random() * 40;
      ctx.fillStyle = pick(random, ["#6f9a4e", "#7fa356", "#8f9f52", "#5a7f45", "#a39a5a", "#4f7a3f"]);
      ctx.fillRect(x, y, fw, fh);
    }
    ctx.strokeStyle = "#3d6f86"; ctx.lineWidth = 10;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) ctx.lineTo(x, h / 2 + Math.sin(x / 90) * h * 0.25 + Math.sin(x / 31) * 8);
    ctx.stroke();
    for (let i = 0; i < 9; i += 1) {
      ctx.fillStyle = "#3f7a90";
      ctx.beginPath(); ctx.ellipse(random() * w, random() * h, 30 + random() * 60, 12 + random() * 25, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#a6a39a";
    for (const y of [h * 0.18, h * 0.82]) ctx.fillRect(0, y - 3, w, 6);
    for (let x = 0; x < w; x += 170) ctx.fillRect(x, 0, 5, h);
  }, [4, 1]);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS, RADIUS, WIDTH, 256, 1, true).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.95, side: THREE.BackSide }));
  floor.receiveShadow = true;
  wheel.add(floor);
  const hullTexture = canvasTexture(512, 64, (ctx, w, h) => {
    ctx.fillStyle = "#8f979c"; ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) for (let y = 0; y < h; y += 16) {
      ctx.fillStyle = `rgba(${random() < 0.5 ? "30,35,40" : "220,225,230"},${random() * 0.25})`;
      ctx.fillRect(x + 1, y + 1, 30, 14);
    }
    ctx.fillStyle = "#c9b27a"; ctx.fillRect(0, h / 2 - 2, w, 4);
  }, [24, 2]);
  const hullMaterial = new THREE.MeshStandardMaterial({ map: hullTexture, metalness: 0.6, roughness: 0.45 });
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(RADIUS + 26, RADIUS + 26, WIDTH + 20, 256, 1, true).rotateZ(Math.PI / 2), hullMaterial));
  const rimMaterial = new THREE.MeshStandardMaterial({ map: hullTexture, metalness: 0.6, roughness: 0.45, side: THREE.DoubleSide });
  for (const side of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.RingGeometry(RADIUS - 70, RADIUS + 26, 256, 1).rotateY(Math.PI / 2), rimMaterial);
    rim.position.x = side * (WIDTH / 2 + 10);
    wheel.add(rim);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(RADIUS - 70, 4, 8, 256).rotateY(Math.PI / 2), paint(0xd8c690, { metal: 0.7, rough: 0.3 }));
    edge.position.x = side * (WIDTH / 2 + 10);
    wheel.add(edge);
  }
  // Glowing window bands along the rims' inner faces: the wall cities.
  const wallCity = facadeMaterials("teal", 2).day.clone();
  wallCity.side = THREE.DoubleSide;
  nightLights.push({ material: wallCity, day: 0.25, night: 1.2 });
  for (const side of [-1, 1]) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS - 4, RADIUS - 66, 1, 256, 1, true), wallCity);
    band.geometry.rotateZ(Math.PI / 2);
    band.position.x = side * (WIDTH / 2 + 4);
    band.scale.set(1, 1, 1);
    wheel.add(band);
  }

  // ---- Towns on the floor: houses, towers and parks in clusters around the wheel ----
  const batches = new Batches(wheel, { shadows: false });
  const styles = ["residential", "office", "glass", "brick", "teal"].map((style, i) => facadeMaterials(style, 1 + (i % 3)).day);
  for (const material of styles) nightLights.push({ material, day: 0, night: 0.7 });
  const towns = high ? 14 : 8;
  let buildings = 0;
  for (let t = 0; t < towns; t += 1) {
    const center = t / towns * Math.PI * 2 + range(random, -0.1, 0.1), spread = range(random, 0.05, 0.11);
    const density = high ? 120 : 60;
    for (let k = 0; k < density; k += 1) {
      const a = center + range(random, -1, 1) * spread, x = range(random, -0.42, 0.42) * WIDTH;
      const core = 1 - Math.abs(a - center) / spread;
      const h = range(random, 6, 18) + core * core * range(random, 0, 70);
      const w = range(random, 8, 16);
      batches.add(unitBox(), pick(random, styles), floorMatrix(a, x, 0, Math.floor(random() * 4) * Math.PI / 2, w, h, range(random, 8, 16)));
      buildings += 1;
    }
    // A landmark spire in each town.
    batches.add(unitCylinder(16), styles[2], floorMatrix(center, range(random, -0.2, 0.2) * WIDTH, 0, 0, 7, range(random, 80, 140), 7));
  }
  const leaf = paint(0x4f7f45, { rough: 0.9, flat: true }), trunk = paint(0x5a4433);
  for (let k = 0; k < (high ? 1800 : 700); k += 1) {
    const a = random() * Math.PI * 2, x = range(random, -0.46, 0.46) * WIDTH, s = range(random, 3, 7);
    batches.add(unitCylinder(6), trunk, floorMatrix(a, x, 0, 0, 0.3, s, 0.3));
    batches.add(shape("orbital-leaf", () => new THREE.IcosahedronGeometry(1, 0)), leaf, floorMatrix(a, x, s, random() * 6, s * 0.5, s * 0.6, s * 0.5));
  }
  batches.finish();

  // ---- Hub, spokes and solar wings at the center ----
  const hub = new THREE.Group();
  hub.position.y = CENTER_Y;
  group.add(hub);
  const hubParts = new Batches(hub);
  const metal = paint(0xb7bec4, { metal: 0.75, rough: 0.35 }), dark = paint(0x3a4148, { metal: 0.6, rough: 0.5 }), gold = paint(0xd2b46a, { metal: 0.8, rough: 0.3 });
  const signal = paint(0x7ce7ff, { glow: 0.6 });
  nightLights.push({ material: signal, day: 0.6, night: 2.5 });
  hubParts.add(unitCylinder(48), metal, trs(-170, 0, 0, 0, 70, 340, 70, 0, -Math.PI / 2));
  for (const x of [-150, -60, 60, 150]) hubParts.add(unitTorus(0.18, 64), gold, trs(x, 0, 0, 0, 78, 78, 78, 0, Math.PI / 2));
  for (const side of [-1, 1]) {
    hubParts.add(unitCone(32), dark, trs(side * 170, 0, 0, 0, 52, 40, 52, 0, -side * Math.PI / 2));
    hubParts.add(unitTorus(0.08, 48), signal, trs(side * 212, 0, 0, 0, 26, 26, 26, 0, Math.PI / 2));
    // Solar wings: lattice spars and dark-blue panels reaching out along the axis.
    for (const spin of [0, Math.PI / 2]) {
      for (let k = 0; k < 6; k += 1) {
        const x = side * (300 + k * 120);
        hubParts.add(unitBox(), dark, trs(x, 0, 0, 0, 110, 3, 3, spin, 0));
        for (const off of [-1, 1]) hubParts.add(unitBox(), paint(0x1f3d7a, { metal: 0.6, rough: 0.25 }), trs(x, 0, 0, 0, 104, 1, 70, spin, 0).multiply(new THREE.Matrix4().makeTranslation(0, 0, off * 45)));
      }
    }
  }
  for (let k = 0; k < 6; k += 1) {
    const a = k / 6 * Math.PI * 2;
    const spoke = new THREE.Mesh(shape("spoke", () => new THREE.CylinderGeometry(9, 9, 1, 16).translate(0, 0.5, 0)), metal);
    spoke.scale.set(1, RADIUS - 70, 1);
    spoke.rotation.x = a;
    hub.add(spoke);
    for (let r = 160; r < RADIUS - 80; r += 120) hubParts.add(unitTorus(0.15, 24), gold, trs(0, Math.cos(a) * r, Math.sin(a) * r, 0, 14, 14, 14, a, 0));
  }
  hubParts.finish();

  // ---- Ships: shuttles flying in to the docks and out again, and a parked freighter ----
  const ship = shape("shuttle", () => {
    const parts = [
      new THREE.CylinderGeometry(3, 4.5, 26, 10).rotateX(Math.PI / 2),
      new THREE.ConeGeometry(3, 8, 10).rotateX(Math.PI / 2).translate(0, 0, 17),
      new THREE.BoxGeometry(22, 1.2, 8).translate(0, 0, -4),
      new THREE.BoxGeometry(1, 7, 6).translate(0, 3.5, -10),
    ].map(g => g.toNonIndexed());
    const merged = new THREE.BufferGeometry();
    for (const name of ["position", "normal"]) {
      const arrays = parts.map(p => p.attributes[name].array);
      const joined = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
      let offset = 0;
      for (const array of arrays) { joined.set(array, offset); offset += array.length; }
      merged.setAttribute(name, new THREE.BufferAttribute(joined, 3));
    }
    return merged;
  });
  const flights = Array.from({ length: high ? 40 : 18 }, () => {
    const side = random() < 0.5 ? -1 : 1;
    return { side, from: new THREE.Vector3(side * range(random, 1800, 3200), CENTER_Y + range(random, -1400, 1400), range(random, -2600, 2600)), speed: range(random, 0.012, 0.03), phase: random(), lane: range(random, -18, 18) };
  });
  const from = new THREE.Vector3(), to = new THREE.Vector3(), at = new THREE.Vector3(), ahead = new THREE.Vector3();
  const traffic = movers(group, ship, paint(0xe9edf0, { metal: 0.5, rough: 0.35 }), flights.length, (i, time, o) => {
    const f = flights[i];
    const cycle = (f.phase + time * f.speed) % 2, inbound = cycle < 1, u = inbound ? cycle : cycle - 1;
    const ease = u * u * (3 - 2 * u);
    to.set(f.side * 225, CENTER_Y + f.lane, f.lane * 0.6);
    from.copy(f.from);
    if (inbound) at.lerpVectors(from, to, ease); else at.lerpVectors(to, from, ease);
    ahead.copy(inbound ? to : from).sub(at).normalize();
    o.position.copy(at);
    o.lookAt(at.x + ahead.x, at.y + ahead.y, at.z + ahead.z);
  });
  animations.push(traffic);
  const engine = paint(0x9fd8ff, { glow: 2.5 });
  const freighter = new Batches(group);
  freighter.add(unitBox(), dark, trs(-480, CENTER_Y + 260, 120, 0.4, 60, 30, 260));
  for (let k = 0; k < 5; k += 1) freighter.add(unitBox(), pick(random, [paint(0xb3412f), paint(0x2f5f9e), paint(0xd29b2e)]), trs(-480, CENTER_Y + 290, 120 - 100 + k * 45, 0.4, 50, 22, 36));
  freighter.add(unitCylinder(16), engine, trs(-480 - Math.sin(0.4) * 132, CENTER_Y + 275, 120 - Math.cos(0.4) * 132, 0, 10, 4, 10, Math.PI / 2, 0));
  freighter.finish();

  // ---- Motion: the wheel turns slowly; window lights for the dark side ----
  animations.push((time) => { wheel.rotation.x = time * 0.004; });
  return {
    group,
    target: new THREE.Vector3(0, CENTER_Y, 0),
    moving: [],
    noDamage: true,
    status: `${buildings} buildings in ${towns} towns on the ring floor · ${flights.length} ships`,
    tour: { radius: 3000, height: CENTER_Y + 600, swing: 500 },
    bounds: 6000, floor: -3000, ceiling: 6000,
    animate(time) { for (const step of animations) step(time); },
    setDusk(on, { sun }) {
      for (const light of nightLights) light.material.emissiveIntensity = on ? light.night : light.day;
      sun.intensity = on ? 0.5 : 3.2;
    },
  };
}
