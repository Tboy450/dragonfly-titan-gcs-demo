# Swarmfall: Drone Invasion

[Play Swarmfall](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/) ·
[Asset & Environment Lab](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/) ·
[Update checklist](TODO.md) · [Change log](CHANGELOG.md) · [Code map](ARCHITECTURE.md)

A drone-swarm strategy game built from parts of the [Dragonfly Titan simulator](../README.md).
Since November 1, 2026 everything that belongs to the game lives in this folder, separate from
the simulator. Its web addresses are unchanged: the publish workflow still puts it at `/invasion/`.

## What is where

| Path | What |
|---|---|
| `dist/` | The game (`index.html`, `main.mjs` and the rule modules) and the Asset & Environment Lab (`dist/environments/`), served as-is with no build step |
| `dist/vendor/three/` | The game's own copy of three.js r180, plus the lab's three addons |
| `dist/vendor/dragonfly/` | A pinned copy of the simulator modules the game uses ([what and why](dist/vendor/dragonfly/README.md)) |
| `tests/` | The game's tests, with their fixtures and UI harness |
| `tools/sync-dragonfly.mjs` | Checks or refreshes the pinned simulator copy |
| `TODO.md` | The prioritized update checklist (formerly `SWARMFALL-TODO.md` at the repository root) |
| `CHANGELOG.md` | Signed record of game changes from November 1, 2026; earlier ones are in the [repository change log](../CHANGELOG.md) |
| `research/`, `archive/` | Game and lab research notes, and archived earlier versions ([index](archive/README.md)) |

