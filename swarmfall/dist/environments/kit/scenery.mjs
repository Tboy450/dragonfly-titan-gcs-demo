// Scenery shared by the Environment Lab worlds: generated facade and ground textures (with a
// lit-window version for dusk), horizon mountains, water, star fields, banded planets and
// simple trees. All original procedural art [EST]; no images are downloaded.
import { THREE, rng, fbm, ridged, cached, shape, smooth } from "./core.mjs?v=dev";

function canvas(width, height, draw) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  draw(element.getContext("2d"), width, height);
  return element;
}

function texture(element, { srgb = true, repeat = true } = {}) {
  const map = new THREE.CanvasTexture(element);
  if (srgb) map.colorSpace = THREE.SRGBColorSpace;
  if (repeat) map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;
  return map;
}

// Facade styles. Each texture tile covers `tile` meters ([across, up]); the Massing helper
// writes UVs in the same meters, so windows keep their real size on any building.
export const facadeStyles = {
  glass: { tile: [12, 12], wall: "#6f8fa3", frame: "#c9d6dd", window: ["#2b4a5e", "#36586d", "#21394a"], columns: 4, rows: 3, gap: 0.06, band: 0.04 },
  amber: { tile: [12, 12], wall: "#8a6a3f", frame: "#d9c48f", window: ["#3d2f22", "#4e3a25", "#2d241b"], columns: 4, rows: 3, gap: 0.08, band: 0.05 },
  office: { tile: [12, 12], wall: "#c9c3b5", frame: "#e9e3d5", window: ["#30404a", "#3a4c57", "#26323a"], columns: 4, rows: 3, gap: 0.3, band: 0.22 },
  brick: { tile: [10, 12], wall: "#8c4a35", frame: "#e8dccb", window: ["#2a3036", "#333a41", "#1f2428"], columns: 3, rows: 3, gap: 0.45, band: 0.3, brick: true },
  deco: { tile: [10, 12], wall: "#3b3f45", frame: "#c8a45a", window: ["#20262c", "#2a3138", "#1a1f24"], columns: 5, rows: 3, gap: 0.35, band: 0.2, fins: true },
  concrete: { tile: [12, 12], wall: "#9a9a94", frame: "#b8b8b0", window: ["#2e3438", "#384046", "#262b2e"], columns: 3, rows: 3, gap: 0.4, band: 0.35 },
  teal: { tile: [12, 12], wall: "#3f7f86", frame: "#d5ecea", window: ["#1f3c42", "#24474e", "#183136"], columns: 6, rows: 3, gap: 0.12, band: 0.08 },
  residential: { tile: [9, 9], wall: "#d7c6a6", frame: "#f4ead6", window: ["#3b4148", "#454c54", "#30353b"], columns: 3, rows: 3, gap: 0.5, band: 0.35, balcony: true },
};

