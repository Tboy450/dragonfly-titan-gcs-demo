# TE / Measurement Specialties 44909 reference family

Saved and visually inspected October 21, 2026 by Codex (OpenAI). Manufacturer-authored
documents, hosted by public distributors. These identify a real space-thermistor family;
they do not identify Dragonfly's battery sensor or prove adoption on another named mission.

| Original document | Saved pages | Evidence used |
|---|---|---|
| [TE TESS-ANDO-DS0059 Rev A, Model 44909](https://www.allelcoelec.com/datasheets.4a/11029759-00.pdf) | `te-44909-1.png`, `te-44909-2.png` | Real product photograph; epoxy body, two 32 AWG solder-plated copper leads; drawing gives .095 inch / 2.4 mm maximum diameter and 3 inch / 7.6 cm minimum leads |
| [TE TESS-ANDO-DS0050 Rev A, 44900 series](https://www.cdiweb.com/datasheets/te/te-44900-series.pdf) | `te-44900-page1.png`, `te-44900-page2.png` | Real family photograph; model44909 black-body/gray-end code; -55 to +90 C continuous range |

Credit: TE Connectivity / Measurement Specialties, original product photographs, drawings
and tables. No image generation or synthetic reference photo. Original full pages retained;
comparison crops are labeled and do not replace the originals. PDFs are local download inputs;
the repository archives rendered pages and original URLs, following its source policy.

The direct TE product page and document-delivery/image endpoints denied retrieval; the saved
files are the manufacturer documents from the above public mirrors, not the denied downloads.
Product identity cross-reference: [TE SP44909X-16](https://www.te.com/en/product-SP44909X-16.html).

## Interpretation limits

- Use the 2.4 mm **maximum** as the model envelope, not a measured Dragonfly dimension.
- Three inches is 76.2 mm; 7.6 cm is the rounded metric label. Two modeled leads each retain
  76.2 mm centerline length. Nominal 32 AWG bare diameter is about .202 mm; plating is omitted.
- The black/gray code comes from the family table. Bead depth/profile and finish are estimates
  informed by the real photograph; the drawing supplies no complete three-axis solid model.
- Family sheets give beta values over different temperature intervals. Do not combine them,
  or add a sensor electrical/response model from these appearance references.
- The operating range covers a warm battery example but does not prove qualification in this
  installation. It does **not** cover Titan's ambient temperature or a 157 C MMRTG fin root.
- Local adhesive pads/tacks, route, mounting point and one example's count are [EST]. No exact
  adhesive material, low-outgassing qualification, thermal contact conductance or flight wiring
  destination is asserted. Ends stop explicitly at the unmodeled continuation.

The [previous NASA/APL battery evidence audit](../../battery-measurement-2026-10-20/README.md)
remains the source for the controller input and why a flight-package identification is open.

Used by [part20 family approximation](../../battery-sensor-2026-10-21/README.md).
