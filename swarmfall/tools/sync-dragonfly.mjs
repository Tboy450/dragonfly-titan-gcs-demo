// Copies the Dragonfly simulator modules Swarmfall uses (Titan terrain, the arrival timeline and
// hardware, and the research model behind the Dragonfly drone) from the simulator's `dist/` into
// `swarmfall/dist/vendor/dragonfly/`, so the game never imports the simulator directly.
//
//   node swarmfall/tools/sync-dragonfly.mjs           refresh the copy from the simulator
//   node swarmfall/tools/sync-dragonfly.mjs --check   report differences only; exit 1 if any
//
// Simulator changes reach the game only when this is run on purpose. Review the diff, run
// `node --test swarmfall/tests/*.test.mjs` and look at the Dragonfly and Titan in the game.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const swarmfall = fileURLToPath(new URL("../", import.meta.url));
const repo = join(swarmfall, "..");
const simulator = join(repo, "dist");
const target = join(swarmfall, "dist", "vendor", "dragonfly");
const gameThree = join(swarmfall, "dist", "vendor", "three");

// The simulator modules the game imports. Their own imports are followed automatically.
export const entries = ["vehicle-research.mjs", "titan-terrain.mjs", "mission-systems.mjs", "arrival-hardware.mjs", "edl.mjs"];

const header = (name) => `// Swarmfall copy of the Dragonfly simulator's dist/${name}, vendored by swarmfall/tools/sync-dragonfly.mjs.\n` +
  "// Do not edit here: change the simulator, then re-run the tool (see README.md in this folder).\n";
export const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const posixPath = (path) => path.split("\\").join("/");

// Text files are compared and hashed with LF line endings, so Windows checkouts (CRLF) and
// GitHub's Linux runner (LF) agree. Images and other binary files are used as they are.
export function normalized(path, data) {
  return /\.(?:m?js|json|md|css|html)$/.test(path) ? Buffer.from(data.toString("utf8").replace(/\r\n/g, "\n"), "utf8") : data;
}

