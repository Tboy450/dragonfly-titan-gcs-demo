# Complete inspection numbering and hardware anchors — October 27, 2026

Codex (OpenAI). Owner requested matching model/menu numbers and placement checks,
then clarified **leave part 5 grouped** and proceed to the blower pair afterward.

`inspection-catalog.mjs` is the common stable register. The original 1–24 remain
unchanged; previously unnumbered selectable assemblies append as:

| ID | Assembly |
|---|---|
| 25 | Body insulation regions |
| 26 | Attic cover / insulation |
| 27 | Starboard structural wall |
| 28 | Port structural wall |
| 29 | Wall end joints |
| 30 | Top deck / attic edge |
| 31 | MMRTG generator body |
| 32 | Bay harness |

These are educational inspection IDs, not NASA part numbers or new physical parts.
One register drives the component selector, canvas callouts, temperature list and
detail title. Hidden geometry keeps its ID/menu entry without a floating on-screen
badge. Shared MEB context remains part of 5/32; no separate number or duplicate menu.
Part 5 still has one grouped marker and the same five subassembly choices. The other
navigation units were never removed; the previous delivered preview was MEB-only.

`inspection-anchor.mjs` resolves the existing anchor hint to an actual triangle on
the part's visible hardware. It no longer accepts an empty group/axis-aligned box
center as hardware. Cached triangle indices/barycentric coordinates follow moving
or deforming meshes and craft rotations. Hiding an anchored cover selects another
visible surface; no visible hardware means no visible pin. The existing leader-line
collision layout is retained. Cached geometry avoids a full triangle scan per frame.
No model shapes, thermal/flight constants, saved mission or part grouping changes.

733 tests pass. New checks cover hollow/separated geometry, visible-cover changes,
transforms/deforming vertices, all 32 real assemblies and rotations. Input listeners
retain desktop right-drag, two-touch pan and Ctrl-wheel behavior. Browser checks:
32 matching rows/menu numbers, no duplicates, 33 options including Whole vehicle;
MMRTG 31, Bay harness 32, rotated wall 27 in Thermal, part 5 covers hidden/restored,
grouped part 5 on a 390px phone without overflow/errors. Samples/JSON saved here.
Existing real/CAD reference sheets are reused; no new source photograph needed for
this presentation change and no redundant per-part comparison sheet created.

Exact prior files: [archive](../../archive/inspection-numbering-2026-10-27/README.md),
tag `archive/inspection-numbering-2026-10-27` at 7db927e. Numbering pass is complete
and published with the owner-requested part24 blower rebuild as **92ef530**.
Pages40734789253 succeeded; 746 combined tests pass. Live list/menu IDs1–32,
grouped part5 and no overflow/errors verified; see the blower pass public receipt.
See `research/draco-electrical-audit-2026-10-27/README.md` for the primary supplier
photos/dimensions, two-unit/plumbing fit plan and unresolved flight interfaces.
