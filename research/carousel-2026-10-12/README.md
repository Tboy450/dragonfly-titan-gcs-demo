# Part 06: DrACO Sample Delivery Carousel

Reviewed and implemented October 12, 2026 by Codex (OpenAI).
Asset: `dist/sample-carousel.mjs`; revision `carousel-2026-10-12`.

## References and Credits

- [NASA SVS 15003: carousel integration photographs](https://svs.gsfc.nasa.gov/15003),
  released April 20, 2026, photographs dated March 5, 2026. **Credit: NASA/Mike Guinto.**
  The gallery identifies the SDC as built by Blue Origin (Honeybee).
  - `nasa-carousel-integration.jpg`: GSFC_20260305_DRAGONFLY_012269_SMALL.jpg.
  - `nasa-carousel-overhead.jpg`: GSFC_20260305_DRAGONFLY_012268_SMALL.jpg.
  These are reference photographs, not textures, flight CAD or an endorsement of this app.
- [Barfknecht et al., Development of the thermal interface between DraMS and the DrACO SDC](https://ntrs.nasa.gov/api/citations/20230017316/downloads/AIAA_SCITECH2024_final_proof.pdf),
  NASA Goddard, SciTech 2024: figures 1-2 (installation), 6 (isolator), 9 (fins).
- [NASA April 23, 2026 integration update](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/).
- [TFAWS 2023 lander layout](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf),
  slide 3: existing vehicle-coordinate calibration, documented in `vehicle-research.mjs`.

## What Is Supported

[PUB] The 2024 paper describes a sealed sample region, titanium cover/isolator,
double-sided aluminum cooling fins and warm actuators underneath. Its engineering-model
fin study selected dense thin pyramids. The 2026 photographs support the enclosed drum,
amber lower appearance, top fittings, small transverse linkage and underside mechanisms.
The new asset approximates these visible features; it does not expose an invented cup inventory.
The large surrounding handling frame, handles, dolly and loose test harnesses are excluded.

## Scale and Placement Limits

**No dimensioned SDC flight drawing was found.** The 0.36 m drum is [EST], not [PUB].
Figure 2's cold-side footprint is roughly half the attic width; the existing model has
about 0.72 m usable width after insulation, giving a provisional 0.36 m reference scale.
This is a visual proportion estimate from a schematic, not photogrammetric metrology.
It must be replaced if a reliable component dimension or actual CAD becomes available.

The assembly is at x=-0.13, y=0.08, z=-1.30 m in the existing model coordinates.
The cold region is on the right in the paper's nose-looking-aft view, corresponding to
negative model x. The drives descend into the warm bay; the cover/fins fit beneath the
forward attic. Axial locations, ports, fin spacing/count, wrap material, seams, fasteners
and three simplified visible drive bodies remain [EST]. The precise flight revision,
internal cup count and hidden mechanisms have not been reconstructed.

Thermal colors use the existing cold-attic node above and equipment-bay node for drives.
These are shared modeled temperatures, not individual measurements or a resolved thermal
gradient. This asset update does not change physics coefficients or science timing.

## Integration and Deferred Neighbors

The housing and its fittings stay stationary; a hidden carrier and explicitly diagrammatic
ring follow the existing sample index animation. The illustrative flow endpoint follows
the new inlet. The physical transfer-line model remains unchanged and needs its own rebuild.

Per the owner's latest instruction, do not resize or displace this assembly to avoid
legacy placeholders. The old transverse Wonderwall and DraMS arrangement still need
reconciliation with the side-by-side interface in figure 2. They may intersect this asset.
The subsequent [Wonderwall pass](../wonderwall-2026-10-12.md) replaces the transverse
placeholder and tests clearance against this carousel without changing its geometry.
Other legacy interfaces remain pending. Structural envelope checks still apply.

Before version, source and matched-angle screenshots:
[`archive/sample-carousel-2026-10-12`](../../archive/sample-carousel-2026-10-12/README.md).
The numbered callout-placement defect remains tracked separately; this pass preserves
part ID `sample-carousel` and inspection number 06.

## Verification

- 151 Node tests passed, including enclosure/scale metadata, modeled envelope,
  instanced-fin budget and stationary housing during indexing.
- Playwright: Internal/Thermal, three orbit angles, desktop and 360 px phone; nonblank,
  unclipped canvas-pixel bounds, no horizontal page overflow or browser exceptions.
- Visually inspected isolated, thermal and installed-context renders against the photos.

Next candidate: research the Wonderwall/interface (#07) before remodeling adjacent DraMS.
Keep exact scale verification open; this completed pass is photo-referenced, not certified CAD.
