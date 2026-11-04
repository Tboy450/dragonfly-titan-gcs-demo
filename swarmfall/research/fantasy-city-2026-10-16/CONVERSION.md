# Complete source-city conversion and coastal terrain

Codex (OpenAI), October 16, 2026. Original asset archives and Blender scenes remain unchanged.

## Source titles and preview names

| Original | Preview alias | Author / license | Local test |
| --- | --- | --- | --- |
| cyberpunk City | Skyway megacity | carlcapu333, CC-BY 3.0 (included notice) | `http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk` |
| drone City | Phototextured city | Voxelatio, CC0 listing | `http://127.0.0.1:4201/invasion/environments/?scene=drone` |

The owner requested the older titles **Skyway megacity** and **Phototextured city**; these
are restored, with original asset names in subtitles and credits. Both use a 2 km horizontal span for
comparison; this is an invented scale, not verified geographic dimensions.

## Conversion

`convert-source-scene.py` reads the original files with Blender's embedded-script execution
disabled. Blender Foundation's official `bpy==4.5.14` wheel runs under a separate official
Python 3.11.9 embedded runtime inside ignored `tools/`. No system installation is replaced.
The Python ZIP MD5 matches the official release page; exported GLB sizes and SHA-256 hashes
are in `converted-sources/manifest.json`. Inspection reports retain source object, triangle,
image and material data. Dependency wheels, original extracted `.blend` and logs stay local.

- Cyberpunk: 3,515 source objects, 544,170 evaluated triangles; original architecture retained
  without decimation, with a newly authored ceramic/metal PBR palette. Export: 21,311,292 bytes.
- Drone: 671 objects, 262,037 evaluated triangles; packed facade/roof textures retained, capped
  at 1024 px, animation omitted. Export: 15,798,400 bytes. Previously excluded source collections
  were included for export after a selection error; the failed log is preserved.
- Source meshes are merged by material in the browser. Negative transforms have triangle
  winding corrected before merging, preserving visible front faces and original buffers.
  Selected Quaternius/Kenney modules used by the first gallery remain separately intact.

Sources: [Blender Foundation package](https://pypi.org/project/bpy/4.5.14/),
[official Python runtime](https://www.python.org/downloads/release/python-3119/),
[cyberpunk City](https://blendswap.com/blend/21664),
[drone City](https://blendswap.com/blend/27360).

## Terrain, coast and preservation

The owner requested land beneath Skyway, some ocean/water, then rejected the broad raised
plinth because it read as one giant pillar. The second terrain draft fits individual structural
contact points: small separate pads seat the source architecture, while smooth interpolated
ground connects them to a coastal peninsula and lower shoreline. Roads follow the surface,
with supported sections over water. Water normals are generated mathematically and animated;
no image generator or proprietary game terrain was used.

The later attempt to cover every elevated base with a height envelope was rejected: it buried
architecture and looked like an eruption. The second low-coast draft is restored as default;
full contact coverage remains VIS-16 work. VIS-17 and `FOUNDATION-TOOLS.md` record the next
approach: actual underside proxies, bounded terrain fitting and separate structural support.
The first raised platform and second coast are selectable through the credits panel; new
screenshots re-render the preserved geometry with current controls and restored titles.

**Foundation** is an additional camera preset. The credits panel offers a flat-ground
comparison (`?scene=cyberpunk&foundation=flat`). Earlier source/menu versions and the large
plinth draft remain in `archive/environment-lab-v1-2026-10-16/`; no previous source archive,
Downloads copy or unfinished Claude kit expansion was deleted.

All terrain, contact selection, dimensions and footing design are visual estimates, not
structural analysis. Free flight has no collision. Shared gameplay navigation, LOD/streaming,
phone profiling and persistent destruction remain checklist work. Hidden Alley and HY-21 are
preserved source backups, not implemented environments in this gallery.

## Verification

Node tests check terrain contact elevations, dry footings and coastal water, finite geometry,
mirrored front faces and case-correct runtime model dependencies. The full suite output is
saved in `environment-tests/node-tests.txt`. Browser checks cover the five scenes, source
credits, camera presets, pilot-to-flyover transition, dusk and render detail. Screenshots are
saved alongside the test report. Preview measurements are device/browser-specific; no phone
performance claim is made.

Start the fresh local preview with `python research/fantasy-city-2026-10-16/preview-server.py`.
The existing game server can keep running separately. These experiments are local; nothing
has been deployed by this continuation.
