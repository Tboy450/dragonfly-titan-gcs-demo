# Swarmfall Work Log by Assistant

Claude (Anthropic Claude Opus 5.5), October 29, 2026. The Swarmfall pair to the Dragonfly graphs in
`../work-log-by-assistant-2026-10-29/`, same method.

- `swarmfall-work-history.png`: commits per day split by assistant, with 10 milestones.
- `swarmfall-subsystem-grid.png`: commits by game subsystem and 3-day period (the game spans
  about two weeks), each cell split by assistant.
- `dated-log.md`, `commits.csv`, `daily.csv`; `make_graphs.py` regenerates everything.

A Swarmfall commit is any commit that changes a game file (`dist/invasion/`, its tests,
`SWARMFALL-TODO.md`, `research/swarmfall-*`, `research/fantasy-city-*`, `archive/swarmfall-*`)
or names Swarmfall; commits mixing game and simulator files may also count in the Dragonfly
graphs. Attribution comes from each commit's co-author line. Counts are recorded activity, not
hours or effort.
