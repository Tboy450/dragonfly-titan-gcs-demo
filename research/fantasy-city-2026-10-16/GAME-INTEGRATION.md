# City implementation review and destruction artwork

October 17, 2026 — Codex (OpenAI). Local implementation and code review; no public deployment.
Earlier city studies, source archives, authoring projects and campaign maps are retained.

## Recommended use of the existing environments

| Environment | Game use | Work before a playable mission |
| --- | --- | --- |
| Skyway megacity | Aurex's intricate alien capital; elevated transit and district landmarks | Finish terrain art review; separate building IDs and collision; select reachable capture sites on real surfaces |
| Phototextured city | Broad inhabited urban districts and a more realistic skyline | Alien facade/roof dressing; remove recognizable advertising as needed; improve close-view materials; building collision and streets |
| Alien arcology | A distinct advanced civilization or later planet | Export the procedural tower/ring layout as game data; connect aerial routes and clear drop pads |
| Metropolis | The easiest street-grid city battle prototype | Use its explicit roads and individual buildings to derive obstacle polygons, routes and landing courts |
| Tidal citadel | Fantasy civilization or island-capital mission | Explicit terrace levels, bridge connections and navigable landing courts; multi-level surface selection |
| Downtown / Kenney modular pieces | Reusable street dressing and individually damageable structures | Author coherent district layouts and per-piece collision/damage metadata |
| Hidden Alley / HY-21 backups | Close-view dressing / spacecraft or a space setting | Still require conversion, dependency/material inspection and profiling; they are not current runtime environments |

Keep the complete large cities as context around one playable district initially. Aurex's current
battle square is **1 km** wide; the imported cities use an invented **2 km** normalization. Shrinking
everything into that square also shrinks streets and buildings relative to drones. Start with a
roughly 0.8–1 km mission district inside the larger city, then expand routes and objectives.
The citadel and arcology should retain their own layouts rather than reuse Aurex's random zones.

### Measured current runtime files

Counts below were read from the actual GLB scene graph on October 17, including drawn primitive
instances. They differ slightly from the earlier Blender evaluation reports because they measure
the browser derivatives. Transfer size is not GPU memory or a phone-performance benchmark.

| Asset | File bytes | Triangles | Material batches | Normalized width × height × depth |
| --- | ---: | ---: | ---: | --- |
| cyberpunk.glb | 21,311,292 | 537,438 | 5 | 2,000 × 1,117 × 1,902 |
| drone.glb | 15,798,400 | 263,020 | 51 | 1,893 × 508 × 2,000 |
| skyway-houdini-coast.glb | 7,646,212 | 318,312 | 1 | 7,200 × 959 × 7,200 |

Skyway plus terrain is 28,957,504 bytes and 855,750 triangles before ocean, effects or units.
Its five architecture material batches are cheap to submit but span the whole city, limiting
section culling. Phototextured City has 58 embedded images and 51 material batches: consolidate
materials/atlas textures and introduce district chunks before adding a large battle.

## Progressive destroyed versions — implemented visual prototypes

All five environments now have **Intact → Damaged → Major destruction → Ruins** controls.
Use the same camera while changing stages to compare the real silhouettes.

