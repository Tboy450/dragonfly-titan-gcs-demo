import * as THREE from "../../dist/vendor/three/three.module.min.js?v=dev";
import { mainHarnessAsset } from "../../dist/main-harness.mjs";
import { buildIem } from "../../dist/iem.mjs";
import { buildPowerUnits } from "../../dist/power-units.mjs";
import { buildBattery } from "../../dist/battery.mjs";
import { buildRotorDriveElectronics } from "../../dist/rotor-drive-electronics.mjs";
import { buildSideCameras } from "../../dist/side-cameras.mjs";
import { buildTwta } from "../../dist/twta.mjs";
import { buildHgaGimbal } from "../../dist/hga-gimbal.mjs";

// This measures the existing illustration, not electrical continuity or flight topology.
const specifications = [
  ["iem", buildIem, "iem-assembly", "iem-harness-cable"],
  ["power-unit-1", buildPowerUnits, "psu-1", "psu-harness-cable"],
  ["power-unit-2", buildPowerUnits, "psu-2", "psu-harness-cable"],
  ["battery", buildBattery, "battery-assembly", "battery-cable"],
  ["rde-1", buildRotorDriveElectronics, "rde-1", "rde-1-approx-lead"],
  ["rde-2", buildRotorDriveElectronics, "rde-2", "rde-2-approx-lead"],
  ["starboard-down-camera", buildSideCameras, "starboard-down-camera", "camera-harness"],
  ["port-down-camera", buildSideCameras, "port-down-camera", "camera-harness"],
  ["microscopic-camera", buildSideCameras, "microscopic-camera", "camera-harness"],
  ["led-array", buildSideCameras, "led-array", "camera-harness"],
  ["twta-power-supply", buildTwta, "twta-assembly", "twta-epc-bus-harness"],
  ["antenna-gimbal-drive", buildHgaGimbal, "hga-gimbal-assembly", "hga-drive-harness"],
];
const unresolved = {
  radio: "Branch approaches radio; no assigned power/data mating port or cable lead established.",
  "navigation-feb-imu": "Branch approaches support area; separate FEB/MIMU mating interfaces and routes remain unmodeled.",
  "navigation-meb": "Branch approaches MEB; no modeled mating electrical interface identified.",
  "circulation-fans": "Branch approaches fan flange, not a modeled electrical connector; fan split/controller leads absent.",
};
const round = value => Math.round(value * 1e6) / 1e6;
const xyz = vector => vector.toArray().map(round);
const curveFor = run => new THREE.CatmullRomCurve3(run.points.map(p => new THREE.Vector3(...p)), false, "centripetal", 0.5);
const mesh = (geometry, material, position, parent) => {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
};
function targetStubs() {
  const built = new Map(), targets = new Map();
  for (const [id, builder, groupName, meshName] of specifications) {
    if (!built.has(builder)) {
      const root = new THREE.Group(); builder({ parent: root, mesh }); root.updateMatrixWorld(true); built.set(builder, root);
    }
    const group = built.get(builder).getObjectByName(groupName);
    if (!group) throw new Error(`Missing audit group ${id}: ${groupName}`);
    const stubs = [];
    group.traverse(object => {
      const path = object.geometry?.parameters?.path;
      if (object.name !== meshName || !path) return;
      stubs.push({
        id: `${groupName}/${meshName}/${stubs.length + 1}`,
        point: path.getPoint(1).applyMatrix4(object.matrixWorld),
        radiusM: object.geometry.parameters.radius,
      });
    });
    if (!stubs.length) throw new Error(`Missing audit stubs for ${id}`);
    targets.set(id, stubs);
  }
  for (const root of built.values()) root.traverse(object => {
    object.geometry?.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) material?.dispose();
  });
  return targets;
}

