# Part 10: High-Gain Antenna Gimbal, Arm and Locks, Rebuild

Implemented October 14, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`hga-gimbal-2026-10-14`. Source: `dist/hga-gimbal.mjs` (the dish itself stays in
`dist/vehicle-research.mjs`). An **educational reconstruction from published figures, text and
photos**, not CAD. The durable part id stays `hga-actuators`; the part is now the whole gimbal.

## Sources and Credits

| Source (saved here or in `../sources/`) | What it gives |
|---|---|
| ICES-2023-389 p. 2 and fig. 1 (`../sources/ices2023-389-lander-thermal/ices2023-389-p03.jpg`; crop `ices2023-fig1-hga-crop.jpg`) | "The HGA assembly, including actuators for movement in azimuth and elevation, are under the light tan foam forward of the HGA"; the launch lock (red in the model) under the dish, the flight locks (green) on either side of it. The figure shows the stowed dish flat on the deck and a tan foam cylinder lying across the body just aft of the attic. |
| ICES-2023-389 fig. 3 (`.../ices2023-389-p05.jpg`; crop `ices2023-fig3-actuator-crop.jpg`) | The HGA actuators run cold (thermally tied to Titan); drawn as a stacked turntable under a hooded drum, about 36-40% back from the nose. |
| ICES-2020-160 p. 5 (`../sources/ices2020-160-thermal-overview/`) | The gimbal's internal portion is under the deck and thermally tied to the fluid loop; the part above the deck is under a 5 cm Rohacell dome that lets the dish move in azimuth and elevation; the gimbal-to-dish attachment is thermally isolated; a 10 W gimbal preheater. (Its panorama cameras on the HGA are not in the 2026 DragonCam camera list, so none are drawn.) |
| APL release, July 9, 2026, photo "Jackson Banbury inspects the motorized arm", credit NASA/Johns Hopkins APL/Ed Whitman ([page](https://www.jhuapl.edu/news/news-releases/260709-dragonfly-clears-key-tests-as-assembly-comes-together)); saved `apl-hga-arm-2026-07.jpg` (1440 x 808) | The flight arm: a gold actuator drum with a curved gold tube, the arm, a gray truss pedestal under the dish center with a flexible (corrugated) feed line and a small connector bracket, gold hardware under the deck. Text: the arm raises the antenna when stationary and lowers it into a locking mechanism before each flight; the antenna is a foam disc between two slotted metal plates, 87.4 cm wide. |
| NASA Dragonfly blog, June 1, 2026, photo of Matt Bray with the HGA in APL's test chamber, credit NASA/Johns Hopkins APL/Ed Whitman ([page](https://science.nasa.gov/blogs/dragonfly/2026/06/01/nasas-dragonfly-flight-system-faces-heat/); [full 6144 x 4098](https://assets.science.nasa.gov/content/dam/science/missions/dragonfly/HGA_chamber.jpg)); saved at 2048 px as `nasa-hga-test-chamber-2026-06.jpg` | The slotted face: orange Kapton over pairs of slots in rings. Text: attached to the top deck on a gimbal; covered with Kapton. |
| TFAWS 2023 slide 3 (`../sources/tfaws2023-thermal-controller/tfaws23-at-14-slide03.jpg`) | The dish raised, standing nearly upright just aft of the attic. |
| Cross-reference only: NASA printable model assembly guide pp. 2-3 (credit Gary Allen Backus/Backus Creative Imaging; built "using only publicly available imagery"), `cross-reference-nasa-print-model-guide-p02.jpg`, `-p03.jpg`; the STL parts (HGA base, mount, dish) were checked but are laid out on a print plate, not in assembly positions | Same layout: a swivel base in a round deck recess, an elbow actuator on it, the dish on two legs reaching aft over the deck. |

No patent specific to this gimbal was found.

## What Was Built

| Feature | Basis |
|---|---|
| Hinge (elevation axis, across the body) at z -0.55, 0.6 m forward of the stowed dish center, just aft of the attic's aft wall (z -0.73) | [PUB] "forward of the HGA"; [EST] distance measured on ICES-2023 fig. 1 with the dish's 87.4 cm as the ruler (the dish's width matched the figure's cross-body scale) |
| Internal portion under the deck: stator flange with bolts, gold azimuth bearing housing, azimuth motor and cap, rotary joint and flange (where the TWTA waveguide enters), drive connector and harness to a tie, collar through the deck foam | [PUB] internal portion under the deck; gold hardware under the deck in the APL photo; parts and sizes [EST] |
| Above the deck: two-tier turntable, yoke, gold elevation drum with end caps, elevation motor, cable wrap, all under a 5 cm Rohacell dome (a capsule lying across the body, see-through in Internal) | [PUB] fig. 3 turntable and hooded drum, fig. 1 tan foam, ICES-2020 5 cm dome; APL photo gold drum; sizes [EST] |
| Arm: root fitting, two tubes, brace, end fitting; gray truss pedestal; G-10-colored thermal isolator; flexible corrugated feed to the dish center; connector bracket | APL photo; ICES-2020 isolated attachment; the flight pedestal is taller than drawn [EST] |
| Launch lock (post and cup) under the dish's aft rim, with a pin under the dish; two flight locks with jaws at 65 degrees either side | [PUB] launch lock under the dish, flight locks either side; positions, shapes and colors [EST] (the papers' red and green are model colors) |
| Dish: orange Kapton face, gold-orange edge, 4 cm higher than before (center y 0.25) on the pedestal. Slot layout read from the full-resolution chamber photo (crops `nasa-hga-photo-crop-center.jpg`, `-rim.jpg`): perpendicular slot pairs on one continuous spiral about 2.7 cm per turn (about 16 turns), each pair turned by half its angle around the disc (the classic circularly polarized layout, theta = phi/2 + 45 degrees), the two slots side by side along the spiral (herringbone near the rim), slots about 0.9 cm long near the center and 1.7 cm at the rim, seven round spots around the feed and a few scattered ones. Comparison: `model-dish-texture-vs-photo.jpg`, `model-dish-texture-detail.jpg` | NASA chamber photo, measured with the dish's 87.4 cm as the scale; exact counts not published. A first ring version is archived (`archive/hga-dish-rings-2026-10-14`) |
| Motion: the arm rises first, then the azimuth stage turns; the dish face points along Earth's direction, so the arm points away from it | Az/el gimbal at the base (ICES-2023); the arm raises the dish (APL) |
| Azimuth limit: turns that would put the dish into the attic are pulled back toward aft. At the simulator's 55-degree Earth elevation the dish points straight at Earth only when Earth is roughly ahead of the nose; otherwise it stops at the limit (up to about 60 degrees off) | [EST]: the flight range is not published; downlink rate in the simulator does not depend on pointing |

## Not Known / Not Modeled

- Real actuator, turntable and arm sizes; the azimuth and elevation ranges; the lock designs.
- The tall gold structure with orange X-panels and a cone on top beside the dish in APL's photo
  (perhaps part of the locking mechanism); not drawn.
- How RF crosses the gimbal (rotary joints or a cable wrap); the TWTA waveguide stops at an
  under-deck rotary joint.
- Earth's real elevation at the landing site over a Titan day, which sets the arm angle.

## Checks

- `tests/hga-gimbal.test.mjs`: hinge forward of the dish and aft of the attic, arm length;
  internal portion under the deck and actuators above it under a dome about 5 cm thick; stowed
  dish on its launch lock and two flight locks; pointing at 120 target directions (exact unless
  limited, elevation kept when limited); never in the attic at any deploy stage for 36 Earth
  azimuths; layer groups; clear of every rebuilt part (the TWTA waveguide meets only the
  rotary-joint flange). `tests/twta.test.mjs` checks the new waveguide route. All 198 tests pass.
- Mission -> Internal isolated at four angles, stowed, raised and half-raised; installed views;
  Exterior stowed and raised; the pilot view with the dish raised. `model-*.jpg` are those views;
  `model-vs-sources.jpg` sets them beside the APL photo and ICES-2023 figs. 1 and 3.

Previous placeholder, pole-mounted antenna and dish face: [`archive/hga-actuators-2026-10-14`](../../archive/hga-actuators-2026-10-14/README.md).
The TWTA's first waveguide route: [`archive/twta-waveguide-v1-2026-10-14`](../../archive/twta-waveguide-v1-2026-10-14/README.md).
