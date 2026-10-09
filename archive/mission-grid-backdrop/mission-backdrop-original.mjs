// Archived 2026-10-08: the Mission view backdrop used until then (from dist/ui/flight-view.mjs at
// commit 417c91b). drawFlight painted this behind the vehicle diagram in every layer, and drawVehicle
// darkened it for the Internal and Thermal layers. Reference copy; restore steps in README.md.

// From drawFlight(), mission view:
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#412318");
  sky.addColorStop(0.28, "#9c4d20");
  sky.addColorStop(0.55, "#191724");
  sky.addColorStop(1, "#081018");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2, h * 0.39 + state.pitch * 34);
  ctx.rotate(-state.roll * 0.28);
  ctx.fillStyle = "rgba(8, 16, 24, 0.52)";
  ctx.fillRect(-w, 0, w * 2, h);
  ctx.strokeStyle = "rgba(124, 231, 255, 0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(0, h * 0.72);
  for (let layer = 0; layer < 7; layer += 1) {
    const y = layer * 34 + Math.sin(state.missionTime * 0.18 + layer) * 4;
    ctx.strokeStyle = `rgba(255, 180, 87, ${0.08 + layer * 0.025})`;
    ctx.lineWidth = 1 + layer * 0.3;
    ctx.beginPath();
    for (let x = -20; x < w + 20; x += 24) {
      const py = y + Math.sin(x * 0.018 + layer * 0.9) * (10 + layer * 2);
      if (x === -20) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  drawGrid(ctx, w, h);
  drawVehicle(ctx, w, h);

// From drawVehicle(), Internal and Thermal layers:
    if (layered) { ctx.fillStyle = "rgba(6, 12, 18, 0.62)"; ctx.fillRect(0, 0, w, h); }

function drawGrid(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(151, 184, 209, 0.11)";
  ctx.lineWidth = 1;
  const spacing = 34;
  for (let x = (w / 2) % spacing; x < w; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = (h / 2) % spacing; y < h; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}
