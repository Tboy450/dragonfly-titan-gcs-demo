# ART-09 A1 — Interactive Scout comparison links

Implemented October 19, 2026 — **Codex (OpenAI)**.

One follow-up step adds original/polished inspection to the existing public lab:

- [Original Scout](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?asset=drone-scout&scout=original)
- [Scout polish pass](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?asset=drone-scout&scout=polished)

The Scout inspector has **Original / Polish pass** links. Each opens that version in the
existing orbit/zoom/turntable viewer with its existing light/quality controls. Both use the
same lighting setup, default cameras and stand scale; switching reloads the page, so it
resets a manually orbited camera. The selected version appears in the title and shareable
query string. Other assets do not show these links, and the catalog stays at 18 entries.
Unknown versions fall back to the current polished Scout. No campaign/save state is read
or changed by this comparison.

`history/scout-original.mjs` extracts only the original Scout generator and its geometry
helpers from the preserved `4728169` source. It is loaded only for the original version.
The current version continues to import the game's `models.mjs`. Unselected drone templates
are disposed after construction in the existing loader rather than left allocated.

**383/383 tests pass.** [Full output](test-results.txt). New checks compare original body,
glow, normals, colors, scale and rotor data exactly against the archived pre-polish export.
They load both actual display variants, check equal stand scale/XZ footprint, confirm the
expected distinct body geometry and exercise unknown-version fallback. Existing catalog,
other-drone, gameplay, render-stand-in and simulator checks remain passing.

These checks do not certify native browser UI, shader output, touch or real-phone performance.
Browser access was previously blocked and was not retried. Owner art review and actual
High/Light/device acceptance remain open. ART-09 remains unchecked; canonical count **23/305**.

[Prior lab source, UI test, historical CPU picture and restore steps](../../archive/scout-lab-comparison-2026-10-19/README.md)
are preserved. The original Scout source/geometry/picture archive remains unchanged. No city,
Link/other drone art, creator/license notices or unfinished kit work was removed.
