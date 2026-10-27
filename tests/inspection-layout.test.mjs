import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

function backdrop(saved = {}) {
  const storage = new Map(Object.entries(saved)), elements = new Map(), operations = [];
  const buttons = Array.from({ length: 3 }, () => ({ attrs: {}, setAttribute(k,v) { this.attrs[k]=v; },
    addEventListener(type, fn) { this[type]=fn; } }));
  const element = id => {
    if (!elements.has(id)) elements.set(id, { setAttribute() {}, querySelectorAll: () => buttons });
    return elements.get(id);
  };
  const context = new Proxy({}, {
    get: (_, key) => (...args) => {
      operations.push([key, ...args]);
      if (key === "createLinearGradient" || key === "createRadialGradient") {
        return { addColorStop: (...stop) => operations.push(["addColorStop", ...stop]) };
      }
    },
    set: (_, key, value) => { operations.push([key, value]); return true; }
  });
  const state = { view: "mission", missionLayer: "internal", vehicleModel: "research", inspector: {} };
  const scope = { state, $: element, localStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) },
    document: { createElement: () => ({ getContext: () => context }) },
    window: { devicePixelRatio: 1 }, exteriorAssetKey: () => "", paintTitan() {}, paintSaturn() {} };
  const source = readFileSync(new URL("../dist/ui/mission-backdrop.mjs", import.meta.url), "utf8")
    .replace(/^import .*;\r?\n/gm, "").replace(/export (?=(?:const|function) )/g, "");
  runInNewContext(source + "\nthis.api={internalBackdrops,updateBackdropPicker,backdropInk,drawMissionBackdrop};", scope);
  const draw = () => { operations.length=0; scope.api.drawMissionBackdrop(context, 640, 400); return JSON.stringify(operations); };
  return { ...scope, storage, buttons, elements, draw };
}

test("Interior a/b/c reuses the Thermal grey grid and dark ink, without coupling preferences", () => {
  const h = backdrop();
  assert.deepEqual(Array.from(h.api.internalBackdrops, x => [x.id,x.letter]),
    [["blueprint","a"],["yellow","b"],["light","c"]]);
  h.api.updateBackdropPicker();
  h.buttons[2].click();
  assert.equal(h.buttons[2].attrs["aria-pressed"], "true");
  assert.equal(h.buttons[2].hidden, false);
  assert.equal(h.elements.get("backdrop-name").textContent, "Light grey grid");
  const internalInk = JSON.stringify(h.api.backdropInk()), grey = h.draw();
  assert.equal(h.storage.get("dragonfly-internal-backdrop"), "light");
  assert.equal(h.storage.has("dragonfly-thermal-backdrop"), false);
  const thermal = backdrop(); thermal.state.missionLayer="thermal";
  assert.equal(JSON.stringify(thermal.api.backdropInk()), internalInk);
  assert.equal(thermal.draw(), grey, "both modes use the exact same grey painter");
  const restored = backdrop(Object.fromEntries(h.storage)); restored.api.updateBackdropPicker();
  assert.equal(restored.buttons[2].attrs["aria-pressed"], "true");
  restored.state.missionLayer="thermal"; restored.buttons[0].click();
  restored.state.missionLayer="internal"; restored.api.updateBackdropPicker();
  assert.equal(restored.buttons[2].attrs["aria-pressed"], "true", "Thermal changes leave Interior c alone");
  for (const id of ["blueprint","yellow","invalid"]) {
    const old = backdrop({ "dragonfly-internal-backdrop": id }); old.api.updateBackdropPicker();
    assert.equal(old.buttons[id === "yellow" ? 1 : 0].attrs["aria-pressed"], "true");
  }
});

test("Layer selector precedes the canvas, all existing controls survive, and Pilot hides only the new toolbar", () => {
  const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
  const before = readFileSync(new URL("../archive/inspection-controls-2026-10-25/index.html", import.meta.url), "utf8");
  const ids = text => [...text.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]).sort();
  const additions = ["draco-inventory", "draco-inventory-body"];
  assert.deepEqual(ids(html), [...ids(before), ...additions].sort(),
    "all previous IDs survive exactly once, plus the two explicit DrACO inventory IDs");
  assert.equal((html.match(/aria-label="Vehicle layer"/g) ?? []).length, 1);
  assert.ok(html.indexOf('id="layer-title"') < html.indexOf('id="flight-canvas"'));
  assert.ok(html.indexOf('id="vehicle-inspector"') > html.indexOf('id="flight-canvas"'));
  const css = readFileSync(new URL("../dist/styles.css", import.meta.url), "utf8");
  assert.match(css, /body\.pilot-view \.vehicle-layer-toolbar\s*\{\s*display: none;/);
  const ui = readFileSync(new URL("../dist/ui/vehicle-inspector.mjs", import.meta.url), "utf8");
  assert.match(ui, /addEventListener\("wheel", event => \{[\s\S]*?wheelZoomInspector[\s\S]*?event\.preventDefault\(\);[\s\S]*?passive: false/);
});
