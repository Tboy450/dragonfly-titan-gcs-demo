// Field guide (TUT-03): every drone, defender, society and hazard with its numbers and what beats
// it, generated from units.mjs and hazards.mjs so it never drifts from the rules, then the controls
// (ACCESS-01). Plain data; the page renders it.
import { droneTypes, droneOrder, defenderTypes, societies } from "./units.mjs?v=dev";
import { hazardTypes, ventStructureDamage } from "./hazards.mjs?v=dev";
import { alarmStages, artilleryAlarm, salvageMatter, healPerS, zoneIncome, publicMood, upgradeEffects, surrenderControl, surrenderAlarm } from "./battle.mjs?v=dev";
import { defaultKeys, fillKeys } from "./settings.mjs?v=dev";

const classOf = (def) => (def.structure ? "structure" : def.air ? "air" : "ground");
const weaponText = (w) => `${w.name}: ${w.damage}/s against ${w.hits.join(", ")} out to ${w.range} m${w.splash ? `, ${w.splash} m splash` : ""}`;
const bestAgainst = (def, cls) => def.weapons.filter(w => w.hits.includes(cls)).sort((a, c) => c.damage - a.damage)[0] || null;
// The two hardest-hitting units of `pool` against class `cls`, as "Name (damage/s)".
const strongest = (pool, cls) => pool.map(def => ({ def, w: bestAgainst(def, cls) })).filter(x => x.w)
  .sort((a, c) => c.w.damage - a.w.damage).slice(0, 2).map(x => `${x.def.name} (${x.w.damage}/s)`);
const auraText = (aura) => !aura ? null
  : aura.boost ? `Defenders within ${aura.radius} m hit ${Math.round(aura.boost * 100)}% harder`
  : aura.jam ? `Within ${aura.radius} m drones slow down and Links cannot hack`
  : aura.armor ? `Defenses within ${aura.radius} m take ${Math.round(aura.armor * 100)}% less damage` : null;

// A drone's numbers: cost, health, speed, capture, weapons and what threatens it.
export function droneFacts(id) {
  const d = droneTypes[id], defenders = Object.values(defenderTypes);
  return [
    `${d.cost} matter · ${d.slots} wave ${d.slots === 1 ? "slot" : "slots"} · ${d.hp} health · ${d.speed} m/s · flies at ${d.cruise} m · sees ${d.sight} m`,
    `Captures at ${d.capture}/s${d.hack ? "; hacks defended zones" : ""}${d.calm ? "; calms the public in zones" : ""}${d.harvest ? "; lands to drill matter" : ""}${d.limit ? `; at most ${d.limit} per mission` : ""}`,
    ...d.weapons.map(weaponText),
    `Most dangerous to it: ${strongest(defenders, "air").join(", ")}`,
  ];
}

// Tooltips (TUT-04) for the drop panel and the HUD, from the same rules as the guide.
const percent = (factor) => Math.round(Math.abs(1 - factor) * 100);
const rounded = (n) => Math.round(n * 100) / 100;
export const droneTooltip = (id) => [`${droneTypes[id].name}: ${droneTypes[id].role}`, ...droneFacts(id)].join("\n");

// What a hazard does to drones while it lasts; severity scales damage on harder planets.
export function hazardEffects(type, severity = 1) {
  const h = hazardTypes[type];
  if (!h) return [];
  return [
    h.speed && h.speed < 1 ? `${percent(h.speed)}% slower` : null,
    h.sight && h.sight < 1 ? `see ${percent(h.sight)}% less` : null,
    h.range && h.range < 1 ? `weapons reach ${percent(h.range)}% less` : null,
    h.damage && h.kind === "weather" ? `lose ${rounded(h.damage * severity)} health/s outside your zones (half inside)` : null,
    h.kind === "eruption" ? `${rounded(h.damage * severity)} damage/s inside a ${h.radius} m circle, to defenders too (defenses take ${Math.round(ventStructureDamage * 100)}%)` : null,
    h.strikeDamage ? `bolts every ${h.strikeEveryS} s on drones and defenders alike, ${rounded(h.strikeDamage * severity)} damage within ${h.radius} m, marked ${h.strikeWarnS} s ahead` : null,
    h.wind ? `wind pushes drones up to ${h.wind} m/s` : null,
    h.kind === "flare" ? "drones outside your zones are stunned" : null,
  ].filter(Boolean);
}
export function hazardTooltip(type, severity = 1) {
  const h = hazardTypes[type];
  if (!h) return "";
  return [`${h.name}: ${h.advice}`, `While it lasts: ${hazardEffects(type, severity).join(", ")}.`,
    `Lasts ${h.durationS[0]}-${h.durationS[1]} s and returns every ${h.gapS[0]}-${h.gapS[1]} s.`].join("\n");
}

