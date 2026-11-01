// Metropolis, rebuilt (Claude, October 2026) so no two blocks look alike, after the owner noted
// the first version was "a tad too identical in places". Downtown buildings are assembled panel
// by panel from Quaternius' Downtown City MegaKit (CC0); each gets its own style, size, height,
// window rhythm, storefronts, setback and roof. Around them: procedural mid-rises in eight facade
// styles, ten one-off towers, a river with bridges, an elevated rail loop, a park, a stadium, a
// harbor and moving traffic. Layout and dimensions are invented [EST]. Codex's first Metropolis
// is kept as ?scene=metropolis-classic.
import {
  THREE, rng, pick, range, noise, smooth, Batches, Massing, paint, unitBox, unitCylinder, unitCone,
  unitSphere, unitTorus, lathe, trs, movers, shape, cached,
} from "../kit/core.mjs?v=dev";
import { facadeMaterials, roofMaterial, groundPatch, groundMaterial, horizonMountains, water, tree } from "../kit/scenery.mjs?v=dev";
import { loadKit, configureAssets } from "../kit/assets.mjs?v=dev";

// ---- City plan (meters): 100 m grid, 80 m blocks, 20 m streets ----
const PITCH = 100, BLOCK = 80;
const LAND_X = 1450;              // the harbor coast is at x = +1450; the sea lies east of it
const RIVER = [470, 590];        // the river runs west-east between these z values
const NORTH = [-1450, 450], SOUTH = [610, 1350];
const CORE = { x: 0, z: -100 };   // downtown: kit-built buildings within CORE_RADIUS
const PARK = { x: -500, z: 100, w: 300, d: 300 };
const RAIL = { x: 0, z: -150, radius: 640, height: 20 };
const STADIUM = { x: 650, z: 980 };

// ---- Downtown kit styles ----
const STYLES = {
  brick: {
    floors: [4, 10],
    narrow: ["Brick_Window_Trim", "Brick_Window_Square_Single", "Brick_Window_Trim_Single"],
    wide: ["Brick_Inset_Window", "Brick_Window_CurvedDouble", "Brick_RedWhite_DoubleWindow", "Brick_Inset_Window_Curved", "Brick_Inset_Window_Curved_Small"],
    plain: ["Brick_TopTrim"],
    shop: ["Metal_FirstFloor_Window", "Trim_FirstFloor_Window_001", "Brick_Window_Trim"],
    door: "DoorFrame_Wooden",
    corner: ["Brick_CornerColumn_Bottom", "Brick_CornerColumn_Center", "Brick_CornerColumn_Top"],
    cap: "Brick_CornerColumn_Cap",
    cornice: "Cornice_Brick_Center",
  },
  metal: {
    floors: [6, 17],
    narrow: ["Metal_Window_Half", "Metal_FullWindow"],
    wide: ["Metal_Window"],
    plain: ["Metal_FirstFloor_Wall"],
    shop: ["Metal_FirstFloor_Window", "Metal_FullWindow"],
    door: "DoorFrame_Metal_Single",
    corner: ["Metal_Column_Bottom", "Metal_Column_Center", "Metal_Column_Top"],
    cornice: "Cornice_Metal_Center",
  },
  trim: {
    floors: [5, 14],
    narrow: ["Trim_Window"],
    wide: [],
    plain: ["Trim_Plain_3"],
    shop: ["Trim_FirstFloor_Window_001", "Trim_FirstFloor_Wall"],
    door: "DoorFrame_Trim",
    corner: ["Trim_Column_Bottom", "Trim_Column_Center", "Trim_Column_Top"],
    cornice: "Cornice_Trim_Center",
  },
};
const KIT_PIECES = [...new Set([
  ...Object.values(STYLES).flatMap(s => [...s.narrow, ...s.wide, ...s.plain, ...s.shop, s.door, ...s.corner, s.cap, s.cornice]),
  "Prop_ACUnit", "Prop_Planter_Single", "Prop_Bollard", "Prop_ManholeCover", "Prop_Drain", "Trim_FirstFloor_Window_Columns",
].filter(Boolean))];

// Flat facade used on downtown walls that face a neighbor, matched to each kit style.
const INNER_WALL = { Cornice_Brick_Center: "brick/2", Cornice_Metal_Center: "glass/2", Cornice_Trim_Center: "office/3" };

// Facade styles for procedural buildings, from the center outward.
const DISTRICTS = [
  ["glass", "office", "deco", "teal", "amber"],
  ["office", "brick", "concrete", "deco", "glass"],
  ["residential", "brick", "concrete", "office"],
  ["residential", "residential", "brick", "concrete"],
];

// Faces: south (+z), east (+x), north (-z), west (-x). A panel's front is its local +z.
const FACES = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

