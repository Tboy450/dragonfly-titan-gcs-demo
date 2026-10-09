// Backdrops behind the Mission view's vehicle diagram, one per layer:
// - Exterior: a choice of (a) the Titan landing area, (b) an assembly clean room, where Dragonfly is
//   being built in 2026, or (c) a Titan-and-Saturn poster, picked with the a/b/c buttons.
// - Internal: an engineering blueprint with the published envelope dimensions.
// - Thermal: Titan's -179 C air in the thermal scale's own color (dimmed so parts at air
//   temperature stay visible), with cold air drifting past.
// The previous single backdrop is archived in archive/mission-grid-backdrop.
import { systemsModel } from "../mission-systems.mjs?v=dev";
import { thermalRanges, thermalRgb } from "../thermal-scale.mjs?v=dev";
import { $, state } from "./context.mjs?v=dev";

const PREF_KEY = "dragonfly-backdrop";
export const exteriorBackdrops = Object.freeze([
  { id: "titan", letter: "a", name: "Titan landing area" },
  { id: "cleanroom", letter: "b", name: "Assembly clean room" },
  { id: "saturn", letter: "c", name: "Titan and Saturn poster (Saturn is hidden by haze from the surface)" },
]);
let exterior = "titan";
try { const saved = localStorage.getItem(PREF_KEY); if (exteriorBackdrops.some(b => b.id === saved)) exterior = saved; } catch { /* optional */ }

const groundImage = new Image();
groundImage.decoding = "async";
groundImage.src = "./assets/titan-mountain-reference.jpg";

