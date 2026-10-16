# Inspection visibility controls

Implemented October 16, 2026 by Codex (OpenAI).

## Behavior

Mission > Internal or Thermal > Inspection layers, research model only. All layers start
enabled. Vehicle controls hide body shell, attic shell, existing insulation groups,
compartment panels (nose/aft bulkheads and Wonderwall faces), and illustrative flow markers.
Component controls use the existing `inspectionLayer` tags for casings, covers, mounts,
interfaces and harnesses. Unsupported controls are disabled. Each component retains its own
choices, including while another component is selected or sampling is followed; the menu
marks components with hidden layers. Settings last for the current app session only.

Restore Layers clears all masks without changing zoom, orbit, focus or isolation. Camera
reset also restores masks. Masks are applied after framing and restored in a `finally` block,
so Exterior, Pilot and the original demo model do not inherit them, even after a failed draw.
Transforms, physics, science and saved missions are unchanged. Hidden assemblies keep their
place in the callout array and their original number, with their marker suppressed while no
hardware is visible. A partially hidden part retains its existing fixed anchor.

## Evidence and limits

No new hardware or material layers were drawn. These controls use the named geometry
groups created during the referenced component rebuilds, listed in `research/PART-SOURCES.md`.
Body/attic outer shapes and foam are still combined; the foam control removes only independently
modeled insulation. The Wonderwall stack remains estimated. A removed casing does not imply
the simulation contains its real internals. Actual structural skins, decks and construction
sections need further research. Far-side label occlusion is still a separate open task.

## Verification

October 16 working tree: **248 Node tests passed**, including the independent session's
Swarmfall tests and the five pending bulkhead tests. This is a local result, not a Pages build.

- Node checks exercise per-component independence, immutable defaults, reset behavior,
  stable framing/numbering, unchanged transforms and simulation state, isolation, view
  switches and cleanup after a renderer error.
- Real Edge/WebGL: Internal/Thermal at four orbit angles, covers removed and restored;
  pixel checks confirm nonblank, unclipped models and an actual visual change.
- UI checks at 1440, 390 and 360 px: expandable controls, keyboard Space, selection retention,
  restore without recentering, switching layers, reset and no horizontal overflow.
- No browser script errors. `checks.json` records the nine raw-render checks; PNG files
  show the controls and rendered geometry. These are screenshots, not generated imagery.
- Existing inspector regression also passes: drag/keyboard orbit, native Ctrl zoom,
  sampling follow and pause/resume, Pilot/Exterior switching, and 20 rendered-pixel checks.
  The old test fixture needed an explicitly parked manual vehicle before resuming sampling;
  an automatically flying fixture correctly interrupted sampling. No app behavior changed
  to accommodate the test.

Old code and pictures: `archive/inspection-visibility-2026-10-16/`.
