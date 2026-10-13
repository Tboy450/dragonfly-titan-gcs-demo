// NASA/APL design: 2023 thermal layout, refined against the 2024 CAD visualization
// and NASA's 2026 printable-model assembly guide. Detail dimensions remain [EST].
// Built into a group supplied by chase-vehicle.mjs, using its shared part helpers.
import * as THREE from "./vendor/three/three.module.min.js";
import { model } from "./flight-model.mjs?v=dev";
import { samplingSequence } from "./science.mjs?v=dev";
import { buildSampleCarousel } from "./sample-carousel.mjs?v=dev";
import { buildWonderwall } from "./wonderwall.mjs?v=dev";
import { buildDramsAssembly, dramsAsset } from "./drams-assembly.mjs?v=dev";

export function buildResearchModel(kit) {
  const { group: researchModel, mesh, strut, metal, deck, gold, buildAntenna, upAxis } = kit;
  let buildTarget = researchModel;
  const setBuild = (group) => { buildTarget = group; kit.setTarget(group); };
  // ---- Research model: NASA/APL 2023 lander overview (TFAWS 2023 slide 3; ICES-2020-160 and
  // ICES-2023-389 figure 1). Published: 3.85 x 3.85 x 1.75 m envelope; eight 1.35 m three-blade
  // rotors in four coaxial pairs on side arms, disks R/2 apart; long fuselage with a raised
  // "attic" behind the nose; MMRTG (64 cm across the fins, 66 cm long) at the tail between two
  // stabilizing fins; 0.874 m HGA disc on top plus LGA and MGA; two skids on legs. Body-side
  // drill/feed placement follows the later CAD/print references. Detail dimensions are [EST].
  setBuild(researchModel);
  const researchRotors = [];
  const drillFeeds = [], transferPaths = [];
  const foam = new THREE.MeshStandardMaterial({ color: 0xdcd3c1, metalness: 0.04, roughness: 0.82 });
  const foamSeam = new THREE.MeshStandardMaterial({ color: 0xaea593, metalness: 0.05, roughness: 0.9 });
  const finMaterial = new THREE.MeshStandardMaterial({ color: 0xb39a48, metalness: 0.35, roughness: 0.5 });
  const rtgMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3135, metalness: 0.55, roughness: 0.45 });
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xc9ccc6, metalness: 0.35, roughness: 0.5 });
  const lens = new THREE.MeshStandardMaterial({ color: 0x0b1318, metalness: 0.6, roughness: 0.15 });

  // Rotor blade: tapered and twisted, with a thin cambered section and a rounded tip, built out
  // to 0.70 units (scaled to the 1.35 m rotor). Chord, twist and thickness are estimated from the
  // 2023 drawings and typical rotor practice [EST]. The leading edge faces -z, the direction a
  // blade moves when its rotor's phase increases; rotors turning the other way mirror it.
  function bladeGeometry() {
    const stations = 22, around = 12, rootR = 0.07, tipR = 0.70;
    const positions = [], indices = [];
    for (let i = 0; i <= stations; i += 1) {
      const s = i / stations;
      const r = rootR + (tipR - rootR) * s;
      let chord = 0.115 - 0.04 * Math.min(1, s / 0.86);
      if (s > 0.86) chord *= 0.12 + 0.88 * Math.sqrt(Math.max(0, 1 - ((s - 0.86) / 0.14) ** 2));
      if (s < 0.08) chord *= 0.55 + 0.45 * (s / 0.08); // slim root cuff into the hub
      const pitch = (17 - 12 * s) * Math.PI / 180;
      const thickness = chord * (0.12 - 0.05 * s);
      const camber = chord * 0.035;
      for (let j = 0; j < around; j += 1) {
        const a = j / around * Math.PI * 2;
        const x = Math.cos(a) * 0.5; // +0.5 trailing edge, -0.5 leading edge
        const y = Math.sin(a) * 0.5 * thickness * (1 - 0.35 * x) + camber * (1 - 4 * x * x);
        const z = (x + 0.25) * chord; // quarter-chord line on the blade axis
        positions.push(r, y * Math.cos(pitch) - z * Math.sin(pitch), z * Math.cos(pitch) + y * Math.sin(pitch));
      }
    }
    for (let i = 0; i < stations; i += 1) {
      for (let j = 0; j < around; j += 1) {
        const a = i * around + j, b = i * around + (j + 1) % around, c = a + around, d = b + around;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }
  const researchBlade = bladeGeometry();
  const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xbfc4bd, metalness: 0.3, roughness: 0.42, side: THREE.DoubleSide });
  // Spinning rotors read as a faint disc, denser toward the tips; opacity follows rotor speed.
  const discCanvas = document.createElement("canvas");
  discCanvas.width = discCanvas.height = 256;
  const discPaint = discCanvas.getContext("2d");
  const discShade = discPaint.createRadialGradient(128, 128, 12, 128, 128, 128);
  discShade.addColorStop(0, "rgba(220, 214, 196, 0)");
  discShade.addColorStop(0.2, "rgba(220, 214, 196, 0.35)");
  discShade.addColorStop(0.8, "rgba(226, 220, 204, 0.6)");
  discShade.addColorStop(0.95, "rgba(236, 230, 214, 0.85)");
  discShade.addColorStop(1, "rgba(236, 230, 214, 0)");
  discPaint.fillStyle = discShade;
  discPaint.fillRect(0, 0, 256, 256);
  const discTexture = new THREE.CanvasTexture(discCanvas);
  discTexture.colorSpace = THREE.SRGBColorSpace;
  const rotorDiscMaterial = new THREE.MeshBasicMaterial({ map: discTexture, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const rotorDiscGeometry = new THREE.RingGeometry(0.06, 0.70, 64, 1);
  rotorDiscGeometry.rotateX(-Math.PI / 2);
  const spinnerGeometry = new THREE.SphereGeometry(0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);

  function taper(from, to, radiusFrom, radiusTo, material) {
    const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const part = mesh(new THREE.CylinderGeometry(radiusTo, radiusFrom, direction.length(), 14), material, start.clone().add(end).multiplyScalar(0.5).toArray());
    part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return part;
  }

  // A side profile (z forward-negative, y up) extruded across the width with rounded edges.
  function profileBody(points, width, material, bevel = 0.05) {
    const outline = points instanceof THREE.Shape ? points : new THREE.Shape();
    if (Array.isArray(points)) points.forEach(([z, y], index) => (index ? outline.lineTo(z, y) : outline.moveTo(z, y)));
    outline.closePath();
    const geometry = new THREE.ExtrudeGeometry(outline, {
      depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 18,
    });
    geometry.rotateY(-Math.PI / 2);
    geometry.translate((width - 2 * bevel) / 2, 0, 0);
    return mesh(geometry, material, [0, 0, 0]);
  }

  // Each subsystem owns a thermal zone so all views share the same geometry and readings.
  const subsystems = {};
  function subsystem(name, thermalZone) {
    if (!subsystems[name]) {
      const group = new THREE.Group();
      group.name = name;
      group.userData = { subsystem: name, thermalZone };
      researchModel.add(group);
      subsystems[name] = group;
    }
    setBuild(subsystems[name]);
  }

  // Proportions are measured from the TFAWS 2023 top view (slide 3, rendered at 260 dpi):
  // nose to MMRTG end = 1,260 px = 3.85 m, so 327 px/m (the MMRTG's 203 px = 0.62 m checks
  // against its published 64 cm). Model z = (px - 690) / 327, model x = (py - 355) / 327, with the
  // origin at the rotor-hub center. Use the same mapping to place interior parts from that
  // drawing so the internal layer fits this exterior: fuselage 0.86 m wide from z -1.93 to +1.28,
  // arm roots at z -0.75 / +0.84, rotor hubs at z -/+0.98 and x -/+1.25, skids at x -/+0.75.
  // Fuselage: long, with the underside tapering up at the nose and tail.
  subsystem("fuselage", "insulated-shell");
  profileBody([[-1.90, -0.05], [-1.78, -0.27], [-1.48, -0.36], [0.98, -0.36], [1.20, -0.26], [1.24, -0.05], [1.24, 0.10], [-1.83, 0.10]], 0.86, foam);
  // The rounded forward cover transitions to a low, flat equipment deck. Its silhouette
  // follows APL's CAD movie and NASA Assembly Guide pp1-3; this is procedural geometry [EST].
  subsystem("attic", "insulated-shell");
  const atticShape = new THREE.Shape();
  atticShape.moveTo(-1.87, 0.04);
  atticShape.bezierCurveTo(-1.90, 0.25, -1.63, 0.51, -1.39, 0.55);
  atticShape.quadraticCurveTo(-1.10, 0.59, -0.80, 0.56);
  atticShape.quadraticCurveTo(-0.73, 0.55, -0.73, 0.49);
  atticShape.lineTo(-0.73, 0.04);
  profileBody(atticShape, 0.87, foam, 0.055).name = "forward-attic-cover";
  subsystem("fuselage", "insulated-shell");
  for (const z of [-0.45, 0.2, 0.84]) mesh(new THREE.BoxGeometry(0.875, 0.5, 0.018), foamSeam, [0, -0.13, z]);
  subsystem("navigation-sensors", "external-sensors");
  for (const x of [-0.22, 0, 0.22]) {
    mesh(new THREE.BoxGeometry(0.108, 0.10, 0.048), armMaterial, [x, -0.11, -1.93]);
    mesh(new THREE.BoxGeometry(0.083, 0.075, 0.016), deck, [x, -0.11, -1.96]);
    const camera = mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.018, 16), lens, [x, -0.11, -1.974]);
    camera.rotation.x = Math.PI / 2;
  }
  for (const side of [-1, 1]) mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), lens, [side * 0.3, -0.38, -1.78]);
  // Instrument booms: front left and rear right.
  subsystem("instrument-booms", "external-sensors");
  strut([-0.44, -0.08, -1.62], [-0.76, -0.03, -1.9], 0.012, metal);
  mesh(new THREE.SphereGeometry(0.03, 12, 8), gold, [-0.76, -0.03, -1.9]);
  strut([0.43, 0.1, 1.08], [0.64, 0.36, 1.3], 0.012, metal);
  mesh(new THREE.SphereGeometry(0.03, 12, 8), metal, [0.64, 0.36, 1.3]);

  // MMRTG at the tail: core cylinder with eight radial fins, axis along the fuselage.
  subsystem("mmrtg", "mmrtg");
  const generator = new THREE.Group();
  generator.position.set(0, 0.05, 1.6);
  buildTarget.add(generator);
  mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.66, 24), rtgMaterial, [0, 0, 0], generator).rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i += 1) {
    const angle = i / 8 * Math.PI * 2;
    const rib = mesh(new THREE.BoxGeometry(0.02, 0.12, 0.62), rtgMaterial, [Math.cos(angle) * 0.26, Math.sin(angle) * 0.26, 0], generator);
    rib.rotation.z = angle - Math.PI / 2;
  }
  mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 24), metal, [0, 0, -0.34], generator).rotation.x = Math.PI / 2;

  // Two tall stabilizing fins flank the MMRTG and splay outward toward the rear.
  const finOutline = new THREE.Shape();
  finOutline.moveTo(0, -0.22);
  finOutline.lineTo(0.72, -0.22);
  finOutline.lineTo(0.76, 0.62);
  finOutline.quadraticCurveTo(0.74, 0.88, 0.5, 0.88);
  finOutline.lineTo(0.22, 0.86);
  finOutline.closePath();
  const finGeometry = new THREE.ExtrudeGeometry(finOutline, { depth: 0.015, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2, curveSegments: 10 });
  finGeometry.rotateY(-Math.PI / 2);
  subsystem("fins", "exterior-structure");
  for (const side of [-1, 1]) {
    const hinge = new THREE.Group();
    hinge.position.set(side * 0.39, 0, 1.2);
    hinge.rotation.set(0, side * 0.14, side * -0.05);
    buildTarget.add(hinge);
    mesh(finGeometry, finMaterial, [side * 0.0125, 0, 0], hinge);
    if (side > 0) {
      mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16), gold, [0.06, 0.5, 0.3], hinge).rotation.z = Math.PI / 2; // MGA
    }
  }
  // Low-gain antenna on a boss just ahead of the MMRTG.
  subsystem("antennas", "antennas");
  mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.12, 16), foam, [0, 0.2, 1.02]);
  mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.08, 10), armMaterial, [0, 0.3, 1.02]);
  mesh(new THREE.SphereGeometry(0.025, 10, 6), armMaterial, [0, 0.35, 1.02]);

  // Flat runners and shaped legs, as in NASA's Assembly Guide pp1-2. The dimensions of
  // these details are estimated; the footprint and ground-contact height stay unchanged.
  const armRoots = [-0.75, 0.84];
  for (const side of [-1, 1]) {
    subsystem("landing-gear", "exterior-structure");
    const skidX = side * 0.75;
    const runner = profileBody([[-1.46, -0.73], [-1.28, -0.85], [1.02, -0.85], [1.17, -0.76],
      [1.15, -0.715], [1.0, -0.785], [-1.27, -0.785], [-1.44, -0.69]], 0.14, armMaterial, 0.009);
    runner.position.x = skidX;
    runner.name = side < 0 ? "port-skid" : "starboard-skid";
    for (const z of armRoots) {
      const legShape = new THREE.Shape();
      [[0.39, -0.28], [0.51, -0.34], [0.59, -0.50], [0.57, -0.56], [0.76, -0.78],
        [0.66, -0.78], [0.50, -0.58], [0.51, -0.51], [0.44, -0.39], [0.37, -0.36]]
        .forEach(([x, y], i) => i ? legShape.lineTo(side * x, y) : legShape.moveTo(side * x, y));
      legShape.closePath();
      mesh(new THREE.ExtrudeGeometry(legShape, { depth: 0.08, bevelEnabled: true,
        bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }), metal, [0, 0, z - 0.04]);
      mesh(new THREE.BoxGeometry(0.12, 0.035, 0.16), gold, [skidX, -0.76, z]);
    }
    // DrACO's vertical drill/feed assemblies mount beside the body, above the runners.
    // APL payload cutaway + NASA Assembly Guide p2; two redundant drills are described
    // by NASA's "Playing Lacrosse on Titan". Stowed bit and tube routing are [EST].
    subsystem("drills", "drills");
    const drillX = side * 0.54, drillZ = -0.43;
    mesh(new THREE.BoxGeometry(0.14, 0.11, 0.23), armMaterial, [drillX, -0.23, drillZ]);
    mesh(new THREE.CylinderGeometry(0.052, 0.044, 0.37, 16), metal, [drillX, -0.475, drillZ]);
    for (const offset of [-0.083, 0.083]) {
      strut([drillX, -0.28, drillZ + offset], [drillX, -0.73, drillZ + offset], 0.015, metal);
    }
    for (const y of [-0.32, -0.39, -0.64]) mesh(new THREE.CylinderGeometry(0.057, 0.057, 0.018, 16), deck, [drillX, y, drillZ]);
    const feed = new THREE.Group();
    feed.name = side < 0 ? "drill-feed-port" : "drill-feed-starboard";
    feed.position.set(drillX, -0.72, drillZ);
    buildTarget.add(feed);
    mesh(new THREE.CylinderGeometry(0.017, 0.012, 0.11, 10), metal, [0, 0, 0], feed);
    // Helical flute makes the slowed illustrative rotation legible, not a specified cutter.
    const flute = new THREE.CatmullRomCurve3(Array.from({ length: 33 }, (_, i) => {
      const a = i / 32 * Math.PI * 4;
      return new THREE.Vector3(Math.cos(a) * 0.017, i / 32 * 0.10 - 0.05, Math.sin(a) * 0.017);
    }));
    mesh(new THREE.TubeGeometry(flute, 32, 0.003, 4, false), deck, [0, 0, 0], feed);
    drillFeeds.push(feed);
    subsystem("sample-lines", "drills");
    const sampleLine = new THREE.CatmullRomCurve3([
      new THREE.Vector3(drillX, -0.23, drillZ), new THREE.Vector3(side * 0.49, -0.06, -0.62),
      new THREE.Vector3(side * 0.465, -0.02, -1.15), new THREE.Vector3(side * 0.44, 0.16, -1.53),
    ]);
    mesh(new THREE.TubeGeometry(sampleLine, 20, 0.014, 6, false), armMaterial, [0, 0, 0]);
    transferPaths.push(new THREE.CatmullRomCurve3([
      ...sampleLine.points, new THREE.Vector3(side * 0.25, 0.27, -1.53), new THREE.Vector3(0, 0.285, -1.40),
    ]));
  }

  // High-gain antenna: a flat 0.874 m radial-line slot disc, stowed flat on top for flight.
  const slotCanvas = document.createElement("canvas");
  slotCanvas.width = slotCanvas.height = 256;
  const slots = slotCanvas.getContext("2d");
  slots.fillStyle = "#1f2638";
  slots.fillRect(0, 0, 256, 256);
  slots.fillStyle = "#6a7896";
  for (let ring = 10; ring < 126; ring += 7) {
    const count = Math.floor(2 * Math.PI * ring / 7);
    for (let k = 0; k < count; k += 1) {
      const a = k / count * Math.PI * 2 + ring;
      slots.fillRect(128 + Math.cos(a) * ring - 1.2, 128 + Math.sin(a) * ring - 1.2, 2.4, 2.4);
    }
  }
  const slotTexture = new THREE.CanvasTexture(slotCanvas);
  slotTexture.colorSpace = THREE.SRGBColorSpace;
  const slotFace = new THREE.MeshStandardMaterial({ map: slotTexture, metalness: 0.45, roughness: 0.45 });
  subsystem("high-gain-antenna", "antennas");
  const researchAntenna = buildAntenna([0, 0.15, 0.05], 0.04, 0.52, 0.03);
  mesh(new THREE.CylinderGeometry(0.437, 0.437, 0.03, 48), [metal, slotFace, metal], [0, 0.02, 0], researchAntenna.head);

  // Arms run out from the arm roots, angled slightly toward the ends, to the rotor hubs, where
  // motor pods carry the coaxial rotors (upper and lower disks 0.36 m apart, about R/2).
  const researchBladeScale = model.rotorDiameterM / 2 / 0.70;
  for (const x of [-1.25, 1.25]) {
    const side = Math.sign(x);
    for (const [index, z] of [-0.98, 0.98].entries()) {
      const root = [side * 0.42, 0.02, armRoots[index]];
      const hub = [x, 0.02, z];
      const fairingEnd = root.map((value, axis) => value + (hub[axis] - value) * 0.22);
      subsystem("arms", "exterior-structure");
      mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.075, 20), foamSeam, [side * 0.46, 0.01, armRoots[index]]).rotation.z = Math.PI / 2;
      mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.085, 20), metal, [side * 0.50, 0.01, armRoots[index]]).rotation.z = Math.PI / 2;
      taper(root, fairingEnd, 0.1, 0.065, armMaterial);
      strut(fairingEnd, hub, 0.036, armMaterial);
      subsystem("motors", "motors");
      mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.34, 16), metal, hub);
      for (let layer = 0; layer < 2; layer += 1) {
        const y = layer === 0 ? -0.16 : 0.20;
        subsystem("motors", "motors");
        const motorY = y + (layer === 0 ? 0.055 : -0.055);
        mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.086, 20), armMaterial, [x, motorY, z]);
        mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 20), deck, [x, motorY, z]);
        mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), gold, [x, y + (layer === 0 ? -0.025 : 0.025), z]);
        subsystem("rotors", "rotors");
        const rotor = new THREE.Group();
        rotor.position.set(x, y, z);
        rotor.scale.setScalar(researchBladeScale);
        buildTarget.add(rotor);
        const direction = layer === 0 ? 1 : -1;
        for (let blade = 0; blade < model.bladesPerRotor; blade += 1) {
          const solid = mesh(researchBlade, bladeMaterial, [0, 0, 0], rotor);
          solid.rotation.y = blade * Math.PI * 2 / model.bladesPerRotor;
          solid.scale.z = direction; // the leading edge leads in this rotor's direction of turn
        }
        // Hub spinner facing away from the motor, and the blur disc.
        const spinner = mesh(spinnerGeometry, armMaterial, [0, 0, 0], rotor);
        if (layer === 0) spinner.rotation.x = Math.PI;
        mesh(rotorDiscGeometry, rotorDiscMaterial, [0, 0, 0], rotor);
        researchRotors.push({ rotor, direction, phase: researchRotors.length * 0.63 });
      }
    }
  }
  // ---- Interior (shown by the Mission view's Internal and Thermal layers) ----
  // Placement follows the published descriptions and figures, in the same coordinates as the
  // exterior above. Inside the 7.62 cm foam the cavity is about x -/+0.36, y -0.33 to +0.07,
  // and up to y +0.5 under the attic. Sources: ICES-2023-389 (text p2-p7; fig. 3 hot
  // hibernation and fig. 4 end of a leapfrog flight, nose to the left) and TFAWS 2023 slide 3
  // (top view: centerline ducting, fans at the tail). Parts the papers name but do not locate
  // exactly are placed where those figures show them; unnamed boxes are not drawn.
  const labeledParts = [];
  function interiorPart(name, thermalZone, label, source, color, layer = "interior") {
    subsystem(name, thermalZone);
    const group = subsystems[name];
    group.userData.layer = layer;
    group.userData.label = label;
    group.userData.source = source;
    group.userData.color = color;
    labeledParts.push(group);
    return new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.6 });
  }
  interiorPart("drills", "drills", "DrACO drill and feed assemblies", "NASA Assembly Guide p2; APL payload cutaway; dimensions illustrative", 0xa9b9b9, "exterior");
  interiorPart("sample-lines", "drills", "DrACO pneumatic sample-transfer lines", "APL payload cutaway; NASA Playing Lacrosse on Titan; routing illustrative", 0xa9b9b9, "exterior");
  let material = interiorPart("nose-bulkhead", "equipment-bay", "Nose bulkhead", "ICES-2023 p7, fig. 3", 0x9aa6ad);
  mesh(new THREE.BoxGeometry(0.7, 0.4, 0.02), material, [0, -0.13, -1.56]);
  material = interiorPart("nose-cameras-inside", "nose-cameras", "Navigation and forward cameras (no active airflow)", "ICES-2023 p7, fig. 3", 0x3d4a52);
  for (const x of [-0.22, 0, 0.22]) mesh(new THREE.BoxGeometry(0.09, 0.09, 0.12), material, [x, -0.1, -1.8]);
  material = interiorPart("nose-electronics", "nose-electronics", "IMUs and lidar electronics (FEB, MEB)", "ICES-2023 p7 (base of the nose), fig. 4", 0x5f8fa3);
  mesh(new THREE.BoxGeometry(0.22, 0.12, 0.2), material, [-0.15, -0.26, -1.36]);
  mesh(new THREE.BoxGeometry(0.14, 0.1, 0.14), material, [0.07, -0.27, -1.38]);
  mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), material, [0.25, -0.28, -1.42]);
  mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), material, [0.25, -0.28, -1.28]);
  interiorPart("sample-carousel", "cold-attic", "Cold attic: DrACO sample carousel", "NASA SVS 15003; SciTech 2024 figs. 1-2; 0.36 m drum and placement estimated", 0x7fb3c9);
  const carousel = buildSampleCarousel({ parent: buildTarget, mesh });
  // Only the illustrative flow endpoint changes; the older transfer-line asset is queued separately.
  for (const path of transferPaths) {
    path.points[path.points.length - 1].copy(carousel.inletWorld);
    path.updateArcLengths();
  }
  const sampleMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x6ef1da, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false });
  const cupMarker = mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 16), sampleMarkerMaterial, [0, 0, 0], carousel.carrier);
  cupMarker.name = "sample-cup-marker";
  cupMarker.rotation.x = Math.PI / 2;
  cupMarker.renderOrder = 6;
  interiorPart("wonderwall", "cold-attic", "Wonderwall: warm/cold attic interface", "ICES-2023 p7; SciTech 2024 figs. 2, 11; detailed shape and layers estimated", 0xe6e0d0);
  buildWonderwall({ parent: buildTarget, mesh });
  interiorPart("drams", "equipment-bay", "Warm attic: DraMS instrument assembly", "NASA SVS 15003; SciTech 2024 figs. 1-2; casing dimensions and internals estimated", 0xb58a4a);
  buildDramsAssembly({ parent: buildTarget, mesh });
  const analysisMarker = mesh(new THREE.TorusGeometry(0.064, 0.006, 6, 24), sampleMarkerMaterial, dramsAsset.analysisAnchor);
  analysisMarker.name = "sample-analysis-marker";
  analysisMarker.rotation.y = Math.PI / 2;
  analysisMarker.renderOrder = 6;
  material = interiorPart("rde", "rde", "Rotorcraft drive electronics (2 boxes)", "ICES-2023 p5, p7, fig. 4", 0xa34d4d);
  for (const x of [-0.16, 0.16]) mesh(new THREE.BoxGeometry(0.24, 0.22, 0.26), material, [x, -0.18, -0.55]);
  material = interiorPart("hga-actuators", "cold-actuators", "HGA azimuth/elevation actuators", "ICES-2023 p2, fig. 3", 0x4f7fd1);
  mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20), material, [0, 0.035, -0.36]);
  mesh(new THREE.BoxGeometry(0.1, 0.07, 0.12), material, [0, -0.02, -0.36]);
  material = interiorPart("power-units", "equipment-bay", "Two power switching units (PSUs)", "NASA integration update, 10 Mar 2026; ICES-2023 fig. 4; placement illustrative", 0x4f9a8f);
  mesh(new THREE.BoxGeometry(0.2, 0.22, 0.26), material, [-0.22, -0.18, -0.2]);
  mesh(new THREE.BoxGeometry(0.2, 0.22, 0.22), material, [-0.22, -0.18, 0.12]);
  material = interiorPart("iem", "equipment-bay", "Integrated electronics module (IEM)", "NASA integration update, 10 Mar 2026; APL CAD reference; placement illustrative", 0x579cae);
  mesh(new THREE.BoxGeometry(0.22, 0.18, 0.3), material, [0.2, -0.2, -0.12]);
  for (let z = -0.24; z < 0.03; z += 0.045) mesh(new THREE.BoxGeometry(0.20, 0.008, 0.008), metal, [0.2, -0.106, z]);
  material = interiorPart("frontier-radio", "equipment-bay", "Frontier X-band radio", "NASA spacecraft and instruments; ICES-2023 fig. 4; placement illustrative", 0x609a73);
  mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), material, [0.22, -0.2, 0.2]);
  material = interiorPart("twta", "twta", "TWTA radio amplifier (under the top deck)", "ICES-2023 p7", 0xc0643c);
  mesh(new THREE.BoxGeometry(0.3, 0.07, 0.14), material, [0.05, 0.02, 0.08]);
  material = interiorPart("battery", "battery", "Battery: 11.5 kWh, 7.5 kg phase-change wax, heat pipes", "ICES-2023 p5, figs. 3-4", 0x6f7d58);
  mesh(new THREE.BoxGeometry(0.6, 0.3, 0.52), material, [0, -0.15, 0.72]);
  material = interiorPart("aft-bulkhead", "equipment-bay", "Aft bulkhead", "ICES-2023 fig. 4", 0x9aa6ad);
  mesh(new THREE.BoxGeometry(0.7, 0.4, 0.02), material, [0, -0.13, 1.08]);
  material = interiorPart("fan", "warm-duct", "Circulation fan: 0.052 kg/s of MMRTG-warmed air, 10-15 W", "ICES-2023 p6; TFAWS 2023 slide 3", 0xd9823f);
  mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 20), material, [0, -0.12, 1.18]).rotation.x = Math.PI / 2;
  material = interiorPart("underfloor-duct", "warm-duct", "Under-floor duct: warm air runs forward to the nose", "ICES-2023 p2-p3; TFAWS 2023 slide 3", 0xc9794a);
  mesh(new THREE.BoxGeometry(0.16, 0.045, 2.6), material, [0, -0.305, -0.13]);
  material = interiorPart("trim-chimneys", "trim-device", "Trim device: 43 x 34 cm chimney on each side, with its flap", "ICES-2023 p7, fig. 1; TFAWS 2023 (flaps)", 0xb04a9a);
  for (const side of [-1, 1]) mesh(new THREE.BoxGeometry(0.025, 0.43, 0.34), material, [side * 0.44, -0.13, 0.45]);
  // Trim flaps: foam-covered aluminum flaps on linear actuators that divert warm air into the
  // exposed cold duct [PUB, TFAWS 2023]. Hinged at the top of each chimney's inner face; the
  // opening angle follows the trim setting (40% flow at about 24 degrees [EST]; the 2024 test
  // rejected 245.7 W at a 23.7 degree flap angle [PUB]).
  const flapMaterial = new THREE.MeshStandardMaterial({ color: 0xc8ccc8, metalness: 0.5, roughness: 0.4 });
  const trimFlaps = [-1, 1].map((side) => {
    const hinge = new THREE.Group();
    hinge.name = side < 0 ? "trim-flap-port" : "trim-flap-starboard";
    hinge.position.set(side * 0.415, 0.06, 0.45);
    buildTarget.add(hinge);
    mesh(new THREE.BoxGeometry(0.012, 0.3, 0.3), flapMaterial, [0, -0.15, 0], hinge);
    return { hinge, side };
  });
  material = interiorPart("battery-sensor", "battery", "Battery temperature sensor: an input to the thermal controller", "TFAWS 2023 (controller inputs); placement illustrative", 0x9fe870);
  mesh(new THREE.SphereGeometry(0.022, 12, 8), material, [0.2, 0.02, 0.72]);
  material = interiorPart("mmrtg-sensor", "mmrtg", "MMRTG fin-root temperature sensor: the other controller input", "TFAWS 2023 (controller inputs); placement illustrative", 0x9fe870, "exterior");
  mesh(new THREE.SphereGeometry(0.022, 12, 8), material, [0, 0.27, 1.6]);
  // Externally mounted items described in the same paper, visible in every layer.
  material = interiorPart("nose-sensors", "external-sensors", "METHAN sensor with the E-field sensor above (starboard nose)", "ICES-2023 p2", 0x6b7278, "exterior");
  mesh(new THREE.BoxGeometry(0.05, 0.07, 0.09), material, [0.455, -0.12, -1.66]);
  mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8), material, [0.455, 0.02, -1.66]);
  material = interiorPart("side-cameras", "cold-actuators", "Side camera suites: down camera, micro-imager, LED (under foam, both sides)", "ICES-2023 p2, fig. 3", 0xbfb8aa, "exterior");
  for (const side of [-1, 1]) mesh(new THREE.BoxGeometry(0.07, 0.12, 0.16), material, [side * 0.455, -0.24, 0.62]);
  material = interiorPart("drill-blower", "drills", "DrACO sample blower (behind the port forward arm)", "ICES-2023 p5, p7", 0x8c8f93, "exterior");
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), material, [-0.455, -0.2, -0.56]).rotation.z = Math.PI / 2;

  // Circulation loop (ICES-2023 p2-p3): MMRTG -> fan -> under-floor duct forward -> into the body
  // below the nose -> aft through the bay -> back into the MMRTG. Arrows move along it at a speed
  // that follows the fan's flow, colored from MMRTG-warm to bay-cool. A share of the flow set by
  // the trim flaps goes out through each side chimney's exposed cold duct and comes back cold.
  // The archived first version is in archive/airflow-arrows-v1.
  const airPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.05, 1.6), new THREE.Vector3(0, -0.1, 1.24), new THREE.Vector3(0, -0.3, 1.1),
    new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(0, -0.3, -1.3), new THREE.Vector3(0, -0.18, -1.47),
    new THREE.Vector3(0, -0.02, -1.25), new THREE.Vector3(0.05, -0.02, -0.5), new THREE.Vector3(0.05, 0.04, 0.3),
    new THREE.Vector3(0, 0.045, 0.95), new THREE.Vector3(0, 0.08, 1.3),
  ], true, "catmullrom", 0.2);
  // Bypass through each side's trim chimney (path illustrative [EST]): from the aft bay out to the
  // chimney, down the exposed cold duct, and back into the under-floor duct.
  const bypassPaths = [-1, 1].map((side) => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.03, 1.0), new THREE.Vector3(side * 0.25, 0.05, 0.7), new THREE.Vector3(side * 0.38, 0.03, 0.5),
    new THREE.Vector3(side * 0.4, -0.15, 0.43), new THREE.Vector3(side * 0.38, -0.3, 0.36), new THREE.Vector3(side * 0.18, -0.3, 0.15),
    new THREE.Vector3(0, -0.3, -0.05),
  ], false, "catmullrom", 0.3));
  subsystem("airflow", "warm-duct");
  subsystems.airflow.userData.layer = "interior";
  const arrowGeometry = new THREE.ConeGeometry(0.028, 0.08, 8);
  const mainArrows = new THREE.InstancedMesh(arrowGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }), 40);
  mainArrows.name = "warm-loop-arrows";
  const bypassPerSide = 10;
  const bypassArrows = new THREE.InstancedMesh(new THREE.ConeGeometry(0.034, 0.095, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), bypassPerSide * 2);
  bypassArrows.name = "cold-duct-arrows";
  // Drawn over the parts, as on a flow diagram, so the paths through boxes and chimneys show.
  for (const arrows of [mainArrows, bypassArrows]) {
    arrows.frustumCulled = false;
    arrows.material.depthTest = false;
    arrows.renderOrder = 5;
    buildTarget.add(arrows);
  }
  const warm = new THREE.Color(0xff6a2a), bay = new THREE.Color(0xffc45a), cold = new THREE.Color(0x58a8ff);
  const arrowColor = new THREE.Color(), arrowMatrix = new THREE.Matrix4(), arrowQuaternion = new THREE.Quaternion();
  const arrowPoint = new THREE.Vector3(), arrowTangent = new THREE.Vector3(), arrowScale = new THREE.Vector3(1, 1, 1);
  function placeArrow(arrows, index, curve, u) {
    curve.getPointAt(u, arrowPoint);
    curve.getTangentAt(u, arrowTangent);
    arrowQuaternion.setFromUnitVectors(upAxis, arrowTangent);
    arrows.setMatrixAt(index, arrowMatrix.compose(arrowPoint, arrowQuaternion, arrowScale));
  }
  let lastTime = null, mainPhase = 0, bypassPhase = 0;
  // state: gasFlow (kg/s; design 0.052) and effectiveTrim (0-0.4) from mission-systems.mjs. Arrows
  // are slowed for viewing: one lap of the loop takes about 12 s at full flow.
  function poseAirflow(time, state = {}) {
    const dt = lastTime === null ? 0 : Math.min(0.5, Math.max(0, time - lastTime));
    lastTime = time;
    const flow = Math.max(0, (state.gasFlow ?? 0.052) / 0.052);
    const trim = Math.max(0, Math.min(1, (state.effectiveTrim ?? 0) / 0.4));
    mainPhase = (mainPhase + dt * 0.08 * flow) % 1;
    bypassPhase = (bypassPhase + dt * 0.14 * flow) % 1;
    mainArrows.visible = flow > 0.02;
    for (let index = 0; index < mainArrows.count; index += 1) {
      const u = (index / mainArrows.count + mainPhase) % 1;
      placeArrow(mainArrows, index, airPath, u);
      // Warmest leaving the MMRTG, cooling as it gives up heat on the way round.
      mainArrows.setColorAt(index, arrowColor.copy(warm).lerp(bay, Math.min(1, u * 1.4)));
    }
    mainArrows.instanceMatrix.needsUpdate = true;
    mainArrows.instanceColor.needsUpdate = true;
    // Bypass: more arrows the further the flaps are open; they turn cold in the exposed duct.
    const perSide = flow > 0.02 ? Math.round(bypassPerSide * trim) : 0;
    bypassArrows.count = perSide * 2;
    bypassArrows.visible = perSide > 0;
    bypassPaths.forEach((curve, side) => {
      for (let k = 0; k < perSide; k += 1) {
        const index = side * perSide + k, u = (k / perSide + bypassPhase) % 1;
        placeArrow(bypassArrows, index, curve, u);
        bypassArrows.setColorAt(index, arrowColor.copy(warm).lerp(cold, Math.min(1, Math.max(0, (u - 0.35) / 0.3))));
      }
    });
    bypassArrows.instanceMatrix.needsUpdate = true;
    if (bypassArrows.instanceColor) bypassArrows.instanceColor.needsUpdate = true;
    // Flaps open with the trim setting.
    const angle = trim * 24 * Math.PI / 180;
    for (const { hinge, side } of trimFlaps) hinge.rotation.z = side * angle;
    return { flow, trim, bypassArrows: perSide * 2, flapDegrees: trim * 24 };
  }
  subsystem("sample-flow", "drills");
  subsystems["sample-flow"].userData.layer = "diagram";
  const sampleParticles = Array.from({ length: 8 }, (_, index) => {
    const particle = mesh(new THREE.SphereGeometry(0.022, 8, 6), sampleMarkerMaterial, [0, 0, 0]);
    particle.name = `sample-flow-${index}`;
    particle.renderOrder = 6;
    return particle;
  });
  function poseSampling(state, layer = "exterior") {
    const job = samplingSequence(state);
    // One redundant drill is illustrated; this is not a commanded flight-hardware port choice.
    drillFeeds.forEach((feed, index) => {
      feed.position.y = -0.72 - (index === 0 ? job.drillFeed : 0);
      feed.rotation.y = index === 0 ? job.drillAngle : 0;
    });
    carousel.carrier.rotation.y = job.carouselAngle;
    const diagram = layer === "internal";
    subsystems["sample-flow"].visible = diagram && job.id === "transfer";
    sampleParticles.forEach((particle, index) => {
      const u = ((job.elapsed - 10) / 2 + index / sampleParticles.length) % 1;
      particle.position.copy(transferPaths[0].getPointAt((u + 1) % 1));
    });
    cupMarker.visible = diagram && job.active && job.index >= 1;
    // Keep the receiving cup at the tube outlet before moving it toward analysis.
    const receivingAngle = -(state.science?.samples.length ?? 0) * Math.PI / 2;
    const inlet = carousel.inletWorld.clone().sub(carousel.assembly.position);
    cupMarker.position.copy(inlet.applyAxisAngle(upAxis, receivingAngle));
    analysisMarker.visible = diagram && job.id === "analysis";
    analysisMarker.scale.setScalar(1 + 0.12 * Math.sin(job.elapsed * Math.PI * 2));
    return job;
  }
  poseSampling({});
  kit.setTarget(null);
  return { researchRotors, researchAntenna, subsystems, labeledParts, poseAirflow, poseSampling, rotorDiscMaterial };
}
