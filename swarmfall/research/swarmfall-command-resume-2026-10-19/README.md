# SAVE-04 — Resume command and camera state

Implemented October 19, 2026 — **Codex (OpenAI)**.

Resume now retains the selected active/inbound squads, camera, draft drop payload and open/
closed drop panel. The mission still starts **paused, at 1×, with the HUD visible**.
Pointer gestures, landing coordinates and placement authorization are discarded; resuming
never launches a wave or gives a new order. Existing issued orders and inbound formation
slots continue to come from the saved battle.

## Data contract

Checkpoint v3 gains an optional `command` object with its own version 1. There is no change
to battle schema, settlement identity or paid cargo. Missing/unknown command versions use
safe defaults: no selection, normal default payload and a closed panel. v1/v2 checkpoint
fixtures continue to migrate through the existing path with the same paid payloads.

`command-state.mjs` is plain logic without DOM access. Selection keeps only real squads
with surviving player drones or unreleased cargo, removes duplicates and is bounded by the
current squad cap. Payloads retain known unlocked whole-number counts from 0 to 44 per type,
including an explicit empty draft. An unaffordable/over-capacity draft may be remembered;
the normal drop validator still decides whether it can be purchased. Steppers stop at the
existing per-type valid-payload limit of 44.

Optional malformed/future UI data is independently normalized and cannot discard an otherwise
valid paid battle. Battle fields still undergo strict validation. Camera state retains the
existing finite validation and is clamped to normal usable view bounds at mission start.
No clean-view flag, speed, pointer position, placement hint or cached landing preview is
restored. An open drop panel computes a fresh home-court preview; it grants no launch intent.

## Evidence and limits

**360/360 tests passed.** [Full output](test-results.txt).

Seven new plain-state tests cover round trips, zero/empty drafts, unavailable/duplicate squad
references, over-budget drafts without purchases, optional corrupt/cyclic metadata, legacy
fixtures and reloads before/between/after sibling arrivals. Two additional tests execute the
actual Resume entry point with DOM/renderer stand-ins: restored selection/camera/payload,
paused/1×/HUD state, panel visibility, cancelled placement, disabled stale launch and no extra
charge/pod. The existing recovery, drop, victory and all-seven-planet tests also pass.

These are Node checks. Browser access was blocked earlier and was not retried. Real desktop/
touch reload, dialog/notification layout and device acceptance remain under SAVE-06 and the
existing release checks. SAVE-03 real-browser storage-fault review is still open; SAVE-05
depends on the future environment/district contract.

[Prior runtime/test and dated picture](../../archive/swarmfall-command-resume-2026-10-19/README.md)
are retained with restore instructions. The concurrent Ocellus research-only update `0fc30b7`
was incorporated before this work; no model, asset, source receipt or checklist ID was removed.
