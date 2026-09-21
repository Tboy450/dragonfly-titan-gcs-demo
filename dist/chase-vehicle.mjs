import * as THREE from "./vendor/three/three.module.min.js";
import { cameraPose } from "./flight-camera.mjs";

export function createChaseRenderer() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  const craft = new THREE.Group();
  scene.add(craft);
  scene.add(new THREE.HemisphereLight(0xfff3de, 0x645045, 2.5));
  const sun = new THREE.DirectionalLight(0xffeed6, 3.2);
  sun.position.set(-4, 7, -3);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdbe8f3, 1.4);
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
  strut([0.06, 0.18, 0.35], [0.06, 0.46, 0.35], 0.035);
  const dish = mesh(new THREE.SphereGeometry(0.32, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), shell, [0.06, 0.46, 0.35]);
  dish.scale.y = 0.23;
  const dishRim = mesh(new THREE.TorusGeometry(0.32, 0.014, 8, 32), metal, [0.06, 0.46, 0.35]);
  dishRim.rotation.x = Math.PI / 2;
  strut([0.06, 0.47, 0.35], [0.06, 0.65, 0.35], 0.012, gold);

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
        for (let half = 0; half < 2; half += 1) {
          const solid = mesh(bladeGeometry, bladeMaterial, [0, 0, 0], rotor);
          solid.rotation.y = half * Math.PI;
          trails.forEach((material, index) => {
            const ghost = mesh(bladeGeometry, material, [0, 0, 0], rotor);
            ghost.rotation.y = half * Math.PI - direction * (index + 1) * 0.13;
          });
        }
        rotors.push({ rotor, direction, phase: rotors.length * 0.63 });
      }
    }
  }

  let width = 0;
  let height = 0;
  let rotorPhase = 0;
  let lastTime = performance.now();
  return {
    draw(ctx, w, h, state) {
      if (w !== width || h !== height) {
        width = w;
        height = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const flightBottom = h - (w <= 720 ? 235 : Math.min(300, h * 0.4));
        const centerY = (58 + Math.max(138, flightBottom)) / 2;
        camera.setViewOffset(w, h, 0, h / 2 - centerY, w, h);
        camera.updateProjectionMatrix();
      }
      const now = performance.now();
      rotorPhase += Math.min(0.05, (now - lastTime) / 1000) * (32 + state.throttle * 42);
      lastTime = now;
      rotors.forEach(({ rotor, direction, phase }) => { rotor.rotation.y = rotorPhase * direction + phase; });
      const pose = cameraPose(state);
      craft.rotation.set(-state.pitch * 0.32, pose.heading, -state.roll * 0.32, "YXZ");
      const availableHeight = w <= 720 ? Math.max(100, h - 293) : h;
      const distance = Math.max(11.7, 6.4 / camera.aspect, h / availableHeight * 5.5);
      camera.position.set(
        Math.sin(pose.azimuth) * Math.cos(pose.elevation) * distance,
        Math.sin(pose.elevation) * distance,
        Math.cos(pose.azimuth) * Math.cos(pose.elevation) * distance,
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      ctx.drawImage(renderer.domElement, 0, 0, w, h);
    },
  };
}
