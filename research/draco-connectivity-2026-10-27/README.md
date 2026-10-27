# DrACO Both-Drill Plumbing Continuity

Codex (OpenAI), October27,2026. Owner confirmed the extra port-side equipment was
the concern, then asked whether both drills actually connect to it.

## Findings and correction

Both modeled intake routes exist: drill swivel -> its flexible hose -> its intake
tube -> shared carousel selector -> port return -> blower selector -> either blower.
The intake tubes go forward along opposite body edges and up to the carousel; the
near-drill view hides much of that route. Existing sample-lines isolation already
retains both drills, carousel and blowers. No new inspection mode was needed.

A real1 mm gap existed at the shared return/blower-selector face. The older test
expanded the box2 mm and accepted it. Only the last return control point advances
4 mm, giving a3 mm estimated seat. All other controls, line dimensions, drills,
valves and blowers remain exact. This seat is not a flight coupling specification.

`trace.mjs` checks10 actual external endpoint/envelope joins with no expanded box;
`continuity.json` saves the results. Negative gap means the endpoint lies inside a
valve envelope. The1e-8 m tolerance handles floating mesh coordinates, not a loose
millimeter fit. The archived before report reproduces the1 mm failure. Existing
tests also check both hoses at the moving drill ports through the stroke.

Solid valve boxes do not reconstruct internal passages, switching, pressure drop
or suction. The single carousel junction still simplifies the separate LDMS/GCMS
elevator paths. The existing collapsed inventory now states the route and limits.

## Sources reused

- [Zacny et al., LPSC2022 abstract1069, fig.1](https://www.hou.usra.edu/meetings/lpsc2022/pdf/1069.pdf):
  either drill can serve either cup system using either blower. Functional topology;
  Phase B CAD is arrangement evidence, not a hardware-photo appearance reference.
  Saved page: `../sources/draco-lpsc2022/lpsc2022-1069-p01.jpg`.
- [NASA: Playing Lacrosse on Titan](https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/):
  cross-strapped redundant drills/blowers; tubes can route around the vehicle.
- Placement limits and credited real prototype imagery remain in the previous
  `../draco-side-audit-2026-10-26/README.md`; no new generated imagery was used.

## Checks and continuation

655 tests pass. Three new regressions check10 joins, reproduce the old failure and
retain every unrelated mesh/material/pose plus all other return controls. The older
audit preservation test explicitly defers only the changed return to these new tests.
Desktop browser: sample-lines isolation shows both drill routes, carousel and blowers;
24 parts, eight inventory rows, route/limits text verified,1265/1265px and zero errors.
`network-local.png` and `browser-checks.json` saved. The old4196 origin retained stale
dev imports; the4197 fresh-origin check verified new text. Only one preview server
remained active. Both temporary servers and the local preview tab are now stopped.

Published **b27cb6e9c7a2f3f1e4b0ab95a0fa2a96329bc35d**, October27,2026.
[Public simulator](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=b27cb6e).
Pages40475925194 succeeded, including the full655-test suite. Live header/build,
full-network inspection, route/limits/3 mm seat text,24 numbered parts/eight rows,
1265/1265px and zero browser errors verified. Inventory collapsed on page load.
`public-checks.json` and `public-network.png` record the result; the latter is a
canvas crop of an actual screenshot. Recovery tag pushed. Receipt: Codex (OpenAI).

Recovery tag `archive/draco-return-seat-2026-10-27` on1431199; exact before files
and measurements in the matching archive. Assembled neighborhood samples are kept
in the previous audit folder rather than duplicated. Next: local drill motor-lead
moving accommodation. Full electrical networks, identified avionics endpoints,
valve interiors and separate elevator construction remain open. No flight, saves,
Assets Lab, Swarmfall or Git cleanup changes.
