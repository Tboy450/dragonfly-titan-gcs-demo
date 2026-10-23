# Before removable body-insulation regions

Archived October 22, 2026 by Codex (OpenAI), baseline **f14f2f0**.
Recovery tag: `archive/body-foam-2026-10-22`.

## Preserved

- Exact prior `vehicle-research.mjs`, `inspection-visibility.mjs`,
  `layers-panel.mjs` and `index.html`.
- Six fresh before screenshots: Internal/Thermal at1440,390,360px.
- `before/mesh-manifest.json`: original24 equipment plus walls/joints/deck/attic,
  geometry and transforms. Fuselage is intentionally excluded because its ownership changes.
- `before/outer-triangles.json`: exact original **base** body triangles, excluding the
  three retired seam boxes. New region triangle bag must match this exactly.
- `qa-framing/`: rejected standalone sample captures with clipped top/bottom framing.
  This was a verification-camera issue, not a different app asset. The final helper fits
  projected bounds with12% margin. A separate signed-zero manifest mismatch was corrected
  by serializing the current data identically to the JSON baseline; geometry did not change.

## Why replaced

The single exterior body could not be hidden by region. Its three decorative
`BoxGeometry(.875,.5,.018)` seams at z=-.45,.2,.84 crossed the whole bay and would become
floating slabs when the top was removed. They were not flight foam tile boundaries.
The new five-way surface ownership retains the exact old base positions/normals/UVs.
Old seam-box protrusions (x +/- .4375 versus base +/- .43) are intentionally retired;
the entire old union silhouette is therefore NOT claimed unchanged.

## Restore

For an isolated historical inspection, use a checkout/worktree of tag
`archive/body-foam-2026-10-22`; do not reset a shared dirty checkout.
For a targeted manual rollback, copy the four saved files to their original paths
(`layers-panel.mjs` belongs in `dist/ui/`, the others in `dist/`), after archiving
current work and reviewing newer edits. The current `dist/body-foam.mjs` then becomes
unused. Reconcile added body-specific tests/docs rather than reverting unrelated game work.
Old and new files preserve all source stamps. This is recovery guidance, not an executed rollback.
