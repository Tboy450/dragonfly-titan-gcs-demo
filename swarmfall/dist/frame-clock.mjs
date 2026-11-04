// Frame clock (PERF-11): how far each displayed frame moves the battle.
// - The battle advances in steps of at most maxStepS of game time, so a step means the same at
//   144 or 10 frames a second. A slow frame is caught up in several steps, up to maxFrameS of
//   real time, so the battle keeps real time down to about 4 frames a second.
// - Anything longer (a loading hitch, a frozen or hidden tab) is dropped, not replayed in a burst,
//   so pod releases, shots, strikes and timers never pile up when drawing catches up.
// - Paused battles take no steps; the page still moves the camera by real time.
// Plain numbers, tested without a page.
export const maxStepS = 0.05, maxFrameS = 0.25, stallS = 1;

// Steps for a frame that took elapsedS seconds at game speed `speed`: `count` steps of `step` s.
export function frameSteps(elapsedS, speed = 1) {
  const elapsed = Number.isFinite(elapsedS) ? Math.max(0, elapsedS) : 0;
  const real = Math.min(maxFrameS, elapsed), total = real * Math.max(0, speed || 0);
  const count = total > 0 ? Math.ceil(total / maxStepS - 1e-9) : 0;
  return { real, dropped: elapsed - real, count, step: count ? total / count : 0 };
}

// Sustained slowness, not a single hitch: seconds of recent frames that were too slow to keep up
// (longer than maxFrameS but shorter than a stall), worn down again by frames that kept up.
// `lagging` once that reaches lagS, so the page can say the battle is in slow motion.
export const lagS = 3;
export function trackLag(lag, elapsedS) {
  const elapsed = Number.isFinite(elapsedS) ? Math.max(0, elapsedS) : 0;
  const slow = elapsed > maxFrameS && elapsed < stallS;
  const seconds = slow ? lag.seconds + elapsed : elapsed >= stallS ? lag.seconds : Math.max(0, lag.seconds - elapsed);
  return { seconds, lagging: seconds >= lagS };
}
