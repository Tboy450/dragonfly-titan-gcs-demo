# Archived behavior: range-relative thermal colors and the open parts list (until 2026-10-09)

Replaced when GitHub Copilot's branch work (2026-10-04) was merged on 2026-10-09.

## What it was

- **Colors relative to the legend range.** The thermal palette (indigo, blue, cyan, green, yellow,
  orange, red) was stretched across whichever range was selected: whole lander (-180 to 40 C) or
  inside (-30 to 40 C). The same temperature could therefore show a different color in the two
  ranges. Copilot replaced this with fixed temperature anchors (blue cold, green 0-20 C, yellow
  warming, red from 35 C), so a temperature keeps its color in every view.
- **Open parts list.** The numbered parts list, the part detail and the placement note sat
  directly under the layer switch in Internal and Thermal. Copilot moved them into a collapsible
  "Component temperatures" panel that opens when a diagram number is tapped.

## Files here

- `thermal-scale.mjs`, `layers-panel.mjs`: the code as it was (commit 7c96bdc).
- `thermal-light-grey-whole-lander.jpg`, `thermal-titan-air-whole-lander.jpg`: the Thermal view
  with these colors (whole-lander range).
- `parts-list-and-air-loop-panel.jpg`: the open parts list with the warm-air loop panel below.

## Getting it back

- **Whole app as it was:** git tag `archive/thermal-scale-range-relative` (commit 7c96bdc).
- **Just the colors:** restore `thermal-scale.mjs` from this folder and pass the range again
  wherever `thermalRgb` / `thermalCss` are called (the renderer's thermal materials, the layers
  panel, the Thermal "Titan air" backdrop).