function seeded(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// Static backdrops are painted once per size into a cached canvas and copied each frame.
const cache = { key: "", canvas: null };
function cached(kind, w, h, paint) {
  const dpr = window.devicePixelRatio || 1;
  const ready = kind !== "titan" || (groundImage.complete && groundImage.naturalWidth > 0);
  const key = `${kind}|${w}|${h}|${dpr}|${ready}`;
  if (cache.key !== key) {
    const canvas = cache.canvas || document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const c = canvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(c, w, h);
    cache.canvas = canvas;
    cache.key = key;
  }
  return cache.canvas;
}

function vignette(c, w, h, strength) {
  const shade = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  shade.addColorStop(0, "rgba(0, 0, 0, 0)");
  shade.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  c.fillStyle = shade;
  c.fillRect(0, 0, w, h);
}

// A soft shadow on the ground under the vehicle (the diagram is seen from above).
function groundShadow(c, w, h, alpha) {
  const ppm = h / (2 * Math.max(3.4, 3.0 * h / w));
  c.save();
  c.translate(w / 2 + 0.25 * ppm, h / 2 + 0.35 * ppm);
  c.scale(1.9 * ppm, 1.25 * ppm);
  const shadow = c.createRadialGradient(0, 0, 0, 0, 0, 1);
  shadow.addColorStop(0, `rgba(10, 6, 4, ${alpha})`);
  shadow.addColorStop(1, "rgba(10, 6, 4, 0)");
  c.fillStyle = shadow;
  c.beginPath();
  c.arc(0, 0, 1, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

// (a) Titan landing area from above: interdune ground with the Huygens-image texture and icy
// pebbles, getting hazier toward the top (farther away), a long dune at the top edge.
function paintTitan(c, w, h) {
  const ground = c.createLinearGradient(0, 0, 0, h);
  ground.addColorStop(0, "#b98450");
  ground.addColorStop(0.18, "#9d6a3e");
  ground.addColorStop(1, "#5e3720");
  c.fillStyle = ground;
  c.fillRect(0, 0, w, h);
  if (groundImage.complete && groundImage.naturalWidth > 0) {
    c.save();
    c.globalAlpha = 0.4;
    c.globalCompositeOperation = "multiply";
    // One stretch of the photo's ground (its hazy top 15% left out), no tile seams.
    const sw = groundImage.naturalWidth, sh = groundImage.naturalHeight;
    c.drawImage(groundImage, 0, sh * 0.15, sw, sh * 0.85, 0, h * 0.06, w, h * 0.94);
    c.restore();
  }
  // A long, dark dune across the far (top) edge, softened by haze.
  c.fillStyle = "rgba(70, 40, 24, 0.55)";
  c.beginPath();
  c.moveTo(0, 0);
  for (let x = 0; x <= w; x += 8) c.lineTo(x, h * (0.075 + 0.025 * Math.sin(x / w * 5.2 + 0.7) + 0.012 * Math.sin(x / w * 13)));
  c.lineTo(w, 0);
  c.closePath();
  c.fill();
  const haze = c.createLinearGradient(0, 0, 0, h * 0.45);
  haze.addColorStop(0, "rgba(214, 156, 92, 0.55)");
  haze.addColorStop(1, "rgba(214, 156, 92, 0)");
  c.fillStyle = haze;
  c.fillRect(0, 0, w, h * 0.45);
  // Rounded icy pebbles, larger toward the bottom (nearer).
  const rand = seeded(41);
  for (let i = 0; i < 170; i += 1) {
    const y = h * (0.15 + 0.85 * rand()), x = rand() * w;
    const near = y / h, r = (0.8 + rand() * 2.6) * (0.4 + near * 1.3);
    c.fillStyle = "rgba(30, 16, 8, 0.35)";
    c.beginPath(); c.ellipse(x + r * 0.35, y + r * 0.3, r * 1.15, r * 0.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = rand() < 0.5 ? "#cdbca4" : "#b19d82";
    c.beginPath(); c.ellipse(x, y, r * 1.1, r * 0.62, rand() * 0.6 - 0.3, 0, Math.PI * 2); c.fill();
  }
  groundShadow(c, w, h, 0.45);
  vignette(c, w, h, 0.35);
}

// (b) Clean room: light epoxy floor tiles in perspective, a keep-out boundary, panel wall at the
// far edge, a couple of equipment stands. Generic; no logos.
function paintCleanroom(c, w, h) {
  const floor = c.createLinearGradient(0, 0, 0, h);
  floor.addColorStop(0, "#c9cfd4");
  floor.addColorStop(1, "#aeb6bd");
  c.fillStyle = floor;
  c.fillRect(0, 0, w, h);
  const horizonY = h * 0.13, vanishX = w / 2, vanishY = -h * 1.4;
  c.strokeStyle = "rgba(90, 102, 112, 0.28)";
  c.lineWidth = 1;
  const step = Math.max(w, h) / 9;
  for (let x = -w; x <= w * 2; x += step) {
    c.beginPath();
    c.moveTo(x, h);
    const t = (horizonY - h) / (vanishY - h);
    c.lineTo(x + (vanishX - x) * t, horizonY);
    c.stroke();
  }
  for (let k = 0; k < 14; k += 1) {
    const y = horizonY + (h - horizonY) * (1 - 0.86 ** (k * 1.6));
    c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
  }
  // Keep-out boundary around the vehicle: yellow line with black dashes.
  const ppm = h / (2 * Math.max(3.4, 3.0 * h / w));
  const bw = 2.6 * ppm, bh = 2.4 * ppm;
  c.save();
  c.translate(w / 2, h / 2 + 0.2 * ppm);
  c.lineWidth = Math.max(4, ppm * 0.09);
  c.strokeStyle = "#e3bd2b";
  c.strokeRect(-bw, -bh, bw * 2, bh * 2);
  c.setLineDash([ppm * 0.18, ppm * 0.18]);
  c.strokeStyle = "#1d1f22";
  c.strokeRect(-bw, -bh, bw * 2, bh * 2);
  c.restore();
  // Far wall: light panels with seams, a grey kick plate and a return-air grille.
  c.fillStyle = "#e4e8eb";
  c.fillRect(0, 0, w, horizonY);
  c.fillStyle = "#8f99a2";
  c.fillRect(0, horizonY - 7, w, 7);
  c.strokeStyle = "rgba(120, 132, 142, 0.5)";
  for (let x = 0; x < w; x += w / 7) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, horizonY - 7); c.stroke(); }
  c.fillStyle = "rgba(110, 122, 132, 0.55)";
  for (let x = w * 0.08; x < w * 0.92; x += 6) c.fillRect(x, horizonY * 0.55, 3, horizonY * 0.2);
  // Two work stands near the edges, with shadows.
  for (const [x, y] of [[0.1, 0.78], [0.88, 0.3]]) {
    const sx = x * w, sy = y * h, size = ppm * 0.7;
    c.fillStyle = "rgba(40, 50, 60, 0.25)";
    c.fillRect(sx - size * 0.45, sy - size * 0.3, size * 1.1, size * 0.8);
    c.fillStyle = "#7d8891";
    c.fillRect(sx - size * 0.5, sy - size * 0.4, size, size * 0.7);
    c.fillStyle = "#5f6a73";
    c.fillRect(sx - size * 0.5, sy - size * 0.4, size, size * 0.12);
  }
  groundShadow(c, w, h, 0.3);
  vignette(c, w, h, 0.18);
}

// (c) Poster: Titan's hazy globe below, with its bluish detached haze at the limb, Saturn and its
// rings above, stars. Saturn cannot be seen through the haze from Titan's surface.
function paintSaturn(c, w, h) {
  const space = c.createRadialGradient(w * 0.7, h * 0.2, 0, w * 0.5, h * 0.5, Math.max(w, h));
  space.addColorStop(0, "#151a2c");
  space.addColorStop(1, "#04050a");
  c.fillStyle = space;
  c.fillRect(0, 0, w, h);
  const rand = seeded(7);
  for (let i = 0; i < 260; i += 1) {
    c.fillStyle = `rgba(255, 255, 255, ${0.25 + rand() * 0.7})`;
    const r = rand() < 0.94 ? 0.6 : 1.4;
    c.beginPath(); c.arc(rand() * w, rand() * h, r, 0, Math.PI * 2); c.fill();
  }
  // Saturn (upper right): banded globe, rings in front and behind.
  const sx = w * 0.8, sy = h * 0.2, sr = Math.min(w, h) * 0.09;
  const ring = (start, end) => {
    c.save();
    c.translate(sx, sy);
    c.rotate(-0.38);
    c.scale(1, 0.26);
    c.lineWidth = sr * 0.5;
    c.strokeStyle = "rgba(214, 196, 150, 0.75)";
    c.beginPath(); c.arc(0, 0, sr * 1.85, start, end); c.stroke();
    c.lineWidth = sr * 0.12;
    c.strokeStyle = "rgba(20, 22, 30, 0.8)";
    c.beginPath(); c.arc(0, 0, sr * 1.95, start, end); c.stroke();
    c.restore();
  };
  ring(Math.PI, Math.PI * 2);
  const globe = c.createLinearGradient(sx - sr, sy - sr, sx + sr, sy + sr);
  globe.addColorStop(0, "#efdcae");
  globe.addColorStop(0.5, "#d4b67c");
  globe.addColorStop(1, "#5d4a2c");
  c.fillStyle = globe;
  c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(150, 120, 70, 0.35)";
  c.lineWidth = sr * 0.08;
  for (const band of [-0.35, 0.1, 0.45]) { c.beginPath(); c.ellipse(sx, sy + band * sr, sr * Math.sqrt(1 - band * band), sr * 0.08, -0.38, 0, Math.PI * 2); c.stroke(); }
  ring(0, Math.PI);
  // Titan (bottom left): a big orange globe, lit from the upper right, blue haze at the limb.
  const tx = w * 0.28, ty = h * 1.25, tr = Math.max(w, h) * 0.78;
  const limb = c.createRadialGradient(tx, ty, tr * 0.96, tx, ty, tr * 1.05);
  limb.addColorStop(0, "rgba(120, 160, 220, 0.5)");
  limb.addColorStop(1, "rgba(120, 160, 220, 0)");
  c.fillStyle = limb;
  c.beginPath(); c.arc(tx, ty, tr * 1.05, 0, Math.PI * 2); c.fill();
  const titan = c.createRadialGradient(tx + tr * 0.35, ty - tr * 0.55, tr * 0.1, tx, ty, tr);
  titan.addColorStop(0, "#e8a85a");
  titan.addColorStop(0.6, "#b8702f");
  titan.addColorStop(1, "#5c3014");
  c.fillStyle = titan;
  c.beginPath(); c.arc(tx, ty, tr, 0, Math.PI * 2); c.fill();
  vignette(c, w, h, 0.25);
}

// Internal: engineering blueprint grid.
function paintBlueprint(c, w, h) {
  const paper = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  paper.addColorStop(0, "#14406b");
  paper.addColorStop(1, "#0b2747");
  c.fillStyle = paper;
  c.fillRect(0, 0, w, h);
  for (const [spacing, alpha] of [[12, 0.07], [60, 0.16]]) {
    c.strokeStyle = `rgba(170, 210, 255, ${alpha})`;
    c.lineWidth = 1;
    for (let x = (w / 2) % spacing; x < w; x += spacing) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, h); c.stroke(); }
    for (let y = (h / 2) % spacing; y < h; y += spacing) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(w, y + 0.5); c.stroke(); }
  }
  c.strokeStyle = "rgba(190, 225, 255, 0.45)";
  c.lineWidth = 2;
  c.strokeRect(8, 8, w - 16, h - 16);
}

