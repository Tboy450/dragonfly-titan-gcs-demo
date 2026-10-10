# Clean-room floor perspective

Claude's detailed floor at commit `665a669` used a steep perspective. The owner preferred
the earlier, gentler angle while keeping the perforated tiles, equipment and reflections.
Claude had already left the gentler projection uncommitted when Codex resumed; that edit
was preserved and checked on desktop and phone, not replaced.

- `steep-floor.mjs`: replaced projection snippet.
- `cleanroom-steep-floor-desktop.jpg` and `cleanroom-steep-floor-phone.jpg`: old look.
- `gentle-floor-desktop.png` and `gentle-floor-phone.png`: reviewed correction.
- Tag: `archive/cleanroom-steep-floor` at `665a669`.

To restore just the old perspective, replace the floor-projection block in
`dist/ui/mission-backdrop.mjs` with the snippet here. The tag contains the complete old
file; copy only that block to retain later overlay fixes. Test both canvas sizes before
publishing. The equipment is illustrative, not an image of a real Dragonfly clean room.
