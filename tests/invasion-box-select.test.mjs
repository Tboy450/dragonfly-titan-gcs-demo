import test from "node:test";
import assert from "node:assert/strict";
import { boxRect, squadsInBox, holdToBoxMs } from "../dist/invasion/pointer-controls.mjs";

test("A selection box takes any two corners and picks squads with living drones inside", () => {
  assert.deepEqual(boxRect({ x: 50, y: 80 }, { x: 10, y: 20 }), { left: 10, top: 20, right: 50, bottom: 80 });
  const units = [
    { alive: true, side: "swarm", structure: false, squad: 2, x: 10, z: 10 },
    { alive: true, side: "swarm", structure: false, squad: 1, x: 20, z: 20 },
    { alive: false, side: "swarm", structure: false, squad: 3, x: 15, z: 15 },
    { alive: true, side: "native", structure: false, squad: null, x: 15, z: 15 },
    { alive: true, side: "swarm", structure: false, squad: 4, x: 500, z: 500 },
    { alive: true, side: "swarm", structure: false, squad: 5, x: 12, z: 12, hidden: true },
  ];
  const project = (u) => ({ x: u.x, y: u.z, visible: !u.hidden });
  assert.deepEqual(squadsInBox(units, project, boxRect({ x: 0, y: 0 }, { x: 30, y: 30 })), [1, 2]);
  assert.ok(holdToBoxMs > 200 && holdToBoxMs < 1000, "a hold that is deliberate but quick");
});
