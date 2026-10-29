// The invasion campaign: planets in the order they are invaded, what each one rewards, and the
// player's saved progress between missions. No DOM; covered by tests/invasion-campaign.test.mjs.
import { droneOrder, droneTypes, startingDrones, basePodSlots, payloadCount, difficulties, difficultyOf } from "./units.mjs?v=dev";
import { modifiersFor, cleanModifiers, replayReward, modifierNames } from "./replay.mjs?v=dev";
import { objectiveText } from './objective-rules.mjs?v=dev';
import { validMissionId } from "./mission-id.mjs?v=dev";

// galaxy: position on the campaign map (0-1 across, 0-1 down). society: index into societies
// (units.mjs). threat 0-5 scales defender numbers, strength and reinforcements. zones: fixed
// layout (Titan) or zoneCount generated from seed. required: zones to hold for the win.
// objectives: optional goals; each met one adds a star to the win's first star.
// supply: the least matter the Hive provides for an attempt, so a lost mission can always be
// retried (a bigger saved bank is used instead when there is one).
export const planets = Object.freeze([
  {
    id: "titan", order: 1, name: "Titan", subtitle: "Saturn's largest moon", practice: true, supply: 160,
    society: 0, threat: 0, biome: "titan", hazards: ["methaneRain", "gusts"], color: "#d99a4e",
    galaxy: { x: 0.13, y: 0.7 },
    description: "Practice ground. The Ahmakiq Undae dunes from the Dragonfly simulator: nobody lives here, so learn to drop, move and capture. NASA's Dragonfly lander is parked at its first landing site.",
    map: { centerX: 0, centerZ: -100, half: 420 },
    zones: [
      { id: "beachhead", name: "Hive beacon", kind: "beachhead", x: -250, z: 180 },
      { id: "outcrop", name: "Dry outcrop", kind: "beacon", x: 145, z: -90 },
      { id: "site-a", name: "Site A", kind: "beacon", x: 219, z: -235 },
      { id: "site-b", name: "Site B", kind: "beacon", x: -270, z: -40 },
      { id: "relic", name: "Dragonfly landing site", kind: "relic", x: 0, z: 0, special: "dragonfly" },
    ],
    required: 3, seed: 450,
    reward: { matter: 120, unlock: "striker" },
    objectives: [
      { id: "dragonfly", kind: "captureZone", zone: "relic", text: "Recover the Dragonfly lander (unlocks it)" },
      { id: "no-losses", kind: "maxLosses", value: 0, text: "Lose no drones" },
    ],
  },
  {
    id: "kepra", order: 2, name: "Kepra", subtitle: "Desert world", supply: 220,
    society: 1, threat: 1, biome: "desert", hazards: ["dustStorm"], color: "#e0b070",
    // Wildlife (HAZ-01, units.mjs wildlifeTypes): which creature, how many dens, how many per den.
    wildlife: { type: "sandworm", dens: 2, pack: 1 },
    galaxy: { x: 0.26, y: 0.5 },
    description: "Wind-carved dunes and mesas. Tribal villages keep watch from wooden towers and throw spears at anything that flies low.",
    map: { centerX: 0, centerZ: 0, half: 420 }, zoneCount: 4, required: 3, seed: 1201,
    reward: { matter: 150, podSlots: 4 },
    objectives: [
      { id: "calm", kind: "alarmBelow", value: 50, text: "Keep the alarm under 50" },
      { id: "fast", kind: "timeUnder", value: 600, text: "Win within 10 minutes" },
    ],
  },
  {
    id: "velm", order: 3, name: "Velm", subtitle: "Swamp jungle", supply: 300,
    society: 2, threat: 2, biome: "jungle", hazards: ["acidRain"], color: "#5fae6a",
    wildlife: { type: "swampBeast", dens: 3, pack: 1 },
    galaxy: { x: 0.37, y: 0.76 },
    description: "Steaming swamps under a green sky. Farming towns answer drones with rifles, and the rain eats through rotor housings.",
    map: { centerX: 0, centerZ: 0, half: 440 }, zoneCount: 5, required: 4, seed: 2207,
    reward: { matter: 180, unlock: "breacher" },
    objectives: [
      { id: "towers", kind: "destroyType", type: "watchtower", text: objectiveText({kind:'destroyType',type:'watchtower'}) },
      { id: "losses", kind: "maxLosses", value: 12, text: "Lose 12 drones or fewer" },
    ],
  },
  {
    id: "corvan", order: 4, name: "Corvan", subtitle: "Ice world", supply: 380,
    society: 3, threat: 3, biome: "ice", hazards: ["blizzard"], color: "#bfe3f2",
    wildlife: { type: "iceCrawler", dens: 2, pack: 3 },
    galaxy: { x: 0.5, y: 0.6 },
    description: "Frozen ridges and factory towns. Flak and radar cover the passes, and a full alarm brings artillery.",
    map: { centerX: 0, centerZ: 0, half: 460 }, zoneCount: 5, required: 4, seed: 3109,
    reward: { matter: 220, podSlots: 4 },
    objectives: [
      { id: "no-artillery", kind: "alarmBelow", value: 70, text: "Never let the alarm reach 70 (no artillery)" },
      { id: "weather", kind: "noHazardLosses", text: "Lose no drones to the blizzard" },
    ],
  },
  {
    id: "ashfall", order: 5, name: "Ashfall", subtitle: "Volcanic world", supply: 460,
    society: 3, threat: 4, biome: "volcanic", hazards: ["eruption", "ashCloud"], color: "#e0553a",
    galaxy: { x: 0.6, y: 0.36 },
    description: "Basalt plains between active cones. Eruptions are announced a few seconds before they blow; move the swarm.",
    map: { centerX: 0, centerZ: 0, half: 460 }, zoneCount: 6, required: 4, seed: 4441,
    reward: { matter: 260 },
    objectives: [
      { id: "weather", kind: "noHazardLosses", text: "Lose no drones to eruptions or ash" },
      { id: "fast", kind: "timeUnder", value: 900, text: "Win within 15 minutes" },
    ],
  },
  {
    id: "halcyon", order: 6, name: "Halcyon", subtitle: "Storm ocean", supply: 520,
    society: 4, threat: 4, biome: "storm", hazards: ["lightning", "gusts"], color: "#4a7fd0",
    galaxy: { x: 0.74, y: 0.56 },
    description: "Island cities under endless thunderstorms. Missile batteries and jammers guard every harbor.",
    map: { centerX: 0, centerZ: 0, half: 480 }, zoneCount: 6, required: 5, seed: 5003,
    reward: { matter: 300, podSlots: 4 },
    objectives: [
      { id: "jammers", kind: "destroyType", type: "jammer", text: objectiveText({kind:'destroyType',type:'jammer'}) },
      { id: "losses", kind: "maxLosses", value: 25, text: "Lose 25 drones or fewer" },
    ],
  },
  {
    id: "aurex", order: 7, name: "Aurex", subtitle: "City world", supply: 720,
    society: 5, threat: 5, biome: "city", hazards: ["solarFlare"], color: "#b58cf0",
    galaxy: { x: 0.86, y: 0.3 },
    description: "A spacefaring capital: laser turrets, shield pylons and interceptors. Solar flares knock out drones outside your zones.",
    map: { centerX: 0, centerZ: 0, half: 500 }, zoneCount: 7, required: 5, seed: 6421,
    reward: { matter: 400 },
    objectives: [
      { id: "calm", kind: "alarmBelow", value: 80, text: "Keep the alarm under 80" },
      { id: "losses", kind: "maxLosses", value: 40, text: "Lose 40 drones or fewer" },
    ],
  },
].map(Object.freeze));

