# DrACO electrical evidence and blower scale audit — October 27, 2026

Historical audit. October 28 supplier-referenced replacement is documented
[here](../draco-blower-pair-2026-10-27/README.md). This audit's script/preview now
load its exact archived compact geometry, preserving original measurements.
Statements below describe the state when this audit was performed.

Codex (OpenAI). This is an evidence/fit audit, **not a rebuilt blower asset**.
No geometry, sensors, connectors, pinouts, power model or flight state changed.
The app nests a closed **Electrical audit & blower size** disclosure inside
**DrACO side-by-side inventory**, with existing component-focus buttons.

## Findings and sources

1. [Barber-Nichols BNCP-74-000 catalog](https://barber-nichols.com/cryogenic-compressors-blowers/)
   explicitly identifies DrACO. [PUB] 345 mm length, 168 mm diameter, 2.83 kg,
   1.3 L/s, 190 m gas head, up to 25,000 rpm. Head is not pressure in Pa or an
   altitude; speed is blower speed, not flight rotor speed. Flow/head reference
   conditions are not stated. No flight installation drawing, electrical power,
   voltage or mating/pinout specification is established by this listing.
   The neighboring BNCP-21 water/glycol description is a different product.
2. [Supplier article, June 11, 2024](https://barber-nichols.com/barber-nichols-blower-will-ride-on-nasas-dragonfly-rotorcraft-to-saturns-moon-titan/)
   identifies two engineering-model blowers. Actual bench hardware shows a long
   motor/cone assembly, not our compact volute placeholders. The composite's upper
   left is NASA concept art; lower/right panels are real hardware. Catalog photo
   has an edited blue background. Saved originals, hashes and scope:
   [source packet](../sources/barber-nichols-draco-2026-10-27/README.md).
3. [AMS2024 Adams et al.](https://www.esmats.eu/amspapers/pastpapers/pdfs/2024/adams.pdf)
   reports development motor-current telemetry; checked pages do not identify
   flight feed sensor count/type, plugs or wiring. Existing EM1 pictures and paper
   pages are reused, not duplicated. Test telemetry is not proof of a Hall sensor,
   encoder, limit switch or a particular flight current-sensing circuit.
4. [Costa et al., IEEE 2022 KArLE sample handling](https://www.tighecosta.com/_files/ugd/8865be_78ab5b9dc0f34c1897151e60748e2ae1.pdf)
   gives a related-system example: Hall sensors, a 1024-count optical encoder and
   a home switch. Its DrACO retainer/elevator heritage does not establish these
   sensors as Dragonfly equipment. [Saved pages 1 and 4](../sources/karle-shs-2022/README.md).
5. [LPSC2022 DrACO flow schematic](https://www.hou.usra.edu/meetings/lpsc2022/pdf/1069.pdf)
   supports sample-routing function and blower redundancy, not valve electronics.
   Sample diverters are separate from thermal trim valves; gas ports are not
   electrical feedthroughs. Existing source pages reused.

## Measured current model

Run `node research/draco-electrical-audit-2026-10-27/audit.mjs` to reproduce
[measurements.json](measurements.json). This reads actual unchanged meshes.

| Comparison | Current illustration | Supplier reference |
|---|---:|---:|
| Full Y span / published assembly length | 117.5 mm | 345 mm |
| Casing span / published diameter | 79.3 mm | 168 mm |
| Pair transverse center spacing | 85 mm | No installed spacing published here |

[CALC] About 2.94× the current axial span and 2.12× the casing span. Reference
length includes the supplier assembly, while current span is the entire modeled
unit; casing comparison excludes projecting ports. These are scale screens,
not a claim about exact flight envelopes. Parallel 168 mm bounding cylinders at
current centers overlap by 83 mm. **This is not actual solid-collision proof**:
cone shape, orientation and flight locations remain unresolved.

## Next pass — part 24, before electrical leads

- Archive the current pair, then rebuild its visible motor/cone/flange exterior
  using the real supplier photos and published overall dimensions. Fitted hidden
  details, materials, feet and port dimensions must remain EST.
- Reconcile the **pair together**: centers/orientation, physical supports, inlet,
  exhaust and selector/return connection. Preserve two redundant units; do not
  add a third guessed blower. Check other rebuilt parts in installed layers.
- Compare the older APL cylinder/cone candidate in
  `research/draco-plumbing-2026-10-14/apl-cad-2024-frame-9s-crossref.jpg` only as
  an arrangement clue; its identity and orientation are not confirmed.
- Do not infer a flight motor voltage, watts, pinout, controller or sensor from
  loose EM test wires. Resolve housing/port fit before routing new leads.
- Keep part numbering 1–24, Open interior defaults, isolation, both-drill sample
  routes, saved layer modes and removable access layers intact.
- Preserve original photos/source credits and show one useful real/model/scale
  comparison. Do not make redundant copies for every cable or column.

## Verification and recovery

721 tests passed with bounded concurrency. Four new tests cover source units,
unresolved-interface boundaries, exact geometry preservation and nested disclosure/
focus behavior. Desktop/390px phone checks and samples recorded beside this file.
Baseline: 58148de; recovery tag `archive/draco-electrical-audit-2026-10-27`.
[Exact before sources / restore](../../archive/draco-electrical-audit-2026-10-27/README.md).
Supplier figures are read-only references; no new mass/flow/power budgets inferred.

Published **5e25b65**. [Pages run 40602293824](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/40602293824)
succeeded, including tests. Live build, closed audit, Open interior, 24 numbered
parts and no overflow/errors verified; public screenshot/JSON saved. First CDN
load was static preflight; one reload loaded the new modules successfully.

**Correction after owner clarification, screenshot 2026-10-27 193738:** the
curved line is `main-harness-navigation-meb` in `main-harness.mjs`, NOT the
part-5 shelf leg. `part-5-support.png` and the duct sample are retained records
of the wrong initial identification, not evidence for the questioned line.
The new `owner-navigation-line-clarification.png` makes the intended line clear.

This branch starts on the shared trunk at [0,-.268,-1.0] m and ends near Ocellus
MEB at [-.2,-.235,-1.262] m. It belongs to the **Bay harness** assembly, so part-5
isolation hides it. Its network end joins the trunk, but its equipment end has
no assigned plug or mating interface: **unfinished**, not a verified hidden
connection. This was already recorded as `mating-interface-unresolved` in
[the October23 endpoint register](../harness-endpoints-2026-10-23/ENDPOINTS.md).
The FEB/IMU branch is separately unresolved. Checklist corrected; no geometry,
flight connector/circuit or destination invented during this diagnosis.
