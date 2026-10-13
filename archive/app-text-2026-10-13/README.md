# Archived App and README Text (until 2026-10-13)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `439f044`, so that
no wording is lost when the in-app references were updated (commit "Update model assumptions,
footer and part references").

## Files here

- `index.html`: the whole page as it was. The **Model assumptions** paragraph read:

  > The NASA / APL model is built from procedural geometry using public thermal figures, CAD
  > imagery and assembly references. It is not imported flight CAD. Component dimensions,
  > placement, tube routing, cutter shape and the 24 drawn sample cups are approximations. The
  > original demo model and its interior are deliberately labeled mock-ups.

  The **footer** had: the disclaimer, Replay the arrival, Start over, NASA mission page,
  Spacecraft data, Titan environment. **Engineering references** had the TITAN Chamber and
  Rotor & Thermal Systems columns only.
- `README-project.md`: the project README as it was. Its intro said "The next visual milestone
  is tracked part by part in Interior realism checklist, starting with numbered callouts", and
  Vehicle Layers began "Internal makes the foam shell see-through and shows the parts NASA's
  thermal papers describe, placed where their figures put them".

## What changed

Everything still true was kept: the approximations sentence (dimensions, placement, tube
routing, cutter shape), the mock-up note, the numbered-callout priority and the placeholder
list. The "24 drawn sample cups" no longer exist (the carousel shows its enclosed drum since
October 12); the text now says so. New: the part-by-part rebuild explanation, the Vehicle part
references list and two footer links.

## Restore

Copy the quoted paragraph back into `#model-assumptions` in `dist/index.html`, or use
`git show 439f044:dist/index.html` for the whole page.