// Returns { day, night } materials for a facade style. Night lights a share of the windows.
export function facadeMaterials(styleName, seed = 1) {
  return cached(`facade/${styleName}/${seed}`, () => {
    const style = facadeStyles[styleName];
    const random = rng(seed * 7919 + styleName.length * 31);
    const size = 256, lit = [];
    const map = canvas(size, size, (ctx) => {
      ctx.fillStyle = style.wall;
      ctx.fillRect(0, 0, size, size);
      if (style.brick) {
        for (let y = 0; y < size; y += 6) for (let x = (y / 6) % 2 ? -6 : 0; x < size; x += 12) {
          ctx.fillStyle = `rgba(${random() < 0.5 ? "60,25,15" : "150,90,70"},${0.15 + random() * 0.15})`;
          ctx.fillRect(x, y, 11, 5);
        }
      }
      const cw = size / style.columns, rh = size / style.rows;
      for (let row = 0; row < style.rows; row += 1) for (let column = 0; column < style.columns; column += 1) {
        const x = column * cw + cw * style.gap / 2, y = row * rh + rh * style.band / 2;
        const w = cw * (1 - style.gap), h = rh * (1 - style.band);
        ctx.fillStyle = style.frame;
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
        ctx.fillStyle = style.window[Math.floor(random() * style.window.length)];
        ctx.fillRect(x, y, w, h);
        // A soft sky reflection on the upper part of each pane.
        const glow = ctx.createLinearGradient(0, y, 0, y + h);
        glow.addColorStop(0, "rgba(220,235,245,0.28)");
        glow.addColorStop(0.5, "rgba(220,235,245,0.04)");
        glow.addColorStop(1, "rgba(0,0,0,0.12)");
        ctx.fillStyle = glow;
        ctx.fillRect(x, y, w, h);
        if (style.balcony) {
          ctx.fillStyle = "rgba(60,60,60,0.55)";
          ctx.fillRect(x - 3, y + h - 3, w + 6, 4);
        }
        lit.push({ x, y, w, h, on: random() < 0.3, warm: random() < 0.7, level: 0.45 + random() * 0.55 });
      }
      if (style.fins) {
        ctx.fillStyle = style.frame;
        for (let column = 0; column <= style.columns; column += 1) ctx.fillRect(column * cw - 2, 0, 4, size);
      }
    });
    const emissive = canvas(size, size, (ctx) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size, size);
      for (const pane of lit) {
        if (!pane.on) continue;
        ctx.globalAlpha = pane.level;
        ctx.fillStyle = pane.warm ? "#ffcf86" : "#cfe6ff";
        ctx.fillRect(pane.x, pane.y, pane.w, pane.h);
      }
    });
    const day = new THREE.MeshStandardMaterial({
      map: texture(map), emissiveMap: texture(emissive), emissive: 0xffffff, emissiveIntensity: 0,
      roughness: styleName === "glass" || styleName === "teal" ? 0.35 : 0.8, metalness: styleName === "glass" || styleName === "teal" ? 0.35 : 0.05,
    });
    return { day, style };
  });
}

// Flat roof surface: gravel with drains and seams.
export function roofMaterial(tone = "#77756f") {
  return cached(`roof/${tone}`, () => {
    const random = rng(tone.length * 13 + 5);
    const element = canvas(128, 128, (ctx) => {
      ctx.fillStyle = tone;
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i += 1) {
        ctx.fillStyle = `rgba(${random() < 0.5 ? "0,0,0" : "255,255,255"},${random() * 0.12})`;
        ctx.fillRect(random() * 128, random() * 128, 2, 2);
      }
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.strokeRect(1, 1, 126, 126);
    });
    return new THREE.MeshStandardMaterial({ map: texture(element), roughness: 0.95, side: THREE.DoubleSide });
  });
}

