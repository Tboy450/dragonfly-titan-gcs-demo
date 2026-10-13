# Part 08: DraMS Enclosure-Level Rebuild

Implemented October 12, 2026 by Codex (OpenAI). Revision `drams-2026-10-12`.
Source: `dist/drams-assembly.mjs`. This is an **estimated educational reconstruction**,
not an imported model, manufacturing drawing or verified flight configuration.

## Sources and Credits

- [NASA SVS 15003: DraMS/carousel integration](https://svs.gsfc.nasa.gov/15003).
  `nasa-drams-integrated.jpg` is GSFC_20260305_DRAGONFLY_012265_SMALL.jpg.
  March 5, 2026 photograph; released April 20, 2026. **NASA/Mike Guinto**, NASA Goddard.
  Other views already reside in `research/carousel-2026-10-12/`.
  This photo is retained as a reference, not used as a texture or an endorsement.
- [NASA Goddard, Barfknecht et al., SciTech 2024 thermal-interface paper](https://ntrs.nasa.gov/api/citations/20230017316/downloads/AIAA_SCITECH2024_final_proof.pdf),
  figs. 1, 2, 11. Warm/cold instrument layout, ITMS body, interface and carrier context.
- [NASA spacecraft/instruments](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/)
  and [Goddard DraMS project](https://science.gsfc.nasa.gov/674/projects/459/): instrument purpose.
- [ICES-2023-389](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content),
  p. 7: the DraMS laser needs fan cooling during operations. It does not supply the fan's CAD.

## What Changed

The four generic blocks are replaced by an enclosed cylindrical analyzer illustration,
electronics/laser/GC enclosures, a mounting frame, local lines and a small fan-casing
illustration. Lids and end covers are separate from the casing walls. The visible forms
are guided by the reference assembly/layout, but the identification of small photographic
details is incomplete. Temporary lift/turnover hardware and extensive test harnesses are excluded.

No invented electrodes, circuit boards, GC columns, optical elements or sample-oven
internals are exposed inside the casings. Those need their own reference passes. The
pyrolysis oven remains associated with the carousel-side analysis interface, not relocated
into the warm electronics box by this drawing. The model's thermal and science physics
are unchanged; warm-side colors use the shared bay-temperature node.

## Dimensions and Interfaces: All Estimated

No authoritative component dimension drawing was found. The warm-side envelope is
proportioned to the current attic and reference layout: nominal body limits x=0.15..0.35,
y=0.08..0.45, z=-1.54..-0.96 m. These bounds are a modeling allowance, not a NASA specification.
The analyzer housing is approximately 0.172 m across and 0.15 m long in this reconstruction.
Port positions, fan, box dimensions, fasteners, routing, finishes and material appearances
remain [EST]. Do not use this asset as engineering evidence.

The interface center is derived from `wonderwallAsset`, not duplicated coordinates.
Its 0.024 m-radius neck passes through the existing 0.046 m-radius opening; flanges remain
inside that opening's radial clearance. This represents a simplified connection, not
a validated flight seal, laser alignment or complete carousel-to-instrument transfer path.
The carousel and Wonderwall geometries were not moved or scaled to accommodate it.

## Inspection and Verification

- Independent groups for mounts, casings, service covers, interfaces and local lines.
  They prepare future shell/foam/casing hide/show controls; no new visibility buttons yet.
- DraMS isolation shows **only DraMS** so neighboring panels cannot hide it. Turning
  isolation off restores the installed context. The analysis cue is anchored to the new analyzer.
- Clearance tests compare the rebuilt set only: DraMS, Wonderwall and carousel. Body
  bounds clear the wall; the intentional penetrating neck is checked against its aperture.
  Older neighboring parts remain provisional.
- 157 Node tests passed. Desktop/360 px Playwright checks, four angles in Internal/Thermal,
  nonblank framed pixels, no horizontal overflow or browser exceptions. The first isolation
  draft obscured DraMS with its neighbors; it was archived and corrected before release.

Previous implementation and restore instructions:
[`archive/drams-2026-10-12`](../../archive/drams-2026-10-12/README.md).
Further work: authoritative dimensions, detailed instrument subassemblies and sealed routes.
The Frontier radio (#13) has a clear official exterior photograph and is a useful next candidate.
