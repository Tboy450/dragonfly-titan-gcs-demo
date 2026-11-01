# Swarmfall before the victory/continue choice

Preserved October 19, 2026 — Codex (OpenAI). Baseline: published multi-pod/Clean view
release `5b05c32`, tagged `archive/swarmfall-victory-choice-2026-10-19`.

`original/` retains exact battle, campaign, checkpoint, UI, HTML/CSS and existing tests
before replacing automatic victory. That version immediately wins at the capture threshold,
uses mission checkpoint v2 and campaign progress v1, and has no settlement-ID ledger.

The dated [historical HUD picture](../swarmfall-drop-waves-2026-10-19/historical-restored-mission-2026-10-16.png)
is an older October 16 reference, not a newly captured screenshot of this baseline. Browser
tooling rejected access to the local preview; no new visual/browser acceptance is claimed.

To restore the complete old behavior, use the tag in a separate checkout. The `original/`
tree supports file comparison; save newer work before copying anything back. Newer saved
mission/progress versions need explicit handling when running old code; never discard them.

The v2 between-arrivals fixture was generated before editing these files. The v1 campaign
fixture was generated using the archived original campaign module and its real reward code.
They test migration to checkpoint v3/progress v2 without changing old payloads or campaign wins.
No downloaded source, city derivative or unfinished asset-kit work was removed.
