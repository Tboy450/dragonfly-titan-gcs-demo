# Official APL model references

Retrieved October 10, 2026 by GPT/Codex at the owner's request. Saved independently
of the webpage, like the project's standalone heat-exchanger reference figures.

Source: [Johns Hopkins APL, Spacecraft and Science Payload](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php).

**Attribution:** Dragonfly spacecraft/payload visualizations, Johns Hopkins Applied
Physics Laboratory. The page does not identify an individual artist or asset-specific
license. Its footer reads copyright 2026 Johns Hopkins University Applied Physics
Laboratory LLC, all rights reserved. Do not assume that hosting on an official mission
site makes all media public domain. Keep credit visible if later incorporated into the
app; check reuse terms before public redistribution. No NASA/APL endorsement implied.

## Original assets

| File | Source | Format |
|---|---|---|
| [Rotating CAD model](Dragonfly_2024_RotatingCADmodel_ver3-slower.mp4) | [Original MP4](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/img/Dragonfly_2024_RotatingCADmodel_ver3-slower.mp4) | H.264, 1920 x 1080, 30 fps, approximately 83.67 seconds; 67,066,676 bytes |
| [Full payload cutaway](FullPayload.png) | [Original PNG](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/img/FullPayload.png) | 1649 x 1001; 1,224,645 bytes |

The movie progresses through internal, structural and exterior views. Its filename
identifies it as a 2024 visualization; neither it nor the undated PNG should be labeled
as as-built 2026 flight CAD. No OBJ, GLB, STL or other editable geometry was exposed
by this page. The full original files are retained, not reconstructed or AI-generated.

SHA-256 integrity hashes:

```text
743B66A5434DFAC9E6044092D00B3F70B0B5196314D0A8C549417E1403164639  Dragonfly_2024_RotatingCADmodel_ver3-slower.mp4
55A93FBBBF22E80DB73701062E88C0A1DAFFD3BE62BBB8197FA5EAB420249AED  FullPayload.png
```

## Derived previews

- [First frame](cad-first-frame.png): unchanged first decoded movie frame, 1920 x 1080.
- [Angle sheet](cad-angle-sheet.jpg): four successive FFmpeg 1/20 fps samples, arranged
  left-to-right then top-to-bottom, resized for review. Not exact engineering views.
- No geometry has been redrawn, background removed, or colors reinterpreted as thermal
  data. The original backgrounds preserve pale and translucent components.

Reproduce previews with FFmpeg from this directory:

```sh
ffmpeg -i Dragonfly_2024_RotatingCADmodel_ver3-slower.mp4 -frames:v 1 -update 1 cad-first-frame.png
ffmpeg -i Dragonfly_2024_RotatingCADmodel_ver3-slower.mp4 -vf "fps=1/20,scale=480:-1,tile=2x2" -frames:v 1 -update 1 cad-angle-sheet.jpg
```

The originals stay outside `dist/`. As of October 11, compact unretouched viewing
copies are in [the app's reference assets](../../dist/assets/vehicle-references/README.md)
and load only when the Mission reference viewer is opened. They retain source links
and visible credit; no permissive license or public-domain status is asserted.
See the [implementation record](../vehicle-inspection-2026-10-11.md).

## Related printable geometry

[NASA's Dragonfly 3D-print resource](https://science.nasa.gov/3d-resources/dragonfly/)
provides STL parts, slicer projects and assembly/print guides. Credit:
**Gary Allen Backus/Backus Creative Imaging**. Recorded October 10, 2026; print files
remain available through NASA's page and are not copied into this folder.
Use this alongside the APL references when checking exterior proportions.
