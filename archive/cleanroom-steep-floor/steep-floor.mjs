// Archived (2026-10-09): the clean-room floor projection used by Exterior backdrop b at commit
// 665a669, with a strong perspective (vanishing point at the wall line). Lines 234-272 of
// dist/ui/mission-backdrop.mjs at that commit (the start of paintCleanroom).

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
  c.fillStyle = "rgba(70, 78, 86, 0.4)";
  c.beginPath(); c.moveTo(xAt(-3.3, 0), h); c.lineTo(xAt(-3.0, 0), h); c.lineTo(xAt(-3.0, 30), yAt(30)); c.lineTo(xAt(-3.3, 30), yAt(30)); c.fill();
  // ... (the rest of paintCleanroom was unchanged)
