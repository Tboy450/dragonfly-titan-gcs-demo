# Drill feed covers and paired dust bellows

Codex (OpenAI), October27,2026. Baselinee42240d; recovery tag
`archive/drill-feed-stage-2026-10-27`.

## Evidence and scope

Reuse [real EM1 feed photo, AMS2024 printed192 fig.2](../sources/draco-ams2024/README.md)
and the real bellows fabrication pictures/fold diagram on printed197. These support
the covered drive, gearbox, metal guide and paired polymer sleeve arrangement.
This is development hardware; dimensions and current flight configuration are not
established. Original2022 CAD is retained only as context for the unchanged head.
No generated imagery or CGI-derived material finish used.

Covered drive outline, fitted size/position, supports, collars and16-fold octagonal
sleeves are EST. Published ETFE film thickness is a source reference, not modeled
wall thickness. The corrugation is a hollow surface approximation, not an exact
origami crease pattern, seal, fatigue or thermal-conduction solver. Development
160/300 mm travel figures are not substituted for the retained130 mm simulation.

## Change and preservation

- Replace the exposed Z-drive can/gearhead illustration with a gray panel cover,
  black gearbox housing, a provisional can inside, and a separate joint cover.
- Retain guide dimensions with a metal finish and face groove examples.
- Shorten the estimated carriage adapter/relocate its two bolts so sleeve collars
  meet the adapter without crossing it. Main drill head, bit, nut center and screw
  remain unchanged. Fine rollers and the self-aligning joint are not rebuilt yet.
- Add upper/lower sleeves, end collars and a lower stand-off. Upper mount remains
  exact; lower mounting return is cut from90 to40 mm depth, retaining guide contact
  and clearing the sleeve. A drive mounting foot meets the upper mount.
- `Covers` independently hides sleeves/actuator/joint covers, revealing the screw
  and provisional motor. `Casings`, `Interfaces`, `Mounts` and `Harnesses` stay separate.
- `setFeed` updates sleeve geometry in place as well as the retained moving leads.
  All cable curves/ends/buffers, sample hoses and routes, bit depth and flight/science
  behavior are unchanged. No remote wiring or new controller endpoint is invented.

## Verification

669 tests pass. Seven new regressions cover archived preservation outside an exact
name allowlist;41 feed positions; end contact/fold pitch; hollow shaft corridor;
outward triangles and stable buffers; supported fittings; independent masks; and
sampled sleeve-to-installed-mesh triangle checks through the real sampling pose.
The previous lead-clearance and strict pneumatic continuity tests still pass.
Earlier preservation tests explicitly defer only these stage meshes to this suite.

Desktop Internal/Thermal, Covers hide/restore and390px phone checked:24 numbered
parts, two drill focuses,1265/1265px desktop and375/375px phone, zero browser errors.
Local sample paused at15.9096 s, with port extended and starboard stowed. No existing
public mission reset. `port-stowed.png`, `port-extended.png`, `port-covers-off.png`,
`phone-port.png`, `thermal-starboard.png`, `browser-checks.json` and `measurements.json`
save the actual results. Comparison reuses credited real/CAD sources with a new model
sample. Published **dc0ee8a3d29714ac351f562772c53408fddd3863**, October27,2026.
[Public app](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=dc0ee8a).
Pages40497034993 succeeded including669 tests. Live build, new stage/surface-only
disclosures,24 parts/two targets,1265/1265px and zero errors verified. `public-port.png`
and `public-checks.json` saved. Recovery tag pushed. Local server stopped, viewport
restored and shared project tab returned to the public app. Receipt: Codex (OpenAI).

## Continue from here

Next mechanical subpass: EM1-style roller carriage, guide contact/V grooves and the
self-aligning nut/U-joint exterior. Inspect the saved photo and the paper's fig.6
before adding hidden parts. Preserve the completed sleeves/leads initially; recheck
the whole stroke if an evidence-led fit change is needed. Actual flight travel,
load path, enclosure interiors and assembly/disassembly sequence remain unverified.
Feed actuator/sensor wiring, body-to-controller continuations and other complete
electrical networks remain open. No Assets Lab, Swarmfall, saves or Git cleanup edits.
