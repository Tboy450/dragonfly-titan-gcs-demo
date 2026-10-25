# IEM Second-Column Recovery

Codex (OpenAI), October 25, 2026. Recovery tag `archive/iem-second-column-2026-10-25`
on `f62b5ff`. Exact pre-change IEM, installation-status data and middle-lead regression
test are saved here. The tag retains the full baseline and other affected historical tests.

`before.png` shows the completed middle lead with unreviewed upper/lower routes.
`draft-shared-return.mjs` / `draft-shared.png` retain the rejected shared terminal return;
`draft-low-return.mjs` / `draft-low.png` retain the low-return candidate that failed the
unchanged floor-harness clearance screen. No rejected candidate was published.

Restore the old builder from the project root:

```powershell
Copy-Item -LiteralPath archive/iem-second-column-2026-10-25/iem.mjs -Destination dist/iem.mjs
```

Restore corresponding data/UI/tests from the recovery tag as one coordinated change and
run the full test suite before publishing. Do not reset unrelated work. A separate Git
worktree at the tag can inspect the original full project without changing this checkout.

Current sources, measurements and comparisons: [research](../../research/iem-second-column-2026-10-25/README.md).
