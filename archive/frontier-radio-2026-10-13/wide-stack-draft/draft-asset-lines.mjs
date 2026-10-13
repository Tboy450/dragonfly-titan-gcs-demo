// Unpublished draft (2026-10-13): the stack width came from the published 2,050 cm3 volume
// (13.2 cm), wider than the photographed four-slice unit, whose connector face is about as wide
// as it is tall. Replace the published asset block in dist/frontier-radio.mjs with this one.

import * as THREE from "./vendor/three/three.module.min.js";

// Part 13: APL Frontier software-defined radio, enclosure level. The look follows the APL photo
// on NASA's Dragonfly pages (black anodized stack of four slices, labeled connectors J11-J32,
// bolted feet, semi-rigid coax on top). Size: each slice is a 4 x 6 inch package [PUB, APL
// Frontier Radio Lite paper]; the 2,050 cm3 volume and 2.1 kg mass are Frontier's published
// figures [PUB, eoPortal tables]. The stack width is volume / slice face [CALC]. The slice split,
// connector positions, feet and coax routes are read from the photo [EST]. Placement on the
// starboard bay floor and the connector face pointing inboard are [EST]. Whether Dragonfly
// carries a second, redundant unit is not published; one is drawn.
const inch = 0.0254;
const heightM = 4 * inch, lengthM = 6 * inch;
const widthM = Math.round(2050e-6 / (heightM * lengthM) * 1e4) / 1e4;
export const frontierRadioAsset = Object.freeze({
  revision: "frontier-radio-2026-10-13",
  heightM, lengthM, widthM,
  massKg: 2.1,
  volumeCm3: 2050,
  // Slice thicknesses across the stack, from the photo's connector-face proportions [EST].
  slicesM: Object.freeze([0.032, 0.0404, 0.026, 0.034]),
  // Base center on the bay floor (outer bottom -0.36 m plus 7.62 cm foam) [CALC/EST].
  position: Object.freeze([0.22, -0.284, 0.2]),
  // The connector face (local -z) turns inboard toward the centerline harness run [EST].
  yaw: Math.PI / 2,
  bounds: Object.freeze({ min: [0.12, -0.285, 0.125], max: [0.32, -0.15, 0.275] }),
});
