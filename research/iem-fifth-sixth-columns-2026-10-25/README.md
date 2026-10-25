# IEM Columns Five and Six

Codex (OpenAI), October 25, 2026. IDs 15-17 and 18-21 are seven local
installation estimates, not newly identified flight circuits. Twenty-one routes
are reviewed; five in columns seven/eight remain placeholders.

## Evidence and Scope

Reuse the saved real NASA/APL integration/testing photographs credited to Ed
Whitman in [the IEM source record](../iem-2026-10-13/README.md), plus the existing
[CAD/workmanship evidence and limits](../iem-third-lower-2026-10-25/README.md).
The real photographs guide silver wrapping, white tags, connector-face context
and general accommodation. Neither photograph nor CAD establishes these exact
paths, supports, circuit identities or flight-qualified bend radii. All new
geometry is explicitly EST. No new CGI appearance reference or generated image.

The owner requested reuse of the reference/comparison pictures unless a new
detail actually needs investigation. This pass therefore saves one complete
model sample, phone QA, measured records and the exact pre-pass archive; it does
not duplicate the same real/CAD comparison for every lead or column.

Seven routes and attached labels change, with seven estimated supports and
fourteen lacing ties. Two non-nested column focuses are added to the existing
inspector. All fourteen completed routes/fittings, casing, plug poses, every
original endpoint/radius, the last five placeholder curves and the floor harness
stay fixed. Hardware movement, electrical topology and flight physics are not
part of this pass.

## Checks and Limits

- **635 tests pass**, no failures/skips. The new exact-baseline fingerprint
  preserves all unrelated meshes, including every completed route/fitting and
  the five placeholders. All 26 endpoints/radii remain exact.
- Rebuilt free-span sampled surface gaps are approximately 2.13, 2.04, 2.09,
  2.18, 2.09, 2.10 and 2.09 mm for IDs 15-21. Existing second-column checks
  retain their stricter 3 mm threshold; no threshold was lowered.
- Actual equipment/label/fitting triangles are checked in both directions:
  new wires against installed surfaces and previous wires against new fittings.
  Original main-harness/envelope/own-contact limits remain unchanged.
- The terminal exclusion still requires **both samples x < -0.135 m AND
  y < 0.025 m**, IEM-local. Bounded own plug/label/tie contacts are unchanged.
  Coincident terminal endpoints and bundle overlaps remain unresolved.
- Per the owner's new-to-new policy, unrebuilt IDs 22-26 and their labels stay
  fixed. Their interference with new wires/tags/fittings is recorded separately,
  not called collision-free. IDs 19-21 intersect legacy curves; legacy 22-26
  also intersect some new tags/fittings. Review them on their own turn.
- Desktop: nine focus targets in each of Internal/Thermal (18 cases), independent
  wire/interface/mount hide/restore, whole IEM and 24 part entries. Phone: both
  new targets in both layers, whole component, 375 px client/scroll width.
  Screenshot pixel screens confirm nonblank hardware in all 22 focus cases.
  No browser console errors. These are sampled/render checks, not certification.

`audit.mjs --write` saves `route-checks.json` and the 26-lead `endpoints.json`.
`browser-pixels.json`, `browser-checks.json`, `local-full-iem.png` and `phone.png`
record acceptance. Publication evidence is added after deployment verification.

## Offline Process and Rejected Parameters

The search and fitting-selection scripts here are research tools only; the app
imports only frozen static controls from `dist/iem-next-service-routes.mjs`.
`candidate-routes.json` is the saved accepted input, including terminal repairs.
Run `node research/iem-fifth-sixth-columns-2026-10-25/write-asset.mjs` to regenerate
the asset. Do not rerun the exploratory search over the accepted data casually.

Earlier coarse box/grid searches did not fit all seven routes. The initial
complete candidate set cleared rebuilt wires by 2 mm, but acceptance found
several terminal-tie approaches and crowded/self-crossing tags; these were not
published. Local terminal repairs used a tighter 12 mm planning contact radius,
not a wider acceptance exemption. The full suite also caught the second
column's 3 mm guard and a tag below the existing envelope. ID 18 was re-searched
against the installed revised set with the stricter guard; ID 15 gains a small
local lateral offset. The ID 20 tag moved along its own curve, and ID 21 uses a
6 mm depth offset that still meets its cable. Labels, surface, slack, enclosure
and unchanged global floor-harness tests were rerun. Trial settings/visits and
the conversion/selection scripts are preserved without duplicating source images.

## Handoff

Next: column seven **IDs 22/23**, then column eight **IDs 24/25/26**. Preserve all
21 reviewed routes/fittings, 26 endpoints/radii and unchanged global checks.
Use the recorded legacy contacts to guide their clearance work; do not move
the completed installation to accommodate the old placeholders. Full terminal
junction construction, flight pinout, qualified bends, remote mating and the
complete attic harness remain open.

The separate owner-requested drill asymmetry validation is now in
`INTERIOR-REALISM-TODO.md`: inventory both sides from real hardware evidence
before assuming missing equipment or mirroring anything. Git cleanup is paused
because its backup is partial/unverified; no files were deleted. Assets Lab,
Swarmfall files, saves and browser storage were not changed.
