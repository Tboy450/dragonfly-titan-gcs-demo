// For every Markdown doc: links that resolved before the move (old content, old tree at HEAD)
// must still resolve now (current content, current tree). Reports regressions only.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { posix } from "node:path";
const dir = process.argv[2];
const { files: map } = JSON.parse(readFileSync(dir + "/move-map.json", "utf8"));
const inverse = Object.fromEntries(Object.entries(map).map(([a, b]) => [b, a]));
const oldFiles = new Set(JSON.parse(readFileSync(dir + "/old-files.json", "utf8")));
const dirsOf = set => { const d = new Set(); for (const f of set) { let p = posix.dirname(f); while (p !== ".") { d.add(p); p = posix.dirname(p); } } return d; };
const oldDirs = dirsOf(oldFiles);
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28 });
const nowFiles = new Set(git("ls-files", "-z").split("\0").filter(Boolean)), nowDirs = dirsOf(nowFiles);
const links = text => [...text.matchAll(/\]\(\s*<?([^)\s>]+)/g), ...text.matchAll(/^\s{0,3}\[[^\]]+\]:\s*<?([^\s>]+)/gm), ...text.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
const resolve = (file, target) => {
  if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) return null;
  const raw = target.replace(/[?#].*$/, ""); if (!raw) return null;
  let p; try { p = decodeURI(raw); } catch { return null; }
  const r = posix.normalize(posix.join(posix.dirname(file), p)).replace(/\/$/, "");
  return r.startsWith("..") ? null : r;
};
let checked = 0; const regressions = [];
for (const file of [...nowFiles].filter(f => /\.md$/i.test(f))) {
  const oldFile = inverse[file] || file;
  const now = links(readFileSync(file, "utf8")).map(t => [t, resolve(file, t)]).filter(([, r]) => r);
  let before = []; if (oldFiles.has(oldFile)) before = links(git("show", "HEAD:" + oldFile)).map(t => resolve(oldFile, t)).filter(Boolean);
  const okBefore = before.filter(r => oldFiles.has(r) || oldDirs.has(r)).length;
  const okNow = now.filter(([, r]) => nowFiles.has(r) || nowDirs.has(r) || existsSync(r)).length;
  checked += now.length;
  for (const [t, r] of now) if (!(nowFiles.has(r) || nowDirs.has(r) || existsSync(r))) {
    const wasOk = before.some(b => (oldFiles.has(b) || oldDirs.has(b)) && posix.basename(b) === posix.basename(r));
    if (wasOk || okNow < okBefore) regressions.push(`${file}: ${t}`);
  }
}
console.log(`links checked: ${checked}; possible regressions: ${regressions.length}`);
console.log(regressions.slice(0, 40).join("\n"));