| Map | Comparison link |
| --- | --- |
| Alien arcology | [Damage study](http://127.0.0.1:4201/invasion/environments/?scene=alien&damage=heavy) |
| Metropolis | [Damage study](http://127.0.0.1:4201/invasion/environments/?scene=metropolis&damage=heavy) |
| Tidal citadel | [Damage study](http://127.0.0.1:4201/invasion/environments/?scene=citadel&damage=heavy) |
| Skyway megacity | [Damage study](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&damage=heavy) |
| Phototextured city | [Damage study](http://127.0.0.1:4201/invasion/environments/?scene=drone&damage=heavy) |

`damage=damaged`, `damage=heavy` and `damage=ruins` select the three damage levels; omitting
the parameter restores intact architecture. Switching map preserves the chosen stage.

The new `dist/invasion/environments/city-damage.mjs` constructs actual derivative meshes:

- Deterministic structural groups keep towers, their cores and roof ornaments together.
- Jagged/sloping fractures clip facade triangles with their UVs and normals. Upper sections
  disappear progressively; solid tower sections receive exposed floor/wall caps.
- Bent rods, roof/facade slabs and settled debris make the breaks legible. Alien shell pieces,
  citadel stone/green roof rubble and urban concrete/metal use different palettes/shapes.
- Terrain, coast, water, natural rock and citadel foundation terraces are protected. The city
  source geometry/materials are never edited; **Intact** restores the original meshes.
- Variants are built on demand and the previous derivative geometry is disposed when changing
  stage. Source assets and shared textures remain available. No extra source downloads needed.

These are code-authored 3D art states in the browser, not newly saved damage versions of the
Houdini project. They are deliberately inspectable without running a battle. Damage grouping
is a geometric heuristic, not a verified structural simulation. Fine ornament, bridge support
and close-view debris placement still need art review; there is no collapse animation yet.
The full battle destruction tasks below remain open.

## Concrete game changes, in dependency order

1. **One shared environment manifest.** Give each environment a version, consistent transform,
   deterministic building IDs, render chunks, collision footprints/height intervals, terrain
   sampler, authored objective sites and safe landing areas. Keep source component identity
   before the gallery merges by material. Use the same data for geometry and game rules.
2. **Load a district before starting its battle.** `main.mjs:startMission` currently creates
   terrain and calls `scene.load` synchronously. Add an asynchronous preparation step with
   progress/error/retry and cancellation if the player leaves. First expose a separate city
   test mission with its own save namespace. Keep existing campaign saves compatible.
3. **Use the actual ground and multiple surface levels.** `planet-terrain.mjs` currently
   generates height functions and flattens zone pads. Imported terrain needs a matching
   sampled/triangle surface query; do not flatten it again beneath the fitted architecture.
   A single `heightAt(x,z)` cannot represent a bridge and the street below. Add explicit surface
   IDs/heights and surface-aware picking for layered districts. Ground clicks currently march
   through a height field, so they would otherwise issue orders through roofs and bridges.
4. **Make movement/combat match the city.** `battle.mjs:moveUnits` only checks dry land for
   native ground troops; drones steer directly in X/Z. `scene.mjs` adds terrain height visually,
   while combat uses horizontal distance. Add flight clearance with look-ahead, climb-rate
   limits and alternate routes (FIX-02), ground pathfinding across street/bridge connections
   (FIX-03), then world-height-aware targeting/line of sight. Reattach environment queries
   during mission restore instead of saving functions or meshes.
5. **Author zones and landing courts.** Use the existing fixed `planet.zones` path in
   `battle.mjs`, rather than scattering random capture rings through buildings. Verify defender
   spawns, objective access, drone formation space and complete pod descent paths. A clear
   ground point alone does not establish clearance beneath an overhead skyway.
6. **Connect the art states to local damage.** Promote the prototype groups to authored stable
   building IDs. Keep health/state in a plain rules module, batch rendering within districts,
   switch only the struck structure to its corresponding remnant/debris, and update collision,
   cover/routes and safe landing data at the same transition. Add bounded impact dust/chunks,
   salvage/alarm rules and save the state by ID. A whole-city stage button is an art comparison;
   weapon hits must not regenerate or destroy the whole map.
7. **Profile, then pilot mode.** Chunk the static cities, keep distant skyline proxies and
   cap active debris/particles. Measure load time, frame time, memory and a phone before
   increasing active district size. Add campaign piloting (MODE-20) after collision and clear
   input handoff; the lab's existing free camera is not a controllable combat drone.

The current `.hipnc` and terrain were authored with **Houdini Apprentice**, whose official
[restrictions](https://www.sidefx.com/faq/question/apprentice-restrictions/) limit use to
non-commercial projects and disallow Apprentice assets in Houdini Engine/Engine Indie.
The browser consumes baked geometry and does not require Houdini installed at runtime.
Resolve an appropriate licensed authoring path before any commercial use of Apprentice work.
Cyberpunk City also retains carlcapu333's CC-BY 3.0 attribution; the source license is separate
from authoring-tool terms. Other asset notices remain in the existing credits/library receipts.

## Next: multiple parachutes (requested sequence)

DROP-01 remains next after this artwork pass. Preserve one squad and one payment/cooldown
per delivery wave; split its payload into pods of 1–3 drones. Plan side-by-side positions
within a safe landing area and validate every descent corridor, with a limited-space fallback.
Keep arrivals, inbound counts, release timing and save/resume consistent for the whole wave.
No pod rules or visuals were changed during this environment/destruction pass.
