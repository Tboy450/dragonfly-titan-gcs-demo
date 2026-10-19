// Export actual Scout geometry for a CPU preview; no browser, GPU or image-generation service.
import { writeFileSync } from 'node:fs';
import { droneModels } from '../../dist/invasion/models.mjs';

const models = droneModels(), scout = models.scout;
const geometry = part => ({
  positions: Array.from(part.getAttribute('position').array),
  normals: Array.from(part.getAttribute('normal').array),
  colors: Array.from(part.getAttribute('color').array),
});
const output = { body: geometry(scout.body), glow: geometry(scout.glow), rotors: scout.rotors, scale: scout.scale };
if (!process.argv[2]) throw new Error('Pass an output JSON path');
writeFileSync(process.argv[2], JSON.stringify(output));
for (const model of Object.values(models)) { model.body.dispose(); model.glow.dispose(); }
console.log(`Exported Scout: ${output.body.positions.length / 9} body triangles`);
