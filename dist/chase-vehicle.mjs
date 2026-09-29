import * as THREE from "./vendor/three/three.module.min.js";
import { cameraPose } from "./flight-camera.mjs?v=dev";
import { createTitanTerrain, terrainHeight } from "./titan-terrain.mjs?v=dev";
import { model } from "./flight-model.mjs?v=dev";
import { missionTarget, systemsModel } from "./mission-systems.mjs?v=dev";

// options.renderer lets tests drive the full scene without a GPU.
export function createChaseRenderer(options = {}) {
  const renderer = options.renderer || new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 12000);
  const missionCamera = new THREE.OrthographicCamera(-4, 4, 3, -3, 0.1, 30);
  const landscape = createTitanTerrain(scene, renderer);
  const craft = new THREE.Group();
  scene.add(craft);
  // Titan: surface light is ~1/1,000 of Earth's, mostly haze-scattered and red/orange, so the sky
  // dome dominates and direct sunlight casts only faint shadows. Colors and intensities are an
  // artistic rendering of that (kept bright enough to read on a phone), not a radiometric model.
  const titanSky = new THREE.Color(0xe3a65e), titanGround = new THREE.Color(0x4d3522);
  const neutralSky = new THREE.Color(0xfff3de), neutralGround = new THREE.Color(0x645045);
  const titanSun = new THREE.Color(0xffc98c), neutralSun = new THREE.Color(0xffeed6);
  const ambient = new THREE.HemisphereLight(titanSky, titanGround, 2.2);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(titanSun, 1);
  sun.position.set(-4, 7, -3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 260 });
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.00015;
  scene.add(sun);
  scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0xdbe8f3, 0);
  fill.position.set(4, 2, 5);
  scene.add(fill);

  const metal = new THREE.MeshStandardMaterial({ color: 0x909b9e, metalness: 0.58, roughness: 0.4 });
  const shell = new THREE.MeshStandardMaterial({ color: 0xd1d6d2, metalness: 0.42, roughness: 0.38 });
  const deck = new THREE.MeshStandardMaterial({ color: 0x343e43, metalness: 0.38, roughness: 0.55 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc79e47, metalness: 0.55, roughness: 0.42 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x101c23, metalness: 0.25, roughness: 0.3 });
  const rotors = [];
  // Two switchable vehicle models share the same flight state, rotor speeds and antenna pose:
  // the original demo model and one built from the 2023 NASA/APL lander overview drawings.
  const classicModel = new THREE.Group();
  classicModel.name = "original-model";
  const researchModel = new THREE.Group();
  researchModel.name = "research-model";
  craft.add(classicModel, researchModel);
  let buildTarget = classicModel;

  function mesh(geometry, material, position, parent = buildTarget) {
    const part = new THREE.Mesh(geometry, material);
    part.castShadow = !material.transparent;
    part.receiveShadow = true;
    part.position.set(...position);
    parent.add(part);
    return part;
  }

  function box(width, height, length, position, material = metal) {
    return mesh(new THREE.BoxGeometry(width, height, length), material, position);
  }

  function strut(from, to, radius = 0.026, material = metal) {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const part = mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 10), material, start.add(end).multiplyScalar(0.5).toArray());
    part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return part;
  }

  // The raised rounded enclosure occupies only the forward third of the deck.
  box(1.03, 0.32, 2.2, [0, 0, 0], metal);
  box(1.01, 0.04, 1.42, [0, 0.18, 0.38], deck);
  const cabProfile = new THREE.Shape();
  cabProfile.moveTo(-0.53, -0.13);
  cabProfile.lineTo(-0.53, 0.36);
  cabProfile.quadraticCurveTo(-0.53, 0.77, 0, 0.77);
  cabProfile.quadraticCurveTo(0.53, 0.77, 0.53, 0.36);
  cabProfile.lineTo(0.53, -0.13);
  cabProfile.closePath();
  const cab = new THREE.ExtrudeGeometry(cabProfile, {
    depth: 0.56, bevelEnabled: true, bevelThickness: 0.09,
    bevelSize: 0.075, bevelSegments: 4, steps: 1, curveSegments: 16,
  });
  mesh(cab, shell, [0, 0, -1.06]);
  for (const side of [-1, 1]) {
    box(0.025, 0.036, 2.12, [side * 0.52, 0.17, 0], gold);
    box(0.025, 0.025, 2.1, [side * 0.52, -0.16, 0], gold);
    for (const z of [-0.2, 0.27, 0.76]) {
      box(0.015, 0.23, 0.012, [side * 0.526, 0, z], dark);
      box(0.016, 0.07, 0.16, [side * 0.536, 0.02, z + 0.12], gold);
      for (const y of [-0.105, 0.12]) {
        mesh(new THREE.SphereGeometry(0.012, 6, 4), shell, [side * 0.539, y, z + 0.04]);
      }
    }
    const sensor = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.035, 20), dark, [side * 0.31, 0.06, -1.164]);
    sensor.rotation.x = Math.PI / 2;
    box(0.17, 0.045, 0.27, [side * 0.26, 0.22, 0.75], deck);

    const skidX = side * 0.77;
    strut([skidX, -0.71, -1.24], [skidX, -0.83, -1.07], 0.041);
    strut([skidX, -0.83, -1.07], [skidX, -0.83, 1.17], 0.041);
    strut([skidX, -0.83, 1.17], [skidX, -0.73, 1.31], 0.041);
    for (const z of [-0.65, 0.7]) {
      strut([side * 0.43, -0.12, z], [skidX, -0.81, z + 0.07], 0.034);
    }
  }
  strut([-0.76, -0.66, 0.55], [0.76, -0.66, 0.55], 0.025);
  box(0.23, 0.15, 0.21, [0, -0.26, -0.25], dark);
  // Seen from Titan, Earth stays within ~6 deg of the Sun, so a raised dish aims along the sunlight.
  const earthDirection = new THREE.Vector3(-65, 115, -45).normalize();
  const upAxis = new THREE.Vector3(0, 1, 0), aimLocal = new THREE.Vector3();
  const aimQuaternion = new THREE.Quaternion(), stowedQuaternion = new THREE.Quaternion(), craftInverse = new THREE.Quaternion();
  // High-gain antenna on its motorized arm: stowed low for flight, raised and aimed for downlink.
  function buildAntenna(position, stowedLength, raise, radius = 0.035) {
    const base = new THREE.Group();
    base.position.set(...position);
    buildTarget.add(base);
    const arm = mesh(new THREE.CylinderGeometry(radius, radius, 1, 10), metal, [0, stowedLength / 2, 0], base);
    const head = new THREE.Group();
    base.add(head);
    const pose = (deployed) => {
      const t = deployed * deployed * (3 - 2 * deployed);
      const length = stowedLength + raise * t;
      arm.scale.y = Math.max(0.001, length);
      arm.position.y = length / 2;
      head.position.y = length;
      craftInverse.copy(craft.quaternion).invert();
      aimLocal.copy(earthDirection).applyQuaternion(craftInverse);
      aimQuaternion.setFromUnitVectors(upAxis, aimLocal);
      head.quaternion.slerpQuaternions(stowedQuaternion, aimQuaternion, t);
    };
    return { head, pose };
  }
  const classicAntenna = buildAntenna([0.06, 0.18, 0.35], 0.28, 0.62);
  const dish = mesh(new THREE.SphereGeometry(0.32, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), shell, [0, 0, 0], classicAntenna.head);
  dish.scale.y = 0.23;
  const dishRim = mesh(new THREE.TorusGeometry(0.32, 0.014, 8, 32), metal, [0, 0, 0], classicAntenna.head);
  dishRim.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), gold, [0, 0.1, 0], classicAntenna.head);

  const blade = new THREE.Shape();
  blade.moveTo(0.07, -0.055);
  blade.lineTo(0.69, -0.025);
  blade.lineTo(0.70, 0.02);
  blade.lineTo(0.17, 0.115);
  blade.closePath();
  const bladeGeometry = new THREE.ShapeGeometry(blade);
  bladeGeometry.rotateX(-Math.PI / 2);
  const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xb6bdb6, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide });
  const trails = Array.from({ length: 6 }, (_, index) => new THREE.MeshBasicMaterial({
    color: 0xd9d1b5, transparent: true, opacity: 0.10 * (1 - index / 7),
    depthWrite: false, side: THREE.DoubleSide,
  }));
  for (const x of [-1.24, 1.24]) {
    for (const z of [-0.76, 0.81]) {
      strut([Math.sign(x) * 0.45, 0.08, z * 0.8], [x, 0.32, z], 0.042);
      strut([Math.sign(x) * 0.42, -0.08, z * 0.45], [x, 0.26, z], 0.02);
      strut([x, 0.12, z], [x, 0.77, z], 0.045);
      for (let layer = 0; layer < 2; layer += 1) {
        const y = layer === 0 ? 0.22 : 0.70;
        mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 16), metal, [x, y, z]);
        const rotor = new THREE.Group();
        rotor.position.set(x, y, z);
        buildTarget.add(rotor);
        const direction = layer === 0 ? 1 : -1;
        for (let half = 0; half < model.bladesPerRotor; half += 1) {
          const solid = mesh(bladeGeometry, bladeMaterial, [0, 0, 0], rotor);
          solid.rotation.y = half * Math.PI * 2 / model.bladesPerRotor;
          trails.forEach((material, index) => {
            const ghost = mesh(bladeGeometry, material, [0, 0, 0], rotor);
            ghost.rotation.y = half * Math.PI * 2 / model.bladesPerRotor - direction * (index + 1) * 0.13;
          });
        }
        rotors.push({ rotor, direction, phase: rotors.length * 0.63 });
      }
    }
  }

  // ---- Research model: NASA/APL 2023 lander overview (TFAWS 2023 slide 3; ICES-2020-160 and
  // ICES-2023-389 figure 1). Published: 3.85 x 3.85 x 1.75 m envelope; eight 1.35 m three-blade
  // rotors in four coaxial pairs on side arms, disks R/2 apart; long fuselage with a raised
  // "attic" behind the nose; MMRTG (64 cm across the fins, 66 cm long) at the tail between two
  // stabilizing fins; 0.874 m HGA disc on top plus LGA and MGA; two skids on legs with a drill on
  // each skid. Exact proportions and colors are estimated from the drawings.
  buildTarget = researchModel;
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
    buildTarget = subsystems[name];
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
  buildTarget = classicModel;

  // ---- Entry, descent and landing hardware for the arrival sequence (timeline in edl.mjs) ----
  // 4.5 m, 60-degree sphere-cone aeroshell; 8.25 m drogue and 16.7 m main parachutes [PUB].
  // Colors, riser lengths and the bridle geometry are illustrative.
  const edlGroup = new THREE.Group();
  edlGroup.visible = false;
  scene.add(edlGroup);
  const shellWhite = new THREE.MeshStandardMaterial({ color: 0xd9d4ca, metalness: 0.15, roughness: 0.65 });
  const shieldBrown = new THREE.MeshStandardMaterial({ color: 0x3b2b21, metalness: 0.1, roughness: 0.85 });
  const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0xf1e7d2, roughness: 0.9, side: THREE.DoubleSide });
  const canopyBand = new THREE.MeshStandardMaterial({ color: 0xc8643a, roughness: 0.9, side: THREE.DoubleSide });
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x8f8574 });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const unitLine = new THREE.CylinderGeometry(1, 1, 1, 6);
  function line(parent, radius = 0.015) {
    const part = new THREE.Mesh(unitLine, lineMaterial);
    part.scale.set(radius, 1, radius);
    parent.add(part);
    return part;
  }
  const lineStart = new THREE.Vector3(), lineEnd = new THREE.Vector3(), lineAxis = new THREE.Vector3();
  function stretch(part, from, to, radius = 0.015) {
    lineAxis.subVectors(to, from);
    part.position.addVectors(from, to).multiplyScalar(0.5);
    part.scale.set(radius, Math.max(0.001, lineAxis.length()), radius);
    part.quaternion.setFromUnitVectors(upAxis, lineAxis.normalize());
  }
  // The backshell, parachutes and their lines move together; the origin is the backshell rim.
  const backshellAssembly = new THREE.Group();
  edlGroup.add(backshellAssembly);
  const backshell = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 2.25, 1.9, 48), shellWhite);
  backshell.position.y = 0.95;
  backshellAssembly.add(backshell);
  function parachute(radius, riser) {
    const group = new THREE.Group();
    const opening = Math.PI * 0.42;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 10, 0, Math.PI * 2, 0, opening), canopyMaterial);
    dome.position.y = riser;
    group.add(dome);
    const band = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.002, 32, 3, 0, Math.PI * 2, opening * 0.72, opening * 0.14), canopyBand);
    band.position.y = riser;
    group.add(band);
    const apex = new THREE.Vector3(0, 1.9, 0);
    for (let i = 0; i < 16; i += 1) {
      const angle = i / 16 * Math.PI * 2;
      const rim = new THREE.Vector3(Math.cos(angle) * radius * Math.sin(opening), riser + radius * Math.cos(opening), Math.sin(angle) * radius * Math.sin(opening));
      stretch(line(group, 0.012), apex, rim, 0.012);
    }
    backshellAssembly.add(group);
    return group;
  }
  const drogueChute = parachute(4.125, 14);
  const mainChute = parachute(8.35, 26);
  const heatShield = new THREE.Mesh(new THREE.ConeGeometry(2.25, 1.3, 48), shieldBrown);
  heatShield.rotation.x = Math.PI;
  edlGroup.add(heatShield);
  const entryGlow = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), glowMaterial);
  entryGlow.scale.set(3.3, 1.7, 3.3);
  edlGroup.add(entryGlow);
  const bridles = [0, 1, 2].map(() => line(edlGroup, 0.014));
  const shieldFall = new THREE.Vector3();

  function poseArrival(e) {
    edlGroup.visible = !!e;
    // The lander is enclosed in the aeroshell until it is lowered out for the pose.
    craft.visible = !e || e.pose > 0.01;
    if (!e) return;
    const lander = craft.position;
    // Posed: the lander hangs below the backshell. Released: the backshell and chute drift up and away.
    const rise = 4.5 * e.pose + (e.released ? e.separation * 2.6 : 0);
    const drift = e.released ? e.separation * 3.4 : 0;
    backshellAssembly.visible = e.separation < 14;
    backshellAssembly.position.set(lander.x - drift, lander.y - 0.3 + rise, lander.z + drift * 0.4);
    backshellAssembly.rotation.y = craft.rotation.y;
    drogueChute.visible = e.chute === "drogue";
    mainChute.visible = e.chute === "main";
    const open = Math.max(0.04, e.chuteOpen);
    (e.chute === "main" ? mainChute : drogueChute).scale.set(open, 0.35 + 0.65 * open, open);
    const fall = 0.5 * 5 * e.heatShieldDrop ** 2;
    heatShield.visible = e.heatShieldDrop < 5;
    shieldFall.set(lander.x, lander.y - 0.95 - fall, lander.z);
    heatShield.position.copy(shieldFall);
    entryGlow.visible = e.glow > 0.01;
    entryGlow.position.set(lander.x, lander.y - 1.6, lander.z);
    glowMaterial.opacity = 0.55 * e.glow;
    const hanging = e.pose > 0.02 && !e.released;
    bridles.forEach((bridle, index) => {
      bridle.visible = hanging;
      if (!hanging) return;
      const angle = index / 3 * Math.PI * 2 + craft.rotation.y;
      lineStart.set(backshellAssembly.position.x + Math.cos(angle) * 0.9, backshellAssembly.position.y, backshellAssembly.position.z + Math.sin(angle) * 0.9);
      lineEnd.set(lander.x + Math.cos(angle) * 0.2, lander.y + 0.2, lander.z + Math.sin(angle) * 0.2);
      stretch(bridle, lineStart, lineEnd, 0.014);
    });
  }

  let width = 0;
  let height = 0;
  let renderView = "";
  function setAttitude(state) {
    craft.rotation.set(-state.pitch * model.pitchRadians, -state.heading * Math.PI / 180, -state.roll * model.rollRadians, "YXZ");
    craft.updateMatrix();
    const research = state.vehicleModel !== "original";
    researchModel.visible = research;
    classicModel.visible = !research;
    (research ? researchAntenna : classicAntenna).pose(state.antennaDeploy || 0);
    (research ? researchRotors : rotors).forEach(({ rotor, phase }, index) => {
      rotor.rotation.y = (state.rotorPhase?.[index] || 0) + phase;
    });
    const blur = Math.min(1, (state.rotorRpm?.[0] || 0) / 700);
    trails.forEach((material, index) => { material.opacity = 0.10 * (1 - index / 7) * blur; });
  }
  return {
    models: { original: classicModel, research: researchModel },
    subsystems,
    drawMission(ctx, w, h, state) {
      if (w !== width || h !== height || renderView !== "mission") {
        renderer.setSize(w, h, false);
        width = w;
        height = h;
        renderView = "mission";
      }
      const background = scene.background, fog = scene.fog;
      scene.background = null;
      scene.fog = null;
      // The mission view is a neutral engineering portrait of the vehicle, not a Titan scene.
      ambient.color.copy(neutralSky); ambient.groundColor.copy(neutralGround); sun.color.copy(neutralSun);
      ambient.intensity = 2.5;
      sun.intensity = 3.2;
      fill.intensity = 1.4;
      landscape.group.visible = false;
      edlGroup.visible = false;
      craft.visible = true;
      renderer.shadowMap.enabled = false;
      craft.position.set(0, 0, 0);
      setAttitude(state);
      sun.position.set(-4, 7, -3);
      sun.target.position.set(0, 0, 0);
      const halfHeight = Math.max(3.4, 3.0 * h / w);
      Object.assign(missionCamera, { left: -halfHeight * w / h, right: halfHeight * w / h, top: halfHeight, bottom: -halfHeight });
      missionCamera.position.set(0, 8, 3.5);
      missionCamera.lookAt(0, 0, 0);
      missionCamera.updateProjectionMatrix();
      renderer.render(scene, missionCamera);
      ctx.drawImage(renderer.domElement, 0, 0, w, h);
      landscape.group.visible = true;
      ambient.color.copy(titanSky); ambient.groundColor.copy(titanGround); sun.color.copy(titanSun);
      fill.intensity = 0;
      scene.background = background;
      scene.fog = fog;
      renderer.shadowMap.enabled = true;
    },
    draw(ctx, w, h, state) {
      if (w !== width || h !== height || renderView !== "pilot") {
        renderView = "pilot";
        width = w;
        height = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const flightBottom = h - (w <= 720 ? 235 : Math.min(300, h * 0.4));
        const centerY = (58 + Math.max(138, flightBottom)) / 2;
        camera.setViewOffset(w, h, 0, h / 2 - centerY, w, h);
        camera.updateProjectionMatrix();
      }
      setAttitude(state);
      const pose = state.renderPose || cameraPose(state);
      const x = state.positionX || 0;
      const z = state.positionZ || 0;
      landscape.update(x, z);
      landscape.updateSites(state.scoutedSites || []);
      const target = missionTarget(state);
      const marker = landscape.group.getObjectByName("survey-marker");
      marker.visible = state.mission.phase !== "idle";
      marker.position.set(target.x, landscape.heightAt(target.x, target.z) + 0.08, target.z);
      const sunlight = Math.max(0, Math.cos((state.elapsed || 0) / systemsModel.titanDaySeconds * Math.PI * 2));
      // Day: bright orange sky dome, weak direct beam. Night: faint, dim sky (kept visible for play).
      ambient.intensity = 0.35 + sunlight * 1.85;
      sun.intensity = 0.02 + sunlight * 0.95;
      landscape.setDaylight(sunlight, state.edl?.space || 0);
      const altitude = Math.max(0, state.altitude || 0);
      // Aloft, follow the smooth analytic terrain so mesh re-centering never shifts the aircraft;
      // near touchdown, blend onto the rendered triangles so the skids meet the visible ground.
      const meshGround = landscape.heightAt(x, z);
      const groundY = meshGround + (terrainHeight(x, z) - meshGround) * Math.min(1, altitude / 8);
      craft.position.set(x, groundY + altitude + 0.86, z);
      sun.position.set(x - 65, groundY + 115, z - 45);
      sun.target.position.set(x, groundY, z);
      const availableHeight = w <= 720 ? Math.max(100, h - 293) : h;
      const baseDistance = Math.max(11.7, 6.4 / camera.aspect, h / availableHeight * 5.5);
      // During the arrival sequence the camera pulls back to frame the aeroshell and parachutes.
      const distance = state.edl ? Math.max(baseDistance, state.edl.cameraDistance) : baseDistance;
      const lookAt = craft.position.clone();
      if (state.edl) lookAt.y += state.edl.lookUp;
      camera.position.set(
        x + Math.sin(pose.azimuth) * Math.cos(pose.elevation) * distance,
        lookAt.y + Math.sin(pose.elevation) * distance,
        z + Math.cos(pose.azimuth) * Math.cos(pose.elevation) * distance,
      );
      camera.position.y = Math.max(camera.position.y, landscape.heightAt(camera.position.x, camera.position.z) + 0.3);
      camera.lookAt(lookAt);
      poseArrival(state.edl);
      renderer.render(scene, camera);
      ctx.drawImage(renderer.domElement, 0, 0, w, h);
    },
  };
}
