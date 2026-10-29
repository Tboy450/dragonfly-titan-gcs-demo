# Dragonfly Work Log by Assistant

Claude (Anthropic Claude Opus 5.5), October 29, 2026. Companion to Codex's activity graph of the
same day (`research/project-work-log-2026-10-29/` in Codex's worktree), after the owner asked
whether Claude's work was included and which dates could be added.

## What this adds

- `work-log-by-assistant.png`: the same 246 commits as Codex's graph (same Git snapshot
  `eb84229`, same rule for leaving out game-only commits, copied from Codex's script), but each
  day's bar is split by who did the work, and 24 milestones instead of 8, covering the
  part-by-part work of both assistants and GitHub Copilot's weekend.
- `dated-log.md`: every counted commit under its date, with who did it, the table view behind
  the graph. `commits-by-assistant.csv` and `daily-by-assistant.csv` hold the same data.
- `make_graph.py`: regenerates all of it.

## How work is attributed

Every commit's author is "Heemi"; the `Co-Authored-By` line names the assistant. Totals:
Claude 97, Codex 130, both 2, GitHub Copilot 2, unattributed 15.

- Three of Codex's October 19 part-05 commits have no co-author line; they are credited from the
  signer of the change-log entry each one adds or edits (both Codex).
- The 15 unattributed commits are all September 20–28, before co-author lines and the change log
  (which begins September 28) were in use.

## Dates checked for additions

- No new days: commit author dates match commit dates for every Dragonfly commit, and no
  project document records work on the days without commits (Sep 22–25, Sep 30–Oct 3,
  Oct 5–7). Nothing dated before September 20 was found.
- New dated milestones (in the graph): Sep 28 change log begins; Sep 29 arrival sequence and
  research-based model; Oct 4 Copilot's weather and first expedition; Oct 8 landing area;
  Oct 11 inspection model; Oct 13–15 Claude's radio, IEM, power units, cameras, drills, air
  loop, TWTA, antenna gimbal, battery, rotor heads and part numbers; Oct 16 aft bulkhead and
  inspection layers; Oct 18 part 22; Oct 19 part 05; Oct 20 attic detail and arm shoulders;
  Oct 21 wiring harness, parts 03 and 09, and the 24-part list closed (Codex's sensors);
  Oct 27 DrACO audit; Oct 28 blowers rebuilt.

Commit counts are recorded activity, not hours or effort; a day of research can be one commit.
