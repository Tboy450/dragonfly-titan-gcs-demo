// Draws a city district (city-layout.mjs) in the battle scene: streets, sidewalks, paved squares,
// parks, and every building as merged facade boxes in tiers, with rooftop gear. Uses the
// Environment Lab's kit (procedural facades, no downloads), sized for phones: buildings merge into
// one mesh per facade style. The same layout drives the rules, so what you see is what blocks.
// A forge city (style "forge") is drawn by buildForge, after the lab's forge world; a market town
// (style "town") by buildTown.
// group.userData.update(time), when present, animates the city (smoke); the scene calls it.
import { THREE, rng, Batches, Massing, paint, unitBox, unitCylinder, unitCone, lathe, shape } from "./environments/kit/core.mjs?v=dev";
import { facadeMaterials, roofMaterial, groundPatch, tree } from "./environments/kit/scenery.mjs?v=dev";

const TILE = { residential: [9, 9], brick: [10, 12], deco: [10, 12] };

export function buildCity(parent, city, { high = true } = {}) {
  const group = new THREE.Group();
  group.name = "City";
  parent.add(group);
  if (city.style === "forge") return buildForge(group, city, high);
  if (city.style === "town") return buildTown(group, city, high);
  const y0 = city.ground, random = rng(city.seed * 31 + 7);
  const span = city.half * 2;
  // Sidewalk slab under everything, asphalt streets, paved squares and grassy parks on top.
  groundPatch(group, "sidewalk", city.x, city.z, span + 24, span + 24, y0 + 0.04, 8);
  for (const street of city.streets) {
    const along = street.x1 === street.x2;
    groundPatch(group, "asphalt", (street.x1 + street.x2) / 2, (street.z1 + street.z2) / 2,
      along ? street.width : Math.abs(street.x2 - street.x1) + street.width, along ? Math.abs(street.z2 - street.z1) + street.width : street.width, y0 + 0.08, 20);
  }
  for (const plaza of city.plazas) groundPatch(group, "plaza", plaza.x, plaza.z, city.block, city.block, y0 + 0.12, 6);
  const details = new Batches(group, { shadows: false });
  for (const park of city.parks) {
    groundPatch(group, "grass", park.x, park.z, park.size, park.size, y0 + 0.12, 12);
    for (let k = 0; k < (high ? 40 : 18); k += 1) tree(details, park.x + (random() - 0.5) * park.size * 0.9, y0 + 0.12, park.z + (random() - 0.5) * park.size * 0.9, 6 + random() * 6, random);
  }
  // Buildings, tier by tier, into one merged mesh per facade style and variant.
  const massing = new Massing(), wallMaterials = {};
  const gray = paint(0x9ea3a4, { rough: 0.6 }), steel = paint(0xb0b6ba, { metal: 0.8, rough: 0.3 }), wood = paint(0x6e5136, { rough: 0.9 });
  for (const building of city.buildings) {
    const key = `${building.facade}/${building.variant}`;
    wallMaterials[key] ??= facadeMaterials(building.facade, building.variant).day;
    for (const tier of building.tiers) massing.box(key, "roof", building.x, y0 + tier.y, building.z, tier.w, tier.h, tier.d, 0, TILE[building.facade] || [12, 12]);
    const top = building.tiers.at(-1), roofY = y0 + building.height;
    for (let k = 0, n = Math.floor(random() * 4); k < n; k += 1) {
      details.put(unitBox(), gray, building.x + (random() - 0.5) * top.w * 0.6, roofY, building.z + (random() - 0.5) * top.d * 0.6, 0, 2 + random() * 3, 1 + random() * 1.5, 2 + random() * 2);
    }
    if (building.height < 45 && random() < 0.3) {
      details.put(unitCylinder(12), wood, building.x, roofY + 3, building.z, 0, 2.2, 4, 2.2);
      details.put(unitCone(12), steel, building.x, roofY + 7, building.z, 0, 2.4, 1.5, 2.4);
    }
    if (building.height > 70) details.put(unitCylinder(6), steel, building.x, roofY, building.z, 0, 0.3, 10 + random() * 20, 0.3);
  }
  massing.build(group, wallMaterials, { roof: roofMaterial("#6e6c66"), default: roofMaterial("#6e6c66") });
  details.finish();
  return group;
}

function streetsAndSquares(group, city, slab, squares) {
  const y0 = city.ground, span = city.bounds.maxX - city.bounds.minX;
  groundPatch(group, slab, city.x, city.z, span + 24, span + 24, y0 + 0.04, 14);
  for (const street of city.streets) {
    const along = street.x1 === street.x2;
    groundPatch(group, "asphalt", (street.x1 + street.x2) / 2, (street.z1 + street.z2) / 2,
      along ? street.width : Math.abs(street.x2 - street.x1) + street.width, along ? Math.abs(street.z2 - street.z1) + street.width : street.width, y0 + 0.08, 20);
  }
  for (const plaza of city.plazas) groundPatch(group, squares, plaza.x, plaza.z, city.block, city.block, y0 + 0.12, 6);
}

