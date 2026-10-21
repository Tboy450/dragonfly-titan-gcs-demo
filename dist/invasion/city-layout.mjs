// A city district on a planetary map (Claude, October 2026). One versioned, seeded layout is the
// single source for the game rules (where drones must climb, where troops can walk, where pods
// may land, where capture zones sit) and for the renderer (city-render.mjs). Plain data and
// pure queries; no DOM or three.js. Sizes are invented gameplay/visual choices [EST].
//
// Layout: a square grid of blocks around (x, z). Plaza blocks stay open (capture zones and
// landing courts) and park blocks hold trees; every other block is split into lots, each with a
// building whose height falls off from the center. Buildings are axis-aligned boxes stacked in
// tiers (setbacks); collision uses each building's full footprint up to its top.
//
// Styles: "metropolis" (the default, above) and "forge", an industrial city of foundry halls,
// smokestacks and cooling towers (forgeBlock). Forge buildings carry a kind ("hall", "stack" or
// "tower") for the renderer; metropolis buildings have none. A new style must never change the
// random sequence of an existing one, or saved cities would move.

export const CITY_LAYOUT_VERSION = 1;

function random(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LOT_PATTERNS = [
  [[0, 0, 1, 1]],
  [[-0.25, 0, 0.5, 1], [0.25, 0, 0.5, 1]],
  [[0, -0.25, 1, 0.5], [0, 0.25, 1, 0.5]],
  [[-0.25, -0.25, 0.5, 0.5], [0.25, -0.25, 0.5, 0.5], [-0.25, 0.25, 0.5, 0.5], [0.25, 0.25, 0.5, 0.5]],
  [[-0.25, 0, 0.5, 1], [0.25, -0.25, 0.5, 0.5], [0.25, 0.25, 0.5, 0.5]],
];
const STYLES_BY_RING = [
  ["glass", "office", "deco", "teal", "amber"],
  ["office", "brick", "concrete", "deco", "glass"],
  ["residential", "brick", "concrete", "office"],
];

// spec: { seed, x, z, blocks (odd, per side), pitch, street, ground, style, peak }
export function createCityLayout(spec) {
  const { seed = 1, x = 0, z = 0, blocks = 7, pitch = 100, street = 20, ground = 0, style = "metropolis", peak = 150 } = spec;
  const rand = random(seed * 7919 + blocks);
  const block = pitch - street, half = blocks * pitch / 2;
  const centerIndex = (blocks - 1) / 2;
  // Open blocks: the central square, four squares two blocks out on the diagonals, two parks.
  const plazaCells = new Set([`${centerIndex},${centerIndex}`]);
  for (const [di, dj] of [[-2, -2], [2, -2], [2, 2], [-2, 2]]) {
    const i = centerIndex + di, j = centerIndex + dj;
    if (i >= 0 && j >= 0 && i < blocks && j < blocks) plazaCells.add(`${i},${j}`);
  }
  const parkCells = new Set([`${centerIndex - 1},${centerIndex + 2}`, `${centerIndex + 2},${centerIndex - 1}`].filter(key => !plazaCells.has(key)));
  const plazas = [], parks = [], buildings = [], blockList = [];
  for (let i = 0; i < blocks; i += 1) for (let j = 0; j < blocks; j += 1) {
    const bx = x - half + pitch * (i + 0.5), bz = z - half + pitch * (j + 0.5), key = `${i},${j}`;
    blockList.push({ x: bx, z: bz, size: block });
    if (plazaCells.has(key)) {
      plazas.push({ id: `plaza-${plazas.length}`, x: bx, z: bz, radius: block / 2 - 2, central: i === centerIndex && j === centerIndex });
      continue;
    }
    if (parkCells.has(key)) { parks.push({ id: `park-${parks.length}`, x: bx, z: bz, size: block }); continue; }
    if (style === "forge") { forgeBlock(buildings, rand, { bx, bz, block, distance: Math.hypot(bx - x, bz - z) / half, style, peak }); continue; }
    const distance = Math.hypot(bx - x, bz - z) / half;      // 0 at the center, ~1.4 at a corner
    const ring = distance < 0.45 ? 0 : distance < 0.85 ? 1 : 2;
    const pattern = LOT_PATTERNS[Math.floor(rand() * LOT_PATTERNS.length) % LOT_PATTERNS.length];
    for (const [ox, oz, fw, fd] of pattern) {
      const lotW = block * fw - 4, lotD = block * fd - 4;
      const w = Math.max(10, lotW * (0.62 + rand() * 0.32)), d = Math.max(10, lotD * (0.62 + rand() * 0.32));
      const cx = bx + ox * block + (rand() - 0.5) * (lotW - w), cz = bz + oz * block + (rand() - 0.5) * (lotD - d);
      const falloff = Math.max(0.12, 1 - distance * 0.85);
      const height = Math.max(9, peak * falloff * falloff * (0.35 + rand() * 0.9));
      const styles = STYLES_BY_RING[ring];
      const tiers = [];
      if (height > 60 && rand() < 0.6) {
        let y = 0, tw = w, td = d;
        const count = 2 + Math.floor(rand() * 2);
        for (let t = 0; t < count; t += 1) {
          const h = t === count - 1 ? height - y : height / count * (t === 0 ? 1.2 : 0.9);
          tiers.push({ w: tw, d: td, y, h });
          y += h; tw *= 0.78; td *= 0.78;
        }
      } else tiers.push({ w, d, y: 0, h: height });
      buildings.push({
        id: `${style}-b${buildings.length}`, x: cx, z: cz, w, d, height, tiers,
        facade: styles[Math.floor(rand() * styles.length) % styles.length], variant: 1 + Math.floor(rand() * 3),
      });
    }
  }
  const streets = [];
  for (let k = 0; k <= blocks; k += 1) {
    const offset = -half + k * pitch;
    streets.push({ id: `street-x${k}`, x1: x - half, z1: z + offset, x2: x + half, z2: z + offset, width: street });
    streets.push({ id: `street-z${k}`, x1: x + offset, z1: z - half, x2: x + offset, z2: z + half, width: street });
  }
  return {
    version: CITY_LAYOUT_VERSION, style, seed, x, z, ground, pitch, street, block, half,
    bounds: { minX: x - half, maxX: x + half, minZ: z - half, maxZ: z + half },
    plazas, parks, buildings, streets, blocks: blockList,
  };
}

// A forge city block [EST]: now and then one cooling tower; otherwise one or two foundry halls,
// with one to three smokestacks standing inside their footprints and rising far above the roofs
// (stack heights scale with the city's peak), so drones climb over the stacks, not the halls.
const FORGE_LOTS = [
  [[0, 0, 1, 1]],
  [[-0.25, 0, 0.5, 1], [0.25, 0, 0.5, 1]],
  [[0, -0.25, 1, 0.5], [0, 0.25, 1, 0.5]],
];
const FORGE_FACADES = ["brick", "concrete", "deco"];

function forgeBlock(buildings, rand, { bx, bz, block, distance, style, peak }) {
  const add = (building) => buildings.push({
    id: `${style}-b${buildings.length}`, ...building,
    tiers: [{ w: building.w, d: building.d, y: 0, h: building.height }],
  });
  if (rand() < 0.16) {
    const r = 20 + rand() * 7, room = block - 2 * r - 4;
    add({ kind: "tower", x: bx + (rand() - 0.5) * room, z: bz + (rand() - 0.5) * room, w: r * 2, d: r * 2, height: 55 + rand() * 25, facade: "concrete", variant: 1 });
    return;
  }
  const halls = [];
  for (const [ox, oz, fw, fd] of FORGE_LOTS[Math.floor(rand() * FORGE_LOTS.length) % FORGE_LOTS.length]) {
    const lotW = block * fw - 4, lotD = block * fd - 4;
    const w = lotW * (0.72 + rand() * 0.22), d = lotD * (0.72 + rand() * 0.22);
    const hall = {
      kind: "hall", x: bx + ox * block + (rand() - 0.5) * (lotW - w), z: bz + oz * block + (rand() - 0.5) * (lotD - d), w, d,
      height: (12 + rand() * 20) * (1.2 - 0.4 * Math.min(1, distance)),
      facade: FORGE_FACADES[Math.floor(rand() * FORGE_FACADES.length) % FORGE_FACADES.length], variant: 1 + Math.floor(rand() * 3),
    };
    halls.push(hall);
    add(hall);
  }
  const stacks = [];
  for (let k = 0, n = 1 + Math.floor(rand() * 2.2); k < n; k += 1) {
    const hall = halls[Math.floor(rand() * halls.length) % halls.length], r = 2.5 + rand() * 2;
    const stack = {
      kind: "stack", x: hall.x + (rand() - 0.5) * (hall.w - 2 * r - 2), z: hall.z + (rand() - 0.5) * (hall.d - 2 * r - 2),
      w: r * 2, d: r * 2, height: peak * (0.45 + rand() * 0.4), facade: "brick", variant: 1,
    };
    // Stacks keep at least 4 m apart.
    if (stacks.some(other => Math.max(Math.abs(other.x - stack.x) - (other.w + stack.w) / 2, Math.abs(other.z - stack.z) - (other.d + stack.d) / 2) < 4)) continue;
    stacks.push(stack);
    add(stack);
  }
}

// Fast spatial queries over a layout's buildings (25 m buckets).
export function cityQueries(layout) {
  const cell = 25, buckets = new Map();
  for (const b of layout.buildings) {
    for (let i = Math.floor((b.x - b.w / 2) / cell); i <= Math.floor((b.x + b.w / 2) / cell); i += 1) {
      for (let j = Math.floor((b.z - b.d / 2) / cell); j <= Math.floor((b.z + b.d / 2) / cell); j += 1) {
        const key = `${i},${j}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(b);
      }
    }
  }
  const near = (x, z, pad) => {
    const found = new Set();
    for (let i = Math.floor((x - pad) / cell); i <= Math.floor((x + pad) / cell); i += 1) {
      for (let j = Math.floor((z - pad) / cell); j <= Math.floor((z + pad) / cell); j += 1) {
        for (const b of buckets.get(`${i},${j}`) || []) found.add(b);
      }
    }
    return found;
  };
  const inside = (b, x, z, pad) => Math.abs(x - b.x) <= b.w / 2 + pad && Math.abs(z - b.z) <= b.d / 2 + pad;
  return {
    // The building at (x, z), or null; pad grows each footprint (m).
    buildingAt(x, z, pad = 0) {
      for (const b of near(x, z, pad)) if (inside(b, x, z, pad)) return b;
      return null;
    },
    // Highest roof above the city ground within `pad` meters of (x, z); 0 over open ground.
    roofAt(x, z, pad = 0) {
      let top = 0;
      for (const b of near(x, z, pad)) if (inside(b, x, z, pad)) top = Math.max(top, b.height);
      return top;
    },
    // True when a circle of `radius` meters has no building in it (pod landings, zone sites).
    clearAt(x, z, radius = 0) {
      for (const b of near(x, z, radius)) if (inside(b, x, z, radius)) return false;
      return true;
    },
    // True when a building stands in the way of a straight line between two points; heights are
    // meters above the city ground. Each footprint is a box from the ground to the building's top.
    lineBlocked(ax, az, ay, bx, bz, by) {
      const { minX, maxX, minZ, maxZ } = layout.bounds;
      if (Math.max(ax, bx) < minX || Math.min(ax, bx) > maxX || Math.max(az, bz) < minZ || Math.min(az, bz) > maxZ) return false;
      const dx = bx - ax, dz = bz - az, seen = new Set();
      const i0 = Math.floor(Math.min(ax, bx) / cell), i1 = Math.floor(Math.max(ax, bx) / cell);
      const j0 = Math.floor(Math.min(az, bz) / cell), j1 = Math.floor(Math.max(az, bz) / cell);
      for (let i = i0; i <= i1; i += 1) for (let j = j0; j <= j1; j += 1) {
        for (const b of buckets.get(`${i},${j}`) || []) {
          if (seen.has(b)) continue;
          seen.add(b);
          // Where the line crosses the footprint (slab test), then its lowest height there.
          let t0 = 0, t1 = 1;
          for (const [a, d, lo, hi] of [[ax, dx, b.x - b.w / 2, b.x + b.w / 2], [az, dz, b.z - b.d / 2, b.z + b.d / 2]]) {
            if (Math.abs(d) < 1e-9) { if (a < lo || a > hi) t1 = -1; continue; }
            const ta = (lo - a) / d, tb = (hi - a) / d;
            t0 = Math.max(t0, Math.min(ta, tb)); t1 = Math.min(t1, Math.max(ta, tb));
          }
          if (t0 > t1) continue;
          if (Math.min(ay + (by - ay) * t0, ay + (by - ay) * t1) < b.height) return true;
        }
      }
      return false;
    },
  };
}