// Ground textures: asphalt with lane marks, sidewalk paving, grass, cobbles, basalt, regolith.
export function groundMaterial(kind) {
  return cached(`ground/${kind}`, () => {
    const random = rng(kind.length * 101 + 7);
    const element = canvas(256, 256, (ctx, w, h) => {
      const base = { asphalt: "#3a3e42", sidewalk: "#a9a69c", grass: "#5f7d4a", cobble: "#8a8172", basalt: "#2b2523", regolith: "#7c6a58", sand: "#c8b58a", plaza: "#c9bfae", ice: "#d9ecf5" }[kind] || "#777";
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      const speckles = kind === "grass" ? 2600 : 1600;
      for (let i = 0; i < speckles; i += 1) {
        ctx.fillStyle = `rgba(${random() < 0.5 ? "0,0,0" : "255,255,255"},${random() * (kind === "grass" ? 0.14 : 0.1)})`;
        ctx.fillRect(random() * w, random() * h, 1 + random() * 2, 1 + random() * 2);
      }
      if (kind === "asphalt") {
        ctx.fillStyle = "rgba(240,236,220,0.85)";
        for (let x = 0; x < w; x += 64) ctx.fillRect(x + 8, h / 2 - 2, 36, 4);
      }
      if (kind === "sidewalk" || kind === "plaza") {
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        for (let x = 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y <= h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      }
      if (kind === "cobble") {
        for (let y = 0; y < h; y += 14) for (let x = (y / 14) % 2 ? -8 : 0; x < w; x += 16) {
          ctx.fillStyle = `rgba(${random() < 0.5 ? "40,35,30" : "200,190,170"},${0.18 + random() * 0.2})`;
          ctx.beginPath(); ctx.ellipse(x + 8, y + 7, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (kind === "basalt") {
        ctx.strokeStyle = "rgba(255,90,30,0.18)";
        for (let i = 0; i < 30; i += 1) {
          ctx.beginPath(); ctx.moveTo(random() * w, random() * h);
          for (let k = 0; k < 4; k += 1) ctx.lineTo(random() * w, random() * h);
          ctx.stroke();
        }
      }
    });
    return new THREE.MeshStandardMaterial({ map: texture(element), roughness: kind === "ice" ? 0.25 : 0.95 });
  });
}

// A flat textured rectangle on the ground; repeat in meters per texture tile.
export function groundPatch(group, kind, x, z, width, depth, y = 0, tileMeters = 16, ry = 0) {
  const material = groundMaterial(kind).clone();
  material.map = material.map.clone();
  material.map.needsUpdate = true;
  material.map.repeat.set(width / tileMeters, depth / tileMeters);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth).rotateX(-Math.PI / 2), material);
  mesh.position.set(x, y, z);
  mesh.rotation.y = ry;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

// A ring of mountains around the world (inner radius to outer radius), colored by height and
// fading into the haze; replaces scattered rocks with a continuous skyline.
export function horizonMountains(group, { inner = 2600, outer = 5600, height = 900, seed = 3, low = "#4f5f60", high = "#c9d2d0", snow = 0.75, y = -5 } = {}) {
  const segments = 240, rings = 40;
  const positions = [], colors = [], indices = [];
  const lowColor = new THREE.Color(low), highColor = new THREE.Color(high), white = new THREE.Color("#f4f7f8"), c = new THREE.Color();
  for (let j = 0; j <= rings; j += 1) {
    const t = j / rings, radius = inner + (outer - inner) * t;
    for (let i = 0; i <= segments; i += 1) {
      const a = i / segments * Math.PI * 2, x = Math.cos(a) * radius, z = Math.sin(a) * radius;
      const ridge = ridged(x / 900, z / 900, seed) ** 2 * 0.7 + fbm(x / 420, z / 420, seed + 5) * 0.45;
      const rise = smooth(0, 0.45, t) * (1 - smooth(0.85, 1, t) * 0.6);
      const h = ridge * height * rise;
      positions.push(x, y + h, z);
      const k = Math.min(1, h / height);
      c.copy(lowColor).lerp(highColor, k);
      if (k > snow) c.lerp(white, (k - snow) / (1 - snow));
      colors.push(c.r, c.g, c.b);
    }
  }
  const row = segments + 1;
  for (let j = 0; j < rings; j += 1) for (let i = 0; i < segments; i += 1) {
    const a = j * row + i, b = a + 1, d = a + row, e = d + 1;
    indices.push(a, d, b, b, d, e);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  mesh.name = "Horizon mountains";
  mesh.userData.damageProtected = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

// Water with a slowly drifting normal texture.
export function water(group, { width, depth, x = 0, z = 0, y = 0, color = "#2f6f86", rough = 0.18 }) {
  const random = rng(29);
  const element = canvas(256, 256, (ctx, w, h) => {
    const image = ctx.createImageData(w, h);
    for (let py = 0; py < h; py += 1) for (let px = 0; px < w; px += 1) {
      const n = Math.sin(px * 0.19 + Math.sin(py * 0.07) * 3) * 0.5 + Math.sin(py * 0.23 + px * 0.05) * 0.5;
      const i = (py * w + px) * 4;
      image.data[i] = 128 + n * 40 + (random() - 0.5) * 6;
      image.data[i + 1] = 128 + Math.cos(px * 0.11 + py * 0.13) * 40;
      image.data[i + 2] = 255;
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  });
  const normalMap = texture(element, { srgb: false });
  normalMap.repeat.set(width / 60, depth / 60);
  const material = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.2, normalMap, normalScale: new THREE.Vector2(0.35, 0.35) });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth).rotateX(-Math.PI / 2), material);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  mesh.userData.damageProtected = true;
  group.add(mesh);
  return (time) => { normalMap.offset.set(time * 0.006, time * 0.004); };
}

export function stars(group, { count = 2500, radius = 6500, size = 6, minY = -1, seed = 7, color = 0xdce9ff } = {}) {
  const random = rng(seed), positions = [];
  for (let i = 0; i < count; i += 1) {
    const y = minY + random() * (1 - minY), a = random() * Math.PI * 2, r = Math.sqrt(1 - y * y);
    positions.push(Math.cos(a) * r * radius, y * radius, Math.sin(a) * r * radius);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color, size, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.85 }));
  points.frustumCulled = false;
  group.add(points);
  return points;
}

