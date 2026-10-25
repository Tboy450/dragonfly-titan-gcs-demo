import * as THREE from "./vendor/three/three.module.min.js?v=dev";
import {addCableSupport,addCableLacing} from "./cable-installation.mjs?v=dev";

// Part 12: Integrated Electronics Module (IEM), Dragonfly's core avionics box (command and data
// handling, guidance and navigation, communications). Drawn from NASA/APL's March 2026 photos at
// full resolution (engineering model on the harness; IEM and PSU testing):
// - a black top heat sink whose fins run parallel to the connector face, with rows of fasteners
//   through it, and a copper ground strap bolted at one top corner;
// - a silver face plate fastened all round its edge, with black connector windows in two rows
//   across the cards; every connector mated to a silver-wrapped, white-labeled harness that
//   drops down; a few strips of yellow tape;
// - mounted with its back to a vertical wall panel of the lander structure, beside a PSU.
// No size is published. Scale [EST]: the mated plugs match Micro-D connectors (Glenair
// MIL-DTL-83513 table: 37-way 37.8 mm long, about 8 mm wide), giving a face about 28 cm wide;
// the engineering-model photo shows the face about as tall as it is wide. Window layout,
// connector counts, depth and the wall it is on (port, with the PSU on its left as seen from
// inside, as photographed) are [EST]. Red handling handles are not drawn.
export const iemAsset = Object.freeze({
  revision: "iem-2026-10-25-second-column",
  widthM: 0.28, heightM: 0.28, depthM: 0.22,
  // Back against the port wall (cavity edge about x -0.36), on the bay floor [EST].
  position: Object.freeze([-0.244, -0.284, -0.17]),
  // The connector face (local -z) turns inboard, toward +x [EST].
  yaw: -Math.PI / 2,
  bounds: Object.freeze({ min: [-0.365, -0.285, -0.36], max: [-0.03, 0.02, 0.0] }),
});

// Micro-D (MIL-DTL-83513) overall flange length by contact count, from Glenair's table [PUB].
const microD = { 15: 0.0238, 25: 0.0302, 37: 0.0378, 51: 0.0365 };

export const iemServiceAsset = Object.freeze({
  leadIndices: Object.freeze([0, 1, 2, 3]), radiusM: .0045,
  bowDepthsM: Object.freeze([.035, .048, .012, .024]), supportFractions: Object.freeze([.70, .78, .675, .70]),
  confidence: "EST: local service installation, not an identified flight circuit or qualified bend",
});

export const iemMiddleLeadAsset = Object.freeze({
  connectionId: "iem-local-lead-6", supportFraction: .32, labelFraction: .21,
  lacingFractions: Object.freeze([.42, .64]),
  confidence: "EST: separated local service route; flight circuit and qualified bend unknown",
});

export const iemSecondColumnAsset = Object.freeze({
  leadIndices: Object.freeze([4, 6]), supportFractions: Object.freeze([.22, .17]),
  labelFractions: Object.freeze([.18, .14]),
  lacingFractions: Object.freeze([.32, .57]),
  confidence: "EST: upper/lower local service routes; actual flight mating and bend qualification unknown",
});

