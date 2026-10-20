# Part 09: Research audit and individual controller inspection

Codex (OpenAI), October 19, 2026. **Not a completed photo-referenced rebuild.**
Part 09 remains unchecked; total **20/24 initial passes (5 Codex / 15 Claude)**.
Current revision: `rde-provisional-inspection-2026-10-19`.

## What changed

The two existing illustrative controllers now expose individual `rde-1` / `rde-2`
subassembly selectors under the original part `rde` (number 09). Each owns independent
casing/cover/mount/cooling/connector groups. Existing layer masks hide Covers, Casings,
Mounts and Interfaces and restore them without changing installation or framing.
Original part anchor/thermal zone remain intact; unit anchors are vehicle-frame lid centers.
The part's expandable details now cite AAC and APL's workshop abstract and state that
cover removal exposes UNMODELED electronics, not verified empty flight hardware.

Every mesh vertex, index, vehicle-frame world matrix and material color/metalness/roughness
is checked against a browser-exported pre-change manifest. No geometry or material changes,
new boards/pinouts/harnesses, simulation states, cooling solver, fan animation or flight
behavior added. No completed neighbor moved. The separate game is untouched.

## Evidence and deeper-search outcome

| Source | Evidence | Boundary |
|---|---|---|
| [ICES-2023-389](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content), Coker et al. / APL, pp5/7 | Two RDE boxes and internal fans [PUB]; historical thermal CAD | CAD colors are temperatures, not finishes; no manufacturing dimensions |
| [CAPS2024 slide27](https://www.nationalacademies.org/cdn/materials/9fba0b12-d11a-482c-a46a-0b8de31e5dbd), Elizabeth Turtle / APL | Real RDE thermal-module team photograph in TPEC | Module obscured; adjacent large-chamber DTM photos are NOT controller casing evidence |
| [AAC2023 announcement](https://www.a-a-c.com/wp-content/uploads/2023/04/JHU-APL-Titan-PR.pdf) | Actual mission supplier: motor-controller current sensors and spacecraft custom magnetics | Earlier Shuttle/ISS/Hubble supply does not establish reuse of the same part; no board/enclosure appearance |
| [Kozak / APL G-RADNEXT2026 abstract](https://indico.cern.ch/event/1577141/page/42829-speakers-information) | RDE/fan wide-bandgap power-device research | No published presentation attached; electrical radiation-test ratings are not vehicle limits |
| [TT Electronics2026](https://www.ttelectronics.com/news/optek-sensors-nasa-dragonfly/) | OMH3075S selected for Dragonfly fan assemblies | Which fan assembly and installation unresolved; not geometry evidence |
| [NASA X-57 project](https://www.nasa.gov/centers-and-facilities/armstrong/x-57-project-creates-paths-toward-electric-aviation-2/) | Real air-cooled SiC motor-controller testing on another project | Related technology ONLY; no Dragonfly hardware reuse established. Did not copy its casing or claim its photograph is RDE |

[Saved supplier page and credits/access audit](../sources/rde-supplier-2026/README.md).
Harsono et al. journal DOI `10.1115/1.4065947` / conference DOI `10.1115/IPACK2023-111414`
remain valuable unresolved full-text leads; publisher PDF403, ResearchGate no full text.
Neville/Pfeiffer/Kozak's 2024 *Design and Analysis of a SiC-MOSFET Based Three-Phase Motor
Drive for an Off-World Application* found through proceedings metadata only, not inspected
hardware figures. Related gate-driver, generic UAV, Ingenuity and similarly named commercial
controllers do not establish an exact Dragonfly casing. No fabricated reference match.

## Unchanged estimates / fit

[EST] X/Z centers (-.16,-.55)/(+.16,-.55) m; width .24, depth .26; bottomY -.266,
topY -.09, floorY -.284; illustrative fan radius .031. All finish, vents, fan number/layout,
connector blanks, mounts and installed placement remain estimates. No new sensor package
or supplier dimensions promoted to Dragonfly flight dimensions. Existing per-piece clearance
test runs against rebuilt neighbors, including the current battery; new inspection tests
check stable anchors, select validation, hide/restore and exact old-mesh preservation.

## Samples / verification

- [Real / CAD / current-model comparison](rde-real-cad-model-comparison.jpg): real test-scene
  crop keeps its identifying caption; original full slide remains saved. CAD is visibly labeled.
- `after/`: actual pair/unit Internal and Thermal screenshots at1440/390/360; installed
  context, hidden covers, two raw Three.js renders and GL pixel/framing checks.
- `verify-render.cjs`: reproducible real-Edge acceptance; 18 selector/layer/width cases,
  cover hide/restore, Pilot return, no horizontal overflow or page errors. Two raw samples
  are nonblank and framed. Baseline capture6cases saved in archive. All **386 tests pass**.
- [Archive](../../archive/rde-inspection-2026-10-19/README.md): exact prior module/UI/test,
  fresh baseline pictures, per-mesh manifest and recovery tag on7ab195e.

## Handoff / next

Do not check off09 or call this a photo-matched redraw. Seek a readable identified RDE
engineering/flight photo, scale and arrangement or accessible Harsono figures; no repeated
unbounded search of the same failed DOI. A family photo must be cross-checked for actual
Dragonfly adoption. If proceeding with an appearance approximation, retain explicit estimate
labels and owner approval boundaries rather than turning related-project evidence into fact.
Other unfinished initial passes:03,20,21. Do not restart completed05/22 or edit game assets.
Preserve Claude's 15 completed passes. Archive the CURRENT revision before replacing it.
Release `5d85fd0` and its recovery tag are pushed to main and the feature branch. GitHub Pages
run39355386898 succeeded. `verify-live.cjs` passed in real Edge on the public site:
stamped module/revision, original part09, count20, both selectors at1440/390/360, source links,
cover hide/restore through Thermal and Pilot return; no page/network failures or horizontal
overflow. Six public screenshots and JSON are saved in `live/`. This verification follow-up
changes documentation/acceptance artifacts only, not application code.
