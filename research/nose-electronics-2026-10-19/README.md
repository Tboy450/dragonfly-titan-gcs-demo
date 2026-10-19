# Part 05: MIMU Family Asset and Ocellus Dimension Study

**Latest evidence follow-up:** [inspected SQRLi review, Ocellus packaging CAD and real
digitizer-test photograph](../ocellus-evidence-2026-10-19/README.md). Prior "uninspected"
SQRLi/digitizer notes below are historical; they are now inspected, but still do not provide
an identified complete Ocellus flight-box photo. No geometry changed in that continuation.

Codex (OpenAI), October 19, 2026. **Partial: #05 stays unchecked, 19/24 unchanged**
(4 Codex, 15 Claude initial passes, not verified flight replicas). After deeper hardware-photo
research, both IMU cubes are now photo-referenced Honeywell space MIMU FAMILY approximations.
Exact Dragonfly variant/installation unconfirmed. Ocellus MEB/FEB remain dimension studies,
not photo-matched housings. No image generation, simulator-physics or separate game edits.

## Evidence and Image Types

- [Honeywell MIMU product page](https://www.honeywellaerospace.com/us/en/products-and-services/products/navigation-and-sensors/inertial-measurement-units/miniature-inertial-measurement-unit):
  real hardware/product imagery, not a Dragonfly installation photograph. Original saved
  in `../sources/honeywell-mimu-2026/`, credit Honeywell Aerospace. Retouch history unknown.
  Visible barrel, shallow rounded cap, ribs, flanges, side cover and external connectors
  inform appearance. Do not infer exact dimensions from perspective.
- [Current June 2026 supplier datasheet](https://prod-edam.honeywellaerospace.com/content/dam/honeywell-edam/aero/en-us/products/navigation-and-sensors/inertial-measurement-units/miniature-inertial-measurement-unit/documents/hon-aer-n61-1613-000-000-mimu-ds-v1-en.pdf?download=false):
  both original pages saved as PNG. Page 1 exterior image; page 2 exploded CAD, NOT an
  interior photo. Supplier family upper envelope: diameter 233.7 mm, height 169.9 mm.
  This is a limit, not an exact mission measurement. Legacy March 2021 URL returned 404;
  use current product-page download. No private hardware information used.
- [NASA/APL Uranus study Appendix C pp.184-185](https://science.nasa.gov/wp-content/uploads/2023/10/uranus-orbiter-and-probe-appendix-c.pdf):
  original pages downloaded/visually inspected, explicitly associate Honeywell MIMU with
  Dragonfly. Historical heritage heading is NOT proof Dragonfly has flown, nor exact
  part-number/velocity-channel/installation confirmation. Do not substitute the other SIRU.
- [Honeywell interview, April 2021](https://www.honeywellaerospace.com/us/en/insights/articles/people-behind-the-product):
  Mars 2020 space-MIMU heritage and customer's Dragonfly development; family corroboration,
  not a final procurement record.
- [NASA MSS 2023 p6](https://ntrs.nasa.gov/citations/20230004117): Ocellus MEB/FEB historical
  nominal dimensions, CAD only. Original in `../sources/nasa-mss2023-ocellus/`.
  [NASA overview](https://technology.nasa.gov/patent/GSC-TOPS-353) defines main electronics
  box/front-end box; these are separate from the redundant IMUs.
- [APL navigation filter paper](https://arxiv.org/abs/2307.13513), saved p2: two IMUs,
  not their exact enclosure/size.
- [NASA 2018 Kodiak article](https://www.nasa.gov/technology/self-driving-servicer-now-baselined-for-nasas-restore-l-satellite-servicing-demonstration/):
  `nasa-kodiak-heritage-not-ocellus.jpg`, real photo NASA/W. Hrybyk. Different, larger
  predecessor, NOT Ocellus; ports/optics not copied. ICES-2023 figs.3/4: older layout only.

[Extended search](PHOTO-AND-REUSE-SEARCH.md) records SpaceCube Mini, SQRLi and digitizer leads.
Common processor/platform does not mean identical packaging. SQRLi review/digitizer leads
are now inspected in the later follow-up; other SpaceCube board-photo leads remain uninspected.

## Parameters and Limits

`dist/nose-electronics.mjs`, revision `nose-electronics-mimu-family-2026-10-19`.
Native x/y/z = width/height/depth; positions are assembly bottom centers, not midpoints.

| Assembly | Envelope x/y/z (m) | Position (m), all [EST] | Yaw [EST] |
|---|---|---|---|
| Ocellus MEB | .2419 / .1204 / .1854 [PUB-2023-design] | [-.207,-.284,-1.39] | 90 degrees |
| Ocellus FEB | .234 / .127 / .232 [PUB-2023-design] | [.205,-.284,-1.393] | 0 |
| MIMU family A | .2337 / .1699 / .2337 [PUB-family-limit] | [.205,-.1,-1.393] | 0 |
| MIMU family B | .2337 / .1699 / .2337 [PUB-family-limit] | [.205,-.1,-1.145] | 180 degrees |

Both MIMUs use the full conservative family upper envelope. Main radius .104 m, cap profile,
rib/fastener counts, flange, side cover and connector details are [EST] from product imagery,
not dimensioned drawings or flight socket functions. Three capped connector shells shown;
no invented pins, boards, gyro internals, electrical harness, labels/serials or optical paths.
Hollow shells permit inspection masks: revealed empty space means UNMODELED, not empty flight
hardware. Independent covers/casings/mounts/interfaces preserve number 05 and its thermal zone.

Estimated shelf: .254 x .004 x .49 m centered [.205,-.102,-1.269]; .008 x .18 x .016 m posts
at x .338, y -.194, z -1.50/-1.04, feet on floor -.284. This is an inspection-layout study,
NOT a claimed Dragonfly flight bracket. Shelf intentionally touches unit bases. MIMU top
.0699 clears DraMS base .082 by about 12 mm [CALC from estimated installation]. All four
units clear each other/rebuilt neighbors at full source-envelope scale; old IMU/FEB overlaps
resolved without moving/shrinking completed parts. Lidar walls/lids/feet/neutral finishes
[EST], no photo match or invented devices. Supplier power/mass/thermal data not imported.

## Archive and Checks

`../../archive/nose-electronics-2026-10-19/` retains original four boxes/UI/before pictures,
flat/upright rejected poses and complete pre-MIMU dimension draft. Original baseline cf4c866.
Uncommitted drafts have no tags. Restore targeted logic, not whole later files/unrelated work.

`mimu-real-cad-model-comparison.jpg`: supplier hardware, exploded CAD, model sample.
`real-cad-model-comparison.jpg`: earlier Ocellus comparison, heritage explicitly labeled.
`imu-*-closed.png` / `*-cover-hidden.png` and Ocellus equivalents: actual WebGL process
samples. Internal/Thermal checks for four units plus shelf at 1440/390/360 px, four raw angles and
installed context retained; no horizontal overflow/page errors, pixel/framing checks pass.
Seven focused tests cover envelopes, unmodeled internals, stable focus/anchors, masks,
rebuilt-neighbor clearances and unchanged completion count. Full suite: 321 pass. Browser:
30 selector/view/viewport checks passed; eight raw-angle pixel/framing checks passed.

Published model commit **9e647ba**, main + isolated feature, recovery tag pushed. GitHub
Pages run [39301658664](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/39301658664)
succeeded. Public build verified in Edge: 1440/390/360 px, stamped module, five selectors,
source links, cover hide/restore between Internal/Thermal, clean Pilot return, no page or
network errors/overflow. `live-9e647ba-mimu-checks.json` and three screenshots record the
actual deployed build, distinct from local renders. Subsequent documentation-only commit
records this result without changing the model.

## Next Handoff

Keep #05 open. Find identified current Ocellus MEB/FEB photos; inspected SQRLi/digitizer
references are not license to copy unrelated housings/PCBs. Seek exact Dragonfly MIMU
variant, flight dimensions and mounting before calling this flight-specific. Preserve
credits and all real/CAD/model distinctions. No hidden internals without evidence.
Other open parts #03/#09/#20/#21. Do not restart #22 or touch the separate game.
