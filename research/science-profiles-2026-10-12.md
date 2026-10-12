# Science Profiles and Compact Panels

Reviewed and implemented October 12, 2026. Signed: Codex (OpenAI).

## Evidence

- [NASA DraMS development, LPSC 2021](https://ntrs.nasa.gov/api/citations/20210011122/downloads/Trainer_DraMS_Update_LPSC21_1532.pdf):
  LDMS supports broad compositional investigation, including refractory organics. GCMS
  separates gas-phase material after sample preparation, with pyrolysis and derivatization
  among the possible treatments. These are different analytical paths, not identical tests.
- [NASA science workflow transcript](https://svs.gsfc.nasa.gov/vis/a010000/a013500/a013562/13562_DragonflyScience_Transcript.html):
  pneumatic transfer, cold sample cups, laser analysis and a separate cup for heated
  GC follow-up. Our simulator does not model this cup inventory or automatic handoff.
- [DraMS thermal study, ICES-2024-103](https://ntrs.nasa.gov/api/citations/20240005590/downloads/ICES-2024-103-Final.pdf):
  hot gas-processing hardware, cold sample regions and convection in Titan's dense
  atmosphere make thermal isolation and coupling important. The computational runtimes
  reported for thermal solvers are NOT science-operation durations. No flight schedule
  or mode-specific duty cycle was inferred from them.
- [NASA laser engineering test abstract](https://ntrs.nasa.gov/citations/20240001118)
  and [Goddard project overview](https://science.gsfc.nasa.gov/earth/projects/459/) provide
  laser/heritage context. No laser pulse physics or mass spectrum was added.

The APL payload page could not be fetched in this pass; existing credited project
references remain intact. All operation durations below are [EST], not published values.

## Implemented Model

| Profile | Total time [EST] | Instrument energy [CALC from EST loads] | Bay heat fraction [EST] |
|---|---:|---:|---:|
| Existing quick demo | 30 s | 1.33 Wh | 2.5% |
| LDMS training | 600 s | 25.67 Wh | 80% |
| GCMS training | 1800 s | 129.83 Wh | 80% |

Both extended profiles collect a fresh sample: 120 s drilling at 160 W, 60 s transfer
at 160 W and 30 s positioning at 60 W. LDMS then has 330 s analysis at 180 W and
60 s securing/cooldown at 40 W. GCMS has 300 s preparation at 360 W, 990 s analysis
at 320 W and 300 s securing/cooldown at 40 W. Every stage value is [EST].

Stage energy is integrated across boundaries, charged once, and coupled into the shared
equipment-bay model. The generic load-heat term excludes this already-accounted science
load. Vehicle housekeeping, battery loss and radio loads remain additional. There is no
separate resolved oven, cold-cup or detector temperature; timed cooldown is illustrative.

20x/100x science acceleration uses bounded normal physics steps. Weather, thermal state,
battery and communications advance on the same clock. Pause freezes the job. Movement,
unsafe thermal state or insufficient reserve interrupts it without refunding spent energy
or awarding a partial record. Cancel returns time warp to 1x. Completion returns to 1x
unless another authorized accelerated operation remains active. Reloads preserve completed
records and selection but stop unfinished jobs, consistent with landed checkpoints.

Each completed record stores profile, site, acquisition/completion clocks, duration,
instrument energy and the existing FIFO downlink boundary. The 40 Mbit result size is
retained as [EST]. Example compositions are not measurements, molecular identifications,
abundances, handedness determinations or evidence of life.

## Layout and Remaining Limits

The notebook/debrief, sample records, method/budget notes and engineering references use
native, keyboard-accessible details elements, closed initially. Active objectives,
essential controls, progress and instrument states stay visible. Section links work in
Mission and Pilot; the notebook no longer forces a view switch. Normal scrolling, browser
zoom, the full-screen flight option and reset controls remain.

Future work: sourced full procedure schedules, cup inventory/consumption, explicit sample
handoff, separate thermal nodes and a queued operations planner. These training profiles
do not claim to implement those systems or a verified mission duty cycle.
