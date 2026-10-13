# Archived DraMS Placeholders

Archived October 12, 2026 by Codex (OpenAI), from `ade916f`.
Tag: `archive/drams-2026-10-12`.

The old model had three generic boxes and a small cylinder, with a separate overhead
analysis ring. Some blocks overlapped the newly rebuilt warm/cold interface.

Exact pre-change source: `vehicle-research.mjs`, `layers-panel.mjs`,
`vehicle-inspector.mjs`, plus `vehicle-inspector.test.mjs` and `render-smoke.test.mjs`.
`drams-ui-*`, `drams-internal-*`, `drams-thermal-*` and `drams-context.png` preserve
desktop/mobile and four angle-matched views. Transparent canvas areas may appear black.

## Restore

Use the tag in a separate checkout for the complete previous application. For a narrow
restore, compare and restore the old DraMS construction/analysis-marker section in
`vehicle-research.mjs`, remove the new `drams-assembly.mjs` import/call, and restore the
corresponding inspector membership and component description. Reconcile the new tests.
Do not overwrite later unrelated changes with full copies. Archive the replaced version
in turn and rerun all tests and visual checks.

## Unpublished Isolation Draft

`occluded-isolation-draft/` preserves the temporary inspector change that included
Wonderwall and carousel with isolated DraMS. Its phone/angle screenshots demonstrate the
obscured view. It uses the new `dist/drams-assembly.mjs` geometry unchanged, but the saved
inspector file defines the draft's group visibility. Restore that file only for comparison.
No tag: this draft was never committed or published.