// A walled market town: cobbled lanes, plastered and brick houses under red tile roofs around
// courtyards, gardens with trees, a stone keep with a flag, and a crenellated town wall with
// gates and conical-roofed corner turrets.
function buildTown(group, city, high) {
  const y0 = city.ground, random = rng(city.seed * 31 + 7);
  streetsAndSquares(group, city, "cobble", "plaza");
  const parts = new Batches(group, { shadows: false });
  const tiles = [paint(0x8a3b2a, { rough: 0.85 }), paint(0x6f3426, { rough: 0.85 }), paint(0x9a5a3a, { rough: 0.85 })];
  const stone = paint(0x8d8a80, { rough: 0.95 }), slate = paint(0x4a4e58, { rough: 0.8 }), cloth = paint(0xc8a040, { rough: 0.7 });
  const ridge = shape("ridge-roof", () => new THREE.CylinderGeometry(1, 1, 1, 3, 1).rotateZ(Math.PI / 2).rotateX(Math.PI / 6).translate(0, 0.5, 0));
  for (const park of city.parks) {
    groundPatch(group, "grass", park.x, park.z, park.size, park.size, y0 + 0.12, 12);
    for (let k = 0; k < (high ? 16 : 8); k += 1) tree(parts, park.x + (random() - 0.5) * park.size * 0.85, y0 + 0.12, park.z + (random() - 0.5) * park.size * 0.85, 5 + random() * 5, random);
  }
  const massing = new Massing(), wallMaterials = {};
  for (const b of city.buildings) {
    if (b.kind === "house") {
      const key = `${b.facade}/${b.variant}`;
      wallMaterials[key] ??= facadeMaterials(b.facade, b.variant).day;
      massing.box(key, "roof", b.x, y0, b.z, b.w, b.eaves, b.d, 0, [6, 6]);
      const along = b.w >= b.d, long = along ? b.w : b.d, short = along ? b.d : b.w;
      parts.put(ridge, tiles[b.variant - 1], b.x, y0 + b.eaves, b.z, along ? 0 : Math.PI / 2, long * 1.04, (b.height - b.eaves) / 1.5, short * 0.62);
    } else if (b.kind === "keep") {
      parts.put(unitBox(), stone, b.x, y0, b.z, 0, b.w, b.height, b.d);
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) parts.put(unitCylinder(12), stone, b.x + sx * b.w / 2, y0, b.z + sz * b.d / 2, 0, 2.6, b.height + 4, 2.6);
      for (let k = -2; k <= 2; k += 1) for (const side of [-1, 1]) {
        parts.put(unitBox(), stone, b.x + k * 4, y0 + b.height, b.z + side * b.d / 2, 0, 2, 2, 1.2);
        parts.put(unitBox(), stone, b.x + side * b.w / 2, y0 + b.height, b.z + k * 4, 0, 1.2, 2, 2);
      }
      parts.put(unitCylinder(6), slate, b.x, y0 + b.height, b.z, 0, 0.2, 10, 0.2);
      parts.put(unitBox(), cloth, b.x + 2, y0 + b.height + 7, b.z, 0, 4, 2.4, 0.15);
    } else if (b.kind === "wall") {
      parts.put(unitBox(), stone, b.x, y0, b.z, 0, b.w, b.height, b.d);
      const along = b.w >= b.d, long = along ? b.w : b.d;
      for (let t = -long / 2 + 1.5; t < long / 2 - 1; t += 4) parts.put(unitBox(), stone, b.x + (along ? t : 0), y0 + b.height, b.z + (along ? 0 : t), 0, along ? 2 : b.w, 1.6, along ? b.d : 2);
    } else if (b.kind === "turret") {
      parts.put(unitCylinder(16), stone, b.x, y0, b.z, 0, b.w / 2, b.height, b.d / 2);
      parts.put(unitCone(16), tiles[0], b.x, y0 + b.height, b.z, 0, b.w / 2 + 1, 8, b.d / 2 + 1);
    }
  }
  massing.build(group, wallMaterials, { roof: roofMaterial("#6e4a3a"), default: roofMaterial("#6e4a3a") });
  parts.finish();
  return group;
}

