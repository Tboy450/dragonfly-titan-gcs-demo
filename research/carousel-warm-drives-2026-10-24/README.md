# Carousel Warm-Drive Installation Examples

Codex (OpenAI), October24,2026. Part06 remains the original numbered carousel.

## Evidence And Limits

- [NASA SVS15003](https://svs.gsfc.nasa.gov/15003), real integration photographs dated
  March5,2026, released April20. Credit **NASA/Mike Guinto**. Original photographs are
  saved in `../carousel-2026-10-12/`; `nasa-warm-drive-crop.jpg` is a labeled-context crop
  of `nasa-carousel-integration.jpg` (GSFC_20260305_DRAGONFLY_012269_SMALL.jpg).
  Visible underside metallic housings, dark caps, wrapped sections and local wiring inform
  appearance. The photo does not identify each motor, terminal type, dimensions or routing
  to the lander. Handling posts/plate, dolly and loose integration cabling are not copied.
- [Barfknecht et al., SciTech2024](https://ntrs.nasa.gov/citations/20230017316), NASA GSFC
  and Aerodyne. Saved page image `../sources/scitech2024-sdc-drams-interface/scitech2024-p03.jpg`:
  Fig.2 is **CAD/schematic**, not a hardware photo. Pages3-4 describe warm actuators below
  the baseplate and the cold sample region above. It does not establish motor part numbers,
  connector faces, winding count, a flight harness diagram or a feedthrough position.
- [NASA April23 integration update](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/)
  establishes integration context; it is not an electrical interface specification.
- Saved NASA-STD-8739.4A Change4 pages29-31 in `../sources/nasa-harness-workmanship/`
  inform general support/stress-relief reasoning only. No applicable cable construction,
  qualified bend radius, materials compatibility or workmanship compliance is asserted.

Sources rechecked before model changes. No generated imagery, flight CAD claim or new
commercial motor identification. The reference gallery includes ground-test hardware.

## Scoped Replacement

`dist/carousel-warm-drives.mjs` owns this installation package, called by the existing
carousel builder. The three old centers and nominal44mm-diameter x96mm can envelopes
are retained **[EST]**, not newly measured dimensions. Three-drive count/identities,
socket examples, finish, bands, supports, lacing and routes remain **[EST]**.

Each example has metallic can/collar, wrapped neck, dark lower cap, mounting flange and
separate Casings/Covers/Mounts/Interfaces/Harnesses controls. Three non-nested focus
targets use actual scale. No motor internals, encoder electronics or gearing invented.
All cold carousel meshes/materials/instances/poses, its white line, sample inlet, carrier
and neighboring equipment are unchanged. Original24 numbers retained.

Three2.6mm-diameter lead examples meet generic side exits and have a slack bow, two ties
and a support to the existing baseplate underside. Remote ends deliberately stop at the
modeled extent. **These are not completed circuits, splices, controllers or bus mating.**
They stay entirely below the baseplate; no cold sample volume or undocumented Wonderwall
electrical penetration is introduced. [Current11-row register](../attic-connection-media-2026-10-23/ENDPOINTS.md)
records world endpoints/radii/lengths and `remoteEndUnmodeled:true` for all three.
All four unresolved network families remain open. There is no new electrical/thermal/
flow solver; drive thermal colors retain the existing equipment-bay node.

## Archive And Checks

[Archive](../../archive/carousel-warm-drives-2026-10-24/README.md) contains the exact prior
builder/UI/tests/HTML/register, two before pictures and recovery tag on e4ffe5d.
The first support exceeded the plate's radial footprint: source saved as a rejected
draft before bringing the route inward. No equipment moved or clearance allowance enlarged.

**572 tests pass**, including five new tests: exact non-drive preservation; old nominal
drive dimensions/poses; non-nested focuses, independent masks and indexing stability;
socket contact/support-to-baseplate footprint; sampled swept-radius clearance against
actual carousel, DraMS, Wonderwall, navigation, front-camera and sample-line triangles.
Only the owning socket's first3mm is an endpoint-contact exemption. Existing whole-part
neighbor tests also pass. This is geometric fit, not electrical/flight certification.

Raw three-drive/detail/installed screenshots use actual materials. Installed sample has
110621 non-background pixels. `render.html?before` renders the exact archived builder.
`make-comparison.py` composes the saved real photo, labeled CAD and before/after samples.
`browser-checks.json`: all ten casing/cover/mount/interface/harness hide/restore cases in
Internal/Thermal pass, all three focus options select, Restore/Open interior and Pilot
return pass. Original24 rows retained; requested390px viewport has375px client and scroll
width, no horizontal overflow. Clean standard-server preview has no browser errors.
An initial custom preview omitted SVG MIME typing; corrected locally using the standard
server, with no production asset changes. Installed drive context remains visible until
hidden with existing masks; selecting a focus does not physically disassemble equipment.
Publication receipt follows deployment.

## Next / Handoff

Local warm-drive examples complete; **full attic harness remains open**. Do not join their
ends into an invented bus. Next source gate: actual external DraMS/DrACO controller and
bay-to-attic mating information; then one supported route/support group. Keep electrical,
RF/fiber, sample/gas and thermal-air paths distinct. Hidden mechanisms and full insulation
stacks remain open. Keep the Open interior preset and all independent masks reversible.
