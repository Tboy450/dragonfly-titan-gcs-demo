// Walled market town (Claude, October 2026). Houses are built cell by cell from Kenney's
// Fantasy Town Kit 2.0 wall panels (CC0): stone ground floors, timber upper floors, doors facing
// the street, eaves and banners, each house different. Roofs, terrain, town walls, castle, mills,
// bridge and fields are original procedural art [EST]; the windmill sails and water wheel are
// Kenney's, mounted on drawn mills and turning.
import { THREE, rng, pick, range, fbm, noise, smooth, Batches, paint, unitBox, unitCylinder, unitCone, lathe, trs, shape, cached } from "../kit/core.mjs?v=dev";
import { groundPatch, horizonMountains, water } from "../kit/scenery.mjs?v=dev";
import { loadKit, configureAssets } from "../kit/assets.mjs?v=dev";

const CELL = 3;                 // one Kenney unit = 3 m
const TOWN = 10;                // the level town plateau height (m)
const WALL_RADIUS = 175;
const CASTLE = { x: 0, z: -250 };
const WINDMILL = { x: 270, z: 110 };
const RIVER_Z = (x) => 295 + 50 * Math.sin(x / 300);

const STONE = ["wall", "wall", "wall-window-stone", "wall-window-small", "wall-window-round", "wall-window-shutters"];
const TIMBER = ["wall-wood", "wall-wood-window-shutters", "wall-wood-window-small", "wall-wood-window-glass", "wall-wood-detail-cross", "wall-wood-detail-diagonal", "wall-wood-window-round"];
const DOORS = ["wall-doorway-round", "wall-wood-doorway-round"];
const PROPS = ["stall-red", "stall-green", "stall", "cart", "cart-high", "fountain-round-detail", "lantern", "banner-red", "banner-green", "tree", "tree-high", "tree-high-round", "tree-crooked", "hedge-large", "fence", "rock-large", "rock-wide", "windmill", "watermill-wide", "overhang"];

// Ground height: rolling hills, a level town, the castle and windmill hills and a river valley.
function rawHeight(x, z) {
  let h = 4 + 26 * fbm(x / 420, z / 420, 21) + 8 * fbm(x / 120, z / 120, 4);
  h += 46 * Math.exp(-((x - CASTLE.x) ** 2 + (z - CASTLE.z) ** 2) / (95 * 95));
  h += 22 * Math.exp(-((x - WINDMILL.x) ** 2 + (z - WINDMILL.z) ** 2) / (80 * 80));
  // The river channel: banks ease down to a bed below the water line.
  const bank = smooth(12, 46, Math.abs(z - RIVER_Z(x)));
  return h * bank - 4 * (1 - bank);
}
export function heightAt(x, z) {
  const d = Math.hypot(x, z);
  const town = 1 - smooth(WALL_RADIUS + 5, WALL_RADIUS + 60, d);
  return rawHeight(x, z) * (1 - town) + TOWN * town;
}

function roofMaterial(color, seed) {
  return cached(`tile-roof/${color}`, () => {
    const element = document.createElement("canvas");
    element.width = element.height = 128;
    const ctx = element.getContext("2d"), random = rng(seed);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 10) for (let x = (y / 10) % 2 ? -8 : 0; x < 128; x += 16) {
      ctx.fillStyle = `rgba(${random() < 0.5 ? "0,0,0" : "255,255,255"},${0.06 + random() * 0.12})`;
      ctx.fillRect(x + 1, y + 1, 14, 8);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(x, y + 8, 16, 2);
    }
    const map = new THREE.CanvasTexture(element);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(4, 2);
    return new THREE.MeshStandardMaterial({ map, roughness: 0.9, side: THREE.DoubleSide });
  });
}

// A gable roof over a W x D footprint (meters), ridge along the longer side.
function gableGeometry() {
  return shape("gable-roof", () => {
    // Unit prism: x -0.5..0.5 (span), y 0..1 (rise), z -0.5..0.5 (ridge length).
    const p = (x, y, z) => [x, y, z];
    const tris = [
      [p(-0.5, 0, -0.5), p(0, 1, -0.5), p(0, 1, 0.5)], [p(-0.5, 0, -0.5), p(0, 1, 0.5), p(-0.5, 0, 0.5)],
      [p(0.5, 0, 0.5), p(0, 1, 0.5), p(0, 1, -0.5)], [p(0.5, 0, 0.5), p(0, 1, -0.5), p(0.5, 0, -0.5)],
    ];
    const positions = [], uvs = [];
    for (const tri of tris) for (const v of tri) { positions.push(...v); uvs.push(v[2] + 0.5, v[1]); }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    return geometry;
  });
}
function gableEnds() {
  return shape("gable-ends", () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, 0, 0.5, 0.5, 0, 0.5, 0, 1, 0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, 0, 1, -0.5], 3));
    geometry.computeVertexNormals();
    return geometry;
  });
}