// A banded gas giant (or rocky moon with bands = 0) with an optional ring.
export function planet(group, { radius, position, colors = ["#c99a6b", "#e7c89c", "#a8744b", "#f1dfbf"], bands = 18, ring = null, seed = 11, tilt = 0.4 }) {
  const random = rng(seed);
  const element = canvas(512, 256, (ctx, w, h) => {
    for (let y = 0; y < h; y += 1) {
      const t = y / h, wave = Math.sin(t * bands * Math.PI + Math.sin(t * 9) * 1.5);
      const color = new THREE.Color(colors[Math.floor((wave * 0.5 + 0.5) * (colors.length - 0.01))]);
      color.offsetHSL(0, 0, (fbm(t * 30, 1, seed) - 0.5) * 0.12);
      ctx.fillStyle = `#${color.getHexString()}`;
      ctx.fillRect(0, y, w, 1);
    }
    for (let i = 0; i < 40; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${random() * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(random() * w, random() * h, 20 + random() * 60, 3 + random() * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), new THREE.MeshStandardMaterial({ map: texture(element, { repeat: false }), roughness: 1, fog: false }));
  body.position.copy(position);
  body.rotation.z = tilt;
  body.userData.damageProtected = true;
  group.add(body);
  if (ring) {
    const ringCanvas = canvas(512, 8, (ctx, w) => {
      for (let x = 0; x < w; x += 1) {
        const a = 0.2 + 0.6 * fbm(x / 18, 3, seed + 2);
        ctx.fillStyle = `rgba(${ring.color || "230,215,190"},${x < w * 0.08 ? 0 : a})`;
        ctx.fillRect(x, 0, 1, 8);
      }
    });
    const geometry = new THREE.RingGeometry(radius * ring.inner, radius * ring.outer, 160, 1);
    const uv = geometry.attributes.uv, pos = geometry.attributes.position;
    for (let i = 0; i < uv.count; i += 1) {
      const r = Math.hypot(pos.getX(i), pos.getY(i));
      uv.setXY(i, (r - radius * ring.inner) / (radius * (ring.outer - ring.inner)), 0.5);
    }
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture(ringCanvas, { repeat: false }), transparent: true, side: THREE.DoubleSide, fog: false, depthWrite: false }));
    mesh.position.copy(position);
    mesh.rotation.set(Math.PI / 2 - 0.25, 0, tilt);
    mesh.userData.damageProtected = true;
    group.add(mesh);
  }
  return body;
}

// Low-poly trees for parks and avenues: trunk plus one or two leaf masses, batched.
export function tree(batches, x, y, z, height, random, palette = ["#4f7a43", "#5d8a4c", "#466d3b", "#6f9353"]) {
  const trunk = shape("tree-trunk", () => new THREE.CylinderGeometry(0.18, 0.28, 1, 6).translate(0, 0.5, 0));
  const leaves = shape("tree-leaves", () => new THREE.IcosahedronGeometry(1, 1));
  const bark = cached("tree-bark", () => new THREE.MeshStandardMaterial({ color: 0x5b4636, roughness: 1 }));
  const leaf = cached(`tree-leaf/${palette.join()}`, () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }));
  batches.put(trunk, bark, x, y, z, 0, height * 0.5, height * 0.55, height * 0.5);
  const tint = new THREE.Color(palette[Math.floor(random() * palette.length)]);
  batches.put(leaves, leaf, x, y + height * 0.72, z, random() * 6, height * 0.36, height * 0.42, height * 0.36, tint);
  if (random() < 0.5) batches.put(leaves, leaf, x + height * 0.12, y + height * 0.95, z - height * 0.08, random() * 6, height * 0.24, height * 0.28, height * 0.24, tint);
}
