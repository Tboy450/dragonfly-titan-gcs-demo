# IEM Lower Connector Pair

Codex (OpenAI), October 24, 2026. Revision `iem-2026-10-24-lower-service-pair`.
Only first-column lower leads (indices 2/3, model IDs 3/4) change in this package.

## Sources And Assumptions

Rechecked [APL's March 12 integration release](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins).
Real testing photo credit: NASA/Johns Hopkins APL/Ed Whitman; engineering-model harness
photo: NASA/Johns Hopkins APL. Originals remain in [the IEM source record](../iem-2026-10-13/README.md)
and neighboring power-units folder. The photographs guide silver wrap, labels and curved
exits, not exact flight circuits, supports or routing. No ground-test harness is copied
as an asserted flight network.

Existing [NASA workmanship pp29-31](../sources/nasa-harness-workmanship/README.md) inform
general support/stress-relief reasoning only. Cable construction and qualified bend radius
are unknown. Existing [TFAWS2023 slide3](../sources/tfaws2023-thermal-controller/README.md)
is CAD arrangement context, not a hardware photo or cable drawing.
Scale, connector layout, new routes, finish, lacing and support attachment remain [EST].

## Implementation And Preservation

Two shorter lower bends replace the old floor-level curves. Their returns use different
heights/depths, with four new ties, two low face supports and attached white labels. One
terminal approach bends around the retained tie block before reaching its unchanged end.
The first draft put a support in the neighboring lead's path; the revised supports clear
connector bodies, and swept-wire checks cover all four reviewed leads against each other,
their labels, supports and actual IEM hardware. No shared endpoint allowance was enlarged.
The legacy gathering contact zone remains explicitly bounded, not a whole-unit waiver.

The complete upper pair, its ties/supports/labels, chassis, plug poses, other 22 cable
curves/materials and all 26 endpoints/radii are exact against the pre-pass archive.
The main harness, neighbors, physics, thermal constants and game are unchanged.
The other22 leads have NOT been certified free of old crossings. Full flight circuit
identity, pinouts, bonding termination and whole-vehicle wiring remain unresolved.

Lower cable pair is a third non-nested inspection focus, alongside Connector face and
Upper cable pair. Interfaces, Harnesses / lines and Mounts remain independent. Open
interior and Restore remain available; no original numbered part is added or removed.
Long accuracy text stays in the existing expandable component detail.

`audit.mjs --write` saves the 26-row snapshot in `endpoints.json`, distinguishing prior
upper, current lower and22 legacy leads. All are EST with flight mating false. The shared
audit now computes the remaining count dynamically and writes only when directly invoked,
so importing it cannot overwrite the earlier upper-pair snapshot.

## Checks And Samples

**583 tests pass**, zero failures/skips. Three new regressions verify exact preservation,
third-focus/layer behavior, actual label contact and support-to-connector clearance.
Existing tests now check all four reviewed leads and all six pair combinations; original
endpoint/envelope/main-harness checks retain their existing tolerances and exemptions.
Slack is measured relative to a taut straight line, not required to exceed an already
curved legacy route. This is not mechanical qualification.

Browser: six Internal/Thermal focus cases, independent Interfaces/Harnesses/Mounts,
Restore/Open interior, original-model hiding and Pilot return. Phone client/scroll widths
are both375px, original24 numbered rows retained, zero browser errors.
Evidence: `browser-checks.json`, installed desktop/mobile pictures, `render-checks.json`
and explicit mobile screenshot-crop pixel check (not a framebuffer readback).
Raw research renderer uses actual production/archive modules with no material override.
`iem-lower-real-cad-before-after.jpg` combines real photo, labeled CAD and actual renders;
`comparison.py` makes this reproducible without generated imagery.

Archive and restore: [iem-lower-pair-2026-10-24](../../archive/iem-lower-pair-2026-10-24/README.md),
tag `archive/iem-lower-pair-2026-10-24` on `7a50d2e`. Rejected low-support draft is retained
with its picture. No unrelated files changed.

## Next / Handoff

Next bounded group: second card column, existing indices4/5/6 (three leads). Keep all four
completed leads and all26 endpoints fixed. Use the same actual hardware photos and existing
geometry register; do not repeat the attic-controller search or redraw the enclosure.
Check actual support contact, connector clearance, current floor bundles and all reviewed
wire pairs, then archive and sample before moving on. Remaining22 leads and the separate
PSU/radio/navigation/battery families keep the overall installation checklist open.
