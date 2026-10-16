# City-to-terrain fitting tools

Codex, October 16, 2026. Owner prefers the second low-coast pass; the later high-contact
envelope looked like an eruption swallowing the city and is rejected as the default.
This is a future authoring shortlist, not a claim that any package was installed or used.

| Tool | Specific useful feature | Fit for this project |
| --- | --- | --- |
| Blender Geometry Nodes | Raycast returns intersections with selected target geometry; combine with Set Position and masks | Recommended first experiment. Author a reusable fitting setup against explicitly selected underside/contact meshes, then export ordinary terrain/foundation geometry to glTF. |
| Blender Shrinkwrap | Project along an axis, vertex-group influence and projection distance limit | Useful for controlled contact collars or footings. Do not shrinkwrap the whole landscape onto the whole city. |
| Houdini | HeightField Project, HeightField Mask by Object and masked smoothing | Strong procedural option for many districts: project a simplified ground-contact proxy, preserve building pads, smooth only the surrounding transition. Requires a designed node graph and suitable export license. |
| Unreal Landscape Patch | Actor-attached height patches with alpha/min/max blending and falloff; editor-baked result | Useful if authoring terrain in Unreal later. It does not directly run in this Three.js browser game; an export/conversion workflow would still be needed. |

Official sources checked October 16, 2026:
- [Blender Raycast node](https://docs.blender.org/manual/en/3.6/modeling/geometry_nodes/geometry/sample/raycast.html)
- [Blender Shrinkwrap](https://docs.blender.org/manual/en/4.2/modeling/modifiers/deform/shrinkwrap.html)
- [Houdini HeightField Project](https://www.sidefx.com/docs/houdini/nodes/sop/heightfield_project.html)
- [Houdini geometry masks](https://www.sidefx.com/docs/houdini/heightfields/masking.html)
- [Houdini projection limitations](https://www.sidefx.com/docs/houdini/heightfields/projection.html)
- [Unreal Landscape Patch](https://dev.epicgames.com/documentation/en-us/unreal-engine/landscape-patch-system)

## Required workflow for Skyway

1. Preserve the owner's preferred low-coast baseline and source city.
2. Inspect actual mesh undersides in Blender. Axis-aligned bounding boxes are inadequate
   contact proxies for rotated, curved, stacked or elevated geometry.
3. Label real building bases, roads/plazas, elevated skyways and decorative geometry separately.
4. Generate ground-contact proxy surfaces from the bases; exclude roofs, skyways and floating
   ornaments from the fitting target. Keep coast and low terrain as explicit constraints.
5. Raycast/project onto those proxies, use local cut/fill masks and bounded slope transitions.
   Generate fitted foundation walls/retaining structures where a high base cannot meet low
   ground naturally. Model deliberate tunnels/undercrofts separately rather than leave voids.
6. A heightfield has only one elevation per horizontal point, so it cannot itself represent
   stacked streets, caves or tunnels. Use separate meshes for that architecture.
7. Inspect every district from below, alongside and above. Measure actual contact gaps AND
   unwanted burial on the triangulated exported meshes. A no-gap-only test is insufficient:
   the rejected high envelope passed it while swallowing architecture.
8. Export a baked browser derivative; keep source files, proxy collections and the reusable
   node setup. No change to existing campaign saves or original Blender assets.

## Preserved comparisons

- First raised platform: `http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=platform-v1`
- Preferred second low coast: `http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=contour-v2`
- Original flat test: `http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=flat`

The first two screenshots are new re-renders of saved draft geometry with current controls and
the restored Skyway title. They are not original-time captures. The second draft's original
anchor filter is retained. It still has incomplete contact coverage; VIS-16 remains open.
