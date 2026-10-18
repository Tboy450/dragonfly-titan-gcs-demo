# Part 22 Before EFIELD Rebuild

Archived October 17, 2026 by Codex (OpenAI), before replacing the two legacy primitives.
Baseline `eed63b1`; tag `archive/nose-sensors-2026-10-17` points to that baseline.

Exact original files: `vehicle-research.mjs`, `index.html`, `ui-layers-panel.mjs`.
They preserve the old methane box and short EFIELD cylinder, assumptions text and panel
behavior. Before screenshots include desktop/mobile, installed context and four angles
in Internal/Thermal. Original METHAN box is deliberately retained in the new module.

`draft-mount-v1/` preserves the first uncommitted EFIELD module/test and pictures. Its
front preamp at z -1.52 crossed the already rebuilt DrACO tube; the revised mount is at
z -1.64 [EST], with published probe dimensions unchanged. Draft has no Git tag.

## Restore

Inspect the tag in a new worktree rather than resetting an active checkout:

```powershell
git worktree add --detach ../dragonfly-before-efield archive/nose-sensors-2026-10-17
```

For a selective rollback, compare the archived files and restore only the old #22 block,
remove the nose-sensors import, and adjust the corresponding panel/assumptions notes and
tests together. Do not overwrite newer whole files or delete unrelated work. The snapshot
is not a patch for other parts. Keep original labels and the 18/24 completion count.
