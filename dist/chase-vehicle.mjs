import * as THREE from "./vendor/three/three.module.min.js";
import { cameraPose } from "./flight-camera.mjs?v=dev";
import { createTitanTerrain, terrainHeight } from "./titan-terrain.mjs?v=dev";
import { model } from "./flight-model.mjs?v=dev";
import { missionTarget, systemsModel } from "./mission-systems.mjs?v=dev";

export function createChaseRenderer() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

  function mesh(geometry, material, position, parent = craft) {
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
  // High-gain antenna on its motorized arm: stowed low for flight, raised and aimed for downlink.
  const hgaBase = new THREE.Group();
  hgaBase.position.set(0.06, 0.18, 0.35);
  craft.add(hgaBase);
  const hgaArm = mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 10), metal, [0, 0.14, 0], hgaBase);
  const hgaHead = new THREE.Group();
  hgaBase.add(hgaHead);
  const dish = mesh(new THREE.SphereGeometry(0.32, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), shell, [0, 0, 0], hgaHead);
  dish.scale.y = 0.23;
  const dishRim = mesh(new THREE.TorusGeometry(0.32, 0.014, 8, 32), metal, [0, 0, 0], hgaHead);
  dishRim.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), gold, [0, 0.1, 0], hgaHead);
  // Seen from Titan, Earth stays within ~6 deg of the Sun, so the dish aims along the sunlight.
  const earthDirection = new THREE.Vector3(-65, 115, -45).normalize();
  const upAxis = new THREE.Vector3(0, 1, 0), aimLocal = new THREE.Vector3();
  const aimQuaternion = new THREE.Quaternion(), stowedQuaternion = new THREE.Quaternion(), craftInverse = new THREE.Quaternion();
  function poseAntenna(deployed) {
    const t = deployed * deployed * (3 - 2 * deployed);
    const length = 0.28 + 0.62 * t;
    hgaArm.scale.y = length;
    hgaArm.position.y = length / 2;
    hgaHead.position.y = length;
    craftInverse.copy(craft.quaternion).invert();
    aimLocal.copy(earthDirection).applyQuaternion(craftInverse);
    aimQuaternion.setFromUnitVectors(upAxis, aimLocal);
    hgaHead.quaternion.slerpQuaternions(stowedQuaternion, aimQuaternion, t);
  }

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
        craft.add(rotor);
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

  let width = 0;
  let height = 0;
  let renderView = "";
  function setAttitude(state) {
    craft.rotation.set(-state.pitch * model.pitchRadians, -state.heading * Math.PI / 180, -state.roll * model.rollRadians, "YXZ");
    poseAntenna(state.antennaDeploy || 0);
    rotors.forEach(({ rotor, phase }, index) => {
      rotor.rotation.y = (state.rotorPhase?.[index] || 0) + phase;
    });
    const blur = Math.min(1, (state.rotorRpm?.[0] || 0) / 700);
    trails.forEach((material, index) => { material.opacity = 0.10 * (1 - index / 7) * blur; });
  }
  return {
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
      landscape.setDaylight(sunlight);
      const altitude = Math.max(0, state.altitude || 0);
      // Aloft, follow the smooth analytic terrain so mesh re-centering never shifts the aircraft;
      // near touchdown, blend onto the rendered triangles so the skids meet the visible ground.
      const meshGround = landscape.heightAt(x, z);
      const groundY = meshGround + (terrainHeight(x, z) - meshGround) * Math.min(1, altitude / 8);
      craft.position.set(x, groundY + altitude + 0.86, z);
      sun.position.set(x - 65, groundY + 115, z - 45);
      sun.target.position.set(x, groundY, z);
      const availableHeight = w <= 720 ? Math.max(100, h - 293) : h;
      const distance = Math.max(11.7, 6.4 / camera.aspect, h / availableHeight * 5.5);
      camera.position.set(
        x + Math.sin(pose.azimuth) * Math.cos(pose.elevation) * distance,
        craft.position.y + Math.sin(pose.elevation) * distance,
        z + Math.cos(pose.azimuth) * Math.cos(pose.elevation) * distance,
      );
      camera.position.y = Math.max(camera.position.y, landscape.heightAt(camera.position.x, camera.position.z) + 0.3);
      camera.lookAt(craft.position);
      renderer.render(scene, camera);
      ctx.drawImage(renderer.domElement, 0, 0, w, h);
    },
  };
}