The simulator never imports anything from here, and the game loads nothing from the simulator.
Titan's terrain, the drop pods' parachutes and arrival timeline, and the Dragonfly drone (the
simulator's research model without its interior) come from the pinned copy, so a simulator change
reaches the game only when someone refreshes that copy on purpose.

## Run, check and publish

From the repository root:

```sh
python -m http.server 4177 --directory swarmfall/dist   # the game at /, the lab at /environments/
node --test swarmfall/tests/*.test.mjs                  # the game's checks (Node 22)
node swarmfall/tools/sync-dragonfly.mjs --check         # has the simulator changed since the copy?
```

To preview the site as it is published (simulator at `/`, game at `/invasion/`, no caching), run
`python swarmfall/research/fantasy-city-2026-10-16/preview-server.py` and open
http://127.0.0.1:4201/invasion/.

Pushing to `main` runs both projects' tests, adds `swarmfall/dist` to the site as `invasion/`,
replaces every `?v=dev` and "Build local" with the commit and publishes to GitHub Pages
(`.github/workflows/pages.yml`). The simulator's [house rules](../ARCHITECTURE.md#house-rules)
apply here too: leave the `?v=dev` stamps alone, label estimates, archive replaced work (in this
folder's `archive/`) and sign every change in this folder's change log.

The research and archive folders moved here with their history. Notes written before the move
say "from the repository root" and name paths such as `dist/invasion/`; for game material, read
them relative to this folder, which keeps the old layout (`dist/`, `research/`, `archive/`,
`tests/`). Local files ignored by git (Blender and Houdini scenes, conversion tools) stay at their
old `research/fantasy-city-2026-10-16/` path in existing checkouts; move them to
`swarmfall/research/fantasy-city-2026-10-16/` before running that folder's scripts.

## The game

October 20 — **FIX-07:** phone-sized screens collapse Objectives and Battle log after
the first capture. Tap either heading to reopen it; that choice stays respected during
the mission. Captured saves resume compact on phones. Warning toasts remain active.
[Automated checks and acceptance limits](research/swarmfall-phone-hud-2026-10-20/README.md).

[Play Swarmfall](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/) (its own page,
`swarmfall/dist/`; the simulator is unchanged). A strategy game built from the simulator's
best parts: drop drone swarms on planet after planet in a campaign galaxy and take each world by
force or by quiet control.

- **Campaign:** seven planets invaded in order, from Titan (an empty practice planet on the
  simulator's real Ahmakiq Undae terrain) through rising society levels (tribal, agrarian,
  industrial, networked, spacefaring) and threat levels. Each win opens the next planet and pays
  matter, new drone types or bigger drop pods.
- **Drops:** a squad arrives as a wave of parachute pods carrying **1–3 drones each**; a large
  Dragonfly travels alone. Slot capacity, matter cost and recharge apply once to the whole wave.
  The drop panel shows pod count and courts before launch. Pick a zone, inspect the spaced
  court outlines, then choose **Launch here**. Unsafe/occupied courts refuse the drop without
  charging matter. Drones arriving later retain their squad's orders. Held zones pay matter
  over time and become landing areas. Existing paid single-pod saves keep their original payload.
- **Damage or control:** Strikers and Breachers destroy defenses (salvage pays matter, but the
  public's alarm rises); Links capture under fire, calm the public and turn standing defenses to
  your side. High alarm brings militia raids, stronger defenses and artillery.
- **Hazards:** methane rain, gust fronts, dust storms, acid rain, blizzards, ash clouds,
  eruptions, lightning and solar flares, each announced before it starts. Zones you hold give
  shelter.
- **The Dragonfly** is an unlockable drone: recover NASA's lander from its landing site on Titan
  and it joins every later drop (the simulator's research model, interior removed).
- **Objectives and achievements:** two optional goals per planet (three stars) and twelve
  campaign achievements, saved in the browser. Required captures offer **Leave for victory**
  or **Continue capturing**. Continuing keeps a visible extraction action and remaining-zone
  count. Earned victory remains available if zones are retaken, but total defeat can still lose
  the mission. Stars and time goals finalize on extraction. Recalled survivors refund half
  their cost; unreleased pod cargo is fully refunded. Each attempt's result settles once.
  Watchtower/jammer goals explicitly allow **destroy or capture**, with a live hostile count.
  A defense retaken by the enemy counts against that goal again until neutralized.
- **Mission saves:** active battles save on this device every five seconds and when the page
  is hidden or left. Choose **Resume mission** on the title screen; the restored battle starts
  paused. Starting another mission asks before replacing that save. Browser storage must be
  available; campaign progress and the active battle are saved together.
  Resume retains active/inbound squad selection, camera, draft payload and drop-panel state.
  It shows the HUD at 1×, cancels landing placement and requires a fresh explicit launch.
  Existing issued orders and paid cargo remain in the battle; resuming adds no purchase.
  Earlier mission/progress saves migrate automatically. Results save immediately with the
  completed checkpoint cleared; a storage failure shows a retry action and retains the result
  in memory. If storage stays unavailable, keep the page open until it can save.
  **October 19 — Codex:** resume validation now checks unit/order/zone references, complete
  pod waves, combat/hazard fields and bounded data before restoring. Old v1/v2 checkpoints
  remain supported. **Save files** on the title screen now offers session/original JSON
  downloads, preserved browser backups and retrying storage access. Unsupported/damaged
  saves show a recovery notice; recovering readable campaign data or starting fresh requires
  confirmation and a verified exact-original browser backup before replacement. Failed backup
  or writes retain the original. Browser backups share this device's storage; download a file
  for an external copy. Real browser/download/touch acceptance remains open.
- **Landing and resources:** Scouts, Links, Strikers and Breachers stay airborne. Dragonfly
  lands in a safe held zone to drill matter. A small drill drone and landed-harvest balance are
  planned; this release does not add that unit or increase extraction rates.
- **Controls:** on desktop, left-click a drone to select its squad; right-click the ground
  to move, a ring to capture or a defender to attack. Shift/Ctrl/Meta+click toggles additional
  squads; an empty left-click clears selection. Squad cards also select. On touch or pen, tap
  a drone/card to select, then tap the destination or target to order. Drag to pan, scroll or
  pinch to zoom; right/middle/Alt+drag or Q/E turns. WASD/arrows pan, 1-9 select squads, 0 all,
  H holds, B opens drops and Space pauses. Hold or H with no selected squad explains how to select one. In landing placement, click/tap only previews;
  Launch here confirms the purchase, and right-click or Cancel cancels the preview.
  **Minimap:** taps move the camera by default; desktop right-click orders selected squads.
  **Map: Orders** enables touch/pen tap orders; switch to **Map: View** for camera taps.
  Orders use the same attack/capture/move rules, with a short target pulse. New/resumed
  missions reset the minimap to View mode; Clean view hides the map and its toggle.
  **Clean view** or **V** hides HUD panels and battlefield labels; the small Show HUD button,
  V or Escape restores them. R/F retain camera pitch. Opening drops or ending a mission restores the HUD.
  At distant zoom, friendly drones below 8 projected CSS pixels receive small squad-colored
  diamonds; selection rings and damage bars remain. Clean view hides these markers too.

All game numbers, the invented worlds and the drone and defender models are gameplay choices,
not physics. Rules are in plain modules with tests (`swarmfall/tests/invasion-*.test.mjs`); see
[ARCHITECTURE.md](../ARCHITECTURE.md). Later ideas from the owner: a free mode with a galaxy of planets to pick from,
and a local versus mode where players race to take the same planet with drone-vs-drone weapons.
The [Swarmfall prioritized update checklist](TODO.md) was expanded October 19 with
ordered milestones, current implementation status and detailed acceptance tasks. Multiple
parachute pods and victory/continue remain first. It also tracks playable cities, destruction,
pilot control, drone-specific tactics, better graphics and a separate persistent free-roam
planet mode alongside the campaign; these are planned features. The [RTS/space design study](research/swarmfall-design-2026-10-19/README.md)
links reference games and proposes connected territories, scouting/relays, recoverable drones
and modular loadouts. Existing task IDs and the full previous checklist are preserved.
Future visual priority **ART-09** reviews and upgrades small assets that lag behind the best
existing work, including unit details, props, icons, textures and effects, while preserving
originals and keeping performance and gameplay readability in view.
Scout's first hull/sensor polish pass is implemented; [before/after and checks](research/scout-polish-2026-10-19/README.md)
record the preserved original and pending real-browser/phone art review.
Inspect it in the lab: [Original Scout](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?asset=drone-scout&scout=original)
/ [Polish pass](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?asset=drone-scout&scout=polished).
Both offer orbit, zoom and turntable controls; the version links reset the camera.

## Asset & Environment Lab

[Open the public Asset & Environment Lab](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/).
Choose **Environments** for the five city tests and their four destruction stages, or **Assets**
to inspect 18 individual models: four Swarmfall drones, five urban buildings/props and nine
fantasy pieces. Each asset has creator/license details, orbit/zoom views and a turntable.
The lab is also linked from the game's title screen. It is separate from campaign progress.
**October 19 — Codex:** damaged city stages now include animated smoke, flame tongues,
embers and warm local firelight. Major destruction burns more intensely; ruins have smaller
residual fires. Use **Smoke**, **Fire & embers** and **Pause effects** independently, or
**Light** quality for fewer particles and no added point lights. Reduced-motion preference
starts the effects paused. Compatible individual architecture assets also offer destruction
previews; the intact originals and drone inspector remain available.
Try [Skyway with smoke/fire](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=cyberpunk&damage=heavy)
or [the alien arcology](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=alien&damage=heavy).
These are visual aftermath studies; spreading fire, combat damage and sound remain future work.
[Implementation and verification](research/lab-aftermath-2026-10-19/README.md).
October 17 publication supersedes the earlier local-preview-only status recorded below;
all existing local links, historical foundation versions and original asset files are retained.

The separate **Asset & Environment Lab** compares city directions without changing campaign planets
or mission saves. Run `python swarmfall/research/fantasy-city-2026-10-16/preview-server.py` from the
repository root, then open [the local gallery](http://127.0.0.1:4201/invasion/environments/).
It serves the gallery on port 4201 with fresh resources; the existing game preview can stay open.
The first three tests are [Alien arcology](http://127.0.0.1:4201/invasion/environments/?scene=alien),
[Metropolis](http://127.0.0.1:4201/invasion/environments/?scene=metropolis) and
[Tidal citadel](http://127.0.0.1:4201/invasion/environments/?scene=citadel).
Two complete Blender-scene tests now supplement those original compositions:
[Cyberpunk City / Skyway megacity](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk) and
[drone City / Phototextured city](http://127.0.0.1:4201/invasion/environments/?scene=drone).
Skyway is the strongest intricate/alien architecture comparison; Phototextured City provides
the more realistic urban comparison. Both retain the source city layout and use a normalized
2 km span for inspection, not verified real-world dimensions.
Cyberpunk City's new land follows individual architectural contact points, with small footing
pads, coastal slopes, access roads and animated ocean water. **Foundation** frames the ground;
the credits panel links to the retained flat-ground and first two foundation passes. The owner
prefers the second low-coast pass, retained as the baseline; fitting all elevated bases remains open.
The later high terrain envelope was rejected because it swallowed buildings and is archived.
[Foundation tooling shortlist](research/fantasy-city-2026-10-16/FOUNDATION-TOOLS.md) records Blender,
Houdini and Unreal options for future fitting. Skyway megacity and Phototextured city remain the
gallery titles, with original asset names in credits. These are local previews, not a published update.
The [Blender fitting test](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=blender)
preserves the earlier underside-fitted structural-fill experiment on that second coast.
[Blender authoring project and tool status](research/fantasy-city-2026-10-16/foundation-authoring/README.md)
record the reusable Geometry Nodes setup, portable Blender and verified SideFX Launcher download.
Houdini 22.0.466 Production is now installed with Apprentice licenses activated (October 17).
The owner rejected the building-extension approach and requested a Houdini terrain fit.
The [Houdini coastal test](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=houdini)
is the current Skyway preview. It uses a connected landscape, projected building bases and constrained terrain steps, with the
second coast's outer shore and animated water. **Rear coast** and **Building bases** add inspection
angles. [Editable Houdini project and measured fit](research/fantasy-city-2026-10-16/houdini-authoring/README.md)
record the native node graph and independent gap/burial checks. Source buildings are unchanged;
the earlier platform, second coast, flat-ground and Blender passes remain available. Terrain
art direction still needs owner review, especially the high rear districts in the source model.
Each offers vista, district and street cameras, orbit/pilot movement, flyover, dusk and a
lighter render setting. These are visual studies; collision, campaign navigation, streaming
and destruction remain checklist work. [Runtime credits](dist/environments/CREDITS.md)
identify the imported CC0 models and original compositions.

The reusable source library is **`C:\Users\Heemi\Documents\Game Asset Library`**, outside
this repository and available for other projects. Six completed backups total 1,843,813,552
bytes: cyberpunk City, drone City, Downtown City MegaKit Standard, Kenney Fantasy Town Kit,
Spaceship HY-21 and Poly Haven Hidden Alley. Its README and JSON catalog retain source links,
creators, licenses, SHA-256 hashes, archive inventories and pending downloads.
[Backup status and handoff](research/fantasy-city-2026-10-16/ASSET-BACKUPS.md).
All existing work, original archives and Downloads copies are retained; no paid packs were bought.
The first gallery's exact source and screenshot are preserved in
[the v1 archive](archive/environment-lab-v1-2026-10-16/README.md).

The visual target remains large, intricate, less blocky alien/fantasy cities. Minecraft is a
scale/infrastructure reference; Skyrim, Spider-Man, Crackdown, Kakarot and Synty Elven Realm
remain in the [city research](research/fantasy-city-2026-10-16/README.md) and
[complex-scene shortlist](research/fantasy-city-2026-10-16/COMPLEX-SCENES.md).
Spacecraft, orbital stations and planetary/alien architecture are priorities in the download
queue. Future individual-drone control (**MODE-20**, **PILOT-01–09**) includes switchable
first-person onboard and third-person chase views, flight/aim/abilities, and a return to RTS
command while other squads keep their orders. An optional dedicated pilot/skirmish mode
can come first; campaign integration remains the eventual goal. The owner's Ghost Recon /
RTS reference guides the idea; the exact title is unspecified. The later Tank Wars-style
builder (**MODE-21**) also remains planned. Victory extraction/continued capture and multiple
pods carrying 1–3 drones each are now implemented, with browser/device acceptance still open.

**October 17 — progressive destruction artwork:** all five city tests now offer **Intact,
Damaged, Major destruction and Ruins**. Broken facades, jagged tower sections, exposed floors,
bent rods and settled rubble are actual derivative 3D meshes; the original architecture,
terrain, ocean and citadel foundations remain available. Start with the
[alien destruction test](http://127.0.0.1:4201/invasion/environments/?scene=alien&damage=heavy)
and switch maps/stages in the sidebar. These are visual prototypes; battle damage, collision,
save persistence and collapse animation are still open.
[Game integration review and all five test links](research/fantasy-city-2026-10-16/GAME-INTEGRATION.md)
record the measured asset sizes and concrete route into campaign districts. Multiple-pod
delivery remains the next requested gameplay pass; parachutes were not changed here.