// Thermal: Titan's air in the thermal scale's color for -179 C, dimmed, with drifting cold air.
function drawThermalAir(ctx, w, h) {
  const range = thermalRanges[state.thermalRange] || thermalRanges.full;
  const [r, g, b] = thermalRgb(systemsModel.ambientC, range);
  const dim = 0.55;
  ctx.fillStyle = `rgb(${Math.round(r * dim)}, ${Math.round(g * dim)}, ${Math.round(b * dim)})`;
  ctx.fillRect(0, 0, w, h);
  const drift = (state.missionTime || 0) * 14;
  for (let i = 0; i < 12; i += 1) {
    const y = ((i * 97) % 100) / 100 * h, length = w * (0.25 + ((i * 37) % 10) / 20);
    const x = ((drift * (0.6 + (i % 4) * 0.2) + i * 173) % (w + length)) - length;
    const streak = ctx.createLinearGradient(x, 0, x + length, 0);
    streak.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
    streak.addColorStop(0.5, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 60)}, 0.18)`);
    streak.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = streak;
    ctx.fillRect(x, y, length, 3 + (i % 3) * 2);
  }
  vignette(ctx, w, h, 0.4);
}

const painters = { titan: paintTitan, cleanroom: paintCleanroom, saturn: paintSaturn, blueprint: paintBlueprint };

// Behind the vehicle (called before the diagram is drawn).
export function drawMissionBackdrop(ctx, w, h) {
  const layer = state.missionLayer;
  if (layer === "thermal") { drawThermalAir(ctx, w, h); return; }
  const kind = layer === "internal" ? "blueprint" : exterior;
  ctx.drawImage(cached(kind, w, h, painters[kind]), 0, 0, w, h);
}

function arrow(ctx, from, to, size) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - size * Math.cos(angle - 0.4), to.y - size * Math.sin(angle - 0.4));
  ctx.lineTo(to.x - size * Math.cos(angle + 0.4), to.y - size * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

// Over the vehicle (called after the diagram): blueprint dimensions and title, thermal note.
export function drawMissionBackdropOverlay(ctx, w, h, labels) {
  const layer = state.missionLayer;
  ctx.save();
  if (layer === "internal" && state.vehicleModel !== "original") {
    ctx.strokeStyle = "rgba(200, 232, 255, 0.85)";
    ctx.fillStyle = "rgba(200, 232, 255, 0.95)";
    ctx.lineWidth = 1;
    for (const dimension of labels?.dimensions || []) {
      for (const [p, q] of dimension.extensions) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      const { a, b } = dimension;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      arrow(ctx, b, a, 7);
      arrow(ctx, a, b, 7);
      ctx.font = "700 11px SFMono-Regular, Consolas, monospace";
      const text = dimension.text, width = ctx.measureText(text).width + 8;
      // Label at the middle of the line, kept inside the frame.
      const mx = Math.min(w - width / 2 - 6, Math.max(width / 2 + 6, (a.x + b.x) / 2));
      const my = Math.min(h - 14, Math.max(14, (a.y + b.y) / 2));
      ctx.fillStyle = "rgba(11, 39, 71, 0.9)";
      ctx.fillRect(mx - width / 2, my - 8, width, 16);
      ctx.fillStyle = "rgba(200, 232, 255, 0.95)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, mx, my);
    }
    // Title block, bottom left.
    const lines = ["DRAGONFLY ROTORCRAFT LANDER", "Internal arrangement, 2023 configuration", "Nose left / units m / illustrative", "Envelope 3.85 x 3.85 x 1.75 m (published)"];
    ctx.font = "700 10px SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const boxW = Math.max(...lines.map(text => ctx.measureText(text).width)) + 16, boxH = lines.length * 14 + 10;
    const x = 14, y = h - 14 - boxH;
    ctx.fillStyle = "rgba(11, 39, 71, 0.85)";
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = "rgba(190, 225, 255, 0.6)";
    ctx.strokeRect(x + 0.5, y + 0.5, boxW, boxH);
    ctx.fillStyle = "rgba(210, 236, 255, 0.95)";
    lines.forEach((text, index) => ctx.fillText(text, x + 8, y + 18 + index * 14));
  } else if (layer === "thermal") {
    ctx.font = "700 11px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(220, 230, 255, 0.85)";
    ctx.textAlign = "left";
    ctx.fillText(`Background: Titan air ${Math.round(systemsModel.ambientC)} C (dimmed so parts at air temperature stay visible)`, 14, h - 34);
  }
  ctx.restore();
}

// a / b / c picker for the Exterior backdrop (bottom left of the vehicle view).
function showPicker() {
  const picker = $("backdrop-picker");
  picker.hidden = state.view !== "mission" || state.missionLayer !== "exterior";
  for (const button of picker.querySelectorAll("[data-backdrop]")) {
    const pressed = button.dataset.backdrop === exterior;
    button.setAttribute("aria-pressed", String(pressed));
  }
  $("backdrop-name").textContent = exteriorBackdrops.find(b => b.id === exterior).name.replace(/ \(.*\)$/, "");
}

for (const button of $("backdrop-picker").querySelectorAll("[data-backdrop]")) {
  button.addEventListener("click", () => {
    exterior = button.dataset.backdrop;
    try { localStorage.setItem(PREF_KEY, exterior); } catch { /* optional */ }
    showPicker();
  });
}
export const updateBackdropPicker = showPicker;
