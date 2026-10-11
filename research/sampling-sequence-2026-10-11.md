# Sampling Sequence Review

Reviewed and implemented by OpenAI Codex, 2026-10-11.

## Published Architecture

- [NASA: Playing Lacrosse on Titan](https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/), 14 April 2020, rechecked 11 October 2026: [PUB] two redundant drills and two cross-strapped blowers; pneumatic transport through tubing; a cup captures part of the material; a carousel positions the cup for analysis. This supports the displayed acquisition order, not its timing or motion dimensions.
- [NASA: Dragonfly Gets Decked Out, Tested](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/), 23 April 2026, rechecked 11 October 2026: [PUB] the carousel holds sample cups. DraMS uses laser desorption and gas chromatography to release molecules for mass spectrometry. The animation does not attempt to reproduce a real laser pulse, chromatography run or measured spectrum.
- [APL spacecraft and payload](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php): geometric reference remains available in the app with its original credits. No additional third-party image assets are included in this update.

## Implemented Demonstration

| Interval | Visual stage | Status |
|---|---|---|
| 0-10 s | One drill feeds and rotates | [EST] 13 cm feed, helical cutter shape, slowed rotation; no hardware RPM claim |
| 10-18 s | Markers travel along the transfer route toward the receiving cup | [EST] route extension, marker size/speed; a diagram, not resolved physical particles |
| 18-22 s | Drill retracts and carousel indexes | [EST] motion and quarter-turn; not flight indexing or cup-use accounting |
| 22-30 s | DraMS activity marker | [EST] combines analytical operations; no inferred spectrum or mode-specific temperature |

All intervals are simulator seconds. The existing **30 s / 160 W** job, result/data award,
mission completion and safety guards are unchanged. These are gameplay assumptions, not
published science-operation duration or measured hardware power. The real acquisition may
overlap operations differently; the staged rendering is a readable schematic.

The science clock is the only clock. The renderer and readouts project it without changing
mission state. Pausing stops the motion; aborting clears the diagram and stows the bit. A new
sample starts from the prior completed carousel position. Port-side operation is illustrative;
no drill selection, fault redundancy or physical cup capacity is simulated.

Flow, receiving-cup and activity markers appear only in **Internal** view. Thermal coloring is
unchanged. The clean-room portrait remains stowed and independent of the live sampling job.
The original demo model retains its mock-up geometry rather than claiming these refinements.

## Verification

- 123 Node tests pass, including pure stage boundaries, pause/abort/completion, geometry poses,
  clean-room independence, and the existing single-result/single-energy-accounting tests.
- Edge/Playwright: actual Sample here and Inspect sample controls; pause; mission/Pilot view
  switches; flight/science steps advanced to each boundary; one completed sample record.
- Desktop 1440 px and phones 390/360 px: no horizontal overflow in the new controls; screenshots
  reviewed. Canvas pixel checks at 900x600 and 360x460 confirm nonblank framing and changing flow
  marker positions. No page errors.

## Scope Left Open

Actual multi-hour acquisition/analysis scheduling, separate LD/GC operations, drill force/depth
and sample-cup lifetime management need additional sourced specifications and a separate
simulation milestone. This update adds no new thermal or particle-physics claims.
