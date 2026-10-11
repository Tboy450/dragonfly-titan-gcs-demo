# Before Animated Sampling

Archived from **03ac4cf**, tag `archive/sampling-sequence-2026-10-11`.

The prior model had static drill bits, transfer lines and carousel cups. The science job already
shared one 30-second timer, energy charge and result between both sampling controls. The old
readouts described drilling and analysis together, without stage progress.

`dist/` contains the previous renderer, research model, presentation helper, science logic,
markup/styles and affected UI modules. The before screenshots show Internal view at desktop
and phone sizes and the desktop science readouts during a paused sample job.

## Restore

For the exact earlier app, use a separate checkout of tag
`archive/sampling-sequence-2026-10-11`. To restore only this archived implementation, copy the
contents of this folder's `dist/` over the corresponding project `dist/` paths, then run
`node --test tests/*.test.mjs`. New sampling-animation tests target the replacement and would
need to be reverted along with that feature. Review unrelated later changes before restoring.

Archive files are not included in the published website.
