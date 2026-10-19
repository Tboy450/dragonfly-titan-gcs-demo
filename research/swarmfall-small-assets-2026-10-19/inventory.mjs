// CPU geometry inventory, not a screenshot, GPU benchmark or artistic approval.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { droneModels, figureModel, interceptorModel } from '../../dist/invasion/models.mjs';

function describe(geometry) {
  geometry.computeBoundingBox();
  const positions = geometry.getAttribute('position');
  assert.ok(positions.count > 0);
  assert.ok([...positions.array].every(Number.isFinite));
  const result = {
    vertices: positions.count,
    triangles: (geometry.index?.count ?? positions.count) / 3,
    attributeBytes: Object.values(geometry.attributes).reduce((n, a) => n + a.array.byteLength, 0),
    bounds: { min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray() },
  };
  geometry.dispose();
  return result;
}
const drones = Object.fromEntries(Object.entries(droneModels()).map(([id, model]) => [id, {
  scale: model.scale, rotorDiscs: model.rotors.length,
  body: describe(model.body), glow: describe(model.glow),
}]));
const result = {
  sourceBaseline: '72b2d4d',
  scope: 'Merged body/glow geometry only; excludes renderer rotor geometry, instances, effects and GPU allocation.',
  units: 'Bounds are local model units before scale; bytes are CPU attribute arrays, not transfer size or VRAM.',
  drones,
  defenders: { figure: describe(figureModel()), interceptor: describe(interceptorModel()) },
};
writeFileSync(new URL('./inventory.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
for (const [id, model] of Object.entries(drones))
  console.log(`${id}: ${model.body.triangles + model.glow.triangles} body/glow triangles; ${model.rotorDiscs} rotor discs`);
for (const [id, geometry] of Object.entries(result.defenders)) console.log(`${id}: ${geometry.triangles} triangles`);
