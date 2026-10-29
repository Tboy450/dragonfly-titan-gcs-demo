# Part18 fan-side duct transition

Codex (OpenAI), October29,2026. One thermal-interface/access update after the
part17 fan bores. Existing model family, scale, fans and simulation retained.

## Evidence and source limits

Rechecked the owner's saved primary references:

- [NASA/APL TFAWS2023 thermal controller](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf),
  slides3–4: fan/duct arrangement, heat distribution through atmospheric gas and
  an open return through the body. Plan/schematic is placement context, not a photo.
- [NASA/APL TFAWS2024 DTM](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf),
  slides5/7/14/15: real development module, section, fan test and pressure-drop
  context. Printed Ultem test duct and heater are not flight geometry/materials.

Reuse saved real DTM photographs and published plan/section images under
`../sources/tfaws2024-dtm/`, `../sources/tfaws2023-thermal-controller/` and the
earlier [real/plan source comparison](../fan-bore-2026-10-29/fan-real-plan-before-after.jpg).
No new appearance source or exact flight-fan/coupling drawing was established.
No duplicate source image set or full-source collage made for this adjoining part.

## Measured problem and change

The earlier solid transition ended at z0.995 m. Both unchanged flange-front
planes are at z1.002 m: a **7 mm illustration gap**. Its end caps also crossed
retained fan-blade/hub surfaces in the static installed audit.

Only `warm-duct-fan-transition` is replaced: a generic open rectangular shell,
**1.5 mm estimated wall**, with the original start size, overall width/height and
centerline endpoints. Its fan-side edge extends7 mm to the existing flange plane.
An estimated16 mm constant-section throat accommodates the unchanged rotor
envelope before the narrowing/sloping section. A straight taper failed a rotor
sweep and is recorded in the archive's rejected-draft parameters.

The retained rotor forward bound is z0.9925816 m, about9.42 mm forward of the
flange plane. The16 mm throat is an accommodation for this reconstruction, not
an asserted flight coupling or blade-tip clearance specification. No bolts,
seals, joint internals, bearings, hidden cables or fluid solver invented.

Main straight duct/nose outlet, aft fan/MMRTG collar, fans, motors/rotors, every
other warm-duct/trim mesh, poses and airflow curves remain exact. Their unresolved
internal sections are not completed by this change. Gas penetration through the
aft bulkhead remains open. No flow-rate, pressure-loss, heat-transfer or control
behavior changed; a visible passage is not a CFD/flight validation.

## Inspection, acceptance and continuation

Part18 gets a selectable **Fan transition (estimated open shell)** macro. The
selector now permits one named detail alongside Whole assembly; previously it
was hidden unless at least two details existed.32 top-level IDs retained, no
new numbered part. Casings remains independently reversible. Exact prior UI is
archived, along with the prior transition and delegated fan-bore test.

Five new tests: open internal rays/solid rims, both flange seats, full-model
surface contacts, exact preservation, real focus/numbering and24 rotor angles.
The existing fan-bore suite delegates only this exact named transition to the
new preservation tests. The only current surface contact is the intended main
duct end plane, within a1e-7 m Float32 seat tolerance; old fan contacts disappear.
`audit.mjs` regenerates `measurements.json` for independent inspection.

Local **787 full tests pass**. Desktop/Internal/Thermal/390px and Casings
hide/restore pass,33 options/32 IDs, no overflow/page errors. Browser and local
server close after capture; no personal game/mission save used. Actual before,
after, macro/phone and checks JSON saved here. Images are standard WebGL captures;
`comparison.py` assembles only the useful before/after, not synthetic hardware.

## Publication receipt

Implementation678d3a1 deployed as **700c882**.
[Pages40945342706](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/40945342706)
succeeded. **793 combined tests** pass after preserving incoming4f65cf8 game,
game-test/helper and checklist paths exactly; both signed changelog insertions
retained. Recovery tag pushed; no personal save, game feature or lab changes.

Live part18 focus and visible single-detail selector,32 list IDs/33 options,
shipped1.5 mm/16 mm estimate metadata, Internal/Thermal and390px widths/errors
verified. `public-checks.json`, `public-transition.png`, `public-thermal.png`,
`public-phone.png` and `merged-test-results.txt` retain the evidence. Temporary
browser/server closed. Sample is actual project geometry, not a generated asset.

Next thermal work: main-run/nose sections or aft
collar/attachment, supported by evidence. Do not silently enlarge the completed
fan bodies or declare the whole warm/cold loop reconstructed. Electrical flight
interfaces remain separately source-gated. Claude continues Swarmfall separately.

[Archive/recovery and rejected trial](../../archive/fan-duct-interface-2026-10-29/README.md).
