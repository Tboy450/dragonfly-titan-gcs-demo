// Builds the move plan (old -> new) for every tracked file and records the pre-move tree.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const out = process.argv[2];
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\0").filter(Boolean);
const researchDirs = [], archiveDirs = [];
const swarmResearch = /^(swarmfall-.+|fantasy-city-2026-10-16|lab-aftermath-2026-10-19|scout-polish-2026-10-19|scout-lab-comparison-2026-10-19)$/;
const swarmArchive = /^(swarmfall-.+|environment-lab-v1-2026-10-16|lab-aftermath-2026-10-19|lab-campaign-planets-2026-10-22|scout-polish-2026-10-19|scout-lab-comparison-2026-10-19)$/;
const prefixes = [["dist/invasion/", "swarmfall/dist/"], ["tests/helpers/", "swarmfall/tests/helpers/"], ["tests/fixtures/", "swarmfall/tests/fixtures/"]];
for (const f of files) {
  const [top, second] = f.split("/");
  if (top === "research" && f.split("/").length > 2 && swarmResearch.test(second) && !researchDirs.includes(second)) researchDirs.push(second);
  if (top === "archive" && f.split("/").length > 2 && swarmArchive.test(second) && !archiveDirs.includes(second)) archiveDirs.push(second);
}
for (const d of researchDirs) prefixes.push([`research/${d}/`, `swarmfall/research/${d}/`]);
for (const d of archiveDirs) prefixes.push([`archive/${d}/`, `swarmfall/archive/${d}/`]);
const map = {};
for (const f of files) {
  let to = null;
  for (const [a, b] of prefixes) if (f.startsWith(a)) { to = b + f.slice(a.length); break; }
  if (!to && /^tests\/invasion-[^/]+\.test\.mjs$/.test(f)) to = "swarmfall/" + f;
  if (!to && f === "SWARMFALL-TODO.md") to = "swarmfall/TODO.md";
  if (to) map[f] = to;
}
writeFileSync(out + "/old-files.json", JSON.stringify(files));
writeFileSync(out + "/move-map.json", JSON.stringify({ prefixes, files: map }, null, 1));
console.log(JSON.stringify({ tracked: files.length, moved: Object.keys(map).length, researchDirs: researchDirs.length, archiveDirs: archiveDirs.length, tests: Object.keys(map).filter(f => f.startsWith("tests/")).length }));
