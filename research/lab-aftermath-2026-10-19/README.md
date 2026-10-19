# Destruction aftermath in the Asset & Environment Lab

Implemented October 19, 2026 — **Codex (OpenAI)**. Original procedural shader effects;
no image-generation service or downloaded VFX imagery used.

## Open the previews

- [Skyway megacity — major destruction](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=cyberpunk&damage=heavy)
- [Alien arcology — major destruction](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=alien&damage=heavy)
- [Metropolis — damaged](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=metropolis&damage=damaged)
- [Tidal citadel — ruins](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=citadel&damage=ruins)
- [Phototextured city — major destruction](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=drone&damage=heavy)
- [Large building — major destruction](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?asset=building-large&damage=heavy)

Open the sidebar if collapsed. **Smoke**, **Fire & embers** and **Pause effects** are
independent controls. **Dusk** helps inspect local warm light. Choose **Light** quality
to reduce particles and remove the added point lights. Effects start paused when the
device requests reduced motion; **Animate effects** resumes them explicitly.

Links retain destruction stage and the `effects=all|smoke|fire|off` and `motion=paused`
options when changing environments. Intact views allocate no effect particles or lights.

## Implementation

`city-damage.mjs` exports emission metadata from real triangle/fracture intersections.
It does not guess roof positions or project fire onto land beneath elevated city sections.
`aftermath.mjs` adds camera-facing instanced shader quads: wind-drifting billowing smoke,
tapered moving flame tongues and rising embers. High quality adds up to two unshadowed
warm point lights with restrained intensity variation. Fog fades additive fire/embers
without adding a bright fog-colored rectangle.

Damaged stages have localized fires; Major destruction has the most activity; Ruins use
smaller residual flames and lingering smoke. These are separate visual presets, not a
time-based fire/collapse simulation. There is no spreading fire, audio, damage, resource
change or campaign-save change in this update.

| Budget | High | Light |
| --- | --- | --- |
| Active fracture sites | At most 36 | At most 12 |
| Smoke / flames / embers per site | 9 / 5 / 12 | 5 / 3 / 4 |
| Total instanced quads | At most 936 | At most 144 |
| Effect draw layers | At most 3 | At most 3 |
| Added local lights | At most 2 | 0 |

Stage changes dispose old geometry/materials and lights. Visibility toggles reuse their
allocations; quality changes rebuild within the new budget. Pausing freezes shader time
and light variation. Hidden tabs do not advance these effects.

All five city environments are connected. The offline asset check also found support in
three urban buildings, the air conditioner, six fantasy wall/roof pieces and the fantasy
tree. Planter, fountain and banner retain intact-only previews; the four drone inspectors
remain intact. Source assets, attribution, terrain and historical foundations are preserved.

## Evidence and remaining acceptance

- [Automated test output](test-results.txt): **314/314 tests passed** in the full repository
  run; eight new aftermath
  tests cover source/retained-geometry correspondence, finite attributes, budgets, pause,
  toggles, quality changes, disposal and bundled shader chunk contracts.
- [Offline geometry probe](probe.mjs) and [results](geometry-probe.json): all five actual
  city geometry sets across three damaged stages have usable emission sites. All 14
  non-drone catalog assets were checked, with 11 supporting destruction previews.
  To rerun: `node research/lab-aftermath-2026-10-19/probe.mjs`.
  The probe uses the bundled Three glTF loader, omits image/material loading in memory,
  preserves source vertex/index/transform data and normalizes city spans as the lab does.
  Its canvas stub only supports the procedural facade material setup; it does not render.
- [Previous lab archived](../../archive/lab-aftermath-2026-10-19/README.md), including exact
  original source and a clearly dated historical October 17 picture.

**Browser access was explicitly blocked in this session.** No browser workaround was used.
Node checks do not compile shaders on a GPU or establish visual quality, transparent-particle
sorting, touch usability or phone performance. Those checks remain open as **FX-06** in
the project checklist; the broader gameplay/sound work stays open as **FX-01–04**.