// Counters to the weather (HAZ-03): shelter in held zones and the Weather sealing upgrade.
// sealing is its level (0-3).
export function hazardCounters(sealing = 0) {
  return [
    "Shelter: drones in zones you hold, or landed, take half weather damage, and flares do not stun drones in your zones.",
    sealing ? `Weather sealing level ${sealing}: ${sealing * 20}% less hazard damage.` : "Weather sealing (a Hive upgrade) cuts hazard damage by 20% a level.",
  ];
}
// "about 1:20": forecasts round up to the next 10 s.
export const aboutTime = (seconds) => { const s = Math.ceil(seconds / 10) * 10; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
// The hazard badge's tooltip: the forecast, what the first hazard does, and the counters.
// Damage figures include the planet's severity and the swarm's sealing.
export function forecastTooltip(b, forecast) {
  const scale = (b.hazards?.severity ?? 1) * upgradeEffects(b).hazard;
  const coming = forecast.map(f => f.phase === "active" ? `${f.name} now` : `${f.name} in about ${aboutTime(f.in)}`);
  return [`Forecast: ${coming.join("; ")}.`, forecast[0] ? hazardTooltip(forecast[0].type, scale) : null, ...hazardCounters(b.upgrades?.sealing || 0)].filter(Boolean).join("\n");
}

// The public alarm: where it stands and what each threshold brings on this world.
export function alarmTooltip(b) {
  const society = societies[b.tier];
  if (!society || b.tier === 0) return "Public alarm: nobody lives here, so nothing raises it.";
  const stages = [...alarmStages, ...(society.strikes ? [{ at: artilleryAlarm, text: "Artillery shells your drones." }] : [])].sort((a, c) => a.at - c.at);
  return [`Public alarm: ${Math.round(b.alarm)} of 100 (${publicMood(b.alarm)}).`,
    "Visible drones, kills and civilians caught in crossfire raise it. Links in your zones calm it, and it eases slowly on its own.",
    `${b.alarm < surrenderAlarm ? "Now under" : "Under"} ${surrenderAlarm}: settlements surrender at ${surrenderControl}% control, without a fight.`,
    ...stages.map(s => `${b.alarm >= s.at ? "Now" : "At"} ${s.at}: ${s.text}`)].join("\n");
}

// Matter: what it buys and where it comes from right now.
export function matterTooltip(b) {
  const held = b.zones.filter(z => z.captured && z.value);
  const zones = held.reduce((sum, z) => sum + zoneIncome(b, z), 0);
  const drills = b.units.filter(u => u.alive && u.side === "swarm" && droneTypes[u.type]?.harvest && u.landed && u.alt < 0.5).reduce((sum, u) => sum + droneTypes[u.type].harvest, 0);
  const rate = (n) => String(Math.round(n * 10) / 10);
  return [`Matter pays for drop waves. Income now ${rate(zones + drills)}/s: ${rate(zones)}/s from ${held.length} held ${held.length === 1 ? "zone" : "zones"}${drills ? `, ${rate(drills)}/s from drilling drones` : ""}.`,
    `Each defense destroyed pays ${salvageMatter} salvage (but raises the alarm). Drones in your zones repair ${healPerS} health/s.`].join("\n");
}

// Keyboard first, then mouse and touch. Every essential action has a key; Tab reaches each button.
// "{hold}" and the like become the keys as bound in the settings (CTRL-10).
const controls = [
  { name: "Squads", summary: "Choose who gets your orders", facts: [
    "1-9 select a squad (press again to bring the camera to it; Shift adds or removes it); 0 selects all",
    "Click or tap a drone or a squad card; Shift+drag draws a box around drones",
    "{hold} holds the selected squads where they are",
  ] },
  { name: "Orders", summary: "Send the selected squads", facts: [
    "Enter orders them to the middle of the screen, or attacks the defender there; Shift+Enter adds a waypoint",
    "Right-click the ground to move, or a defender to attack; Shift+right-click adds a waypoint; on touch, tap",
    "{attackMove} arms attack-move for the next order; {patrol} turns patrol on or off",
    "{formation} changes formation: spread (less splash), tight (fits streets), line (a wide front)",
    "{holdFire} holds fire: drones shoot only at what you order them to attack, for a quiet takeover",
  ] },
  { name: "Drop waves", summary: "Buy drones and land them in a zone you hold", facts: [
    "{drop} opens the drop panel; Tab moves between its buttons and Enter presses one",
    "While picking a zone, Enter previews pods at the middle of the screen and Enter again launches",
    "Escape cancels placement and closes the panel",
    "Presets fill the wave with a mix: Assault, Hack team or Scout swarm. Last wave repeats the wave you last sent on this planet, and the next mission there starts with it",
  ] },
  { name: "Camera", summary: "Look around the battle", facts: [
    "{forward} {left} {back} {right} or the arrow keys pan; {turnLeft} and {turnRight} turn; {tiltUp} and {tiltDown} tilt; {zoomOut} and {zoomIn} (or the wheel) zoom",
    "{freeCam} switches to the free camera: {tiltUp} and {tiltDown} (or the wheel) fly up and down, Shift moves faster",
    "{follow} follows the selected squads; {alert} jumps to the newest alert; {resetView} resets the view; {cleanView} hides the panels",
  ] },
  { name: "Mission", summary: "Pause, sound and leaving", facts: [
    "{pause} pauses and resumes; {sound} changes the sound",
    "Escape (or Menu) opens the pause menu: resume, restart, quit to the galaxy with the battle saved, sound and speed",
    "Shortcuts pause while you type or use a menu, and Ctrl, Alt or Cmd shortcuts stay with the browser",
    "Settings (title screen or pause menu) change these keys, the camera speed, the drag direction and the UI size",
  ] },
];

// keys: the bindings from the settings (CTRL-10); the defaults when left out.
export function fieldGuide(keys = defaultKeys()) {
  const drones = droneOrder.map(id => droneTypes[id]), defenders = Object.values(defenderTypes);
  return [
    { section: "Drones", items: droneOrder.map(id => ({ name: droneTypes[id].name, summary: droneTypes[id].role, facts: droneFacts(id) })) },
    { section: "Defenders", items: defenders.map(d => {
      const cls = classOf(d), beats = strongest(drones, cls);
      return {
        name: d.name, summary: d.structure ? "Defense" : d.air ? "Flying defender" : "Troops on foot",
        facts: [
          `${d.hp} health${d.speed ? ` · ${d.speed} m/s` : ""} · sees ${d.sight} m`,
          ...d.weapons.map(weaponText),
          auraText(d.aura),
          beats.length ? `Beaten by: ${beats.join(", ")}` : "No drone weapon reaches it",
        ].filter(Boolean),
      };
    }) },
    { section: "Societies", items: societies.map(s => ({
      name: `${s.name} (level ${s.tier})`, summary: s.description,
      facts: s.tier === 0 ? ["No defenders"] : [
        `Troops: ${defenderTypes[s.militia].name}; defenses: ${s.structures.map(t => defenderTypes[t].name).join(", ")}`,
        `Captures run at ${Math.round(s.resistance * 100)}% speed${s.strikes ? "; artillery answers a full alarm" : ""}`,
        `Settlements surrender at ${surrenderControl}% control while the alarm is under ${surrenderAlarm}, unless civilians were caught in crossfire`,
      ],
    })) },
    { section: "Hazards", items: Object.values(hazardTypes).map(h => ({
      name: h.name, summary: h.advice,
      facts: [`Warning ${h.warnS} s ahead · lasts ${h.durationS[0]}-${h.durationS[1]} s · returns every ${h.gapS[0]}-${h.gapS[1]} s`],
    })) },
    { section: "Controls", items: controls.map(item => ({ ...item, facts: item.facts.map(fact => fillKeys(fact, keys)) })) },
  ];
}
