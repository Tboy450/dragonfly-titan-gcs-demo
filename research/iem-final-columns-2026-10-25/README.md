# IEM Final Columns

Codex (OpenAI), October26,2026. Implementation and local verification complete.
Publication receipt follows after Pages succeeds.

## Scope And Measurement

Columns seven (22/23) and eight (24/25/26) now have estimated service routes,
attached tags, a support and two ties each, with separate inspection targets.
The owner approved refitting earlier4/13/21 and their fittings. All26 endpoints
and4.5 mm cable radii are exact; the other18 installations, enclosure, equipment
pose and floor harness stay fixed.

The owner approved trying2 cm extra accommodation before3 cm. The useful space
is around the return end, not a larger enclosure or more face depth. Measured
world-z extent is-0.37037 m versus the previous-0.360 m envelope: **10.4 mm extra**.
The conservative new limit is-0.372 m, within2 cm. No3 cm enlargement is installed.
All other envelope limits are unchanged.

## Verification And Open Contacts

640 tests pass. Five new tests cover the exact18-installation baseline, all26
endpoints/radii, all325 cable pairs, all26 swept-wire screens, the original
second-column3 mm guard, fittings and11 non-nested inspection targets. Every
approved refit has more than5% geometric slack. The original floor-harness test
is unchanged and passes.

`candidate-checks.json` records isolated pre-installation acceptance. Individual
neighbor mesh checks find no new cable hits on the PSUs, battery, radio, carousel,
Wonderwall or DraMS. The combined two-PSU box overlaps the broad IEM box; this is
not a mesh contact. These are sampled screens, not continuous collision certification.

The full sweep found an **inherited lead8/own-label contact**, about0.36 mm beyond
the unchanged15 mm attachment exemption. It is exactly identical in the archive,
remains untouched, and is explicitly asserted/reported, not hidden by a larger
exemption. Terminal gathering overlaps remain open too.26 reviewed does not mean
a complete flight wiring topology or a fully collision-free harness.

Desktop and390px phone checks retain24 numbered parts,11 focus options, no
horizontal overflow and Internal/Thermal access. `full-iem.png` and `phone-iem.png`
are current samples. Source imagery is reused without duplicate comparison sheets.

## Sources And Confidence

Reuse [original real-hardware evidence](../iem-2026-10-13/README.md) and
[workmanship/source notes](../iem-third-lower-2026-10-25/README.md#sources-and-confidence).
Real NASA/APL photos guide appearance; CAD is dimensional context, not a hardware
photograph. Routes, supports, tags, card layout and installed placement are EST.
No flight circuits, pinouts, qualified bends, hidden boards or new solver are inferred.

## Reproduce And Continue

Production loads frozen `dist/iem-final-service-routes.mjs` data, not a search.
`candidate-fixture.mjs` builds candidates from the archive in memory before installation.
The accepted planner used `IEM_EXTRA_SIDE=.02` and `run-search.mjs`, then
`add-service-slack.mjs`, `choose-supports.mjs`, `choose-labels.mjs`,
`check-candidate.mjs` and `check-main.mjs`. `write-asset.mjs` rejects incomplete
or rejected sets. Retain the accepted JSON; rerunning the planner replaces it.

`candidate-before-slack.json` retains the too-taut4/21 proposal. Rejected middle-span
bows crossed neighbors; accepted short bows sit near the connector approaches.
Failed narrow-envelope trials and partial routes remain in the pool/checkpoint.
A failed search is not proof of impossibility. Planning margins are conservative;
acceptance contact/gathering and floor-harness limits were not relaxed.

Next: review inherited lead8 tag contact and terminal convergence with authorization
and better evidence. Then return to the existing broader interior checklist,
including the pending DrACO port/starboard equipment inventory. Do not fabricate
flight circuits or mirror equipment without evidence. Assets Lab/Swarmfall untouched.

Recovery: [archive](../../archive/iem-final-columns-2026-10-25/README.md), baseline
a2a055c, tag `archive/iem-final-columns-2026-10-25`. The earlier appearance is already
saved in the five/six pass. Git cleanup remains paused; command-local suppression
only. No OneDrive cleanup or deletion performed.
