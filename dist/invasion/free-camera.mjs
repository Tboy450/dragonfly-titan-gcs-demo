// Free camera (owner, October 21): fly the view anywhere over the battlefield, up and down, and
// look around, instead of orbiting a ground point. Plain functions on a small state object
// { x, y, z, yaw, pitch } (pitch: radians below the horizon, negative looks up); the page owns
// the state and the scene draws from it. Never saved with a mission. Limits are invented [EST].
export const freeLimits = Object.freeze({ clearance: 2, ceiling: 2500, lookUp: -1.2, lookDown: 1.5, edge: 1.1 });

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// Starts exactly where the orbit camera is ({ focus, distance, yaw, pitch }), looking the same way.
export function enterFree(cam, groundAt) {
  const ground = groundAt(cam.focus.x, cam.focus.z), horizontal = Math.cos(cam.pitch) * cam.distance;
  const x = cam.focus.x + Math.sin(cam.yaw) * horizontal, z = cam.focus.z + Math.cos(cam.yaw) * horizontal;
  return { x, z, y: Math.max(ground + Math.sin(cam.pitch) * cam.distance, groundAt(x, z) + 4), yaw: cam.yaw, pitch: cam.pitch };
}

// Back to orbiting the ground point straight ahead (straight below when looking up or level).
export function exitFree(free, cam, groundAt, maxDistance = 750) {
  const height = Math.max(4, free.y - groundAt(free.x, free.z)), pitch = clamp(free.pitch, 0.3, 1.45);
  const reach = height / Math.tan(pitch);
  cam.focus = { x: free.x - Math.sin(free.yaw) * reach, z: free.z - Math.cos(free.yaw) * reach };
  cam.yaw = free.yaw;
  cam.pitch = pitch;
  cam.distance = Math.min(maxDistance, Math.hypot(reach, height));
  return cam;
}

// world: { groundAt(x, z), roofAt?(x, z) (building height above the ground there), map }.
// Keeps the camera over the map, above the ground and roofs, and out of buildings: a sideways
// move into a building taller than the camera is refused; climbing over it is not.
export function placeFree(free, x, z, y, world) {
  const { centerX, centerZ, half } = world.map, edge = half * freeLimits.edge;
  x = clamp(x, centerX - edge, centerX + edge);
  z = clamp(z, centerZ - edge, centerZ + edge);
  const floorAt = (px, pz) => world.groundAt(px, pz) + (world.roofAt?.(px, pz) || 0) + freeLimits.clearance;
  if (y < floorAt(x, z) && (x !== free.x || z !== free.z) && free.y < floorAt(x, z) - 1) { x = free.x; z = free.z; }
  const ground = world.groundAt(x, z);
  free.x = x;
  free.z = z;
  free.y = clamp(y, floorAt(x, z), ground + freeLimits.ceiling);
  return free;
}

// The camera's speed (m/s) grows with its height, so a high camera still crosses kilometers.
export const freeSpeed = (free, groundAt, fast = false) => Math.min(600, 25 + Math.max(0, free.y - groundAt(free.x, free.z)) * 0.9) * (fast ? 3 : 1);

// input: { forward, right, up, turn, look } each -1..1, and fast; dt in seconds.
export function moveFree(free, input, dt, world) {
  const speed = freeSpeed(free, world.groundAt, input.fast) * dt;
  free.yaw += (input.turn || 0) * 1.3 * dt;
  free.pitch = clamp(free.pitch + (input.look || 0) * 0.9 * dt, freeLimits.lookUp, freeLimits.lookDown);
  const forward = (input.forward || 0) * speed, right = (input.right || 0) * speed;
  const x = free.x - Math.sin(free.yaw) * forward + Math.cos(free.yaw) * right;
  const z = free.z - Math.cos(free.yaw) * forward - Math.sin(free.yaw) * right;
  return placeFree(free, x, z, free.y + (input.up || 0) * speed, world);
}

// Where the camera looks: a point 100 m ahead along its view.
export function freeTarget(free) {
  const level = Math.cos(free.pitch);
  return { x: free.x - Math.sin(free.yaw) * level * 100, y: free.y - Math.sin(free.pitch) * 100, z: free.z - Math.cos(free.yaw) * level * 100 };
}
