import test from "node:test";
import assert from "node:assert/strict";
import { downwashAtGround, hoverWashMps, washReachM } from "../dist/downwash.mjs";

const at = (patch) => ({ rotorRpm: Array(8).fill(780), altitude: 1, verticalSpeed: 0, speed: 0, ...patch });

test("Hover wash follows from the published mass, gravity, air density and rotor size", () => {
  assert.ok(hoverWashMps > 4.2 && hoverWashMps < 4.6, `${hoverWashMps.toFixed(2)} m/s`);
});

test("Rotor wash raises dust only near the ground and with the rotors working", () => {
  assert.equal(downwashAtGround(at({ rotorRpm: Array(8).fill(0), altitude: 0 })).strength, 0, "rotors stopped");
  assert.equal(downwashAtGround(at({ altitude: washReachM + 1 })).strength, 0, "too high");
  const hover = downwashAtGround(at({})).strength;
  assert.ok(hover > 0.8, `hover near the ground ${hover.toFixed(2)}`);
  const spinUp = downwashAtGround(at({ rotorRpm: Array(8).fill(620), altitude: 0 })).strength;
  assert.ok(spinUp > 0.3 && spinUp < hover, "more throttle, more dust");
  assert.ok(downwashAtGround(at({ altitude: 4 })).strength < hover, "fades with height");
  assert.ok(downwashAtGround(at({ altitude: 4, verticalSpeed: 2.5 })).strength > downwashAtGround(at({ altitude: 4 })).strength, "climbing hard adds wash");
  assert.ok(downwashAtGround(at({ speed: 10 })).strength < hover, "forward flight sweeps it behind");
});

test("Dune sand gives more dust than damp ground, the outcrop or the puddle", () => {
  const dune = downwashAtGround(at({ altitude: 3 }), "dune").strength;
  const sand = downwashAtGround(at({ altitude: 3 }), "sand").strength;
  const damp = downwashAtGround(at({ altitude: 3 }), "damp").strength;
  assert.ok(dune > sand && sand > damp && damp > 0);
  assert.equal(downwashAtGround(at({}), "liquid").strength, 0);
});
