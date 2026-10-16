# Fans before the canted aft-panel fit

Baseline/tag: `f216162`, `archive/fans-v1-2026-10-15`. Exact original `thermal-loop.mjs`
saved by Codex October 16, completing Claude's October 15 adjustment.

Fans were at z 1.16 m with an adapter toward z 1.24. Claude moved them to z 1.04 and ended
the collar at the canted panel's forward face. Duct transition and illustrative air path
followed that move; no thermal/flow/power constants changed. This is coupled to the aft-panel
geometry, not a measured flight fan coordinate.

Before pictures and the matching original vehicle file are in
[`../aft-bulkhead-2026-10-15/`](../aft-bulkhead-2026-10-15/README.md). Restore the old fan,
adapter and flow-path blocks only together with that previous aft-panel/level-MMRTG pose.
Preserve the battery pass's lower duct position and newer work. Run tests and inspect the
installed assembly after any restoration. Never replace unrelated code wholesale.
