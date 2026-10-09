// Archived 2026-10-08: draft states of dist/ui/mission-backdrop.mjs that were changed before the
// new Mission backdrops were published (commit 62a129d). Reference copies; see README.md.

// 1. Blueprint draft: dimension labels sat at the exact middle of each line, so a line near the
//    edge of the view put its label partly off screen ("1.75 m" was cut off at the left).
//    In drawMissionBackdropOverlay(), instead of the clamped mx / my:
const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;

// 2. Titan landing area draft: the Huygens ground photo was tiled, leaving visible seams where
//    the tiles met. In paintTitan(), instead of the single stretched drawImage:
const tile = Math.max(w, h) * 0.9;
for (let x = -tile * 0.2; x < w; x += tile) {
  for (let y = h * 0.12; y < h; y += tile * 0.55) c.drawImage(groundImage, x, y, tile, tile * 0.55);
}

// 3. Thermal at the true air color (rendered for this archive, never published): the background
//    used the thermal scale's exact color for -179 C, so every part at air temperature (rotors,
//    arms, skids, fins) blended into it. In drawThermalAir():
const dim = 1; // published: 0.55
