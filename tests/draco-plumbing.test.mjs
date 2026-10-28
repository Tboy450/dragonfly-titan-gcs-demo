import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildSampleLines, buildBlowers, dracoPlumbingAsset } from "../dist/draco-plumbing.mjs";
import { buildDrill, drillAsset } from "../dist/drills.mjs";
import { buildSampleCarousel, carouselAsset } from "../dist/sample-carousel.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import {triangles} from '../research/drill-moving-leads-2026-10-27/audit.mjs';

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
const find = (group, name) => { let hit = null; group.traverse(o => { if (!hit && o.name === name) hit = o; }); return hit; };
const boxes = group => { const out = []; group.updateMatrixWorld(true); group.traverse(o => { if (o.isMesh) out.push([o.name, new THREE.Box3().setFromObject(o)]); }); return out; };
function build() {
  const parent = new THREE.Group();
  const lines = buildSampleLines({ parent, mesh });
  const blowers = buildBlowers({ parent, mesh });
  parent.updateMatrixWorld(true);
  return { parent, lines, blowers };
}

test("The cross-strapped layout of LPSC 2022 fig. 1: two intakes, one carousel diverter, a return line, two blowers", () => {
  const { lines, blowers } = build();
  for (const name of ["draco-intake-tube-port", "draco-intake-tube-starboard", "draco-flexible-hose-port", "draco-flexible-hose-starboard",
    "draco-flow-diverter-manifold", "draco-return-tube"]) assert.ok(find(lines.lines, name), name);
  for (const name of ["draco-forward-blower-volute", "draco-aft-blower-volute", "draco-forward-blower-exhaust", "draco-aft-blower-exhaust",
    "draco-blower-flow-diverter"]) assert.ok(find(blowers.group, name), name);
  assert.deepEqual([lines.tubes, lines.hoses, lines.diverters, lines.clamps].map(g => g.userData.inspectionLayer),
    ["plumbing", "plumbing", "interfaces", "mounts"]);
  assert.deepEqual([blowers.casings, blowers.ports, blowers.mounts].map(g => g.userData.inspectionLayer),
    ["equipment-casings", "interfaces", "mounts"]);
  assert.equal(lines.paths.length, 2, "a particle path from each drill");
});

test("Each hose meets its drill's port, stowed and at full stroke", () => {
  const { lines } = build();
  for (const [i, side] of [-1, 1].entries()) {
    const holder = new THREE.Group();
    const drill = buildDrill({ parent: holder, mesh, side });
    for (const feed of [0, 0.13]) {
      drill.carriage.position.y = drillAsset.stowedY - feed;
      holder.updateMatrixWorld(true);
      lines.hoseParts[i].setFeed(feed);
      const hose = lines.hoseParts[i].mesh.geometry.parameters.path;
      const end = hose.getPoint(1);
      const [inboard, up] = drillAsset.portLocal;
      const port = new THREE.Vector3(side * (drillAsset.lateralM - inboard), drillAsset.stowedY - feed + up, drillAsset.foreAftM);
      assert.ok(end.distanceTo(port) < 1e-6, `hose ${i} at feed ${feed}`);
      const fitting = new THREE.Vector3();
      find(drill.port, "drill-port-fitting").getWorldPosition(fitting);
      assert.ok(fitting.distanceTo(port) < 0.03, "attach point is at the pneumatic port");
    }
  }
});

