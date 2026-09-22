import * as THREE from "./vendor/three/three.module.min.js";

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

export function terrainHeight(x, z) {
  const radius = Math.hypot(x, z);
  const ramp = Math.max(0, Math.min(1, (radius - 95) / 430));
  const foothills = ramp * ramp * (3 - 2 * ramp);
  const ridge = 1 - Math.abs(noise(x / 290 + 7, z / 290 - 3) * 2 - 1);
  const relief = ridge ** 3 * (100 + noise(x / 700, z / 700) * 220);
  const gullies = noise(x / 74, z / 74) * 24 + noise(x / 25, z / 25) * 7;
  return (relief + gullies) * foothills * 0.34 + noise(x / 42, z / 42) * 1.3 + noise(x / 9, z / 9) * 0.13;
}

export function createTitanTerrain(scene, renderer) {
  const hazeColor = new THREE.Color(0xb48b55);
  scene.background = hazeColor;
  scene.fog = new THREE.FogExp2(hazeColor, 0.00078);

  const reference = new THREE.TextureLoader().load("./assets/titan-mountain-reference.jpg");
  reference.colorSpace = THREE.SRGBColorSpace;
  reference.wrapS = reference.wrapT = THREE.MirroredRepeatWrapping;
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
    `).replace("#include <map_fragment>", `
      vec2 foldedUv = abs(fract(vMapUv) * 2.0 - 1.0);
      foldedUv.y = 0.10 + foldedUv.y * 0.82;
      vec4 referenceColor = texture2D(map, foldedUv);
      vec2 groundPoint = vMapUv * 1100.0;
      float grains = terrainNoise(groundPoint * 2.5);
      float gravel = terrainNoise(groundPoint * 0.23);
      float detail = 0.82 + 0.24 * gravel + 0.18 * grains;
      diffuseColor.rgb *= referenceColor.rgb * detail;
    `);
  };

  const segments = 240;
  const geometry = new THREE.PlaneGeometry(1, 1, segments, segments);
  const vertices = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const terrain = new THREE.Mesh(geometry, groundMaterial);
  terrain.receiveShadow = true;
  scene.add(terrain);
  let terrainX = NaN, terrainZ = NaN;

  function moveTerrain(x, z) {
    const anchorX = Math.round(x / 400) * 400;
    const anchorZ = Math.round(z / 400) * 400;
    if (anchorX === terrainX && anchorZ === terrainZ) return;
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
  }

  const rockGeometry = new THREE.IcosahedronGeometry(1, 1);
  const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x9a8c73, roughness: 1 });
  const rocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, 1089);
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  scene.add(rocks);
  const transform = new THREE.Object3D();
  const rockColor = new THREE.Color();
  let rockX = NaN, rockZ = NaN;
  function moveRocks(x, z) {
    const cellX = Math.floor(x / 8), cellZ = Math.floor(z / 8);
    if (cellX === rockX && cellZ === rockZ) return;
    rockX = cellX;
    rockZ = cellZ;
    let index = 0;
    for (let row = -16; row <= 16; row += 1) {
      for (let column = -16; column <= 16; column += 1) {
        const gx = cellX + column, gz = cellZ + row;
        const worldX = (gx + hash(gx + 51, gz)) * 8;
        const worldZ = (gz + hash(gx, gz + 29)) * 8;
        const size = 0.08 + hash(gx + 4, gz + 7) ** 3 * 0.52;
        transform.position.set(worldX, terrainHeight(worldX, worldZ) + size * 0.24, worldZ);
        transform.rotation.set(hash(gx, gz) * 0.5, hash(gz, gx) * Math.PI, 0.15);
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
    update(x, z) {
      moveTerrain(x, z);
      moveRocks(x, z);
    },
  };
}
