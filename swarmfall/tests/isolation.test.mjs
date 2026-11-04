import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { moduleSpecifiers, normalized, sha256 } from "../tools/sync-dragonfly.mjs";

// Swarmfall is published from swarmfall/dist alone (as invasion/ on the website), so everything
// the game and the Asset Lab load has to be inside that folder. The Dragonfly simulator modules
// the game reuses are a pinned copy in dist/vendor/dragonfly; see the README there.
const dist = new URL("../dist/", import.meta.url);
const files = readdirSync(dist, { recursive: true, withFileTypes: true }).filter(entry => entry.isFile())
  .map(entry => relative(fileURLToPath(dist), join(entry.parentPath, entry.name)).replaceAll("\\", "/"));
const read = file => readFileSync(new URL(file, dist), "utf8");
const name = url => url.href.slice(dist.href.length);
const withoutQuery = url => new URL(url.href.replace(/[?#].*$/, ""));
const pageRefs = page => [...read(page).matchAll(/(?:src|href)="([^"#:]+)"/g)].map(match => match[1])
  .filter(ref => /^\.\.?\//.test(ref)).map(ref => new URL(ref, new URL(page, dist)));

// Follows static and literal dynamic imports and import.meta.url assets, as the browser would.
// Bare specifiers such as "three" resolve through the page's import map.
function walk(roots, page, importMap = {}) {
  const queue = [...roots], seen = new Set(), problems = [];
  while (queue.length) {
    const url = queue.shift(), file = withoutQuery(url);
    if (seen.has(file.href)) continue;
    seen.add(file.href);
    if (!file.href.startsWith(dist.href)) { problems.push(`leaves swarmfall/dist: ${file.href}`); continue; }
    if (!existsSync(file)) { problems.push(`missing: ${name(file)}`); continue; }
    if (!/\.m?js$/.test(file.pathname)) continue;
    const source = readFileSync(file, "utf8");
    for (const spec of moduleSpecifiers(source)) {
      if (/^\.\.?\//.test(spec)) { queue.push(new URL(spec, url)); continue; }
      const key = Object.keys(importMap).filter(k => k === spec || (k.endsWith("/") && spec.startsWith(k))).sort((a, b) => b.length - a.length)[0];
      if (key === undefined) problems.push(`${name(file)} imports "${spec}", which ${page} cannot resolve`);
      else queue.push(new URL(importMap[key] + spec.slice(key.length), new URL(page, dist)));
    }
    for (const [, asset] of source.matchAll(/new URL\(\s*["']([^"'`$]+)["']\s*,\s*import\.meta\.url\s*\)/g)) queue.push(new URL(asset, url));
  }
  return { seen, problems };
}

test("The game page and everything it imports are inside swarmfall/dist", () => {
  const refs = pageRefs("index.html"), simulator = new URL("../", dist).href;
  assert.ok(refs.some(url => url.href === simulator), "the title screen links back to the simulator, published one level up");
  const { seen, problems } = walk(refs.filter(url => url.href !== simulator), "index.html");
  assert.deepEqual(problems, []);
  assert.ok(seen.has(new URL("main.mjs", dist).href));
  assert.ok(seen.has(new URL("vendor/dragonfly/vehicle-research.mjs", dist).href), "the Dragonfly drone comes from the vendored copy");
  assert.ok(seen.has(new URL("vendor/dragonfly/assets/titan-mountain-reference.jpg", dist).href), "so does Titan's ground texture");
  assert.deepEqual([...seen].filter(href => href.endsWith("three.module.min.js")), [new URL("vendor/three/three.module.min.js", dist).href],
    "the game and the vendored modules share one three.js");
});

test("The Asset Lab and every game, lab and vendored module resolve inside swarmfall/dist", () => {
  const page = "environments/index.html";
  const importMap = JSON.parse(read(page).match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
  const modules = files.filter(file => /\.m?js$/.test(file) && !file.startsWith("vendor/three/addons/")).map(file => new URL(file, dist));
  const { seen, problems } = walk([...pageRefs(page), ...modules], page, importMap);
  assert.deepEqual(problems, []);
  assert.ok(seen.has(new URL("vendor/three/addons/loaders/GLTFLoader.js", dist).href), "addons resolve through the import map");
  assert.deepEqual([...seen].filter(href => href.endsWith("three.module.min.js")), [new URL("vendor/three/three.module.min.js", dist).href],
    "the lab, its addons and the game modules it reuses share one three.js");
});

test("No relative path in Swarmfall's code leaves swarmfall/dist except the title screen's simulator link", () => {
  const escapes = [];
  for (const file of files.filter(file => /\.(?:m?js|html|css)$/.test(file) && !file.startsWith("vendor/three/"))) {
    for (const [, ref] of read(file).matchAll(/["'`(]((?:\.\.\/)+[^"'`\s)]*)/g)) {
      if (!ref.includes("${") && !new URL(ref, new URL(file, dist)).href.startsWith(dist.href)) escapes.push(`${file}: ${ref}`);
    }
  }
  assert.deepEqual(escapes, ["index.html: ../"]);
});

// Same rules as the simulator's tests/cache-version.test.mjs, applied to the game's files.
test("Game, lab and vendored modules keep the ?v=dev stamps the publish workflow replaces", () => {
  for (const file of files.filter(file => /\.m?js$/.test(file) && !file.startsWith("vendor/three/"))) {
    for (const [, spec] of read(file).matchAll(/(?:from|import) "(\.\.?\/[\w/-]+\.(?:mjs|js)[^"]*)"/g)) {
      assert.ok(spec.endsWith("?v=dev"), `${file} imports ${spec}`);
    }
  }
  for (const file of files.filter(file => /\.(?:m?js|html)$/.test(file))) {
    for (const [, ref] of read(file).matchAll(/["'](\.{1,2}\/[^"'\r\n]*three\.module\.min\.js[^"']*)["']/g)) {
      assert.ok(ref.endsWith("?v=dev"), `${file} references ${ref}`);
    }
  }
  const wrapper = read("vendor/three/three.module.min.js");
  assert.ok(wrapper.includes("./three.core.min.js?v=dev"));
  assert.ok(!wrapper.includes('"./three.core.min.js"'));
  for (const page of ["index.html", "environments/index.html"]) assert.ok(read(page).includes("data-build-stamp>Build local<"), page);
});

test("The vendored Dragonfly modules are exactly the copy recorded in their manifest", () => {
  const folder = "vendor/dragonfly/";
  const manifest = JSON.parse(read(folder + "manifest.json"));
  const present = files.filter(file => file.startsWith(folder)).map(file => file.slice(folder.length))
    .filter(file => file !== "README.md" && file !== "manifest.json").sort();
  assert.deepEqual(present, Object.keys(manifest.files).sort(), "no vendored file was added or removed by hand");
  for (const [file, { sha256: expected }] of Object.entries(manifest.files)) {
    assert.equal(sha256(normalized(file, readFileSync(new URL(folder + file, dist)))), expected,
      `${folder}${file} differs from its recorded copy: change the simulator, then run swarmfall/tools/sync-dragonfly.mjs`);
  }
  assert.match(manifest.simulator.commit, /^[0-9a-f]{40}$/, "the copy records the simulator commit it came from");
});
