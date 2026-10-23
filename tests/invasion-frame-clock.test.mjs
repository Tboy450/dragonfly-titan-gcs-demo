// Frame clock (PERF-11): battle time keeps up with slow frames, stalls are dropped, nothing repeats.
import test from "node:test";
import assert from "node:assert/strict";
import { frameSteps, trackLag, maxStepS, maxFrameS } from "../dist/invasion/frame-clock.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { createBattle, stepBattle, requestDrop } from "../dist/invasion/battle.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);

test("Frames turn into battle steps of at most 0.05 s, up to a quarter second per frame", () => {
  const at60 = frameSteps(1 / 60);
  assert.equal(at60.count, 1); close(at60.step, 1 / 60);
  const at10 = frameSteps(0.1);
  assert.equal(at10.count, 2); close(at10.step, 0.05);
  const at4 = frameSteps(0.25);
  assert.equal(at4.count, 5); close(at4.dropped, 0);
  const stall = frameSteps(5);
  close(stall.real, maxFrameS); close(stall.dropped, 5 - maxFrameS); assert.equal(stall.count, 5);
  const fast = frameSteps(0.1, 3);
  assert.equal(fast.count, 6); close(fast.step * fast.count, 0.3);
  for (const bad of [NaN, -1, undefined, Infinity]) assert.equal(frameSteps(bad).count, 0);
  assert.equal(frameSteps(0.1, 0).count, 0);
  for (const elapsed of [0.001, 0.017, 0.033, 0.07, 0.12, 0.2, 0.25, 0.9]) for (const speed of [1, 2, 3]) {
    const { count, step } = frameSteps(elapsed, speed);
    assert.ok(step <= maxStepS + 1e-12, `${elapsed} ${speed}`);
    close(count * step, Math.min(elapsed, maxFrameS) * speed);
  }
});

// Twenty seconds of real time at a given frame rate: every pod releases its drones exactly once.
function playAt(fps) {
  const b = createBattle(planetById("kepra"), { matter: 500, unlocks: ["scout"] });
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 5 } });
  for (let t = 0; t < 20 - 1e-9; t += 1 / fps) {
    const { count, step } = frameSteps(1 / fps);
    for (let i = 0; i < count; i += 1) stepBattle(b, step);
  }
  return { time: b.time, drones: b.units.filter(u => u.side === "swarm" && !u.structure).length, pods: b.pods.length, released: b.pods.filter(p => p.released).length };
}

test("Twenty seconds at 144, 60, 10 and 4 frames a second are twenty seconds of battle, each pod releasing once", () => {
  const runs = [144, 60, 10, 4].map(playAt);
  for (const run of runs) close(run.time, 20, 1e-6);
  assert.ok(runs.every(r => r.drones === 5 && r.released === r.pods && r.pods === runs[0].pods), JSON.stringify(runs));
});

test("Only sustained slowness counts as lag, not a single hitch", () => {
  let lag = { seconds: 0, lagging: false };
  lag = trackLag(lag, 2); // a loading hitch or a hidden tab
  assert.equal(lag.lagging, false);
  for (let i = 0; i < 60; i += 1) lag = trackLag(lag, 1 / 60);
  for (let i = 0; i < 8; i += 1) lag = trackLag(lag, 0.4);
  assert.equal(lag.lagging, true);
  for (let i = 0; i < 400; i += 1) lag = trackLag(lag, 1 / 60);
  assert.equal(lag.lagging, false);
});

// The real entry point with a do-nothing drawing context (the harness canvases cannot draw).
function arena() {
  const h = harness(null, { renderer: true });
  const any = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : any), apply: () => any, set: () => true });
  for (const node of h.nodes.values()) node.getContext = () => any;
  Object.assign(h.context, { swarmColor: "#5fe3ff", nativeColor: "#ff8a4a" }); // from scene.mjs, which the harness leaves out
  h.start();
  h.run(`startMission(planetById('kepra')); closeDropPanel(); scene.frame = () => {}; scene.heightAt = () => 0;
    globalThis.clockNow = 1000; tick(clockNow);`);
  h.frames = (n, ms) => h.run(`for (let i = 0; i < ${n}; i++) tick(clockNow += ${ms});`);
  return h;
}

test("The page keeps battle time at 10 frames a second, drops a stall, and never steps while paused", () => {
  const h = arena();
  h.run("mission.paused = false;");
  const t0 = h.json("mission.battle.time");
  h.frames(20, 100);
  close(h.json("mission.battle.time") - t0, 2, 1e-6);
  const t1 = h.json("mission.battle.time");
  h.frames(1, 5000);
  close(h.json("mission.battle.time") - t1, maxFrameS, 1e-6);
  h.run("mission.paused = true;");
  const t2 = h.json("mission.battle.time");
  h.frames(10, 100);
  assert.equal(h.json("mission.battle.time"), t2);
});

test("A device that stays too slow is told once that the battle is in slow motion", () => {
  const h = arena();
  h.run("mission.paused = false;");
  h.frames(12, 400);
  const notes = () => h.nodes.get("toasts").children.filter(n => /slow motion/.test(n.textContent)).length;
  assert.equal(notes(), 1);
  h.frames(20, 400);
  assert.equal(notes(), 1);
});
