// Backdrops behind the Mission view's vehicle diagram, one per layer:
// - Exterior: a choice of (a) the Titan landing area, (b) an assembly clean room, where Dragonfly is
//   being built in 2026, or (c) a Titan-and-Saturn poster, picked with the a/b/c buttons.
// - Internal, picked with a / b: (a) an engineering blueprint, (b) black with a yellow grid and
//   yellow text; both with the published envelope dimensions.
// - Thermal, also picked with a / b / c: (a) Titan's -179 C air in the thermal scale's own color
//   (dimmed so parts at air temperature stay visible), (b) light grey with a dark grid, like NASA's
//   published thermal-model figures (the default: cold blue parts stand out), (c) black with a
//   yellow grid.
// The previous single backdrop is archived in archive/mission-grid-backdrop.
import { systemsModel } from "../mission-systems.mjs?v=dev";
import { thermalRgb } from "../thermal-scale.mjs?v=dev";
import { $, state } from "./context.mjs?v=dev";

const PREF_KEY = "dragonfly-backdrop";
export const exteriorBackdrops = Object.freeze([
  { id: "titan", letter: "a", name: "Titan landing area" },
  { id: "cleanroom", letter: "b", name: "Assembly clean room" },
  { id: "saturn", letter: "c", name: "Titan and Saturn poster (Saturn is hidden by haze from the surface)" },
]);
export const thermalBackdrops = Object.freeze([
  { id: "air", letter: "a", name: "Titan air, -179 C" },
  { id: "light", letter: "b", name: "Light grey, like NASA's thermal figures" },
  { id: "dark", letter: "c", name: "Black with a yellow grid" },
]);
export const internalBackdrops = Object.freeze([
  { id: "blueprint", letter: "a", name: "Blueprint" },
  { id: "yellow", letter: "b", name: "Black with yellow grid and text" },
]);
const THERMAL_PREF_KEY = "dragonfly-thermal-backdrop", INTERNAL_PREF_KEY = "dragonfly-internal-backdrop";
let exterior = "titan", thermal = "light", internal = "blueprint";
try {
  const saved = localStorage.getItem(PREF_KEY);
  if (exteriorBackdrops.some(b => b.id === saved)) exterior = saved;
  const savedThermal = localStorage.getItem(THERMAL_PREF_KEY);
  if (thermalBackdrops.some(b => b.id === savedThermal)) thermal = savedThermal;
  const savedInternal = localStorage.getItem(INTERNAL_PREF_KEY);
  if (internalBackdrops.some(b => b.id === savedInternal)) internal = savedInternal;
} catch { /* optional */ }

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

