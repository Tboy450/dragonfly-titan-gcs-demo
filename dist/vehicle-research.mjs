// NASA/APL 2023 Dragonfly design: exterior, interior parts and the air-flow arrows.
// Built into a group supplied by chase-vehicle.mjs, using its shared part helpers.
import * as THREE from "./vendor/three/three.module.min.js";
import { model } from "./flight-model.mjs?v=dev";

export function buildResearchModel(kit) {
  const { group: researchModel, mesh, strut, metal, deck, gold, bladeGeometry, bladeMaterial, trails, buildAntenna, upAxis } = kit;
  let buildTarget = researchModel;
  const setBuild = (group) => { buildTarget = group; kit.setTarget(group); };
  // ---- Research model: NASA/APL 2023 lander overview (TFAWS 2023 slide 3; ICES-2020-160 and
  // ICES-2023-389 figure 1). Published: 3.85 x 3.85 x 1.75 m envelope; eight 1.35 m three-blade
  // rotors in four coaxial pairs on side arms, disks R/2 apart; long fuselage with a raised
  // "attic" behind the nose; MMRTG (64 cm across the fins, 66 cm long) at the tail between two
  // stabilizing fins; 0.874 m HGA disc on top plus LGA and MGA; two skids on legs with a drill on
  // each skid. Exact proportions and colors are estimated from the drawings.
  setBuild(researchModel);
  const researchRotors = [];
  const foam = new THREE.MeshStandardMaterial({ color: 0xdcd3c1, metalness: 0.04, roughness: 0.82 });
  const foamSeam = new THREE.MeshStandardMaterial({ color: 0xaea593, metalness: 0.05, roughness: 0.9 });
  const finMaterial = new THREE.MeshStandardMaterial({ color: 0xb39a48, metalness: 0.35, roughness: 0.5 });
  const rtgMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3135, metalness: 0.55, roughness: 0.45 });
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xc9ccc6, metalness: 0.35, roughness: 0.5 });
  const lens = new THREE.MeshStandardMaterial({ color: 0x0b1318, metalness: 0.6, roughness: 0.15 });

  function taper(from, to, radiusFrom, radiusTo, material) {
    const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const part = mesh(new THREE.CylinderGeometry(radiusTo, radiusFrom, direction.length(), 14), material, start.clone().add(end).multiplyScalar(0.5).toArray());
    part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return part;
  }

  // A side profile (z forward-negative, y up) extruded across the width with rounded edges.
  function profileBody(points, width, material, bevel = 0.05) {
    const outline = new THREE.Shape();
    points.forEach(([z, y], index) => (index ? outline.lineTo(z, y) : outline.moveTo(z, y)));
    outline.closePath();
    const geometry = new THREE.ExtrudeGeometry(outline, {
      depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 8,
    });
    geometry.rotateY(-Math.PI / 2);
    geometry.translate((width - 2 * bevel) / 2, 0, 0);
    return mesh(geometry, material, [0, 0, 0]);
  }

  // Named subsystems prepare the model for the planned Mission-view layers (exterior, thermal,
  // internal parts; see RESEARCH-COMPENDIUM.md "Future update requests"). Each group records the
  // thermal zone a thermal view would color it by, so layers can restyle or hide whole systems.
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
  // Attic: the big rounded enclosure over the front of the fuselage.
  subsystem("attic", "insulated-shell");
  profileBody([[-1.88, 0.06], [-1.80, 0.38], [-1.58, 0.50], [-0.82, 0.50], [-0.70, 0.38], [-0.70, 0.06]], 0.84, foam, 0.08);
  const atticPanel = mesh(new THREE.BoxGeometry(0.34, 0.015, 0.42), foamSeam, [0.16, 0.585, -1.5]);
  atticPanel.rotation.x = 0.22;
  subsystem("fuselage", "insulated-shell");
  for (const z of [-0.45, 0.2, 0.84]) mesh(new THREE.BoxGeometry(0.875, 0.5, 0.018), foamSeam, [0, -0.13, z]);
  subsystem("navigation-sensors", "external-sensors");
  for (const x of [-0.22, 0, 0.22]) {
    const camera = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 14), lens, [x, -0.1, -1.97]);
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
  const finGeometry = new THREE.ExtrudeGeometry(finOutline, { depth: 0.025, bevelEnabled: false, curveSegments: 8 });
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

  // Thick skids ~1.55 m apart on legs that drop from the arm roots, with a DrACO drill on each.
  const armRoots = [-0.75, 0.84];
  for (const side of [-1, 1]) {
    subsystem("landing-gear", "exterior-structure");
    const skidX = side * 0.75;
    strut([skidX, -0.8, -1.3], [skidX, -0.8, 1.02], 0.06, deck);
    strut([skidX, -0.8, -1.3], [skidX, -0.7, -1.45], 0.05, deck);
    strut([skidX, -0.8, 1.02], [skidX, -0.72, 1.14], 0.05, deck);
    for (const z of armRoots) {
      strut([side * 0.42, -0.3, z], [skidX, -0.76, z], 0.035);
      strut([side * 0.42, -0.34, z - Math.sign(z) * 0.35], [skidX, -0.76, z], 0.018);
    }
    subsystem("drills", "drills");
    mesh(new THREE.BoxGeometry(0.12, 0.1, 0.2), metal, [skidX, -0.7, -0.15]);
    mesh(new THREE.CylinderGeometry(0.02, 0.012, 0.1, 8), metal, [skidX, -0.8, -0.15]);
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
      taper(root, fairingEnd, 0.1, 0.065, armMaterial);
      strut(fairingEnd, hub, 0.06, armMaterial);
      subsystem("motors", "motors");
      mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.44, 16), armMaterial, hub);
      for (let layer = 0; layer < 2; layer += 1) {
        const y = layer === 0 ? -0.16 : 0.20;
        subsystem("motors", "motors");
        mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), gold, [x, y + (layer === 0 ? -0.025 : 0.025), z]);
        subsystem("rotors", "rotors");
        const rotor = new THREE.Group();
        rotor.position.set(x, y, z);
        rotor.scale.setScalar(researchBladeScale);
        buildTarget.add(rotor);
        const direction = layer === 0 ? 1 : -1;
        for (let blade = 0; blade < model.bladesPerRotor; blade += 1) {
          const solid = mesh(bladeGeometry, bladeMaterial, [0, 0, 0], rotor);
          solid.rotation.y = blade * Math.PI * 2 / model.bladesPerRotor;
          trails.forEach((material, trailIndex) => {
            const ghost = mesh(bladeGeometry, material, [0, 0, 0], rotor);
            ghost.rotation.y = blade * Math.PI * 2 / model.bladesPerRotor - direction * (trailIndex + 1) * 0.13;
          });
        }
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
  let material = interiorPart("nose-bulkhead", "equipment-bay", "Nose bulkhead", "ICES-2023 p7, fig. 3", 0x9aa6ad);
  mesh(new THREE.BoxGeometry(0.7, 0.4, 0.02), material, [0, -0.13, -1.56]);
  material = interiorPart("nose-cameras-inside", "nose-cameras", "Navigation and forward cameras (no active airflow)", "ICES-2023 p7, fig. 3", 0x3d4a52);
  for (const x of [-0.22, 0, 0.22]) mesh(new THREE.BoxGeometry(0.09, 0.09, 0.12), material, [x, -0.1, -1.8]);
  material = interiorPart("nose-electronics", "nose-electronics", "IMUs and lidar electronics (FEB, MEB)", "ICES-2023 p7 (base of the nose), fig. 4", 0x5f8fa3);
  mesh(new THREE.BoxGeometry(0.22, 0.12, 0.2), material, [-0.15, -0.26, -1.36]);
  mesh(new THREE.BoxGeometry(0.14, 0.1, 0.14), material, [0.07, -0.27, -1.38]);
  mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), material, [0.25, -0.28, -1.42]);
  mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), material, [0.25, -0.28, -1.28]);
  material = interiorPart("sample-carousel", "cold-attic", "Cold attic: DrACO sample carousel", "ICES-2023 p2, p7, fig. 3", 0x7fb3c9);
  mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 28), material, [0, 0.18, -1.52]);
  for (let i = 0; i < 8; i += 1) {
    const angle = i / 8 * Math.PI * 2;
    mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 10), material, [Math.cos(angle) * 0.11, 0.23, -1.52 + Math.sin(angle) * 0.11]);
  }
  material = interiorPart("wonderwall", "cold-attic", "Wonderwall: insulation keeping >100 C between carousel and DraMS", "ICES-2023 p7", 0xe6e0d0);
  mesh(new THREE.BoxGeometry(0.72, 0.38, 0.05), material, [0, 0.28, -1.3]);
  material = interiorPart("drams", "equipment-bay", "Warm attic: DraMS mass spectrometer and laser (with fan)", "ICES-2023 p2, p7", 0xb58a4a);
  mesh(new THREE.BoxGeometry(0.22, 0.2, 0.18), material, [0.08, 0.2, -1.16]);
  mesh(new THREE.BoxGeometry(0.14, 0.1, 0.3), material, [-0.2, 0.18, -1.0]);
  mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12), material, [-0.2, 0.245, -0.9]);
  mesh(new THREE.BoxGeometry(0.3, 0.18, 0.22), material, [0.06, 0.18, -0.92]);
  material = interiorPart("rde", "rde", "Rotorcraft drive electronics (2 boxes)", "ICES-2023 p5, p7, fig. 4", 0xa34d4d);
  for (const x of [-0.16, 0.16]) mesh(new THREE.BoxGeometry(0.24, 0.22, 0.26), material, [x, -0.18, -0.55]);
  material = interiorPart("hga-actuators", "cold-actuators", "HGA azimuth/elevation actuators", "ICES-2023 p2, fig. 3", 0x4f7fd1);
  mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20), material, [0, 0.035, -0.36]);
  mesh(new THREE.BoxGeometry(0.1, 0.07, 0.12), material, [0, -0.02, -0.36]);
  material = interiorPart("avionics", "equipment-bay", "Avionics, power and radio boxes (PSUs, DPUs, radio)", "ICES-2023 p7, fig. 4", 0x4f9a8f);
  mesh(new THREE.BoxGeometry(0.2, 0.22, 0.26), material, [-0.22, -0.18, -0.2]);
  mesh(new THREE.BoxGeometry(0.2, 0.22, 0.22), material, [-0.22, -0.18, 0.12]);
  mesh(new THREE.BoxGeometry(0.22, 0.18, 0.3), material, [0.2, -0.2, -0.12]);
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
  material = interiorPart("trim-chimneys", "trim-device", "Trim device: 43 x 34 cm chimney on each side", "ICES-2023 p7, fig. 1", 0xb04a9a);
  for (const side of [-1, 1]) mesh(new THREE.BoxGeometry(0.025, 0.43, 0.34), material, [side * 0.44, -0.13, 0.45]);
  // Externally mounted items described in the same paper, visible in every layer.
  material = interiorPart("nose-sensors", "external-sensors", "METHAN sensor with the E-field sensor above (starboard nose)", "ICES-2023 p2", 0x6b7278, "exterior");
  mesh(new THREE.BoxGeometry(0.05, 0.07, 0.09), material, [0.455, -0.12, -1.66]);
  mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8), material, [0.455, 0.02, -1.66]);
  material = interiorPart("side-cameras", "cold-actuators", "Side camera suites: down camera, micro-imager, LED (under foam, both sides)", "ICES-2023 p2, fig. 3", 0xbfb8aa, "exterior");
  for (const side of [-1, 1]) mesh(new THREE.BoxGeometry(0.07, 0.12, 0.16), material, [side * 0.455, -0.24, 0.62]);
  material = interiorPart("drill-blower", "drills", "DrACO sample blower (behind the port forward arm)", "ICES-2023 p5, p7", 0x8c8f93, "exterior");
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), material, [-0.455, -0.2, -0.56]).rotation.z = Math.PI / 2;

  // Circulation loop (ICES-2023 p2-p3): MMRTG -> fan -> under-floor duct forward -> into the body
  // below the nose -> aft through the bay -> back into the MMRTG. Arrows move along it.
  const airPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.05, 1.6), new THREE.Vector3(0, -0.1, 1.24), new THREE.Vector3(0, -0.3, 1.1),
    new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(0, -0.3, -1.3), new THREE.Vector3(0, -0.18, -1.47),
    new THREE.Vector3(0, -0.02, -1.25), new THREE.Vector3(0.05, -0.02, -0.5), new THREE.Vector3(0.05, 0.04, 0.3),
    new THREE.Vector3(0, 0.045, 0.95), new THREE.Vector3(0, 0.08, 1.3),
  ], true, "catmullrom", 0.2);
  subsystem("airflow", "warm-duct");
  subsystems.airflow.userData.layer = "interior";
  const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffa64d });
  const airArrows = Array.from({ length: 26 }, () => mesh(new THREE.ConeGeometry(0.03, 0.08, 8), arrowMaterial, [0, 0, 0]));
  const arrowTangent = new THREE.Vector3();
  function poseAirflow(time) {
    airArrows.forEach((arrow, index) => {
      const u = (index / airArrows.length + time * 0.05) % 1;
      airPath.getPointAt(u, arrow.position);
      airPath.getTangentAt(u, arrowTangent);
      arrow.quaternion.setFromUnitVectors(upAxis, arrowTangent);
    });
  }
  kit.setTarget(null);
  return { researchRotors, researchAntenna, subsystems, labeledParts, poseAirflow };
}
