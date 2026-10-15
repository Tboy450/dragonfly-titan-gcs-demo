# RDE Placeholder Archive

Codex, October 15, 2026. Previous two solid boxes (0.24 x 0.22 x 0.26 m), before the
provisional enclosure illustration. Screenshots cover desktop/360 px, four orbit angles in
Internal/Thermal and installed context. The three source files are exact pre-change copies.

Baseline tag: `archive/rde-2026-10-15` at `b2ac24a`. **The working copy already contained
Claude's uncommitted battery integration**, so the archived vehicle file differs from the tag.
Do not restore entire old files over subsequent work. To restore only the RDE placeholder,
remove the `buildRotorDriveElectronics` import and replace its registration/build call with
the two-box RDE block in this snapshot. Restore only RDE panel text/assumption changes
as needed; preserve battery and unrelated edits. The new module can remain unused.

`waveguide-clearance-draft/` preserves the first uncommitted module/test and matched screenshots:
its lid at Y -0.074 overlapped the TWTA waveguide flange. Final provisional lid Y is -0.09.
The draft has no Git tag because it was never committed.
