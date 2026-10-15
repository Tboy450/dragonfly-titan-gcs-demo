import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const todo = readFileSync(new URL("../INTERIOR-REALISM-TODO.md", import.meta.url), "utf8");
// Numbered parts in the checklist: "- [x] **Claude:** **14 TWTA amplifier** (`twta`)" or "- [ ] **03 Nose bulkhead** (`nose-bulkhead`)".
const parts = [...todo.matchAll(/^- \[([ x])\] (?:\*\*(Codex|Claude):\*\* )?\*\*(\d{2}) [^*]+\*\* \(`([a-z-]+)`[,)]/gm)]
  .map(([, done, by, number, id]) => ({ done: done === "x", by, number, id }));
const block = html.slice(html.indexOf('<details id="part-assumptions">'), html.indexOf('<details id="model-assumptions">'));
const entries = [...block.matchAll(/<li data-assumption="([a-z-]+)"><strong>(\d{2})?[^<]*<\/strong>(?: \((Codex|Claude)\))?/g)]
  .map(([, id, number, by]) => ({ id, number, by }));

test("The checklist lists all 24 numbered parts", () => {
  assert.equal(parts.length, 24);
  assert.deepEqual(parts.map(p => Number(p.number)), Array.from({ length: 24 }, (_, i) => i + 1));
});

test("Vehicle part assumptions has one entry per redrawn part, credited as in the checklist", () => {
  const done = parts.filter(p => p.done);
  const listed = entries.filter(e => e.id !== "placeholders");
  assert.deepEqual(listed.map(e => e.id).sort(), done.map(p => p.id).sort());
  for (const p of done) {
    const e = listed.find(x => x.id === p.id);
    assert.equal(e.by, p.by, `${p.number} credited to ${p.by}`);
    assert.equal(e.number, p.number, `${p.id} numbered ${p.number}`);
  }
  for (const e of listed) assert.match(block, new RegExp(`data-assumption="${e.id}">.*Published: .*Estimated: `), `${e.id} says what is published and estimated`);
});

test("Counts in the section and in Model assumptions match the checklist; placeholders list the rest", () => {
  const done = parts.filter(p => p.done), byCodex = done.filter(p => p.by === "Codex").length;
  assert.match(block, new RegExp(`${done.length} of the 24 interior parts are redrawn from their own sources \\(${byCodex} by Codex, ${done.length - byCodex} by Claude\\)`));
  assert.match(html, new RegExp(`\\(${done.length} of 24 redrawn so far\\)`));
  const rest = block.match(/data-assumption="placeholders">(.*?)<\/li>/)[1];
  const numbers = new Set([...rest.matchAll(/\b(\d{2})(?:-(\d{2}))?\b/g)].flatMap(([, a, b]) => b ? Array.from({ length: Number(b) - Number(a) + 1 }, (_, i) => String(Number(a) + i).padStart(2, "0")) : [a]));
  assert.deepEqual([...numbers].sort(), parts.filter(p => !p.done).map(p => p.number).sort());
});