// Soft round blob (for patches, glows and light pools): a radial gradient from color to clear.
function softBlob(c, x, y, rx, ry, color, alpha, angle = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.scale(rx, ry);
  const blob = c.createRadialGradient(0, 0, 0, 0, 0, 1);
  blob.addColorStop(0, `rgba(${color}, ${alpha})`);
  blob.addColorStop(1, `rgba(${color}, 0)`);
  c.fillStyle = blob;
  c.beginPath();
  c.arc(0, 0, 1, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

// (a) Titan landing area seen from above, nearest at the bottom: a lit dune with ripples at the
// far edge, haze, wind streaks over a patchy interdune, gravel, rounded icy cobbles like those at
// the Huygens landing site, a rain-darkened damp patch, thin ground fog and the lander's shadow.
function paintTitan(c, w, h) {
  const rand = seeded(41);
  const ground = c.createLinearGradient(0, 0, 0, h);
  ground.addColorStop(0, "#c08b56");
  ground.addColorStop(0.22, "#a4703f");
  ground.addColorStop(1, "#573220");
  c.fillStyle = ground;
  c.fillRect(0, 0, w, h);
  // Broad bright and dark patches in the ground.
  for (let i = 0; i < 26; i += 1) {
    const x = rand() * w, y = h * (0.2 + 0.8 * rand()), r = (0.08 + rand() * 0.2) * Math.max(w, h);
    softBlob(c, x, y, r, r * 0.45, rand() < 0.5 ? "214, 170, 118" : "60, 34, 20", 0.12 + rand() * 0.1);
  }
  if (groundImage.complete && groundImage.naturalWidth > 0) {
    c.save();
    c.globalAlpha = 0.32;
    c.globalCompositeOperation = "multiply";
    const sw = groundImage.naturalWidth, sh = groundImage.naturalHeight;
    c.drawImage(groundImage, 0, sh * 0.15, sw, sh * 0.85, 0, h * 0.06, w, h * 0.94);
    c.restore();
  }
  // Wind streaks along the dune trend.
  c.save();
  c.rotate(-0.12);
  for (let i = 0; i < 40; i += 1) {
    const y = h * (0.25 + rand() * 0.85), x = rand() * w * 1.2 - w * 0.1, length = w * (0.15 + rand() * 0.35);
    const streak = c.createLinearGradient(x, 0, x + length, 0);
    streak.addColorStop(0, "rgba(230, 196, 150, 0)");
    streak.addColorStop(0.5, `rgba(230, 196, 150, ${0.04 + rand() * 0.05})`);
    streak.addColorStop(1, "rgba(230, 196, 150, 0)");
    c.fillStyle = streak;
    c.fillRect(x, y, length, 1 + rand() * 3);
  }
  c.restore();
  // Gravel: fine specks, denser and larger toward the bottom (nearer).
  for (let i = 0; i < 5200; i += 1) {
    const y = h * (0.18 + 0.82 * Math.sqrt(rand())), near = y / h;
    c.fillStyle = rand() < 0.55 ? `rgba(40, 22, 12, ${0.18 + rand() * 0.2})` : `rgba(226, 200, 160, ${0.12 + rand() * 0.18})`;
    const s = 0.5 + near * 1.6 * rand();
    c.fillRect(rand() * w, y, s, s);
  }
  // Rain-darkened damp patch (bottom right), ragged and faintly glossy.
  c.save();
  for (let i = 0; i < 22; i += 1) {
    const x = w * (0.78 + (rand() - 0.5) * 0.3), y = h * (0.84 + (rand() - 0.5) * 0.22), r = Math.min(w, h) * (0.05 + rand() * 0.09);
    softBlob(c, x, y, r * 1.6, r, "36, 22, 16", 0.32);
  }
  c.strokeStyle = "rgba(255, 236, 210, 0.07)";
  c.lineWidth = 1.5;
  for (let i = 0; i < 6; i += 1) {
    const y = h * (0.8 + i * 0.025), x = w * (0.66 + rand() * 0.08);
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w * 0.1, y - 4, x + w * (0.18 + rand() * 0.06), y + 2); c.stroke();
  }
  c.restore();
  // The far dune: its lit flank faces us, ripples run along it, its back slope falls away into haze.
  const crest = (x) => h * (0.105 + 0.03 * Math.sin(x / w * 4.6 + 0.8) + 0.012 * Math.sin(x / w * 13 + 2));
  const toe = (x) => crest(x) + h * (0.11 + 0.02 * Math.sin(x / w * 3.1 + 1.7));
  c.beginPath();
  c.moveTo(0, toe(0));
  for (let x = 0; x <= w; x += 6) c.lineTo(x, toe(x));
  for (let x = w; x >= 0; x -= 6) c.lineTo(x, crest(x));
  c.closePath();
  const flank = c.createLinearGradient(0, h * 0.08, 0, h * 0.26);
  flank.addColorStop(0, "#d6a066");
  flank.addColorStop(1, "rgba(150, 96, 56, 0.0)");
  c.fillStyle = flank;
  c.fill();
  c.save();
  c.clip();
  c.strokeStyle = "rgba(90, 52, 28, 0.22)";
  c.lineWidth = 1;
  for (let k = 0; k < 26; k += 1) {
    const f = k / 26;
    c.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = crest(x) + (toe(x) - crest(x)) * f + 1.5 * Math.sin(x * 0.09 + k * 1.7);
      if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
  }
  c.restore();
  c.beginPath();
  c.moveTo(0, 0);
  for (let x = 0; x <= w; x += 6) c.lineTo(x, crest(x));
  c.lineTo(w, 0);
  c.closePath();
  c.fillStyle = "#6a3f24";
  c.fill();
  c.strokeStyle = "rgba(255, 226, 180, 0.55)";
  c.lineWidth = 1.5;
  c.beginPath();
  for (let x = 0; x <= w; x += 6) { if (x === 0) c.moveTo(x, crest(x)); else c.lineTo(x, crest(x)); }
  c.stroke();
  const haze = c.createLinearGradient(0, 0, 0, h * 0.42);
  haze.addColorStop(0, "rgba(218, 162, 98, 0.7)");
  haze.addColorStop(0.45, "rgba(218, 162, 98, 0.25)");
  haze.addColorStop(1, "rgba(218, 162, 98, 0)");
  c.fillStyle = haze;
  c.fillRect(0, 0, w, h * 0.42);
  // Rounded icy cobbles, bigger toward the bottom; lit from the upper left.
  for (let i = 0; i < 230; i += 1) {
    const y = h * (0.24 + 0.76 * Math.sqrt(rand())), x = rand() * w;
    const near = y / h, r = (0.9 + rand() * 3.2) * (0.35 + near * 1.5), squash = 0.55 + rand() * 0.15, tilt = rand() * 0.8 - 0.4;
    c.fillStyle = "rgba(24, 12, 6, 0.4)";
    c.beginPath(); c.ellipse(x + r * 0.5, y + r * 0.35, r * 1.2, r * squash, tilt, 0, Math.PI * 2); c.fill();
    const body = c.createRadialGradient(x - r * 0.4, y - r * 0.3, r * 0.1, x, y, r * 1.2);
    const tone = 0.75 + rand() * 0.25;
    body.addColorStop(0, `rgb(${Math.round(236 * tone)}, ${Math.round(226 * tone)}, ${Math.round(208 * tone)})`);
    body.addColorStop(1, `rgb(${Math.round(132 * tone)}, ${Math.round(112 * tone)}, ${Math.round(90 * tone)})`);
    c.fillStyle = body;
    c.beginPath(); c.ellipse(x, y, r * 1.1, r * squash, tilt, 0, Math.PI * 2); c.fill();
  }
  // Thin ground fog (possible near Titan's surface in Huygens images).
  for (let i = 0; i < 4; i += 1) softBlob(c, w * (0.2 + i * 0.22), h * (0.42 + i * 0.07), w * 0.45, h * 0.05, "236, 200, 150", 0.1);
  groundShadow(c, w, h, 0.5);
  vignette(c, w, h, 0.38);
}

// (b) Assembly clean room seen from above: perforated raised floor in perspective with the
// overhead lights reflected in it, hazard-striped keep-out tape, a nitrogen purge cart whose hose
// runs to the vehicle, a tool cart, work stand, platform ladder, shipping crate, ground strap,
// cable covers, and a wall with an observation window and air grilles. Generic; no logos.
function paintCleanroom(c, w, h) {
  const rand = seeded(17);
  const horizonY = h * 0.14;
  const floorGrad = c.createLinearGradient(0, horizonY, 0, h);
  floorGrad.addColorStop(0, "#dce0e3");
  floorGrad.addColorStop(1, "#b9c0c6");
  c.fillStyle = floorGrad;
  c.fillRect(0, 0, w, h);
  // Floor plane: X across (tiles, 0 at the center) and depth D (0 at the bottom edge). The view
  // looks steeply down like the vehicle's camera (about 66 degrees), so the lines converge gently
  // on a point far above the frame and tiles are only slightly shortened: the vehicle sits flat.
  const tilesAcross = 7, vanishY = -h * 1.4;
  const s0 = w / tilesAcross;
  const d0 = (h - vanishY) / (0.92 * s0);
  const yAt = (D) => vanishY + (h - vanishY) * d0 / (D + d0);
  const xAt = (X, D) => w / 2 + X * s0 * d0 / (D + d0);
  const farD = Math.ceil(d0 * ((h - vanishY) / (horizonY - vanishY) - 1));
  const halfAcross = Math.ceil(w / 2 / (s0 * d0 / (farD + d0))) + 1;
  // Reflections of the overhead light panels on the epoxy.
  for (let D = 0.6; D < farD; D += 2.2) {
    for (const X of [-2.2, 0, 2.2]) {
      const scale = d0 / (D + d0);
      softBlob(c, xAt(X, D), yAt(D), s0 * 0.9 * scale, s0 * 0.32 * scale, "255, 255, 255", 0.35);
    }
  }
  // Tiles: grout lines and perforations.
  c.strokeStyle = "rgba(84, 96, 106, 0.35)";
  c.lineWidth = 1;
  for (let X = -halfAcross; X <= halfAcross; X += 1) { c.beginPath(); c.moveTo(xAt(X - 0.5, 0), h); c.lineTo(xAt(X - 0.5, farD), yAt(farD)); c.stroke(); }
  for (let D = 0; D <= farD; D += 1) { c.beginPath(); c.moveTo(0, yAt(D)); c.lineTo(w, yAt(D)); c.stroke(); }
  c.fillStyle = "rgba(70, 80, 90, 0.28)";
  for (let D = 0; D < farD; D += 1) {
    for (let X = -halfAcross; X <= halfAcross; X += 1) {
      for (let i = 1; i < 6; i += 1) {
        for (let j = 1; j < 6; j += 1) {
          const dx = X - 0.5 + i / 6, dd = D + j / 6, size = Math.max(0.6, 2.2 * d0 / (dd + d0));
          c.fillRect(xAt(dx, dd) - size / 2, yAt(dd) - size / 2, size, size);
        }
      }
    }
  }
  // Cable covers along the floor and an ESD ground strap.
  c.fillStyle = "rgba(70, 78, 86, 0.4)";
  c.beginPath(); c.moveTo(xAt(-3.3, 0), h); c.lineTo(xAt(-3.0, 0), h); c.lineTo(xAt(-3.0, farD), yAt(farD)); c.lineTo(xAt(-3.3, farD), yAt(farD)); c.fill();
  const ppm = h / (2 * Math.max(3.4, 3.0 * h / w));
  const bw = 2.6 * ppm, bh = 2.4 * ppm, cx = w / 2, cy = h / 2 + 0.2 * ppm;
  c.strokeStyle = "rgba(40, 140, 60, 0.85)";
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx - bw * 0.6, cy + bh * 0.3); c.bezierCurveTo(cx - bw * 0.9, cy + bh * 0.8, cx - bw * 1.2, cy + bh * 0.9, cx - bw * 1.25, cy + bh * 1.05); c.stroke();
  c.fillStyle = "#6f7a83"; c.fillRect(cx - bw * 1.3, cy + bh * 1.02, 10, 7);
  // Keep-out tape: yellow and black diagonal stripes, with stencils.
  const tape = Math.max(6, ppm * 0.13);
  c.save();
  c.beginPath();
  c.rect(cx - bw - tape / 2, cy - bh - tape / 2, bw * 2 + tape, bh * 2 + tape);
  c.rect(cx - bw + tape / 2, cy - bh + tape / 2, bw * 2 - tape, bh * 2 - tape);
  c.clip("evenodd");
  c.fillStyle = "#e5bd23";
  c.fillRect(cx - bw - tape, cy - bh - tape, bw * 2 + tape * 2, bh * 2 + tape * 2);
  c.strokeStyle = "#1c1d1f";
  c.lineWidth = tape * 0.5;
  for (let k = -bh * 4; k < bw * 2 + bh * 3 + tape * 2; k += tape * 1.4) { c.beginPath(); c.moveTo(cx - bw - tape + k, cy - bh - tape); c.lineTo(cx - bw - tape + k - bh * 2.4, cy + bh + tape); c.stroke(); }
  c.restore();
  c.fillStyle = "rgba(196, 40, 32, 0.75)";
  c.font = `800 ${Math.max(10, Math.round(ppm * 0.22))}px Arial, sans-serif`;
  c.textAlign = "center";
  c.fillText("KEEP OUT", cx, cy + bh + tape * 2.6);
  // Equipment, each with a soft shadow. box(x, y, width, depth, top color, side color)
  const box = (x, y, bw2, bd, top, side) => {
    softBlob(c, x + bw2 * 0.12, y + bd * 0.18, bw2 * 0.75, bd * 0.75, "30, 38, 46", 0.35);
    c.fillStyle = side; c.fillRect(x - bw2 / 2, y - bd / 2 + bd * 0.12, bw2, bd);
    c.fillStyle = top; c.fillRect(x - bw2 / 2, y - bd / 2, bw2, bd);
  };
  const unit = ppm;
  // Wide screens put the equipment beside the keep-out box. On a phone the box nearly fills the
  // width, so the carts go below it and the work stand and ladder just inside it.
  const narrow = cx - bw - tape < unit * 1.1;
  const belowY = Math.min(h - unit * 0.35, cy + bh + tape + unit * 0.4);
  // Nitrogen purge cart: cart, green cylinder seen from above, regulator, hose to the vehicle.
  const [px, py] = narrow ? [w * 0.84, belowY] : [w * 0.86, h * 0.36];
  box(px, py, unit * 0.9, unit * 0.6, "#8c969e", "#5c656c");
  c.fillStyle = "#2f7d4f"; c.beginPath(); c.arc(px - unit * 0.18, py, unit * 0.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = "rgba(255, 255, 255, 0.35)"; c.beginPath(); c.arc(px - unit * 0.24, py - unit * 0.06, unit * 0.06, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#c9ced2"; c.beginPath(); c.arc(px - unit * 0.18, py, unit * 0.06, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(30, 60, 140, 0.85)"; c.lineWidth = 3;
  c.beginPath(); c.moveTo(px - unit * 0.1, py); c.bezierCurveTo(px - unit * 0.9, py + unit * (narrow ? -0.6 : 0.6), cx + bw * 0.8, cy - bh * 0.1, cx + bw * 0.35, cy - bh * 0.05); c.stroke();
  c.fillStyle = "#1d1f22"; c.font = `700 ${Math.max(8, Math.round(unit * 0.12))}px Arial, sans-serif`; c.fillText("GN2", px + unit * 0.22, py + unit * 0.05);
  // Tool cart: red top, drawers.
  const [tx, ty] = narrow ? [w * 0.16, belowY] : [w * 0.12, h * 0.78];
  box(tx, ty, unit * 0.8, unit * 0.5, "#b8322c", "#7c1f1b");
  c.strokeStyle = "rgba(255, 255, 255, 0.45)"; c.lineWidth = 1;
  for (let k = 1; k < 4; k += 1) { c.beginPath(); c.moveTo(tx - unit * 0.36, ty - unit * 0.25 + k * unit * 0.12); c.lineTo(tx + unit * 0.36, ty - unit * 0.25 + k * unit * 0.12); c.stroke(); }
  // Work stand: frame with a top tray and casters.
  const [sx, sy] = narrow ? [cx - bw + tape + unit * 0.55, cy + bh - tape - unit * 0.5] : [w * 0.13, h * 0.42];
  softBlob(c, sx + unit * 0.1, sy + unit * 0.12, unit * 0.6, unit * 0.45, "30, 38, 46", 0.3);
  c.strokeStyle = "#5d6870"; c.lineWidth = 4; c.strokeRect(sx - unit * 0.42, sy - unit * 0.3, unit * 0.84, unit * 0.6);
  c.fillStyle = "rgba(120, 132, 142, 0.7)"; c.fillRect(sx - unit * 0.3, sy - unit * 0.18, unit * 0.6, unit * 0.36);
  c.fillStyle = "#22272b";
  for (const [ox, oy] of [[-0.42, -0.3], [0.42, -0.3], [-0.42, 0.3], [0.42, 0.3]]) { c.beginPath(); c.arc(sx + ox * unit, sy + oy * unit, 4, 0, Math.PI * 2); c.fill(); }
  // Platform ladder: rails and treads.
  const [lx, ly] = narrow ? [cx + bw - tape - unit * 0.35, cy + bh * 0.4] : [w * 0.88, h * 0.74];
  softBlob(c, lx + unit * 0.08, ly + unit * 0.1, unit * 0.35, unit * 0.7, "30, 38, 46", 0.3);
  c.strokeStyle = "#c9a227"; c.lineWidth = 4;
  c.beginPath(); c.moveTo(lx - unit * 0.18, ly - unit * 0.6); c.lineTo(lx - unit * 0.18, ly + unit * 0.6); c.moveTo(lx + unit * 0.18, ly - unit * 0.6); c.lineTo(lx + unit * 0.18, ly + unit * 0.6); c.stroke();
  c.lineWidth = 3;
  for (let k = -4; k <= 4; k += 1) { c.beginPath(); c.moveTo(lx - unit * 0.18, ly + k * unit * 0.13); c.lineTo(lx + unit * 0.18, ly + k * unit * 0.13); c.stroke(); }
  c.fillStyle = "#9aa4ab"; c.fillRect(lx - unit * 0.24, ly - unit * 0.78, unit * 0.48, unit * 0.2);
  // Shipping crate (left, wide screens only): plywood with battens.
  if (!narrow) {
    const kx = w * 0.12, ky = h * 0.6;
    box(kx, ky, unit * 1.0, unit * 0.5, "#c8a26c", "#8f6f45");
    c.strokeStyle = "rgba(90, 64, 34, 0.7)"; c.lineWidth = 2;
    for (let k = 0; k < 4; k += 1) { c.beginPath(); c.moveTo(kx - unit * 0.5 + k * unit * 0.333, ky - unit * 0.25); c.lineTo(kx - unit * 0.5 + k * unit * 0.333, ky + unit * 0.25); c.stroke(); }
  }
  // Far wall: light panels, observation window, return-air grilles, kick plate.
  c.fillStyle = "#e8ebee"; c.fillRect(0, 0, w, horizonY);
  c.strokeStyle = "rgba(120, 132, 142, 0.5)"; c.lineWidth = 1;
  for (let x = 0; x < w; x += w / 9) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, horizonY - 8); c.stroke(); }
  const window = c.createLinearGradient(0, horizonY * 0.18, 0, horizonY * 0.62);
  window.addColorStop(0, "#2b3a48"); window.addColorStop(1, "#4b5f70");
  c.fillStyle = window; c.fillRect(w * 0.32, horizonY * 0.18, w * 0.36, horizonY * 0.44);
  c.strokeStyle = "rgba(255, 255, 255, 0.35)"; c.lineWidth = 2;
  c.beginPath(); c.moveTo(w * 0.35, horizonY * 0.58); c.lineTo(w * 0.42, horizonY * 0.22); c.moveTo(w * 0.45, horizonY * 0.58); c.lineTo(w * 0.5, horizonY * 0.3); c.stroke();
  c.strokeStyle = "#9aa4ab"; c.lineWidth = 3; c.strokeRect(w * 0.32, horizonY * 0.18, w * 0.36, horizonY * 0.44);
  c.fillStyle = "rgba(110, 122, 132, 0.55)";
  for (const gx of [0.06, 0.8]) for (let x = w * gx; x < w * (gx + 0.14); x += 5) c.fillRect(x, horizonY * 0.3, 2.5, horizonY * 0.32);
  c.fillStyle = "#8f99a2"; c.fillRect(0, horizonY - 8, w, 8);
  // Wall sign under the window, shortened when the full line will not fit.
  c.fillStyle = "rgba(40, 50, 60, 0.65)"; c.font = `700 ${Math.max(8, Math.round(horizonY * 0.13))}px Arial, sans-serif`; c.textAlign = "center";
  const sign = "CLEAN ROOM  \u00B7  ISO 8  \u00B7  GOWNS AND ESD STRAPS REQUIRED";
  c.fillText(c.measureText(sign).width < w * 0.9 ? sign : "CLEAN ROOM  \u00B7  ISO 8", w / 2, horizonY * 0.8);
  groundShadow(c, w, h, 0.32);
  vignette(c, w, h, 0.16);
}

