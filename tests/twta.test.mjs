import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildTwta, twtaAsset } from "../dist/twta.mjs";
import { buildHgaGimbal, hgaAsset } from "../dist/hga-gimbal.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildDrill } from "../dist/drills.mjs";
import { buildSampleLines, buildBlowers } from "../dist/draco-plumbing.mjs";
import { buildFans, buildWarmDuct, buildTrimDevice } from "../dist/thermal-loop.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
const find = (group, name) => { let hit = null; group.traverse(o => { if (!hit && o.name === name) hit = o; }); return hit; };
const boxOf = object => new THREE.Box3().setFromObject(object);
// Solid parts as boxes; tubes as points sampled along their path (a tube's box is its whole route).
const boxes = group => {
  const out = []; group.updateMatrixWorld(true);
  group.traverse(o => {
    if (!o.isMesh) return;
    const path = o.geometry.parameters?.path;
    if (path) for (let i = 0; i <= 200; i += 1) out.push([o.name, new THREE.Box3().setFromCenterAndSize(path.getPoint(i / 200).applyMatrix4(o.matrixWorld), new THREE.Vector3(1, 1, 1).multiplyScalar(2 * o.geometry.parameters.radius)), i / 200]);
    else out.push([o.name, new THREE.Box3().setFromObject(o), null]);
  });
  return out;
};
function build() {
  const parent = new THREE.Group();
  const twta = buildTwta({ parent, mesh });
  parent.updateMatrixWorld(true);
  return { parent, twta };
}

test("One TWTA: a conduction-cooled tube and a separate EPC joined by a high-voltage umbilical", () => {
  const { parent, twta } = build();
  for (const name of ["twta-tube-body", "twta-tube-baseplate", "twta-epc-body", "twta-hv-umbilical", "twta-tube-hv-gland", "twta-epc-hv-gland"]) assert.ok(find(parent, name), name);
  let bodies = 0; parent.traverse(o => { if (o.name === "twta-tube-body") bodies += 1; });
  assert.equal(bodies, 1, "NASA's spacecraft page and ICES-2023 name one TWTA");
  assert.equal(twtaAsset.publishedRfW, 100);
  const tube = boxOf(find(parent, "twta-tube-body")), epc = boxOf(find(parent, "twta-epc-body"));
  const T = twtaAsset.tube, E = twtaAsset.epc;
  assert.ok(Math.abs(tube.max.z - tube.min.z - (T.lengthM - 0.008)) < 1e-6 && Math.abs(tube.max.x - tube.min.x - T.widthM) < 1e-6, "tube size from the asset");
  assert.ok(Math.abs(epc.max.y - epc.min.y - E.heightM) < 1e-6 && Math.abs(epc.max.z - epc.min.z - E.lengthM) < 1e-6, "EPC size from the asset");
  // Sizes stay in the range of the published units they are scaled from.
  assert.ok(T.lengthM < 0.37 && T.widthM < 0.09 && E.lengthM <= 0.21 && E.heightM <= 0.11, "no bigger than the LRO tube and EPC");
  const ends = [twta.umbilical.geometry.parameters.path.getPoint(0), twta.umbilical.geometry.parameters.path.getPoint(1)];
  assert.ok(ends[0].distanceTo(boxOf(find(parent, "twta-epc-hv-gland")).getCenter(new THREE.Vector3())) < 0.01, "umbilical leaves the EPC gland");
  assert.ok(ends[1].distanceTo(boxOf(find(parent, "twta-tube-hv-gland")).getCenter(new THREE.Vector3())) < 0.01, "and enters the tube's gun end");
});