// A forge city: brick and concrete foundry halls with ridge roofs and glowing furnace doors,
// banded smokestacks and cooling towers trailing smoke, and slag yards with ore heaps, on
// basalt paving. Built from the lab's forge world recipe (environments/worlds/forge.mjs).
function buildForge(group, city, high) {
  const y0 = city.ground, random = rng(city.seed * 31 + 7);
  streetsAndSquares(group, city, "basalt", "cobble");
  const parts = new Batches(group, { shadows: false });
  const soot = paint(0x2a2624, { rough: 0.9 }), rust = paint(0x7a3f26, { metal: 0.4, rough: 0.7 }), band = paint(0xd8d2c8);
  const concrete = paint(0x8f8a84, { rough: 0.9, side: THREE.DoubleSide }), ore = paint(0x5a4636, { rough: 1, flat: true }), furnace = paint(0xff8a3a, { glow: 1.6 });
  const ridge = shape("ridge-roof", () => new THREE.CylinderGeometry(1, 1, 1, 3, 1).rotateZ(Math.PI / 2).rotateX(Math.PI / 6).translate(0, 0.5, 0));
  const tower = lathe("cooling-tower", [[1, 0], [0.72, 0.55], [0.66, 0.75], [0.74, 1]], 40);
  for (const yard of city.parks) {
    groundPatch(group, "regolith", yard.x, yard.z, yard.size, yard.size, y0 + 0.12, 12);
    for (let k = 0; k < (high ? 14 : 7); k += 1) {
      const s = 4 + random() * 6;
      parts.put(unitCone(10), ore, yard.x + (random() - 0.5) * yard.size * 0.8, y0, yard.z + (random() - 0.5) * yard.size * 0.8, random() * 3, s, s * 0.6, s);
    }
  }
  const massing = new Massing(), wallMaterials = {}, tops = [];
  for (const b of city.buildings) {
    if (b.kind === "stack") {
      parts.put(unitCylinder(16), rust, b.x, y0, b.z, 0, b.w / 2, b.height, b.d / 2);
      for (let f = 0.35; f < 1; f += 0.25) parts.put(unitCylinder(16), band, b.x, y0 + b.height * f, b.z, 0, b.w / 2 + 0.4, 2, b.d / 2 + 0.4);
      parts.put(unitCylinder(16), soot, b.x, y0 + b.height - 3, b.z, 0, b.w / 2 + 0.3, 3, b.d / 2 + 0.3);
      tops.push({ x: b.x, y: y0 + b.height, z: b.z, size: 9 });
    } else if (b.kind === "tower") {
      parts.put(tower, concrete, b.x, y0, b.z, 0, b.w / 2, b.height, b.d / 2);
      tops.push({ x: b.x, y: y0 + b.height, z: b.z, size: b.w * 0.7 });
    } else {
      const key = `${b.facade}/${b.variant}`;
      wallMaterials[key] ??= facadeMaterials(b.facade, b.variant).day;
      massing.box(key, "roof", b.x, y0, b.z, b.w, b.height, b.d, 0, TILE[b.facade] || [12, 12]);
      const along = b.w >= b.d;
      parts.put(ridge, soot, b.x, y0 + b.height - 0.5, b.z, along ? 0 : Math.PI / 2, (along ? b.w : b.d) * 0.98, 2.5, (along ? b.d : b.w) * 0.5);
      if (random() < 0.6) parts.put(unitBox(), furnace, b.x + b.w / 2 + 0.1, y0, b.z + (random() - 0.5) * b.d * 0.5, 0, 0.6, 7, 6);
    }
  }
  massing.build(group, wallMaterials, { roof: roofMaterial("#3a3634"), default: roofMaterial("#3a3634") });
  parts.finish();
  // Smoke drifting from the tallest stacks and every tower (each puff is a draw call, so few).
  tops.sort((a, c) => c.size - a.size || c.y - a.y);
  const smoke = document.createElement("canvas");
  smoke.width = smoke.height = 64;
  const ctx = smoke.getContext("2d"), glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "rgba(255,255,255,0.75)"); glow.addColorStop(0.6, "rgba(255,255,255,0.25)"); glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 64, 64);
  const map = new THREE.CanvasTexture(smoke), puffs = [];
  for (const top of tops.slice(0, high ? 22 : 10)) {
    for (let k = 0; k < 4; k += 1) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: 0x3a3330, transparent: true, depthWrite: false }));
      sprite.userData.ownMaterial = true;
      group.add(sprite);
      puffs.push({ sprite, top, phase: k / 4 + random() * 0.1, drift: 0.5 + random() });
    }
  }
  group.userData.update = (time) => {
    for (const p of puffs) {
      const u = (time * 0.05 + p.phase) % 1, s = p.top.size + u * 50;
      p.sprite.position.set(p.top.x + u * 60 * p.drift, p.top.y + u * 80, p.top.z - u * 25);
      p.sprite.scale.set(s, s, 1);
      p.sprite.material.opacity = 0.5 * (1 - u);
    }
  };
  return group;
}
