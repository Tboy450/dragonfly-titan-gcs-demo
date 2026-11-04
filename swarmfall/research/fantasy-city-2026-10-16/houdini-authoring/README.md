# Houdini coastal environment — October 17, 2026

This is an executed Houdini 22.0.466 Apprentice workflow, not a JavaScript terrain generator.
It replaces the rejected building extensions with a connected ground surface. The source
city and earlier experiments are preserved.

- [Houdini terrain preview](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=houdini)
- [Rear coast](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=houdini&view=rear)
- [Building bases](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=houdini&view=bases)
- [Preferred earlier second coast](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=contour-v2)

Open the local `skyway-coast.hipnc` in this folder with Houdini. Its external `.bgeo.sc`
caches are alongside it. The original city GLB remains in the repository. The scene and
caches are local authoring files excluded from Git, with scripts and reports retained in Git.
The project is authored with the Non-Commercial Apprentice license.

## Native graph

`CITY_READ_ONLY` imports and normalizes the unchanged source to the viewer's 2 km horizontal
span. `HOUDINI_COAST` selects substantial building masses, excluding skyways, spheres,
curved ornaments and short roof/balcony details. It extracts low downward faces and removes
contacts already supported by lower architecture. This is geometric classification; it
does not infer structural engineering or guarantee semantic classification of every object.

An 8-unit HeightField uses **HeightField Project** and **HeightField Mask by Geometry** for
base contacts. A broad district slope blends into the preferred second coast; masked blur
softens transitions, followed by restoring contacts and applying lower-geometry ceilings.
The coastline outside the fitting influence retains the earlier coast's general shape.

A constrained **Triangulate 2D** mesh preserves real base outlines, dense city samples and
coarser outer land. Closely spaced constrained contours form narrow cut/fill steps where
district elevations meet. Two bounded adaptive passes sample steep joins and refine their
interpolation. These are terrain vertices, not hanging building-extension prisms. Normals
and soil/rock/shore colors are evaluated in Houdini. The evaluated mesh is exported to OBJ
and browser GLB; glTF front faces are explicitly oriented upward.

The browser replaces the old ground, pads, access-road guesses and Blender supports with
this evaluated mesh while retaining the animated ocean at elevation -38.
Elevated transit geometry is used separately as a clearance ceiling. Ground outside building
contacts is lowered beneath those routes, with widened, softened corridors and a 50-unit
clearance target. This keeps the transit network out of the ground-fitting targets.

## Verification and remaining review

[fit-report.json](fit-report.json) contains the final native geometry counts and independent
contact measurements. Probes include contact vertices, face samples and seeded random
barycentric positions distinct from the authoring samples. Upper contacts already supported
by lower city geometry are counted separately. Both positive gaps and negative clearances
(burial) are measured against the evaluated triangle surface.

The tests also check the actual GLB for finite positions, upward front faces, complete coastal
extent and a bounded triangle count, and verify the browser variant keeps water while removing
the old supports. These checks do not establish campaign collision, walkable navigation or
full component coverage. Skyways and small upper ornaments intentionally remain elevated.

Final measured building fit: **25,740 checked exposed contact samples**, zero ray misses,
clearance 0.620–2.368 preview units, and no sampled burial. Median and 95th-percentile
clearance are approximately 0.700. Another 169 samples already supported by lower city
geometry were excluded and counted separately. A separate check sampled 557 exposed route
undersides outside building contacts, with minimum clearance 92.21 preview units. Routes
above building contacts are counted separately rather than claimed clear by that check.
Repository verification: `node --test tests/*.test.mjs` — **259 passed, zero failed**.

The source scene has substantial elevation differences between its front and rear building
bases. Matching those bases produces high rear land; its silhouette and material finish still
need owner review. The low-coast comparison remains available. No campaign saves were changed.

## Regenerate

Run from the repository root using the installed Houdini Python engine:

```powershell
& 'C:/Program Files/Side Effects Software/Houdini 22.0.466/bin/hython.exe' research/fantasy-city-2026-10-16/build-houdini-coast.py
& 'C:/Program Files/Side Effects Software/Houdini 22.0.466/bin/hython.exe' research/fantasy-city-2026-10-16/validate-houdini-coast.py
node --test tests/invasion-houdini-terrain.test.mjs
```

The original `coast-input.json` is produced by `prepare-foundation-input.mjs` if missing.
First export geometry is retained in `drafts/`; no source asset or earlier viewer pass was deleted.

Contact-source credit: **cyberpunk City by carlcapu333, BlendSwap 21664, CC-BY 3.0**.
Native terrain authoring and viewer integration by Codex. No image-generation service was used.
