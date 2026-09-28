import test from "node:test";
import assert from "node:assert/strict";
import { cameraPose, enterFreeCamera, orbitCamera, smoothCameraPose, wrapAngle } from "../dist/flight-camera.mjs";

const fixture = () => ({ heading: 84, cameraMode: "fixed", cameraYaw: 0, cameraPitch: 0.38 });
const near = (a, b) => assert.ok(Math.abs(wrapAngle(a - b)) < 1e-10, `${a} differs from ${b}`);

test("Fixed camera stays directly aft with a gentle downward viewing angle at every heading", () => {
  for (const heading of [0, 45, 84, 180, 255, 359, 360]) {
    const pose = cameraPose({ ...fixture(), heading });
    near(pose.azimuth, -heading * Math.PI / 180);
    assert.equal(pose.elevation, 0.16);
  }
});

test("Free camera preserves its world bearing through a complete aircraft turn", () => {
  const state = fixture();
  const fixed = cameraPose(state);
  enterFreeCamera(state);
  state.cameraMode = "free";
  near(cameraPose(state).azimuth, fixed.azimuth);
  for (const turn of [90, 180, 270, 360]) {
    state.heading = 84 + turn;
    const pose = cameraPose(state);
    near(pose.azimuth, fixed.azimuth);
    near(pose.azimuth - pose.heading, turn * Math.PI / 180);
  }
});

test("Horizontal drags reach both sides, front, and return after multiple full orbits", () => {
  const state = fixture();
  enterFreeCamera(state);
  state.cameraMode = "free";
  const start = state.cameraYaw;
  for (let quarter = 1; quarter <= 12; quarter += 1) {
    orbitCamera(state, 250, 0, 1000, 600);
    near(state.cameraYaw, start - quarter * Math.PI / 2);
  }
  orbitCamera(state, -500, 0, 1000, 600);
  near(state.cameraYaw, start + Math.PI);
});

test("Vertical orbit stays above the surface and away from camera inversion", () => {
  const state = fixture();
  orbitCamera(state, 0, -10000, 390, 600);
  assert.equal(state.cameraPitch, 0.04);
  orbitCamera(state, 0, 10000, 390, 600);
  assert.equal(state.cameraPitch, 1.38);
});

test("Fixed mode follows heading again, and repeated mode switches do not jump", () => {
  const state = fixture();
  enterFreeCamera(state);
  state.cameraMode = "free";
  orbitCamera(state, 570, 150, 1000, 600);
  state.heading = 255;
  state.cameraMode = "fixed";
  const fixed = cameraPose(state);
  near(fixed.azimuth - fixed.heading, 0);
  enterFreeCamera(state);
  state.cameraMode = "free";
  near(cameraPose(state).azimuth, fixed.azimuth);
  assert.equal(cameraPose(state).elevation, fixed.elevation);
});

test("Rendered camera eases between Free and Fixed instead of teleporting", () => {
  const state = fixture();
  smoothCameraPose(state, 1 / 60);
  enterFreeCamera(state);
  state.cameraMode = "free";
  orbitCamera(state, 500, 200, 1000, 600);
  for (let i = 0; i < 120; i++) smoothCameraPose(state, 1 / 60);
  near(state.renderPose.azimuth, state.cameraYaw);
  state.cameraMode = "fixed";
  let previous = { ...state.renderPose };
  let largest = 0;
  for (let i = 0; i < 180; i++) {
    smoothCameraPose(state, 1 / 60);
    largest = Math.max(largest, Math.abs(wrapAngle(state.renderPose.azimuth - previous.azimuth)));
    previous = { ...state.renderPose };
  }
  assert.ok(largest < 0.3, `camera jumped ${largest} rad in one frame`);
  assert.ok(Math.abs(wrapAngle(state.renderPose.azimuth - cameraPose(state).azimuth)) < 1e-4);
  // Entering Free mid-transition starts from the pose on screen.
  state.cameraMode = "free";
  enterFreeCamera(state);
  near(state.cameraYaw, state.renderPose.azimuth);
});
