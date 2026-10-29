// Camera helpers (CTRL-05): follow the selected squads, remember the newest alert to jump to,
// scroll at the screen edge, and the starting view. Plain functions; the page owns the camera.

// The middle of the selected squads' living drones, or null when none are down yet.
export function squadCenter(units, squads) {
  let x = 0, z = 0, n = 0;
  for (const unit of units) {
    if (!unit.alive || unit.side !== "swarm" || unit.structure || !squads.has(unit.squad)) continue;
    x += unit.x; z += unit.z; n += 1;
  }
  return n ? { x: x / n, z: z / n } : null;
}

// The newest alert: marked artillery or lightning, an eruption, a drone under fire or lost this
// frame, or a mid-mission event announced or landing (OBJ-02). Returns the previous alert when
// nothing newer happened.
const operationAlerts = { supply: "Supply cache", counter: "Counter-attack", reinforce: "Reinforcements" };
export function latestAlert(previous, events, b) {
  let best = previous, units = null;
  const offer = (x, z, at, text) => { if (!best || at >= best.at) best = { x, z, at, text }; };
  for (const strike of b.strikes) if (!strike.hit) offer(strike.x, strike.z, strike.markedAt, strike.source === "lightning" ? "Lightning strike marked" : "Artillery incoming");
  for (const hazard of b.hazards.events) if (hazard.kind === "eruption") offer(hazard.x, hazard.z, hazard.startedAt, hazard.name);
  for (const event of events) {
    if (event.kind === "shot" && event.side !== "swarm") {
      units ??= new Map(b.units.map(unit => [unit.id, unit]));
      const target = units.get(event.to);
      if (target && target.side === "swarm" && !target.structure) offer(target.x, target.z, b.time, "Squad under attack");
    }
  }
  for (const event of events) if (event.kind === "destroyed" && event.side === "swarm" && !event.structure) offer(event.x, event.z, b.time, "Drone lost");
  for (const event of events) if (event.kind === "operation" && event.phase !== "collected") offer(event.x, event.z, b.time, operationAlerts[event.type]);
  return best;
}

// Held zones being retaken (locals inside and no drones, so control falls): one alert per zone,
// raised again only after it is back at full control. `watch` (a Set of zone IDs) is the memory.
export function zoneAlerts(watch, b) {
  const alerts = [];
  for (const zone of b.zones) {
    if (!zone.captured || zone.kind === "beachhead") { watch.delete(zone.id); continue; }
    if (zone.control >= 100) watch.delete(zone.id);
    else if (zone.control < 98 && !watch.has(zone.id)) {
      watch.add(zone.id);
      alerts.push({ x: zone.x, z: zone.z, at: b.time, text: `${zone.name} is being retaken` });
    }
  }
  return alerts;
}

// Squads wiped out this frame (FIX-12): their last drone destroyed and no pods still on the way.
// One alert per squad, where its last drone fell.
export function squadLosses(events, b) {
  const last = new Map();
  for (const event of events) if (event.kind === "destroyed" && event.side === "swarm" && !event.structure && event.squad != null) last.set(event.squad, event);
  const alerts = [];
  for (const [id, event] of last) {
    if (b.units.some(unit => unit.alive && unit.side === "swarm" && !unit.structure && unit.squad === id)) continue;
    if (b.pods.some(pod => !pod.released && pod.squad === id)) continue;
    const squad = b.squads.find(s => s.id === id);
    alerts.push({ x: event.x, z: event.z, at: b.time, text: `${squad?.name || "A squad"} was lost` });
  }
  return alerts;
}

// Where an alert off screen is marked (FIX-12): on the edge of the area the HUD leaves clear,
// along the line from its middle toward the alert. p is the alert's projected screen position
// (visible false when it is behind the camera). Null when the alert is on screen.
export function edgeMarker(p, width, height, { top = 70, bottom = 110, side = 30 } = {}) {
  if (p.visible && p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height) return null;
  const halfW = Math.max(1, width / 2 - side), halfH = Math.max(1, (height - top - bottom) / 2);
  const cx = width / 2, cy = top + halfH;
  let dx = p.x - cx, dy = p.y - cy;
  // Behind the camera the projection is mirrored, and behind is toward the bottom of the screen.
  if (!p.visible) { dx = -dx; dy = Math.abs(dy); }
  if (!dx && !dy) dy = 1;
  const t = Math.min(dx ? halfW / Math.abs(dx) : Infinity, dy ? halfH / Math.abs(dy) : Infinity);
  return { x: cx + dx * t, y: cy + dy * t, angle: Math.atan2(dy, dx) };
}

// Edge scrolling with a mouse: a drag direction (as if dragging the map) when the pointer is
// within `margin` pixels of an edge, else zeros.
export function edgeScroll(x, y, width, height, margin = 14) {
  return { dx: x < margin ? 1 : x > width - margin ? -1 : 0, dy: y < margin ? 1 : y > height - margin ? -1 : 0 };
}

// The starting view: just behind the Hive beacon, looking toward the middle of the map.
export function homeView(b) {
  const home = b.zones.find(zone => zone.kind === "beachhead");
  const away = { x: home.x - b.map.centerX, z: home.z - b.map.centerZ }, length = Math.hypot(away.x, away.z) || 1;
  return { focus: { x: home.x - away.x / length * 70, z: home.z - away.z / length * 70 }, distance: 230, yaw: Math.atan2(away.x, away.z), pitch: 0.9 };
}
