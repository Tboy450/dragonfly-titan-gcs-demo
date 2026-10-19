# ART-09 — Small-asset polish batches and handoff

Planning and CPU inventory completed October 19, 2026 — **Codex (OpenAI)**.
Two small preparation steps are complete: define limited batches, and record baseline
geometry for the first candidates. **No art upgrade or visual acceptance is claimed.**

## Proposed batches

| Order | Candidate | Source evidence and next work | Scope boundary |
| --- | --- | --- | --- |
| A1 | Scout | `models.mjs`, `scoutModel`: rectangular hull, dark sensor sphere, plate and four rotor arms. Review a more deliberate sensor housing and hull transitions; retain its light four-rotor silhouette. | First single-asset trial; existing size, color signals, rotor centers, gameplay role and instancing stay compatible. |
| A2 | Link | `linkModel`: six-sided hull, dome, thin antenna/dish and six arms. Review integrated communications equipment and coherent hull detail that distinguishes it from Scout. | Follow A1 after comparison; preserve its readable communications identity. |
| B | Shared defender figure and interceptor | `figureModel` uses torso/head/weapon primitives and the same geometry for ground defender types; `interceptorModel` is an extruded delta with fuselage/fin. Review anatomy/equipment silhouettes and aircraft hull/engine detail. | Review one at a time; preserve team/society cues and existing gameplay scale. |
| C | Props, UI icons, textures, decals and effect elements | Inventory their actual uses and capture comparisons before choosing replacements. | No unsupported claim that every small asset is poor; effects remain coordinated with FX tasks. |

These are source-based review candidates. Primitive count alone is not an artistic quality
score: simple models can be appropriate for distant RTS views. Actual before/after views at
normal play distance and close inspection are required to decide what improves the project.
The detailed city assets set a cohesion target, not a requirement to copy their geometry cost
onto every drone. The research Dragonfly is excluded from this initial cosmetic batch.

## Baseline inventory

Measured by [inventory.mjs](inventory.mjs) from unchanged source at `72b2d4d`;
[full data](inventory.json) includes local bounds and CPU attribute bytes.

| Model | Body + glow triangles | Rotor discs defined |
| --- | ---: | ---: |
| Scout | 468 | 4 |
| Link | 1,048 | 6 |
| Striker | 700 | 6 |
| Breacher | 576 | 8 |
| Shared ground defender figure | 144 | — |
| Interceptor | 56 | — |

Counts exclude renderer-created rotor geometry, effects, instances and other scene meshes.
CPU buffer bytes are neither VRAM measurements nor download size. Bounds precede model scale.
The script successfully built all six templates and checked nonempty, finite positions;
this is not a GPU/device benchmark. No runtime files changed and no new full test run was
needed; the last implementation suite passed 380 tests.

## Next session: one concrete small implementation

1. Start with **Scout only**. Read ART-09 and the current source; preserve the old model,
   a dated view and restore tag before replacement, following ARCHITECTURE house rule 6.
2. Prototype modest sensor housing/hull detail using code geometry or Blender. Keep current
   rotor anchors, model scale, glow/selection cues and instanced body/glow contract. Avoid
   changing combat statistics, hit targets, flight or saves as part of cosmetic work.
3. Compare original/prototype at RTS and close-view distances; record geometry cost and
   rendering settings. Verify High/Light legibility and real browser output when available.
   Browser access was previously blocked in this chat and was not retried for this inventory.
4. Archive any rejected draft, run relevant render checks for an actual model change, then
   update the per-asset status and signed changelog. ART-09 stays open until its reviewed
   batch scope is complete; a planning report does not close it.

Current canonical checklist count remains **23/305**. Prior deployment `9f69205` verified
CTRL-04 selection/order behavior in published source; `cda9454` recorded future first/third-
person drone control and `72b2d4d` added this small-asset priority. Preserve untracked modular
kit work and authoring/download receipts. No assets have been removed or replaced here.
