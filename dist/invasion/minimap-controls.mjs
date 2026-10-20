// Convert CSS-pixel input through the same square map bounds used by the minimap renderer.
export function minimapWorldPoint(clientX, clientY, rect, map) {
  if (!rect || !map || ![clientX, clientY, rect.left, rect.top, rect.width, rect.height, map.centerX, map.centerZ, map.half].every(Number.isFinite)) return null;
  if (rect.width <= 0 || rect.height <= 0 || map.half <= 0) return null;
  const x = (clientX - rect.left) / rect.width, z = (clientY - rect.top) / rect.height;
  if (x < 0 || x > 1 || z < 0 || z > 1) return null;
  return { x: map.centerX + (x * 2 - 1) * map.half, z: map.centerZ + (z * 2 - 1) * map.half };
}
