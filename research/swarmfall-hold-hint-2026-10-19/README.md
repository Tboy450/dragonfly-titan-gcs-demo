# FIX-11 — Hold feedback with no selection

Implemented October 19, 2026 — **Codex (OpenAI)**.

Hold and H share a single handler. Without a selected squad, they now say:
“Select a squad first: click or tap a drone or a squad card, then choose Hold.”
The HUD is restored if needed so the message and squad cards can be seen. Key-repeat H
events are ignored. With a selection, the existing Hold order behaves as before and Clean
view stays on. No selection, battle state, matter or save data is changed by the hint;
ended missions receive no Hold action or warning.

**390/390 existing tests pass.** [Full output](test-results.txt).
[Focused entry-point checks](control-checks.txt) exercise actual button and keyboard handlers
with the existing DOM/renderer stand-ins: empty button guidance/no battle mutation, H/HUD
restoration/repeat suppression, selected real drone Hold and ended-mission guard. No new
permanent test was added for this small reversible UI change. Native browser/touch acceptance
is not claimed; previously restricted browser automation was not retried.

Canonical Swarmfall checklist: **25/305 checked**. Original and copied environment labs,
standalone studio files, game models and underlying battle Hold rules remain unchanged.
The old behavior is [preserved with restore steps](../../archive/swarmfall-hold-hint-2026-10-19/README.md).
