import test from "node:test";
import assert from "node:assert/strict";
import { edlEvents, edlStateAt, edlDuration, edlRenderCeiling, formatSinceEntry } from "../dist/edl.mjs";

test("The arrival sequence passes through the published EDL altitudes", () => {
  const at = (title) => edlStateAt(edlEvents.find(e => e.title === title).t);
  assert.equal(Math.round(at("Entry interface").altitudeM), 1270e3);
  assert.equal(Math.round(at("Drogue parachute").altitudeM), 143e3);
  assert.equal(Math.round(at("Main parachute").altitudeM), 4800);
  assert.equal(Math.round(at("Heat shield separation").altitudeM), 4400);
  assert.equal(Math.round(at("Lander pose").altitudeM), 2100);
  assert.equal(Math.round(at("Lidar ground lock").altitudeM), 1800);
  const release = at("Lander separation");
  assert.equal(Math.round(release.altitudeM), 1000);
  assert.equal(release.released, true);
  assert.equal(edlStateAt(39.9).released, false);
  assert.equal(formatSinceEntry(at("Main parachute").sinceEntryS), "E+1 h 54 min");
  assert.equal(formatSinceEntry(at("Lander separation").sinceEntryS), "E+2 h 17 min");
});

test("Altitude only falls, the rendered scene never jumps, and the hardware sequence is ordered", () => {
  let previous = edlStateAt(0), maxStep = 0;
  const chutes = [];
  for (let t = 0.05; t <= edlDuration + 0.001; t += 0.05) {
    const s = edlStateAt(t);
    assert.ok(s.altitudeM <= previous.altitudeM + 1e-6, `altitude rises at t=${t.toFixed(2)}`);
    assert.ok(s.renderAltitudeM <= edlRenderCeiling);
    maxStep = Math.max(maxStep, Math.abs(s.renderAltitudeM - previous.renderAltitudeM));
    if (chutes.at(-1) !== s.chute) chutes.push(s.chute);
    previous = s;
  }
  assert.ok(maxStep < 25, `largest per-frame change ${maxStep.toFixed(1)} m`);
  assert.deepEqual(chutes, ["none", "drogue", "main"]);
  const end = edlStateAt(edlDuration);
  assert.equal(end.altitudeM, 0);
  assert.equal(end.done, true);
  assert.equal(edlStateAt(19.9).heatShield, true);
  assert.equal(edlStateAt(22).heatShield, false);
  assert.ok(edlStateAt(30.5).pose === 1 && edlStateAt(28).pose === 0);
  assert.ok(edlStateAt(31).rotorSpin === 0 && edlStateAt(35).rotorSpin === 1);
});
