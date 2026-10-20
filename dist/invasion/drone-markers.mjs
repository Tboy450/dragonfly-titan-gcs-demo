// Readability choices in CSS pixels; these do not change unit scale, selection or combat.
export const tinyDroneThreshold = 8;
export function projectedDiameter(radius, depth, verticalScale, height) {
  if (![radius, depth, verticalScale, height].every(Number.isFinite) || radius <= 0 || depth <= 0 || verticalScale <= 0 || height <= 0) return Infinity;
  return radius * verticalScale * height / depth;
}
export function tinyDroneMarker(point, diameter, width, height) {
  if (!point?.visible || !Number.isFinite(diameter) || diameter < 0 || diameter >= tinyDroneThreshold) return null;
  const x = point.x, y = point.y + 8;
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0 || x < 0 || x > width || y < 0 || y > height) return null;
  return { x, y, radius: 3 };
}
