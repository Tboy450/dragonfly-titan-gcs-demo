# Compact blower tubing correction

Codex (OpenAI), October 28, 2026. Owner correctly rejected the loose-looking loops
in the first supplier-referenced blower installation. Collision-free geometry
did not make those long routes a justified flight installation.

## Evidence and limits

[Zacny et al., LPSC2020 abstract1763, page1](https://www.hou.usra.edu/meetings/lpsc2020/pdf/1763.pdf)
describes bent tubing and standard fittings, and explicitly notes the blower-power
cost of extra tube length. This supports a compact-routing design principle;
it does **not** establish exact current flight geometry, dimensions, material,
supports or bend radii. [LPSC2022, abstract1069](https://www.hou.usra.edu/meetings/lpsc2022/pdf/1069.pdf)
confirms the shared/redundant flow topology. Existing saved pages and real supplier
photos are reused. No new hardware photo or more authoritative flight ICD found.
No new paper figure is used to derive the route coordinates.

## Correction

- Four EST rigid-tube illustrations: straight runs and local tangent bends replace
  unconstrained Catmull-Rom curves. The curve stays inside its control polygon;
  it cannot bulge out into large free-form loops between control points.
- Forward intake tucks down the inboard side; aft intake passes above the drill
  moving leads before descending beside its blower. Both retain a compact turn
  into the downward-facing inlet. That orientation and these turns remain EST.
- Each exhaust is a short single-bend open spout, not a dangling tail.
- One EST retention clip/tab per intake meets an existing lower wall bracket;
  no extra insulation opening or equipment relocation. Clip shape/material/flight
  qualification unconfirmed. Brackets and the original four reliefs stay exact.
- Source-referenced unit exteriors, both poses, source envelope, selector/actuator,
  fittings, upstream sample tubes, drill hoses and all navigation numbering remain
  unchanged. No flight power/pressure-loss solver claim is added.

## Checks / handoff

Two additional regressions preserve the exact archived unit meshes/poses/fittings,
bound all pipes close to the units, require every route to shrink by at least25%,
check straight-plus-bend construction, and verify clip seating/support endpoints.
Existing checks cover 13 mm pipe surfaces against the full installed geometry,
own bodies, other pipes and both drills at0/65/130 mm feed, plus inspection masks.
The older neighbor-box test produced a false hit in the empty center of a U-shaped
moving lead; new blower routes now disambiguate those coarse hits with actual
transformed triangle surfaces. The independent full-model stroke suite is retained.

Run `node --test --test-concurrency=2 tests/*.test.mjs` before publishing.
Geometry/length measurements and browser samples are saved here. Preserve the old
layout via [archive](../../archive/blower-routing-2026-10-28/README.md), tag at923828b.
The rejected first compact aft path crossed a moving lead at[-.442,-.240,-.466546]m;
it is retained in the archive draft record. Final route goes above that lead.

Next: exact flight installation, electrical interfaces and feed-sensor identity
remain unresolved. Do not treat a tidier estimated tube layout as source-verified
hardware. No Assets Lab, Swarmfall, private outreach or saved-flight data edited.
Public verification and merged test count are appended after deploy.

751 merged tests pass. Actual-mesh/stroke checks and archive guards pass; desktop,
Thermal and390px phone samples saved. Phone has33 selector options/32 list IDs,
Open interior and current compact-tube disclosure, no overflow or console errors.
Measurements: forward intake0.457 m (-51.5%), aft0.866 m (-36.5%), each exhaust
0.106 m (-60.7%). `before-after.jpg` uses the same camera for both archived and
corrected geometry. No duplicate unchanged hardware/photo comparison made.
