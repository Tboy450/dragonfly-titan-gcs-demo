import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Phones cache unversioned module files; every local script and stylesheet reference must carry
// the same ?v= stamp so one release never mixes old and new modules. Bump it on each release.
test("All local modules and styles share one cache-busting version", () => {
  const dir = new URL("../dist/", import.meta.url);
  const html = readFileSync(new URL("index.html", dir), "utf8");
  const version = html.match(/src="\.\/app\.js\?v=([\w.-]+)"/)?.[1];
  assert.ok(version, "index.html loads app.js with a ?v= stamp");
  assert.ok(html.includes(`href="./styles.css?v=${version}"`), "styles.css carries the same stamp");
  for (const file of readdirSync(dir).filter(f => f.endsWith(".mjs") || f === "app.js")) {
    const source = readFileSync(new URL(file, dir), "utf8");
    for (const [, spec] of source.matchAll(/from "(\.\/[\w-]+\.(?:mjs|js)[^"]*)"/g)) {
      assert.equal(spec.split("?v=")[1], version, `${file} imports ${spec}`);
    }
  }
});