// Module specifiers in import/export statements and import() calls (not prose in comments).
export function moduleSpecifiers(text) {
  const patterns = [
    /^[ \t]*import\b[^;'"]*?\bfrom\s*(["'])([^"'\r\n]+)\1/gm,
    /^[ \t]*import\s*(["'])([^"'\r\n]+)\1/gm,
    /^[ \t]*export\s*(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s*from\s*(["'])([^"'\r\n]+)\1/gm,
    /\bimport\(\s*(["'])([^"'\r\n]+)\1\s*\)/g,
  ];
  return patterns.flatMap((pattern) => [...text.matchAll(pattern)].map((match) => match[2]));
}

// Everything the game's copy should contain: relative path -> bytes, plus where each came from.
export function buildSnapshot() {
  const files = new Map(), sources = new Map(), queue = [...entries];
  while (queue.length) {
    const name = queue.shift();
    if (files.has(name)) continue;
    const from = join(simulator, name);
    if (!existsSync(from)) throw new Error(`Simulator module not found: dist/${name}`);
    let text = readFileSync(from, "utf8").replace(/\r\n/g, "\n");
    for (const spec of moduleSpecifiers(text)) {
      if (spec === "./vendor/three/three.module.min.js?v=dev") continue;
      const sibling = spec.match(/^\.\/([\w-]+\.mjs)\?v=dev$/);
      if (!sibling) throw new Error(`dist/${name} imports ${spec}; extend sync-dragonfly.mjs before vendoring it`);
      queue.push(sibling[1]);
    }
    for (const [, asset] of text.matchAll(/new URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g)) {
      if (!asset.startsWith("./")) throw new Error(`dist/${name} loads ${asset}; extend sync-dragonfly.mjs before vendoring it`);
      const path = asset.slice(2).split("?")[0];
      if (!existsSync(join(simulator, path))) throw new Error(`dist/${name} loads missing ${path}`);
      files.set(path, normalized(path, readFileSync(join(simulator, path))));
      sources.set(path, `dist/${path}`);
    }
    text = text.replace(/(["'])\.\/vendor\/three\//g, "$1../three/");
    files.set(name, Buffer.from(header(name) + text, "utf8"));
    sources.set(name, `dist/${name}`);
  }
  return { files, sources };
}

function listVendored() {
  if (!existsSync(target)) return [];
  return readdirSync(target, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => posixPath(relative(target, join(entry.parentPath ?? entry.path, entry.name))))
    .filter((path) => path !== "README.md" && path !== "manifest.json");
}

function lastCommit(paths) {
  try {
    const [commit, date] = execFileSync("git", ["log", "-1", "--format=%H %cs", "--", ...paths], { cwd: repo, encoding: "utf8" }).trim().split(" ");
    const uncommittedChanges = execFileSync("git", ["status", "--porcelain", "--", ...paths], { cwd: repo, encoding: "utf8" }).trim() !== "";
    return { commit, date, uncommittedChanges };
  } catch {
    return { commit: "unknown", date: "unknown", uncommittedChanges: true };
  }
}

export function compare(snapshot = buildSnapshot()) {
  const vendored = new Set(listVendored());
  const changed = [], added = [], removed = [];
  for (const [path, data] of snapshot.files) {
    if (!vendored.has(path)) added.push(path);
    else if (!normalized(path, readFileSync(join(target, path))).equals(data)) changed.push(path);
  }
  for (const path of vendored) if (!snapshot.files.has(path)) removed.push(path);
  const threeDiffers = ["three.module.min.js", "three.core.min.js"].filter((file) => !existsSync(join(gameThree, file)) ||
    !normalized(file, readFileSync(join(gameThree, file))).equals(normalized(file, readFileSync(join(simulator, "vendor", "three", file)))));
  return { changed, added, removed, threeDiffers };
}

function write(snapshot) {
  const diff = compare(snapshot);
  const names = [...snapshot.files.keys()].sort();
  const manifest = JSON.stringify({
    about: "Pinned copy of the Dragonfly simulator modules Swarmfall uses. Written by swarmfall/tools/sync-dragonfly.mjs; do not edit by hand. " +
      "sha256 is of each file with LF line endings (text) or as is (images).",
    simulator: { ...lastCommit([...snapshot.sources.values()]), entries },
    files: Object.fromEntries(names.map((path) => [path, { from: snapshot.sources.get(path), sha256: sha256(snapshot.files.get(path)) }])),
  }, null, 2) + "\n";
  const manifestPath = join(target, "manifest.json");
  const manifestCurrent = existsSync(manifestPath) && readFileSync(manifestPath, "utf8").replace(/\r\n/g, "\n") === manifest;
  if (!diff.changed.length && !diff.added.length && !diff.removed.length && manifestCurrent) {
    console.log("vendor/dragonfly already matches the simulator; nothing written.");
    return diff;
  }
  mkdirSync(target, { recursive: true });
  for (const path of diff.removed) rmSync(join(target, path));
  for (const path of [...diff.changed, ...diff.added]) {
    mkdirSync(dirname(join(target, path)), { recursive: true });
    writeFileSync(join(target, path), snapshot.files.get(path));
  }
  writeFileSync(manifestPath, manifest);
  console.log(`Wrote ${diff.changed.length + diff.added.length} file(s) and the manifest to swarmfall/dist/vendor/dragonfly ` +
    `(${names.length} files, simulator ${JSON.parse(manifest).simulator.commit.slice(0, 7)}).`);
  return diff;
}

function report(diff) {
  for (const [label, list] of [["changed", diff.changed], ["new", diff.added], ["no longer used", diff.removed]]) {
    if (list.length) console.log(`${label}: ${list.join(", ")}`);
  }
  if (diff.threeDiffers.length) {
    console.log(`note: the simulator's three.js differs from the game's copy (${diff.threeDiffers.join(", ")}); ` +
      "the vendored modules may expect the simulator's version.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes("--check");
  const diff = check ? compare() : write(buildSnapshot());
  report(diff);
  if (check) {
    const drift = diff.changed.length + diff.added.length + diff.removed.length;
    console.log(drift ? `${drift} file(s) differ from the simulator. Run without --check to refresh.` : "vendor/dragonfly matches the simulator.");
    process.exitCode = drift ? 1 : 0;
  }
}