test("Mounted to the underside of the top deck through thermal pads", () => {
  const { parent, twta } = build();
  const all = boxOf(twta.assembly);
  assert.ok(Math.abs(all.max.y - twtaAsset.deckY) < 1e-6, "nothing above the deck underside");
  for (const name of ["twta-tube-thermal-pad", "twta-epc-thermal-pad"]) assert.ok(Math.abs(boxOf(find(parent, name)).max.y - twtaAsset.deckY) < 1e-6, `${name} against the deck`);
  const plate = boxOf(find(parent, "twta-tube-baseplate")), body = boxOf(find(parent, "twta-tube-body"));
  assert.ok(plate.min.y >= body.max.y - 1e-6 && plate.max.x - plate.min.x > body.max.x - body.min.x, "the wider baseplate is above the tube, against the deck");
  const units = new THREE.Box3().setFromObject(find(parent, "twta-tube-body")).union(new THREE.Box3().setFromObject(find(parent, "twta-epc-body")));
  assert.ok(units.min.x > 0 && all.max.x < 0.36, "tube and EPC in the starboard half of the cavity, inside the wall");
});

test("RF: output waveguide runs under the deck to the antenna gimbal's rotary joint; input coax runs down to the radio", () => {
  const { parent, twta } = build();
  const route = twtaAsset.waveguideRoute;
  assert.ok(Math.abs(route[0][2] - (twtaAsset.tube.front - 0.012)) < 1e-9, "starts at the collector-end output flange");
  const joint = hgaAsset.rotaryJoint, end = route.at(-1);
  assert.ok(Math.abs(end[0] - joint[0]) < 1e-9 && Math.abs(end[2] - joint[2]) < 1e-9 && Math.abs(end[1] - (joint[1] - 0.003)) < 1e-9, "ends on the gimbal's rotary-joint flange");
  let runs = 0; parent.traverse(o => { if (o.name === "twta-waveguide-run") { runs += 1; assert.ok(new THREE.Box3().setFromObject(o).max.y < twtaAsset.deckY, "under the deck"); } });
  assert.equal(runs, route.length - 1);
  const path = twta.coax.geometry.parameters.path;
  const input = boxOf(find(parent, "twta-rf-input-plug")).getCenter(new THREE.Vector3());
  assert.ok(path.getPoint(0).distanceTo(input) < 0.01, "coax starts at the tube's input");
  const radio = new THREE.Group(); buildFrontierRadio({ parent: radio, mesh }); radio.updateMatrixWorld(true);
  const j31 = boxOf(find(radio, "frontier-radio-J31"));
  const plug = boxOf(find(parent, "twta-rf-input-coax-plug"));
  assert.ok(plug.intersectsBox(j31.clone().expandByScalar(0.001)), "plug meets the radio's J31 SMA");
});

test("Inspection layers", () => {
  const { twta } = build();
  assert.deepEqual([twta.casings, twta.mounts, twta.ports, twta.cables].map(g => g.userData.inspectionLayer),
    ["equipment-casings", "mounts", "interfaces", "harnesses"]);
});

test("The TWTA clears every rebuilt part (only the coax plug at the radio's J31 and the waveguide at the gimbal's rotary joint touch)", () => {
  const { parent } = build();
  const mine = boxes(parent);
  const builders = [buildFrontierRadio, buildIem, buildPowerUnits, buildSideCameras, buildNoseCameras, buildSampleCarousel, buildDramsAssembly, buildWonderwall, buildFans, buildWarmDuct, buildTrimDevice, buildBlowers, buildSampleLines];
  const others = builders.map(b => { const g = new THREE.Group(); b({ parent: g, mesh }); return [b.name, boxes(g)]; });
  const gimbal = new THREE.Group(); buildHgaGimbal({ parent: gimbal, mesh }); others.push(["buildHgaGimbal", boxes(gimbal)]);
  const d = new THREE.Group(); for (const side of [-1, 1]) buildDrill({ parent: d, mesh, side }); others.push(["buildDrill", boxes(d)]);
  for (const [name, other] of others) {
    for (const [mn, mb, t] of mine) {
      const hits = other.filter(([, b]) => b.intersectsBox(mb));
      const allowed = hits.every(([on]) => (on === "frontier-radio-J31" && (mn === "twta-rf-input-coax-plug" || (mn === "twta-rf-input-coax" && t > 0.97)))
        || (on === "hga-rotary-joint-flange" && /twta-waveguide-(run|mitered-bend|joint-flange)/.test(mn)));
      assert.ok(allowed, `${mn} clears ${name}${hits.length ? ` (${hits.map(h => h[0]).join(", ")})` : ""}`);
    }
  }
});
