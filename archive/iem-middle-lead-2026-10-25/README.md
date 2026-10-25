# IEM Middle-Lead Recovery Archive

Codex (OpenAI), October 25, 2026. Exact pre-change `iem.mjs`, installation data and affected
preservation tests saved from `abad1f6`. Recovery tag: `archive/iem-middle-lead-2026-10-25`.

The old middle lead shared the upper lead's descending route; it had no new support.
Before image: `before.png`. Rejected major candidates are retained as
`draft-direct-departure.mjs` / `draft-direct.png` (departure intersected upper lead) and
`draft-floor-return.mjs` / `draft-return.png` (return crowded completed lower wiring).
Only the final route passed all cable/triangle/main-harness clearance checks outside the
explicit inherited gathering boundary. No rejected candidate was published.

Restore the old builder from the project root:

```powershell
Copy-Item -LiteralPath archive/iem-middle-lead-2026-10-25/iem.mjs -Destination dist/iem.mjs
```

Restore matching installation data/tests and status text from the recovery commit as a
coordinated change; do not revert unrelated work or mix old geometry with new assertions.
Run the full test suite before publishing any restoration. The Git tag preserves the
entire baseline for a separate recovery worktree without changing the current checkout.

Current source/QA/sample record: [research](../../research/iem-middle-lead-2026-10-25/README.md).
