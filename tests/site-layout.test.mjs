import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";

// Swarmfall is developed in swarmfall/ with its own tests (swarmfall/tests/) and published by the
// same workflow under invasion/. These checks cover the simulator's side of that arrangement.
const root = new URL("../", import.meta.url);
const read = path => readFileSync(new URL(path, root), "utf8");

test("The simulator stands alone: no game folder in dist/ and no imports from Swarmfall", () => {
  assert.ok(!existsSync(new URL("dist/invasion", root)), "the game is published from swarmfall/dist, not dist/invasion");
  assert.ok(existsSync(new URL("swarmfall/dist/index.html", root)));
  const dist = new URL("dist/", root);
  const files = readdirSync(dist, { recursive: true }).map(file => file.replaceAll("\\", "/"))
    .filter(file => /\.(?:m?js|html)$/.test(file) && !file.startsWith("vendor/"));
  assert.ok(files.includes("app.js"));
  for (const file of files) {
    assert.doesNotMatch(readFileSync(new URL(file, dist), "utf8"), /\b(?:from|import)\s*\(?\s*["'][^"']*(?:swarmfall|invasion)\//, `${file} imports game code`);
  }
});

test("The publish workflow checks both projects and adds Swarmfall at invasion/ before stamping", () => {
  const workflow = read(".github/workflows/pages.yml");
  const at = text => { const index = workflow.indexOf(text); assert.ok(index >= 0, `the workflow contains ${text}`); return index; };
  const stamp = at("Stamp build version");
  for (const step of ["node --test tests/*.test.mjs", "node --test swarmfall/tests/*.test.mjs", "cp -R dist/. _site/", "cp -R swarmfall/dist _site/invasion"]) {
    assert.ok(at(step) < stamp, `${step} runs before stamping`);
  }
  for (const page of ["_site/index.html", "_site/invasion/index.html", "_site/invasion/environments/index.html"]) {
    assert.ok(workflow.includes(`grep -qF "Build \${short}" ${page}`), `the publish step stamps ${page}`);
  }
  assert.ok(workflow.includes("! grep -rqF '?v=dev' _site"), "no unstamped reference is published");
  assert.match(workflow, /upload-pages-artifact@[\s\S]*?path: _site\b/, "the assembled site is what gets published");
});

// Moved from the game's tests when Swarmfall was isolated: the not-found page belongs to the site.
test("The site's not-found page sends mistyped or decorated game links to the game", () => {
  const html = read("dist/404.html");
  // Checkouts may use Windows line endings, so the function's end is matched either way.
  const source = html.match(/function notFoundTarget[\s\S]*?\r?\n {6}}\r?\n/)[0];
  const notFoundTarget = vm.runInNewContext(`${source}; notFoundTarget`);
  const repo = "/dragonfly-titan-gcs-demo";
  for (const path of ["/invasion/**", "/invasion/%2A%2A", "/Invasion/", "/INVASION", "/invasion/)", "/invasion%20", "/swarmfall/", "/invasion/index.htm"]) {
    assert.equal(notFoundTarget(repo + path, true), `${repo}/invasion/`, path);
  }
  assert.equal(notFoundTarget("/Invasion/", false), "/invasion/", "works when the site is served from the root");
  assert.equal(notFoundTarget(`${repo}/no-such-page`, true), null, "other missing pages show the links instead");
  assert.equal(notFoundTarget(`${repo}/%E0%A4%A`, true), null, "a malformed address does not throw");
});
