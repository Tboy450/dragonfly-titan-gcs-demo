# Part 05: Cross-Project Hardware Lineage

Codex (OpenAI), October 19, 2026. Owner requested a deeper search of related projects,
followed by searching Dragonfly/Ocellus in reference to those components. This supersedes
the preceding handoff's suggestion to wait for an approximation choice. No choice is
assumed; this is the requested research continuation. **No geometry or flight constants
changed. #05 remains open, 19/24 unchanged.** Existing MIMU family models are preserved.

## Results

| Related hardware/project | Cross-check back to Ocellus | Evidence strength and modeling limit |
|---|---|---|
| GRSSLi / GRLR -> Kodiak | NASA IGARSS2020 p43 documents common MEB with minor modifications for those predecessors. NASA MSS2023 p6 and the 2024 Ocellus technology sheet explicitly show Kodiak -> Ocellus development. | Confirmed lineage, NOT identical boxes. Kodiak optical wavelength and larger envelopes differ; do not copy its optical assembly or card stack wholesale. |
| SQRLi / High TRL Rover Lidar | NASA 2024 review slide4 links MEB qualification to sister-project Ocellus. NASA TechPort116315 names SpaceCube Mini in both Kodiak and Ocellus MEBs. | Confirmed shared development and processor family. SQRLi exposed optics are real hardware context, not an identified complete Ocellus FEB. Different FOV/range/masses. |
| SpaceCube Mini / ISS STP-H5 ISEM / UVSC Pathfinder | NASA's 2019 presentation p12 supplies a clear real v2.0 Mini board photograph and historical mission context. TechPort links the Mini family to Ocellus but does not state its generation. | Useful real board-family reference; NOT confirmation of v2.0, v3.0, card count, orientation, pinouts or exact Ocellus MEB internals. Raven's full SpaceCube2.0 must not be conflated with Mini. |
| DIAMOND AVIM family / LRO / MSL ChemCam / ISS ELC | Original NASA GSFC photonics presentation provides real connector/assembly photos and heritage. DIAMOND's own Ocellus post distinguishes Mini AVIM/custom test adapters from a mission Micro AVIM seed-to-fiber-laser interface. | Direct supplier-stated Ocellus interface family, independently supported by NASA's Ocellus seed-laser entry. No installation photo, connector count, routing or exact purchased option established. |
| Optotune MR-10-30 / SQRLi procurement lead | Manufacturer's archived brochure supplies product imagery and dimensions. Public notice mirrors associate MR-10-30 with SQRLi, but an original SAM notice was not retrieved. Exact Ocellus + Optotune searches found no direct association. | Lead only; neither a verified Ocellus supplier identification nor permission to model its scanner. Space modification/delivery not established. |
| Mirrorcle MEMS scanner family | Manufacturer's architecture comparison cites Kodiak as a biaxial lidar example. Exact Ocellus + Mirrorcle searches found no supplier association. | Architecture citation is NOT hardware adoption. Reject as a specific Ocellus appearance substitute. |

The first four rows give a documented route through other missions and back to Ocellus,
not merely similar-looking boxes. The last two rows preserve attractive but unproven leads
so a later session does not silently upgrade them into facts.

## Inspected Primary References

Complete original page images and credit/appearance limits are in
[the source folder](../sources/ocellus-cross-project-lineage/README.md). Large PDFs remain
outside Git, following the project rule to retain relevant page images instead.