// Frontier mode (owner, October 21): large maps with a city to find, apart from the campaign.
// Each is a bigger variant of a campaign world: a landform (planet-terrain.mjs) shapes mountains
// and a valley, the city (city-layout.mjs) sits deep inside it, and explore hides every zone and
// the city until a drone scouts them. kit: the least drones and wave slots offered, so a
// frontier is playable before the campaign unlocks them. Results never change the campaign bank
// or conquests. Sizes and balance are invented gameplay choices [EST].
export const frontiers = Object.freeze([
  {
    id: "corvan-frontier", frontier: true, base: "corvan", name: "Corvan Frontier", subtitle: "Ice world · large map",
    supply: 650, kit: { unlocks: ["scout", "link", "striker"], podSlots: 16 },
    society: 3, threat: 3, biome: "ice", hazards: ["blizzard"], color: "#bfe3f2",
    description: "Six kilometers of jagged ice mountains. Corvan Prime, an industrial city of brick and glass, lies somewhere in a great flat valley beyond the ridges; the Hive beacon is set down in a basin far away. Scout through the pass, find the outposts and the city, and take its squares. Flak, radar and artillery defend it.",
    // view: farthest camera pull-back (m); fog: haze density, so distant ground fades out.
    map: { centerX: 0, centerZ: 0, half: 3000, view: 1800, fog: 0.00045 },
    landform: { kind: "valley", x: 600, z: -600, length: 2250, width: 1250, angle: 0.785, floor: 6, rim: 520, peak: 430 },
    city: { name: "Corvan Prime", style: "metropolis", x: 1300, z: 100, blocks: 9, pitch: 100, street: 20, seed: 3109, peak: 150 },
    zoneCount: 9, required: 6, seed: 3109, explore: true,
    objectives: [
      { id: "no-artillery", kind: "alarmBelow", value: 70, text: "Never let the alarm reach 70 (no artillery)" },
      { id: "weather", kind: "noHazardLosses", text: "Lose no drones to the blizzard" },
    ],
  },
  {
    id: "ashfall-frontier", frontier: true, base: "ashfall", name: "Ashfall Frontier", subtitle: "Volcanic world · large map",
    supply: 750, kit: { unlocks: ["scout", "link", "striker"], podSlots: 16 },
    society: 3, threat: 4, biome: "volcanic", hazards: ["eruption", "ashCloud"], color: "#e0553a",
    description: "Black basalt ridges and smoking volcanoes around a long valley veined with lava. Forgeholm, a foundry city of halls, smokestacks and cooling towers, works the far end of it; the Hive beacon lands in a basin beyond the ridges. Stacks force your drones to climb, eruptions are announced a few seconds before they blow, and flak guns, watchtowers and radar guard the halls.",
    map: { centerX: 0, centerZ: 0, half: 3000, view: 1800, fog: 0.00045 },
    landform: { kind: "valley", x: -500, z: -700, length: 2300, width: 1150, angle: -0.6, floor: 4, rim: 480, peak: 460, lava: 1, volcanoes: 3 },
    city: { name: "Forgeholm", style: "forge", x: 280, z: -1240, blocks: 9, pitch: 100, street: 20, seed: 4441, peak: 110 },
    zoneCount: 9, required: 6, seed: 4441, explore: true,
    objectives: [
      { id: "weather", kind: "noHazardLosses", text: "Lose no drones to eruptions or ash" },
      { id: "losses", kind: "maxLosses", value: 40, text: "Lose 40 drones or fewer" },
    ],
  },
  {
    id: "velm-frontier", frontier: true, base: "velm", name: "Velm Frontier", subtitle: "Swamp jungle · large map",
    supply: 600, kit: { unlocks: ["scout", "link", "striker"], podSlots: 16 },
    society: 2, threat: 2, biome: "jungle", hazards: ["acidRain"], color: "#5fae6a",
    description: "Steaming jungle hills around a long valley of swamp rivers. Brackenford, a walled market town of tile-roofed houses and a stone keep, guards the fords at its far end; the Hive beacon lands in a basin beyond the hills. Troops must come and go through the town gates, while drones fly over the walls; rifles answer from the windows, and the rain eats through rotor housings.",
    map: { centerX: 0, centerZ: 0, half: 3000, view: 1800, fog: 0.00045 },
    landform: { kind: "valley", x: 400, z: 300, length: 2100, width: 1100, angle: 1.2, floor: 3, rim: 420, peak: 320, rivers: 1 },
    city: { name: "Brackenford", style: "town", x: 74, z: -539, blocks: 9, pitch: 60, street: 10, seed: 2207, peak: 34 },
    zoneCount: 9, required: 6, seed: 2207, explore: true,
    objectives: [
      { id: "keep-calm", kind: "alarmBelow", value: 60, text: "Keep the alarm under 60" },
      { id: "weather", kind: "noHazardLosses", text: "Lose no drones to the acid rain" },
    ],
  },
].map(Object.freeze));

