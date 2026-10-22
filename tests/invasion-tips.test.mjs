import test from "node:test";
import assert from "node:assert/strict";
import { newTips, defenseTips } from "../dist/invasion/tips.mjs";
import { defenderTypes } from "../dist/invasion/units.mjs";

const drone = (x, z) => ({ alive: true, side: "swarm", structure: false, type: "scout", x, z });
const native = (type, x, z, extra = {}) => ({ alive: true, side: "native", structure: !!defenderTypes[type].structure, type, x, z, ...extra });

test("Defenders in sight bring the general tip, then one tip per new kind of defense, once each", () => {
  const seen = new Set();
  const b = { units: [drone(0, 0), native("flak", 100, 0), native("jammer", 900, 0)] };
  assert.deepEqual(newTips(seen, b, []).map(t => t.id), ["defenders", "defense:flak"], "the jammer is out of sight");
  assert.deepEqual(newTips(seen, b, []), [], "never twice");
  b.units.push(drone(880, 0));
  assert.deepEqual(newTips(seen, b, []).map(t => t.id), ["defense:jammer"]);
  assert.ok(Object.keys(defenseTips).every(type => defenderTypes[type]), "tips only for real defenses");
});

test("Alarm stages, the first artillery and the first captured defense each get a tip", () => {
  const seen = new Set(), b = { units: [] };
  const tips = newTips(seen, b, [{ kind: "alarm", stage: 1 }, { kind: "artillery" }, { kind: "alarm", stage: 2 }]);
  assert.deepEqual(tips.map(t => t.id), ["alarm:1", "artillery", "alarm:2"]);
  b.units.push({ alive: true, side: "swarm", structure: true, converted: true, type: "flak", x: 0, z: 0 });
  assert.deepEqual(newTips(seen, b, [{ kind: "alarm", stage: 1 }]).map(t => t.id), ["converted"]);
});
