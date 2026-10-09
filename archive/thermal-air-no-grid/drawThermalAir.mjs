// Archived 2026-10-09: the Thermal 'Titan air' backdrop (option a) before it got a white grid
// (dist/ui/mission-backdrop.mjs at commit fb9b232). Solid dimmed air color, drifting streaks, vignette.

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
  vignette(ctx, w, h, 0.4);
}
