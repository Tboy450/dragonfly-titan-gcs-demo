# Part 05 Original Blocks and Rejected Installation Studies

Codex (OpenAI), October 19, 2026. Baseline `cf4c866`; restore tag
`archive/nose-electronics-2026-10-19` points to that last unchanged version.

`original/` retains the exact old research builder, component UI and HTML. Part 05 was
four blue boxes: 0.22/0.12/0.20 at [-0.15,-0.26,-1.36], 0.14/0.10/0.14 at
[0.07,-0.27,-1.38], and two 0.09 m cubes at [0.25,-0.28,-1.42] / [0.25,-0.28,-1.28].
All were illustrative estimates; no published shape/size association is implied.
Before pictures retain four angles in both layers, desktop/360 px and installed context.

To restore only this asset, remove the current `buildNoseElectronics` import/call from
`dist/vehicle-research.mjs`, copy its old part-05 interiorPart and four mesh calls from
the saved builder, keeping the current `let material` declaration at part 20 valid.
Reconcile current UI/assumption/tests in the same change. Do not overwrite whole live
files with snapshots, reset someone else's checkout or remove later unrelated work.

`flat-placement-draft/` retains exact module/test and multi-angle screenshots before
moving FEB off the warm-duct outlet. `upright-placement-draft/` retains the subsequent
upright alternative, which intersected the rebuilt carousel. Both were uncommitted
drafts, so no tags. Their estimated placements are NOT recommended flight layouts.
That rejected draft retained both old IMUs and documented their overlaps.

`dimension-study-draft/` preserves the exact pre-MIMU module, tests, component UI and HTML,
comparison and installed-context picture. It has nominal Ocellus enclosures plus both old
IMU cubes and their overlaps. Uncommitted, no tag. To restore that study, restore its module
and test, reconcile only part-05 UI/assumptions from snapshots, and rerun checks. Not a flight
layout. The current family-IMU asset resolves those overlaps at full supplier envelope scale.

`support-focus-draft/` preserves the first family-MIMU code/test and phone picture before
the support shelf got its own inspection entry. The old shelf stayed visible in individual
IMU isolation; current metadata lets the existing inspector hide it. Uncommitted, no tag.
Restore only targeted module/test if needed; do not replace unrelated later source files.
