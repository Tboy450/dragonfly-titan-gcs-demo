# Part Sources: Photos, Figures and Patents for Each Rebuilt Part

Every photo, paper figure and patent drawing a part is built from is saved in this project,
with its citation, link and credit. Papers are saved as page images, not PDFs. Add a row here
in the same change as every part rebuild (step 3 of the process in `INTERIOR-REALISM-TODO.md`).

## Shared sources (saved pages)

| Folder | Source | Pages saved | Used by |
|---|---|---|---|
| [`sources/scitech2024-sdc-drams-interface`](sources/scitech2024-sdc-drams-interface/README.md) | Barfknecht et al. (NASA Goddard), *Development of the thermal interface between the Dragonfly Mass Spectrometer and the DrACO Sample Delivery Carousel*, AIAA SciTech 2024 | pp. 2, 3, 5, 7, 8 (figs. 1, 2, 5, 6, 8, 9, 10, 11) | 06, 07, 08 |
| [`sources/ices2023-389-lander-thermal`](sources/ices2023-389-lander-thermal/README.md) | Coker, Holtzman et al. (APL), *Dragonfly: Lander Thermal System Modeling*, ICES-2023-389 | pp. 3, 5, 6, 7 (figs. 1, 3, 4; Wonderwall and fan text) | placement of all interior parts; 07, 08 |
| [`sources/tfaws2023-thermal-controller`](sources/tfaws2023-thermal-controller/README.md) | Holtzman and Castaño (APL), *Dragonfly Lander: Thermal Controller Design*, TFAWS 2023 (TFAWS23-AT-14) | slide 3 (top view of the lander, used to calibrate model coordinates) | all parts |
| [`sources/icubesat2019-frontier-radio`](sources/icubesat2019-frontier-radio/README.md) | O'Neill (APL), *The Frontier Radio Virtual Radio*, iCubeSat 2019 | p. 2 (table: Frontier 2,050 cc, 2.1 kg) | 13 |
| [`sources/dragoncam-2026`](sources/dragoncam-2026/README.md) | Clark et al. (MSSS), DragonCam Microscopic Camera, 2026 | pp. 2, 3, 5, 9, 15 (figs. 1-3, 5, 11-12, 23; table 1) | 23, 04 |
| [`sources/draco-lpsc2022`](sources/draco-lpsc2022/README.md) | Zacny et al. (Honeybee/APL/Goddard), DrACO, LPSC 2022 | both pages (figs. 1-4) | 01, 02, 06, 24 |
| [`sources/honeybee-kiss-2022`](sources/honeybee-kiss-2022/README.md) | Zacny (Honeybee), KISS workshop slides | slides 20-22 | 01, 02, 24 |
| [`sources/tfaws2024-dtm`](sources/tfaws2024-dtm/README.md) | Lin (APL), Development Test Module, TFAWS 2024 | slides 5, 7, 9, 14 | 17, 18, 19, layout |
| [`sources/connector-standards`](sources/connector-standards/README.md) | Glenair Micro-D (MIL-DTL-83513) table; TE D-sub listings | Micro-D table page | 11, 12 (connector sizes and scale) |
| [`sources/patent-us8417859-jhu-sdr`](sources/patent-us8417859-jhu-sdr/README.md) | US 8,417,859 B2, *Low power, low mass, modular, multi-band software-defined radios*, Haskins and Millard, Johns Hopkins University, 2013 | front page and all 8 drawing sheets | 13 |

## By part