// Hive upgrades (ECON-01), bought with banked matter between missions; three levels each.
// Effects per level [EST]: pods +4 wave slots; launch -1 s pod cooldown; armor +10% drone health;
// engines +8% drone speed; weapons +10% drone damage; sealing -20% hazard damage; firmware +20%
// Link capture speed. Battles read the levels from b.upgrades (battle.mjs upgradeEffects).
export const hiveUpgrades = Object.freeze({
  pods: Object.freeze({ name: "Bigger pods", effect: "+4 wave slots", cost: [150, 260, 400] }),
  launch: Object.freeze({ name: "Fast launch", effect: "-1 s between drop waves", cost: [100, 180, 300] }),
  armor: Object.freeze({ name: "Armor plating", effect: "+10% drone health", cost: [140, 240, 380] }),
  engines: Object.freeze({ name: "Engines", effect: "+8% drone speed", cost: [120, 210, 340] }),
  weapons: Object.freeze({ name: "Weapons", effect: "+10% drone damage", cost: [160, 270, 420] }),
  sealing: Object.freeze({ name: "Weather sealing", effect: "-20% hazard damage", cost: [100, 180, 300] }),
  firmware: Object.freeze({ name: "Link firmware", effect: "+20% Link capture speed", cost: [120, 200, 320] }),
});
export const upgradeLevel = (progress, id) => progress.upgrades?.[id] || 0;

