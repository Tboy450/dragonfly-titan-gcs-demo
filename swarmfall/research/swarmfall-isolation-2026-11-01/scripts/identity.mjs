// Builds the Dragonfly drone and samples Titan's terrain and the arrival timeline with the old
// layout (published tree at 454c3e6) and with Swarmfall's vendored copy; reports any difference.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [oldDist, repo] = process.argv.slice(2);
const context2d = new Proxy({}, { get: (t, k) => k in t ? t[k] : ["createLinearGradient", "createRadialGradient"].includes(k) ? () => ({ addColorStop() {} }) : () => {}, set: (t, k, v) => { t[k] = v; return true; } });
const element = () => ({ style: {}, width: 0, height: 0, getContext: () => context2d, addEventListener() {}, setAttribute() {} });
globalThis.document = { createElement: element, createElementNS: element };
globalThis.window = { devicePixelRatio: 1 };
const load = (p) => import(pathToFileURL(p).href);
const before = { models: await load(join(oldDist, "invasion/models.mjs")), terrain: await load(join(oldDist, "titan-terrain.mjs")), edl: await load(join(oldDist, "edl.mjs")), systems: await load(join(oldDist, "mission-systems.mjs")), planet: await load(join(oldDist, "invasion/planet-terrain.mjs")), campaign: await load(join(oldDist, "invasion/campaign.mjs")) };
const gd = join(repo, "swarmfall/dist");
const after = { models: await load(join(gd, "models.mjs")), terrain: await load(join(gd, "vendor/dragonfly/titan-terrain.mjs")), edl: await load(join(gd, "vendor/dragonfly/edl.mjs")), systems: await load(join(gd, "vendor/dragonfly/mission-systems.mjs")), planet: await load(join(gd, "planet-terrain.mjs")), campaign: await load(join(gd, "campaign.mjs")) };
const summary = (group) => { const out = []; group.updateMatrixWorld(true); group.traverse(o => { if (o.isMesh) { const m = o.material; out.push({ pos: Array.from(o.geometry.attributes.position.array), idx: o.geometry.index ? Array.from(o.geometry.index.array) : null, nrm: Array.from(o.geometry.attributes.normal?.array ?? []), mat: `${m.type}|${m.color?.getHexString()}|${m.metalness}|${m.roughness}|${m.opacity}|${m.transparent}|${m.side}|${!!m.map}`, world: Array.from(o.matrixWorld.elements), spin: o.userData.spin ?? o.parent?.userData?.spin ?? null }); } }); return out; };
const a = summary(before.models.dragonflyTemplate()), b = summary(after.models.dragonflyTemplate());
let meshDiff = a.length !== b.length ? 1 : 0, verts = 0;
for (let i = 0; i < Math.min(a.length, b.length); i++) { verts += a[i].pos.length / 3; for (const k of ["pos", "idx", "nrm", "world"]) if (JSON.stringify(a[i][k]) !== JSON.stringify(b[i][k])) { meshDiff++; break; } if (a[i].mat !== b[i].mat || a[i].spin !== b[i].spin) meshDiff++; }
console.log(`Dragonfly drone: ${a.length} vs ${b.length} meshes, ${verts} vertices; meshes that differ: ${meshDiff}`);
let terrainDiff = 0, liquidDiff = 0, samples = 0;
for (let x = -4800; x <= 4800; x += 137) for (let z = -4800; z <= 4800; z += 151) { samples++; if (before.terrain.terrainHeight(x, z) !== after.terrain.terrainHeight(x, z)) terrainDiff++; if (before.systems.overLiquid(x, z) !== after.systems.overLiquid(x, z)) liquidDiff++; }
console.log(`Titan terrain: ${samples} samples; height differences ${terrainDiff}, liquid differences ${liquidDiff}`);
let edlDiff = 0; for (let t = -5; t <= 70; t += 0.25) if (JSON.stringify(before.edl.edlStateAt(t)) !== JSON.stringify(after.edl.edlStateAt(t))) edlDiff++;
console.log(`Arrival timeline: 301 times; differences ${edlDiff}`);
const titanOld = before.planet.createPlanetTerrain(before.campaign.planetById("titan")), titanNew = after.planet.createPlanetTerrain(after.campaign.planetById("titan"));
let planetDiff = 0; for (let x = -900; x <= 900; x += 37) for (let z = -900; z <= 900; z += 41) if (titanOld.heightAt(x, z) !== titanNew.heightAt(x, z) || titanOld.isLand(x, z) !== titanNew.isLand(x, z)) planetDiff++;
console.log(`Titan battle ground (planet-terrain): differences ${planetDiff}`);
