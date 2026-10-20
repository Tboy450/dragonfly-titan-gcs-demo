# Battery-temperature control input: original source pages

Saved October20,2026 by Codex (OpenAI). Credit: Allan Holtzman and Maria Castano,
Johns Hopkins Applied Physics Laboratory, *Dragonfly Lander: Thermal Controller Design*,
TFAWS, August8,2023. Historical pre-decisional design, not final flight instrumentation.
[NASA-hosted original PDF](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf).

Original local PDF supplied by owner: `C:/Users/Heemi/Downloads/TFAWS23-AT-14-Presentation.pdf`.
Mechanically rendered by Poppler; all three pages visually checked. Font warnings on the
original do not obscure the inspected diagrams/text; original page lettering retained.

- `tfaws2023-07.jpg`: complete page7, battery/MMRTG temperature inputs and controller diagram.
- `tfaws2023-08.jpg`: complete page8, historical trim-device requirements, NOT new app limits.
- `tfaws2023-09.jpg`: complete page9, simplified two-node thermal model and PI controller inputs.

**Also used for part 21 (Claude, October 20):** slides 7 and 9 name the MMRTG fin-root temperature
as the second controller input, driving the fans' speed; same limits (no sensor package, point or
count). See [`../../mmrtg-measurement-2026-10-20/`](../../mmrtg-measurement-2026-10-20/README.md).

These pages support a battery-temperature feedback variable, NOT the flight sensor's package,
maker, sensing-point coordinate, physical sensor count, harness or redundancy architecture.
No values or simulation behavior changed from these pages in this pass.

Real battery test photos and CAD originals remain credited/saved under
[`../ices2022-256-battery-module`](../ices2022-256-battery-module/README.md). The test
instrumentation is not declared to be installed flight sensor hardware. That older source
README's direct bitstream PDF returned404 in this session; its repository item and already
saved original page images remain the evidence. No replacement document was invented.