// Buy the next level of an upgrade from the bank. Returns { progress, ok, reason }.
export function buyUpgrade(progress, id) {
  const upgrade = hiveUpgrades[id], level = upgradeLevel(progress, id);
  if (!upgrade) return { progress, ok: false, reason: "Unknown upgrade." };
  if (level >= upgrade.cost.length) return { progress, ok: false, reason: `${upgrade.name} is fully upgraded.` };
  const cost = upgrade.cost[level];
  if (progress.matter < cost) return { progress, ok: false, reason: `${upgrade.name} needs ${cost} matter; the bank has ${Math.round(progress.matter)}.` };
  const next = structuredClone(progress);
  next.matter -= cost;
  next.upgrades = { ...(next.upgrades || {}), [id]: level + 1 };
  return { progress: next, ok: true, reason: `${upgrade.name} level ${level + 1}: ${upgrade.effect}.` };
}

export const planetById = (id) => planets.find(planet => planet.id === id) || frontiers.find(map => map.id === id) || null;

export const PROGRESS_VERSION = 2;
export const SAVE_KEY = "drone-invasion-progress";
export const startingMatter = 160;
const statNames = ["drops", "dronesDropped", "dronesLost", "zonesCaptured", "defensesDestroyed", "matterHarvested", "hazardEvents", "missionsPlayed", "missionsWon"];

