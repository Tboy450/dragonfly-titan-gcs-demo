# Reusable asset backups and environment tests

October 16, 2026 — Codex (OpenAI). Preserve existing files, earlier experiments, source archives
and Downloads copies. Do not clean up or replace assets merely because a newer option exists.

## Completed backups

Library: `C:/Users/Heemi/Documents/Game Asset Library/`.
Six source backups, **1,843,813,552 bytes** (1.84 GB / 1.72 GiB), excluding catalog metadata.

| File | Bytes | Creator / license | Verification |
| --- | ---: | --- | --- |
| cyberpunk-city.zip | 5,630,051 | carlcapu333; included CC-BY 3.0 notice | ZIP CRC + SHA-256 |
| drone-city.blend | 48,140,640 | Voxelatio; CC0 listing | Blender header + SHA-256 |
| downtown-city-megakit-standard.zip | 234,753,092 | Quaternius; included CC0 1.0 notice | ZIP CRC + SHA-256 |
| kenney-fantasy-town-kit-2.0.zip | 3,854,691 | Kenney; CC0 1.0 | ZIP CRC + SHA-256 |
| spaceship-hy-21.blend | 46,108,263 | jungle_jim; CC-BY listing, version unresolved | Blender header + SHA-256 |
| hidden-alley.zip | 1,505,326,815 | James Ray Cock + Poly Haven community; CC0 | Resumed interrupted transfer; expected size, ZIP CRC + SHA-256 |

The local library's `catalog.json` is the authoritative checksum/status inventory;
`metadata/<asset>/SOURCE.md` preserves canonical source links and attribution. Small included
notices and archive file lists are beside each source receipt. HTML license notices are saved
as inert `.html.txt` text. The cyberpunk notice uses legacy BlendSwap ID 91935; its current
listing is [21664](https://blendswap.com/blend/21664).

Download copies were copied, not moved. Hidden Alley's completed `.part` was renamed only after
the exact source size and full CRC check passed. Original model files were not executed as code.
Integrity checks alone do not establish rendered appearance or complete external dependencies.

## Pending downloads and queue

Requests were made for the CC0 animated alien tower and the free Standard editions of
Medieval Village MegaKit and Modular Sci-Fi MegaKit, but no completed files were present at
the final library inventory. Keep them pending; a download button click is not a backup.
BlendSwap's free daily allowance was used during the batch, including a repeated HY-21
request after a browser event timed out. Check Downloads before retrying; do not bypass quotas.

The [source manifest](library-sources.json) retains eleven additional candidates, with space
and alien work first: mountain-base scene, background orbital stations, futuristic skyline
families and an alien spacecraft; then City 1/2, Urban Street, Cyberpunk Street Assets, moon
castle and a cathedral. Listing labels are provisional until their actual archives/notices
are checked. No purchases or subscriptions were made.

## Environment handoff

The first gallery at `dist/invasion/environments/` offers separate alien arcology, metropolis
and tidal-citadel tests. Its complete first implementation is preserved in commit `598e3b9`
(Codex implementation, Claude closeout). The ongoing modular-kit expansion by Claude under
`kit/`, `assets/downtown-kit/`, `assets/fantasy-kit/` and `prepare-environment-kits.py` is retained.
Do not discard those unfinished files or attribute them to a different author.

The metropolis currently imports selected Quaternius textured buildings; the citadel uses a
Kenney wall piece with original terraces/spires. The two complete Blender city scenes now have
separate previews: Skyway megacity (carlcapu333's cyberpunk City, CC-BY 3.0, new PBR colors) and
Phototextured city (Voxelatio's drone City, CC0, packed textures retained with a 1024 px cap).
Their unchanged source archives remain in the external library. Inspection reports record
544,170 evaluated triangles / 3,515 source objects for cyberpunk and 262,037 / 671 for drone;
the browser merges geometry by material to reduce draw calls. Both use an invented normalized
2 km span for comparison. No decimation or original-file overwrite; animation is omitted.
Hidden Alley and HY-21 still need conversion/inspection. The isolated conversion tools use official Python
and Blender Foundation PyPI wheels; no system Python or Blender installation is replaced.
Disable embedded script execution while opening source scenes. Keep conversion reports and
derived browser exports separately from unchanged originals.

Pilot view in the gallery is a free camera, not the requested pilot campaign. City integration,
collision, pathfinding, streaming/LOD, objectives, pod distribution and persistent destruction
are still tracked in `SWARMFALL-TODO.md`. Earlier research and all owner references remain.
