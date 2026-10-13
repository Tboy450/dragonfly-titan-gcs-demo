# Part 04: Nose Cameras

Implemented October 13, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`nose-cameras-2026-10-13`. Sources: `dist/nose-cameras.mjs` and the shared camera heads in
`dist/ecam.mjs`. Replaces the three placeholder boxes archived in
[`archive/nose-cameras-2026-10-13`](../../archive/nose-cameras-2026-10-13/README.md).

## Source

The DragonCam paper (Clark et al., MSSS, 2026, [arXiv 2601.13221](https://arxiv.org/abs/2601.13221)),
figs. 1-3; pages in [`../sources/dragoncam-2026/`](../sources/dragoncam-2026/README.md).

## Published facts used

- Five ECAM-P50 cameras with 5.8 mm lenses (Down, Side and Forward WAC), one ECAM-P50 with a
  12.6 mm lens (Forward MAC), the Microscopic Camera, and two redundant NavCams for
  terrain-relative navigation that connect directly to the spacecraft: nine cameras.
- Fig. 2 puts the Forward MAC, both Side Cameras, the NavCams and the Forward WAC in the nose;
  fig. 3 shows them on a vertical panel just behind the nose cap, an upper block and two low
  units at the chin (one angled forward-down, one pointing down).
- Each camera looks through a window (3 mm on the cameras the paper describes).

## Differences between the cameras (fig. 1)

`fig1-camera-differences.jpg` crops each camera type. As the owner pointed out, fig. 1 is a CGI
image showing the same body from different angles. The real differences:

| Camera | What differs | Drawn as |
|---|---|---|
| Five P50s with 5.8 mm lenses | none: same body and lens | standard head |
| One camera | black flared hood on the lens | Forward MAC (inference: it is the only camera with a different lens, 12.6 mm; flared hoods are also common on wide lenses, so this is not certain) |
| Two NavCams | pale-yellow ribbed top plate, wider than the body, bolted at the corners (their mounting interface) | NavCam head, plate toward the panel |
| Microscopic Camera | focus mechanism | part 23 |

## Placement (all [EST] from figs. 2-3)

Scaled from the nose tip (z -1.93) to the MMRTG end (z +1.92):

| Camera | Position (x, y, z) m | Pointing |
|---|---|---|
| Camera panel | plate at z -1.665, 0.40 x 0.44 m | |
| Forward MAC | (-0.10, -0.04, -1.72) | forward |
| Port Side Camera | (-0.12, 0.08, -1.71) | port, 15 degrees down |
| Starboard Side Camera | (0.12, 0.00, -1.71) | starboard, 15 degrees down |
| Forward WAC | (0, -0.21, -1.83) | forward, 45 degrees down |
| NavCams A, B | (-/+0.085, -0.27, -1.745) | straight down |

Which low unit is the Forward WAC and which are the NavCams is not labeled clearly in fig. 2;
the NavCams are drawn pointing down at the terrain (their navigation role) and the Forward WAC
angled forward-down. Pointing angles, panel size, windows and harness runs are estimates.

## Noted, not fixed (older parts)

The 2026 CAD's chin is fuller than this model's nose shell: the CAD's underside reaches about
z -1.70, the model's only z -1.48. The low cameras (Forward WAC, NavCams) therefore stand a few
centimeters out of the older nose shell. They are interior-layer parts, so this is not visible
in the Exterior view. Settle it when the fuselage nose is redrawn.

## Checks

`tests/nose-cameras.test.mjs`: six nose cameras of the published types (nine with the lower
three), the same body for every P50 type, the hood only on the Forward MAC, yellow plates only
on the NavCams, each camera pointing as drawn, bodies between the nose tip and the panel, 3 mm
windows, separate layers, no overlaps between nose cameras or with any rebuilt part. 170 tests
pass. `model-vs-paper.jpg` compares figs. 2-3 and the fig. 1 heads with the model.
