# Part 01: DrACO Sample Acquisition Drills

Implemented October 13, 2026 by Claude (Anthropic Claude Opus 5.5). Revision `drills-2026-10-13`.
Source: `dist/drills.mjs`. Replaces Codex's simplified drills, archived in
[`archive/drills-2026-10-13`](../../archive/drills-2026-10-13/README.md).

## Sources

| Source | What it gives |
|---|---|
| [`../sources/draco-lpsc2022/`](../sources/draco-lpsc2022/README.md): Zacny et al., DrACO, LPSC 2022 | **Fig. 2** (Phase B CAD): drill head with separate percussion and rotation actuators, Z-stage rail and motor with lead screw, swivel with pneumatic port, hollow bit with side opening and slotted crown. **Fig. 1**: two drills beside the body near the forward legs. Text: two redundant rotary-percussive drills, up to 6 cm deep, suction through the hollow bit, openings exclude particles over 1.5 mm. |
| [`../sources/honeybee-kiss-2022/`](../sources/honeybee-kiss-2022/README.md): Honeybee slides 20-22 | Same layout; "hammer drill (x2)" |
| APL payload cutaway (`dist/assets/vehicle-references/payload-cutaway.webp`, credit Johns Hopkins APL) | The red drill just aft of the forward leg, transfer lines rising to the attic |
| `nasa-print-model-assembly-p2.jpg`: NASA printable model, assembly guide p. 2 (credit Gary Allen Backus / Backus Creative Imaging) | Step 3: the drill glued to the body side just aft of the forward leg |
| [`../sources/dragoncam-2026/`](../sources/dragoncam-2026/README.md): DragonCam fig. 3 | Side view of the drill (about 0.7 m tall) and the Microscopic Camera aimed at its site |
| `costa-*.jpg`: Tighe Costa's DrACO portfolio (Honeybee Robotics design lead), [tighecosta.com/draco](https://www.tighecosta.com/draco) | 2018 drill bit and pneumatic inlet in a Titan-like chamber; 2019 full-scale DrACO brassboard; LDMS cups in the carousel; cryogenic ammonia-ice sample. Early test hardware, not flight |
| `nasa-draco-team-lab.png`: [NASA, "Playing Lacrosse on Titan"](https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/) | DrACO team in Honeybee's lab; text: two drills and two blowers cross-strapped, ~10 mm cups |

Photos were re-saved at 2400 px with camera metadata removed.

## What was built

| Feature | Basis |
|---|---|
| Gold drill-head housing with bolt bosses and an upper block | fig. 2 |
| Percussion actuator on top, rotation actuator on the front, silver bands at their bases | fig. 2 [PUB: separate actuators] |
| Gold percussion column with a slot showing the spring | fig. 2 |
| Red Z-stage rail, lead screw, silver Z motor and gearhead at the top, lower bracket | fig. 2 |
| Carriage bracket and lead-screw nut: the whole head slides down the rail while drilling | fig. 2; motion [EST] |
| Silver swivel with an angled two-fitting pneumatic port | fig. 2 |
| Hollow bit with a side opening and a crown of teeth and slots; only the bit turns | fig. 2, text [PUB] |
| Brackets from the rail to the body side; motor leads | [EST] |
| About 0.7 m from motor top to stowed bit tip | DragonCam fig. 3 [EST]; part sizes proportioned from fig. 2 |
| Stowed bit tip 7.2 cm above the skid contact plane; a full stroke drills 5.8 cm deep | [PUB] limit of 6 cm |
| Beside the body at x +/-0.54 m, 0.43 m forward of center | sources put it 0.34-0.45 m forward (print model, DragonCam fig. 3, APL cutaway); kept at Codex's 0.43 m [EST] |

Fig. 1 labels one drill "Aft Drill"; the schematic beside it (and the Honeybee slides) call the
pair port and starboard, so they are drawn one on each side.

## Not known / noted

- Real dimensions of every part; the colors follow the CAD (the red rail and gold housing may be
  CAD colors).
- The old sample-transfer line (part 02, not yet redrawn) still starts where the old drill
  head was; it should run from the new swivel port. Fix with part 02.
- No patent specific to the DrACO drill was found (Honeybee's US 11,827,388 and US 2020/0055619
  cover a footpad sampler).

## Checks

`tests/drills.test.mjs`: every fig. 2 part present; the carriage stays on the rail through the
full stroke; only the bit turns; stowed tips clear the ground and a full stroke stays within
6 cm; placement within the sources' range, inboard of the runners, mounts reaching the body
side; no overlap with any rebuilt part. The sampling test now checks the bit turning and the
head not spinning. 174 tests pass. `model-vs-sources.jpg` compares fig. 2, fig. 1 and the APL
cutaway with the model (one drill, a second view, and mid-drilling with the other stowed).
