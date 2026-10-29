# Part17 fan-bore inspection correction

Codex (OpenAI), October29,2026. Next scoped thermal-interface/construction-access
pass after the completed RF review. Claude's game/graphs are historical context,
not unfinished tasks for this Dragonfly pass. The owner confirms the applications
can share a repository while their changes and ownership stay clearly separate.

## Evidence and scope

- [NASA/APL TFAWS2024 Development Test Module](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf),
  saved real test-module photos on slide5, loop section on7 and fan-cooling data
  on14. Real development hardware is not a flight-fan detail photograph.
- [NASA/APL TFAWS2023 thermal controller](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf),
  saved plan view and Fan-A/Fan-B controller arrangement. Diagram used for existing
  placement and dimensional context, not CGI appearance matching.
- [APL Titan chamber / DTM description](https://www.jhuapl.edu/news/news-releases/231120-dragonfly-titan-chamber),
  rechecked: the development module simulates the power-source/circulation system.
  It does not identify a flight fan supplier, impeller geometry or shroud dimensions.

Existing source packets and real photos are reused. `fan-real-plan-before-after.jpg`
is one useful comparison for this correction, not a new repeated source packet.
No clear public fan close-up/supplier drawing was established by the current search.

## Model change

The former code called these square housings with round bores, but actually used
solid boxes for each housing and both flanges. They crossed the already-modeled
rotors and obscured their interior when Casings was visible. This pass replaces
only those six geometries with extruded square rings with circular holes.

The opening follows the retained **115 mm estimated rotor envelope**. It is a
generic inspection section, not an identified Dragonfly fan or qualified blade-tip
clearance. Outer side/depth and every pose match the old boxes. All other fan
meshes, seven-blade rotors, motors, aft collar, warm/cold ducts and trim meshes
remain exact. No new hidden supports, electrical leads or flight hardware inferred.
Old flange overlap/contact at the center seam remains inherited; it is not a newly
validated flight joint. Bulkhead gas penetration and complete hollow duct sections
remain open. Do not describe this as complete fluid-path reconstruction or CFD.

No fan curves, pressure loss, flow rate, thermal controls, power allocation or
simulation behavior changes. Materials and all32 inspection numbers retained.
The established Casings mask still independently reveals/hides the housing.

## Verification and handoff

Two new tests ray-check both directions through each bore and solid rims; compare
all retained meshes to the exact archived module, both fan envelopes, all duct/trim
meshes and airflow curves. Existing installed-clearance suites also pass.
**771 full tests pass.** Desktop/Internal/Thermal/390px phone and Casings
hide/restore checks pass,33 component options/32 IDs, no page errors/overflow.
Original baseline, raw before/after, app views and browser JSON are saved here.
Browser and temporary server close after checks. No personal mission save used.

`comparison.py` uses Pillow to assemble saved source context and actual model
samples, without an image generation service. Sources credited NASA/Johns Hopkins
APL; TFAWS2024 author D. Lin and TFAWS2023 authors Holtzman/Castano.

[Archive/restore](../../archive/fan-bore-2026-10-29/README.md).
Publication receipt pending. This is a scoped part17 correction, not a completed
thermal-interface package. Next source-dependent work: actual fan shroud/support,
fan-to-duct attachment, open duct sections and aft gas penetration. Keep unknown
circuits/hardware source-gated; avoid another unsupported casing redesign.
