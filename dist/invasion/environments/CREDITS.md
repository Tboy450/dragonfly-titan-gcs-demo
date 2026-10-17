# Environment Lab — sources and modifications

Five separate visual studies by Codex (OpenAI), October 16, 2026. Original architecture, dimensions,
layout, terrain and lighting are invented visual designs. No image-generation service was used.

## Imported runtime models

- **carlcapu333, cyberpunk City.** https://blendswap.com/blend/21664
  (legacy archive ID 91935), [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/).
  Used in **Skyway megacity**. Original untextured architecture converted from Blender with
  modifiers applied. New ceramic/metal PBR palette, normalized scale and merged render batches
  by Codex; original source, included license notice and inspection report retained. No source
  geometry was decimated. Embedded scripts disabled; original Blender file not overwritten.
- **Voxelatio, drone City.** https://blendswap.com/blend/27360 — CC0 listing.
  Used in **Phototextured city**. Packed facade/roof images retained, with a 1024 px texture
  cap; animation omitted, modifiers applied, scale normalized and meshes grouped by material
  for rendering. Original Blender scene preserved. Some source textures are intended for
  aerial views; a close camera can expose their low resolution. This is an adaptation study,
  not a claim that every storefront/texture has been redesigned as alien architecture.

- **Quaternius, Downtown City MegaKit, free Standard edition.**
  https://quaternius.itch.io/downtown-city-megakit — CC0 1.0.
  Selected complete buildings: `Building_Large_2`, `Building_Medium_2_001`, `Building_Small_1`;
  supporting `Prop_ACUnit`, `Prop_Planter_Single`. Original glTF geometry/buffers retained.
  Textures reduced to at most 512 × 512 pixels for the browser test; transforms and placement
  are authored in `worlds.mjs`. Local license: `assets/downtown/LICENSE.txt`.
- **Kenney, Fantasy Town Kit 2.0.** https://kenney.nl/assets/fantasy-town-kit — CC0 1.0.
  Selected modular GLB pieces and their texture are preserved in `assets/fantasy/`;
  `wall-wood-window-shutters` is used in the inhabited citadel district. The remaining selected
  pieces are available for further composition. Original files unchanged; placement and scale
  changed. Local license: `assets/fantasy/LICENSE.txt`.
- **three.js r180**, official npm package `three@0.180.0`, MIT.
  https://github.com/mrdoob/three.js/tree/r180
  GLTFLoader, BufferGeometryUtils and OrbitControls addons copied unchanged. Existing core and
  license are in `dist/vendor/three/`; addon provenance is recorded in that folder's README.

## Original composition

Cyberpunk City / Skyway now adds original contoured coastal land, individual footing pads,
access roads and ocean water around the preserved source architecture. Contact points inform
the drawing, not structural calculations. The broad intermediate plinth is archived; the
flat-ground version remains available through the credits panel for comparison.

Owner review selected the second low-coast draft as the default. Full base fitting is still
unfinished. The later full-height terrain envelope buried architecture and is archived;
it is not the current default. The first raised platform and second low coast are selectable
historical comparisons. Gallery titles are Skyway megacity and Phototextured city.

The default Skyway view now adds an original Blender Geometry Nodes foundation derivative:
selected actual underside contacts from carlcapu333's CC-BY 3.0 city, with structural fill
projected onto the unchanged second coast using Raycast. Source architecture, coastal land
and earlier versions remain intact. This is visual support geometry; inspection/refinement,
collision and authored tunnels remain open. The credits panel retains the plain second coast.

Alien arcology: radial ceramic towers, skyways, canals, landing pads and planetary setting.
Metropolis: connected street grid, civic park, financial landmarks, waterfront and lower-detail
distant skyline. Tidal citadel: terraces, original curved roofs, spires, bridges, cliffs,
waterfalls and alien sea, with the Kenney wall pieces in lower houses.

The skyline and terraces are visual prototypes, not geographic data. The city layout is not
yet connected to game collision, pathfinding, zone capture, damage or campaign saves. Pilot
view is a free-flight camera with no collision. Performance counters describe the current
browser/device, not verified phone benchmarks. Light mode reduces resolution and shadows;
streaming and distance-dependent replacement remain follow-ups.

## Preserved source backups

Original downloaded archives/scenes remain in the separate reusable local library:
`C:/Users/Heemi/Documents/Game Asset Library/`. Its README, JSON catalog, source receipts,
archive inventories and SHA-256 checksums track the actual backups and pending downloads.
Downloads copies and earlier project work were retained. Browser derivatives are additional
files; no current Swarmfall planet or simulator environment was replaced.

Cyberpunk City and drone City now have separate converted runtime tests. Their original source
backups remain unchanged. HY-21 and Hidden Alley are preserved backups, not runtime imports;
they still need separate conversion/material/dependency inspection.
Paid Synty assets and proprietary Skyrim/Minecraft/Spider-Man/Crackdown/Kakarot geometry have
not been copied into the gallery. Earlier screenshots remain reference-only research.
