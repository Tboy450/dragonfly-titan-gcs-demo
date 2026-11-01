// Rotor-wash dust (VIS-01): soft puffs rolling out from under drones flying low (the Dragonfly
// landing to drill, drones just released from their pods) and a burst where each pod touches
// down. The look and motion follow the simulator's downwash-dust.mjs, pooled for a whole swarm.
// The particle simulation (stepDust) is plain and seeded so it is tested without a browser;
// createSwarmDust draws it with sprites. Counts, speeds and sizes are artistic [EST].
const TAU = Math.PI * 2;
export const dustLimits = Object.freeze({ particles: 64, lowAltitude: 12, burst: 10 });

export function createDustState(seed = 1) {
  return { seed, debt: 0, particles: Array.from({ length: dustLimits.particles }, () => ({ alive: false })) };
}
const random = (state) => { state.seed = (state.seed * 16807) % 2147483647; return state.seed / 2147483647; };

function spawn(state, x, z, strength) {
  const particle = state.particles.find(p => !p.alive);
  if (!particle) return false;
  const angle = random(state) * TAU, start = 1 + random(state) * 1.5, speed = (2.5 + random(state) * 3) * (0.6 + 0.4 * strength);
  Object.assign(particle, {
    alive: true, age: 0, life: 1.6 + random(state) * 1.4,
    x: x + Math.cos(angle) * start, z: z + Math.sin(angle) * start, vx: Math.cos(angle) * speed, vz: Math.sin(angle) * speed,
    rise: 0, climb: 0.3 + random(state) * 0.7, size0: 1 + random(state) * 0.8, size1: 4 + random(state) * 2.5,
    peak: (0.3 + random(state) * 0.2) * strength,
  });
  return true;
}

// emitters: [{ x, z, alt }] drones in the air; bursts: [{ x, z }] pods touching down this frame;
// dusty(x, z): false over water or lava. Ages and moves the dust, then raises new puffs.
export function stepDust(state, dt, emitters, bursts = [], dusty = () => true) {
  for (const p of state.particles) {
    if (!p.alive) continue;
    p.age += dt;
    if (p.age >= p.life) { p.alive = false; continue; }
    const drag = Math.exp(-0.9 * dt), riseDrag = Math.exp(-0.5 * dt);
    p.x += p.vx * (1 - drag) / 0.9; p.z += p.vz * (1 - drag) / 0.9;
    p.vx *= drag; p.vz *= drag;
    p.rise += p.climb * (1 - riseDrag) / 0.5; p.climb *= riseDrag;
  }
  for (const burst of bursts) if (dusty(burst.x, burst.z)) for (let k = 0; k < dustLimits.burst; k += 1) spawn(state, burst.x, burst.z, 1);
  // Steady wash: stronger the lower the drone; never backfill a long gap (at most 0.1 s of dust).
  for (const e of emitters) {
    const strength = Math.max(0, 1 - e.alt / dustLimits.lowAltitude);
    if (strength <= 0 || !dusty(e.x, e.z)) continue;
    state.debt += strength * 12 * Math.min(0.1, dt);
    while (state.debt >= 1) { state.debt -= 1; if (!spawn(state, e.x, e.z, strength)) { state.debt = 0; break; } }
  }
  return state;
}

// Sprites for the dust: opacity rises and falls over each puff's life; puffs between the camera
// and the swarm are kept thin. Returns { group, update(dt, emitters, bursts, eye), dispose }.
export function createSwarmDust(THREE, parent, { heightAt, dusty, color = "#c9a46e", seed = 1 }) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d"), glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "rgba(255,255,255,0.9)"); glow.addColorStop(0.55, "rgba(255,255,255,0.45)"); glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 64, 64);
  const map = new THREE.CanvasTexture(canvas);
  const group = new THREE.Group();
  group.name = "rotor-dust";
  parent.add(group);
  const state = createDustState(seed);
  const sprites = state.particles.map(() => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, opacity: 0, depthWrite: false }));
    sprite.visible = false;
    sprite.userData.ownMaterial = true;
    group.add(sprite);
    return sprite;
  });
  return {
    group,
    update(dt, emitters, bursts, eye) {
      stepDust(state, dt, emitters, bursts, dusty);
      state.particles.forEach((p, i) => {
        const sprite = sprites[i];
        if (!p.alive) { sprite.visible = false; return; }
        const u = p.age / p.life, size = p.size0 + (p.size1 - p.size0) * Math.sqrt(u);
        sprite.position.set(p.x, heightAt(p.x, p.z) + size * 0.45 + p.rise, p.z);
        sprite.scale.set(size * 1.4, size, 1);
        const near = eye && Math.hypot(eye.x - p.x, eye.z - p.z) < 25;
        sprite.material.opacity = p.peak * Math.sin(Math.PI * u) * (near ? 0.4 : 1);
        sprite.visible = true;
      });
    },
    dispose() { map.dispose(); },
  };
}