export async function build({ renderer, quality, progress }) {
  configureAssets({ renderer, onProgress: progress });
  const high = quality !== "low";
  const kit = await loadKit("downtown-kit", KIT_PIECES, "gltf");
  const width = (name) => Math.round(kit[name].size.x) >= 4 ? 4 : 2;

  const group = new THREE.Group();
  group.name = "Metropolis";
  const random = rng(20261020);
  const batches = new Batches(group);
  const decor = new Batches(group, { shadows: false });
  const massing = new Massing();
  const animations = [];
  const nightLights = [];
  let kitBuildings = 0, massBuildings = 0;

  // ---- Ground, water and horizon ----
  groundPatch(group, "grass", -1025, (NORTH[0] - 2600 + RIVER[0]) / 2, 4950, RIVER[0] - NORTH[0] + 2600, -0.05, 24);
  groundPatch(group, "grass", -1025, (RIVER[1] + 3500) / 2, 4950, 3500 - RIVER[1], -0.05, 24);
  animations.push(water(group, { x: -1025, z: (RIVER[0] + RIVER[1]) / 2, y: -2.2, width: 4950, depth: RIVER[1] - RIVER[0], color: "#3c6f80" }));
  animations.push(water(group, { x: LAND_X + 2200, z: 0, y: -2.2, width: 4400, depth: 9000, color: "#2f6a84" }));
  horizonMountains(group, { inner: 3200, outer: 6600, height: 820, seed: 9, low: "#5d6f62", high: "#c6cfc9", y: -6 });
  // River embankments and promenades.
  for (const z of RIVER) {
    const side = z === RIVER[0] ? -1 : 1;
    decor.put(unitBox(), paint(0x8f8a80), -1025, -2.4, z - side * 1, 0, 4950, 2.6, 2);
    groundPatch(group, "plaza", -1025, z + side * 7, 4950, 12, 0.02, 8);
  }

  // ---- Streets, sidewalks, lamps and street furniture ----
  const streetsX = [], streetsZ = [];
  for (let j = -15; j <= 13; j += 1) {
    const z = (j + 0.5) * PITCH;
    if (z < NORTH[0] || z > SOUTH[1] || (z > NORTH[1] && z < SOUTH[0])) continue;
    streetsZ.push(z);
    groundPatch(group, "asphalt", 0, z, LAND_X * 2, 20, 0.01, 20);
  }
  for (let i = -15; i <= 14; i += 1) {
    const x = (i + 0.5) * PITCH;
    if (Math.abs(x) > LAND_X) continue;
    streetsX.push(x);
    groundPatch(group, "asphalt", x, (NORTH[0] + NORTH[1]) / 2, 20, NORTH[1] - NORTH[0], 0.012, 20, 0);
    groundPatch(group, "asphalt", x, (SOUTH[0] + SOUTH[1]) / 2, 20, SOUTH[1] - SOUTH[0], 0.012, 20, 0);
  }
  const lampPole = shape("lamp-pole", () => new THREE.CylinderGeometry(0.12, 0.16, 1, 6).translate(0, 0.5, 0));
  const lampGlow = paint(0xfff1c8, { glow: 0.15 });
  nightLights.push({ material: lampGlow, day: 0.15, night: 3 });
  const lamp = (x, z) => {
    decor.put(lampPole, paint(0x2f3438, { metal: 0.6, rough: 0.4 }), x, 0, z, 0, 1, 8, 1);
    decor.put(unitBox(), lampGlow, x, 8, z, 0, 1.4, 0.35, 0.6);
  };

  // ---- Blocks: what stands on each 80 x 80 m block ----
  const blocks = [];
  for (let i = -14; i <= 14; i += 1) for (let j = -14; j <= 12; j += 1) {
    const x = i * PITCH, z = j * PITCH;
    if (Math.abs(x) + BLOCK / 2 > LAND_X) continue;
    const north = z - BLOCK / 2 >= NORTH[0] && z + BLOCK / 2 <= NORTH[1];
    const south = z - BLOCK / 2 >= SOUTH[0] && z + BLOCK / 2 <= SOUTH[1];
    if (!north && !south) continue;
    blocks.push({ x, z, i, j, south });
  }
  const inPark = (b) => Math.abs(b.x - PARK.x) < PARK.w / 2 && Math.abs(b.z - PARK.z) < PARK.d / 2;
  const inStadium = (b) => Math.hypot(b.x - STADIUM.x, b.z - STADIUM.z) < 160;
  const towerSites = [[100, -400], [-100, -500], [300, -300], [-300, -300], [200, -600], [-200, -200], [400, -500], [0, -700], [-400, -500], [500, -200]];
  const isTowerSite = (b) => towerSites.some(([x, z]) => x === b.x && z === b.z);
  const coreRadius = high ? 270 : 190;

  const sidewalk = groundMaterial("sidewalk").clone();
  sidewalk.map = sidewalk.map.clone();
  sidewalk.map.repeat.set(BLOCK / 8, BLOCK / 8);
  sidewalk.map.needsUpdate = true;
  for (const b of blocks) {
    decor.put(unitBox(), sidewalk, b.x, 0, b.z, 0, BLOCK + 2, 0.22, BLOCK + 2);
    if (random() < (high ? 0.9 : 0.5)) for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) lamp(b.x + dx * 41, b.z + dz * 41);
    const d = Math.hypot(b.x - CORE.x, b.z - CORE.z);
    if (inPark(b) || inStadium(b) || isTowerSite(b)) continue;
    if (b.x > LAND_X - 120) { harborBlock(b); continue; }
    if (!b.south && d < coreRadius) kitBlock(b, d);
    else massBlock(b, d);
  }

  // Splits a block into lots in one of several patterns, so neighbors differ.
  function lots(b) {
    const half = BLOCK / 2 - 2, patterns = [
      [[0, 0, 76, 76]],
      [[-19, 0, 36, 76], [19, 0, 36, 76]],
      [[0, -19, 76, 36], [0, 19, 76, 36]],
      [[-19, -19, 36, 36], [19, -19, 36, 36], [-19, 19, 36, 36], [19, 19, 36, 36]],
      [[-19, 0, 36, 76], [19, -19, 36, 36], [19, 19, 36, 36]],
      [[-25, -25, 26, 26], [0, -25, 22, 26], [25, -25, 26, 26], [-25, 13, 26, 50], [12, 13, 48, 50]],
    ];
    return pick(random, patterns).map(([x, z, w, d]) => ({ x: b.x + x, z: b.z + z, w: Math.min(w, half * 2), d: Math.min(d, half * 2) }));
  }

  // ---- Downtown: buildings assembled from kit panels ----
  function kitBlock(b, d) {
    for (const lot of lots(b)) {
      if (random() < 0.06) { plaza(lot); continue; }
      const styleName = pick(random, d < 140 ? ["metal", "trim", "trim", "brick"] : ["brick", "brick", "trim", "metal"]);
      kitBuilding(lot, STYLES[styleName], d, b);
    }
  }

  function kitBuilding(lot, style, d, block) {
    const W = Math.max(8, 4 * Math.floor(range(random, lot.w * 0.6, lot.w - 2) / 4));
    const D = Math.max(8, 4 * Math.floor(range(random, lot.d * 0.6, lot.d - 2) / 4));
    const cx = lot.x + range(random, -1, 1) * (lot.w - W) / 2, cz = lot.z + range(random, -1, 1) * (lot.d - D) / 2;
    const tall = 1 - smooth(60, 260, d);
    const floors = Math.round(range(random, style.floors[0], style.floors[1]) * (0.75 + tall * 0.6));
    const look = {
      narrow: pick(random, style.narrow), wide: style.wide.length ? pick(random, style.wide) : null, plain: pick(random, style.plain),
      shop: pick(random, style.shop), wideShare: style.wide.length ? range(random, 0, 0.8) : 0, plainEvery: pick(random, [0, 0, 3, 4, 5]),
    };
    const setbackAt = floors >= 9 && random() < 0.55 ? Math.round(floors * range(random, 0.55, 0.75)) : floors;
    // Walls on the block's edge face a street and get full kit panels; walls facing a neighbor
    // inside the block become flat facade walls in the same style (most are hidden anyway).
    const edge = BLOCK / 2 - 8;
    const exposed = [cz + D / 2 >= block.z + edge, cx + W / 2 >= block.x + edge, cz - D / 2 <= block.z - edge, cx - W / 2 <= block.x - edge];
    const streetFaces = [0, 1, 2, 3].filter(f => exposed[f]);
    const front = streetFaces.length ? pick(random, streetFaces) : 0;
    shell(cx, cz, W, D, 0, setbackAt, style, look, front, true, exposed);
    if (setbackAt < floors && W > 16 && D > 16) shell(cx, cz, W - 8, D - 8, setbackAt, floors, style, look, front, false, [true, true, true, true]);
    const top = (setbackAt < floors && W > 16 && D > 16 ? floors : setbackAt) * 3;
    rooftop(cx, cz, setbackAt < floors && W > 16 && D > 16 ? W - 8 : W, setbackAt < floors && W > 16 && D > 16 ? D - 8 : D, top, style);
    kitBuildings += 1;
  }

  // One rectangular shell of panels from floor `from` to floor `to`.
  function shell(cx, cz, W, D, from, to, style, look, front, ground, exposed) {
    for (let f = 0; f < 4; f += 1) {
      const angle = FACES[f], length = f % 2 ? D : W, extent = f % 2 ? W / 2 : D / 2;
      const nx = Math.sin(angle), nz = Math.cos(angle), tx = Math.cos(angle), tz = -Math.sin(angle);
      if (!exposed[f]) {
        const right = [cx + nx * extent + tx * length / 2, cz + nz * extent + tz * length / 2];
        const left = [cx + nx * extent - tx * length / 2, cz + nz * extent - tz * length / 2];
        massing.wall(INNER_WALL[style.cornice], right[0], right[1], left[0], left[1], from * 3, (to - from) * 3, [12, 12]);
        continue;
      }
      // One bay sequence per face, reused on every floor so windows line up vertically.
      const bays = [];
      for (let at = 0, index = 0; at < length - 0.01; index += 1) {
        let name = look.plainEvery && index % look.plainEvery === look.plainEvery - 1 ? look.plain : look.narrow;
        if (look.wide && length - at >= 4 && random() < look.wideShare) name = look.wide;
        if (width(name) > length - at) name = look.narrow;
        bays.push({ name, center: at + width(name) / 2 });
        at += width(name);
      }
      const place = (name, along, y, inset = 0) => {
        const x = cx + nx * (extent - inset) + tx * (along - length / 2), z = cz + nz * (extent - inset) + tz * (along - length / 2);
        batches.piece(kit[name], trs(x, y, z, angle));
      };
      for (let floor = from; floor < to; floor += 1) {
        const y = floor * 3;
        if (ground && floor === 0) {
          const door = f === front ? Math.floor(bays.length / 2) : -1;
          bays.forEach((bay, index) => {
            if (index === door) {
              const doorAt = bay.center - width(bay.name) / 2 + 1;
              place(style.door, doorAt, 0);
              batches.put(unitBox(), paint(0x3b2a20, { rough: 0.6 }), cx + nx * (extent - 0.25) + tx * (doorAt - length / 2), 0, cz + nz * (extent - 0.25) + tz * (doorAt - length / 2), angle, 1.6, 2.5, 0.08);
              if (width(bay.name) === 4) place(look.shop, doorAt + 2, 0);
            } else if (width(bay.name) === 4) {
              place(look.shop, bay.center - 1, 0);
              place(look.shop, bay.center + 1, 0);
            } else place(look.shop, bay.center, 0);
          });
          continue;
        }
        for (const bay of bays) place(bay.name, bay.center, y);
      }
      // Corner column at the face's right end, and a cornice along the top.
      for (let floor = from; floor < to; floor += 1) {
        const piece = floor === from ? style.corner[0] : floor === to - 1 ? style.corner[2] : style.corner[1];
        const x = cx + nx * extent + tx * length / 2, z = cz + nz * extent + tz * length / 2;
        batches.piece(kit[piece], trs(x, floor * 3, z, angle));
      }
      if (style.cap) batches.piece(kit[style.cap], trs(cx + nx * extent + tx * length / 2, to * 3 - 2, cz + nz * extent + tz * length / 2, angle));
      for (let at = 1; at < length; at += 2) place(style.cornice, at, to * 3);
    }
    batches.put(unitBox(), roofMaterial("#706d66"), cx, to * 3 - 0.1, cz, 0, W - 0.3, 0.4, D - 0.3);
  }

  function rooftop(cx, cz, W, D, top, style) {
    const count = Math.floor(range(random, 1, 5));
    for (let k = 0; k < count; k += 1) {
      batches.piece(kit.Prop_ACUnit, trs(cx + range(random, -0.35, 0.35) * W, top + 0.3, cz + range(random, -0.35, 0.35) * D, Math.floor(random() * 4) * Math.PI / 2, 2.2));
    }
    if (style === STYLES.brick && random() < 0.45) waterTower(cx + range(random, -0.25, 0.25) * W, top + 0.3, cz + range(random, -0.25, 0.25) * D);
    if (random() < 0.18) for (let k = 0; k < 4; k += 1) batches.piece(kit.Prop_Planter_Single, trs(cx - W / 4 + (k % 2) * W / 2, top + 0.3, cz - D / 4 + Math.floor(k / 2) * D / 2, 0, 1.4));
    if (top > 30 && random() < 0.35) decor.put(unitCylinder(6), paint(0x9aa3a8, { metal: 0.7, rough: 0.3 }), cx, top, cz, 0, 0.25, range(random, 8, 22), 0.25);
  }

  function waterTower(x, y, z) {
    const wood = paint(0x6e5136, { rough: 0.9 }), iron = paint(0x2f3335, { metal: 0.6, rough: 0.5 });
    for (const [dx, dz] of [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]]) batches.put(unitCylinder(6), iron, x + dx, y, z + dz, 0, 0.12, 4, 0.12);
    batches.put(unitCylinder(16), wood, x, y + 4, z, 0, 2.3, 4.2, 2.3);
    batches.put(unitCone(16), iron, x, y + 8.2, z, 0, 2.5, 1.6, 2.5);
  }

  function plaza(lot) {
    groundPatch(group, "plaza", lot.x, lot.z, lot.w, lot.d, 0.25, 6);
    batches.piece(kit.Prop_Planter_Single, trs(lot.x, 0.25, lot.z, 0, 2.5));
    for (let k = 0; k < 6; k += 1) tree(decor, lot.x + range(random, -0.4, 0.4) * lot.w, 0.25, lot.z + range(random, -0.4, 0.4) * lot.d, range(random, 6, 10), random);
    for (let k = 0; k < 8; k += 1) batches.piece(kit.Prop_Bollard, trs(lot.x - lot.w / 2 + k * lot.w / 7, 0.25, lot.z + lot.d / 2 - 1, 0, 1.2));
  }

  // ---- Mid and outer city: procedural buildings in eight facade styles ----
  function massBlock(b, d) {
    const ring = d < 520 ? 0 : d < 850 ? 1 : d < 1150 ? 2 : 3;
    const flavor = noise(b.x / 600, b.z / 600, 4);
    const palette = DISTRICTS[Math.min(3, b.south ? Math.max(2, ring) : ring)];
    for (const lot of lots(b)) {
      if (random() < 0.05) { plaza(lot); continue; }
      const style = palette[Math.floor((flavor * 0.6 + random() * 0.4) * palette.length) % palette.length];
      const key = `${style}/${1 + Math.floor(random() * 3)}`;
      const base = [95, 55, 30, 16][ring] * (b.south ? 0.55 : 1);
      const height = Math.max(8, base * range(random, 0.45, 1.5) * (0.7 + noise(b.x / 300, b.z / 300, 9) * 0.6));
      const w = range(random, lot.w * 0.6, lot.w - 3), dd = range(random, lot.d * 0.6, lot.d - 3);
      const ry = random() < 0.1 ? range(random, -0.2, 0.2) : 0;
      const tile = style === "residential" ? [9, 9] : style === "brick" || style === "deco" ? [10, 12] : [12, 12];
      const shapeKind = height > 60 ? pick(random, ["setback", "setback", "podium", "plain", "cylinder"]) : pick(random, ["plain", "plain", "ell", "podium"]);
      if (shapeKind === "setback") {
        let h = 0, sw = w, sd = dd;
        const tiers = Math.floor(range(random, 2, 4));
        for (let t = 0; t < tiers; t += 1) {
          const th = height / tiers * (t === 0 ? 1.2 : 0.9);
          massing.box(key, "roof", lot.x, h, lot.z, sw, th, sd, ry, tile);
          h += th; sw *= 0.78; sd *= 0.78;
        }
        roofGear(lot.x, h, lot.z, sw, sd, height);
      } else if (shapeKind === "podium") {
        const ph = Math.min(14, height * 0.25);
        massing.box(`concrete/${1 + Math.floor(random() * 3)}`, "roof", lot.x, 0, lot.z, w, ph, dd, ry, [12, 12]);
        massing.box(key, "roof", lot.x + range(random, -0.1, 0.1) * w, ph, lot.z, w * 0.6, height - ph, dd * 0.6, ry, tile);
        roofGear(lot.x, height, lot.z, w * 0.6, dd * 0.6, height);
      } else if (shapeKind === "ell") {
        massing.box(key, "roof", lot.x - w * 0.2, 0, lot.z, w * 0.6, height, dd, ry, tile);
        massing.box(key, "roof", lot.x + w * 0.2, 0, lot.z + dd * 0.2, w * 0.6, height * range(random, 0.5, 0.8), dd * 0.6, ry, tile);
        roofGear(lot.x - w * 0.2, height, lot.z, w * 0.6, dd, height);
      } else if (shapeKind === "cylinder") {
        massing.cylinder(key, "roof", lot.x, 0, lot.z, Math.min(w, dd) / 2, height, 24, tile);
        roofGear(lot.x, height, lot.z, Math.min(w, dd) * 0.5, Math.min(w, dd) * 0.5, height);
      } else {
        massing.box(key, "roof", lot.x, 0, lot.z, w, height, dd, ry, tile);
        roofGear(lot.x, height, lot.z, w, dd, height);
      }
      massBuildings += 1;
    }
  }

  function roofGear(x, y, z, w, d, height) {
    const gray = paint(0x9ea3a4, { rough: 0.6 });
    for (let k = 0, n = Math.floor(range(random, 0, 4)); k < n; k += 1) {
      decor.put(unitBox(), gray, x + range(random, -0.3, 0.3) * w, y, z + range(random, -0.3, 0.3) * d, 0, range(random, 2, 5), range(random, 1, 2.5), range(random, 2, 4));
    }
    if (height > 25 && height < 70 && random() < 0.3) waterTower(x + range(random, -0.2, 0.2) * w, y, z + range(random, -0.2, 0.2) * d);
    if (height > 80 && random() < 0.4) {
      decor.put(unitCylinder(24), paint(0x2b2f33), x, y, z, 0, Math.min(w, d) * 0.32, 0.4, Math.min(w, d) * 0.32);
      decor.put(unitTorus(0.03, 48), paint(0xf2f2f2, { glow: 0.2 }), x, y + 0.45, z, 0, Math.min(w, d) * 0.28);
    }
    if (height > 60 && random() < 0.45) {
      decor.put(unitCylinder(6), paint(0xb0b6ba, { metal: 0.8, rough: 0.3 }), x, y, z, 0, 0.3, range(random, 10, 30), 0.3);
    }
    if (height < 40 && random() < 0.15) decor.put(unitBox(), paint(0x5f8a4e, { rough: 1 }), x, y, z, 0, w * 0.7, 0.5, d * 0.7);
  }

  // Harbor strip on the east coast: warehouses, cranes and container stacks.
  function harborBlock(b) {
    const warehouse = (x, z, w, d, h) => massing.box(`concrete/${1 + Math.floor(random() * 3)}`, "roof", x, 0, z, w, h, d, 0, [12, 12]);
    warehouse(b.x - 15, b.z, 40, 70, range(random, 9, 14));
    const containerColors = [0xb3412f, 0x2f5f9e, 0xd29b2e, 0x3f8a5a, 0x8a8f94, 0xe7e2d6];
    for (let k = 0; k < (high ? 70 : 30); k += 1) {
      const x = b.x + 15 + (k % 3) * 2.6, z = b.z - 35 + Math.floor(k / 9) * 13, y = Math.floor((k % 9) / 3) * 2.6;
      decor.put(unitBox(), paint(0xffffff, { rough: 0.7 }), x, y, z, 0, 2.4, 2.55, 12, new THREE.Color(pick(random, containerColors)));
    }
  }

  // ---- Ten one-off towers ----
  const glassBlue = facadeMaterials("glass", 1).day, glassTeal = facadeMaterials("teal", 1).day, glassAmber = facadeMaterials("amber", 1).day;
  const accent = paint(0xdfe8ef, { metal: 0.85, rough: 0.25 });
  const crownGlow = paint(0xbfe8ff, { glow: 0.3 });
  nightLights.push({ material: crownGlow, day: 0.3, night: 2.8 });
  const towers = [
    (x, z) => { // Meridian: four glass tiers, pyramid crown and spire
      let y = 0, s = 54;
      for (const h of [120, 80, 60, 40]) { massing.box("glass/1", "roof", x, y, z, s, h, s, 0, [12, 12]); y += h; s -= 10; }
      decor.put(unitCone(4), accent, x, y, z, Math.PI / 4, s * 0.85, 26, s * 0.85);
      decor.put(unitCylinder(6), accent, x, y + 26, z, 0, 0.6, 40, 0.6);
      decor.put(unitSphere(10), paint(0xff4040, { glow: 2 }), x, y + 66, z, 0, 1.2);
    },
    (x, z) => { // Halo: glass cylinder ringed with light
      massing.cylinder("teal/1", "roof", x, 0, z, 27, 250, 32, [12, 12]);
      for (let y = 40; y < 250; y += 42) decor.put(unitTorus(0.05, 64), crownGlow, x, y, z, 0, 28.5);
      decor.put(unitCylinder(32), accent, x, 250, z, 0, 22, 6, 22);
      decor.put(unitCylinder(6), accent, x, 256, z, 0, 0.5, 45, 0.5);
    },
    (x, z) => { // Twist: sixty slabs turning 1.6 degrees per floor
      const floor = glassAmber.clone();
      floor.map = floor.map.clone(); floor.map.repeat.set(3, 0.33); floor.map.needsUpdate = true;
      floor.emissiveMap = floor.emissiveMap.clone(); floor.emissiveMap.repeat.set(3, 0.33); floor.emissiveMap.needsUpdate = true;
      nightLights.push({ material: floor, day: 0, night: 1.1, windows: true });
      for (let k = 0; k < 64; k += 1) decor.put(unitBox(), floor, x, k * 4, z, k * 0.028, 40, 3.8, 26);
      decor.put(unitBox(), accent, x, 256, z, 64 * 0.028, 34, 2, 20);
    },
    (x, z) => { // Gemini: twin towers joined by a sky bridge
      for (const dx of [-24, 24]) {
        massing.box("office/2", "roof", x + dx, 0, z, 30, 230, 30, 0, [12, 12]);
        decor.put(unitCone(4), accent, x + dx, 230, z, Math.PI / 4, 18, 22, 18);
      }
      massing.box("glass/2", "roof", x, 150, z, 20, 10, 14, 0, [12, 12]);
      decor.put(unitBox(), crownGlow, x, 149, z, 0, 20, 0.5, 14.5);
    },
    (x, z) => { // Obelisk: tapering eight-sided deco tower
      massing.cylinder("deco/1", "roof", x, 0, z, 30, 210, 8, [10, 12], 11);
      decor.put(unitCone(8), paint(0xc8a45a, { metal: 0.8, rough: 0.3 }), x, 210, z, 0, 11, 40, 11);
    },
    (x, z) => { // Ziggurat: stepped terraces with roof gardens
      let y = 0, s = 76;
      for (let t = 0; t < 7; t += 1) {
        massing.box("office/1", "roof", x, y, z, s, 17, s, 0, [12, 12]);
        y += 17; s -= 9;
        decor.put(unitBox(), paint(0x5c8a4c, { rough: 1 }), x, y, z, 0, s + 6, 0.6, s + 6);
        for (let k = 0; k < 6; k += 1) tree(decor, x + (s / 2 + 2) * Math.cos(k), y + 0.6, z + (s / 2 + 2) * Math.sin(k), 6, random);
      }
    },
    (x, z) => { // Needle: observation tower with a saucer deck
      massing.cylinder("concrete/1", null, x, 0, z, 7, 240, 16, [12, 12], 5);
      const saucer = lathe("needle-saucer", [[0.01, 0], [0.7, 0.1], [1, 0.35], [0.95, 0.55], [0.6, 0.75], [0.01, 0.8]], 40);
      decor.put(saucer, glassTeal, x, 196, z, 0, 22, 24, 22);
      decor.put(unitTorus(0.06, 64), crownGlow, x, 204, z, 0, 22.5);
      decor.put(unitCylinder(6), accent, x, 240, z, 0, 0.8, 60, 0.8);
    },
    (x, z) => { // Sail: a curved glass blade
      const outline = new THREE.Shape();
      outline.absarc(0, 0, 36, -0.9, 0.9, false);
      outline.absarc(-10, 0, 30, 0.95, -0.95, true);
      const sail = new THREE.ExtrudeGeometry(outline, { depth: 220, bevelEnabled: false, curveSegments: 24 }).rotateX(-Math.PI / 2);
      const material = glassBlue.clone();
      material.map = material.map.clone(); material.map.repeat.set(1 / 12, 1 / 12); material.map.needsUpdate = true;
      const mesh = new THREE.Mesh(sail, material);
      mesh.position.set(x - 10, 0, z);
      mesh.castShadow = mesh.receiveShadow = true;
      group.add(mesh);
    },
    (x, z) => { // Lantern: art deco tower with a stacked glowing crown
      massing.box("deco/2", "roof", x, 0, z, 36, 170, 36, 0, [10, 12]);
      let s = 30;
      for (let k = 0; k < 6; k += 1) {
        decor.put(unitBox(), k % 2 ? crownGlow : paint(0xc8a45a, { metal: 0.8, rough: 0.3 }), x, 170 + k * 7, z, Math.PI / 4 * (k % 2), s, 7, s);
        s *= 0.8;
      }
      decor.put(unitCylinder(6), accent, x, 212, z, 0, 0.5, 50, 0.5);
    },
    (x, z) => { // Stack: offset blocks piled crosswise
      for (let k = 0; k < 8; k += 1) {
        const along = k % 2 === 0;
        massing.box(`glass/${1 + (k % 3)}`, "roof", x + (along ? 6 : -6) * (k % 3 - 1), k * 22, z + (along ? 0 : 5), along ? 54 : 26, 22, along ? 26 : 54, 0, [12, 12]);
      }
    },
  ];
  towerSites.forEach(([x, z], index) => {
    groundPatch(group, "plaza", x, z, BLOCK, BLOCK, 0.24, 8);
    towers[index % towers.length](x, z);
  });

  // ---- Central park with a lake ----
  groundPatch(group, "grass", PARK.x, PARK.z, PARK.w - 10, PARK.d - 10, 0.25, 12);
  animations.push(water(group, { x: PARK.x - 30, z: PARK.z + 20, y: 0.3, width: 120, depth: 70, color: "#4f8a8f" }));
  for (let k = 0; k < (high ? 260 : 110); k += 1) {
    const x = PARK.x + range(random, -0.46, 0.46) * PARK.w, z = PARK.z + range(random, -0.46, 0.46) * PARK.d;
    if (Math.abs(x - PARK.x + 30) < 66 && Math.abs(z - PARK.z - 20) < 40) continue;
    tree(decor, x, 0.25, z, range(random, 7, 14), random);
  }
  for (const [x, z, r] of [[PARK.x + 90, PARK.z - 80, 9], [PARK.x - 100, PARK.z - 100, 6]]) {
    decor.put(unitCylinder(16), paint(0xe8e2d4), x, 0.25, z, 0, r, 0.6, r);
    decor.put(lathe("pavilion-dome", [[1, 0], [0.95, 0.35], [0.6, 0.75], [0.01, 0.9]], 24), paint(0x6f9a8e, { metal: 0.4 }), x, 5, z, 0, r, r * 0.8, r);
    for (let k = 0; k < 8; k += 1) decor.put(unitCylinder(8), paint(0xf2eee4), x + Math.cos(k * Math.PI / 4) * r * 0.85, 0.85, z + Math.sin(k * Math.PI / 4) * r * 0.85, 0, 0.35, 4.2, 0.35);
  }

  // ---- Stadium south of the river ----
  {
    const bowl = lathe("stadium-bowl", [[0.62, 0], [1, 0], [1, 0.55], [0.92, 0.6], [0.66, 0.12]], 64);
    decor.put(bowl, paint(0xd9d5cc, { rough: 0.7 }), STADIUM.x, 0, STADIUM.z, 0, 120, 38, 95);
    groundPatch(group, "grass", STADIUM.x, STADIUM.z, 120, 75, 0.4, 10);
    decor.put(unitTorus(0.12, 96), paint(0xeef1f3, { metal: 0.5, rough: 0.3 }), STADIUM.x, 36, STADIUM.z, 0, 112, 1, 88);
    for (let k = 0; k < 4; k += 1) {
      const a = Math.PI / 4 + k * Math.PI / 2, px = STADIUM.x + Math.cos(a) * 140, pz = STADIUM.z + Math.sin(a) * 112;
      decor.put(unitCylinder(8), paint(0x8b9196, { metal: 0.6 }), px, 0, pz, 0, 1.2, 52, 1.2);
      decor.put(unitBox(), crownGlow, px, 52, pz, -a, 10, 5, 1);
    }
  }

  // ---- Bridges over the river ----
  const bridgeDeck = paint(0x9a978f, { rough: 0.8 }), steel = paint(0x55606a, { metal: 0.7, rough: 0.35 });
  streetsX.forEach((x, index) => {
    if (index % 2) return;
    const length = RIVER[1] - RIVER[0] + 20, mid = (RIVER[0] + RIVER[1]) / 2;
    decor.put(unitBox(), bridgeDeck, x, -0.4, mid, 0, 20, 0.8, length);
    groundPatch(group, "asphalt", x, mid, 14, length, 0.42, 20);
    if (index % 4 === 0) {
      for (const side of [-1, 1]) {
        const arch = shape("bridge-arch", () => new THREE.TorusGeometry(1, 0.02, 6, 48, Math.PI));
        decor.add(arch, steel, trs(x + side * 9, -2, mid, Math.PI / 2, length / 2, 22, length / 2));
      }
    } else {
      for (let k = 1; k < 4; k += 1) decor.put(unitBox(), bridgeDeck, x, -2.4, RIVER[0] + k * (RIVER[1] - RIVER[0]) / 4, 0, 6, 2, 4);
    }
  });

  // ---- Elevated rail loop with moving trains ----
  const railSegments = 120, guideway = paint(0xc8ccc8, { rough: 0.6 });
  for (let k = 0; k < railSegments; k += 1) {
    const a = k / railSegments * Math.PI * 2, x = RAIL.x + Math.cos(a) * RAIL.radius, z = RAIL.z + Math.sin(a) * RAIL.radius;
    const segment = 2 * Math.PI * RAIL.radius / railSegments + 0.4;
    decor.put(unitBox(), guideway, x, RAIL.height, z, -a, 6, 1.4, segment);
    if (k % 3 === 0) decor.put(unitCylinder(10), guideway, x, 0, z, 0, 1.1, RAIL.height, 1.1);
  }
  const carGeometry = shape("train-car", () => new THREE.CapsuleGeometry(1.6, 16, 4, 10).rotateX(Math.PI / 2).translate(0, 1.7, 0));
  const trainPaint = paint(0xf2f4f5, { metal: 0.4, rough: 0.3 });
  animations.push(movers(group, carGeometry, trainPaint, 12, (i, time, o) => {
    const train = Math.floor(i / 6), car = i % 6;
    const a = time * 0.035 + train * Math.PI - car * 0.032;
    o.position.set(RAIL.x + Math.cos(a) * RAIL.radius, RAIL.height + 0.8, RAIL.z + Math.sin(a) * RAIL.radius);
    o.rotation.y = -a;
  }));

  // ---- Traffic on the avenues ----
  const carCount = high ? 420 : 160;
  const car = shape("car", () => {
    const body = new THREE.BoxGeometry(1.9, 0.8, 4.4).translate(0, 0.6, 0);
    const cabin = new THREE.BoxGeometry(1.7, 0.7, 2.2).translate(0, 1.35, -0.2);
    const merged = new THREE.BufferGeometry();
    const parts = [body.toNonIndexed(), cabin.toNonIndexed()];
    for (const name of ["position", "normal"]) {
      const arrays = parts.map(p => p.attributes[name].array);
      const joined = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
      let offset = 0;
      for (const array of arrays) { joined.set(array, offset); offset += array.length; }
      merged.setAttribute(name, new THREE.BufferAttribute(joined, 3));
    }
    return merged;
  });
  const lanes = [
    ...streetsZ.filter(z => z < NORTH[1] + 20 || z > SOUTH[0] - 20).flatMap(z => [{ x0: -LAND_X, z0: z - 4, dx: 1, dz: 0, length: LAND_X * 2 }, { x0: LAND_X, z0: z + 4, dx: -1, dz: 0, length: LAND_X * 2 }]),
    ...streetsX.flatMap(x => [{ x0: x + 4, z0: NORTH[0], dx: 0, dz: 1, length: NORTH[1] - NORTH[0] }, { x0: x - 4, z0: NORTH[1], dx: 0, dz: -1, length: NORTH[1] - NORTH[0] }]),
  ];
  const cars = Array.from({ length: carCount }, () => ({ lane: pick(random, lanes), phase: random(), speed: range(random, 9, 16) }));
  const traffic = movers(group, car, paint(0xffffff, { metal: 0.5, rough: 0.35 }), carCount, (i, time, o) => {
    const c = cars[i], along = (c.phase * c.lane.length + time * c.speed) % c.lane.length;
    o.position.set(c.lane.x0 + c.lane.dx * along, 0.02, c.lane.z0 + c.lane.dz * along);
    o.rotation.y = Math.atan2(c.lane.dx, c.lane.dz);
  });
  const carColors = [0xd9dde0, 0x1d2226, 0xa32c25, 0x2f5b9c, 0xe0b23a, 0x6b7378, 0xf2f2ee, 0x2c6e4f];
  for (let i = 0; i < carCount; i += 1) traffic.mesh.setColorAt(i, new THREE.Color(pick(random, carColors)));
  traffic.mesh.instanceColor.needsUpdate = true;
  animations.push(traffic);

  // ---- Street trees along the river promenades ----
  for (let x = -LAND_X; x < LAND_X; x += 18) {
    tree(decor, x, 0.02, RIVER[0] - 7, range(random, 7, 11), random);
    tree(decor, x + 9, 0.02, RIVER[1] + 7, range(random, 7, 11), random);
  }

  // ---- Finish: instancing, merged facades and night lighting ----
  batches.finish();
  decor.finish();
  const wallMaterials = {}, windowMaterials = [];
  for (const style of ["glass", "amber", "office", "brick", "deco", "concrete", "teal", "residential"]) {
    for (const seed of [1, 2, 3]) {
      const material = facadeMaterials(style, seed).day;
      wallMaterials[`${style}/${seed}`] = material;
      windowMaterials.push(material);
    }
  }
  massing.build(group, wallMaterials, { roof: roofMaterial("#6e6c66"), default: roofMaterial("#6e6c66") });
  for (const material of windowMaterials) nightLights.push({ material, day: 0, night: 0.62, windows: true });

  return {
    group,
    target: new THREE.Vector3(0, 60, -100),
    moving: [],
    noDamage: true,
    status: `${kitBuildings} kit-assembled buildings · ${massBuildings} procedural buildings · ${towers.length} one-off towers`,
    tour: { radius: 1500, height: 560, swing: 160 },
    bounds: 3000,
    animate(time) { for (const step of animations) step(time); },
    setDusk(on) { for (const light of nightLights) light.material.emissiveIntensity = on ? light.night : light.day; },
  };
}
