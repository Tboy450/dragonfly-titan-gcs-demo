# Inspection Pan

Codex (OpenAI), October25,2026. Presentation-only; no hardware/flight changes.

- With Rotate selected, left drag orbits, right-button hold/drag pans across
  the screen, wheel zooms. Shift+arrows provide the same pan action by keyboard.
- Only research-model Internal/Thermal inspection captures right drag/context menu.
  Off, Exterior, original model and Pilot retain their previous behavior.
- Pan shifts the orthographic camera window, not equipment positions or orbit angles.
  The existing part-label projection shares that camera. Viewport-relative offsets
  are bounded to one screen each way and survive zoom/viewport changes.
- Reset, component focus, subassembly focus and Follow sampling recenter pan.
  Cancel/lost capture/button chords/mode changes release the drag.
- **628 automated tests pass**, including four input/policy/lifecycle
  checks and an exact projected-displacement rendering check across desktop/phone,
  both layers and 60/100/300% zoom. The original623 checks still pass.

Evidence: `before.png`, `panned.png`, `phone.png`, `browser-checks.json`.
Actual right-drag pointer listeners are exercised by the Node UI-event harness.
Browser checks exercise the keyboard equivalent, native left drag, right-click
menu suppression, wheel, Reset/focus and desktop/phone/Pilot compatibility.
The browser controller has no right-button-hold drag API; do not describe the
keyboard screenshot as a native right-mouse-drag capture.
Desktop panning kept pageY576.8 and zoom100%; phone kept pageY1021.6 and100%.
Phone client/scroll widths375/375px;24 numbered parts; zero browser errors.
Screenshot model-region checks found13,176/13,657 colored hardware pixels in
before/panned views, with a matching right/down visual shift. Exact geometry/label
displacement is verified by the renderer test; screenshot centroid is not metrology.

Recovery files/tag and prior-image link are in the matching archive folder.
Shared hardware source records remain unchanged; IEM15/16/17 are still next.

## OneDrive / Git Handoff

The earlier1:42PM commit triggered automatic Git packing inside the shared
OneDrive `.git`, producing a mass-deletion warning. Owner chose Keep.
Full fsck reported no missing/corrupt objects and the7643-object pack verified.
The complete pending OneDrive deletion list was NOT individually verified or approved.
For this pass, all Git writes/network maintenance use command-local
`git -c gc.auto=0 -c maintenance.auto=false ...`.
Do not run cleanup/prune or approve/suppress OneDrive's deletion warning.
No global/repository configuration is changed.
