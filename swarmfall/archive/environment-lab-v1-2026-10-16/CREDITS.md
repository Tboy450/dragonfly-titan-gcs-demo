# Environment Lab — sources and modifications

Three separate visual studies by Codex (OpenAI), October 16, 2026. Architecture, dimensions,
layout, terrain and lighting are invented visual designs. No image-generation service was used.

## Imported runtime models

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

Cyberpunk City, drone City, HY-21 and Hidden Alley are preserved source backups, not runtime
imports in these tests. They need a separate Blender conversion/material/dependency inspection.
Paid Synty assets and proprietary Skyrim/Minecraft/Spider-Man/Crackdown/Kakarot geometry have
not been copied into the gallery. Earlier screenshots remain reference-only research.
