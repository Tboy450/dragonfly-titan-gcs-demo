import * as THREE from "./vendor/three/three.module.min.js?v=dev";

// [EST] Local installation examples after NASA/Mike Guinto's SVS15003 underside photo.
// SciTech2024 p3-4 establishes warm actuators below the baseplate, not their part numbers.
export const carouselDriveAsset = Object.freeze({
  revision: "carousel-drives-2026-10-24",
  centers: Object.freeze([[-.103, -.086], [.103, -.086], [0, .104]].map(Object.freeze)),
  casingRadiusM: .022, casingHeightM: .096, cableRadiusM: .0013,
  leadPoints: Object.freeze([[0, -.123, .033], [0, -.146, .046], [0, -.133, .056],
    [0, -.065, .056], [0, -.027, .052], [0, -.019, .052]].map(Object.freeze)),
  clipFraction: .91,
  confidence: "EST: photo-inspired exterior and local wiring; scale, drive identity and flight routing unconfirmed",
});

export function buildCarouselWarmDrives({ parent, mesh }) {
  const drives = new THREE.Group(); drives.name = "carousel-warm-drives";
  Object.assign(drives.userData, { subsystem: "sample-carousel", thermalZone: "equipment-bay",
    assetRevision: carouselDriveAsset.revision, flightConfigurationConfirmed: false });
  parent.add(drives);
  const silver = new THREE.MeshStandardMaterial({ color: 0xbcc5cb, metalness: .72, roughness: .31 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x25292c, metalness: .3, roughness: .46 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xa97a25, metalness: .6, roughness: .42 });
  const jacket = new THREE.MeshStandardMaterial({ color: 0x8d602e, metalness: .28, roughness: .52 });
  const white = new THREE.MeshStandardMaterial({ color: 0xe7e4d7, roughness: .7 });
  const layer = (name, category, owner) => {
    const g = new THREE.Group(); g.name = name; g.userData.inspectionLayer = category; owner.add(g); return g;
  };
  const cylinder = (name, r, h, y, mat, owner, z = 0) => {
    const o = mesh(new THREE.CylinderGeometry(r, r, h, 32), mat, [0, y, z], owner); o.name = name; return o;
  };
  const units = carouselDriveAsset.centers.map(([x, z], i) => {
    const id = `carousel-drive-${i + 1}`, unit = new THREE.Group(); unit.name = id;
    unit.position.set(x, 0, z); unit.rotation.y = Math.atan2(x, z);
    Object.assign(unit.userData, { inspectionLabel: `Warm drive ${i + 1} (installation estimate)`,
      inspectionMinimumRadiusM: .09, labelAnchor: new THREE.Vector3(0, -.08, 0),
      unmodeledInternals: true, flightConfigurationConfirmed: false });
    drives.add(unit);
    const casing = layer(`${id}-casings`, "equipment-casings", unit);
    const covers = layer(`${id}-covers`, "equipment-covers", unit);
    const mounts = layer(`${id}-mounts`, "mounts", unit);
    const interfaces = layer(`${id}-interfaces`, "interfaces", unit);
    const harness = layer(`${id}-harnesses`, "harnesses", unit);
    // Keep the prior nominal shaft/can envelope. No gearing, bearings or windings invented.
    cylinder(`${id}-upper-collar`, .025, .042, -.03, dark, casing);
    cylinder(`${id}-can`, .022, .096, -.092, silver, casing);
    cylinder(`${id}-wrapped-neck`, .023, .012, -.057, gold, casing);
    cylinder(`${id}-bottom-cap`, .023, .010, -.14, dark, covers);
    for (const y of [-.071, -.081, -.091, -.101, -.111]) {
      cylinder(`${id}-can-band`, .0225, .0012, y, silver, casing);
    }
    cylinder(`${id}-mount-flange`, .027, .003, -.008, silver, mounts);
    for (let n = 0; n < 4; n++) {
      const a = n * Math.PI / 2 + Math.PI / 4;
      const bolt = cylinder(`${id}-mount-fastener`, .0018, .002, -.0105, dark, mounts);
      bolt.position.x = Math.cos(a) * .024; bolt.position.z = Math.sin(a) * .024;
    }
    // Generic side exit, not an identified flight connector or pin assignment.
    const socket = cylinder(`${id}-socket-example`, .0045, .014, -.123, dark, interfaces, .026);
    socket.rotation.x = Math.PI / 2;
    const path = new THREE.CatmullRomCurve3(carouselDriveAsset.leadPoints.map(p => new THREE.Vector3(...p)));
    const cable = mesh(new THREE.TubeGeometry(path, 48, carouselDriveAsset.cableRadiusM, 8, false), jacket, [0, 0, 0], harness);
    cable.name = `${id}-local-lead`;
    Object.assign(cable.userData, { connectionId: `${id}-local-lead`, connectionMedium: "electrical-example",
      mediumConfidence: "EST", flightMatingConfirmed: false, remoteEndUnmodeled: true });
    for (const fraction of [.27, .57]) {
      const tie = mesh(new THREE.TorusGeometry(.0017, .00035, 5, 16), white,
        path.getPointAt(fraction).toArray(), harness);
      tie.name = `${id}-lacing-example`;
      tie.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), path.getTangentAt(fraction));
    }
    const p = path.getPointAt(carouselDriveAsset.clipFraction);
    const support = mesh(new THREE.BoxGeometry(.004, -.0065 - p.y, .003), silver,
      [.0035, (p.y - .0065) / 2, p.z], mounts); support.name = `${id}-support-foot`;
    const clip = mesh(new THREE.TorusGeometry(.0019, .0006, 6, 16), white, p.toArray(), mounts);
    clip.name = `${id}-clip-example`;
    clip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), path.getTangentAt(carouselDriveAsset.clipFraction));
    return { unit, casing, covers, mounts, interfaces, harness, cable };
  });
  cylinder("carousel-central-drive-housing", .037, .055, -.038, dark, drives);
  return { drives, units };
}
