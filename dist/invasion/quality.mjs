// Graphics quality (PERF-04): a chosen level and an automatic resolution scale. Plain data and
// functions, so the adaptation is tested without a browser. Values are invented [EST].
//   decor: share of rocks, trees and spikes; city: full city detail (park trees, smoke);
//   ratio: sharpest device pixel ratio used; ground: segments of a frontier map's ground.
export const qualityLevels = Object.freeze({
  low: Object.freeze({ label: "Low", decor: 0.35, city: false, ratio: 0.75, ground: 200 }),
  medium: Object.freeze({ label: "Medium", decor: 0.7, city: true, ratio: 1, ground: 260 }),
  high: Object.freeze({ label: "High", decor: 1, city: true, ratio: 1.5, ground: 300 }),
});
export const qualityOrder = Object.freeze(["low", "medium", "high"]);
export const nextQuality = (name) => qualityOrder[(qualityOrder.indexOf(name) + 1) % qualityOrder.length];

// Adaptive resolution: the average frame time (an exponential average of recent frames) drives a
// scale on the pixel ratio. Slower than ~40 fps for 2 s steps the scale down; faster than ~57 fps
// for 5 s steps it back up. Long gaps (a hidden tab) are ignored.
export function createAdaptive() {
  return { scale: 1, average: 16.7, slow: 0, fast: 0 };
}
export function adaptFrame(state, frameMs) {
  if (!(frameMs > 0) || frameMs > 250) return false;
  state.average += (frameMs - state.average) * 0.05;
  const seconds = frameMs / 1000;
  state.slow = state.average > 25 ? state.slow + seconds : 0;
  state.fast = state.average < 17.5 ? state.fast + seconds : 0;
  const before = state.scale;
  if (state.slow > 2) { state.scale = Math.max(0.5, +(state.scale - 0.15).toFixed(2)); state.slow = 0; state.average = 20; }
  else if (state.fast > 5) { state.scale = Math.min(1, +(state.scale + 0.15).toFixed(2)); state.fast = 0; }
  return state.scale !== before;
}
