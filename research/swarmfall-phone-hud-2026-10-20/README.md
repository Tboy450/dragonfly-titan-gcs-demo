# FIX-07 — phone HUD decluttering

**Codex (OpenAI), October 20, 2026.** On screens up to 720 CSS pixels, the first
recorded zone capture closes Objectives and Battle log once per mission. Native
summary controls reopen each independently; later refreshes/captures respect that
choice. Starting a new mission resets panels. Restored missions with captures
start compact on phones and open on desktop. Narrowing a captured desktop mission
compacts on the next HUD refresh. Widening does not undo a manual panel choice.

The log keeps its latest four entries and existing live-region markup. Warning
toasts/top-bar hazard information remain independent; Clean view hides both panels.
Closing a panel containing focus moves focus to its summary.

Five new tests execute the real entry point with DOM/renderer stand-ins: first-capture
trigger, manual reopening, width change/new mission, captured checkpoint resume, and
log/warning/keyboard continuity. The harness now distinguishes details from modal
dialogs and provides a wide-screen matchMedia default. Full suite: **405 tests pass**;
see `test-results.txt`. This is automated behavior coverage, not browser layout,
screen-reader or touch acceptance. Those real-device checks remain open.

Exact originals and a clearly dated historical picture are retained in
`archive/swarmfall-phone-hud-2026-10-20/`, with baseline tag and restore instructions.
Neither environment lab or independent asset studio is changed.
