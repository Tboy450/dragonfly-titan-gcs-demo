# Part 09 Rotor Drive Electronics: Owner-Approved Design Approximation

Claude (Anthropic Claude Opus 5.5), October 21, 2026, after the owner approved labeled
approximations for 03 and 09. Codex's provisional enclosures (October 15, inspection pass
October 19; [notes](../rde-2026-10-15/README.md), [inspection](../rde-inspection-2026-10-19/README.md))
are kept mesh-for-mesh; this pass adds detail and closes the part out. Credit stays with Codex.

## Basis

- Published: two RDE boxes with internal fans just aft of the attic (ICES-2023 pp. 5/7);
  APL's wide-bandgap rotor-drive electronics (APL G-RADNEXT 2026 abstract) and AAC's
  motor-controller current sensors (both found by Codex). APL's CAPS 2024 thermal-test photo is
  too obscured for casing detail. No flight RDE photo is public.
- Style source: APL's photographed avionics on the same vehicle, the IEM (black finned
  heat-sink top) and the power units (slice seams, mated D-sub plugs with backshells), in
  [`../iem-2026-10-13/`](../iem-2026-10-13/README.md) and
  [`../power-units-2026-10-13/`](../power-units-2026-10-13/README.md).

## What changed (`dist/rotor-drive-electronics.mjs`, revision `rde-2026-10-21-approximation`)

- Black finned heat sink on each lid (11 fins), clear of the lid fasteners and 2 mm under the
  TWTA waveguide flange above box 2.
- Three slice seams on each side.
- Mated plugs and backshells on Codex's connector blanks, with short leads that meet the main
  harness branch in front of each box.
- New meshes are named `-approx-`; labels say "approved approximation". No boards, pinout or
  flight configuration claimed; all sizes [EST].

## Tests changed

Codex's `tests/rotor-drive-electronics.test.mjs`: the archived mesh manifest still must match
Codex's meshes exactly (the `-approx-` meshes are excluded and checked separately); the
"unchecked" test became "counted as an approved approximation"; labels say approximation.
All 428 tests pass (the first fins touched the TWTA waveguide flange and were shortened).
Renders: `model-*.png`. The previous version is archived in
[`../../archive/rde-2026-10-21/`](../../archive/rde-2026-10-21/README.md).

## Still open

A flight RDE photo; real casing, fan count, connectors, mounting and arrangement (Claude's
October 15 note: ICES-2023 fig. 4 may show both boxes on one side of the bay).
