// One-time: repoint the moved research scripts from dist/invasion/ to dist/ (run from the
// repository root after the move). Each edit states how many matches it expects and is skipped
// with a message if the file has changed since November 1, 2026.
import { readFileSync, writeFileSync } from "node:fs";
const R = "swarmfall/research/";
const edits = [
  [R + "fantasy-city-2026-10-16/build-houdini-coast.py", "'dist/invasion/environments/", "'dist/environments/", 2],
  [R + "fantasy-city-2026-10-16/convert-source-scene.py", '"dist/invasion/environments/assets/source-scenes"', '"dist/environments/assets/source-scenes"', 1],
  [R + "fantasy-city-2026-10-16/correct-houdini-glb-winding.mjs", "'../../dist/invasion/environments/", "'../../dist/environments/", 1],
  [R + "fantasy-city-2026-10-16/fit-city-foundation.py", "'dist/invasion/environments/", "'dist/environments/", 2],
  [R + "fantasy-city-2026-10-16/inspect-city-bounds.mjs", "'dist/invasion/environments/", "'dist/environments/", 1],
  [R + "fantasy-city-2026-10-16/prepare-environment-assets.py", '"dist/invasion/environments/assets"', '"dist/environments/assets"', 1],
  [R + "fantasy-city-2026-10-16/prepare-environment-kits.py", '"dist/invasion/environments/assets"', '"dist/environments/assets"', 1],
  [R + "fantasy-city-2026-10-16/prepare-environment-kits.py", "under dist/invasion/environments/assets/", "under swarmfall/dist/environments/assets/", 1],
  [R + "fantasy-city-2026-10-16/prepare-foundation-input.mjs", "'../../dist/invasion/environments/", "'../../dist/environments/", 1],
  [R + "fantasy-city-2026-10-16/probe-houdini-city.py", "'dist/invasion/environments/", "'dist/environments/", 1],
  [R + "lab-aftermath-2026-10-19/probe.mjs", "'../../dist/invasion/environments/", "'../../dist/environments/", 5],
  [R + "scout-polish-2026-10-19/export-scout.mjs", "'../../dist/invasion/models.mjs'", "'../../dist/models.mjs'", 1],
  [R + "swarmfall-checkpoint-validation-2026-10-19/compare-validators.mjs", "'../../dist/invasion/", "'../../dist/", 4],
  [R + "swarmfall-small-assets-2026-10-19/inventory.mjs", "'../../dist/invasion/models.mjs'", "'../../dist/models.mjs'", 1],
];
for (const [file, from, to, expected] of edits) {
  const text = readFileSync(file, "utf8"), count = text.split(from).length - 1;
  if (count !== expected) { console.log(`SKIP ${file}: expected ${expected} of ${from}, found ${count}`); continue; }
  writeFileSync(file, text.split(from).join(to));
  console.log(`ok ${count}x ${file}`);
}
