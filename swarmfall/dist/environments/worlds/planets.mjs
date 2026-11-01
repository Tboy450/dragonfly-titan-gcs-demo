// Campaign planets (Claude, October 2026): each Swarmfall battle map drawn from the game's own
// rules, so the lab shows what a mission is actually played on. Terrain heights and liquids come
// from planet-terrain.mjs, zones and Aurex's skyline from battle.mjs createBattle with the planet's
// own seed, colors, fog and light from scene.mjs biomeLooks, and Frontier cities from
// city-render.mjs. The ground colouring follows scene.mjs groundMesh. Brought over from the
// independent asset studio's campaign-terrain previews (Tboy450/assets-and-environments-lab),
// which drew the same height functions with 4x vertical exaggeration; here they keep true scale.
// Not drawn: the per-battle rocks, trees and ice spikes, defenders and the Hive beacon.
import { THREE } from "../kit/core.mjs?v=dev";
import { planets, frontiers } from "../../campaign.mjs?v=dev";
import { createPlanetTerrain } from "../../planet-terrain.mjs?v=dev";
import { createBattle } from "../../battle.mjs?v=dev";

// Titan already has its own world here (Titan Hive outpost on the simulator's terrain).
export const planetChoices = Object.freeze([...planets.filter(p => p.biome !== "titan"), ...frontiers]);

// Same terrain and zones as a fresh mission on this planet (main.mjs startMission).
export function planetLayout(id) {
  const planet = planetChoices.find(p => p.id === id) || planetChoices[0];
  const terrain = createPlanetTerrain(planet);
  const battle = createBattle(planet, { terrain, seed: planet.seed, missionId: `lab-${planet.id}` });
  return { planet, terrain, battle };
}

