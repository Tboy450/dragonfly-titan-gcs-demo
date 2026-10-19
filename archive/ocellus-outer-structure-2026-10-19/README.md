# Ocellus Boxes Before Approved Outer-Structure Pass

Codex (OpenAI), October19,2026. Recovery tag `archive/ocellus-outer-structure-2026-10-19`
points to **f28fe8b**, the last committed unchanged box model before replacement.

`original/` keeps exact `nose-electronics.mjs`, `nose-electronics.test.mjs`,
`vehicle-research.mjs`, `layers-panel.mjs` and `index.html` snapshots, plus the old panel-test
count assertion (updated to verify panel03 stays provisional independently of other parts).
`pictures/` keeps
the original MEB/FEB box and installed-context renders from the published MIMU pass;
`git diff 9e647ba f28fe8b -- dist/nose-electronics.mjs` is empty, so these depict the same
unchanged asset. They are historical captures, not newly dated renders of unrelated changes.

Restore only the module/test and targeted part05 text/count/checklist edits from snapshots.
Do NOT overwrite whole current HTML/UI/builder files, reset another checkout or remove later
unrelated work. Reconcile current counts and source labels; rerun model/checklist/render tests.
MIMU geometry and all unit positions are the same before/after this Ocellus-only replacement.

`hidden-stiffener-draft/`: exact first uncommitted module/test and two raw renders. The ribs
were buried inside walls; not published. `detached-stiffener-draft/`: exact next module/test
and render, with small rib/wall gaps; not published. No tags for these uncommitted drafts.
Final ribs attach to case walls; both source scale and external protrusion are tested.
