# Belly cold-bypass exposure and layered inspection views

Signed Codex (OpenAI), November 6, 2026. Exact baseline `874a0d6`.

## Source and scope

[NASA/APL TFAWS2024](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf),
slides3/5/6/9, was rechecked online and against the saved real DTM underside
photograph at `../sources/tfaws2024-dtm/tfaws2024-at-02-slide09.jpg`.
Credit Dahway Lin, Diarny Fernandes, Collette Gillaspie, JHUAPL/NASA.
It establishes an exposed cold bypass. The photograph is thermal test hardware,
with polystyrene foam/printed Ultem ducting, not a flight insulation drawing.
Existing body material evidence and credits remain in
`../sources/nasa-foam-2025/README.md` (NASA/APL/Justin Artis real test segment;
Rolando Rodarte's NESC presentation). No source image was duplicated or generated.

[PUB] Cold-bypass architecture. [EST] Detailed belly opening, 2 mm viewing margin,
and retained housing/channel geometry. This pass does **not** add physical
insulation thickness, recess closing walls, seals, membranes, flight tile seams,
attachment hardware or calibrated heat-transfer coefficients. Do not mistake an
open inspection surface for a reconstructed flight insulation stack.

## Geometry

`dist/belly-bypass.mjs` derives three overlapping footprints from the actual cold
channel and two housing meshes in the body construction frame. Their union is a
single connected opening in **only** `body-foam-belly-surface`. The existing
clipper preserves interpolated finish attributes. The surrounding bevel, four
other body surfaces, existing optical/mount clearances and all equipment/routes
remain exact. No new numbered part or per-frame geometry allocation.

The previous two housing intersections are removed. Rays from below now reach
the cold channel rather than the former belly at approximately y−0.410 m.
The two retained housing outlines need not be moved, cut or rescaled. The
separate harness-foot touch remains the previously verified numerical floor seat.
The whole flight gas circuit and physical insulation stack remain incomplete.

## Access view selector

The owner clarified the request concerns the existing Access view selector,
then requested diagram/harness views. Four presets join All layers/Open interior:

- **Body insulation** — solid display of the five existing body regions.
- **Attic insulation** — solid display of the existing cover regions.
- **Belly / cold-duct cutaway** — underside view with warm/cold duct context.
- **Wiring / harness routes** — existing wiring across assemblies, retaining
  route materials/positions. Incomplete estimated routes, not an electrical schematic.

The last option uses a cached list of non-harness meshes to mask during drawing.
It does not create cables or assign circuits. All views reuse the existing
inspector state/masks, labels, camera controls and numbering; 32 IDs/33 part
options remain. View notes are collapsed. Focused body/attic surfaces stay opaque
when peeled manually; ordinary open views regain their transparent shell styling.
Pilot returns to ordinary materials/visibility. No mission/flight/science state added.

## Verification and archive

**521 simulator tests and 305 separate Swarmfall tests pass (826 total).**
Eight added checks cover exact non-belly geometry/poses, before/after exposure
rays, connected footprint, retained surrounding skin, installed housing contacts,
every integer flap angle0–24, six reversible presets, existing wiring ownership,
opaque focused insulation and restoration of normal materials/visibility.
Earlier raw-contact tests now delegate just the two insulation removals to this
new exact-baseline suite. Historical raw measurements remain saved; the older
audit helper describes the newer current geometry rather than stale warnings.

Local browser: all four new presets visually checked; Thermal body and return
to Open interior checked. At390px viewport, client/scroll375/375 for belly and
harness views; no browser errors. Screenshots and browser-checks.json saved.
A pointer click immediately after resize toggled the local demo model; research
model restored, then keyboard activation confirmed Thermal and open-state reset.
No public mission reset or piloting/sampling was needed.

Exact old code, tests and useful before image are in
`../../archive/belly-bypass-2026-11-06/`. The first opacity trial reused the old
ghost shell and was too faint; its renderer behavior is retained in the archived
chase-vehicle module. No new source-comparison collage was needed.

## Next

- Interior liner/encapsulation/venting and local insulation thickness need an
  actual public construction section before adding geometry. These are surfaces.
- Audit harness coverage/connector-to-connector continuity by family before
  presenting a complete power/signal diagram. Current routes remain estimates.
- Future sample-pneumatics / warm-air diagram presets can reuse existing paths;
  annotate unresolved interfaces rather than invent circuit or valve identities.
- Aft collar/bulkhead passage and actuator linkage remain source-gated.

## Publication receipt

Implementation **00e26ad51aa93ab4451531db7572f337ee2eaec6** pushed to main and
the Codex publication branch, with recovery tag on874a0d6.
[Pages42191056557](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/42191056557)
succeeded with both test suites. The [live app](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=00e26ad)
visibly showed build00e26ad, six access presets and33 part options. Live belly
selection focused fuselage/body-foam-belly; harness preset selected successfully.
Public samples and public-checks.json saved; no browser errors. Initial cold
module loading briefly left the static old selector options; verification waited
for full initialization. No public mission reset or flight/science command issued.
Task preview server stopped after verification; public deliverable tab retained.
