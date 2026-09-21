import test from "node:test";
import assert from "node:assert/strict";
import { cameraPose, enterFreeCamera, orbitCamera, wrapAngle } from "../dist/flight-camera.mjs";

const fixture = () => ({ heading: 84, cameraMode: "fixed", cameraYaw: 0, cameraPitch: 0.38 });
const near = (a, b) => assert.ok(Math.abs(wrapAngle(a - b)) < 1e-10, `${a} differs from ${b}`);

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
    near(pose.azimuth - pose.heading, 0.28 + turn * Math.PI / 180);
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
  near(fixed.azimuth - fixed.heading, 0.28);
  enterFreeCamera(state);
  state.cameraMode = "free";
  near(cameraPose(state).azimuth, fixed.azimuth);
  assert.equal(cameraPose(state).elevation, fixed.elevation);
});