test("Lines reach the carousel inlet and the blowers; blowers sit behind the port forward arm and exhaust outward", () => {
  const { lines, blowers } = build();
  const inlet = new THREE.Vector3(...carouselAsset.inlet).add(new THREE.Vector3(...carouselAsset.position));
  const manifold = new THREE.Box3().setFromObject(find(lines.diverters, "draco-flow-diverter-manifold"));
  assert.ok(Math.abs(manifold.min.y - (inlet.y + 0.004)) < 0.01 && manifold.containsPoint(new THREE.Vector3(inlet.x, manifold.min.y + 0.001, inlet.z)),
    "the manifold sits on the carousel's sample inlet");
  const retEnd = new THREE.Vector3(...lines.returnRoute.at(-1));
  const diverter = new THREE.Box3().setFromObject(find(blowers.ports, "draco-blower-flow-diverter")).expandByScalar(0.002);
  assert.ok(diverter.containsPoint(retEnd), "the return line ends at the blower diverter");
  for (const [x, , z] of dracoPlumbingAsset.blowerCenters) {
    assert.ok(x < -0.43, "outside the port side of the body (exposed to Titan)");
    assert.ok(z > -0.75 && z < 0, "estimated pair fits behind the forward arm within the fore bay");
  }
  const exhaust = find(blowers.plumbing, "draco-forward-blower-exhaust");
  const dir = exhaust.geometry.parameters.path.getPoint(1).sub(exhaust.geometry.parameters.path.getPoint(0));
  assert.ok(dir.x < 0 && dir.y < 0, "exhaust points outboard and down");
});

test("Lines and blowers clear every rebuilt part", () => {
  const { parent } = build();
  const mine = boxes(parent);
  const others = [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio, buildIem, buildPowerUnits, buildSideCameras, buildNoseCameras].map(b => {
    const g = new THREE.Group(); b({ parent: g, mesh }); return [b.name, boxes(g), g];
  });
  const drills = new THREE.Group();
  for (const side of [-1, 1]) buildDrill({ parent: drills, mesh, side });
  others.push(["buildDrill", boxes(drills), drills]);
  // The manifold stub seats on the carousel inlet by design.
  const seated = new Set(["draco-manifold-inlet-stub"]);
  for (const [name, other] of others) {
    for (const [mn, mb] of mine) {
      if (seated.has(mn) && name === "buildSampleCarousel") continue;
      // Tube bounding boxes are coarse; check them against other parts with a margin in the test of record below.
      if (find(parent,mn)?.geometry?.parameters?.path) continue;
      assert.ok(!other.some(([, b]) => b.intersectsBox(mb)), `${mn} clears ${name}`);
    }
  }
  // Tubes: sample along each curve and check the points stay outside every rebuilt mesh box.
  const tubeMeshes = []; parent.traverse(o => { if (o.isMesh && o.geometry.parameters?.path) tubeMeshes.push(o); });
  for (const t of tubeMeshes) {
    const path = t.geometry.parameters.path, r = t.geometry.parameters.radius;
    for (let i = 0; i <= 200; i += 1) {
      const p = path.getPoint(i / 200).applyMatrix4(t.matrixWorld);
      for (const [name, other, group] of others) {
        const hit = other.find(([, b]) => b.clone().expandByScalar(r * 0.9).containsPoint(p));
        // A moving cable's large U-shaped AABB contains empty space. New blower
        // runs are also checked against the full model at all stroke positions;
        // disambiguate this broad-phase hit using actual transformed surfaces.
        if(hit && /^draco-(forward|aft)-blower/.test(t.name)){
          const nearest=new THREE.Vector3();let actual=false;
          group.traverse(o=>{if(!o.isMesh||actual)return;
            const box=new THREE.Box3().setFromObject(o).expandByScalar(r*.9);
            if(box.containsPoint(p))actual=triangles(o).some(tri=>tri.getArea()>1e-14&&tri.closestPointToPoint(p,nearest).distanceTo(p)<r*.9);
          });
          if(!actual)continue;
        }
        // Allowed contacts: each hose's end on its drill's port fitting (the connection itself).
        const atPort = t.name.startsWith("draco-flexible-hose") && hit && p.distanceTo(path.getPoint(1)) < 0.03 && /drill-port-fitting|drill-swivel/.test(hit[0]);
        if (hit && !atPort && !(name === "buildSampleCarousel" && t.name === "draco-return-tube" && i < 3)) {
          assert.fail(`${t.name} passes through ${name} (${hit[0]}) at ${p.toArray().map(n => n.toFixed(3))}`);
        }
      }
    }
  }
});