// (c) Poster: the Milky Way with dust lanes, colored stars and a few spiked bright stars; Saturn
// with banded clouds, its main rings and the Cassini Division, and the rings' shadow on the
// planet; Titan's hazy globe with latitude bands, the bluish detached haze layer above its limb;
// a small icy moon. Saturn cannot be seen through the haze from Titan's surface.
function paintSaturn(c, w, h) {
  const rand = seeded(7);
  const space = c.createRadialGradient(w * 0.7, h * 0.2, 0, w * 0.5, h * 0.5, Math.max(w, h));
  space.addColorStop(0, "#161b30");
  space.addColorStop(1, "#03040a");
  c.fillStyle = space;
  c.fillRect(0, 0, w, h);
  // Milky Way: a diagonal glowing band with dark dust lanes and dense faint stars.
  const along = (t) => [w * (0.3 + 0.75 * t), h * (-0.05 + 0.8 * t)];
  for (let i = 0; i < 70; i += 1) {
    const [x, y] = along(rand());
    const r = Math.max(w, h) * (0.04 + rand() * 0.08);
    softBlob(c, x + (rand() - 0.5) * w * 0.05, y + (rand() - 0.5) * h * 0.05, r, r * 0.6, rand() < 0.5 ? "170, 180, 230" : "230, 210, 190", 0.05);
  }
  for (let i = 0; i < 26; i += 1) {
    const [x, y] = along(rand());
    softBlob(c, x, y, Math.max(w, h) * 0.03, Math.max(w, h) * 0.012, "4, 4, 10", 0.35);
  }
  for (let i = 0; i < 900; i += 1) {
    const [x, y] = along(rand());
    c.fillStyle = `rgba(255, 255, 255, ${0.15 + rand() * 0.4})`;
    c.fillRect(x + (rand() - 0.5) * w * 0.14, y + (rand() - 0.5) * h * 0.14, 1, 1);
  }
  const tints = ["255, 255, 255", "200, 220, 255", "255, 236, 200", "255, 210, 190"];
  for (let i = 0; i < 520; i += 1) {
    const x = rand() * w, y = rand() * h, big = rand() < 0.06;
    const tint = tints[Math.floor(rand() * tints.length)];
    if (big) softBlob(c, x, y, 4, 4, tint, 0.5);
    c.fillStyle = `rgba(${tint}, ${0.35 + rand() * 0.6})`;
    c.beginPath(); c.arc(x, y, big ? 1.4 : 0.4 + rand() * 0.7, 0, Math.PI * 2); c.fill();
  }
  for (let i = 0; i < 4; i += 1) {
    const x = rand() * w, y = rand() * h * 0.7, size = 9 + rand() * 10;
    softBlob(c, x, y, size * 0.6, size * 0.6, "220, 230, 255", 0.6);
    c.strokeStyle = "rgba(220, 230, 255, 0.55)"; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x - size, y); c.lineTo(x + size, y); c.moveTo(x, y - size); c.lineTo(x, y + size); c.stroke();
  }
  // Saturn (upper right): rings behind, globe with bands and the rings' shadow, rings in front.
  // Placed clear of the telemetry text on the right and the title; smaller on a phone.
  const wide = w > h;
  const sx = w * (wide ? 0.74 : 0.78), sy = h * (wide ? 0.11 : 0.085), sr = Math.min(w, h) * (wide ? 0.075 : 0.06), tilt = -0.38, flat = 0.27;
  const rings = [
    [1.24, 1.52, "rgba(150, 132, 104, 0.25)"], // C ring (faint)
    [1.53, 1.94, "rgba(226, 206, 160, 0.85)"], // B ring (brightest)
    [1.94, 2.02, "rgba(10, 10, 16, 0.85)"], // Cassini Division
    [2.02, 2.27, "rgba(206, 188, 146, 0.7)"], // A ring
    [2.13, 2.145, "rgba(10, 10, 16, 0.8)"], // Encke Gap
  ];
  const drawRings = (start, end) => {
    c.save();
    c.translate(sx, sy);
    c.rotate(tilt);
    c.scale(1, flat);
    for (const [inner, outer, color] of rings) {
      c.strokeStyle = color;
      c.lineWidth = (outer - inner) * sr;
      c.beginPath(); c.arc(0, 0, (inner + outer) / 2 * sr, start, end); c.stroke();
    }
    c.restore();
  };
  drawRings(Math.PI, Math.PI * 2);
  c.save();
  c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI * 2); c.clip();
  const globe = c.createLinearGradient(sx - sr, sy - sr, sx + sr, sy + sr);
  globe.addColorStop(0, "#f2e1b5");
  globe.addColorStop(0.55, "#d6b77c");
  globe.addColorStop(1, "#4d3c22");
  c.fillStyle = globe;
  c.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  const bands = [[-0.75, "150, 160, 175", 0.25], [-0.5, "170, 140, 90", 0.25], [-0.25, "230, 210, 160", 0.25], [-0.05, "180, 140, 85", 0.3], [0.18, "235, 215, 170", 0.2], [0.42, "165, 128, 80", 0.28], [0.65, "200, 175, 130", 0.2]];
  for (const [band, color, alpha] of bands) {
    c.save();
    c.translate(sx, sy); c.rotate(tilt);
    c.fillStyle = `rgba(${color}, ${alpha})`;
    c.fillRect(-sr * 1.2, band * sr - sr * 0.07, sr * 2.4, sr * 0.14);
    c.restore();
  }
  c.save();
  c.translate(sx, sy); c.rotate(tilt); c.scale(1, flat * 0.9);
  c.strokeStyle = "rgba(20, 14, 8, 0.55)"; c.lineWidth = sr * 0.35;
  c.beginPath(); c.arc(0, sr * 0.9, sr * 1.7, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  c.restore();
  const limb = c.createRadialGradient(sx - sr * 0.35, sy - sr * 0.35, sr * 0.2, sx, sy, sr * 1.05);
  limb.addColorStop(0, "rgba(0, 0, 0, 0)");
  limb.addColorStop(1, "rgba(0, 0, 0, 0.55)");
  c.fillStyle = limb;
  c.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  c.restore();
  drawRings(0, Math.PI);
  // A small icy moon with a lit crescent.
  const mx = sx - sr * 3.2, my = sy + sr * 0.9, mr = Math.max(3, sr * 0.09);
  c.fillStyle = "#1a1c22"; c.beginPath(); c.arc(mx, my, mr, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#e8eef4"; c.beginPath(); c.arc(mx, my, mr, Math.PI * 0.6, Math.PI * 1.4); c.arc(mx + mr * 0.45, my, mr * 0.9, Math.PI * 1.4, Math.PI * 0.6, true); c.fill();
  // Titan (bottom left): glow beyond the limb, the detached blue haze layer, the hazy globe.
  const tx = w * 0.28, ty = h * 1.25, tr = Math.max(w, h) * 0.78;
  const glow = c.createRadialGradient(tx, ty, tr * 0.97, tx, ty, tr * 1.09);
  glow.addColorStop(0, "rgba(200, 140, 80, 0.45)");
  glow.addColorStop(1, "rgba(200, 140, 80, 0)");
  c.fillStyle = glow;
  c.beginPath(); c.arc(tx, ty, tr * 1.09, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(130, 170, 235, 0.55)";
  c.lineWidth = Math.max(2, tr * 0.004);
  c.beginPath(); c.arc(tx, ty, tr * 1.025, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = "rgba(130, 170, 235, 0.2)";
  c.lineWidth = Math.max(4, tr * 0.012);
  c.beginPath(); c.arc(tx, ty, tr * 1.025, 0, Math.PI * 2); c.stroke();
  const titan = c.createRadialGradient(tx + tr * 0.35, ty - tr * 0.55, tr * 0.1, tx, ty, tr);
  titan.addColorStop(0, "#eeb066");
  titan.addColorStop(0.6, "#bc7532");
  titan.addColorStop(1, "#5a2e12");
  c.fillStyle = titan;
  c.beginPath(); c.arc(tx, ty, tr, 0, Math.PI * 2); c.fill();
  c.save();
  c.beginPath(); c.arc(tx, ty, tr, 0, Math.PI * 2); c.clip();
  // Haze mottling stretched along the latitude lines, a few bright methane cloud streaks, the
  // darker north polar hood near the top limb, and the night side toward the left.
  for (let i = 0; i < 90; i += 1) {
    const x = rand() * w, y = rand() * h, heading = Math.atan2(y - ty, x - tx) + Math.PI / 2;
    if (Math.hypot(x - tx, y - ty) > tr) continue;
    softBlob(c, x, y, tr * (0.05 + rand() * 0.09), tr * (0.012 + rand() * 0.015), rand() < 0.5 ? "250, 200, 130" : "110, 56, 20", 0.08 + rand() * 0.08, heading);
  }
  for (let i = 0; i < 4; i += 1) {
    const angle = Math.PI * (1.3 + rand() * 0.35), radius = tr * (0.9 + rand() * 0.07);
    const x = tx + Math.cos(angle) * radius, y = ty + Math.sin(angle) * radius;
    softBlob(c, x, y, tr * (0.03 + rand() * 0.03), tr * 0.006, "255, 250, 240", 0.45, angle + Math.PI / 2);
  }
  c.strokeStyle = "rgba(70, 40, 24, 0.28)";
  c.lineWidth = tr * 0.05;
  c.beginPath(); c.arc(tx, ty, tr * 0.975, Math.PI * 1.22, Math.PI * 1.5); c.stroke();
  const night = c.createLinearGradient(0, 0, w * 0.5, 0);
  night.addColorStop(0, "rgba(24, 10, 4, 0.5)");
  night.addColorStop(1, "rgba(24, 10, 4, 0)");
  c.fillStyle = night;
  c.fillRect(0, 0, w * 0.5, h);
  for (let k = 0; k < 9; k += 1) {
    c.strokeStyle = k % 2 ? "rgba(255, 220, 160, 0.06)" : "rgba(90, 44, 16, 0.08)";
    c.lineWidth = tr * 0.025;
    c.beginPath(); c.arc(tx, ty, tr * (0.88 + k * 0.012), Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  }
  const rim = c.createRadialGradient(tx, ty, tr * 0.9, tx, ty, tr);
  rim.addColorStop(0, "rgba(255, 210, 140, 0)");
  rim.addColorStop(1, "rgba(255, 220, 160, 0.35)");
  c.fillStyle = rim;
  c.fillRect(0, 0, w, h);
  c.restore();
  // Poster frame and title.
  c.strokeStyle = "rgba(255, 255, 255, 0.22)";
  c.lineWidth = 1;
  c.strokeRect(10, 10, w - 20, h - 20);
  c.fillStyle = "rgba(255, 255, 255, 0.55)";
  c.font = `700 ${Math.max(10, Math.round(h * 0.022))}px Arial, sans-serif`;
  c.textAlign = "center";
  c.fillText("T I T A N    \u00B7    S A T U R N", w / 2, 30);
  vignette(c, w, h, 0.22);
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
  // Colors are fixed per temperature (thermal-scale.mjs), so the air's color never depends on the legend range.
  const [r, g, b] = thermalRgb(systemsModel.ambientC);
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
  // White grid at the same weights as the yellow one, so the view keeps its drafting grid.
  drawGrid(ctx, w, h, whiteLines);
  vignette(ctx, w, h, 0.4);
}

// lines: [spacing px, color, width px], centered on the view.
function drawGrid(c, w, h, lines) {
  for (const [spacing, color, width] of lines) {
    c.strokeStyle = color;
    c.lineWidth = width;
    const offset = width % 2 ? 0.5 : 0;
    for (let x = (w / 2) % spacing; x < w; x += spacing) { c.beginPath(); c.moveTo(x + offset, 0); c.lineTo(x + offset, h); c.stroke(); }
    for (let y = (h / 2) % spacing; y < h; y += spacing) { c.beginPath(); c.moveTo(0, y + offset); c.lineTo(w, y + offset); c.stroke(); }
  }
}

// Plain drafting grids for the Thermal layer, so every color on the scale stands out.
// lines: [spacing px, color, width px]; frame: optional border color.
function gridPaper(base, top, lines, frame) {
  return (c, w, h) => {
    const paper = c.createLinearGradient(0, 0, 0, h);
    paper.addColorStop(0, top);
    paper.addColorStop(1, base);
    c.fillStyle = paper;
    c.fillRect(0, 0, w, h);
    drawGrid(c, w, h, lines);
    if (frame) {
      c.strokeStyle = frame;
      c.lineWidth = 2;
      c.strokeRect(8, 8, w - 16, h - 16);
    }
  };
}
const yellowLines = [[12, "rgba(255, 210, 40, 0.2)", 1], [60, "rgba(255, 210, 40, 0.6)", 2]];
const whiteLines = [[12, "rgba(255, 255, 255, 0.2)", 1], [60, "rgba(255, 255, 255, 0.6)", 2]];
const paintThermalLight = gridPaper("#c4c9cd", "#dde0e3", [[12, "rgba(20, 24, 28, 0.08)", 1], [60, "rgba(20, 24, 28, 0.24)", 1.5]]);
const paintThermalDark = gridPaper("#050607", "#0d0f11", yellowLines);
const paintInternalYellow = gridPaper("#050607", "#0d0f11", yellowLines, "rgba(255, 210, 40, 0.8)");

// Text and line colors for the readouts and drawing marks on each backdrop.
const ink = {
  light: { text: "rgba(18, 24, 30, 0.92)", halo: "rgba(255, 255, 255, 0.75)", line: "rgba(18, 24, 30, 0.7)", box: "rgba(226, 230, 233, 0.9)" },
  yellow: { text: "rgba(255, 214, 48, 0.98)", halo: "rgba(0, 0, 0, 0.9)", line: "rgba(255, 214, 48, 0.95)", box: "rgba(6, 7, 8, 0.92)" },
  blue: { text: "rgba(210, 236, 255, 0.95)", halo: "rgba(0, 0, 0, 0.8)", line: "rgba(200, 232, 255, 0.85)", box: "rgba(11, 39, 71, 0.9)" },
  default: { text: "rgba(223, 239, 255, 0.86)", halo: "rgba(0, 0, 0, 0.8)", line: "rgba(200, 232, 255, 0.85)", box: "rgba(11, 39, 71, 0.9)" },
};
// Colors for the current backdrop: light (clean room, light grey), yellow (yellow modes), blue (blueprint).
export function backdropInk() {
  const layer = state.missionLayer;
  if (layer === "internal") return internal === "yellow" ? ink.yellow : ink.blue;
  if (layer === "thermal") return thermal === "light" ? ink.light : thermal === "dark" ? ink.yellow : ink.default;
  return exterior === "cleanroom" ? ink.light : ink.default;
}

const painters = {
  titan: paintTitan, cleanroom: paintCleanroom, saturn: paintSaturn, blueprint: paintBlueprint,
  "thermal-light": paintThermalLight, "thermal-dark": paintThermalDark, "internal-yellow": paintInternalYellow,
};

// Behind the vehicle (called before the diagram is drawn).
export function drawMissionBackdrop(ctx, w, h) {
  const layer = state.missionLayer;
  if (layer === "thermal" && thermal === "air") { drawThermalAir(ctx, w, h); return; }
  const kind = layer === "thermal" ? `thermal-${thermal}` : layer === "internal" ? (internal === "yellow" ? "internal-yellow" : "blueprint") : exterior;
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
    const colors = backdropInk();
    ctx.strokeStyle = colors.line;
    ctx.fillStyle = colors.line;
    ctx.lineWidth = internal === "yellow" ? 1.5 : 1;
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
      let my = Math.min(h - 14, Math.max(14, (a.y + b.y) / 2));
      // Keep clear of the telemetry readouts at the top left (ALT / V/S / SPD).
      if (mx - width / 2 < 170 && my > 80 && my < 152) my = 160;
      ctx.fillStyle = colors.box;
      ctx.fillRect(mx - width / 2, my - 8, width, 16);
      ctx.fillStyle = colors.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, mx, my);
      ctx.fillStyle = colors.line;
    }
    // Title block, bottom left, above the a / b picker.
    const lines = ["DRAGONFLY ROTORCRAFT LANDER", "Internal arrangement, 2023 configuration", "Nose left / units m / illustrative", "Envelope 3.85 x 3.85 x 1.75 m (published)"];
    ctx.font = "700 10px SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const boxW = Math.max(...lines.map(text => ctx.measureText(text).width)) + 16, boxH = lines.length * 14 + 10;
    const x = 14, y = h - 58 - boxH;
    ctx.fillStyle = colors.box;
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = colors.line;
    ctx.strokeRect(x + 0.5, y + 0.5, boxW, boxH);
    ctx.fillStyle = colors.text;
    lines.forEach((text, index) => ctx.fillText(text, x + 8, y + 18 + index * 14));
  } else if (layer === "thermal" && thermal === "air") {
    // Above the a / b / c picker.
    ctx.font = "700 11px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(220, 230, 255, 0.85)";
    ctx.textAlign = "left";
    ctx.fillText(`Background: Titan air ${Math.round(systemsModel.ambientC)} C (dimmed so parts at air temperature stay visible)`, 14, h - 58);
  }
  ctx.restore();
}

// a / b / c picker for the Exterior and Thermal backdrops (bottom left of the vehicle view).
function showPicker() {
  const picker = $("backdrop-picker");
  const layer = state.missionLayer;
  picker.hidden = state.view !== "mission";
  if (picker.hidden) return;
  const choices = layer === "thermal" ? thermalBackdrops : layer === "internal" ? internalBackdrops : exteriorBackdrops;
  const current = layer === "thermal" ? thermal : layer === "internal" ? internal : exterior;
  picker.setAttribute("aria-label", `${layer[0].toUpperCase()}${layer.slice(1)} background`);
  picker.querySelectorAll("[data-choice]").forEach((button, index) => {
    const choice = choices[index];
    button.hidden = !choice;
    if (!choice) return;
    button.setAttribute("aria-pressed", String(choice.id === current));
    button.title = `${choice.letter}: ${choice.name}`;
  });
  $("backdrop-name").textContent = choices.find(b => b.id === current).name.replace(/ \(.*\)$/, "");
}

$("backdrop-picker").querySelectorAll("[data-choice]").forEach((button, index) => {
  button.addEventListener("click", () => {
    if (state.missionLayer === "thermal") {
      thermal = thermalBackdrops[index].id;
      try { localStorage.setItem(THERMAL_PREF_KEY, thermal); } catch { /* optional */ }
    } else if (state.missionLayer === "internal") {
      if (!internalBackdrops[index]) return;
      internal = internalBackdrops[index].id;
      try { localStorage.setItem(INTERNAL_PREF_KEY, internal); } catch { /* optional */ }
    } else {
      exterior = exteriorBackdrops[index].id;
      try { localStorage.setItem(PREF_KEY, exterior); } catch { /* optional */ }
    }
    showPicker();
  });
});
export const updateBackdropPicker = showPicker;