export async function build({ renderer, quality, progress }) {
  configureAssets({ renderer, onProgress: progress });
  const high = quality !== "low";
  const kit = await loadKit("fantasy-kit", [...new Set([...STONE, ...TIMBER, ...DOORS, ...PROPS])], "glb");
  const random = rng(1212);
  const group = new THREE.Group();
  group.name = "Walled market town";
  const parts = new Batches(group);
  const decor = new Batches(group, { shadows: false });
  const animations = [], nightLights = [];
  const piece = (name, x, y, z, angle, scale = CELL) => parts.piece(kit[name], trs(x, y, z, angle, scale));

  // ---- Terrain with fields, river and horizon ----
  const size = 2600, segments = high ? 220 : 140;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments).rotateX(-Math.PI / 2);
  const position = geometry.attributes.position, colors = new Float32Array(position.count * 3), c = new THREE.Color();
  const fieldColors = ["#9c9a4a", "#c9b45a", "#6f8f3f", "#7a5f3e", "#8fae4f", "#b9a25a"].map(h => new THREE.Color(h));
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i), z = position.getZ(i), y = heightAt(x, z);
    position.setY(i, y);
    const d = Math.hypot(x, z), river = Math.abs(z - RIVER_Z(x));
    c.set("#5f8a45").offsetHSL(0, 0, (noise(x / 30, z / 30, 2) - 0.5) * 0.08);
    if (d > WALL_RADIUS + 70 && d < 900) {
      const cell = Math.floor(x / 70) * 31 + Math.floor(z / 45) * 17;
      c.lerp(fieldColors[Math.abs(cell) % fieldColors.length], 0.75 * (1 - smooth(700, 900, d)));
    }
    if (river < 30) c.lerp(new THREE.Color("#b8a882"), 1 - smooth(18, 30, river));
    if (d < WALL_RADIUS) c.lerp(new THREE.Color("#7c8a5a"), 0.4);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const ground = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  ground.receiveShadow = true;
  ground.userData.damageProtected = true;
  group.add(ground);
  animations.push(water(group, { width: 2600, depth: 300, x: 0, z: 295, y: -1.5, color: "#3f7487" }));
  // The mountains start just inside the ground's edge, so no sky shows beneath them.
  horizonMountains(group, { inner: 1150, outer: 4200, height: 650, seed: 31, low: "#55704f", high: "#c9d2c5", y: 8 });

  // ---- Town walls, towers and the south gate ----
  const stone = paint(0xa29a8a, { rough: 0.95 }), darkStone = paint(0x7d766a, { rough: 1 }), slate = paint(0x4d5560, { rough: 0.8 });
  const towers = 10;
  for (let k = 0; k < towers; k += 1) {
    const a1 = k / towers * Math.PI * 2, a2 = (k + 1) / towers * Math.PI * 2;
    const x1 = Math.cos(a1) * WALL_RADIUS, z1 = Math.sin(a1) * WALL_RADIUS, x2 = Math.cos(a2) * WALL_RADIUS, z2 = Math.sin(a2) * WALL_RADIUS;
    const length = Math.hypot(x2 - x1, z2 - z1), angle = Math.atan2(x2 - x1, z2 - z1);
    const gate = Math.abs(((a1 + a2) / 2) - Math.PI / 2) < 0.2;
    if (gate) {
      const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, dx = Math.sin(angle), dz = Math.cos(angle), half = length / 4 + 6;
      for (const side of [-1, 1]) {
        parts.put(unitBox(), stone, mx + side * half * dx, TOWN - 2, mz + side * half * dz, angle, 3, 11, length / 2 - 12);
        parts.put(unitCylinder(16), stone, mx + side * 13 * dx, TOWN - 2, mz + side * 13 * dz, 0, 6, 22, 6);
        parts.put(unitCone(16), slate, mx + side * 13 * dx, TOWN + 20, mz + side * 13 * dz, 0, 7.5, 11, 7.5);
        piece("banner-red", mx + side * 13 * dx, TOWN + 6, mz + side * 13 * dz + 5.6, -Math.PI / 2, 9);
      }
      parts.put(unitBox(), stone, mx, TOWN + 8, mz, angle, 3, 5, 26);
    } else parts.put(unitBox(), stone, (x1 + x2) / 2, TOWN - 2, (z1 + z2) / 2, angle, 3, 11, length);
    for (let m = 0; m < length; m += 3) {
      const t = m / length;
      if (gate && Math.abs(t - 0.5) < 0.08) continue;
      parts.put(unitBox(), darkStone, x1 + (x2 - x1) * t, TOWN + 9, z1 + (z2 - z1) * t, angle, 3.4, 1.4, 1.4);
    }
    parts.put(unitCylinder(16), stone, x1, TOWN - 3, z1, 0, 7, 21, 7);
    parts.put(unitCone(16), slate, x1, TOWN + 18, z1, 0, 8.5, 10, 8.5);
  }

  // ---- Streets and the market square ----
  groundPatch(group, "cobble", 0, 0, 14, WALL_RADIUS * 2, TOWN + 0.05, 6);
  groundPatch(group, "cobble", 0, 0, WALL_RADIUS * 2, 12, TOWN + 0.06, 6);
  groundPatch(group, "cobble", 0, 0, 70, 70, TOWN + 0.08, 6);
  piece("fountain-round-detail", 0, TOWN, 0, 0, 5);
  for (let k = 0; k < 12; k += 1) {
    const a = k / 12 * Math.PI * 2 + 0.2, r = 24;
    piece(pick(random, ["stall-red", "stall-green", "stall"]), Math.cos(a) * r, TOWN, Math.sin(a) * r, -a + Math.PI / 2, 3.2);
    if (k % 3 === 0) piece(pick(random, ["cart", "cart-high"]), Math.cos(a + 0.12) * 17, TOWN, Math.sin(a + 0.12) * 17, -a, 3);
    if (k % 2 === 0) piece("lantern", Math.cos(a + 0.25) * 31, TOWN, Math.sin(a + 0.25) * 31, 0, 3);
  }

  // ---- Houses along the streets ----
  const occupied = new Set();
  const key = (x, z) => `${Math.round(x / CELL)},${Math.round(z / CELL)}`;
  const roofColors = ["#9b4a35", "#7d3f2f", "#4f5a66", "#5b6b4a", "#a8763e", "#6a3a3a"];
  const interior = paint(0x2a1f18, { rough: 1 });
  const lamp = cached("house-glow", () => new THREE.MeshStandardMaterial({ color: 0x1a120c, emissive: 0xffb45a, emissiveIntensity: 0, roughness: 1 }));
  nightLights.push({ material: lamp, day: 0, night: 0.9 });
  let houses = 0;
  // Front faces: 0 east (+x), 1 north (-z), 2 west (-x), 3 south (+z); a panel's wall is on its +x side.
  const FACE = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  function house(cx, cz, w, d, front, yaw) {
    const cells = [];
    for (let i = 0; i < w; i += 1) for (let j = 0; j < d; j += 1) {
      const lx = (i - (w - 1) / 2) * CELL, lz = (j - (d - 1) / 2) * CELL;
      const x = cx + lx * Math.cos(yaw) + lz * Math.sin(yaw), z = cz - lx * Math.sin(yaw) + lz * Math.cos(yaw);
      if (occupied.has(key(x, z)) || Math.hypot(x, z) > WALL_RADIUS - 12 || Math.hypot(x, z) < 38) return false;
      cells.push({ i, j, x, z });
    }
    cells.forEach(cell => occupied.add(key(cell.x, cell.z)));
    const floors = Math.floor(range(random, 1, 3.99));
    const allStone = random() < 0.25, allTimber = random() < 0.2;
    const doorCell = Math.floor((front % 2 ? w : d) / 2);
    for (const cell of cells) {
      const sides = [[cell.i === w - 1, 0], [cell.j === 0, 1], [cell.i === 0, 2], [cell.j === d - 1, 3]];
      for (const [edge, face] of sides) {
        if (!edge) continue;
        for (let floor = 0; floor < floors; floor += 1) {
          const timber = allTimber || (!allStone && floor > 0);
          let name = pick(random, timber ? TIMBER : STONE);
          const along = face % 2 ? cell.i : cell.j;
          if (floor === 0 && face === front && along === doorCell) name = timber ? DOORS[1] : DOORS[0];
          piece(name, cell.x, TOWN + floor * CELL, cell.z, FACE[face] + yaw);
          if (floor === floors - 1 && face === front && random() < 0.5) piece("overhang", cell.x, TOWN + floor * CELL, cell.z, FACE[face] + yaw);
          if (floor === 1 && face === front && random() < 0.08) piece(pick(random, ["banner-red", "banner-green"]), cell.x, TOWN + floor * CELL, cell.z, FACE[face] + yaw);
        }
      }
    }
    const W = w * CELL, D = d * CELL, H = floors * CELL;
    // Interior volume: dark by day through the windows, lamplit at dusk.
    parts.put(unitBox(), lamp, cx, TOWN, cz, yaw, W - 0.7, H - 0.1, D - 0.7);
    const ridgeAlongZ = d >= w, span = ridgeAlongZ ? W : D, length = ridgeAlongZ ? D : W;
    const rise = span * range(random, 0.45, 0.7), roofYaw = yaw + (ridgeAlongZ ? 0 : Math.PI / 2);
    const roof = roofMaterial(pick(random, roofColors), houses);
    parts.put(gableGeometry(), roof, cx, TOWN + H, cz, roofYaw, span + 1.2, rise, length + 1.2);
    parts.put(gableEnds(), paint(0x6b4b32, { rough: 0.9, side: THREE.DoubleSide }), cx, TOWN + H, cz, roofYaw, span, rise, length);
    if (random() < 0.7) {
      const off = range(random, -0.3, 0.3) * length;
      parts.put(unitBox(), darkStone, cx + Math.sin(roofYaw) * off + Math.cos(roofYaw) * span * 0.22, TOWN + H + rise * 0.3, cz + Math.cos(roofYaw) * off - Math.sin(roofYaw) * span * 0.22, roofYaw, 1.4, rise * 0.9, 1.4);
    }
    houses += 1;
    return true;
  }
  // Rows along the main streets (front toward the street), then fill the quarters.
  for (let along = -WALL_RADIUS + 18; along < WALL_RADIUS - 18; along += CELL) {
    for (const side of [-1, 1]) {
      if (random() < 0.55) house(side * (7 + 1.5 * CELL + 0.5), along, 3, Math.floor(range(random, 2, 4.99)), side > 0 ? 2 : 0, 0);
      if (random() < 0.55) house(along, side * (6 + 1.5 * CELL + 0.5), Math.floor(range(random, 2, 4.99)), 3, side > 0 ? 1 : 3, 0);
    }
  }
  for (let attempt = 0; attempt < (high ? 900 : 450); attempt += 1) {
    const a = random() * Math.PI * 2, r = range(random, 45, WALL_RADIUS - 20);
    const x = Math.round(Math.cos(a) * r / CELL) * CELL, z = Math.round(Math.sin(a) * r / CELL) * CELL;
    const front = Math.abs(x) > Math.abs(z) ? (x > 0 ? 2 : 0) : (z > 0 ? 1 : 3);
    house(x, z, Math.floor(range(random, 2, 4.99)), Math.floor(range(random, 2, 4.99)), front, 0);
  }

  // ---- The castle on its hill ----
  const ch = rawHeight(CASTLE.x, CASTLE.z);
  parts.put(unitBox(), stone, CASTLE.x, ch - 6, CASTLE.z, 0.1, 34, 30, 30);
  parts.put(unitBox(), stone, CASTLE.x + 6, ch - 6, CASTLE.z - 4, 0.1, 14, 50, 14);
  parts.put(unitCone(4), slate, CASTLE.x + 6, ch + 44, CASTLE.z - 4, 0.1 + Math.PI / 4, 11, 16, 11);
  for (const [dx, dz] of [[-17, -15], [17, -15], [17, 15], [-17, 15]]) {
    parts.put(unitCylinder(16), stone, CASTLE.x + dx, ch - 6, CASTLE.z + dz, 0, 6, 36, 6);
    parts.put(unitCone(16), slate, CASTLE.x + dx, ch + 30, CASTLE.z + dz, 0, 7.5, 12, 7.5);
    piece("banner-green", CASTLE.x + dx + 5.6, ch + 14, CASTLE.z + dz, 0, 8);
  }
  for (let k = 0; k < 40; k += 1) {
    const a = k / 40 * Math.PI * 2;
    parts.put(unitBox(), darkStone, CASTLE.x + Math.cos(a) * 62, rawHeight(CASTLE.x + Math.cos(a) * 62, CASTLE.z + Math.sin(a) * 62) - 3, CASTLE.z + Math.sin(a) * 62, -a, 2.5, 12, 10.5);
  }

  // ---- Windmill on its hill, with Kenney sails turning ----
  const wh = rawHeight(WINDMILL.x, WINDMILL.z);
  parts.put(lathe("windmill-tower", [[1, 0], [0.82, 0.8], [0.7, 1]], 24), paint(0xe2dccd, { rough: 0.9 }), WINDMILL.x, wh - 1, WINDMILL.z, 0, 6, 18, 6);
  parts.put(unitCone(24), roofMaterial("#7d3f2f", 3), WINDMILL.x, wh + 17, WINDMILL.z, 0, 5, 7, 5);
  const sails = new THREE.Group();
  sails.position.set(WINDMILL.x - 5, wh + 16, WINDMILL.z);
  for (const part of kit.windmill.parts) sails.add(Object.assign(new THREE.Mesh(part.geometry, part.material), { matrixAutoUpdate: true })).children.at(-1).applyMatrix4(part.matrix);
  sails.scale.setScalar(6);
  group.add(sails);
  animations.push((time) => { sails.rotation.x = time * 0.6; });

  // ---- Watermill on the river ----
  const mill = { x: -230, z: RIVER_Z(-230) - 26 };
  const mh = heightAt(mill.x, mill.z);
  parts.put(unitBox(), stone, mill.x, mh - 4, mill.z, 0, 15, 12, 12);
  parts.put(gableGeometry(), roofMaterial("#5b6b4a", 7), mill.x, mh + 8, mill.z, 0, 16.2, 7, 13.2);
  const wheel = new THREE.Group();
  wheel.position.set(mill.x, mh + 1, mill.z + 9);
  for (const part of kit["watermill-wide"].parts) wheel.add(new THREE.Mesh(part.geometry, part.material)).children.at(-1).applyMatrix4(part.matrix);
  wheel.scale.setScalar(6);
  wheel.rotation.order = "YZX"; // spin (x) is applied first, about the wheel's own axle
  wheel.rotation.y = Math.PI / 2;
  group.add(wheel);
  animations.push((time) => { wheel.rotation.x = -time * 0.5; });

  // ---- Bridge on the south road, trees, hedges and rocks ----
  const bz = RIVER_Z(0);
  parts.put(unitBox(), stone, 0, 0.5, bz, 0, 12, 3, 70);
  for (const off of [-16, 0, 16]) parts.put(unitCylinder(12), darkStone, 0, -3, bz + off, 0, 3, 5, 3);
  for (let k = 0; k < (high ? 420 : 200); k += 1) {
    const a = random() * Math.PI * 2, r = range(random, WALL_RADIUS + 25, 800);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(z - RIVER_Z(x)) < 22 || Math.hypot(x - CASTLE.x, z - CASTLE.z) < 70) continue;
    const y = heightAt(x, z);
    const kind = random();
    if (kind < 0.65) piece(pick(random, ["tree", "tree-high", "tree-high-round", "tree-crooked"]), x, y - 0.2, z, random() * 6, range(random, 4, 7));
    else if (kind < 0.85) piece("hedge-large", x, y, z, Math.round(random() * 4) * Math.PI / 2, 5);
    else piece(pick(random, ["rock-large", "rock-wide"]), x, y - 0.5, z, random() * 6, range(random, 2, 5));
  }
  for (let k = 0; k < 60; k += 1) {
    const x = range(random, -700, 700), z = range(random, 260, 700);
    if (Math.abs(z - RIVER_Z(x)) < 30) continue;
    decor.put(unitCylinder(12), paint(0xd8b85a, { rough: 1 }), x, heightAt(x, z), z, 0, 2.2, 2.4, 2.2);
    decor.put(unitCone(12), paint(0xc9a84c, { rough: 1 }), x, heightAt(x, z) + 2.4, z, 0, 2.3, 1.6, 2.3);
  }

  parts.finish();
  decor.finish();
  return {
    group,
    target: new THREE.Vector3(0, TOWN + 20, -30),
    moving: [],
    noDamage: true,
    status: `${houses} Kenney-built houses · walls with ${towers} towers · castle, windmill and watermill`,
    tour: { radius: 520, height: 230, swing: 60 },
    bounds: 1300,
    animate(time) { for (const step of animations) step(time); },
    setDusk(on) { for (const light of nightLights) light.material.emissiveIntensity = on ? light.night : light.day; },
  };
}
