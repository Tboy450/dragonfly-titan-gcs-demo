# Parts 02 and 24: DrACO Sample-Transfer Lines and Blowers

Implemented October 14, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`draco-plumbing-2026-10-14`. Source: `dist/draco-plumbing.mjs`. Replaces the single tube per
side and the one-cylinder blower placeholder, archived in
[`archive/draco-plumbing-2026-10-14`](../../archive/draco-plumbing-2026-10-14/README.md).

## Primary sources

| Source | What it gives |
|---|---|
| [`../sources/draco-lpsc2022/`](../sources/draco-lpsc2022/README.md): DrACO, LPSC 2022, fig. 1 and schematic (crop: `lpsc2022-fig1-configuration.jpg`) | The flow: drills -> flow path -> flow diverters at the carousel -> carousel -> flow diverters -> two blowers -> exhaust. Text: two redundant drills and two redundant centrifugal blowers (impellers designed for Titan air), cross-strapped so either drill can feed the LDMS or GCMS cups using either blower; the cups catch particles from the moving airstream |
| [`../sources/honeybee-kiss-2022/`](../sources/honeybee-kiss-2022/README.md): slides 21-22 | Same schematic with "Forward Blower" and "Aft Blower"; "transfer tube can be easily routed" |
| [NASA, Playing Lacrosse on Titan](https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/) | "the flexible vacuum hose can be routed around any obstacle"; two redundant blowers |
| ICES-2023-389 p. 5, p. 7 and fig. 2 (`ices2023-fig2-blower-behind-port-arm.jpg`; page in [`../sources/ices2023-389-lander-thermal/`](../sources/ices2023-389-lander-thermal/README.md)) | The drill and blower are exposed directly to Titan; the blower is "visible behind the port forward arm" and leaks heat there |

## Cross-reference only

At the owner's direction, APL's visualizations are a cross-check, not the drawing source:
`apl-cutaway-draco-crossref.jpg` (payload cutaway) and `apl-cad-2024-frame-9s-crossref.jpg`,
`apl-cad-2024-frame-12s-crossref.jpg` (frames of APL's 2024 rotating CAD movie, credit Johns
Hopkins APL). They agree that the transfer tubes run forward along the lower body side on
brackets and up the front of the attic. They also show details not drawn here (a vertical
cylinder-and-cone unit under the port attic; perforated tube brackets).

## What was built

| Part | Basis |
|---|---|
| Flexible hose from each drill's pneumatic port to a fixed fitting under the body edge; it follows the drill head down while drilling | [PUB] flexible hose; route [EST] |
| Rigid transfer tube (about 13 mm OD) forward under each body edge, up the side of the nose and into the cold attic | fig. 1 topology; route and size [EST] |
| Flow-diverter manifold seated on the carousel's sample inlet: both intakes in, the return out, an actuator on top | [PUB] flow diverters at the carousel; shape [EST]. The carousel (Codex) has one sample inlet, so both elevators are represented by this one junction |
| Return tube from the manifold down the port side and aft to the blowers | fig. 1 topology; route [EST] |
| Inlet flow diverter choosing the forward or aft blower | schematic [PUB]; shape [EST] |
| Forward and aft centrifugal blowers: volute housing with a scroll bulge, motor below, axial inlet on top, tangential exhaust pointing outboard and down with a flared mouth, bracket to the body | [PUB] two centrifugal blowers, exhaust; ICES: behind the port forward arm; sizes [EST] |
| Clamps along the tubes | [EST] |

Both blowers are on the port side (ICES and fig. 1 show them together). The sampling animation's
particles now follow the new port route into the carousel inlet.

## Not known / noted

- Real tube sizes, exact routes, and how the flow diverters and cup elevators are built.
- The carousel has one sample inlet; the paper describes separate LDMS and GCMS elevators.
- The cross-reference frames show a cylinder-and-cone unit under the port attic whose role is
  not identified in the published text; not drawn.
- Noted, not fixed (older parts): the tubes run along and into the fuselage and attic shells,
  which is expected; no other unrebuilt part is crossed.

## Checks

`tests/draco-plumbing.test.mjs`: every element of the fig. 1 flow present; each hose meets its
drill's port when stowed and at full stroke; the manifold sits on the carousel inlet; the return
line ends at the blower diverter; blowers outside the port side, aft of the forward arm root and
forward of the drill; exhaust outboard and down; no overlap with any rebuilt part (tubes checked
point by point along their length). The isolation test now includes the blowers with the
lines. 178 tests pass. `model-vs-sources.jpg` compares fig. 1 and ICES fig. 2 with the model.
