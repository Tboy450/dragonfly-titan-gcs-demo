# MMRTG generator body

Codex (OpenAI), October22,2026. Revision `mmrtg-body-2026-10-22`.
Exterior follow-up after the24 numbered initial passes; count remains24/24 (9 Codex/15 Claude).

## Evidence and implementation

[Original saved photograph and technical page](../sources/nasa-mmrtg-hardware/README.md):
NASA PIA23306 shows real Mars2020 generator hardware before fueling/testing. Pale thin fins,
root attachments, narrower housing and stepped metal end features inform appearance.
Cataldo/Bennett PDF p15 fig12 is a historical technical cutaway, used for structure names and
the64 cm fin-tip /66 cm length envelope, corroborated by the saved NASA2020 fact sheet.
The cutaway is not appearance evidence; the ground cradle/lifting fixture is not flight gear.

`dist/mmrtg.mjs` builds eight shared thin fin plates with clipped corners/shallow edge slots,
root rails/tabs/fasteners, pale housing, metal covers/collar and a covered connector example.
Only overall envelope/architecture is [PUB]; detailed housing radius14.5 cm, fin thickness
2.5 mm,48 cm fin length, finish, slot/fastener layout and interfaces are [EST]. Mars hardware
appearance does not establish Dragonfly's final coating or connection variant.

The original25-degree bulkhead pose is retained. Axial bounds[-.34,+.32]m give66 cm length;
mounting neck reaches the existing base plane. Narrow end profiles mean the physical projected
rear edge need not occupy every corner of the prior coarse bounding envelope. No completed
neighbor is moved. Sensor21 shares the housing/fin dimension contract and is refitted to the
new radius. Its2 x2 x0.8 mm package, lead lengths and generator-frame angle/axial point remain
unchanged; bond underside now follows the smaller cylinder. Exact flight sensor location stays
unconfirmed. Its asset revision is `fin-root-rtd-family-fit-2026-10-22`.

## Inspection and limits

The existing Component selector now includes **MMRTG generator body**, an unnumbered exterior
assembly. The24 callouts/numbered rows remain unchanged; this does not become part25.
Housing, eight fins/roots and end interfaces focus separately. Casings, Covers, Mounts and
Interfaces hide independently, restore in place and retain sensor21 context. A selected
unnumbered assembly has normal component/source details without a fictitious numeric label.

Opening covers reveals unmodeled space. Fuel, internal insulation and thermoelectric couples
are not built; no empty-flight-chamber claim. Historical sealed argon cover gas is distinguished
from external Titan nitrogen-rich circulation. No Mars-specific liquid loop, shipping frame,
hidden pinout or new heat-transfer/energy/control solver added. Thermal retains the existing
generator-gas zone rather than separate fin/housing temperatures.

## Process and checks

- [Real / cutaway / before / new model comparison](mmrtg-real-cad-model-comparison.jpg).
- [Exact prior files and fresh pictures](../../archive/mmrtg-body-2026-10-22/README.md), recovery
  tag on6276276. Old sphere/annotation and subsequent RTD archives remain separately preserved.
- `tests/mmrtg.test.mjs`: overall envelope, eight shared thin plates/open slots, root attachment,
  generator pose, layers/focus, no extra numbered label, sensor fit, finite geometry and bounded
  mesh budget. Existing sensor tests now compare actual shared geometry parameters rather than
  the old builder's cylinder/box source literals.
- `verify-render.cjs`:24 Internal/Thermal viewport/subassembly cases1440/390/360px; source detail,
  unchanged24 rows, masks/restore, refitted21 macro and Pilot return. Raw actual Three.js
  three-quarter/front/mount renders have nonblank/framed GL pixel checks. Installed-frame
  generator vertices clear numbered neighbors and stabilizers; battery/20 manifests unchanged.
  These are visualization checks, not mechanical/flight qualification.
- Full suite: **450 pass, zero failures**, saved in `tests.txt`. Local24 viewport/layer/
  subassembly cases pass without page/network failures or overflow. Reference/model comparison
  and raw three-quarter/front/mount images visually inspected before publication.
- Concurrent game work through2190944 merged intact; shared changelog resolved by retaining
  both complete entries. Combined suite **458 pass**, saved `merged-tests.txt`. No game code
  manually edited; simulator/body files are unchanged by the merge.

## Published acceptance

Release `4449203` includes model commit `9f6f243` and concurrent game work through
`2190944`. [Pages run39726749517](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/39726749517)
completed successfully. Recovery tag `archive/mmrtg-body-2026-10-22` is pushed.

Public Edge acceptance against stamped build4449203 passed all24 Internal/Thermal
viewport/subassembly cases at1440/390/360px, with no page/network failures or overflow.
The new stamped module loaded; original24 numbered rows, independent masks/restore,
sensor21 refit, reference links and Pilot return passed. Screenshots and machine-readable
receipt are in [live-4449203](live-4449203/checks.json). Combined458-test results remain in
`merged-tests.txt`; no repeat suite was needed for this documentation-only receipt.
Local preview server is stopped. Comparison image includes real hardware, technical
cutaway, before model, rebuilt model and phone inspection.

## Next

**First structural side-wall panel** next. Review photographed support/frame geometry and
camera apertures; keep skin, foam and equipment covers independently inspectable where
references support them. Harnesses, supports, penetrations, further layer presets and final
whole-project UI/source/assumptions audit remain in `INTERIOR-REALISM-TODO.md`. Do not restart
the completed numbered parts. Generator-specific future items: actual Dragonfly coating,
fin/root/profile dimensions, collar/duct/connector variant and flight sensor installation.
