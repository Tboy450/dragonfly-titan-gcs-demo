# Part20: Battery-temperature annotation, hardware still open

Codex (OpenAI), October20,2026. Revision `battery-measurement-annotation-2026-10-20`.
**This corrects a misleading/intersecting placeholder, not a flight sensor reconstruction.**
Part20 remains unchecked. Total20/24 initial passes (5 Codex / 15 Claude), unchanged.

## Research before editing

- [NASA/APL TFAWS2023](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf),
  Holtzman/Castano, slides7/9: battery temperature is a controller input. Original complete
  pages7-9 saved and visually inspected in [source folder](../sources/tfaws2023-battery-feedback/README.md).
  The green rounded input in the diagram is NOT a green physical sensor or a quantity drawing.
  It does not identify sensor package, mounting point, count or wiring.
- Balakrishnan et al. / APL, ICES2022-256, original pp6/7: real nine-cell battery thermal-test
  article, chamber instrumentation/leads/tape. Previously saved originals and full photo/CAD
  crops inspected. The identified flight sensor assembly is not resolved in those test photos.
  CAD fig2 used as clearly labeled test-module context, not appearance or sensor geometry.
  [Repository item](https://ttu-ir.tdl.org/items/a6b6bdc1-a09e-43a2-bc62-dbbea2e80660).
- [TE Connectivity spacecraft temperature-sensing application paper](https://www.te.com/en/industries/space/applications/temperature-sensing-measurement-satellites-spacecraft.html)
  discusses NTC/RTD families, good surface contact, and Landsat/Juno heritage. Related-project
  evidence only; no Dragonfly battery adoption/part number identified. Do not import supplier
  operating ranges, vacuum-only heat-transfer assumptions or an unrelated package into Titan.
- [NASA DrEAM TechPort116394](https://techport.nasa.gov/projects/116394) identifies genuine
  MEDLI/MEDLI2 heritage for entry-system instrumentation. Those aeroshell sensors are not this
  battery input. Do not turn a verified relationship for one subsystem into another's reuse.
- General searches yielded commercial Dragonfly Energy, motorcycle, laptop and printer
  thermistors: rejected as unrelated names. No clear flight battery-sensor photo/scale found.

## Implementation and explicit limits

`dist/battery-measurement.mjs` builds an open target/crosshair, not an opaque hardware body.
The target stands just outside the existing battery's starboard wall, at estimated vehicle
coordinate [.326,-.07,.635]m, radius .024m/stroke .0015m. Its anchor derives x/z from
`batteryAsset` so battery-envelope changes are not silently ignored. This is NOT a claimed
sensing point or physical sensor dimension. One annotation represents the modeled bulk
battery-temperature channel, not an assertion that there is only one physical sensor.

Original durable ID `battery-sensor`, number20, thermal zone and existing battery reading are
retained. Focus/isolation now includes battery context in both directions. Covers still use
the battery's existing controls. Part20 detail and expandable assumptions explicitly state
unknown flight package/count/install. No fake sensor leads, connector, PCB or hidden body.
No measurement noise, sensor lag, per-cell temperatures, physics, energy or control-law changes.

Claude's battery is untouched. Part21 is untouched. Browser-exported per-mesh vertex/world
transform manifests compare both against the archived baseline. Signed zero is normalized
through the same JSON representation on both sides, not a relaxed numeric tolerance.
The target's bounds clear every battery mesh. It is a diagram annotation, not part of the
physical collision model. Other completed units were not moved to fit it. Game files untouched.

## Process, samples and checks

- [Real / CAD / controller diagram / actual-model comparison](battery-real-cad-model-comparison.jpg).
  Real photo is a thermal test article, not an identified flight sensor; captions preserve that.
- [Archive](../../archive/battery-measurement-2026-10-20/README.md): exact prior source/UI/HTML,
  fresh screenshots and recovery tag on5220223 before edits. No fabricated hardware draft.
- `after/`: six Internal/Thermal viewport cases at1440/390/360, four orbit angles, battery
  covers hidden, raw context render, GL nonblank/framing sample and baseline manifests.
- `verify-render.cjs`: actual Edge, no horizontal overflow/page errors, battery cover
  hide/restore, Pilot return, unchanged battery/part21. Render-only source copy omits circular
  UI owner metadata; model geometry is not altered. Tests: **394 pass**, including4new tests.
- Public status is recorded after deployment; local checks alone are not publication evidence.

## Next / handoff

Do not label20 as completed hardware. Need identified sensor photos/type, mounting/scale and
channel architecture, or explicitly approved hardware-family approximation. Keep annotation
metadata separate from reconstructed flight hardware. Remaining initial passes03/09/20/21.
Do not reopen completed05/22 or rebuild Claude's battery. Archive the current annotation
before replacing it. Preserve the game/session changes merged from origin/main5220223.