| Part | Photos (saved) | Figures and patents (saved) | Links only (not saved) | Notes |
|---|---|---|---|---|
| **06 Sample carousel** | [`carousel-2026-10-12/`](carousel-2026-10-12/README.md): `nasa-carousel-integration.jpg`, `nasa-carousel-overhead.jpg` (NASA/Mike Guinto, SVS 15003) | SciTech 2024 figs. 1, 2, 5, 6, 8, 9, 10; TFAWS 2023 slide 3 | [NASA April 2026 update](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/) | No patent found for the carousel |
| **07 Wonderwall** | uses the carousel photos above | SciTech 2024 figs. 2, 11; ICES-2023-389 p. 7 | | Notes: [`wonderwall-2026-10-12.md`](wonderwall-2026-10-12.md) |
| **08 DraMS** | [`drams-2026-10-12/`](drams-2026-10-12/README.md): `nasa-drams-integrated.jpg` (NASA/Mike Guinto, SVS 15003) | SciTech 2024 figs. 1, 2, 11; ICES-2023-389 p. 7 (laser fan) | [NASA spacecraft page](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/), [Goddard DraMS project](https://science.gsfc.nasa.gov/674/projects/459/), [ICES-2023-109](https://ttu-ir.tdl.org/server/api/core/bitstreams/29ec2f82-fb12-489e-865b-81cfb7622e4e/content) | |
| **11 Power switching units** | [`power-units-2026-10-13/`](power-units-2026-10-13/README.md): NASA/APL testing photo (full 6723 x 4480 and 1280 px), PSU crop, face-map overlay | connector standards; no PSU patent found | [NASA March 2026 blog](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/) ("both PSUs"), [APL release](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins) | Two units published; size scaled from the photo |
| **12 IEM** | [`iem-2026-10-13/`](iem-2026-10-13/README.md): two NASA/APL integration photos (harness photo also full 3000 x 3996; APL's copies) and APL's video cover | connector standards; no IEM patent found | [NASA March 2026 blog](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/), [APL release](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins) | No published size; scaled from the photos |
| **01 Drills** | [`drills-2026-10-13/`](drills-2026-10-13/README.md): Costa portfolio photos (2018-19 test hardware), NASA lab photo, NASA print-model assembly page | DrACO LPSC 2022 figs. 1-2; Honeybee slides; DragonCam fig. 3; APL cutaway | [Costa portfolio](https://www.tighecosta.com/draco), [NASA Playing Lacrosse on Titan](https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/) | No drill patent found; sizes proportioned [EST] |
| **04 Nose cameras** | [`nose-cameras-2026-10-13/`](nose-cameras-2026-10-13/README.md): fig. 1 camera-difference crops | DragonCam paper pages | [arXiv 2601.13221](https://arxiv.org/abs/2601.13221) | Camera types published; positions and pointing from figs. 2-3 [EST] |
| **23 Lower cameras** | none (CAD figures and a prototype photo are in the paper) | DragonCam paper pages | [arXiv 2601.13221](https://arxiv.org/abs/2601.13221) | Microscopic Camera geometry published; Down Camera position estimated |
| **13 Frontier radio** | [`frontier-radio-2026-10-13/`](frontier-radio-2026-10-13/README.md): `nasa-apl-frontier-radio.jpg` (Johns Hopkins APL) | iCubeSat 2019 p. 2; patent US 8,417,859 (slice architecture) | [SmallSat 2016 SSC16-VII-2](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=3383&context=smallsat) ("four or more 4 x 6 inch packaged slices"; the site blocks automated download), [eoPortal](https://www.eoportal.org/satellite-missions/frontier-radio) | |

## Leads not yet used

- US 11,827,388 B2, *Sample collection system for interplanetary vehicle* (Honeybee Robotics,
  2023, [Google Patents](https://patents.google.com/patent/US11827388B2/en)): a footpad sampler
  with gas jets, bellows and a container carousel. It is not DrACO's drill-and-blower system, but
  may help with parts 01, 02 and 24.
- US 8,693,388, *Space based local area network* (slice-based software-defined radio): not yet
  checked.

## Other saved reference sets

- [`apl-spacecraft-models/`](apl-spacecraft-models/README.md): APL's rotating CAD video, angle
  sheet and payload picture (whole-vehicle shape).
- [`backdrop-sources/`](backdrop-sources/README.md): NASA imagery for the Exterior backdrops.
- [`lander-structure-2026/`](lander-structure-2026/README.md): NASA/APL top-deck fit check (April 2026),
  lander body side panels and gold end bulkhead; leads for parts 03 and 16 and the open frame.
