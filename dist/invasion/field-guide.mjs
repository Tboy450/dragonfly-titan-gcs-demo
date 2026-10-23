// Field guide (TUT-03): every drone, defender, society and hazard with its numbers and what beats
// it, generated from units.mjs and hazards.mjs so it never drifts from the rules, then the controls
// (ACCESS-01). Plain data; the page renders it.
import { droneTypes, droneOrder, defenderTypes, societies } from "./units.mjs?v=dev";
import { hazardTypes } from "./hazards.mjs?v=dev";

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

// Keyboard first, then mouse and touch. Every essential action has a key; Tab reaches each button.
const controls = [
  { name: "Squads", summary: "Choose who gets your orders", facts: [
    "1-9 select a squad (press again to bring the camera to it; Shift adds or removes it); 0 selects all",
    "Click or tap a drone or a squad card; Shift+drag draws a box around drones",
    "H holds the selected squads where they are",
  ] },
  { name: "Orders", summary: "Send the selected squads", facts: [
    "Enter orders them to the middle of the screen, or attacks the defender there; Shift+Enter adds a waypoint",
    "Right-click the ground to move, or a defender to attack; Shift+right-click adds a waypoint; on touch, tap",
    "T arms attack-move for the next order; P turns patrol on or off",
  ] },
  { name: "Drop waves", summary: "Buy drones and land them in a zone you hold", facts: [
    "B opens the drop panel; Tab moves between its buttons and Enter presses one",
    "While picking a zone, Enter previews pods at the middle of the screen and Enter again launches",
    "Escape cancels placement and closes the panel",
  ] },
  { name: "Camera", summary: "Look around the battle", facts: [
    "W A S D or the arrow keys pan; Q and E turn; R and F tilt; Z and X (or the wheel) zoom",
    "C switches to the free camera: R and F (or the wheel) fly up and down, Shift moves faster",
    "G follows the selected squads; J jumps to the newest alert; Home resets the view; V hides the panels",
  ] },
  { name: "Mission", summary: "Pause, sound and leaving", facts: [
    "Space pauses and resumes; M changes the sound",
    "Shortcuts pause while you type or use a menu, and Ctrl, Alt or Cmd shortcuts stay with the browser",
  ] },
];

export function fieldGuide() {
  const drones = droneOrder.map(id => droneTypes[id]), defenders = Object.values(defenderTypes);
  return [
    { section: "Drones", items: drones.map(d => ({
      name: d.name, summary: d.role,
      facts: [
        `${d.cost} matter · ${d.slots} wave ${d.slots === 1 ? "slot" : "slots"} · ${d.hp} health · ${d.speed} m/s · flies at ${d.cruise} m · sees ${d.sight} m`,
        `Captures at ${d.capture}/s${d.hack ? "; hacks defended zones" : ""}${d.calm ? "; calms the public in zones" : ""}${d.harvest ? "; lands to drill matter" : ""}${d.limit ? `; at most ${d.limit} per mission` : ""}`,
        ...d.weapons.map(weaponText),
        `Most dangerous to it: ${strongest(defenders, "air").join(", ")}`,
      ],
    })) },
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
      ],
    })) },
    { section: "Hazards", items: Object.values(hazardTypes).map(h => ({
      name: h.name, summary: h.advice,
      facts: [`Warning ${h.warnS} s ahead · lasts ${h.durationS[0]}-${h.durationS[1]} s · returns every ${h.gapS[0]}-${h.gapS[1]} s`],
    })) },
    { section: "Controls", items: controls },
  ];
}
