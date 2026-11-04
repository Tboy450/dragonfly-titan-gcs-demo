# Save loading before protected recovery

Preserved October 19, 2026 — **Codex (OpenAI)**. Baseline
`e6bb497e426f15471bd855099f1da5c4ecf03e1b`, tagged
`archive/swarmfall-save-recovery-2026-10-19`.

`original/` contains exact prior `main.mjs`, `campaign.mjs`, `index.html` and `invasion.css`
from `dist/invasion/`. That version silently substituted fresh progress for unreadable or
unsupported saves and hid a rejected mission without a recovery/export interface. Reset
changed in-memory progress before knowing whether its write succeeded.

`historical-restored-mission-2026-10-16.png` is the dated picture retained in the earlier
drop-wave archive. It is historical context, not a screenshot of this baseline's title UI.
Browser access was blocked earlier in this chat and was not retried; no new before/after
browser acceptance is claimed.

Use the tag in a separate checkout to reproduce the prior behavior. For file comparison,
map `original/` back to `dist/invasion/`; the new recovery module can remain unused. Preserve
all newer work and browser save files before restoring older code. Source assets, lab VFX,
checklists and unfinished kit work are retained.
