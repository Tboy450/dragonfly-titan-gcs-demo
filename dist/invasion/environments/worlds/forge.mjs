// Forge city (Claude, October 2026): an industrial city on basalt terraces cut by flowing lava,
// with foundries, smoke stacks, cooling towers, blast furnaces, bridges, ore trains, smoke and
// embers, under volcanoes. A setting for Swarmfall's volcanic Ashfall. Original procedural art [EST].
import { THREE, rng, pick, range, fbm, noise, smooth, Batches, Massing, paint, unitBox, unitCylinder, unitCone, lathe, trs, movers, shape } from "../kit/core.mjs?v=dev";
import { facadeMaterials, roofMaterial, horizonMountains } from "../kit/scenery.mjs?v=dev";

// Lava channels wind through the city; terraces step up away from them.
const lavaDistance = (x, z) => Math.min(Math.abs(z - 160 * Math.sin(x / 260) - 40), Math.abs(x + 120 * Math.sin(z / 300) - 250));
function heightAt(x, z) {
  const terrace = Math.floor((6 + 30 * fbm(x / 500, z / 500, 8)) / 6) * 6;
  const channel = smooth(14, 60, lavaDistance(x, z));
  return terrace * channel - 6 * (1 - channel);
}

function canvasTexture(draw, size = 256) {
  const element = document.createElement("canvas");
  element.width = element.height = size;
  draw(element.getContext("2d"), size);
  const map = new THREE.CanvasTexture(element);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  return map;
}

