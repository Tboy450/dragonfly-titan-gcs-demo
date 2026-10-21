# Part20: battery-temperature sensor family approximation

Codex (OpenAI), October 21, 2026. Revision `battery-sensor-family-estimate-2026-10-21`.
Owner requested the remaining sensors as labeled approximations, then the generator body
and structural layers. **23/24 initial passes (8 Codex / 15 Claude)** after this pass.
Actual Dragonfly sensor identification and installation remain open.

## Sources before modeling

The [TE reference archive](../sources/te44909-family/README.md) preserves the real44909
product photograph, 44900-family photograph, dimension drawing and color/rating table.
TESS-ANDO-DS0059 Rev A supplies the 2.4 mm maximum body envelope and two32 AWG leads,
minimum3 inches long. DS0050 supplies the black/gray code and -55 to +90 C range.
These are manufacturer-authored sheets retrieved through public distributor mirrors.

The [NASA/APL audit](../battery-measurement-2026-10-20/README.md) remains applicable:
TFAWS2023 slides7/9 establish battery-temperature feedback, not its flight package/count.
ICES2022 photographs show a ground-test battery module. Related TE space heritage and
DrEAM/MEDLI reuse do not prove battery-sensor adoption. No new flight-hardware claim is made.
CAD in the process comparison is the existing 2022 test-module layout, not a sensor photograph.

## Model and installation

- [PUB-family] 2.4 mm maximum bead envelope, two32 AWG leads; [CALC] 3 inches =76.2 mm.
- [EST] bead depth1.32 mm/profile, gray-end coverage and material appearance. The gray end
  follows the bead surface; no hidden ceramic pellet/electronics or removable lid invented.
- [EST] body center[-.31086,-.07,.635]m, derived from the existing battery's port wall;
  .2 mm bond pad, two local adhesive tacks and slightly bowed paired leads. The previous
  annotation was on the opposite wall; neither location is a published sensing coordinate.
  The new installed example sits against the panel, clear of its ribs and rebuilt neighbors.
- Lead ends stop at explicitly unmodeled routing. One example does not establish sensor
  count, per-cell location or a flight harness destination. No connector/pinout fabricated.
- Original part ID `battery-sensor`, number20, battery context and bulk-temperature reading
  retained. Thermal colors use that existing temperature; no new sensor law, lag, noise,
  thermal contact model, wiring behavior or power consumption.
- Casings, Mounts and Harnesses hide separately. Existing Subassembly selector offers bead
  macro focus and bonding/leads focus. Hardware is not scaled up: optional bounded
  `inspectionMinimumRadiusM` changes only inspection framing (3 mm floor for the bead).
  Other parts retain their previous .22 m minimum framing radius. Physical poses stay fixed.
- Family temperature rating is inappropriate for Titan ambient or the157 C fin-root example.
  Part21 needs its own higher-temperature reference; do not reuse this model automatically.

## Samples, archive and verification

- [Real / drawing / CAD / actual-model comparison](battery-sensor-real-cad-model-comparison.jpg).
- `after/sensor-macro.png`: actual model close-up; its long leads extend beyond this crop.
- `after/sensor-installation.png`: full installed example with pads and complete lead lengths.
- `after/`:18 Internal/Thermal viewport/selector cases at1440/390/360px, four angles,
  three independent mask captures, cover hide/restore and Pilot return. `render-checks.json`
  records browser checks; `clearance.json` records the installed-frame component check.
- `verify-render.cjs`: real Edge, DOM overflow, model/source/count, mask restoration,
  raw GL context/framing and exact archived battery/part21 mesh-manifest comparisons.
  Sensor-versus-neighbor bounds are tested in the installed vehicle frame, avoiding false
  overlaps from rotated world-axis boxes. These are geometry checks, not flight qualification.
- Unit tests cover real-scale envelope, wall contact, two lead lengths/separation, masks,
  bounded opt-in macro focus, unchanged battery/part21 and accurate completion labels.
  Full suite: **438 pass, zero failures**, saved in `tests.txt`. Gray/body surfaces share
  the same vertex set with disjoint triangles, preventing the macro coating artifact.
- [Recovery archive](../../archive/battery-sensor-2026-10-21/README.md) includes exact old
  annotation files, fresh baseline renders/manifests and both unpublished finish drafts.

## Continuation

Next: **21 fin-root sensor**, then **MMRTG body**, then **first structural wall**. Finish each
with its own source/photo/dimension review, archive, installed clearance checks and comparison.
Do not restart20 or previously completed parts to inflate completion counts.

The owner's expanded request is recorded in
[Remaining Work Packages](../../INTERIOR-REALISM-TODO.md#remaining-work-packages-expanded-october21-at-owners-request):
endpoint register; unit service loops; floor/wall/attic/camera/arm/RF/sensor routes; thermal and
sample connections; mounts/supports; skin/deck/foam/casing boundaries; task-specific view presets;
and a final Mission/Pilot/science/assumptions/source/mobile/interaction audit. Initial numbered
parts, installation, construction access and whole-project acceptance have separate statuses.
Long explanations remain expandable. Preserve scrolling/Ctrl zoom, unrelated game work and
Claude's credits. Exact undocumented flight interfaces remain follow-ups, not invented details.
