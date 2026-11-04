# More elaborate editable city scenes

October 16, 2026 — Codex (OpenAI). Follow-up to the owner's feedback that basic building
kits are easy to model and that Synty's Elven Realm better demonstrates the desired complexity.
This changes the selection priority: seek intricate authored architecture and assembled scenes,
then use simple kits as supporting modules. Preserve all earlier city/scale references.

## Why Elven Realm reads as complex

Visual inspection of its official aerial preview shows curved towers with articulated roofs,
arches, balconies, railings, banners, planted terraces, ornate bridges, stair flights, waterfalls
and buildings fitted around layered cliffs. Those elements share proportions and a color palette.
Landmarks, medium-sized buildings and small dressing give the eye detail at several scales.
The scene also has intentional lighting, depth and framing.

This is an assessment of the visible artwork, not a measurement of its production effort.
We can build such forms ourselves. The valuable head start is a designed architectural vocabulary
plus finished compositions and material work; it does not come simply from raising polygon count.
The [official pack](https://syntystore.com/products/polygon-elven-realm) lists 700+ assets,
curved/straight building variants and a detailed demo scene. Its paid files have not been acquired.
`complex-scenes/elven-realm.png` is a **reference-only preview**, not reusable Synty geometry.

## Stronger free candidates

The first five are more useful for this revised search than another catalog of plain wall panels.
No source scene has been imported, converted, performance-tested or proven complete at pilot height.

| Candidate / creator | Why investigate it | Listed license | Evidence / remaining work |
| --- | --- | --- | --- |
| **[cyberpunk City](https://blendswap.com/blend/21664) — carlcapu333** | Best visually inspected match for *architectural intricacy*: dense varied buildings, elevated curved routes, bridges, railings, pipework, gantries and rooftop structures. Strong basis for an alien industrial city. | CC-BY | Creator page and preview inspected. Listed Blender 2.7x scene, 5.37 MB. Creator explicitly asks for texturing; the gray preview is geometry, not a finished material set. Audit downloaded contents, update old materials, split into districts and simplify detail. Free download listing present; archive download not tested. |
| **[Medieval Modular City Realistic — WIP](https://sketchfab.com/3d-models/medieval-modular-city-realistic-wip-49e6306b29c74c679de8cec69473535b) — Daniel Vicente** | More promising assembled fantasy/medieval city starting point than isolated elementary modules; creator says modeled and textured. | CC Attribution in indexed creator listing | Listed at about 1.1 million triangles and explicitly unfinished. Direct page access returned 403, so download/archive completeness and visual quality remain unverified. Strong candidate to inspect next, not approved as a ready game scene. |
| **[The Hidden Alley](https://polyhaven.com/collections/hidden_alley) — Poly Haven / James Ray Cock and community** | A finished, densely dressed urban environment: investigate how complete scene assembly turns reusable architecture/props into a convincing place. Good street-level realism source to alien-adapt. | CC0 | [Official collections page](https://polyhaven.com/collections) supplies an assembled scene file. [Scene artist's project post](https://blenderartists.org/t/hidden-alley-poly-haven-community-project/1495180) explicitly offers the Blender scene/assets under CC0. A small environment, not a whole megacity; optimize selected parts instead of shipping the complete offline-render scene. |
| **[drone City](https://blendswap.com/blend/27360) — Voxelatio** | Best inspected *city-scale* candidate: continuous streets, roof equipment, varied heights and a textured urban fabric. Can support a distant city and an alien-reskinned district. | CC0 | Creator page/preview inspected. Listed Blender 2.9 scene, 45.9 MB, moving cars. Creator explicitly says it was modeled for wide shots; close-flight facade quality needs inspection. Do not promise street-level fidelity from the aerial image. |
| **[City 1](https://blendswap.com/blend/23834) — SPW** | Non-grid city layout with connected street space; useful alternative to repetitive square blocks and an original alien retrofit. | CC-BY | Creator page/street preview inspected. Listed Blender 2.7x/Blender Internal, 71.8 MB. Needs current material conversion, texture-completeness audit and optimization. Preview shows mostly conventional forms; rank below cyberpunk City for unusual architecture. |

Additional discovery candidate: **[City Steampunk Scene](https://sketchfab.com/3d-models/city-steampunk-scene-1e8323fdf03c4edab77a4c7789909a2b)**
by marrkfb, indexed as free/CC Attribution. Direct page could not be inspected; geometry, archive,
scope and style have not been verified. Keep it in the research queue rather than promising quality.

## Recommendation for the next import

Inspect **cyberpunk City** first for geometry/layout richness, then **Medieval Modular City**
for a fantasy alternative. Use **drone City** for wider city coverage and **Hidden Alley** for
close-view material/dressing practice. These sources address different needs; combining them
requires a deliberate art pass so the civilization looks coherent.

No equally elaborate, free, ready-to-use *elven city kit* has been verified in this search.
The practical free route is to adapt an openly licensed complex scene and author a shared
set of elven/alien architectural modules, rather than treat simple pieces as a finished city.

## Reusable architecture inventory to model over time

Record these as authored modules with dimensions, pivots, compatible joints and low-detail variants.
These are design proposals, not copies of Synty's proprietary meshes.

| Module family | Proposed reusable pieces |
| --- | --- |
| Landmark silhouettes | Curved/spired tower crowns, domed observatories, ceremonial gateways, temple/citadel masses |
| Facades | Curved bays, recessed windows, arches, ribs, buttresses, patterned panels and balcony supports |
| Roofs | Sweeping roof sections, dormers, ridges, eaves, tile/trim patterns and tower caps |
| Routes | Arched bridges, elevated walkways, ramps, stairs, landings, arcades and railings |
| Terrain integration | Retaining walls, terraces, cliff anchors, foundations, canals and waterfall outlets |
| City life / dressing | Market structures, planters, banners, lights, signs, small machinery and gardens |
| Damage variants | Broken wall/roof sections, fractured railings, ruined gateway variants and rubble; share stable IDs with ENV tasks |

## License and access notes

CC0 candidates are straightforward for modification and redistribution. CC-BY candidates require
credit and the applicable license information; record the exact version and modification notices
from the downloaded archive. [Creative Commons' BY summary](https://creativecommons.org/licenses/by/4.0/)
explains commercial adaptation and attribution for version 4.0, but does not establish that every
listing above uses version 4.0. BlendSwap model archives may require an account to download.

Keep these out of the approved import list:

- **EmacEArt Free Fantasy Medieval Houses:** potentially useful free/GLB content, but the creator
  page simultaneously shows CC0 metadata and a custom no-standalone-redistribution license.
  Resolve the conflict before putting source files in this public repository.
  [Creator listing](https://emaceart.itch.io/free-fantasy-medieval-houses-and-props-pack).
- **Free mirrors of paid Elven Modular Architecture:** no verified creator authorization found;
  do not use an unofficial free download as evidence of reuse permission.
- **Fantasy Town by Just_Eh:** indexed CC-BY-NC; not a general commercial-use source.
- **Fantasy City by MohamedOsama:** actual description is a lightweight 20-building pack;
  it does not meaningfully address the new complexity target.
- **Fantasy Deutch Scene:** despite its name, the creator describes an interior; not a city source.

## Saved preview credits

Previews are visual selection evidence, not downloaded model files. Keep them in research, out of `dist/`.

| Local image | Creator source |
| --- | --- |
| `complex-scenes/cyberpunk-city.jpg` | carlcapu333, [cyberpunk City](https://blendswap.com/blend/21664); source preview `/blend_previews/21664/0/0?v=cb94c007` |
| `complex-scenes/drone-city.jpg` | Voxelatio, [drone City](https://blendswap.com/blend/27360); source preview `/blend_previews/27360/0/0?v=b8442256` |
| `complex-scenes/city-1.jpg` | SPW, [City 1](https://blendswap.com/blend/23834); source preview `/blend_previews/23834/0/0?v=9e080d1f` |
| `complex-scenes/elven-realm.png` | Synty Studios, [Elven Realm](https://syntystore.com/products/polygon-elven-realm); `Iso_01.png`, reference-only proprietary artwork |
