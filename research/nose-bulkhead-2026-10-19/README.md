# Part 03: Provisional Nose Structural Panel

Codex (OpenAI), October 19, 2026. This is a conservative visual/inspection improvement,
**not a completed photo-matched rebuild**. The checklist stays unchecked and the completed
count stays **19/24 (4 Codex, 15 Claude)**. The owner's METHAN approximation approval does
not authorize treating other inferred parts as verified hardware.

## Evidence and Original Sources

| Saved image / source | Classification and use | Credit |
|---|---|---|
| `nasa-apl-harness-integration.jpg` | Real wired flight fuselage, published September 2, 2026. Silver panel finish, perimeter joints and local tape; nose partially occluded, not an orthographic nose-face reference. | NASA/Johns Hopkins APL/Ed Whitman |
| `nasa-apl-suspended-structure.jpg` | Real suspended structure during ground-vibration tests, published July 9, 2026. Broad construction/finish reference, not a fully populated flight vehicle. | NASA/Johns Hopkins APL/Ed Whitman |
| `../lander-structure-2026/nasa-apl-top-deck-fit-check.jpg` | Real April fit check. Clearly exposed gold panel is AFT, not the nose; do not duplicate its generator ring onto #03. | NASA/Johns Hopkins APL/Ed Whitman |
| `../sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg` | Coker et al., ICES-2023-389, figure 3. Thermal CAD, nose to left. Layout cross-reference only, no dimensions; colors represent temperature, not surface finish. | Coker et al., Johns Hopkins APL |
| `../apl-spacecraft-models/cad-first-frame.png` | Frame of APL's 2024 rotating CAD visualization. CGI, not real hardware; broad arrangement cross-check. Original video and attribution retained in its own folder. | Johns Hopkins APL |

Original links, checked October 19:

- [NASA September integration article](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/)
- [NASA photograph file](https://assets.science.nasa.gov/dynamicimage/assets/science/missions/dragonfly/Harness1_SM.jpg?w=4096&fit=clip)
- [APL July structural testing article](https://www.jhuapl.edu/news/news-releases/260709-dragonfly-clears-key-tests-as-assembly-comes-together)
- [APL photograph file](https://www.jhuapl.edu/sites/default/files/2026-07/20260709-Dragonfly-Tap-Test.jpg)
- [NASA April primary-structure report](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/): identifies honeycomb primary panels designed by APL and manufactured by Lockheed Martin. This does not establish a specific nose-panel layup.
- [ICES-2023 paper](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content)
- [APL spacecraft/CAD source](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php)

Original photographs are unretouched. Comparison layout/crop and WebGL renders are by
Codex; no image generation used. APL media are not assumed public domain or endorsed for
every reuse. Existing model-reference attribution and rights caveat remain applicable.

## What Changed, and What Is Unresolved

`dist/nose-bulkhead.mjs`, revision `nose-bulkhead-provisional-2026-10-19`, replaces the old
single gray block. It retains the original model-frame center **[0,-0.13,-1.56] m**, width
**0.70 m**, height **0.40 m**, nominal depth **0.020 m**, all **[EST]**. Model +Y is up,
nose toward -Z. No new published dimension was found.

Drawn details are estimates: 3 mm face representation, 18 mm perimeter returns, 12 mm
clipped corners, four small mounting feet, simplified joint fasteners and two local tape
marks. Silver appearance is informed by the structure photographs, not a verified alloy or
coating identification. Mounts extend 10 mm aft of the old panel's back plane; clearance is
tested, not obtained by moving other equipment. No new holes, honeycomb cells, face/core
bond lines, plumbing, electronics or hidden ribs are claimed.

Casings hides the perimeter representation; Covers hides the face and face fasteners;
Mounts hides the feet/bolts. These are inspection masks, **not verified flight-disassembly
steps or a real access hatch**. Empty space behind the hidden face means unmodeled material,
not a hollow flight bulkhead. The original number 03, equipment-bay thermal zone and the
rest of the vehicle remain intact. Label anchor is on the top perimeter, not a free center.

## Samples and Checks

- `real-cad-model-comparison.jpg`: two real hardware views, separately labeled 2024/2023
  CAD references, closed model sample and face-hidden process sample.
- `nose-bulkhead-closed.png`, `nose-bulkhead-rear.png`, `nose-bulkhead-face-hidden.png`:
  dedicated neutral-lit WebGL closeups, not photographs of hardware.
- `nose-bulkhead-internal-*.png` / `thermal-*.png`: four raw angles and desktop/390/360 px
  UI captures; `nose-bulkhead-context.png` retains the full installed layout.
- `render-checks.json`: real Edge/WebGL UI checks. Four-angle canvas pixel checks also
  passed: nonblank, framed geometry, no page errors or horizontal overflow.
- Five focused Node tests: preserved dimensions and provisional metadata; independent
  masks/anchor; no invented hidden core; clearance with rebuilt neighbors including camera
  and fiber harness routes; count stays 19 and #03 stays unchecked. Whole-suite release
  result is recorded in CHANGELOG.

Previous exact model/UI files, four-angle views and restore steps are in
[`../../archive/nose-bulkhead-2026-10-19/`](../../archive/nose-bulkhead-2026-10-19/README.md).

## Continue From Here

Find an unobscured identified NOSE bulkhead photo and an authoritative dimension before
adding apertures/ribs or checking off #03. Compare with the camera mounting panel (#04),
which is a separate assembly; do not merge or move it to fake agreement. Verify materials
and real panel stack before exposing any interior core. Preserve these provisional assets
in a new archive before replacing them. Next independent candidates remain #05, #09,
#20 and #21; all need their own source assessment. Do not alter the separate game lab.
