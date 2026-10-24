import * as THREE from "../../dist/vendor/three/three.module.min.js?v=dev";
import { buildDramsAssembly, dramsAsset } from "../../dist/drams-assembly.mjs";
import { buildSampleCarousel, carouselAsset } from "../../dist/sample-carousel.mjs";

const xyz = point => point.toArray().map(value => Math.round(value * 1e6) / 1e6);
const mesh = (geometry, material, at, parent) => {
  const object = new THREE.Mesh(geometry, material); object.position.fromArray(at); parent.add(object); return object;
};
export function atticEndpointAudit() {
  const rows = [];
  for (const [owner, builder] of [["drams", buildDramsAssembly], ["sample-carousel", buildSampleCarousel]]) {
    const root = new THREE.Group(); builder({ parent: root, mesh }); root.updateMatrixWorld(true);
    const connectors = [];
    root.traverse(object => {
      if (object.name === "drams-connector") connectors.push({
        id: `drams-connector-${connectors.length + 1}`, center: object.getWorldPosition(new THREE.Vector3()),
      });
    });
    root.traverse(object => {
      if (!object.userData.connectionId) return;
      const path = object.geometry.parameters.path;
      const start = path.getPoint(0).applyMatrix4(object.matrixWorld), end = path.getPoint(1).applyMatrix4(object.matrixWorld);
      let category = null;
      for (let current = object; current && !category; current = current.parent) category = current.userData.inspectionLayer;
      rows.push({
        id: `attic/${object.userData.connectionId}`, owner, medium: object.userData.connectionMedium,
        confidence: object.userData.mediumConfidence, flightMatingConfirmed: false, layer: category,
        source: "NASA/Mike Guinto SVS15003 photo for appearance; SciTech2024 fig2 for zones only. Route/function/scale estimated.",
        start: xyz(start), end: xyz(end), radiusM: object.geometry.parameters.radius,
        modeledLengthM: Math.round(path.getLength() * 1e6) / 1e6,
        unresolved: "Actual flight medium, mating port/circuit, cable or tube construction and installed routing not confirmed.",
        ...(object.userData.remoteEndUnmodeled ? { remoteEndUnmodeled: true,
          unresolved: "Local drive socket/lead example only; remote bus/controller connection and actual flight cable construction remain unmodeled." } : {}),
        ...(object.name === "drams-wire-bundle" ? {
          candidateModelConnectorCenters: connectors.map(connector => ({ id: connector.id, center: xyz(connector.center),
            centerGapM: Math.round(end.distanceTo(connector.center) * 1e6) / 1e6 })),
          note: "Nearest modeled connector is a proximity observation, not flight identification. Both endpoints retained from prior illustration.",
        } : {}),
      });
    });
    root.traverse(object => { object.geometry?.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) material?.dispose(); });
  }
  return {
    revisions: { drams: dramsAsset.revision, carousel: carouselAsset.revision },
    coordinateFrame: "construction metres: +x starboard, +y up, +z aft",
    rows,
    notReconstructed: [
      { id: "attic-main-trunk", reason: "No attic trunk or documented bay-to-attic electrical mating interface in the current model." },
      { id: "drams-external-power-data", reason: "Local enclosure example is not a complete external bus connection." },
      { id: "carousel-three-warm-drives", reason: "Three local estimated socket/lead examples now exist; remote bus/controller mating and actual flight interfaces remain unmodeled." },
      { id: "warm-cold-electrical-feedthrough", reason: "Wonderwall sample neck and existing slot do not establish an electrical feedthrough location or construction." },
    ],
    limits: "Eleven local line examples (October24 update adds three warm-drive leads). Gas/sample labels describe modeled intent, not identification of specific flight tubing; unclassified routes intentionally remain unassigned. Drive leads end at the modeled extent, not a bus connection. No electrical, flow, pressure or heat-leak solver.",
  };
}
export function atticMarkdown(report) {
  return ["# Attic Local-Line Register", "", "Codex (OpenAI), October23-24,2026.", "", report.coordinateFrame, "", report.limits, "",
    "| Stable model route | Owner | Modeled medium | Inspection layer | Flight mating |", "|---|---|---|---|---|",
    ...report.rows.map(row => `| ${row.id} | ${row.owner} | ${row.medium} (EST) | ${row.layer} | Unverified |`), "",
    "## Missing Networks / Interfaces", "", ...report.notReconstructed.map(row => `- **${row.id}:** ${row.reason}`), "",
    "Full world-space endpoints, radii, lengths and all candidate model connector centers: `endpoints.json`.",
    "A nearby connector is not an assigned circuit. The white carousel line remains unclassified; it is not copied into an assumed electrical trunk.", ""].join("\n");
}
if (process.argv.includes("--write")) {
  const { writeFile } = await import("node:fs/promises"); const report = atticEndpointAudit();
  await writeFile(new URL("endpoints.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
  await writeFile(new URL("ENDPOINTS.md", import.meta.url), atticMarkdown(report));
  console.log(JSON.stringify({ routes: report.rows.length, media: report.rows.reduce((counts, row) => ({ ...counts, [row.medium]: (counts[row.medium] || 0) + 1 }), {}), unresolvedNetworks: report.notReconstructed.length }));
}
