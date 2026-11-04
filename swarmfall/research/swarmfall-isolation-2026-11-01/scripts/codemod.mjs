// Repoints relative references in moved files: resolve against the old location, map moved or
// vendored targets, then relativize from the new location. Usage: node codemod.mjs <dir> <mode> <apply?> <files...>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { posix } from "node:path";
const [dir, mode, apply] = process.argv.slice(2);
const { files: map, prefixes } = JSON.parse(readFileSync(dir + "/move-map.json", "utf8"));
const oldFiles = new Set(JSON.parse(readFileSync(dir + "/old-files.json", "utf8")));
const inverse = Object.fromEntries(Object.entries(map).map(([a, b]) => [b, a]));
const oldDirs = new Set(); for (const f of oldFiles) { let d = posix.dirname(f); while (d !== ".") { oldDirs.add(d); d = posix.dirname(d); } }
const vendored = new Set(Object.keys(JSON.parse(readFileSync("swarmfall/dist/vendor/dragonfly/manifest.json", "utf8")).files));
const exists = (p) => oldFiles.has(p) || oldDirs.has(p.replace(/\/$/, ""));
function mapTarget(oldTarget) {
  if (map[oldTarget]) return map[oldTarget];
  for (const [a, b] of prefixes) { if ((oldTarget + "/").startsWith(a)) return (b + (oldTarget + "/").slice(a.length)).replace(/\/$/, ""); }
  if (mode === "code" || mode === "test") {
    if (oldTarget.startsWith("dist/vendor/three/") || oldTarget === "dist/vendor/three") return "swarmfall/" + oldTarget;
    const m = oldTarget.match(/^dist\/([\w-]+\.mjs)$/); if (m && vendored.has(m[1])) return "swarmfall/dist/vendor/dragonfly/" + m[1];
  }
  return oldTarget;
}
const report = [];
for (const file of process.argv.slice(5)) {
  const oldPath = inverse[file] || file;
  const text = readFileSync(file, "utf8");
  const re = /(["'`])(\.{1,2}\/[^"'`\s]*)\1/g;
  let changed = 0;
  const out = text.replace(re, (whole, q, ref) => {
    const m = ref.match(/^([^?#]*)([?#].*)?$/); const path = m[1], suffix = m[2] || "";
    if (path.includes("${")) { report.push(`${file}: TEMPLATE ${ref}`); return whole; }
    const isDir = path.endsWith("/") || path === "." || path === "..";
    const oldTarget = posix.normalize(posix.join(posix.dirname(oldPath), path)).replace(/\/$/, "");
    if (oldTarget.startsWith("..")) return whole;
    if (!exists(oldTarget)) { if (!/not-a-planet|private-file/.test(ref)) report.push(`${file}: MISSING ${ref} -> ${oldTarget}`); return whole; }
    const newTarget = mapTarget(oldTarget);
    let rel = posix.relative(posix.dirname(file), newTarget) || ".";
    if (!rel.startsWith(".")) rel = "./" + rel;
    if (isDir && !rel.endsWith("/")) rel += "/";
    if (path.startsWith("./") && rel.startsWith("./") === false && !rel.startsWith("../")) rel = "./" + rel;
    const next = rel + suffix;
    const sameMeaning = posix.normalize(posix.join(posix.dirname(file), next)) === posix.normalize(posix.join(posix.dirname(file), ref));
    if (next === ref) return whole;
    if (newTarget === oldTarget && !oldTarget.startsWith("dist/invasion")) report.push(`${file}: OUTSIDE ${ref} -> ${oldTarget} (kept? rel would be ${next})`);
    if (newTarget === oldTarget) return whole;
    changed++; report.push(`${file}: ${ref}  =>  ${next}`);
    return q + next + q;
  });
  if (changed && apply === "apply") writeFileSync(file, out);
}
console.log(report.join("\n"));
