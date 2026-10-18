# First progressive destruction art pass

October 17, 2026 — Codex (OpenAI). Actual local browser screenshots; no generated imagery.
Original sources and intact render paths remain available. No cleanup/deletion performed.

The reusable art builder is `dist/invasion/environments/city-damage.mjs`. The Environment Lab
selects its four art states via `damage=intact|damaged|heavy|ruins`. Mesh cuts, cap sections,
rods and rubble are built deterministically without altering the source. Terrain, water,
natural rock and the citadel foundation are protected. Switching to Intact restores the
original meshes; switching maps carries the current damage stage.

| Saved view | Environment |
| --- | --- |
| [alien-heavy-district.png](alien-heavy-district.png) | Final Alien arcology grouping, Major destruction, District camera |
| [alien-ruins.png](alien-ruins.png) | Alien arcology, Ruins |
| [citadel-heavy.png](citadel-heavy.png) | Tidal citadel, Major destruction |
| [metropolis-heavy.png](metropolis-heavy.png) | Metropolis, Major destruction |
| [skyway-heavy.png](skyway-heavy.png) | Skyway megacity, Major destruction |
| [phototextured-heavy.png](phototextured-heavy.png) | Phototextured city, Major destruction |

See [game implementation review](../GAME-INTEGRATION.md) for all five live comparison links,
code findings, current GLB sizes, source/license information and the gameplay sequence.

Four geometry tests cover roof/tower grouping, triangle clipping/UVs, repeatability and intact
source preservation across all five styles, plus instanced placement and protected terrain.
The complete project suite passed 263 tests. Browser review covered all five Major destruction
views, Alien Ruins and intact restoration/lighter damage controls on Phototextured City.
The lab clearly labels art-only states: these do not implement ENV-01's weapon damage or
ENV-02/03 collision, path changes and persistent destruction. Fine details, bridges and debris
need review before adopting building families for game collision. The browser-generated
variants are not saved as new `.hipnc` scenes. Earlier Houdini authoring remains separate.

Multiple-pod delivery (DROP-01) is still the next requested gameplay pass and is untouched here.
