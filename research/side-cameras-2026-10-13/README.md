# Part 23: Lower DragonCam Cameras

Implemented October 13, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`side-cameras-2026-10-13`. Sources: `dist/side-cameras.mjs` and the shared camera head
`dist/ecam.mjs`. Replaces the two placeholder boxes archived in
[`archive/side-cameras-2026-10-13`](../../archive/side-cameras-2026-10-13/README.md).

## Source

Clark, Ravine, Caplinger (Malin Space Science Systems), Lindenfeld, Laramee (Motiv Space
Systems), Bronson, Giglio (Collins Aerospace), Crowther (Synopsys), *Optomechanical Design of the
DragonCam Microscopic Camera*, 2026, [arXiv 2601.13221](https://arxiv.org/abs/2601.13221).
Pages saved in [`../sources/dragoncam-2026/`](../sources/dragoncam-2026/README.md).

## What was built, and on what basis

| Item | Basis |
|---|---|
| Microscopic Camera (ECAM-L50 + focus mechanism), port side, aft of the port drill | figs. 2-3 (side and location) [PUB] |
| Placed 986 mm from the drill site at 52 degrees to the surface normal, lens aimed at it | table 1 and text [PUB]; the drill site is the model's port drill at the ground |
| 155 mm long, inside a 105 x 90 mm section; 1.04 kg | table 1 [PUB]; split between housing, lens and motor [EST] |
| APL LED array beside it, aimed at the same spot, with a 365 nm UV emitter | text [PUB]; emitter layout and other bands [EST] (bands up to 935 nm are mentioned) |
| Down Camera on each side (ECAM-P50, 5.8 mm lens), looking straight down | figs. 1-2 [PUB]; position mid-body [EST from figs. 2-3] |
| Camera heads: stacked black housing, orange side panels, feet, top connector with red flex, stepped black lens with orange ring | figs. 1 and 5 (CAD); black lens parts from the prototype photo (fig. 23) |
| Each camera in a foam cavity behind a 3 mm window | text [PUB] |
| Brackets on the bay wall's outer face, harness through the wall to the camera electronics inside | [EST] |

**Correction (October 13):** this note first said fig. 3 confirms the model's drill position.
That came from a rough scale taken off the rotor pods. Scaled properly from the nose tip to the
MMRTG end, fig. 3 puts the drill about 0.36 m forward of center; the model's drill (part 01, not
yet redrawn) is at 0.43 m, about 7 cm further forward. The Microscopic Camera is placed from the
model's drill site and will move with the drill when part 01 is redrawn. Fig. 3 by itself puts
the camera at about z +0.47, y -0.26 m in the model frame (published geometry from the model's
drill site gives z +0.34, y -0.24).

## Not known / not modeled

- The Microscopic Camera is about 9 cm thick but the foam averages 7.62 cm, so the foam must be
  locally thicker there; the camera bulges outward and the blister is not drawn.
- Down Cameras' exact position and the ECAM-P50 head size (proportioned against the
  Microscopic Camera in fig. 1).
- The camera electronics box (ECAM-DVR8P) inside the bay.
- Overlap with the old trim-chimney placeholder (#19), to settle when #19 is redrawn.
- The nose cameras (NavCams, Forward MAC and WAC, Side Cameras) are part #04.

## Checks

`tests/side-cameras.test.mjs`: 986 mm and 52 degrees from the drill site, lens aimed at it, port
side and aft of the drill, 155 mm long within 105 x 90 mm, LED array co-aligned with a UV
emitter, Down Cameras looking straight down through the bottom surface, a 3 mm window at the
outer foam for every camera, separate layers, and no overlap with any rebuilt part (mesh by
mesh). 167 tests pass. `model-vs-paper.jpg` compares figs. 1 and 3 with the model (port side;
the starboard Down Camera is hidden in those close-ups).
