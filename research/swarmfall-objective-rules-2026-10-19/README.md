# OBJ-08 — Clear objective wording and rules

Implemented October 19, 2026 — **Codex (OpenAI)**.

Velm's watchtower and Halcyon's signal-jammer goals now say **“Neutralize every … (destroy or
capture)”** in the briefing, mission goals and debrief. Progress says **“N hostile remaining”**.
The counter includes only live native targets, so a dead record awaiting pruning is not an
outstanding defense. Converted defenses count as neutralized while held by the swarm; an
enemy retaking the zone makes them outstanding again. Optional stars finalize at extraction.

`objective-rules.mjs` provides shared text for current briefings and live/checkpoint goal
presentation. The historical saved `destroyType` key is deliberately retained: it already
allowed conversion. Old saved text is presented clearly without mutating the saved battle,
changing mission identity, changing checkpoint version or dropping paid cargo.

| Rule | Meaning |
| --- | --- |
| Defense neutralization | No live hostile target of that type remains; destroy or capture it |
| Capture/recovery | Zone is held, or its special artifact has already been recovered |
| Maximum losses | Losses are at or below the stated limit |
| Alarm below | Recorded peak is strictly below the limit |
| Win within a time | Extraction time is at or below the limit |
| No hazard losses | Hazard-loss count is zero |

**366/366 tests pass.** [Full output](test-results.txt). Six new tests cover all campaign
labels/required targets; real weapon kills; actual zone conversion and enemy retaking for
both target types; legacy wording/restore; final-state stars and other rule boundaries.
Controlled combat fixtures isolate the target and defer timed reinforcements/weather. For
the jammer conversion test a Link approaches the far edge of a capital outside its existing
95 m aura; the jammer's anti-capture rule is not weakened. These tests verify rules, not
whole-mission balance or the viability of a purely quiet route through every district.

SAVE-04 `ede71e4` finished deployment and its public build/command module were verified before
this pass. Browser access was previously blocked and was not retried; real desktop/touch and
visual acceptance remain open under the existing test/release tasks.

[Prior code and dated picture](../../archive/swarmfall-objective-rules-2026-10-19/README.md)
are preserved with restore instructions. No source assets, models, kit drafts or existing
task IDs were removed.
