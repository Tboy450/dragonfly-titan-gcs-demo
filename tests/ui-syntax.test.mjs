import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

test("Browser entry point and UI modules parse before publishing", () => {
  const root = new URL("../dist/", import.meta.url);
  const files = ["app.js", ...readdirSync(new URL("ui/", root)).filter(name => name.endsWith(".mjs")).map(name => `ui/${name}`)];
  for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", fileURLToPath(new URL(file, root))], { encoding: "utf8" });
    assert.equal(result.status, 0, `${file}: ${result.error?.message ?? result.stderr}`);
  }
});
