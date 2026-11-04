// Measures what the game's Dragonfly drone costs to build: the full research model the simulator
// builds, split by subsystem layer, and what models.mjs keeps after removing interior/diagram parts.
// Node with DOM stand-ins, run from the repository root:
//   node swarmfall/research/swarmfall-isolation-2026-11-01/scripts/measure-dragonfly.mjs
// Timings are Node's, not a browser's. November 1, 2026 result: 4,217 meshes / 422,344 vertices
// built in about 0.47 s; interior 20 subsystems / 2,552 meshes; the game keeps 269 merged meshes.
import { pathToFileURL } from "node:url";
const context2d = new Proxy({}, { get: (t, k) => k in t ? t[k] : ["createLinearGradient", "createRadialGradient"].includes(k) ? () => ({ addColorStop() {} }) : () => {}, set: (t, k, v) => { t[k] = v; return true; } });
const element = () => ({ style: {}, width: 0, height: 0, getContext: () => context2d, addEventListener() {}, setAttribute() {} });
globalThis.document = { createElement: element, createElementNS: element };
globalThis.window = { devicePixelRatio: 1 };
const base = pathToFileURL(process.cwd() + "/swarmfall/dist/").href;
const THREE = await import(base + "vendor/three/three.module.min.js?v=dev");
const { buildResearchModel } = await import(base + "vendor/dragonfly/vehicle-research.mjs?v=dev");
const models = await import(base + "models.mjs?v=dev");
const group = new THREE.Group(); let target = group;
const metal = new THREE.MeshStandardMaterial(), deck = new THREE.MeshStandardMaterial(), gold = new THREE.MeshStandardMaterial();
const mesh = (g, m, p, parent = target) => { const o = new THREE.Mesh(g, m); o.position.set(...p); parent.add(o); return o; };
const strut = (a, b, r = 0.026, m = metal) => mesh(new THREE.CylinderGeometry(r, r, 1, 10), m, [0, 0, 0]);
const t0 = performance.now();
const built = buildResearchModel({ group, mesh, strut, metal, deck, gold, upAxis: new THREE.Vector3(0, 1, 0), setTarget: n => { target = n || group; } });
const buildMs = performance.now() - t0;
const count = (root) => { let meshes = 0, verts = 0; root.traverse(o => { if (o.isMesh) { meshes++; verts += o.geometry.attributes.position.count; } }); return { meshes, verts }; };
const byLayer = {};
for (const sub of Object.values(built.subsystems)) {
  const layer = sub.userData.layer || "(none)", c = count(sub);
  byLayer[layer] = byLayer[layer] || { subsystems: 0, meshes: 0, verts: 0 };
  byLayer[layer].subsystems++; byLayer[layer].meshes += c.meshes; byLayer[layer].verts += c.verts;
}
const t1 = performance.now(), kept = count(models.dragonflyTemplate()), templateMs = performance.now() - t1;
console.log(JSON.stringify({ fullModel: count(group), buildMs: Math.round(buildMs), byLayer, gameTemplate: { ...kept, ms: Math.round(templateMs) } }, null, 1));