export function createProgress() {
  return {
    version: PROGRESS_VERSION,
    matter: startingMatter,
    captured: {},
    stars: {},
    bestTime: {},
    unlocks: [...startingDrones],
    podSlots: basePodSlots,
    achievements: {},
    settledMissions: {},
    // Frontier records by map: { wins, stars (best, 1-3), best (fastest win, s) }.
    frontier: {},
    // Hive upgrade levels by ID (hiveUpgrades).
    upgrades: {},
    // The last wave launched on each planet or frontier map (CTRL-09): { planetId: payload }.
    lastWaves: {},
    // Difficulty for new missions (OBJ-05, units.mjs difficulties).
    difficulty: "normal",
    // Replay challenges beaten on each conquered planet (ECON-04): { planetId: [modifier ids] }.
    challenges: {},
    stats: Object.fromEntries(statNames.map(name => [name, 0])),
  };
}

export function isPlanetUnlocked(progress, planet) {
  if (planet.order === 1) return true;
  const previous = planets.find(p => p.order === planet.order - 1);
  return !!(previous && progress.captured[previous.id]);
}

// The first unlocked planet not yet captured (the last planet once the campaign is done).
export function nextPlanet(progress) {
  return planets.find(planet => isPlanetUnlocked(progress, planet) && !progress.captured[planet.id]) || planets.at(-1);
}

// Replay challenges beaten across the campaign, and how many it offers (ECON-04).
export const challengeTally = (progress) => ({
  beaten: planets.reduce((sum, planet) => sum + cleanModifiers(planet, progress.challenges?.[planet.id]).length, 0),
  total: planets.reduce((sum, planet) => sum + modifiersFor(planet).length, 0),
});

export const availableDrones = (progress) => droneOrder.filter(type => progress.unlocks.includes(type));

// Matter available at the start of an attempt on this planet: the bank, or the planet's
// guaranteed supply (scaled by the difficulty, OBJ-05) when that is more.
export const missionMatter = (progress, planet) => Math.max(progress.matter, Math.round((planet.supply || 0) * difficultyOf(progress.difficulty).supply));

// What an attempt starts with. A frontier brings its own matter and at least its kit; the
// campaign bank is neither used nor changed.
export function missionSupply(progress, planet) {
  const upgrades = Object.fromEntries(Object.keys(hiveUpgrades).filter(id => id !== "pods").map(id => [id, upgradeLevel(progress, id)]).filter(([, n]) => n > 0));
  const extraSlots = 4 * upgradeLevel(progress, "pods"), slots = (base) => Math.min(44, base + extraSlots);
  const difficulty = difficultyOf(progress.difficulty).id;
  if (!planet.frontier) return { matter: missionMatter(progress, planet), unlocks: [...progress.unlocks], podSlots: slots(progress.podSlots), upgrades, difficulty };
  const unlocks = droneOrder.filter(type => progress.unlocks.includes(type) || planet.kit.unlocks.includes(type));
  return { matter: Math.round(planet.supply * difficultyOf(difficulty).supply), unlocks, podSlots: slots(Math.max(progress.podSlots, planet.kit.podSlots)), upgrades, difficulty };
}

// A finished frontier mission: statistics and its settlement only (never counted twice).
export function applyFrontierResult(progress, map, result) {
  const next = structuredClone(progress);
  next.version = PROGRESS_VERSION;
  next.settledMissions ||= {};
  if (result.missionId && !validMissionId(result.missionId)) throw new TypeError("Invalid mission settlement identity.");
  if (result.missionId && Object.hasOwn(next.settledMissions, result.missionId))
    return { progress: next, notes: ["This mission result was already settled; no statistics were added again."] };
  for (const name of statNames) next.stats[name] += Math.max(0, Math.round(result.stats?.[name] || 0));
  next.stats.missionsPlayed += 1;
  const notes = [`${map.name} is a frontier map: the campaign bank and conquests are unchanged.`];
  if (result.outcome === "won") {
    next.stats.missionsWon += 1;
    next.frontier ||= {};
    const before = next.frontier[map.id], time = Math.round(result.time), stars = Math.min(3, Math.max(1, result.stars || 1));
    next.frontier[map.id] = { wins: (before?.wins || 0) + 1, stars: Math.max(before?.stars || 0, stars), best: before ? Math.min(before.best, time) : time };
    if (!before) notes.push(`First win on ${map.name} recorded.`);
    else if (time < before.best) notes.push(`New best time on ${map.name}.`);
  }
  if (result.missionId) Object.defineProperty(next.settledMissions, result.missionId, {
    value: { planetId: map.id, outcome: result.outcome }, enumerable: true, writable: true, configurable: true,
  });
  return { progress: next, notes };
}

