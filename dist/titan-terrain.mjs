import * as THREE from "./vendor/three/three.module.min.js";
import { pools, poolRadius, surveySite, dampGround } from "./mission-systems.mjs?v=dev";

function hash(x, z) {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function noise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  let u = x - ix, v = z - iz;
  u = u * u * (3 - 2 * u);
  v = v * v * (3 - 2 * v);
  const a = hash(ix, iz) * (1 - u) + hash(ix + 1, iz) * u;
  const b = hash(ix, iz + 1) * (1 - u) + hash(ix + 1, iz + 1) * u;
  return a * (1 - v) + b * v;
}

function baseHeight(x, z) {
  const wx = x + 92 * (noise(x / 410 + 12, z / 410 - 8) - 0.5);
  const wz = z + 80 * (noise(x / 470 - 5, z / 470 + 17) - 0.5);
  const radius = Math.hypot(wx * 0.88, wz * 1.08);
  const ramp = Math.max(0, Math.min(1, (radius - 95) / 430));
  const foothills = ramp * ramp * (3 - 2 * ramp);
  const ridge = 1 - Math.abs(noise((wx * 0.91 + wz * 0.41) / 290 + 7, (wz * 0.91 - wx * 0.41) / 290 - 3) * 2 - 1);
  const relief = ridge ** 3 * (100 + noise(x / 700, z / 700) * 220);
  const gullies = noise(x / 74, z / 74) * 24 + noise(x / 25, z / 25) * 7;
  return (relief + gullies) * foothills * 0.34 + noise(x / 42, z / 42) * 1.3 + noise(x / 9, z / 9) * 0.13;
}

// Each puddle's surface sits just below the lowest ground around it, so liquid never floats above its banks.
export const poolLevels = pools.map((pool) => {
  let lowest = Infinity;
  for (let i = 0; i < 72; i++) {
    const angle = i / 72 * Math.PI * 2;
    for (const ring of [1, 1.2, 1.45]) {
      const r = ring * (1 + 0.09 * Math.sin(angle * 3) + 0.05 * Math.cos(angle * 5));
      lowest = Math.min(lowest, baseHeight(pool.x + Math.cos(angle) * pool.rx * r, pool.z - Math.sin(angle) * pool.rz * r));
    }
  }
  return lowest - 0.06;
});

export function terrainHeight(x, z) {
  let height = baseHeight(x, z);
  pools.forEach((pool, index) => {
    const radius = poolRadius(x, z, pool);
    if (radius < 1.4) {
      const blend = Math.max(0, Math.min(1, (radius - 0.72) / 0.68));
      height = (poolLevels[index] - pool.depth) * (1 - blend) + height * blend;
    }
  });
  // A small surveyed patch provides a reproducible dry landing target.
  const pad = Math.max(0, Math.min(1, (Math.hypot(x - surveySite.x, z - surveySite.z) - 14) / 12));
  return height * pad + 1.4 * (1 - pad);
}

// Sample the same triangle split used by PlaneGeometry, including its slope.
export function sampleTerrainSurface(x, z, positions, segments) {
  const stride = segments + 1;
  function cell(value, axis, step) {
    let low = 0, high = segments;
    while (high - low > 1) {
      const middle = (low + high) >> 1;
      if (positions[middle * step * 3 + axis] <= value) low = middle;
      else high = middle;
    }
    return low;
  }
  const column = cell(x, 0, 1), row = cell(z, 2, stride);
  const a = (row * stride + column) * 3;
  const b = a + stride * 3, d = a + 3, c = b + 3;
  const dx = positions[d] - positions[a], dz = positions[b + 2] - positions[a + 2];
  const u = Math.max(0, Math.min(1, (x - positions[a]) / dx));
  const v = Math.max(0, Math.min(1, (z - positions[a + 2]) / dz));
  const [h00, h10, h01, h11] = [positions[a + 1], positions[d + 1], positions[b + 1], positions[c + 1]];
  const lower = u + v <= 1;
  const height = lower ? h00 + (h10 - h00) * u + (h01 - h00) * v
    : h11 + (h01 - h11) * (1 - u) + (h10 - h11) * (1 - v);
  const sx = lower ? (h10 - h00) / dx : (h11 - h01) / dx;
  const sz = lower ? (h01 - h00) / dz : (h11 - h10) / dz;
  const length = Math.hypot(sx, 1, sz);
  return { height, normal: [-sx / length, 1 / length, -sz / length] };
}