1. [NASA IGARSS2020, NTRS20205007653](https://ntrs.nasa.gov/api/citations/20205007653/downloads/IGARSS%202020%20%2809JUL20%29r%5B2%5D.pdf),
   p43. Original CAD plus explicit predecessor electronics reuse; CAD is NOT a photo.
2. [NASA SpaceCube presentation, NTRS20190028775](https://ntrs.nasa.gov/api/citations/20190028775/downloads/20190028775.pdf),
   p12. Real unfolded v2.0 Mini boards at upper right; lower-right deployment view is CGI.
3. [NASA TechPort116315](https://techport.nasa.gov/projects/116315), HTRL project description.
   Identifies Mini use in Kodiak/Ocellus. Search-index text inspected; direct page rendering
   requires JavaScript. No exact processor generation asserted.
4. [NASA Ocellus technology sheet FS-2024-2-237-GSFC](https://ntts-prod.s3.amazonaws.com/t2p/prod/t2media/tops/pdf/GSC-TOPS-353.pdf),
   both pages. Repeats identified Kodiak/Ocellus CAD lineage and historical design envelopes;
   cover is mission concept art. Its design-level budgets are NOT new simulator constants.
   [NASA landing page](https://technology.nasa.gov/patent/GSC-TOPS-353).
5. [NASA GSFC, Optical Fiber Assemblies for Space Flight](https://www.diamond-fo.com/media/bss/productattachment/Optical_Fiber_Assemblies_for_Space_Flight_from_the_NASA_Goddard_Space_Flight_Center_Photonics_Group.pdf),
   pp7/13/24. Real LRO fiber assemblies, ChemCam function text and real connector variants.
   Page13's rover images are CGI, not connector photos. Historical DMI terminology must not
   be silently mapped onto a current supplier model. No Ocellus mention in this older source.
6. [NASA NEPP2024 photonics update](https://nepp.nasa.gov/docs/etw/2024/04-JUN-TUES/1440-Flores-NEPP-ETW-2024-Photonics-20240007418.pdf),
   p5. Ocellus 1064 nm seed laser entry, not a diode appearance/packaging reference. Table
   quantity is the reported program activity, NOT five lasers installed on the vehicle.
7. [DIAMOND Micro AVIM product page](https://www.diamond-fo.com/en/micro-avim-connector)
   and original product image; supplier-stated 4.5 x 21 mm family footprint. Does not establish
   Ocellus installed dimensions or exposed flight hardware. Supplier credit/rights retained.
   [Supplier Ocellus statement](https://www.linkedin.com/posts/diamond-sa_wearewellconnected-activity-7467809819861848064-W2lP),
   test-versus-mission distinction; relative post date unreliable, exact date not inferred.
8. [DIAMOND NASA case study, July7,2025](https://www.diamond-fo.com/en/news/article/case-studies-nasa-space-fiber-optical-assemblies)
   corroborates LRO/MSL/ISS heritage. For ChemCam's actual optical function prefer the original
   NASA presentation over the case study's broad communication-system wording.
9. [Optotune archived two-page brochure](https://archive.optotune.com/images/products/Optotune%20one%20pager%202D%20mirror.pdf),
   p2 inspected/saved. Product imagery, not an independently identified flight-unit photo.
10. [Mirrorcle architecture comparison](https://mirrorcletech.com/pdf/pub/Mirrorcle_-_Comparison_of_MEMS_Mirror_LiDAR_Architectures.pdf)
    text inspected; no page image saved and no Ocellus hardware adoption established.

Already saved: [NASA SQRLi review](../sources/nasa-sqrli2024-review/README.md),
[explicit Ocellus packaging CAD](../sources/nasa-optics2023-ocellus/README.md),
[nominal MEB/FEB dimensions](../sources/nasa-mss2023-ocellus/README.md), and the
[prior real/CAD/unchanged-model comparison](../ocellus-evidence-2026-10-19/README.md).

## Unverified / Rejected Leads

- Procurement numbers 80GSFC22R3497 and 80GSFC23PA009: public notice mirrors associate
  Optotune MR-10-30 with SQRLi. Original SAM notice not located in this pass; do not turn
  mirror descriptions/AI summaries into confirmed delivered flight hardware.
- DIAMOND 2025 space-heritage PDF and old AVIM-family PDF links now redirect to HTML.
  No valid full PDFs retrieved; neither is archived here or cited as visually inspected.
  Search snippets alone do not resolve Mini/Midi/Micro naming or test/flight configuration.
- SpaceCube v3.0 Mini development kits, PRIMA readout electronics and generic FPGA adapter
  boards are not identified Ocellus units. No direct Ocellus generation match found.
- NASA patent US12146990B1 describes a related space lidar architecture; generic patent
  embodiments are not Ocellus flight drawings. No hidden optical construction copied.
- Searches included Ocellus + SpaceCube + Mini + v2.0/v3.0, Ocellus + Optotune/MR-10-30,
  Ocellus + Mirrorcle, Ocellus + Micro AVIM, and both SQRLi procurement identifiers.
  Negative search results indicate an unresolved link, not proof that a vendor is absent.
- Existing unrelated LEMS box, Sony tracking system, insect-ocelli illustrations and
  commercial test lidar substitutes remain rejected. No complete as-built Ocellus housing
  or exact installed flight-board photograph was established.

## Model Consequences / Next Work

- Do NOT add the v2.0 Mini cards, five seed lasers, a commercial scanner or an invented fiber
  harness to the current model. Family identification does not locate components in a box.
- The identified Ocellus FEB CAD remains the strongest overall arrangement reference.
  Genuine SQRLi optics and connector-family photos can inform separately labeled hardware
  studies, not a claimed photo-matched Ocellus flight assembly.
- Keep #05 open. Current two MIMUs are family approximations; Ocellus enclosures remain
  nominal 2023 dimension studies. Do not reset/rebuild the already published MIMUs.
- Any later outer-form replacement must first archive CURRENT module/tests/UI/renders,
  keep independent masks/original05 anchors, retain source scale and test new-to-new
  clearances without moving rebuilt neighbors. Preserve uncertain finishes as estimates.
- Follow up on an actual ETU/flight MEB/FEB integration photograph with identified unit,
  dated caption and scale. Supplier interface appearance now has better evidence, but exact
  placement/routing, scanner vendor, processor generation and board stack still need proof.

## Saved Comparison / Validation

`ocellus-cross-project-evidence.jpg` compares real related SQRLi optics, real v2.0 Mini
boards, current supplier connector imagery, identified Ocellus CAD, the Optotune lead and
the **UNCHANGED existing app FEB**. This is not a new completed part/model sample. Complete
source pages remain unaltered; comparison crops are named in `compose-comparison.py`.
The Python script only lays out existing images with labels; it generates no hardware.

Checked original page images and comparison visually. All 10 focused model/checklist tests
pass; full `node --test --test-reporter=dot tests/*.test.mjs` also passes. `git diff --check`
is clean. No app render/deployment geometry change claimed for research only.
No replacement archive/tag needed because no existing asset or behavior was replaced.
Fetched origin: main matched local0fc30b7; priorities branch has no commits outside main.
A concurrent save-state update ede71e4 reached main during publication; merged it intact
with both change-log entries retained, no force push or manual game-source edits.
Full suite rerun after merge: **360 tests pass, 0 fail**.
Keep future unrelated commits when publishing.