export function buildIem({ parent, mesh }) {
  const { widthM: W, heightM: H, depthM: D, position, yaw } = iemAsset;
  const assembly = new THREE.Group();
  assembly.name = "iem-assembly";
  assembly.position.fromArray(position);
  assembly.rotation.y = yaw;
  parent.add(assembly);
  Object.assign(parent.userData, { assetRevision: iemAsset.revision, dimensionConfidence: "EST" });
  const group = (name, inspectionLayer) => {
    const g = new THREE.Group(); g.name = name; g.userData.inspectionLayer = inspectionLayer;
    assembly.add(g); return g;
  };
  const chassis = group("iem-chassis", "equipment-casings");
  const mounts = group("iem-mounts", "mounts");
  const connectors = group("iem-connectors", "interfaces");
  const harness = group("iem-harness", "harnesses");
  connectors.userData.inspectionLabel = "Connector face (layout estimate)";
  const servicePair = new THREE.Group(); servicePair.name = "iem-upper-service-pair";
  Object.assign(servicePair.userData, { inspectionLabel: "Upper cable pair (installation estimate)",
    inspectionMinimumRadiusM: .12, flightMatingConfirmed: false });
  harness.add(servicePair);
  const lowerServicePair = new THREE.Group(); lowerServicePair.name = "iem-lower-service-pair";
  Object.assign(lowerServicePair.userData, { inspectionLabel: "Lower cable pair (installation estimate)",
    inspectionMinimumRadiusM: .10, flightMatingConfirmed: false });
  harness.add(lowerServicePair);
  const secondColumn=new THREE.Group();secondColumn.name="iem-second-column";
  secondColumn.userData.inspectionLabel="Second-column service routing (estimate)";
  harness.add(secondColumn);
  const black = new THREE.MeshStandardMaterial({ color: 0x16181a, roughness: 0.6, metalness: 0.3 });
  const plate = new THREE.MeshStandardMaterial({ color: 0xc4c9cc, roughness: 0.32, metalness: 0.72 });
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.75, metalness: 0.2 });
  const shell = new THREE.MeshStandardMaterial({ color: 0x8e969b, roughness: 0.38, metalness: 0.8 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xb4bbbf, roughness: 0.35, metalness: 0.75 });
  const wrap = new THREE.MeshStandardMaterial({ color: 0xcfd3d5, roughness: 0.28, metalness: 0.82 });
  const tag = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.8, metalness: 0 });
  const kapton = new THREE.MeshStandardMaterial({ color: 0xd19a2e, roughness: 0.45, metalness: 0.2 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xc0703f, roughness: 0.35, metalness: 0.85 });
  const box = (size, at, material, target, name) => {
    const part = mesh(new THREE.BoxGeometry(...size), material, at, target);
    part.name = name; return part;
  };
  const screw = (at, axis, target, name, r = 0.0022) => {
    const part = mesh(new THREE.CylinderGeometry(r, r, 0.003, 8), steel, at, target);
    if (axis === "z") part.rotation.x = Math.PI / 2;
    part.name = name; return part;
  };
  const tube = (points, radius, material, target, name, segments = 20) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, "centripetal");
    const part = mesh(new THREE.TubeGeometry(curve, segments, radius, 6, false), material, [0, 0, 0], target);
    part.name = name; return part;
  };
  const finH = 0.012, bodyH = H - finH, face = -D / 2;

  // Body and the black top heat sink: fins parallel to the face, spaced front to back, with
  // rows of fasteners between them.
  box([W, bodyH, D], [0, bodyH / 2, 0], black, chassis, "iem-chassis-body");
  const finCount = Math.floor((D - 0.01) / 0.0075);
  for (let i = 0; i < finCount; i += 1) {
    const z = -D / 2 + 0.008 + i * (D - 0.016) / (finCount - 1);
    box([W - 0.008, finH, 0.0022], [0, bodyH + finH / 2, z], black, chassis, "iem-top-fin");
  }
  for (let r = 0; r < 4; r += 1) for (let c = 0; c < 7; c += 1) {
    screw([-W / 2 + 0.03 + c * (W - 0.06) / 6, bodyH + finH * 0.45, -D / 2 + 0.03 + r * (D - 0.06) / 3], "y", chassis, "iem-top-fastener", 0.0018);
  }

  // Face plate: slightly larger than the body, fastened round its edge.
  const PW = W + 0.012, PH = bodyH + 0.006;
  box([PW, PH, 0.004], [0, PH / 2, face - 0.002], plate, chassis, "iem-face-plate");
  for (let i = 0; i <= 12; i += 1) {
    const x = -PW / 2 + 0.008 + i * (PW - 0.016) / 12;
    screw([x, PH - 0.007, face - 0.005], "z", chassis, "iem-face-screw");
    screw([x, 0.007, face - 0.005], "z", chassis, "iem-face-screw");
  }
  for (let i = 1; i < 10; i += 1) for (const x of [-PW / 2 + 0.007, PW / 2 - 0.007]) screw([x, i * PH / 10, face - 0.005], "z", chassis, "iem-face-screw");

  // Connector windows: eight card columns, an upper and a lower row. Each entry is the window's
  // height (as a fraction of its row) and the Micro-D sizes it holds, top to bottom [EST layout].
  const columns = 8, colW = (PW - 0.03) / columns;
  const rows = [
    { top: PH - 0.02, h: (PH - 0.05) / 2 },
    { top: (PH - 0.05) / 2 + 0.012, h: (PH - 0.05) / 2 },
  ];
  const layout = [
    [[0.9, [37, 37]], [0.8, [51, 25]]],
    [[0.75, [25, 25]], [0.7, [37]]],
    [[0.9, [51, 37]], [0.85, [37, 37]]],
    [[0.6, [37]], [0.8, [25, 25]]],
    [[0.9, [37, 51]], [0.5, [15]]],
    [[0.7, [25, 15]], [0.85, [51, 37]]],
    [[0.9, [37, 37]], [0, []]],
    [[0.55, [51]], [0.75, [25, 25]]],
  ];
  const plugs = [];
  layout.forEach((cells, c) => {
    const x = PW / 2 - 0.015 - colW * (c + 0.5); // column 1 at the viewer's left (+x)
    cells.forEach(([fill, sizes], r) => {
      if (!fill) return;
      const wh = rows[r].h * fill, wy = rows[r].top - wh / 2;
      box([colW * 0.62, wh, 0.0015], [x, wy, face - 0.0045], windowMat, chassis, "iem-connector-window");
      sizes.forEach((size, k) => {
        const len = microD[size], y = wy + wh / 2 - (k + 0.5) * wh / sizes.length;
        box([0.0079, len, 0.006], [x, y, face - 0.007], shell, connectors, `iem-micro-d-${size}`);
        plugs.push([x, y, len]);
      });
    });
  });
  // Yellow tape strips on the face, as photographed.
  for (const [x, y, h] of [[PW / 2 - 0.05, PH * 0.42, 0.03], [-0.02, PH * 0.47, 0.025], [-PW / 2 + 0.06, PH * 0.4, 0.02]]) {
    box([0.012, h, 0.001], [x, y, face - 0.0045], kapton, chassis, "iem-face-tape");
  }

  // Copper ground strap: bolted on top at one corner and bent down the side to the wall [EST].
  box([0.03, 0.002, 0.022], [-W / 2 + 0.035, H + 0.001, -D / 2 + 0.03], copper, mounts, "iem-ground-strap-lug");
  box([0.016, 0.002, 0.03], [-W / 2 + 0.035, H + 0.002, -D / 2 + 0.055], copper, mounts, "iem-ground-strap");
  tube([[-W / 2 + 0.035, H + 0.003, -D / 2 + 0.07], [-W / 2 + 0.035, H + 0.012, D / 2 - 0.02], [-W / 2 + 0.035, H - 0.01, D / 2 + 0.006]], 0.0035, copper, mounts, "iem-ground-strap-braid");
  // Back mounting to the wall panel: a bolted flange frame round the rear [EST].
  box([W + 0.02, bodyH + 0.01, 0.004], [0, (bodyH + 0.01) / 2, D / 2 + 0.002], black, mounts, "iem-wall-flange");
  for (const x of [-W / 2 - 0.005, W / 2 + 0.005]) for (const y of [0.02, bodyH / 2, bodyH - 0.01]) screw([x, y, D / 2 + 0.005], "z", mounts, "iem-wall-bolt", 0.003);

  // Harness: a backshell and white label on every plug; cables drop in front of the face and
  // gather at one end into a trunk (silver-wrapped, as photographed) [EST routes].
  const z0 = face - 0.024;
  plugs.forEach(([x, y, len], i) => {
    const service = iemServiceAsset.leadIndices.includes(i), lower = i === 2 || i === 3, middle = i === 5;
    const upperSecond=i===4,lowerSecond=i===6;
    const target = lower ? lowerServicePair : service ? servicePair : i>=4&&i<=6 ? secondColumn : harness;
    const backshell = box([0.011, len + 0.004, 0.014], [x, y, face - 0.017], wrap, target, "iem-harness-backshell");
    const label = box([0.012, 0.016, 0.003], [x, y - len / 2 - 0.012, z0 + 0.004], tag, target, "iem-harness-label");
    backshell.userData.connectionId = label.userData.connectionId = `iem-local-lead-${i + 1}`;
    const run = -PW / 2 - 0.015 - (i % 5) * 0.005;
    const end = [run, 0.011, z0 - 0.024 + (i % 3) * 0.004];
    const start = [x, y - len / 2, z0 + 0.006];
    const depth = iemServiceAsset.bowDepthsM[i];
    const side = i === 1 ? -.02 : .006;
    const lowerSide = i === 2 ? .022 : -.020;
    // [EST] Separate the middle lead from the upper lead's old shared descent.
    // The inherited, tightly gathered terminal endpoints remain deliberately fixed.
    const points = upperSecond ? [start, [.084, .205, -.153], [.084, .170, -.184], [.083, .130, -.187],
      [.083, .118, -.187], [.060, .108, -.187], [-.090, .106, -.187], [-.145, .095, -.187],
      [-.172, .075, -.178], [-.183, .052, -.185], [-.183, .028, -.185], end] :
      lowerSecond ? [start, [.080, .068, -.153], [.078, .060, -.183], [.077, .042, -.202],
      [.055, .038, -.204], [-.100, .037, -.204], [-.132, .040, -.197], [-.145, .057, -.177],
      [-.154, .053, -.136], [-.156, .030, -.132], [-.156, .023, -.132], [-.155, .013, -.144], end] :
      middle ? [start, [.064, .174, -.130], [.064, .162, -.158], [.066, .145, -.198],
      [.066, .100, -.204], [.066, .074, -.204], [.030, .063, -.204],
      [-.090, .060, -.204], [-.145, .055, -.204], [-.176, .043, -.170], [-.181, .031, -.145],
      [-.176, .026, -.150], [-.172, .022, -.150], [-.172, .016, -.150], end] :
      lower ? [start, [x + (i === 2 ? .016 : -.012), start[1] - .012, z0 - .006],
      [x + lowerSide, i === 2 ? .060 : .020, z0 - depth],
      [x + lowerSide, i === 2 ? .052 : .014, z0 - depth],
      [(x + run) / 2, i === 2 ? .050 : .014, z0 - depth],
      [run + .025, i === 2 ? .040 : .012, z0 - depth - (i === 3 ? .022 : 0)], end] :
      service ? [start, [x + (i === 1 ? -.014 : 0), start[1] - .014, z0 - .012],
      [x + side, start[1] - .05, z0 - depth], [x + side, .04, z0 - depth],
      [x + side, .035, z0 - depth], [(x + run) / 2, .035, z0 - depth],
      [run + .025, .028, z0 - depth], end] :
      [start, [x, y - len / 2 - .03, z0 - .004], [x, .018, z0 - .016], [(x + run) / 2, .011, z0 - .022], end];
    const cable = tube(points, iemServiceAsset.radiusM, wrap, target, "iem-harness-cable", service ? 80 : middle||upperSecond||lowerSecond ? 100 : 20);
    Object.assign(cable.userData, { connectionId: `iem-local-lead-${i + 1}`, servicePair: service,
      routeConfidence: "EST", flightMatingConfirmed: false });
    if(middle){
      cable.userData.routingReviewed=true;
      const fraction=iemMiddleLeadAsset.supportFraction,p=cable.geometry.parameters.path.getPointAt(fraction);
      addCableSupport({wire:cable,fraction,foot:[p.x,p.y,face-.004],normal:[0,0,-1],mounts,id:"iem-6"});
      for(const fraction of iemMiddleLeadAsset.lacingFractions)addCableLacing({wire:cable,fraction,parent:target,id:`iem-6-${fraction}`});
      cable.userData.labelFraction=iemMiddleLeadAsset.labelFraction;
      const pLabel=cable.geometry.parameters.path.getPointAt(iemMiddleLeadAsset.labelFraction);
      label.position.copy(pLabel);label.position.z-=.005;
      label.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),cable.geometry.parameters.path.getTangentAt(iemMiddleLeadAsset.labelFraction));
    }
    if(i===4||i===6){
      const n=upperSecond?0:1,path=cable.geometry.parameters.path,fraction=iemSecondColumnAsset.supportFractions[n],p=path.getPointAt(fraction);
      const foot=upperSecond?[p.x,p.y,face-.004]:[.061,.080,face-.004];
      addCableSupport({wire:cable,fraction,foot,normal:[0,0,-1],mounts,id:`iem-${i+1}`});
      for(const f of iemSecondColumnAsset.lacingFractions)addCableLacing({wire:cable,fraction:f,parent:target,id:`iem-${i+1}-${f}`});
      cable.userData.routingReviewed=true;
      cable.userData.labelFraction=iemSecondColumnAsset.labelFractions[n];
      label.position.copy(path.getPointAt(cable.userData.labelFraction));label.position.z-=.005;
      label.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),path.getTangentAt(cable.userData.labelFraction));
    }
    if (!service) return;
    const path = cable.geometry.parameters.path;
    const labelFraction = lower ? .24 : .12;
    cable.userData.labelFraction = labelFraction;
    label.position.copy(path.getPointAt(labelFraction));
    if (lower) label.position.z -= .005;
    else label.position.x -= .009;
    label.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), path.getTangentAt(labelFraction));
    for (const fraction of [.25, .52]) {
      const tie = mesh(new THREE.TorusGeometry(.0056, .00065, 6, 20), tag, path.getPointAt(fraction).toArray(), target);
      tie.name = "iem-service-lacing";
      tie.userData.connectionId = cable.userData.connectionId;
      tie.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), path.getTangentAt(fraction));
    }
    // [EST] low face-mounted stand-off: no new panel hole or verified flight fastener.
    const p = path.getPointAt(iemServiceAsset.supportFractions[i]);
    const foot = box([.012, .008, .003], [p.x, p.y - .0055, face - .0055], steel, mounts, "iem-service-support-foot");
    const stand = box([.006, .002, face - .007 - p.z], [p.x, p.y - .0055, (face - .007 + p.z) / 2], steel, mounts, "iem-service-support-stand");
    foot.userData.connectionId = stand.userData.connectionId = cable.userData.connectionId;
    const clip = mesh(new THREE.TorusGeometry(.0055, .0008, 6, 20), tag, p.toArray(), mounts);
    clip.name = "iem-service-clip"; clip.userData.connectionId = cable.userData.connectionId;
    clip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), path.getTangentAt(iemServiceAsset.supportFractions[i]));
  });
  for (const k of [0, 1, 2]) box([0.016, 0.014, 0.012], [-PW / 2 - 0.026, 0.01, z0 - 0.024 + k * 0.007], kapton, harness, "iem-harness-tie");
  return { assembly, chassis, mounts, connectors, harness, servicePair, lowerServicePair };
}
