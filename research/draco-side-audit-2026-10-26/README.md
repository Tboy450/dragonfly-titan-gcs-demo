# DrACO Side-By-Side Audit

Codex (OpenAI), October26-27,2026. Completed after the outreach interruption.
Recovery baseline a67cb6f; publication receipt follows live verification.

## Evidence And Findings

Reuse the existing credited source images; no new or generated reference imagery:

- Real prototype: `../drills-2026-10-13/costa-draco-brassboard.jpg` and
  `costa-drill-bit-inlet-chamber.jpg`, Tighe Costa / Honeybee Robotics,2018-19
  development hardware, https://www.tighecosta.com/draco . This is not flight hardware;
  its stand and ground-support wiring must not be copied onto the lander.
- Published system/design: `../sources/draco-lpsc2022/lpsc2022-1069-p01.jpg` and p02,
  Zacny et al., Honeybee/APL/NASA, LPSC2022 abstract1069 figs.1-2,
  https://www.hou.usra.edu/meetings/lpsc2022/pdf/1069.pdf . Two redundant drills and
  two shared cross-strapped blowers; geometry in the figure is Phase B CAD, not a photo.
- NASA's system description rechecked:
  https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/
- APL thermal paper: `../sources/ices2023-389-lander-thermal/ices2023-389-p04.jpg`
  fig.2 and p07 text. The text identifies a blower behind the port forward arm;
  it does not establish both exact flight blower positions. The older model places
  both there as an estimate, not as a fully photo-verified arrangement.
- DragonCam: `../sources/dragoncam-2026/dragoncam-p02.jpg` figs.1-2 and p03 fig.3,
  https://arxiv.org/abs/2601.13221 . Published arrangement identifies one Microscopic
  Camera and co-aligned LED assembly, plus port and starboard Down Cameras. These
  are optical equipment, not an extra drill head or justification for mirroring.
- Honeybee's scope includes avionics/software:
  https://www.blueorigin.com/news/dragonfly-selected-nasa-new-frontiers-mission .

| Inventory family | Port in model | Starboard in model | Interpretation |
|---|---|---|---|
| Drill head / rotation / percussion / feed | Same45 mesh pieces | Same45 mesh pieces | No missing named counterpart found; not a complete flight BOM |
| Body mounts / short motor leads | Two / two | Two / two | Estimated mounts and incomplete lead examples on both sides |
| Flexible intake hose / rigid intake | One / one | One / one | Both meet their drill ports during the modeled stroke |
| Sample-tube clamps | Seven | Four | Four per intake, plus three for the shared port return |
| Return / inlet diverter / blowers | One return and two blower approximations | No local copies | Shared redundancy; both exact flight positions not established |
| Nearby microscope / illumination | One / one | None | Published optical arrangement; do not mirror solely for symmetry |
| Down Camera | One | One | Both present |
| Complete electrical networks, guards | Unresolved | Unresolved | Not proof of missing hardware specifically on starboard |

`audit.mjs` builds the real modules and writes `inventory.json`; it is research-only.
The report records actual named counts, bounds, tube endpoints and camera positions.
No hardware geometry or endpoints changed in this audit.

## Changes And Verification

- Two independent drill-group inspection labels using the existing selector;
  craft-frame label anchors stay on their respective fixed rails during feed/rotation.
- Sample tubes/hoses classified as plumbing, separately hideable from electrical leads.
- Eight-row collapsed DrACO inventory, with source links and existing focus buttons.
  Buttons return the selected assembly to the viewport. Both-blower placement is
  explicitly estimated in the existing part24 assumptions as well as the inventory.
- Seven new tests: exact mesh/material/pose preservation at three feed states, equal
  named inventories, nine feed-position hose checks per side, reversible media-layer
  visibility, fixed-rail label attachment, disclosures and collapsed research-only UI.
- Focused command passes19 tests:
  `node --test tests/draco-side-audit.test.mjs tests/draco-plumbing.test.mjs tests/drills.test.mjs tests/sampling-connections.test.mjs`.
- All 652 tests pass. The existing layout preservation test retains every prior ID
  exactly once and explicitly adds only the two new inventory IDs; no control removed.
- Desktop and 390px-phone checks: 24 numbered parts, two drill targets and all 11 IEM
  targets retained; eight inventory rows collapsed by default, no horizontal overflow,
  no browser errors. Internal/Thermal samples are fully framed and have nonblank
  model-colored central pixels. Original-demo and Exterior hide research-only inventory.
- `browser-checks.json` records actual UI/DOM results, reversible tubing visibility,
  electrical-lead independence and inventory focus destinations. `render-checks.json`
  records screenshot pixel counts; `check-pixels.py` checks those saved screenshots,
  not hidden app state. Phone verification is viewport testing, not a physical-device test.
- `port-focus.png`, `starboard-focus.png`, `thermal-starboard.png`, `phone-port.png`
  and `phone-thermal-starboard.png` are inspection samples, not rebuilt hardware.
- Exact before files in `../../archive/draco-side-audit-2026-10-26/`, with recovery
  tag `archive/draco-side-audit-2026-10-26` on a67cb6f. Original source pictures reused.

## Remaining Work

October27 owner clarification: the concern is equipment attached near one drill in
the other view, not just equality of the isolated drill mechanisms. The original
isolated samples do not visually establish that surrounding installation. Saved
`assembled-port-neighborhood.png` and `assembled-starboard-neighborhood.png` from
live4f375be with isolation off and opposite camera directions; these are crops of
actual browser screenshots, not new geometry or generated reference images. Owner
confirmed this is the intended cluster, then asked whether both drills connect to it.
The [follow-up continuity pass](../draco-connectivity-2026-10-27/README.md) traces
both intakes and corrects a1 mm shared-return gap. The inventory above still does
not identify every visible fitting or verify internal valve passages.

Published release **4f375be4eefdddba286182873ae10436cc207de4**, October27,2026.
[Public simulator](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=4f375be).
GitHub Pages run40463472979 succeeded, including its complete test step. Live header
shows4f375be; eight inventory rows were collapsed on load, both drill targets work,
24 numbered parts and11 IEM focuses remain. Desktop1265/1265px, zero browser errors.
`public-checks.json` and `public-port-focus.png` save the actual public verification.
Recovery tag pushed; temporary local preview tab closed and server stopped.
Publication receipt signed Codex (OpenAI). Local/full CI suite:652 tests pass.

Keep every
`?v=dev` stamp; use command-local no-cleanup Git flags. No cleanup or pruning.
Next source-led installation candidate: the existing short drill motor leads and
their moving service accommodation. Preserve current endpoints initially, research
general cryogenic-flex/workmanship guidance and clearly label any accommodation
estimate. Do not invent remote controller endpoints or assert flight-qualified bends.

Open: full Z-feed/percussion/rotation wiring and moving service loops, blower and
diverter leads, identified avionics/mating endpoints, separate LDMS/GCMS elevators,
flight guards/hidden brackets and the unidentified older APL cylinder/cone. Do not
mirror unknown components, fabricate pinouts or claim full harness validation.
The IEM terminal capacity/topology issue remains open separately. Do not touch
Assets Lab, Swarmfall, game data or the paused OneDrive cleanup.