export async function build({ scene, quality }) {
  const high = quality !== "low";
  const random = rng(6066);
  const group = new THREE.Group();
  group.name = "Forge city";
  const animations = [], nightLights = [];
  for (const light of scene.children) if (light.isHemisphereLight) { light.color.set(0xd08a6a); light.groundColor.set(0x2a1410); light.intensity = 1.6; }

  // ---- Basalt ground with lava below the channel banks ----
  const segments = high ? 240 : 150, size = 3200;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments).rotateX(-Math.PI / 2);
  const position = geometry.attributes.position, colors = new Float32Array(position.count * 3), c = new THREE.Color();
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i), z = position.getZ(i), y = heightAt(x, z);
    position.setY(i, y);
    c.set("#2e2724").offsetHSL(0, 0, (noise(x / 25, z / 25, 3) - 0.5) * 0.08);
    const heat = 1 - smooth(10, 70, lavaDistance(x, z));
    c.lerp(new THREE.Color("#5a2a18"), heat * 0.8);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const ground = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  ground.receiveShadow = true;
  ground.userData.damageProtected = true;
  group.add(ground);
  const lavaMap = canvasTexture((ctx, s) => {
    ctx.fillStyle = "#ff5a1a"; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i += 1) {
      ctx.fillStyle = `rgba(${random() < 0.5 ? "255,220,120" : "120,20,0"},${0.2 + random() * 0.4})`;
      ctx.beginPath(); ctx.ellipse(random() * s, random() * s, 6 + random() * 30, 3 + random() * 10, random() * 3, 0, Math.PI * 2); ctx.fill();
    }
  });
  lavaMap.repeat.set(24, 24);
  const lava = new THREE.Mesh(new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: lavaMap, toneMapped: false }));
  lava.position.y = -3;
  lava.userData.damageProtected = true;
  group.add(lava);
  animations.push((time) => { lavaMap.offset.set(time * 0.01, time * 0.004); });
  horizonMountains(group, { inner: 1500, outer: 5200, height: 1100, seed: 77, low: "#2a2220", high: "#5a4a44", snow: 2, y: -6 });
  const volcanoGlow = paint(0xff6a20, { glow: 2 });
  for (const [x, z, h] of [[-2600, -2900, 1500], [2900, -2300, 1200], [600, -3600, 1700]]) {
    const cone = lathe("volcano", [[1, 0], [0.55, 0.55], [0.22, 0.97], [0.16, 1]], 48);
    const mountain = new THREE.Mesh(cone, paint(0x2b2220, { rough: 1, flat: true }));
    mountain.position.set(x, -10, z);
    mountain.scale.set(h * 1.1, h, h * 1.1);
    const crater = new THREE.Mesh(shape("crater", () => new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2)), volcanoGlow);
    crater.position.set(x, h * 0.99 - 10, z);
    crater.scale.set(h * 0.17, 1, h * 0.17);
    group.add(mountain, crater);
  }

  // ---- Industry: foundries, stacks, furnaces and cooling towers on the terraces ----
  const massing = new Massing();
  const parts = new Batches(group);
  const steel = paint(0x4a4f54, { metal: 0.7, rough: 0.45 }), rust = paint(0x7a3f26, { metal: 0.4, rough: 0.7 }), soot = paint(0x2a2624, { rough: 0.9 });
  const furnaceGlow = paint(0xff8a3a, { glow: 1.4 });
  nightLights.push({ material: furnaceGlow, day: 1.4, night: 2.8 });
  const stacks = [];
  let buildings = 0;
  for (let gx = -1100; gx <= 1100; gx += 70) for (let gz = -1100; gz <= 900; gz += 70) {
    const x = gx + range(random, -15, 15), z = gz + range(random, -15, 15);
    if (lavaDistance(x, z) < 70 || random() < 0.25) continue;
    const y = heightAt(x, z), d = Math.hypot(x, z), kind = random();
    if (kind < 0.5) {
      const w = range(random, 26, 50), dd = range(random, 30, 60), h = range(random, 12, 30) * (1.3 - smooth(0, 1100, d) * 0.6);
      massing.box(`${pick(random, ["concrete", "brick", "deco"])}/${1 + Math.floor(random() * 3)}`, "roof", x, y, z, w, h, dd, Math.round(random()) * Math.PI / 2, [12, 12]);
      parts.put(shape("saw-roof", () => new THREE.CylinderGeometry(1, 1, 1, 3, 1).rotateZ(Math.PI / 2).translate(0, 0.5, 0)), soot, x, y + h, z, 0, w * 0.5, 3, dd * 0.5);
    } else if (kind < 0.72) {
      const h = range(random, 50, 120);
      parts.put(unitCylinder(16), rust, x, y, z, 0, range(random, 3, 5), h, range(random, 3, 5));
      for (let b = 0.3; b < 1; b += 0.25) parts.put(unitCylinder(16), paint(0xd8d2c8), x, y + h * b, z, 0, 5.4, 2, 5.4);
      stacks.push(new THREE.Vector3(x, y + h, z));
    } else if (kind < 0.85) {
      const tower = lathe("cooling-tower", [[1, 0], [0.72, 0.55], [0.66, 0.75], [0.74, 1]], 40);
      parts.put(tower, paint(0x8f8a84, { rough: 0.9 }), x, y, z, 0, 28, range(random, 55, 80), 28);
      stacks.push(new THREE.Vector3(x, y + 70, z));
    } else {
      parts.put(unitCylinder(20), steel, x, y, z, 0, 12, 34, 12);
      parts.put(unitCone(20), soot, x, y + 34, z, 0, 12, 14, 12);
      parts.put(unitBox(), furnaceGlow, x + 12.2, y + 4, z, 0, 0.6, 8, 6);
      parts.put(unitCylinder(8), steel, x - 14, y, z, 0, 2, 45, 2);
    }
    buildings += 1;
  }

  // ---- Bridges over the lava and an ore railway ----
  for (let k = -5; k <= 5; k += 1) {
    const x = k * 200, z = 160 * Math.sin(x / 260) + 40;
    parts.put(unitBox(), steel, x, 6, z, 0, 16, 2.5, 170);
    for (const side of [-1, 1]) parts.put(unitBox(), rust, x + side * 7.5, 8.5, z, 0, 1, 5, 170);
    for (const off of [-60, 0, 60]) parts.put(unitCylinder(8), soot, x, -4, z + off, 0, 3, 10, 3);
  }
  const railZ = -620;
  parts.put(unitBox(), steel, 0, 12, railZ, 0, 2600, 2, 6);
  for (let x = -1300; x <= 1300; x += 60) parts.put(unitCylinder(8), soot, x, -5, railZ, 0, 1.6, 17, 1.6);
  const wagon = shape("ore-wagon", () => new THREE.BoxGeometry(5, 4, 14).translate(0, 2, 0));
  const cars = high ? 40 : 20;
  animations.push(movers(group, wagon, rust, cars, (i, time, o) => {
    const x = ((i * 16 + time * 18) % 2600) - 1300;
    o.position.set(x, 14, railZ);
    o.rotation.y = Math.PI / 2;
  }));

  // ---- Smoke from stacks and towers, and rising embers ----
  const smokeMap = canvasTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,0.75)"); g.addColorStop(0.6, "rgba(255,255,255,0.25)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  }, 64);
  const puffs = [];
  for (const top of stacks.slice(0, high ? 60 : 25)) {
    for (let k = 0; k < 6; k += 1) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeMap, color: 0x3a3330, transparent: true, depthWrite: false }));
      group.add(sprite);
      puffs.push({ sprite, top, phase: k / 6 + random() * 0.1, drift: range(random, 0.5, 1.5) });
    }
  }
  animations.push((time) => {
    for (const p of puffs) {
      const u = (time * 0.05 + p.phase) % 1;
      p.sprite.position.set(p.top.x + u * 60 * p.drift, p.top.y + u * 90, p.top.z - u * 25);
      const s = 10 + u * 50;
      p.sprite.scale.set(s, s, 1);
      p.sprite.material.opacity = 0.55 * (1 - u);
    }
  });
  const emberCount = high ? 1500 : 600, emberSeeds = Array.from({ length: emberCount }, () => [range(random, -1200, 1200), range(random, -1200, 1000), random()]);
  const emberPositions = new Float32Array(emberCount * 3), emberGeometry = new THREE.BufferGeometry();
  emberGeometry.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));
  const embers = new THREE.Points(emberGeometry, new THREE.PointsMaterial({ color: 0xffa040, size: 2.2, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
  embers.frustumCulled = false;
  group.add(embers);
  animations.push((time) => {
    emberSeeds.forEach(([x, z, phase], i) => {
      const u = (time * 0.04 + phase) % 1;
      emberPositions.set([x + Math.sin(time + i) * 6, -2 + u * 160, z], i * 3);
    });
    emberGeometry.attributes.position.needsUpdate = true;
  });

  parts.finish();
  const wallMaterials = {};
  for (const style of ["concrete", "brick", "deco"]) for (const seed of [1, 2, 3]) {
    const material = facadeMaterials(style, seed).day.clone();
    material.color = new THREE.Color(0x8a7a72);
    wallMaterials[`${style}/${seed}`] = material;
    nightLights.push({ material, day: 0.15, night: 0.8 });
  }
  massing.build(group, wallMaterials, { roof: roofMaterial("#3a3431"), default: roofMaterial("#3a3431") });

  return {
    group,
    target: new THREE.Vector3(0, 40, 0),
    moving: [],
    noDamage: true,
    status: `${buildings} industrial structures · ${stacks.length} smoking stacks and towers · lava channels`,
    tour: { radius: 1100, height: 420, swing: 120 },
    bounds: 2600,
    animate(time) { for (const step of animations) step(time); },
    setDusk(on) { for (const light of nightLights) light.material.emissiveIntensity = on ? light.night : light.day; },
  };
}