export function createTitanTerrain(scene, renderer) {
  const group = new THREE.Group();
  group.name = "titan-landscape";
  scene.add(group);
  // Haze: brighter orange at the horizon, deeper amber overhead. Visibility near the surface is
  // ~10 km [PUB]; the fog here is denser (~3.6 km for 2% contrast) so the 4.9 km terrain edge stays hidden.
  const horizonColor = new THREE.Color(0xc9955a), zenithColor = new THREE.Color(0x8a5a30);
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 2; skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext("2d");
  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.colorSpace = THREE.SRGBColorSpace;
  scene.background = skyTexture;
  scene.fog = new THREE.FogExp2(horizonColor.clone(), 0.00055);
  function setDaylight(level) {
    const scale = 0.12 + level * 0.88;
    const top = zenithColor.clone().multiplyScalar(scale), bottom = horizonColor.clone().multiplyScalar(scale);
    const gradient = skyCtx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, `#${top.getHexString()}`);
    gradient.addColorStop(0.62, `#${bottom.getHexString()}`);
    gradient.addColorStop(1, `#${bottom.getHexString()}`);
    skyCtx.fillStyle = gradient;
    skyCtx.fillRect(0, 0, 2, 256);
    skyTexture.needsUpdate = true;
    scene.fog.color.copy(bottom);
  }
  let daylight = -1;
  setDaylight(1);

  const reference = new THREE.TextureLoader().load("./assets/titan-mountain-reference.jpg");
  reference.colorSpace = THREE.SRGBColorSpace;
  reference.wrapS = reference.wrapT = THREE.ClampToEdgeWrapping;
  reference.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xa99576, map: reference, roughness: 1, metalness: 0,
  });
  // Both the reference texture and fine ground detail are anchored to world coordinates.
  groundMaterial.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `
      #include <common>
      float terrainHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float terrainNoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(terrainHash(i), terrainHash(i + vec2(1.0, 0.0)), f.x),
          mix(terrainHash(i + vec2(0.0, 1.0)), terrainHash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      vec3 terrainPatch(sampler2D terrainMap, vec2 cell, vec2 p) {
        float angle = terrainHash(cell + 2.1) * 6.2831853;
        mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 offset = vec2(terrainHash(cell + 9.2), terrainHash(cell - 6.7)) - 0.5;
        vec2 uv = vec2(0.5) + rotation * (p - cell) * 0.20 + offset * 0.16;
        uv.y = 0.12 + uv.y * 0.76;
        return texture2D(terrainMap, uv).rgb;
      }
    `).replace("#include <map_fragment>", `
      vec2 groundPoint = vMapUv * 1100.0;
      vec2 patchPoint = groundPoint / 185.0;
      patchPoint += vec2(terrainNoise(patchPoint * 0.7), terrainNoise(patchPoint * 0.7 + 27.0)) * 0.45;
      vec2 cell = floor(patchPoint), blend = fract(patchPoint);
      blend = blend * blend * (3.0 - 2.0 * blend);
      vec3 referenceColor = mix(
        mix(terrainPatch(map, cell, patchPoint), terrainPatch(map, cell + vec2(1.0, 0.0), patchPoint), blend.x),
        mix(terrainPatch(map, cell + vec2(0.0, 1.0), patchPoint), terrainPatch(map, cell + vec2(1.0), patchPoint), blend.x), blend.y);
      float grains = terrainNoise(groundPoint * 2.5);
      float gravel = terrainNoise(groundPoint * 0.23);
      float detail = 0.82 + 0.24 * gravel + 0.18 * grains;
      diffuseColor.rgb *= referenceColor * detail;
      // Rain-darkened interdune: damp ground is darker and slightly glossier, with a ragged edge.
      vec2 dampOffset = (groundPoint - vec2(${dampGround.x.toFixed(1)}, ${dampGround.z.toFixed(1)})) / vec2(${dampGround.rx.toFixed(1)}, ${dampGround.rz.toFixed(1)});
      float dampEdge = length(dampOffset) + (terrainNoise(groundPoint * 0.045) - 0.5) * 0.34 + (terrainNoise(groundPoint * 0.2) - 0.5) * 0.08;
      float damp = 1.0 - smoothstep(0.72, 1.0, dampEdge);
      damp *= smoothstep(${(surveySite.radius + 2).toFixed(1)}, ${(surveySite.radius + 10).toFixed(1)}, distance(groundPoint, vec2(${surveySite.x.toFixed(1)}, ${surveySite.z.toFixed(1)})));
      diffuseColor.rgb *= mix(vec3(1.0), vec3(0.42, 0.43, 0.5), damp);
    `).replace("#include <roughnessmap_fragment>", `
      #include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.55, damp);
    `);
  };

  const segments = 240;
  const geometry = new THREE.PlaneGeometry(1, 1, segments, segments);
  const vertices = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const terrain = new THREE.Mesh(geometry, groundMaterial);
  terrain.name = "titan-ground";
  terrain.receiveShadow = true;
  group.add(terrain);
  const liquidMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3230, roughness: 0.18, metalness: 0.25, side: THREE.DoubleSide });
  pools.forEach((pool, index) => {
    const shape = new THREE.Shape();
    for (let i = 0; i <= 96; i++) {
      const a = i / 96 * Math.PI * 2;
      const r = 1 + 0.09 * Math.sin(a * 3) + 0.05 * Math.cos(a * 5);
      const x = Math.cos(a) * pool.rx * r, y = -Math.sin(a) * pool.rz * r;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    const water = new THREE.Mesh(new THREE.ShapeGeometry(shape), liquidMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(pool.x, poolLevels[index], pool.z);
    water.name = "methane-puddle";
    group.add(water);
  });
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x80f2ae, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
  const targetRing = new THREE.Mesh(new THREE.RingGeometry(10.95, 11.0, 96), markerMaterial);
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.set(surveySite.x, 1.44, surveySite.z);
  targetRing.name = "survey-marker";
  group.add(targetRing);
  let terrainX = NaN, terrainZ = NaN;

  function moveTerrain(x, z) {
    const anchorX = Math.round(x / 400) * 400;
    const anchorZ = Math.round(z / 400) * 400;
    if (anchorX === terrainX && anchorZ === terrainZ) return false;
    terrainX = anchorX;
    terrainZ = anchorZ;
    for (let row = 0; row <= segments; row += 1) {
      const v = row / segments * 2 - 1;
      const worldZ = anchorZ + v * 70 + Math.sign(v) * v * v * 4800;
      for (let column = 0; column <= segments; column += 1) {
        const u = column / segments * 2 - 1;
        const worldX = anchorX + u * 70 + Math.sign(u) * u * u * 4800;
        const index = row * (segments + 1) + column;
        vertices.setXYZ(index, worldX, terrainHeight(worldX, worldZ), worldZ);
        uv.setXY(index, worldX / 1100, worldZ / 1100);
      }
    }
    vertices.needsUpdate = true;
    uv.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return true;
  }

  const rockGeometry = new THREE.IcosahedronGeometry(1, 1);
  const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x9a8c73, roughness: 1 });
  const rocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, 1089);
  rocks.name = "titan-rocks";
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  group.add(rocks);
  const transform = new THREE.Object3D();
  const rockColor = new THREE.Color();
  const up = new THREE.Vector3(0, 1, 0);
  const normal = new THREE.Vector3();
  const twist = new THREE.Quaternion();
  const surfaceAt = (x, z) => sampleTerrainSurface(x, z, vertices.array, segments);
  let rockX = NaN, rockZ = NaN;
  function moveRocks(x, z, force = false) {
    const cellX = Math.floor(x / 8), cellZ = Math.floor(z / 8);
    if (!force && cellX === rockX && cellZ === rockZ) return;
    rockX = cellX;
    rockZ = cellZ;
    let index = 0;
    for (let row = -16; row <= 16; row += 1) {
      for (let column = -16; column <= 16; column += 1) {
        const gx = cellX + column, gz = cellZ + row;
        const worldX = (gx + hash(gx + 51, gz)) * 8;
        const worldZ = (gz + hash(gx, gz + 29)) * 8;
        const size = 0.08 + hash(gx + 4, gz + 7) ** 3 * 0.52;
        const surface = surfaceAt(worldX, worldZ);
        normal.set(...surface.normal);
        transform.position.set(worldX, surface.height, worldZ).addScaledVector(normal, size * 0.12);
        transform.quaternion.setFromUnitVectors(up, normal);
        twist.setFromAxisAngle(up, hash(gz, gx) * Math.PI * 2);
        transform.quaternion.multiply(twist);
        transform.scale.set(size * 1.3, size * 0.55, size);
        transform.updateMatrix();
        rocks.setMatrixAt(index, transform.matrix);
        rockColor.setHSL(0.1, 0.14, 0.38 + hash(gx + 2, gz + 3) * 0.24);
        rocks.setColorAt(index, rockColor);
        index += 1;
      }
    }
    rocks.instanceMatrix.needsUpdate = true;
    rocks.instanceColor.needsUpdate = true;
    rocks.computeBoundingSphere();
  }

  moveTerrain(0, 0);
  moveRocks(0, 0);
  return {
    group,
    setDaylight(level) {
      const rounded = Math.round(level * 50) / 50;
      if (rounded !== daylight) { daylight = rounded; setDaylight(rounded); }
    },
    heightAt: (x, z) => surfaceAt(x, z).height,
    update(x, z) {
      const changed = moveTerrain(x, z);
      moveRocks(x, z, changed);
    },
  };
}
