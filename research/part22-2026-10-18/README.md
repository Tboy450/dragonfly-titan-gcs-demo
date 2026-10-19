# Part 22 Continuation: Separate Probe Inspection and METHAN Evidence

October 18, 2026. Codex (OpenAI). **Part 22 is still open; count remains 18/24.**

## Both EFIELD Probes Already Exist

The October 17 model includes the upper starboard front and lower port rear assemblies.
The sample image shown in chat was only the front assembly. This pass does not add a
third probe or change their published dimensions, estimated mounts, geometry or materials.

The Mission inspector now has a Subassembly selector for this component: All subassemblies,
Front EFIELD, Rear EFIELD, METHAN (provisional). Focusing a subassembly frames its own bounds;
Isolate hides the other subassemblies temporarily. The single original label 22 follows the
selected hardware. Selecting another component, camera reset or Follow sampling clears the
subassembly choice. Internal and Thermal retain it between layer switches. Ordinary Exterior,
Pilot and original-model views keep all ordinary hardware and their existing cameras.

Uses tagged child groups (`userData.inspectionLabel`) and existing part IDs, no new part
numbers or flight/science state. Existing component-wide inspection masks still apply.
Restore Layers preserves subassembly/camera selection; camera reset clears both as before.
Render-time visibility is restored even when rendering throws. No live pose is changed.

## METHAN Research

[Lorenz et al., IPM 2025 printed pp. 184-185](../sources/ipm2025-dragmet/README.md) gives
the actual split between a cold exterior mirrored gas cell with dust filtration and a warm
internal DPU light engine connected by optical fiber. Sources are in-band 1.67 micrometer
and continuum superluminescent diodes; detectors are inside, not a generic exterior laser
module. No visible beam or extra methane physics has been added to the simulator.

Checked primary sources: APL overview; IPM program and all poster texts; CAPS 2024 slide 42;
Giant Planet Probes 2022 abstract; EGU 2026 DraGMet update; NASA NESC technical activity list.
Targeted primary-domain image search found no usable METHAN hardware result. Public papers
reviewed provide its mechanism and schematic/CAD, but not a clear hardware photo or flight
enclosure dimensions. This is a scoped search result, not a claim that no such photo exists.

The owner's real-photo-first appearance rule remains in force. An asynchronous question
asks whether to permit a clearly labeled design-based approximation if no photo is available.
Until answered, retain METHAN's placeholder; do not check off #22 or call a CAD reconstruction
photo-matched. Any approved approximation must keep optical sources/detectors in the warm
vehicle, mark dimensions/routes [EST], archive this version and check the rebuilt set only.

## Verification and Continuation

272 Node tests passed after adding per-probe inspection tests. Real Edge/WebGL: all three
subassemblies at four azimuths have nonblank framed pixels; Internal/Thermal and desktop,
390/360 px views pass; no page errors or horizontal overflow. Images and `selector-checks.json`
are saved here. Prior viewing behavior and exact originals are archived in
[part22-inspection-2026-10-18](../../archive/part22-inspection-2026-10-18/README.md).

Worktree remains `codex/dragonfly-nose-sensors-publish` in the QA root. It was fast-forwarded
from the October 17 simulator update to already-published `fb2e5b6`, preserving the other
chat's released city/game work. The shared checkout's untracked kit/assets stay untouched.
This continuation is a local checkpoint pending the METHAN appearance decision, not a claim
that the live site or part-completion count has been updated.
