// Deterministic drop packing and landing courts. Gameplay dimensions [EST], not EDL physics.
import { droneOrder, droneTypes, payloadCount, payloadSlots, payloadCost } from "./units.mjs?v=dev";

export const dronesPerPod = 3;
export const podSpacing = 20; // Main canopy is ~16.4 m wide, with clearance between siblings.
export const podRadius = 9;
export const podStaggerS = 0.1;

export function validPayload(payload) {
  return payload && typeof payload === "object" && !Array.isArray(payload)
    && Object.entries(payload).every(([type, n]) => Object.hasOwn(droneTypes, type) && Number.isInteger(n) && n >= 0 && n <= 44);
}

// Drop presets (CTRL-09): a mix of drones (want is a ratio), filled to what the Hive can send
// right now. A preset is offered once any drone it needs is unlocked.
export const dropPresets = Object.freeze([
  Object.freeze({ id: "assault", name: "Assault", needs: ["striker", "breacher"], want: { striker: 2, breacher: 1, scout: 1 },
    note: "Strikers and Breachers knock out defenses; Scouts spot for them. Loud: kills raise the alarm." }),
  Object.freeze({ id: "hack", name: "Hack team", needs: ["link"], want: { link: 2, scout: 1 },
    note: "Links take zones quietly, even under fire, and calm the public; Scouts screen them." }),
  Object.freeze({ id: "scouts", name: "Scout swarm", needs: ["scout"], want: { scout: 1 },
    note: "Cheap, fast Scouts to spread out, spot and grab empty zones." }),
]);

// Fills a wanted mix up to the wave's slots and the matter on hand. Drones are added one at a time
// to whichever type is furthest behind its share (ties go to the type listed first), so a short
// budget keeps the mix. With cap, no type goes past its wanted count (repeating a wave);
// without, the mix is a ratio that fills the whole wave (a preset). Types that are not unlocked
// are skipped, and the Dragonfly keeps its limit.
export function fillPayload(want, { unlocks, podSlots, matter }, { cap = true } = {}) {
  const payload = {};
  const types = Object.keys(want).filter(type => Object.hasOwn(droneTypes, type) && unlocks.includes(type) && want[type] > 0);
  for (;;) {
    let pick = null;
    for (const type of types) {
      const count = payload[type] || 0;
      if (count >= Math.min(cap ? want[type] : 44, droneTypes[type].limit ?? 44)) continue;
      const next = { ...payload, [type]: count + 1 };
      if (payloadSlots(next) > podSlots || payloadCost(next) > matter) continue;
      if (!pick || count / want[type] < (payload[pick] || 0) / want[pick]) pick = type;
    }
    if (!pick) return payload;
    payload[pick] = (payload[pick] || 0) + 1;
  }
}
export const presetAvailable = (preset, unlocks) => preset.needs.some(type => unlocks.includes(type));

// Slot capacity/cost belong to the complete wave. The oversized Dragonfly travels alone.
export function packDropPods(payload) {
  if (!validPayload(payload)) return [];
  const pods = [];
  let current = {};
  const flush = () => { if (payloadCount(current)) pods.push(current); current = {}; };
  for (const type of droneOrder) {
    for (let i = 0; i < (payload[type] || 0); i++) {
      if (type === "dragonfly") { flush(); pods.push({ dragonfly: 1 }); continue; }
      current[type] = (current[type] || 0) + 1;
      if (payloadCount(current) === dronesPerPod) flush();
    }
  }
  flush();
  return pods;
}

export function planDropLandings(b, zone, x, z, count, centeredFallback = false) {
  if (!Number.isFinite(zone.radius) || zone.radius <= podRadius || !Number.isInteger(count) || count < 1 || count > 44)
    return { ok: false, reason: "No safe pod courts fit this landing area. Choose another held zone." };
  const candidates = [], reserved = b.pods.filter(pod => !pod.released);
  const heightAt = b.heightAt || (() => 0);
  const { centerX, centerZ, half } = b.map;
  // A bounded hex lattice, nearest to the requested point first. No RNG is consumed by previews.
  const extent = Math.min(32, Math.ceil(zone.radius * 2.6 / (podSpacing * Math.sqrt(3) / 2)) + 1);
  for (let q = -extent; q <= extent; q++) for (let r = -extent; r <= extent; r++) {
    const cx = x + podSpacing * (q + r / 2), cz = z + podSpacing * Math.sqrt(3) / 2 * r;
    if (Math.hypot(cx - zone.x, cz - zone.z) + podRadius > zone.radius) continue;
    if (Math.abs(cx - centerX) + podRadius > half || Math.abs(cz - centerZ) + podRadius > half) continue;
    candidates.push({ x: cx, z: cz });
  }
  candidates.sort((a, c) => Math.hypot(a.x - x, a.z - z) - Math.hypot(c.x - x, c.z - z) || a.z - c.z || a.x - c.x);
  const landings = [];
  for (const candidate of candidates) {
    if ([...reserved, ...landings].some(p => Math.hypot(p.x - candidate.x, p.z - candidate.z) < podSpacing - 1e-6)) continue;
    const samples = [candidate, ...Array.from({ length: 8 }, (_, i) => ({
      x: candidate.x + Math.cos(i * Math.PI / 4) * podRadius,
      z: candidate.z + Math.sin(i * Math.PI / 4) * podRadius,
    }))];
    const heights = samples.map(p => heightAt(p.x, p.z));
    if (!samples.every(p => b.isLand(p.x, p.z)) || !heights.every(Number.isFinite)
      || Math.max(...heights) - Math.min(...heights) > 4.5) continue;
    if (b.units.some(u => u.alive && u.structure && Math.hypot(u.x - candidate.x, u.z - candidate.z) < podRadius + 6)) continue;
    // Future authored city geometry can check the full vertical pod/canopy corridor here.
    if (b.canDropAt && !b.canDropAt(candidate.x, candidate.z, { radius: podRadius, bottom: heights[0], top: heights[0] + 700 })) continue;
    landings.push(candidate);
    if (landings.length === count) return { ok: true, landings };
  }
  if (!centeredFallback && (x !== zone.x || z !== zone.z))
    return planDropLandings(b, zone, zone.x, zone.z, count, true);
  return { ok: false, reason: `Only ${landings.length} safe pod courts fit here; this wave needs ${count}. Choose another held zone, wait for arrivals, or send fewer drones.` };
}
