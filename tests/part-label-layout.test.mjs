import test from "node:test";
import assert from "node:assert/strict";
import { layoutPartLabels, labelOffsets } from "../dist/ui/part-label-layout.mjs";

const W = 800, H = 600;
// A ring of parts around a center, as projected from a turning vehicle at angle a.
function scene(a, count = 18, radius = 90) {
  return Array.from({ length: count }, (_, i) => {
    const t = i / count * Math.PI * 2;
    const x = Math.cos(t + a) * radius * (0.4 + (i % 3) * 0.3), z = Math.sin(t + a) * radius;
    return { name: `p${i}`, x: W / 2 + x, y: H / 2 + z * 0.35 + (i % 4) * 6, depth: 0.5 + z / 1000 };
  });
}

test("A lone number sits exactly on its part's anchor", () => {
  const [m] = layoutPartLabels([{ name: "a", x: 300, y: 200 }], { width: W, height: H });
  assert.equal(m.x, 300); assert.equal(m.y, 200); assert.equal(m.drawn, true); assert.equal(m.displaced, false);
});

test("Numbers keep their fixed numbering whatever the view", () => {
  const labels = scene(1.2);
  const markers = layoutPartLabels(labels, { width: W, height: H });
  assert.deepEqual(markers.map(m => [m.name, m.index]), labels.map((l, i) => [l.name, i + 1]));
});

test("Overlapping numbers end up apart, near their anchors, never chained down the screen", () => {
  const labels = Array.from({ length: 6 }, (_, i) => ({ name: `c${i}`, x: 400 + i, y: 300 + i, depth: i }));
  const memory = new Map();
  let markers;
  for (let f = 0; f < 120; f += 1) markers = layoutPartLabels(labels, { width: W, height: H, memory, now: f * 16 });
  for (const a of markers) for (const b of markers) if (a !== b) assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= 20, `${a.name} and ${b.name} apart`);
  const reach = Math.max(...labelOffsets.map(([x, y]) => Math.hypot(x, y)));
  for (const m of markers) assert.ok(Math.hypot(m.x - m.anchorX, m.y - m.anchorY) <= reach + 1, "stays near its anchor");
  assert.ok(markers.filter(m => m.displaced).length <= 5, "the nearest keeps its anchor");
  const ys = markers.map(m => m.y);
  assert.ok(Math.max(...ys) - Math.min(...ys) < 2 * reach, "no vertical chain");
});

test("Turning the view a full circle: numbers move with their parts, no big jumps", () => {
  const memory = new Map();
  let prev = null, worst = 0;
  for (let k = 0; k <= 720; k += 1) {
    const markers = layoutPartLabels(scene(k / 720 * Math.PI * 2), { width: W, height: H, memory, now: k * 16 });
    if (prev) {
      for (const m of markers) {
        const p = prev.find(q => q.name === m.name);
        if (!p?.drawn || !m.drawn) continue;
        const anchorMove = Math.hypot(m.anchorX - p.anchorX, m.anchorY - p.anchorY);
        worst = Math.max(worst, Math.hypot(m.x - p.x, m.y - p.y) - anchorMove);
      }
    }
    prev = markers;
  }
  assert.ok(worst < 12, `largest jump beyond the part's own motion: ${worst.toFixed(1)} px`);
});

test("A displaced number keeps its spot while it stays free (no flipping)", () => {
  const memory = new Map();
  const at = (dx) => [{ name: "near", x: 400, y: 300, depth: 0 }, { name: "far", x: 402 + dx, y: 301, depth: 1 }];
  let first;
  for (let f = 0; f < 60; f += 1) first = layoutPartLabels(at(0), { width: W, height: H, memory, now: f * 16 })[1];
  for (let f = 60; f < 120; f += 1) {
    const far = layoutPartLabels(at((f - 60) * 0.05), { width: W, height: H, memory, now: f * 16 })[1];
    assert.ok(Math.hypot((far.x - far.anchorX) - (first.x - first.anchorX), (far.y - far.anchorY) - (first.y - first.anchorY)) < 1e-6, "same offset");
  }
});

test("Hidden or off-screen parts are not drawn and do not push others; HUD areas are avoided", () => {
  const labels = [
    { name: "hidden", x: 400, y: 300, onCanvas: false, depth: 0 },
    { name: "shown", x: 401, y: 300, depth: 1 },
    { name: "off", x: -50, y: 300, depth: 0 },
  ];
  const markers = layoutPartLabels(labels, { width: W, height: H });
  assert.equal(markers[0].drawn, false); assert.equal(markers[2].drawn, false);
  assert.equal(markers[1].displaced, false, "not pushed by a hidden number");
  const hud = { x: 380, y: 280, w: 40, h: 40 };
  const [m] = layoutPartLabels([{ name: "under", x: 400, y: 300 }], { width: W, height: H, avoid: [hud] });
  assert.ok(m.x < hud.x - 10 || m.x > hud.x + hud.w + 10 || m.y < hud.y - 10 || m.y > hud.y + hud.h + 10, "moved out of the HUD area");
});

test("The selected part always keeps its anchor", () => {
  const labels = [{ name: "a", x: 400, y: 300, depth: 0 }, { name: "b", x: 401, y: 300, depth: 1 }];
  const markers = layoutPartLabels(labels, { width: W, height: H, selected: "b" });
  assert.equal(markers[1].displaced, false);
  assert.equal(markers[0].displaced, true);
});