export function buildEndpointAudit(asset = mainHarnessAsset) {
  const runs = [{ name: "trunk", ...asset.trunk }, ...asset.branches, ...asset.crossBundles];
  const curves = new Map(runs.map(run => [run.name, curveFor(run)]));
  // Sampled nearest centerline distances are inventory aids, not exact collision certificates.
  const samples = new Map(runs.map(run => [run.name, curves.get(run.name).getSpacedPoints(1200)]));
  function networkAttachment(point, excluded) {
    let best = { centerlineGapM: Infinity };
    for (const run of runs) if (run.name !== excluded) {
      const list = samples.get(run.name);
      for (let i = 0; i < list.length; i++) {
        const gap = point.distanceTo(list[i]);
        if (gap < best.centerlineGapM) best = { run: run.name, fraction: round(i / (list.length - 1)), centerlineGapM: gap, radiusM: run.radiusM };
      }
    }
    return { ...best, centerlineGapM: round(best.centerlineGapM) };
  }
  const targets = targetStubs();
  const rows = [...asset.branches, ...asset.crossBundles].map(run => {
    const start = new THREE.Vector3(...run.points[0]), end = new THREE.Vector3(...run.points.at(-1));
    const row = {
      id: `bay/${run.name}`, sourceModule: "dist/main-harness.mjs", owner: run.name,
      medium: "unassigned illustrative electrical bundle", confidence: "EST", flightTopologyConfirmed: false,
      radiusM: run.radiusM, lengthM: round(curves.get(run.name).getLength()),
      start: xyz(start), end: xyz(end), startAttachment: networkAttachment(start, run.name),
      supports: "Existing generic floor clamps/lacing; wall support and strain-relief verification open.",
    };
    if (targets.has(run.name)) {
      const stubs = targets.get(run.name).map(stub => ({
        id: stub.id, end: xyz(stub.point), radiusM: stub.radiusM,
        centerlineGapM: round(end.distanceTo(stub.point)),
        surfaceGapM: round(Math.max(0, end.distanceTo(stub.point) - run.radiusM - stub.radiusM)),
      })).sort((a, b) => a.centerlineGapM - b.centerlineGapM);
      row.targetStubs = stubs;
      row.status = stubs[0].surfaceGapM <= 0.001 ? "geometric-contact-only" : "visible-gap";
      row.missingSegment = row.status === "visible-gap" ? "Between branch end and component cable end; no automatic connector inferred." : "Electrical identity, circuit continuity and actual mating hardware remain unverified.";
    } else if (unresolved[run.name]) {
      row.status = "mating-interface-unresolved"; row.missingSegment = unresolved[run.name];
    } else {
      row.status = "network-link-only"; row.endAttachment = networkAttachment(end, run.name);
      row.missingSegment = "Appearance-only network link; not an identified device-to-device circuit.";
    }
    return row;
  });
  const missing = [];
  for (const [id, stubs] of targets) if (!asset.branches.some(run => run.name === id)) missing.push({
    id: `bay/${id}`, owner: id, status: "missing-branch", confidence: "EST", flightTopologyConfirmed: false,
    targetStubs: stubs.map(stub => ({ id: stub.id, end: xyz(stub.point), radiusM: stub.radiusM })),
    missingSegment: "Component cable exists, but no main-harness branch reaches it.",
  });
  return {
    revision: asset.revision, coordinateFrame: "construction metres: +x starboard, +y up, +z aft",
    measurement: "World-space tube endpoints and sampled peer centerlines. <=1 mm surface gap means geometric contact only, never verified electrical mating.",
    references: ["research/main-harness-2026-10-21/README.md", "research/sources/dragoncam-2026/README.md"],
    routes: rows, missing,
    decorativeStrands: asset.strands.map(strand => ({ id: strand.name, status: "unassigned-parallel-strand", radiusM: strand.radiusM })),
    outsideThisRegister: ["Attic instrument/DPU network", "Front navigation cameras and separate IMU leads", "RDE-to-arm/motor routes", "RF/HGA moving continuity", "Sensor controller destinations", "Actuator leads, bonds and feedthrough supports"],
  };
}

export function endpointMarkdown(report) {
  const lines = ["# Modeled Bay Harness Endpoint Register", "", "Codex (OpenAI), October 23, 2026.", "",
    `Asset: \`${report.revision}\`. ${report.measurement}`, "", report.coordinateFrame, "",
    "All routes are estimates. Distances concern this model only, not flight wiring.", "",
    "| Stable route | Status | Closest explicit stub gap, center / surface (mm) | Missing or unverified |",
    "|---|---|---|---|",
    ...report.routes.map(row => {
      const target = row.targetStubs?.[0];
      return `| ${row.id} | ${row.status} | ${target ? `${(target.centerlineGapM * 1000).toFixed(2)} / ${(target.surfaceGapM * 1000).toFixed(2)}` : "No assigned device stub"} | ${row.missingSegment} |`;
    }), "", "## Missing Branches", "",
    ...report.missing.map(row => `- ${row.id}: ${row.missingSegment} Target ${JSON.stringify(row.targetStubs[0].end)} m.`),
    ...(report.missing.length ? [] : ["None among this register's explicit target stubs. This does not mean all harness families are present."]),
    "", "Full coordinates, individual candidate stubs, approximate lengths and peer attachments: `endpoints.json`.", "",
    "## Still Outside This Initial Register", "", ...report.outsideThisRegister.map(item => `- ${item}`), "",
    "Parallel appearance strands have no assigned circuit endpoints. Network proximity is not a splice.",
    "Floor clamps/lacing exist; wall anchoring, backshells, strain relief and actual bend limits remain open.", ""];
  return lines.join("\n");
}

if (process.argv.includes("--write")) {
  const { writeFile } = await import("node:fs/promises");
  const report = buildEndpointAudit();
  await writeFile(new URL("endpoints.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
  await writeFile(new URL("ENDPOINTS.md", import.meta.url), endpointMarkdown(report));
  console.log(JSON.stringify({ routes: report.routes.length, missing: report.missing.map(row => row.owner),
    statuses: report.routes.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] || 0) + 1 }), {}) }));
}
