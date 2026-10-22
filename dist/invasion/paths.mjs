// Ground routes (FIX-03): a grid search over walkable ground (land, not buildings or walls), so
// troops go round lakes, rivers, buildings and town walls instead of stopping against them.
// Plain and deterministic: the same ground and points give the same route. Sizes [EST].
const key = (i, j) => `${i},${j}`;

// walkable(x, z) -> boolean. Returns waypoints from near `from` to `to` (the last one is `to`
// itself when it is walkable, else the nearest reachable cell), or null when no route is found
// within the search limits. cell: grid size in m; margin: how far the search may stray outside
// the box around the two points; limit: most cells expanded.
export function findRoute(walkable, from, to, { cell = 6, margin = 160, limit = 5000 } = {}) {
  const minX = Math.min(from.x, to.x) - margin, maxX = Math.max(from.x, to.x) + margin;
  const minZ = Math.min(from.z, to.z) - margin, maxZ = Math.max(from.z, to.z) + margin;
  const toCell = (x, z) => [Math.floor(x / cell), Math.floor(z / cell)];
  const center = (i, j) => ({ x: (i + 0.5) * cell, z: (j + 0.5) * cell });
  const open = new Map(), closed = new Map(), known = new Map();
  const free = (i, j) => {
    const k = key(i, j);
    if (!known.has(k)) { const c = center(i, j); known.set(k, c.x >= minX && c.x <= maxX && c.z >= minZ && c.z <= maxZ && walkable(c.x, c.z)); }
    return known.get(k);
  };
  const between = (i, j, ni, nj) => {
    const a = center(i, j), b = center(ni, nj);
    return [0.25, 0.5, 0.75].every(t => walkable(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t));
  };
  const [si, sj] = toCell(from.x, from.z), [gi, gj] = toCell(to.x, to.z);
  const h = (i, j) => Math.hypot(i - gi, j - gj);
  // A binary heap of [f, order, i, j]; the insertion order breaks ties so results never vary.
  const heap = [];
  let order = 0;
  const push = (item) => { heap.push(item); let n = heap.length - 1; while (n > 0) { const p = (n - 1) >> 1; if (less(heap[p], heap[n])) break; [heap[p], heap[n]] = [heap[n], heap[p]]; n = p; } };
  const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let n = 0; for (;;) { const l = 2 * n + 1, r = l + 1; let m = n; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === n) break; [heap[m], heap[n]] = [heap[n], heap[m]]; n = m; } } return top; };
  open.set(key(si, sj), { g: 0, parent: null, i: si, j: sj });
  push([h(si, sj), order++, si, sj]);
  let best = { i: si, j: sj, h: h(si, sj) }, expanded = 0;
  while (heap.length && expanded < limit) {
    const [, , i, j] = pop(), k = key(i, j), node = open.get(k);
    if (!node || closed.has(k)) continue;
    closed.set(k, node);
    expanded += 1;
    const dh = h(i, j);
    if (dh < best.h) best = { i, j, h: dh };
    if (i === gi && j === gj) break;
    for (let di = -1; di <= 1; di += 1) for (let dj = -1; dj <= 1; dj += 1) {
      if (!di && !dj) continue;
      const ni = i + di, nj = j + dj, nk = key(ni, nj);
      if (closed.has(nk) || !free(ni, nj)) continue;
      // No cutting corners past a blocked cell, and no stepping through a wall thinner than a
      // cell: the ground between the two centers is checked too.
      if (di && dj && (!free(i + di, j) || !free(i, j + dj))) continue;
      if (!between(i, j, ni, nj)) continue;
      const g = node.g + (di && dj ? Math.SQRT2 : 1), seen = open.get(nk);
      if (seen && seen.g <= g) continue;
      open.set(nk, { g, parent: k, i: ni, j: nj });
      push([g + h(ni, nj), order++, ni, nj]);
    }
  }
  const end = closed.get(key(gi, gj)) || (best.h < h(si, sj) - 0.5 ? closed.get(key(best.i, best.j)) : null);
  if (!end) return null;
  const cells = [];
  for (let node = end; node; node = node.parent ? closed.get(node.parent) : null) cells.push(center(node.i, node.j));
  cells.reverse();
  if (end.i === gi && end.j === gj && walkable(to.x, to.z)) cells[cells.length - 1] = { x: to.x, z: to.z };
  return simplify(cells, walkable, cell);
}

// Drop waypoints that can be skipped in a straight walk, so troops do not zigzag cell by cell.
function simplify(points, walkable, cell) {
  if (points.length <= 2) return points.slice(1);
  const clear = (a, b) => {
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / (cell / 4));
    for (let s = 1; s < steps; s += 1) if (!walkable(a.x + (b.x - a.x) * s / steps, a.z + (b.z - a.z) * s / steps)) return false;
    return true;
  };
  const out = [];
  let anchor = points[0];
  for (let k = 1; k < points.length; k += 1) {
    if (k === points.length - 1 || !clear(anchor, points[k + 1])) { out.push(points[k]); anchor = points[k]; }
  }
  return out;
}
