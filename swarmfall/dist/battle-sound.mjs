// What the optional battle soundscape should sound like (AUD-01/02): continuous levels from the
// battle and the view, and one-shot cues from this frame's events. Pure, so it is tested without
// audio; sound.mjs plays it. Levels and pitches are artistic choices [EST].
const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Weather heard as rain or as wind (the lightning storm brings rain; its strikes are thunder).
const weatherSound = { methaneRain: "rain", acidRain: "rain", lightning: "rain", blizzard: "wind", gusts: "wind", dustStorm: "wind", ashCloud: "wind" };

// view: { x, z, radius } — the ground point in view and roughly how far the view reaches (m).
export function battleMix(b, view) {
  let near = 0;
  for (const unit of b.units) {
    if (unit.alive && unit.side === "swarm" && !unit.structure && (unit.x - view.x) ** 2 + (unit.z - view.z) ** 2 < view.radius ** 2) near += 1;
  }
  // The swarm's hum grows with the drones in view, quickly at first, then gently.
  const hum = clamp01(Math.sqrt(near / 60));
  let rain = 0, wind = 0, rumble = 0;
  for (const event of b.hazards.events) {
    if (event.phase !== "active") continue;
    if (weatherSound[event.type] === "rain") rain = 1;
    if (weatherSound[event.type] === "wind") wind = 1;
    if (event.kind === "eruption") rumble = Math.max(rumble, clamp01(1 - Math.hypot(event.x - view.x, event.z - view.z) / (view.radius * 3)));
  }
  return {
    humGain: 0.12 * hum, humHz: 90 + 40 * hum,
    rainGain: 0.16 * rain, windGain: 0.03 + 0.2 * wind, rumbleGain: 0.35 * rumble,
  };
}

// One-shot cues for this frame's events: near explosions and pod landings, any capture, loss,
// alarm stage, strike or drop, and one cue per weapon sound (the player limits how often each
// repeats). At most `limit` cues, so a big fight never floods the speakers.
export function soundCues(events, view, limit = 8) {
  const cues = [];
  const near = (event) => Math.hypot(event.x - view.x, event.z - view.z) < view.radius * 1.5;
  for (const event of events) {
    if (event.kind === "destroyed" && near(event)) cues.push({ type: "boom", size: event.structure ? 1 : event.side === "swarm" ? 0.4 : 0.6 });
    else if (event.kind === "captured") cues.push({ type: "chime" });
    else if (event.kind === "lost") cues.push({ type: "loss" });
    else if (event.kind === "alarm") cues.push({ type: "siren", stage: event.stage });
    else if (event.kind === "strike") cues.push({ type: event.source === "lightning" ? "thunder" : "boom", size: near(event) ? 1.2 : 0.5 });
    else if (event.kind === "drop") cues.push({ type: "entry" });
    else if (event.kind === "release" && near(event)) cues.push({ type: "chute" });
  }
  const weapons = new Set(events.filter(event => event.kind === "shot").map(event => event.fx || "tracer"));
  for (const fx of weapons) cues.push({ type: "shot", fx });
  return cues.slice(0, limit);
}

// Sound levels the button cycles through (AUD-03): off, then quiet, medium and loud.
export const soundLevels = Object.freeze([0, 0.35, 0.65, 1]);
export const nextSoundLevel = (index) => (index + 1) % soundLevels.length;
