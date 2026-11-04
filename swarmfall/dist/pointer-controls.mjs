// Pointer intent only; the mission UI resolves selection, orders and camera movement.
export function pointerIntent(event) {
  const mouse = event.pointerType === 'mouse' || !event.pointerType;
  const button = event.button ?? 0;
  if (![0, 1, 2].includes(button) || (!mouse && button !== 0)) return null;
  return {
    action: event.altKey || button === 1 ? null : mouse ? button === 2 ? 'order' : 'select' : 'smart',
    rotate: button === 1 || button === 2 || !!event.altKey || !!event.ctrlKey,
    additive: !!(event.shiftKey || event.ctrlKey || event.metaKey),
    buttons: button === 2 ? 2 : button === 1 ? 4 : 1,
  };
}

export function exceedsTapSlop(start, point) {
  return Math.hypot(point.clientX - start.x, point.clientY - start.y) > 8;
}

// Box selection (CTRL-01): Shift+drag with a mouse, or press and hold then drag on touch. The box
// between two screen points, and the squads with a living drone inside it. project(unit) gives
// { x, y, visible } in the same screen space.
export const holdToBoxMs = 450;
export function boxRect(a, b) {
  return { left: Math.min(a.x, b.x), top: Math.min(a.y, b.y), right: Math.max(a.x, b.x), bottom: Math.max(a.y, b.y) };
}
export function squadsInBox(units, project, rect) {
  const squads = new Set();
  for (const unit of units) {
    if (!unit.alive || unit.side !== "swarm" || unit.structure || squads.has(unit.squad)) continue;
    const p = project(unit);
    if (p.visible && p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom) squads.add(unit.squad);
  }
  return [...squads].sort((a, c) => a - c);
}
