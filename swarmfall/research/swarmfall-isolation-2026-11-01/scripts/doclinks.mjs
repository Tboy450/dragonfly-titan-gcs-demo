// Rewrites relative links in Markdown (and inline HTML) so links that worked before the move still
// work: resolve against the file's old location, map moved targets, relativize from the new location.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { posix } from "node:path";
const [dir, mode] = process.argv.slice(2);
const { files: map, prefixes } = JSON.parse(readFileSync(dir + "/move-map.json", "utf8"));
const allPrefixes = [...prefixes, ["dist/vendor/three/addons/", "swarmfall/dist/vendor/three/addons/"]];
const oldFiles = new Set(JSON.parse(readFileSync(dir + "/old-files.json", "utf8")));
const oldDirs = new Set(); for (const f of oldFiles) { let d = posix.dirname(f); while (d !== ".") { oldDirs.add(d); d = posix.dirname(d); } }
const inverse = Object.fromEntries(Object.entries(map).map(([a, b]) => [b, a]));
const existedBefore = p => oldFiles.has(p) || oldDirs.has(p);
function moved(oldTarget) {
  if (map[oldTarget]) return map[oldTarget];
  for (const [a, b] of allPrefixes) if ((oldTarget + "/").startsWith(a)) return (b + (oldTarget + "/").slice(a.length)).replace(/\/$/, "");
  return oldTarget;
}
const now = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\0").filter(Boolean);
const frozen = f => /^(swarmfall\/)?archive\//.test(f) && !/\/README\.md$/.test(f);
const docs = now.filter(f => /\.md$/i.test(f) && !frozen(f) && (inverse[f] || oldFiles.has(f)));
const report = []; let filesChanged = 0, linksChanged = 0, brokenBefore = 0;
function relink(target, oldFile, newFile) {
  if (!target || /^([a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) return target;
  const m = target.match(/^([^?#]*)(.*)$/); const raw = m[1], suffix = m[2];
  if (!raw) return target;
  let path; try { path = decodeURI(raw); } catch { return target; }
  const oldTarget = posix.normalize(posix.join(posix.dirname(oldFile), path)).replace(/\/$/, "");
  if (oldTarget === "." || oldTarget.startsWith("..")) return target;
  if (!existedBefore(oldTarget)) { brokenBefore++; return target; }
  const newTarget = moved(oldTarget);
  let rel = posix.relative(posix.dirname(newFile), newTarget) || ".";
  if (raw.endsWith("/") && !rel.endsWith("/")) rel += "/";
  if (raw.startsWith("./") && !rel.startsWith(".")) rel = "./" + rel;
  if (raw.includes("%20") || raw !== path) rel = encodeURI(rel);
  const before = posix.normalize(posix.join(posix.dirname(oldFile), path));
  if (rel === raw || (newFile === oldFile && newTarget === oldTarget)) return target;
  return rel + suffix;
}
for (const file of docs) {
  const oldFile = inverse[file] || file;
  const text = readFileSync(file, "utf8");
  let n = 0;
  const swap = (whole, pre, target, post = "") => { const next = relink(target, oldFile, file); if (next === target) return whole; n++; report.push(`${file}: ${target} => ${next}`); return pre + next + post; };
  let out = text.replace(/(\]\(\s*<?)([^)\s>]+)/g, (w, pre, t) => swap(w, pre, t));
  out = out.replace(/^(\s{0,3}\[[^\]]+\]:\s*<?)([^\s>]+)/gm, (w, pre, t) => swap(w, pre, t));
  out = out.replace(/(\b(?:href|src)\s*=\s*["'])([^"']+)(["'])/g, (w, pre, t, post) => swap(w, pre, t, post));
  if (n) { filesChanged++; linksChanged += n; if (mode === "apply") writeFileSync(file, out); }
}
console.log(report.join("\n"));
console.log(`\n${mode}: ${linksChanged} links in ${filesChanged} of ${docs.length} docs; ${brokenBefore} links were already broken before the move (left as they were)`);
