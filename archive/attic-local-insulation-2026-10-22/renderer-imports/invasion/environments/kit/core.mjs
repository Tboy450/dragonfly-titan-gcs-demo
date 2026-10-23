// Shared building blocks for the Environment Lab worlds: seeded randomness and noise, cached
// materials and geometry, instanced batching, merged boxes with world-scaled facade UVs, and
// matrix helpers. Everything here is drawing code; no game rules.
// A path rather than the bare "three" name, so the game page (which has no import map) can use
// this kit too; it resolves to the same module the lab's import map names.
import * as THREE from "../../../vendor/three/three.module.min.js";

export { THREE };

export function rng(seed = 1) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (random, list) => list[Math.floor(random() * list.length) % list.length];
export const range = (random, low, high) => low + (high - low) * random();
export const smooth = (edge0, edge1, value) => {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

function hash(x, z, seed) {
  const value = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

export function noise(x, z, seed = 0) {
  const ix = Math.floor(x), iz = Math.floor(z);
  let u = x - ix, v = z - iz;
  u = u * u * (3 - 2 * u);
  v = v * v * (3 - 2 * v);
  const a = hash(ix, iz, seed) * (1 - u) + hash(ix + 1, iz, seed) * u;
  const b = hash(ix, iz + 1, seed) * (1 - u) + hash(ix + 1, iz + 1, seed) * u;
  return a * (1 - v) + b * v;
}

export function fbm(x, z, seed = 0, octaves = 4) {
  let sum = 0, amplitude = 0.5, frequency = 1, total = 0;
  for (let i = 0; i < octaves; i += 1) {
    sum += amplitude * noise(x * frequency, z * frequency, seed + i * 17);
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }
  return sum / total;
}

export const ridged = (x, z, seed = 0) => 1 - Math.abs(noise(x, z, seed) * 2 - 1);

// ---- Caches: one material or geometry per key, shared by every world on the page ----
const materials = new Map(), geometries = new Map();
export function cached(key, create) {
  if (!materials.has(key)) materials.set(key, create());
  return materials.get(key);
}
export function shape(key, create) {
  if (!geometries.has(key)) geometries.set(key, create());
  return geometries.get(key);
}

// A plain standard material by its look. glow > 0 makes it emit its own color.
export function paint(color, { metal = 0, rough = 0.75, glow = 0, flat = false, opacity = 1, side = THREE.FrontSide } = {}) {
  return cached(`paint/${color}/${metal}/${rough}/${glow}/${flat}/${opacity}/${side}`, () => new THREE.MeshStandardMaterial({
    color, metalness: metal, roughness: rough, flatShading: flat,
    emissive: glow ? color : 0x000000, emissiveIntensity: glow,
    transparent: opacity < 1, opacity, side, depthWrite: opacity >= 1,
  }));
}

export const unitBox = () => shape("unit-box", () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
export const unitCylinder = (segments = 24) => shape(`unit-cylinder/${segments}`, () => new THREE.CylinderGeometry(1, 1, 1, segments).translate(0, 0.5, 0));
export const unitCone = (segments = 24) => shape(`unit-cone/${segments}`, () => new THREE.ConeGeometry(1, 1, segments).translate(0, 0.5, 0));
export const unitSphere = (detail = 16) => shape(`unit-sphere/${detail}`, () => new THREE.SphereGeometry(1, detail, Math.max(6, detail / 2)));
export const unitIco = (detail = 1) => shape(`unit-ico/${detail}`, () => new THREE.IcosahedronGeometry(1, detail));
export const unitTorus = (tube = 0.06, segments = 64) => shape(`unit-torus/${tube}/${segments}`, () => new THREE.TorusGeometry(1, tube, 8, segments).rotateX(Math.PI / 2));

// Bottom-anchored lathe from [radius, height] pairs on a unit scale.
export function lathe(key, points, segments = 32) {
  return shape(`lathe/${key}`, () => new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments));
}

const composeDummy = new THREE.Object3D();
// Matrix from position, y rotation, scale (and optional x/z rotation).
export function trs(x, y, z, ry = 0, sx = 1, sy = sx, sz = sx, rx = 0, rz = 0) {
  composeDummy.position.set(x, y, z);
  composeDummy.rotation.set(rx, ry, rz, "YXZ");
  composeDummy.scale.set(sx, sy, sz);
  composeDummy.updateMatrix();
  return composeDummy.matrix.clone();
}

// Collects (geometry, material, matrix) triples and draws each pair as one InstancedMesh.
// A loaded kit piece (kit/assets.mjs) is a list of parts, each with its own local matrix.
export class Batches {
  constructor(group, { shadows = true } = {}) {
    this.group = group;
    this.shadows = shadows;
    this.batches = new Map();
    this.count = 0;
  }

  add(geometry, material, matrix, color = null) {
    const key = `${geometry.uuid}/${material.uuid}`;
    let batch = this.batches.get(key);
    if (!batch) this.batches.set(key, batch = { geometry, material, matrices: [], colors: [] });
    batch.matrices.push(matrix);
    batch.colors.push(color);
    this.count += 1;
  }

  // Shorthand: geometry and material placed by position, y rotation and scale.
  put(geometry, material, x, y, z, ry = 0, sx = 1, sy = sx, sz = sx, color = null) {
    this.add(geometry, material, trs(x, y, z, ry, sx, sy, sz), color);
  }

  piece(piece, matrix) {
    for (const part of piece.parts) this.add(part.geometry, part.material, matrix.clone().multiply(part.matrix));
  }

  finish() {
    for (const { geometry, material, matrices, colors } of this.batches.values()) {
      const mesh = new THREE.InstancedMesh(geometry, material, matrices.length);
      matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
      if (colors.some(Boolean)) colors.forEach((color, index) => mesh.setColorAt(index, color || new THREE.Color(1, 1, 1)));
      mesh.castShadow = this.shadows;
      mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      this.group.add(mesh);
    }
    this.batches.clear();
    return this.count;
  }
}

// Merges many boxes, cylinders and prisms into one geometry per material, with UVs measured in
// meters (u along the wall, v up), so a repeating facade texture keeps its window size on every
// building. Walls and roofs go to separate geometries so each can use its own material.
export class Massing {
  constructor() {
    this.walls = new Map();
    this.roofs = new Map();
  }

  list(target, key) {
    if (!target.has(key)) target.set(key, { positions: [], normals: [], uvs: [] });
    return target.get(key);
  }

  quad(list, a, b, c, d, normal, uv) {
    for (const [p, t] of [[a, uv[0]], [b, uv[1]], [c, uv[2]], [a, uv[0]], [c, uv[2]], [d, uv[3]]]) {
      list.positions.push(p.x, p.y, p.z);
      list.normals.push(normal.x, normal.y, normal.z);
      list.uvs.push(t[0], t[1]);
    }
  }

  // Box standing on y0, centered on (x, z), rotated by ry. tile = [meters per u, meters per v].
  box(wallKey, roofKey, x, y0, z, width, height, depth, ry = 0, tile = [8, 12], uOffset = 0) {
    const cos = Math.cos(ry), sin = Math.sin(ry);
    const at = (lx, ly, lz) => new THREE.Vector3(x + lx * cos + lz * sin, y0 + ly, z - lx * sin + lz * cos);
    const w = width / 2, d = depth / 2;
    const corners = [[-w, -d], [w, -d], [w, d], [-w, d]];
    const walls = this.list(this.walls, wallKey);
    let u = uOffset;
    for (let i = 0; i < 4; i += 1) {
      const [x1, z1] = corners[i], [x2, z2] = corners[(i + 1) % 4];
      const length = Math.hypot(x2 - x1, z2 - z1);
      const normal = new THREE.Vector3((z2 - z1) / length, 0, -(x2 - x1) / length);
      normal.set(normal.x * cos + normal.z * sin, 0, -normal.x * sin + normal.z * cos);
      const u0 = u / tile[0], u1 = (u + length) / tile[0], v1 = height / tile[1];
      this.quad(walls, at(x2, 0, z2), at(x1, 0, z1), at(x1, height, z1), at(x2, height, z2), normal,
        [[u0, 0], [u1, 0], [u1, v1], [u0, v1]]);
      u += length;
    }
    if (roofKey) {
      const roof = this.list(this.roofs, roofKey);
      const up = new THREE.Vector3(0, 1, 0);
      this.quad(roof, at(-w, height, d), at(w, height, d), at(w, height, -d), at(-w, height, -d), up,
        [[0, 0], [width / 8, 0], [width / 8, depth / 8], [0, depth / 8]]);
    }
  }

  // One vertical wall from (x1, z1) to (x2, z2), facing right of that direction (outward for a
  // clockwise walk around a building seen from above).
  wall(wallKey, x1, z1, x2, z2, y0, height, tile = [8, 12]) {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const normal = new THREE.Vector3((z2 - z1) / length, 0, -(x2 - x1) / length);
    const at = (x, y, z) => new THREE.Vector3(x, y0 + y, z);
    const v = height / tile[1], u = length / tile[0];
    this.quad(this.list(this.walls, wallKey), at(x2, 0, z2), at(x1, 0, z1), at(x1, height, z1), at(x2, height, z2), normal,
      [[0, 0], [u, 0], [u, v], [0, v]]);
  }

  // Vertical cylinder (or tapered tower) with wall UVs measured around its circumference.
  cylinder(wallKey, roofKey, x, y0, z, radius, height, segments = 24, tile = [8, 12], topRadius = radius) {
    const walls = this.list(this.walls, wallKey);
    for (let i = 0; i < segments; i += 1) {
      const a1 = i / segments * Math.PI * 2, a2 = (i + 1) / segments * Math.PI * 2;
      const p = (a, r, y) => new THREE.Vector3(x + Math.cos(a) * r, y0 + y, z + Math.sin(a) * r);
      const normal = new THREE.Vector3(Math.cos((a1 + a2) / 2), (radius - topRadius) / height, Math.sin((a1 + a2) / 2)).normalize();
      const u1 = a1 * radius / tile[0], u2 = a2 * radius / tile[0], v = height / tile[1];
      // Counter-clockwise seen from outside (angle grows toward the viewer's left).
      this.quad(walls, p(a2, radius, 0), p(a1, radius, 0), p(a1, topRadius, height), p(a2, topRadius, height), normal,
        [[u2, 0], [u1, 0], [u1, v], [u2, v]]);
    }
    if (roofKey) {
      const roof = this.list(this.roofs, roofKey);
      const center = new THREE.Vector3(x, y0 + height, z), up = new THREE.Vector3(0, 1, 0);
      for (let i = 0; i < segments; i += 1) {
        const a1 = i / segments * Math.PI * 2, a2 = (i + 1) / segments * Math.PI * 2;
        const p1 = new THREE.Vector3(x + Math.cos(a1) * topRadius, y0 + height, z + Math.sin(a1) * topRadius);
        const p2 = new THREE.Vector3(x + Math.cos(a2) * topRadius, y0 + height, z + Math.sin(a2) * topRadius);
        this.quad(roof, center, p2, p1, center, up, [[0, 0], [0, 0], [0, 0], [0, 0]]);
      }
    }
  }

  // Merged meshes, one per key, with the materials looked up by key.
  build(group, wallMaterials, roofMaterials, { shadows = true } = {}) {
    const make = (lists, mats) => {
      for (const [key, list] of lists) {
        if (!list.positions.length) continue;
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(list.positions, 3));
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(list.normals, 3));
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(list.uvs, 2));
        geometry.computeBoundingSphere();
        const mesh = new THREE.Mesh(geometry, mats[key] || mats.default);
        mesh.castShadow = shadows;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    };
    make(this.walls, wallMaterials);
    make(this.roofs, roofMaterials);
  }
}

// Things that move every frame (traffic, ships, lights): an InstancedMesh and a function that
// fills its matrices for the current time.
export function movers(group, geometry, material, count, place) {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  group.add(mesh);
  const dummy = new THREE.Object3D();
  const update = (time) => {
    for (let i = 0; i < count; i += 1) {
      dummy.position.set(0, 0, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      place(i, time, dummy);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  update.mesh = mesh;
  update(0);
  return update;
}
