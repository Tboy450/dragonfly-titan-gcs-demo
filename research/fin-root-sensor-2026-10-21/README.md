# Part21: MMRTG fin-root RTD example

Codex (OpenAI), October21,2026. Revision `fin-root-rtd-family-estimate-2026-10-21`.
**24/24 initial part passes (9 Codex / 15 Claude).** Flight-specific verification, the MMRTG
body, installation connections and structural layers remain open; the interior is not complete.

## Evidence and model

[Manufacturer photographs/drawing](../sources/omega-rtd-family/README.md), inspected before
editing: Omega F2020 Class B, nominal2 x2 x0.8 mm; paired10 mm x0.2 mm leads. Catalog Class B
range -70..500 C covers NASA's157 C fin-root rating. No Dragonfly/RTG adoption is established.
The real catalog photographs inform the small blue-glass/ceramic package; promotional star
highlights are not modeled. The separate exploded graphic is labeled illustration.

[NASA/APL controller evidence](../mmrtg-measurement-2026-10-20/README.md) remains unchanged:
fin-root temperature controls fan speed in the historical2023 design. No source establishes
flight type, supplier, count, exact sensing point, bond material, ownership or harness destination.
Pioneer fin-root instrumentation is historical context, not proof of package reuse.

`dist/mmrtg-measurement.mjs` preserves21's ID, MMRTG pose and temperature zone. The reference
element retains nominal dimensions; ceramic/glass split, finish, lead bends and mounting are
[EST]. A curved bond underside meets the existing0.2 m cylindrical housing; its flat top
supports the element. Estimated location:78 degrees in generator cross-section, axial+0.05 m,
beside the top fin. Recheck this against the upcoming generator-body replacement.

Two10 mm local leads stop without an invented connector or flight harness destination. One
example is not a physical count claim. No internal platinum circuit, pinout, sensor noise/lag,
accuracy or controller solver is added. Thermal still shows modeled MMRTG gas temperature,
not a measured fin-root value. Temperature rating alone does not qualify the installation.

Casings, Mounts and Harnesses hide independently. The existing subassembly selector offers
element and installation focus with bounded macro framing, without resizing hardware.
Glass is part of the package, not a removable lid. Labels follow the element in the canted
generator frame. Other source-based parts remain installed in their existing poses.

## Process and checks

- [Real / drawing / illustration / actual-model comparison](fin-root-real-cad-model-comparison.jpg).
- [Exact pre-pass archive](../../archive/fin-root-sensor-2026-10-21/README.md), committed baseline
  tag on5bf3431, fresh screenshots and MMRTG/battery/both-sensor mesh manifests.
- Unit tests: real-scale package/lead lengths, coating/base geometry, contact with cylindrical
  housing, all eight fins in their own frame, generator pose/label anchor, independent masks
  and evidence limits. Historic part20 preservation test compares21's pre-rebuild snapshot.
- `verify-render.cjs`: actual Edge,18 viewport/layer/subassembly cases1440/390/360, four
  orbit angles, masks/restore, source detail, Pilot return, nonblank macro/full-installation
  GL pixel checks and unchanged MMRTG/battery/battery-sensor manifests. Sensor vertices are
  checked in other numbered meshes' local bounds; own curved housing/fins use dedicated
  geometry tests. These checks are not mechanical or flight qualification.
- Full suite **444 pass, zero failures**, saved `tests.txt`. Local18 browser cases and GL
  previews pass; no numbered-neighbor intersections. MMRTG, battery and part20 mesh manifests
  match baseline exactly. Public acceptance uses `verify-live.cjs` through production controls.

## Next

**MMRTG body** next, then **first structural side wall**. Do not restart the completed sensors.
Use real generator photographs for appearance and NASA64 cm tip-to-tip /66 cm length for
scale; current core radius, fin thickness/profile and end features are still provisional.
Recheck21 placement/contact when that envelope changes. The detailed connections/construction/
views/UI roadmap remains in `INTERIOR-REALISM-TODO.md`;24 initial passes do not close it.
