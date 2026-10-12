# Interactive Inspection and Assumption Audit

Signed: Codex (OpenAI), October 12, 2026.

## Scope

This presentation milestone builds on the source reviews in
[vehicle inspection](vehicle-inspection-2026-10-11.md) and
[sampling sequence](sampling-sequence-2026-10-11.md). No new hardware dimensions or
thermal/science performance claims are introduced.

- Mission Internal/Thermal: component focus, orbit, zoom, reset and optional assembly
  isolation. Related transfer hardware remains together; the full model is restored for
  Pilot/Exterior. The original mock-up keeps its non-interactive layered drawing.
- Optional sampling follow reads `samplingSequence(state)`, which projects the existing
  shared science timer. Pausing uses the existing global hold command. No extra sampling
  timer, instrument energy charge, result or saved-state extension was added.
- Camera smoothing uses display time, so inspection remains usable while science is
  paused. Reduced-motion users get immediate framing. Native browser zoom is never
  intercepted; touch drag rotation must be enabled. Canvas keyboard input cannot steer.
- These are diagrammatic inspection aids, not real onboard camera views. Isolation
  hides parts visually without removing them from the engineering model.

## Explicit Assumptions

The in-app Model assumptions section now distinguishes:

1. Published reference values versus estimated procedural geometry and mixed design epochs.
2. Landing-area inspiration versus invented terrain, mountain landmarks, rocks, candidate
   sites, puddle and outcrop. The scenery is not a surveyed landing map or weather forecast.
3. Simplified flight/thermal/science computations versus measured hardware telemetry.
4. Deliberate additions: reverse assist, compressed sampling and training time, protective
   behavior, transparent cutaways, thermal colors, inspection cameras and poster composites.

The liquid-to-liquid study remains explicitly hypothetical, not a claimed Dragonfly
Titan-surface system. Public-source provenance remains in the existing research compendium.

## Reverse Assist Correction

At the owner's request, the existing fictional opt-in reverse assist now continues through
zero vertical speed into a shallow descent, instead of only removing upward momentum.
At manual zero throttle above 1 m on dry ground, it adds at most 0.2 m/s2 downwards until
the resulting descent reaches 0.6 m/s. Normal descent may subsequently become faster under
the existing zero-throttle command; 0.6 m/s is the assist cutoff, not a new global sink limit.
The 160 RPM animation reverses and the existing estimated 50 W additional load is retained.

All these assist values are [EST] gameplay choices. Reversing a rotor's animation is not
an aerodynamic model of reversible fixed-pitch propulsion. This is **not a real Dragonfly
capability**. Default-off, liquid/automatic-flight/low-altitude protections and the existing
landing flare remain in place. Tests compare enabled/disabled trajectories at 20/60/120 Hz,
verify the small extra downward acceleration and gate behavior, and confirm soft touchdown.

## Verification and Archive

- 129 Node tests, including new pure inspector and renderer isolation/framing tests.
- Edge/Playwright: desktop and 360/390 px phones, screenshots, component canvas-pixel
  bounds and orbit changes, pointer/keyboard isolation from flight, pause/follow, reset,
  native Ctrl zoom passthrough, visible icons and absence of page errors.
- The previous sources and before screenshots are preserved in
  `archive/interactive-inspector-2026-10-11`, from `8b12b3c`, with its matching archive tag.

Remaining science realism work: separately sourced LD/GC modes, scheduling and instrument
internals. The current short sampling demonstration is unchanged.
