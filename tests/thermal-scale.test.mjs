import test from "node:test";
import assert from "node:assert/strict";
import { thermalRgb, thermalCss, thermalGradientCss, thermalRanges } from "../dist/thermal-scale.mjs";

test("Temperature colors are anchored to cold, reference-band and hot values", () => {
  assert.deepEqual(thermalRgb(-180), [43, 26, 110]);
  assert.deepEqual(thermalRgb(-30), [31, 95, 214]);
  for (const c of [0, 5, 10, 15, 20]) assert.deepEqual(thermalRgb(c), [95, 211, 90], `${c} C is in the green reference band`);
  for (const c of [35, 40, 100]) assert.deepEqual(thermalRgb(c), [217, 52, 43], `${c} C stays red`);
  assert.deepEqual(thermalRgb(-200), thermalRgb(-180));
  assert.deepEqual(thermalRgb(30), [242, 227, 58]);
  assert.equal(thermalCss(10), "rgb(95, 211, 90)");
});

test("Interpolated readings stay bounded and continuous between temperature anchors", () => {
  for (let c = -180; c <= 40; c += 0.25) {
    const rgb = thermalRgb(c), next = thermalRgb(c + 0.25);
    for (let i = 0; i < 3; i++) {
      assert.ok(Number.isInteger(rgb[i]) && rgb[i] >= 0 && rgb[i] <= 255);
      assert.ok(Math.abs(next[i] - rgb[i]) <= 9, `no discontinuity at ${c} C`);
    }
  }
});

test("Both legend windows position the same absolute colors at the correct temperatures", () => {
  for (const range of Object.values(thermalRanges)) {
    const gradient = thermalGradientCss(range);
    const entries = [...gradient.matchAll(/rgb\((\d+), (\d+), (\d+)\) ([\d.]+)%/g)];
    assert.equal(Number(entries[0][4]), 0);
    assert.equal(Number(entries.at(-1)[4]), 100);
    for (const entry of entries) {
      const percent = Number(entry[4]);
      const c = range.min + (range.max - range.min) * percent / 100;
      assert.deepEqual(entry.slice(1, 4).map(Number), thermalRgb(c), `${range.label}: ${c} C`);
    }
    for (const c of [0, 20, 35]) {
      const percent = (c - range.min) / (range.max - range.min) * 100;
      assert.ok(gradient.includes(`${thermalCss(c)} ${percent}%`), `${range.label}: fixed ${c} C anchor`);
    }
  }
  assert.notEqual(thermalGradientCss(thermalRanges.full), thermalGradientCss(thermalRanges.inside), "zoom moves the anchors along the bar, not along the temperature palette");
});
