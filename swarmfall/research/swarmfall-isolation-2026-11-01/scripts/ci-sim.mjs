// Runs the workflow's own "Assemble the site" and "Stamp build version" steps on a temp copy and
// compares the assembled (unstamped) site with the tree published before the change.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";
const [tmp, bash] = process.argv.slice(2);
rmSync(tmp, { recursive: true, force: true });
const repo = join(tmp, "repo"), old = join(tmp, "old");
mkdirSync(join(repo, "swarmfall"), { recursive: true }); mkdirSync(old, { recursive: true });
cpSync("dist", join(repo, "dist"), { recursive: true });
cpSync("swarmfall/dist", join(repo, "swarmfall", "dist"), { recursive: true });
execFileSync("git", ["archive", "-o", join(tmp, "old.tar"), "454c3e6", "dist"]);
execFileSync("tar", ["-xf", join(tmp, "old.tar"), "-C", old]);
const workflow = readFileSync(".github/workflows/pages.yml", "utf8").replace(/\r\n/g, "\n");
const step = (name) => {
  const at = workflow.indexOf(`- name: ${name}\n`); if (at < 0) throw new Error(name);
  const lines = workflow.slice(at).split("\n"), body = [];
  let i = lines.findIndex(l => /^\s+run: \|$/.test(l)); const indent = lines[i + 1].match(/^\s*/)[0].length;
  for (i++; i < lines.length && (lines[i].trim() === "" || lines[i].match(/^\s*/)[0].length >= indent); i++) body.push(lines[i].slice(indent));
  return body.join("\n").trim() + "\n";
};
const run = (name) => { const script = join(tmp, name.replace(/\W+/g, "-") + ".sh"); writeFileSync(script, "set -euo pipefail\n" + step(name));
  return execFileSync(bash, [script.replace(/\\/g, "/")], { cwd: repo, env: { ...process.env, GITHUB_SHA: "abcdef1234567890" }, encoding: "utf8" }); };
run("Assemble the site");
const list = (root) => readdirSync(root, { recursive: true, withFileTypes: true }).filter(e => e.isFile()).map(e => relative(root, join(e.parentPath, e.name)).replaceAll("\\", "/")).sort();
const text = (f) => /\.(m?js|html|css|json|md|xml|txt|svg)$/.test(f);
const read = (root, f) => { const b = readFileSync(join(root, f)); return text(f) ? b.toString("utf8").replace(/\r\n/g, "\n") : b.toString("base64"); };
const site = join(repo, "_site"), before = join(old, "dist");
const a = new Set(list(before)), b = new Set(list(site));
const added = [...b].filter(f => !a.has(f)), removed = [...a].filter(f => !b.has(f));
const changed = [...b].filter(f => a.has(f) && read(before, f) !== read(site, f));
const group = (fs) => Object.entries(fs.reduce((m, f) => { const k = f.split("/").slice(0, f.startsWith("invasion/vendor/") ? 3 : 2).join("/"); m[k] = (m[k] || 0) + 1; return m; }, {})).map(([k, n]) => `${k} (${n})`).join(", ");
console.log(`published before: ${a.size} files; assembled now: ${b.size}`);
console.log(`added: ${added.length} -> ${group(added)}`);
console.log(`removed: ${removed.length} -> ${removed.join(", ")}`);
console.log(`changed: ${changed.length} -> ${changed.join(", ")}`);
// Changed files must differ only in import paths (and the vendored-three README).
for (const f of changed.filter(f => !f.endsWith("README.md"))) {
  const x = read(before, f).split("\n"), y = read(site, f).split("\n");
  const diffs = x.map((l, i) => [l, y[i]]).filter(([l, m]) => l !== m);
  const bad = diffs.filter(([l, m]) => l.replace(/["'][^"']*\.(?:m?js)(?:\?v=dev)?["']/g, "P").replace(/"\.\.\/[^"]*vendor\/three\/[^"]*"/g, "P") !== m.replace(/["'][^"']*\.(?:m?js)(?:\?v=dev)?["']/g, "P").replace(/"\.\.\/[^"]*vendor\/three\/[^"]*"/g, "P"));
  if (x.length !== y.length || bad.length) console.log(`  NON-PATH CHANGE in ${f}: ${bad.slice(0, 2).map(p => p.join(" ==> ")).join(" | ")}`);
}
const movedAddons = removed.every(f => added.includes("invasion/" + f));
console.log(`removed files reappear under invasion/: ${movedAddons}`);
run("Stamp build version");
const leftover = list(site).filter(f => /\.(m?js|html)$/.test(f) && readFileSync(join(site, f), "utf8").includes("?v=dev"));
const label = (f) => (readFileSync(join(site, f), "utf8").match(/data-build-stamp>([^<]*)</) || [])[1];
console.log(`after stamping: ${leftover.length} files with ?v=dev; labels: ${["index.html", "invasion/index.html", "invasion/environments/index.html"].map(label).join(" | ")}`);
const stamped = readFileSync(join(site, "invasion/vendor/dragonfly/titan-terrain.mjs"), "utf8").match(/from "[^"]*three[^"]*"/)[0];
console.log(`vendored import after stamping: ${stamped}`);
