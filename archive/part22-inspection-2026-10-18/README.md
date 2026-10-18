# Part 22 Before Individual-Probe Inspection

Archived October 18, 2026 by Codex (OpenAI). Baseline `fb2e5b6`.
Restore tag: `archive/part22-inspection-2026-10-18`.

Exact original files: `index.html`, `vehicle-inspector.mjs`, `chase-vehicle.mjs`,
`nose-sensors.mjs`, `vehicle-research.mjs`, `styles.css`, and `ui-vehicle-inspector.mjs`
(the latter belongs at `dist/ui/vehicle-inspector.mjs`). Original screenshots show
desktop/mobile, installed context, Internal/Thermal and four orbit angles.

Both EFIELD assemblies already existed here. One component ID 22 represented both
probes and the METHAN placeholder; the inspector could only frame the whole group,
making the individual probes small. No previously missing probe was created by this change.
The new subassembly selector changes only viewing, isolation and the selected label anchor.

Safest restore is a separate checkout:

```powershell
git worktree add --detach ../dragonfly-before-part22-selector archive/part22-inspection-2026-10-18
```

For selective rollback compare the archived files; revert the subassembly helper, metadata,
selector and corresponding tests together. Do not overwrite newer whole files or unrelated
city/game work. Never reset an active dirty checkout. The old EFIELD geometry is unchanged.
