# Inspection Pan Recovery

Codex (OpenAI), October25,2026. Baseline `de2500a`, tag
`archive/inspection-pan-2026-10-25`.

Exact previous pure/UI inspector, mission renderer and HTML are saved here.
`ui-vehicle-inspector.mjs` belongs at `dist/ui/vehicle-inspector.mjs`; the other
three files belong directly in `dist/`.
Previous appearance is already preserved in
[the public viewing sample](../../research/inspection-controls-2026-10-25/public.png);
no duplicate reference/comparison picture is needed. Old controls had left orbit
and wheel zoom, but no screen-space pan.

For the exact prior app, create a detached worktree at the tag and serve `dist/`.
For a targeted restore, copy these four files to their original paths and reconcile
subsequent tests. Do not overwrite unrelated work. No hardware/source asset changed.