// result: { outcome: "won" | "lost" | "retreated", matter, stars, time, stats, recovered: [unlock ids] }
// Returns the new progress (the old one is not changed) and plain-language notes for the debrief.
export function applyMissionResult(progress, planet, result) {
  const next = structuredClone(progress);
  next.version = PROGRESS_VERSION;
  next.settledMissions ||= {};
  if (result.missionId && !validMissionId(result.missionId)) throw new TypeError("Invalid mission settlement identity.");
  if (result.missionId && Object.hasOwn(next.settledMissions, result.missionId))
    return { progress: next, notes: ["This mission result was already settled; no rewards or statistics were added again."] };
  const notes = [];
  next.matter = Math.max(0, Math.round(result.matter || 0));
  for (const name of statNames) next.stats[name] += Math.max(0, Math.round(result.stats?.[name] || 0));
  next.stats.missionsPlayed += 1;
  for (const unlock of result.recovered || []) {
    if (droneTypes[unlock] && !next.unlocks.includes(unlock)) {
      next.unlocks.push(unlock);
      notes.push(`${droneTypes[unlock].name} unlocked for every drop.`);
    }
  }
  if (result.outcome === "won") {
    next.stats.missionsWon += 1;
    const first = !next.captured[planet.id];
    next.captured[planet.id] = true;
    // A replay pays a share of the conquest reward, more with challenges on (ECON-04).
    const challenges = first ? [] : cleanModifiers(planet, result.modifiers);
    const matter = first ? planet.reward.matter : replayReward(planet, challenges);
    next.matter += matter;
    notes.push(`${first ? "Conquest" : "Replay"} reward: +${matter} matter${challenges.length ? ` with ${modifierNames(challenges)}` : ""}.`);
    if (challenges.length) {
      next.challenges ||= {};
      const before = next.challenges[planet.id] || [], fresh = challenges.filter(id => !before.includes(id));
      next.challenges[planet.id] = cleanModifiers(planet, [...before, ...challenges]);
      if (fresh.length) notes.push(`Challenge${fresh.length === 1 ? "" : "s"} beaten on ${planet.name}: ${modifierNames(fresh)}.`);
    }
    if (first && planet.reward.unlock && !next.unlocks.includes(planet.reward.unlock)) {
      next.unlocks.push(planet.reward.unlock);
      notes.push(`${droneTypes[planet.reward.unlock].name} drones unlocked.`);
    }
    if (first && planet.reward.podSlots) {
      next.podSlots += planet.reward.podSlots;
      notes.push(`Drop pods now carry ${next.podSlots} slots.`);
    }
    next.stars[planet.id] = Math.max(next.stars[planet.id] || 0, result.stars || 1);
    const best = next.bestTime[planet.id];
    next.bestTime[planet.id] = best === undefined ? Math.round(result.time) : Math.min(best, Math.round(result.time));
    const following = planets.find(p => p.order === planet.order + 1);
    if (first && following) notes.push(`${following.name} is open for invasion.`);
  }
  if (result.outcome !== "won" && next.matter < (planet.supply || 0)) {
    notes.push(`The Hive will resupply you to ${planet.supply} matter for the next attempt.`);
  }
  if (result.missionId) Object.defineProperty(next.settledMissions, result.missionId, {
    value: { planetId: planet.id, outcome: result.outcome }, enumerable: true, writable: true, configurable: true,
  });
  return { progress: next, notes };
}

