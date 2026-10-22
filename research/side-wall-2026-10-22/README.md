# First Structural Side Wall

Codex (OpenAI), October22,2026. One additive starboard panel, not a whole-vehicle
skin/foam replacement. No generated imagery; original hardware photographs retained.

## Evidence and dimensions

- [NASA April23 primary-structure report](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/),
  rechecked October22: honeycomb primary panels designed by Johns Hopkins APL and made by
  Lockheed Martin Space; aluminum facesheets0.01in thick. [PUB]0.254mm =0.01x25.4.
  [Original saved April hardware photo](../lander-structure-2026/nasa-apl-top-deck-fit-check.jpg).
- [NASA July9 structure report](https://science.nasa.gov/blogs/dragonfly/2026/07/09/nasas-dragonfly-clears-key-tests-as-titan-rotorcraft-takes-shape/)
  and [APL report](https://www.jhuapl.edu/news/news-releases/260709-dragonfly-clears-key-tests-as-assembly-comes-together).
  [Original real frame photo](../rotor-heads-2026-10-15/nasa-apl-lander-frame-tap-test-2026-05.jpg)
  informs silver faces, perimeter joints/fasteners and gold tape. Both photographs credited
  NASA/Johns Hopkins APL/Ed Whitman. Test mass blocks, temporary red fixtures, blue test
  leads, suspension cords and ground-handling fittings are not treated as flight equipment.
- [ICES2023 thermal CAD p5](../sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg),
  Coker et al., JHUAPL, [paper](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content).
  Arrangement context only, not appearance/layup evidence. Existing saved original sources
  reused rather than downloading duplicate images.

## Model and limits

`dist/side-wall.mjs`, revision `starboard-wall-2026-10-22`, models two actual-thickness
aluminum faces plus perimeter closeout strips, simple fasteners and local tape. [EST]
model-frame inner/outer x=.3605/.3725m; separation12mm, z=-1.50..+.99m,
y=-.31..+.07m. Outline, face separation, silver finish, closeouts and fastener/tape pattern
are approximations, not recovered flight dimensions. No honeycomb pitch, core alloy,
bondline, local inserts or hidden equipment internals invented. Opening a face exposes
unmodeled core space, not an actual empty chamber. Inspection is not a flight servicing
sequence. Thickness is not exaggerated to improve visibility.

The existing starboard Down Camera stays fixed. A bottom-edge relief z=.10..+.22m,
up to y=-.19m clears its housing/bracket/feedthrough; this is an installation estimate,
not proof of that flight aperture. Shoulder-base load paths are not yet connected across
the old simplified foam shell. Panel ends stop short of the existing end bulkheads;
their joints are a later pass. The opposite wall is not silently mirrored.

The original solid combined body/foam approximation stays unchanged (ghosted in Internal).
It is NOT a new accurately separated7.62cm foam layer. Its geometry occupies the new panel
space; resolving that representation, actual local insulation thickness and camera blisters
is queued before claiming a complete construction stack. No thermal conductance, mass,
energy, airflow, flight, game or saved-state changes. Thermal uses the shared bay node,
not a wall-temperature solution.

## Inspection

The Component selector includes unnumbered **Starboard structural wall**. Outer face,
inner face and edge fittings focus separately. Covers/Casings/Mounts hide those groups
independently; global **Structural wall panels** hides the whole panel while retaining
the older Body shell control. Existing24 numbered parts and authorship remain unchanged.
Long explanation stays under the existing component/assumptions expandable sections.

## Checks and process

- [Real/CAD/model/app comparison](side-wall-real-cad-model-comparison.jpg).
- [Before files, pictures, failed draft and restore steps](../../archive/side-wall-2026-10-22/README.md).
  First placement x=.351..+.363m crossed the PSU and TWTA harness. Draft code, pictures
  and failures retained. Panel moved9.5mm outward; completed hardware did not move.
- Five focused tests cover real face thickness, finite/bounded geometry, three independent
  masks/restoration, no added number/invented core, actual open camera relief.
- Browser helper checks24 Internal/Thermal viewport/subassembly cases at1440/390/360px,
  sources, unchanged numbered rows, masks, installed context and Pilot return. All numbered
  geometry/pose manifests compare exactly to baseline (JSON-normalized signed zeros).
  Triangle/plane intersection samples check wall faces against numbered hardware and
  shoulders. This is a visualization clearance check, not mechanical qualification.
- Three raw-model views have nonblank/framed WebGL pixel checks. Screenshots and
  machine-readable receipts are saved under `after/`; exact source originals stay in their
  original credited research folders. Full-suite and public release results recorded at closeout.
- Full suite: **463 tests pass, zero failures**, saved in `tests.txt`. Local browser24
  cases and source/mask/Pilot checks pass without page/network errors or horizontal overflow.
  Geometry manifests for all24 numbered parts match the baseline; wall-face crossings are
  empty. Source/model comparison and raw views visually reviewed. Physical wall is classified
  as structure, not equipment inside the insulated cavity. Public acceptance follows deployment.
- Concurrent work through `22e7df8` merged intact: game alerts/sound/graphics quality and
  Pages actions update. Both changelog blocks retained; no game or workflow code manually
  edited. Combined **469 tests pass**, saved in `merged-tests.txt`. Simulator implementation
  unchanged by that merge.

## Published acceptance

Model commit `25a1dae`, combined release `1d05c6d`. [Pages run39729103197](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/39729103197)
succeeded, including the updated Node24 Pages actions. Pre-wall recovery tag is pushed.
[Public build](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=1d05c6d) passed24
Internal/Thermal viewport/subassembly cases at1440/390/360px, original24 numbered rows,
all three part masks and global Structural wall panels hide/restore, source links and
Pilot return with no page/network failures or horizontal overflow. Receipt/screenshots
are in [live-1d05c6d](live-1d05c6d/checks.json). Local preview server stopped.
Receipt-only commit skips CI; app unchanged, no repeat tests or duplicate deployment.

## Next

### Construction inventory at this checkpoint

| Representation | Owner/control | What it hides / remaining work |
|---|---|---|
| Combined body surface and foam | `fuselage`, Body shell | Ghosted full solid; not separated foam thickness or structural laminate. Retained baseline. |
| Forward attic cover/foam | `attic`, Attic shell | Cold/warm instrument region; separate skins and local insulation still queued. |
| New starboard wall | `starboard-wall`, Structural wall panels | Two faces + closeouts, with three per-part masks. Core space unmodeled; exact fittings/ends open. |
| End partitions | Existing numbered03/16, Compartment panels | Prior approved bulkhead approximations. No duplication into the new wall. |
| Equipment housings | Existing per-unit masks | Casings/lids independent of structure; opening them does not invent hidden hardware. |
| Camera windows/cavities | Existing23 layers | Existing Down Camera unchanged; estimated wall relief. Local foam blister remains open. |

Opposite side/end interfaces next, then deck/attic boundary and region-by-region foam
separation. Preserve the original24 parts, fit without moving completed equipment, and
archive every changed draft. Do not infer hidden core cells or a continuous metal liner
from the simplified inspection model. Detailed harness/support/layer/UI packages remain
in `INTERIOR-REALISM-TODO.md`. Do not restart the completed numbered initial passes.
