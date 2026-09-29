import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Phones cache unversioned files, so every local script, stylesheet and image reference carries
// ?v=dev in the source. The publish workflow replaces each one with the commit hash; a
// hand-written number here would be missed by that step and could mix old and new modules.
test("Local modules, styles and images use the ?v=dev stamp the publish workflow replaces", () => {
  const dir = new URL("../dist/", import.meta.url);
  const html = readFileSync(new URL("index.html", dir), "utf8");
  assert.ok(html.includes('src="./app.js?v=dev"'), "index.html loads app.js?v=dev");
  assert.ok(html.includes('href="./styles.css?v=dev"'), "index.html loads styles.css?v=dev");
  for (const [, ref] of html.matchAll(/(?:src|href)="(\.\/(?:[\w-]+\.(?:m?js|css)|assets\/[\w.-]+\.(?:jpg|png|svg))[^"]*)"/g)) {
    if (ref === "./assets/titan-mountain-reference.jpg") continue; // also loaded by app.js and the terrain texture
    assert.ok(ref.endsWith("?v=dev"), `index.html references ${ref}`);
  }
  for (const file of readdirSync(dir).filter(f => f.endsWith(".mjs") || f === "app.js")) {
    const source = readFileSync(new URL(file, dir), "utf8");
    for (const [, spec] of source.matchAll(/from "(\.\/[\w-]+\.(?:mjs|js)[^"]*)"/g)) {
      assert.ok(spec.endsWith("?v=dev"), `${file} imports ${spec}`);
    }
  }
});

test("The header shows a build label the publish workflow can stamp", () => {
  const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.ok(html.includes("data-build-stamp>Build local<"));
  const workflow = readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  assert.ok(workflow.includes("data-build-stamp>Build local<"), "workflow replaces the same marker");
  assert.ok(workflow.indexOf("Stamp build version") > workflow.indexOf("node --test"), "stamping runs after the checks");
});
