// Titan tutorial (TUT-01): checked steps that follow what the player actually does on the
// practice planet — drop, select, move, capture, ride out a hazard, recover the Dragonfly — with
// the button to press highlighted. Pure: the step comes from the battle and a little UI state
// ({ selected }), so it is tested without a page. Replaces the old coach text.
const anyDrone = (b) => b.units.some(u => u.alive && u.side === "swarm" && !u.structure);
const relic = (b) => b.zones.find(z => z.special === "dragonfly");

export const tutorialSteps = Object.freeze([
  { id: "drop", target: "drop-button", text: "Press Drop wave ({drop}), keep the Scouts and Links, then Land on the Hive beacon. Each pod carries up to 3 drones; the wave is one squad.",
    done: (b) => b.stats.drops > 0 },
  { id: "land", target: null, text: "The pods come down under their parachutes. Drones release just above the ground.",
    done: (b) => anyDrone(b) },
  { id: "select", target: "squad-bar", text: "Select the squad: tap its card at the bottom, or click one of your drones.",
    done: (b, ui) => ui.selected > 0 || b.squads.some(s => s.order && s.order.kind !== "hold") },
  { id: "move", target: null, text: "Right-click (or tap) the ground to send the squad there. Drag to move the view, scroll or pinch to zoom, right-drag or {turnLeft}/{turnRight} to turn.",
    done: (b) => b.squads.some(s => s.order && s.order.kind !== "hold") || b.stats.zonesCaptured > 0 },
  { id: "capture", target: null, text: "Right-click (or tap) inside a white beacon ring: the squad flies there and captures it.",
    done: (b) => b.stats.zonesCaptured > 0 },
  { id: "dragonfly", target: null, text: "Capture the Dragonfly landing site (the parked lander) to recover NASA's Dragonfly as a drone.",
    done: (b) => !relic(b) || relic(b).captured || b.specials.includes("dragonfly") },
  { id: "win", target: null, text: "Hold 3 beacons to win, then leave for victory or keep capturing. You can do this!",
    done: (b) => b.zones.filter(z => z.captured && z.kind !== "beachhead").length >= 3 },
]);

// Weather gets its own step while the first front is coming or passing over.
export const hazardStep = Object.freeze({ id: "hazard", target: null, text: "Weather is coming: watch the warning. Drones in zones you hold shelter from it; ride it out, then carry on." });

// The step to show: { step, index (0-based, of tutorialSteps), total, checks: [true/false...] },
// or null when the tutorial is finished (or this is not the practice planet).
export function tutorialState(b, ui = { selected: 0 }) {
  if (!b.practice) return null;
  const checks = tutorialSteps.map(step => !!step.done(b, ui));
  const index = checks.indexOf(false);
  if (index < 0) return null;
  // The first weather front (hazard serial 1) while it is warned or active.
  const weather = anyDrone(b) && b.hazards.events.some(e => e.id === 1 && (e.phase === "warning" || e.phase === "active"));
  return { step: weather ? hazardStep : tutorialSteps[index], index, total: tutorialSteps.length, checks };
}
