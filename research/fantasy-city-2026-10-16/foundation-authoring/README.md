# Blender foundation fitting — implemented October 16, 2026

Owner requested Blender and Houdini downloads and one implemented fitting tool.
Blender 4.5.14 LTS is downloaded, extracted locally and used to build this experiment.
The signed SideFX Launcher 22.0.466 is downloaded to the tool folder and
`C:/Users/Heemi/Downloads/sidefx-launcher-22.0.466.exe`.

## Houdini setup — October 17, 2026

Houdini 22.0.466 Production is installed at
`C:/Program Files/Side Effects Software/Houdini 22.0.466/`.
Apprentice activation succeeded; License Administrator shows version 22.0 licenses
available through November 16, 2026. The main workspace opened successfully as
**Houdini Apprentice Non-Commercial 22.0.466 - Py3.13**, and Windows reports the
application responding. Software setup is verified; no Houdini foundation project has
been built yet.

The Launcher browser-login path failed with an hserver "unknown escape sequence" error.
Signing in through License Administrator worked. Restarting only Launcher then picked up
that account and enabled installation, without changing server configuration.

Owner stopped the building-extension approach. Preserve all modeling drafts and pause
further foundation changes; the software setup does not validate the Blender visual result.

## Open and compare

- [Blender support test](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=blender)
- [Preferred second coast without new supports](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=contour-v2)
- Editable local project: `skyway-foundation-raycast.blend` in this folder.
- Portable executable: `../tools/blender-portable/blender-4.5.14-windows-x64/blender.exe`.

The default Skyway preview now adds the Blender support export to the second coast.
The coast and source architecture remain unchanged. Older platform, flat and rejected
high-terrain drafts remain preserved. First draft binaries and code are in `drafts/raycast-v1/`.
Local projects and large regenerable files are ignored by Git; no local file was deleted.

## What the tool actually does

`../fit-city-foundation.py` imports the browser source-city derivative into Blender,
normalizes it with the same horizontal span/origin as the viewer, preserves mirrored face
winding, and selects exposed downward faces of major structural meshes. Skyway curves, globes and tiny details
are excluded. It subdivides contacts and uses a BVH to select the lowest underside in each
vertical column, avoiding taller fill where lower architecture is already present.

Top vertices remain aligned with source underside triangles. Only bottom vertices are tagged
`ground_contact`. The editable **Fit foundation bottoms to terrain - Raycast** Geometry Nodes
group raycasts those bottoms down to the second coast's actual triangle mesh, embeds them
slightly, and clamps them below their own tops. The clamp handles source bases already below
the baseline terrain. Joined contact cells have boundary walls; internal prism walls were
removed after they produced stripes/overdraw in the first draft.

The resulting structural fill follows the architecture without raising mountains through it.
It is a visual prototype, not engineered construction or completed campaign collision.
Undercroft doors/tunnels, architectural treatment and exact classification of every city
component remain refinement work. Some bases were already below the preferred coast; those
are counted explicitly rather than concealed by a claimed zero-burial result.

## Verification and regeneration

`fit-report.json` records the evaluated Geometry Nodes result: 23,885 top and 23,885 bottom
vertices checked, no bottom-ray misses, maximum bottom embed error below 0.001 normalized
units, no top movement, and maximum underside distance about 0.139 (tolerance 0.2).
1,012 checked vertices were already below the unchanged baseline coast. Dimensions are
invented preview units, not real measurements. Gap and burial tolerances must still be
reviewed in the actual city; these checks do not certify all mesh components.

From the repository root:

```powershell
node research/fantasy-city-2026-10-16/prepare-foundation-input.mjs
& research/fantasy-city-2026-10-16/tools/blender-portable/blender-4.5.14-windows-x64/blender.exe --background --factory-startup --python research/fantasy-city-2026-10-16/fit-city-foundation.py
```

The input script bakes the exact second-coast mesh and original nine anchors. The authoring
script saves the editable `.blend`, validation report and a selected-only baked
`dist/invasion/environments/assets/source-scenes/skyway-foundation.glb` for the browser.
Automatic execution of embedded scripts is disabled. Source scenes and saves are untouched.

## Download receipts

Blender Windows x64 portable: 398,661,046 bytes, SHA-256
`b9533d2397ac1984db4466fb23a7a4649391cca93f6e84209f9bcc60d071c8b9`, matched the
[official release checksum](https://mirror.blender.org/release/Blender4.5/blender-4.5.14.sha256).
Downloaded through Blender's own mirror service; executable reports 4.5.14 LTS, build
`62c1db4208e8`. No system-wide installation/settings change was required.

SideFX Launcher: 106,225,424 bytes, SHA-256
`b56618b869511a21e21c472c4b29681d0bfc757879f369a2b31bdff18a7f68c2`.
Windows Authenticode status Valid, signer Side Effects Software Inc. Download obtained from
the official signed-in SideFX page after the owner accepted its download agreement.
No license purchase, Houdini project conversion or installation claim is implied.

Credits: foundation geometry derives its contact shapes from **cyberpunk City by carlcapu333,
BlendSwap 21664, CC-BY 3.0**; modifications and procedural supporting geometry by Codex.
See the gallery's CREDITS.md. No image generator was used.
