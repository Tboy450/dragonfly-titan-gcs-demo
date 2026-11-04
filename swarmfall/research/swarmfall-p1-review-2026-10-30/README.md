# Swarmfall P1 browser review — October 30, 2026

Reviewed by Claude (Anthropic Claude Opus 5.5, Claude Code desktop app). This is the browser
acceptance still open on three owner-requested P1 features that Codex implemented on
October 19: Clean view (CTRL-13), victory or continue (OBJ-07) and multi-pod drops (DROP-01,
with DROP-04, DROP-06 and DROP-08).

## How it was run

- The local preview (`swarmfall-lab`, port 4212), driven with real clicks and key presses.
- The window was 1024×768, and a 375×812 phone with touch emulation.
- The app window was hidden, so the page ran at about a quarter of real time. That counts as
  DROP-08's low-frame-rate case, and the game showed its slow-motion notice.
- Taps were sent as mouse clicks. Real-phone touch was not checked.
- The preview's storage was empty before the review and was left empty afterwards.

## Clean view (CTRL-13): passed

- V hid the top bar, side panels, bottom bar, minimap, drop panel, toasts and map labels. Only
  a small "Show HUD · V" button stayed ([desktop](clean-view-desktop.jpg),
  [phone](clean-view-phone.jpg)).
- Camera keys kept working in Clean view: E turned it by 1.86 rad and R tilted it by 0.55 rad.
- V, Escape and the Show HUD button each restored the HUD. Escape did not open the pause menu.
- B restored the HUD and opened the drop panel.
- A mission ending during Clean view restored the HUD and showed the debrief.

## Victory or continue (OBJ-07): passed on desktop and phone layout

- Holding 3 of Kepra's 4 zones opened the choice once, paused, with the remaining zones and
  the rules ([desktop](victory-choice-desktop.jpg), [phone](victory-choice-phone.jpg)).
- Reloaded before choosing, Resume offered the choice again.
- After Continue capturing, the battle ran on and was not interrupted again.
  - The HUD read "Victory available · 3/4 held · 1 remain", and Leave for victory stayed in
    the top bar.
  - Reloaded after choosing, Resume did not ask again.
- Leave for victory, clicked twice quickly, settled once:
  - The bank went from 158 to 346 (+38 drone refund, +150 conquest reward).
  - Missions won, played and settled each counted 1, and the saved battle was cleared.

## Multi-pod drops (DROP-04, DROP-06, DROP-08): passed for the shipped maps

- **Pod counts before launch.** 1, 2 or 3 Scouts → 1 pod; 4 Scouts → 2 pods; 2 Scouts + 2
  Links → 2 pods; 8 Scouts + 4 Links (16/16 slots) → 4 pods. 18 slots was refused with "A
  wave holds 16 slots."
- **Preview (DROP-04).**
  - The Kepra beacon showed 4 labeled courts side by side ([image](pod-preview-kepra-4-pods.jpg)).
  - The Aurex city beacon showed 6 courts, all on droppable ground with no roof, at least
    20 m apart ([image](pod-preview-aurex-6-pods.jpg)).
  - A tap at the zone's edge moved the courts back inside it, all within 38 m of the center
    of the 50 m zone.
  - A tap outside held zones said "Pods can only land inside a zone you hold (cyan ring)."
- **Descent (DROP-06).**
  - Four separate canopies came down side by side ([image](four-canopies-descending.jpg)).
  - The squad card read "4 pods inbound · 12 arriving", then "12 ready · 8 Scout, 4 Link".
  - The scene adds a visual pod whenever one is needed, so inbound pods are never hidden.
- **Charging and waves.**
  - Each wave was charged once: 346 → 194 matter for the full wave.
  - A second wave launched while paused was charged once and became Squad 2. Its pod did not
    move until the game was unpaused.
- **Commands carry across the landing.** A move order given while the pods were still coming
  down applied to all 12 released drones: one squad, no two drones within 1.5 m.
- **Reload mid-descent.** The battle came back paused with the pods at the same point and no
  second charge. After resuming, exactly 7 drones landed, as one squad.
- **Cramped landings.**
  - A survey of every zone on all 10 maps (7 campaign planets and 3 frontiers) found no zone
    with water, roofs or other blocked ground inside it. So cramped landings do not occur in
    the maps that ship today.
  - `tests/invasion-drop-waves.test.mjs` covers water, steep ground, occupied courts,
    roof/bridge corridors and a partly blocked shoreline.
  - City districts with buildings inside zones remain CITY work.

## Found and fixed

- "1 pods inbound" and "1 drones" in the landing log, and "1 pods inbound" on the squad card,
  now read "1 pod" and "1 drone".
- A pause menu (or the settings) left open over one battle could carry over into the next
  one. In normal play the battle is paused while the menu is open, so it cannot end
  underneath it; only the review's forced ending showed this. Starting a mission now closes
  both, as it already closed the debrief and victory dialogs.
- `tests/invasion-p1-review.test.mjs` (2 tests) covers both fixes.

## Still open

- Real-phone touch on all three features: the owner's phone, or TEST-03 playtests.
- The restore button is 36 px tall on a phone, under the usual 44 px touch target. Tracked by
  ACCESS-02.
