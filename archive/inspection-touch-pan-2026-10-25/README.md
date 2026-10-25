# Touch Pan Recovery

Codex (OpenAI), October25,2026. Baseline3e21c5e (before this combined continuation).
Exact prior `dist/ui/vehicle-inspector.mjs` is saved as `ui-vehicle-inspector.mjs`;
prior `dist/index.html` is saved unchanged. Previous appearance is already in
[`inspection-pan/public.png`](../../research/inspection-pan-2026-10-25/public.png).
No repeated source/comparison image is needed for this input-only change.

Previously one finger rotated and the second finger was ignored. New handling
uses two-finger centroid movement to pan, with unchanged one-finger orbit and
mouse controls. Restore these two files to their original paths for the old
gesture behavior; reconcile later tests and avoid overwriting unrelated work.
Recovery tag `archive/inspection-touch-pan-2026-10-25` is on baseline3e21c5e.