export async function build({ scene, camera, quality }) {
  const { biomeLooks } = await import("../../scene.mjs?v=dev");
  const { buildCity } = await import("../../city-render.mjs?v=dev");
  const high = quality !== "low";
  const { planet, terrain, battle } = planetLayout(new URLSearchParams(location.search).get("planet"));
  const look = biomeLooks[planet.biome] || biomeLooks.desert;
  const { centerX, centerZ, half } = battle.map;
  const large = half > 1200;
  const group = new THREE.Group();
  group.name = `Campaign planet ${planet.name}`;

  // ---- Sky, fog and light in the game's colours ----
  for (const part of scene.children) {
    if (part.isHemisphereLight) { part.color.set(look.sky); part.groundColor.set(look.ground); part.intensity = look.hemi ?? 1.8; }
    if (part.isDirectionalLight && part.castShadow) { part.color.set(look.sun); part.intensity = look.sunI ?? 2; }
  }
  // The game's own haze, which also hides the square edge of the ground.
  scene.fog = new THREE.FogExp2(look.fog, planet.map.fog ?? look.density);
  // This world brings its own sky (info.ownSky), so the lab adds no moon or ring the game lacks.
  // The horizon is exactly the fog colour, so fully hazed ground meets the sky without a seam.
  const sky = new THREE.Mesh(new THREE.SphereGeometry(9000, 32, 16), new THREE.ShaderMaterial({
    uniforms: { top: { value: new THREE.Color(look.top) }, bottom: { value: new THREE.Color(look.bottom) }, haze: { value: new THREE.Color(look.fog) } },
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vPosition; void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 bottom; uniform vec3 haze; varying vec3 vPosition; void main() { float y = normalize(vPosition).y; vec3 c = mix(haze, bottom, smoothstep(0.0, 0.08, y)); gl_FragColor = vec4(mix(c, top, smoothstep(0.08, 0.6, y)), 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
  }));
  sky.frustumCulled = false;
  sky.renderOrder = -1;
  sky.name = "planet-sky";
  group.add(sky);

  // ---- Ground (scene.mjs groundMesh) ----
  const size = large ? half * 2.6 : half * 3.6, segments = large ? (high ? 300 : 180) : (high ? 220 : 140);
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments).rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  let low = Infinity, top = -Infinity;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i) + centerX, z = position.getZ(i) + centerZ, y = terrain.heightAt(x, z);
    position.setXYZ(i, x, y, z);
    low = Math.min(low, y); top = Math.max(top, y);
  }
  geometry.computeVertexNormals();
  const normal = geometry.attributes.normal, colors = new Float32Array(position.count * 3);
  const lowC = new THREE.Color(look.low), highC = new THREE.Color(look.high), steepC = new THREE.Color(look.steep);
  const sand = new THREE.Color("#c9b98a"), cliffC = new THREE.Color(look.rock || look.steep).multiplyScalar(0.55), c = new THREE.Color();
  for (let i = 0; i < position.count; i += 1) {
    const y = position.getY(i), slope = 1 - normal.getY(i);
    c.copy(lowC).lerp(highC, Math.min(1, Math.max(0, (y - low) / Math.max(1, top - low))));
    c.lerp(steepC, Math.min(1, Math.max(0, (slope - 0.08) / 0.25)));
    if (large) c.lerp(cliffC, Math.min(0.85, Math.max(0, (slope - 0.22) / 0.3)));
    if (terrain.liquid !== null && !terrain.solidLiquid && y < terrain.liquid + 1.6 && planet.biome !== "volcanic") c.lerp(sand, 0.6);
    const x = position.getX(i), z = position.getZ(i);
    const v = 0.92 + 0.16 * (Math.sin(x * 0.37 + z * 0.11) * Math.sin(z * 0.29 - x * 0.07) * 0.5 + 0.5);
    colors[i * 3] = c.r * v; colors[i * 3 + 1] = c.g * v; colors[i * 3 + 2] = c.b * v;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const ground = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 }));
  ground.name = "planet-ground";
  ground.receiveShadow = true;
  group.add(ground);

  // ---- Liquid: water, methane, ice sheet or lava (scene.mjs liquidMesh) ----
  if (terrain.liquid !== null && look.liquid) {
    const spec = look.liquid;
    const material = spec.lava
      ? new THREE.MeshBasicMaterial({ color: spec.color, toneMapped: false })
      : new THREE.MeshStandardMaterial({ color: spec.color, roughness: spec.rough ?? 0.2, metalness: spec.metal ?? 0.1, transparent: !terrain.solidLiquid, opacity: terrain.solidLiquid ? 1 : 0.88 });
    const liquid = new THREE.Mesh(new THREE.PlaneGeometry(size * 1.2, size * 1.2).rotateX(-Math.PI / 2), material);
    liquid.position.set(centerX, terrain.liquid, centerZ);
    liquid.name = "planet-liquid";
    group.add(liquid);
  }

  // ---- Aurex's solid skyline: exactly the towers the battle rules use ----
  const towers = terrain.skyline || [];
  if (towers.length) {
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.4 }), towers.length);
    const dummy = new THREE.Object3D(), shade = new THREE.Color();
    towers.forEach((tower, i) => {
      dummy.position.set(tower.x, terrain.heightAt(tower.x, tower.z) - 0.5, tower.z);
      dummy.scale.set(tower.w, tower.height + 0.5, tower.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, shade.setHSL(0.72 + tower.shade * 0.08, 0.15, 0.3 + tower.shade * 0.25));
    });
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.name = "planet-skyline";
    group.add(mesh);
  }

  // ---- Frontier city, drawn by the same kit code the game uses ----
  if (terrain.city) buildCity(group, terrain.city, { high });

  // ---- Capture zones, as the game places them for this planet's seed ----
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false });
  for (const zone of battle.zones) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(zone.radius - Math.max(1.2, zone.radius * 0.06), zone.radius, 72).rotateX(-Math.PI / 2), ringMaterial);
    ring.position.set(zone.x, terrain.heightAt(zone.x, zone.z) + 0.6, zone.z);
    ring.name = `zone ${zone.id ?? ""}`.trim();
    group.add(ring);
  }

  // ---- Camera views scaled to the map; the lab's orbit reach is 4,500 m ----
  const reach = Math.min(1, 4300 / (half * 1.9));
  const mid = terrain.heightAt(centerX, centerZ);
  const beacon = { x: centerX - half * 0.68, z: centerZ + half * 0.68 }, beaconY = terrain.heightAt(beacon.x, beacon.z);
  const views = {
    vista: [[centerX + half * 1.15 * reach, mid + half * 0.75 * reach, centerZ + half * 1.25 * reach], [centerX, mid, centerZ]],
    district: [[centerX + half * 0.42, mid + half * 0.28, centerZ + half * 0.5], [centerX, mid, centerZ]],
    street: [[beacon.x + 24, beaconY + 7, beacon.z - 24], [centerX, mid + 10, centerZ]],
  };
  const kind = planet.frontier ? "Frontier map" : planet.biome === "city" ? "City world" : "Campaign planet";
  return {
    group, moving: [], noDamage: true,
    // The dome follows the camera so its far side never passes the camera's 12 km draw distance.
    animate: () => sky.position.copy(camera.position),
    target: new THREE.Vector3(centerX, mid, centerZ),
    tour: { radius: half * 1.05 * reach, height: half * 0.55 * reach, swing: half * 0.12 },
    bounds: half * 2, ceiling: half * 1.8, floor: low + 2,
    title: `${planet.name} · ${planet.subtitle || kind}`,
    description: `${planet.description || ""} ${kind}, ${(half * 2 / 1000).toFixed(1)} km across, with the ${battle.zones.length} capture zones a new mission places here.`.trim(),
    status: `${planet.biome} · ${battle.zones.length} zones · game terrain${towers.length ? ` · ${towers.length} towers` : ""}${terrain.city ? " · Frontier city" : ""}`,
    views,
    choices: planetChoices.map(p => ({ href: `?scene=planets&planet=${p.id}`, label: p.name, current: p.id === planet.id })),
  };
}
