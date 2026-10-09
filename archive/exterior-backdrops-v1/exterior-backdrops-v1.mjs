// Archived 2026-10-09: the first Exterior backdrops a / b / c (dist/ui/mission-backdrop.mjs at
// commit 3b0dfc3): paintTitan, paintCleanroom and paintSaturn, with the shared groundShadow and
// vignette helpers they used. Reference copy; see README.md.

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

