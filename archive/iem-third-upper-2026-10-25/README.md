# IEM Third-Column Upper Recovery

Codex (OpenAI), October 25, 2026. Tag `archive/iem-third-upper-2026-10-25` on `a9da566`
retains the complete seven-reviewed-route baseline. Exact builder and installation-status
data are saved here; the recovery tag also retains the corresponding UI and tests.

`before.png`: complete prior IEM with all columns visible.
`draft-crossed-return.mjs` / `draft-crossed.png`: rejected candidate whose returns crossed
completed wiring. It never shipped. Current comparisons/measurements are in
[research](../../research/iem-third-upper-2026-10-25/README.md).

Restore the old builder from the project root:

```powershell
Copy-Item -LiteralPath archive/iem-third-upper-2026-10-25/iem.mjs -Destination dist/iem.mjs
```

Restore matching data/UI/tests from the tag as a coordinated change, preserving unrelated
work. Run the full test suite before publishing any restoration. A separate worktree at
the recovery tag can inspect the full prior project without resetting this checkout.
