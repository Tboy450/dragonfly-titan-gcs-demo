// Archived draft (2026-10-09, never published): first version of the new Exterior a/b/c
// backdrops. Problems: in (b) the shipping crate sat under the left telemetry text; in (c) Saturn
// sat under the right telemetry text. Reference copy of the painter block from
// dist/ui/mission-backdrop.mjs; it uses that module's seeded(), groundImage, groundShadow() and
// vignette().

// Soft round blob (for patches, glows and light pools): a radial gradient from color to clear.
function softBlob(c, x, y, rx, ry, color, alpha) {
  c.save();
  c.translate(x, y);
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
  // Floor plane: X across (tiles, 0 at the center) and depth D (0 at the bottom edge).
  const d0 = 5, tilesAcross = 7;
  const s0 = w / tilesAcross;
  const yAt = (D) => horizonY + (h - horizonY) * d0 / (D + d0);
  const xAt = (X, D) => w / 2 + X * s0 * d0 / (D + d0);
  // Reflections of the overhead light panels on the epoxy.
  for (let row = 0; row < 5; row += 1) {
    for (const X of [-2.2, 0, 2.2]) {
      const D = 0.6 + row * 2.2, scale = d0 / (D + d0);
      softBlob(c, xAt(X, D), yAt(D), s0 * 0.9 * scale, s0 * 0.32 * scale, "255, 255, 255", 0.35);
    }
  }
  // Tiles: grout lines and perforations.
  c.strokeStyle = "rgba(84, 96, 106, 0.35)";
  c.lineWidth = 1;
  for (let X = -12; X <= 12; X += 1) { c.beginPath(); c.moveTo(xAt(X - 0.5, 0), h); c.lineTo(xAt(X - 0.5, 60), yAt(60)); c.stroke(); }
  for (let D = 0; D < 40; D += 1) { c.beginPath(); c.moveTo(0, yAt(D)); c.lineTo(w, yAt(D)); c.stroke(); }
  c.fillStyle = "rgba(70, 80, 90, 0.28)";
  for (let D = 0; D < 14; D += 1) {
    for (let X = -6; X <= 6; X += 1) {
      for (let i = 1; i < 6; i += 1) {
        for (let j = 1; j < 6; j += 1) {
          const dx = X - 0.5 + i / 6, dd = D + j / 6, size = Math.max(0.6, 2.2 * d0 / (dd + d0));
          c.fillRect(xAt(dx, dd) - size / 2, yAt(dd) - size / 2, size, size);
        }
      }
    }
  }
  // Cable covers along the floor and an ESD ground strap.
  c.fillStyle = "rgba(50, 56, 62, 0.55)";
  c.beginPath(); c.moveTo(xAt(-3.3, 0), h); c.lineTo(xAt(-3.0, 0), h); c.lineTo(xAt(-3.0, 30), yAt(30)); c.lineTo(xAt(-3.3, 30), yAt(30)); c.fill();
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
  for (let k = -bh * 4; k < bw * 4; k += tape * 1.4) { c.beginPath(); c.moveTo(cx - bw - tape + k, cy - bh - tape); c.lineTo(cx - bw - tape + k - bh * 2.4, cy + bh + tape); c.stroke(); }
  c.restore();
  c.fillStyle = "rgba(196, 40, 32, 0.75)";
  c.font = `800 ${Math.max(10, Math.round(ppm * 0.22))}px Arial, sans-serif`;
  c.textAlign = "center";
  c.fillText("KEEP OUT", cx, cy - bh - tape * 1.4);
  c.fillText("KEEP OUT", cx, cy + bh + tape * 2.6);
  // Equipment, each with a soft shadow. box(x, y, width, depth, top color, side color)
  const box = (x, y, bw2, bd, top, side) => {
    softBlob(c, x + bw2 * 0.12, y + bd * 0.18, bw2 * 0.75, bd * 0.75, "30, 38, 46", 0.35);
    c.fillStyle = side; c.fillRect(x - bw2 / 2, y - bd / 2 + bd * 0.12, bw2, bd);
    c.fillStyle = top; c.fillRect(x - bw2 / 2, y - bd / 2, bw2, bd);
  };
  const unit = ppm;
  // Nitrogen purge cart (upper right): cart, green cylinder seen from above, regulator, hose to the vehicle.
  const px = w * 0.86, py = h * 0.36;
  box(px, py, unit * 0.9, unit * 0.6, "#8c969e", "#5c656c");
  c.fillStyle = "#2f7d4f"; c.beginPath(); c.arc(px - unit * 0.18, py, unit * 0.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = "rgba(255, 255, 255, 0.35)"; c.beginPath(); c.arc(px - unit * 0.24, py - unit * 0.06, unit * 0.06, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#c9ced2"; c.beginPath(); c.arc(px - unit * 0.18, py, unit * 0.06, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(30, 60, 140, 0.85)"; c.lineWidth = 3;
  c.beginPath(); c.moveTo(px - unit * 0.1, py); c.bezierCurveTo(px - unit * 0.9, py + unit * 0.6, cx + bw * 0.8, cy - bh * 0.1, cx + bw * 0.35, cy - bh * 0.05); c.stroke();
  c.fillStyle = "#1d1f22"; c.font = `700 ${Math.max(8, Math.round(unit * 0.12))}px Arial, sans-serif`; c.fillText("GN2", px + unit * 0.22, py + unit * 0.05);
  // Tool cart (lower left): red top, drawers.
  const tx = w * 0.12, ty = h * 0.78;
  box(tx, ty, unit * 0.8, unit * 0.5, "#b8322c", "#7c1f1b");
  c.strokeStyle = "rgba(255, 255, 255, 0.45)"; c.lineWidth = 1;
  for (let k = 1; k < 4; k += 1) { c.beginPath(); c.moveTo(tx - unit * 0.36, ty - unit * 0.25 + k * unit * 0.12); c.lineTo(tx + unit * 0.36, ty - unit * 0.25 + k * unit * 0.12); c.stroke(); }
  // Work stand (left middle): frame with a top tray and casters.
  const sx = w * 0.13, sy = h * 0.42;
  softBlob(c, sx + unit * 0.1, sy + unit * 0.12, unit * 0.6, unit * 0.45, "30, 38, 46", 0.3);
  c.strokeStyle = "#5d6870"; c.lineWidth = 4; c.strokeRect(sx - unit * 0.42, sy - unit * 0.3, unit * 0.84, unit * 0.6);
  c.fillStyle = "rgba(120, 132, 142, 0.7)"; c.fillRect(sx - unit * 0.3, sy - unit * 0.18, unit * 0.6, unit * 0.36);
  c.fillStyle = "#22272b";
  for (const [ox, oy] of [[-0.42, -0.3], [0.42, -0.3], [-0.42, 0.3], [0.42, 0.3]]) { c.beginPath(); c.arc(sx + ox * unit, sy + oy * unit, 4, 0, Math.PI * 2); c.fill(); }
  // Platform ladder (right, lower): rails and treads.
  const lx = w * 0.88, ly = h * 0.74;
  softBlob(c, lx + unit * 0.08, ly + unit * 0.1, unit * 0.35, unit * 0.7, "30, 38, 46", 0.3);
  c.strokeStyle = "#c9a227"; c.lineWidth = 4;
  c.beginPath(); c.moveTo(lx - unit * 0.18, ly - unit * 0.6); c.lineTo(lx - unit * 0.18, ly + unit * 0.6); c.moveTo(lx + unit * 0.18, ly - unit * 0.6); c.lineTo(lx + unit * 0.18, ly + unit * 0.6); c.stroke();
  c.lineWidth = 3;
  for (let k = -4; k <= 4; k += 1) { c.beginPath(); c.moveTo(lx - unit * 0.18, ly + k * unit * 0.13); c.lineTo(lx + unit * 0.18, ly + k * unit * 0.13); c.stroke(); }
  c.fillStyle = "#9aa4ab"; c.fillRect(lx - unit * 0.24, ly - unit * 0.78, unit * 0.48, unit * 0.2);
  // Shipping crate (top left, far): plywood with battens.
  box(w * 0.2, h * 0.22, unit * 1.2, unit * 0.55, "#c8a26c", "#8f6f45");
  c.strokeStyle = "rgba(90, 64, 34, 0.7)"; c.lineWidth = 2;
  for (let k = 0; k < 4; k += 1) { c.beginPath(); c.moveTo(w * 0.2 - unit * 0.6 + k * unit * 0.4, h * 0.22 - unit * 0.27); c.lineTo(w * 0.2 - unit * 0.6 + k * unit * 0.4, h * 0.22 + unit * 0.27); c.stroke(); }
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
  c.fillStyle = "rgba(40, 50, 60, 0.6)"; c.font = `700 ${Math.max(8, Math.round(horizonY * 0.14))}px Arial, sans-serif`; c.textAlign = "left";
  c.fillText("CLEAN ROOM  ISO 8  /  GOWNS AND ESD STRAPS REQUIRED", w * 0.06, horizonY * 0.2);
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
  const along = (t) => [w * (-0.1 + 1.2 * t), h * (0.95 - 1.0 * t)];
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
  const sx = w * 0.8, sy = h * 0.21, sr = Math.min(w, h) * 0.095, tilt = -0.38, flat = 0.27;
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
  softBlob(c, tx, ty, tr * 1.12, tr * 1.12, "120, 150, 210", 0.0);
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

