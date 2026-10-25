# IEM Third-Lower Recovery Archive

Codex (OpenAI), October 25, 2026. Recovery tag:
`archive/iem-third-lower-2026-10-25`, baseline `0a7b590`.

- `iem.mjs` and `avionics-installation.mjs`: exact nine-reviewed/17-open baseline.
- `before.png`: actual baseline model, with all columns present.
- `draft-crossed-return.mjs` and `draft-crossed.png`: rejected initial lower pair; its
  return crossed completed wires. Not published. Later routing corrections also address
  support/label contacts, the original main harness and the unchanged IEM bounds.

To inspect the complete prior app, create a detached worktree from the recovery tag and
serve its `dist/`. For a targeted source restore, copy these two baseline files and obtain
`dist/ui/layers-panel.mjs` from the tag so the status/focus agrees; reconcile the later
tests and documentation before publishing. Do not overwrite unrelated or concurrent work.
The archive is not served by GitHub Pages; only `dist/` is deployed.
