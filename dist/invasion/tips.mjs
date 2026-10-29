// First-time tips (TUT-02): a short hint the first time something new appears in a battle —
// the first defenders in sight, each kind of defense, each alarm stage, the first artillery and
// the first captured defense. Each tip shows once per device: `seen` is a Set of tip IDs the page
// saves. Pure, so it is tested without a page. Texts follow units.mjs and battle.mjs.
import { droneTypes, wildlifeTypes } from "./units.mjs?v=dev";

export const defenseTips = Object.freeze({
  watchtower: "Watchtowers throw bolts at drones and troops. Strikers knock them out.",
  flak: "Flak guns shred drones in groups out to 110 m. Spread out, or send Strikers and Breachers.",
  radar: "Radar masts make defenders near them hit harder. Destroy the mast first.",
  sam: "Missile batteries reach 150 m. Close in fast, or come round behind buildings and ridges.",
  jammer: "Signal jammers slow drones near them and stop Links hacking. Take them out first.",
  laser: "Laser turrets burn drones, troops and structures. Bring a big wave.",
  shield: "Shield pylons cut damage to defenses near them by two thirds. Destroy the pylon first.",
  interceptor: "Interceptor drones hunt your swarm in the air. Keep squads together.",
});
export const alarmTips = Object.freeze([
  null,
  "The alarm is rising. Links calm the public while they sit in zones; fewer drones near towns keeps it down.",
  "Militia now raid the zones you hold. Leave a few drones in each held zone.",
  "Panic brings artillery: red circles mark where shells land seconds later. Move out of them.",
]);
export const generalTips = Object.freeze({
  defenders: "Defenders spotted. Strikers attack defenses; Links capture zones quietly, even under fire. Right-click or tap a defender to attack it.",
  artillery: "Artillery is marked: a red circle shows where shells land in a few seconds. Move drones out of it.",
  converted: "Captured defenses now fight for you, and Links capture without destroying the guns.",
});
// Wildlife (HAZ-01), the first time a drone sees one.
export const wildlifeTip = (name) => `${name} ahead: wildlife attacks anything that comes near, drones and locals alike. Fly round its ground, or bring guns. Killing it raises no alarm.`;

// Tips due now, in order; their IDs are added to `seen`.
export function newTips(seen, b, events) {
  const tips = [];
  const offer = (id, text) => { if (text && !seen.has(id)) { seen.add(id); tips.push({ id, text }); } };
  for (const event of events) {
    if (event.kind === "alarm") offer(`alarm:${event.stage}`, alarmTips[event.stage]);
    if (event.kind === "artillery") offer("artillery", generalTips.artillery);
  }
  if (b.units.some(unit => unit.alive && unit.converted)) offer("converted", generalTips.converted);
  // Defenders in sight of a drone: the first ones at all, then each new kind of defense.
  const drones = b.units.filter(unit => unit.alive && unit.side === "swarm" && !unit.structure);
  const sees = (unit) => drones.some(drone => (drone.x - unit.x) ** 2 + (drone.z - unit.z) ** 2 < (droneTypes[drone.type]?.sight || 120) ** 2);
  for (const unit of b.units) {
    if (unit.alive && unit.side === "wild" && !seen.has(`wildlife:${unit.type}`) && sees(unit)) offer(`wildlife:${unit.type}`, wildlifeTip(wildlifeTypes[unit.type]?.name || "A creature"));
  }
  for (const unit of b.units) {
    if (!unit.alive || unit.side !== "native") continue;
    const kindDue = defenseTips[unit.type] && !seen.has(`defense:${unit.type}`);
    if (!kindDue && seen.has("defenders")) continue;
    if (!drones.some(drone => (drone.x - unit.x) ** 2 + (drone.z - unit.z) ** 2 < (droneTypes[drone.type]?.sight || 120) ** 2)) continue;
    offer("defenders", generalTips.defenders);
    offer(`defense:${unit.type}`, defenseTips[unit.type]);
  }
  return tips;
}