// Saved progress is checked field by field; anything unknown or malformed falls back to a
// fresh campaign value, so an old or edited save can never break the game.
export function validProgress(raw) {
  if (!raw || typeof raw !== "object" || ![1, PROGRESS_VERSION].includes(raw.version)) return null;
  const clean = createProgress();
  const count = (value, max = 1e7) => (Number.isFinite(value) && value >= 0 ? Math.min(max, Math.round(value)) : 0);
  clean.matter = count(raw.matter);
  for (const planet of planets) {
    if (raw.captured?.[planet.id] === true) clean.captured[planet.id] = true;
    const stars = raw.stars?.[planet.id];
    if (Number.isInteger(stars) && stars >= 1 && stars <= 3) clean.stars[planet.id] = stars;
    const best = raw.bestTime?.[planet.id];
    if (Number.isFinite(best) && best > 0) clean.bestTime[planet.id] = Math.round(best);
  }
  if (Array.isArray(raw.unlocks)) {
    for (const unlock of raw.unlocks) if (typeof unlock === 'string' && Object.hasOwn(droneTypes, unlock) && !clean.unlocks.includes(unlock)) clean.unlocks.push(unlock);
  }
  clean.podSlots = Math.max(basePodSlots, Math.min(basePodSlots + 32, count(raw.podSlots)));
  if (raw.achievements && typeof raw.achievements === "object") {
    for (const [id, at] of Object.entries(raw.achievements)) if (/^[a-z0-9-]{1,40}$/.test(id) && Number.isFinite(at)) clean.achievements[id] = at;
  }
  for (const [id, upgrade] of Object.entries(hiveUpgrades)) {
    const level = raw.upgrades?.[id];
    if (Number.isInteger(level) && level >= 1 && level <= upgrade.cost.length) clean.upgrades[id] = level;
  }
  for (const map of frontiers) {
    const record = raw.frontier?.[map.id];
    if (Number.isInteger(record?.wins) && record.wins >= 1 && Number.isInteger(record.stars) && record.stars >= 1 && record.stars <= 3 && Number.isFinite(record.best) && record.best > 0)
      clean.frontier[map.id] = { wins: Math.min(1e6, record.wins), stars: record.stars, best: Math.round(record.best) };
  }
  if (typeof raw.difficulty === "string" && Object.hasOwn(difficulties, raw.difficulty)) clean.difficulty = raw.difficulty;
  for (const planet of planets) {
    const beaten = cleanModifiers(planet, raw.challenges?.[planet.id]);
    if (beaten.length && clean.captured[planet.id]) clean.challenges[planet.id] = beaten;
  }
  if (raw.lastWaves && typeof raw.lastWaves === "object" && !Array.isArray(raw.lastWaves)) {
    for (const map of [...planets, ...frontiers]) {
      const wave = raw.lastWaves[map.id];
      if (wave && typeof wave === "object" && !Array.isArray(wave) && Object.entries(wave).every(([type, n]) => Object.hasOwn(droneTypes, type) && Number.isInteger(n) && n >= 0 && n <= 44) && payloadCount(wave) > 0)
        clean.lastWaves[map.id] = Object.fromEntries(droneOrder.filter(type => wave[type] > 0).map(type => [type, wave[type]]));
    }
  }
  for (const name of statNames) clean.stats[name] = count(raw.stats?.[name]);
  if (raw.settledMissions && typeof raw.settledMissions === "object" && !Array.isArray(raw.settledMissions)) {
    for (const [id, entry] of Object.entries(raw.settledMissions)) {
      if (validMissionId(id) && planetById(entry?.planetId) && ["won", "lost", "retreated"].includes(entry?.outcome))
        Object.defineProperty(clean.settledMissions, id, { value: { planetId: entry.planetId, outcome: entry.outcome }, enumerable: true, writable: true, configurable: true });
    }
  }
  return clean;
}
