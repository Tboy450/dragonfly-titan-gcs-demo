const TAU = Math.PI * 2;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export function wrapAngle(angle) {
  return ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
}

export function cameraPose(state) {
  const heading = -state.heading * Math.PI / 180;
  return {
    heading,
    azimuth: state.cameraMode === "free" ? state.cameraYaw : heading + 0.28,
    elevation: state.cameraMode === "free" ? state.cameraPitch : 0.10,
  };
}

export function enterFreeCamera(state) {
  const pose = cameraPose(state);
  state.cameraYaw = wrapAngle(pose.azimuth);
  state.cameraPitch = pose.elevation;
}

export function orbitCamera(state, dx, dy, width, height) {
  state.cameraYaw = wrapAngle(state.cameraYaw - dx / Math.max(1, width) * TAU);
  state.cameraPitch = clamp(state.cameraPitch + dy / Math.max(1, height) * Math.PI, 0.04, 1.38);
}
