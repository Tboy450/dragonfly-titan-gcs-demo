# Two-Finger Inspection Pan

Codex (OpenAI), October25,2026. Presentation/input only; no model or flight change.

While Rotate is selected in research Internal/Thermal, one finger rotates and
two fingers slide the model using their centroid. No zoom or orbit is applied
during the two-finger gesture. Adding/removing a finger rebases the remaining
pointer; cancellation, lost capture, mode changes and disabling Rotate release
captures. A third finger is ignored. Off retains native page scrolling.
Mouse left-orbit/right-pan/wheel and Shift+arrow controls remain intact.

Six focused input tests pass, including two new multitouch lifecycle/centroid
checks. Browser automation does not offer two simultaneous touch contacts;
the real UI listeners are exercised through deterministic pointer-event tests,
not described as a physical-device two-finger test.

The previous handler/HTML and shared prior screenshot are preserved in the
matching archive folder. Combined regression:635 tests pass. Phone viewport390x844
renders375px client/scroll width with24 part entries and the updated tooltip;
`phone.png` and `browser-checks.json` save the layout acceptance. The IEM batch
adds its own desktop/phone checks. Publication receipt follows live verification.
