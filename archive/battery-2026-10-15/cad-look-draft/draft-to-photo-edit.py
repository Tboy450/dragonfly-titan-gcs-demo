import sys
sys.path.insert(0, "C:/Users/Heemi/AppData/Local/Temp/claude/C--Users-Heemi-OneDrive-Documents-ChatGPT-Nasa-dragonfly/1e40e9d2-db40-497e-b305-c0c476295378/scratchpad")
from edit_util import edit

edit("dist/battery.mjs", [
("""// it is an inference from 134 Ah, GS Yuasa and 24 cells [EST]. APL's 9-cell thermal test module
// (ICES-2022 figs. 2-6) is exactly three of these cells across and three deep, standing upright,
// in a ribbed enclosure on a flanged base with 2 in and 1 in fans and copper heat pipes; the look
// follows it. Placement:""",
"""// it is an inference from 134 Ah, GS Yuasa and 24 cells [EST]. APL's 9-cell thermal test module is
// exactly three of these cells across and three deep, standing upright. Its look follows the real
// test photos (ICES-2022 figs. 10, 11, 13): a cream-white lower section with ribbed walls around
// the cells, a flange, and a bare aluminum upper housing over the bus bars with the 2 in fans on its
// ends and round connectors (one large four-pin) on its long face; small black 1 in fans on the
// lower walls. The paper's CAD figures (figs. 2-6) are used only for the internal arrangement
// (cells, bus straps, heat pipes, base). It is a sub-scale test article, not flight hardware, so
// the flight pack's real enclosure may differ [EST]. Placement:"""),
("  enclosure: Object.freeze({ widthM: 0.62, depthM: 0.40, bottom: -0.27, top: 0.04 }),",
 "  // Lower ribbed section up to the flange at the cell tops; upper housing to the lid.\n  enclosure: Object.freeze({ widthM: 0.62, depthM: 0.40, bottom: -0.27, split: 0.006, top: 0.064 }),"),
("""  const chemFilm = new THREE.MeshStandardMaterial({ color: 0xd9c99a, roughness: 0.55, metalness: 0.45 });
  const plate = new THREE.MeshStandardMaterial({ color: 0xbfb08a, roughness: 0.5, metalness: 0.55 });""",
"""  const cream = new THREE.MeshStandardMaterial({ color: 0xe7e0cb, roughness: 0.6, metalness: 0.15 });
  const bare = new THREE.MeshStandardMaterial({ color: 0xd4d8db, roughness: 0.35, metalness: 0.65 });
  const plate = new THREE.MeshStandardMaterial({ color: 0xc4c8cb, roughness: 0.45, metalness: 0.6 });"""),
("""  const W = E.widthM, D = E.depthM, H = E.top - E.bottom, midY = (E.top + E.bottom) / 2;""",
"""  const W = E.widthM, D = E.depthM, lowH = E.split - E.bottom, lowMid = (E.split + E.bottom) / 2;
  const flangeT = 0.006, upBottom = E.split + flangeT / 2, upH = E.top - upBottom, upMid = (E.top + upBottom) / 2;"""),
("""  // ---- Enclosure: four ribbed walls (rib pockets as on APL's test module) and a bolted lid. The
  // lid is see-through in Internal so the cells show (an inspection aid).
  for (const s of [-1, 1]) {
    box([W, H, 0.004], [0, midY, s * (D / 2 - 0.002)], chemFilm, covers, "battery-wall-long");
    box([0.004, H, D - 0.008], [s * (W / 2 - 0.002), midY, 0], chemFilm, covers, "battery-wall-end");
    for (let i = 0; i <= 4; i += 1) box([0.008, H, 0.006], [-W / 2 + i * W / 4, midY, s * (D / 2 + 0.003)], chemFilm, covers, "battery-wall-rib");
    for (const y of [E.bottom + 0.004, midY, E.top - 0.004]) box([W, 0.008, 0.006], [0, y, s * (D / 2 + 0.003)], chemFilm, covers, "battery-wall-rib");
  }
  const lid = box([W, 0.006, D], [0, E.top + 0.003, 0], chemFilm, covers, "battery-lid");
  lid.userData.shell = true;
  for (let i = 0; i < 6; i += 1) for (const s of [-1, 1]) {
    rod(0.004, 0.003, [-W / 2 + 0.03 + i * (W - 0.06) / 5, E.top + 0.0075, s * (D / 2 - 0.01)], steel, covers, null, "battery-lid-bolt", 6);
  }
  // Fans on both end walls: three 2 in fans along the top and four 1 in fans below (the test
  // module carries six and eight).
  const fan = (side, y, z, size, name) => {
    const x = side * (W / 2 + 0.006);
    box([0.012, size, size], [x, y, z], fanBlack, covers, name);
    rod(size * 0.42, 0.004, [x + side * 0.0062, y, z], steel, covers, "x", `${name}-guard`, 16);
    rod(size * 0.16, 0.006, [x + side * 0.0068, y, z], fanBlack, covers, "x", `${name}-hub`, 12);
  };
  for (const side of [-1, 1]) {
    for (const z of [-0.11, 0, 0.11]) fan(side, E.top - 0.05, z, 0.058, "battery-fan-2in");
    for (const y of [E.bottom + 0.06, E.bottom + 0.11]) for (const z of [-0.05, 0.05]) fan(side, y, z, 0.032, "battery-fan-1in");
  }
""",
"""  // ---- Lower section: cream-white walls with a frame of posts and rails standing out from
  // recessed panels, as in the test photos.
  for (const s of [-1, 1]) {
    box([W, lowH, 0.004], [0, lowMid, s * (D / 2 - 0.002)], cream, covers, "battery-wall-long");
    box([0.004, lowH, D - 0.008], [s * (W / 2 - 0.002), lowMid, 0], cream, covers, "battery-wall-end");
    for (let i = 0; i <= 4; i += 1) box([0.012, lowH, 0.008], [-W / 2 + 0.006 + i * (W - 0.012) / 4, lowMid, s * (D / 2 + 0.004)], cream, covers, "battery-wall-rib");
    for (const y of [E.bottom + 0.006, lowMid, E.split - 0.006]) box([W, 0.012, 0.008], [0, y, s * (D / 2 + 0.004)], cream, covers, "battery-wall-rib");
    for (let i = 0; i <= 2; i += 1) box([0.008, lowH, 0.012], [s * (W / 2 + 0.004), lowMid, -D / 2 + 0.006 + i * (D - 0.012) / 2], cream, covers, "battery-wall-rib");
    for (const y of [E.bottom + 0.006, lowMid, E.split - 0.006]) box([0.008, 0.012, D], [s * (W / 2 + 0.004), y, 0], cream, covers, "battery-wall-rib");
  }
  // ---- Flange and upper housing: a bare aluminum box over the terminals and bus bars, on a
  // flange that stands out around the lower section. The lid is see-through in Internal so the
  // cells show (an inspection aid).
  box([W + 0.024, flangeT, D + 0.024], [0, E.split, 0], plate, covers, "battery-flange");
  for (let i = 0; i < 8; i += 1) for (const s of [-1, 1]) {
    rod(0.0035, 0.003, [-W / 2 + 0.02 + i * (W - 0.04) / 7, E.split + flangeT / 2 + 0.0015, s * (D / 2 + 0.008)], steel, covers, null, "battery-flange-bolt", 6);
  }
  for (const s of [-1, 1]) {
    box([W, upH, 0.004], [0, upMid, s * (D / 2 - 0.002)], bare, covers, "battery-housing-long");
    box([0.004, upH, D - 0.008], [s * (W / 2 - 0.002), upMid, 0], bare, covers, "battery-housing-end");
  }
  const lid = box([W + 0.006, 0.003, D + 0.006], [0, E.top + 0.0015, 0], bare, covers, "battery-lid");
  lid.userData.shell = true;
  for (let i = 0; i < 6; i += 1) for (const s of [-1, 1]) {
    rod(0.0035, 0.002, [-W / 2 + 0.03 + i * (W - 0.06) / 5, E.top + 0.004, s * (D / 2 - 0.008)], steel, covers, null, "battery-lid-bolt", 6);
  }
  // Fans: three 2 in fans on each end of the upper housing and 1 in fans on the lower walls,
  // two per wall (the test module carries six and eight). Positions on the flight pack [EST].
  const fan = (x, y, z, size, axis, name) => {
    const n = axis === "x" ? [Math.sign(x), 0, 0] : [0, 0, Math.sign(z)];
    box(axis === "x" ? [0.012, size, size] : [size, size, 0.012], [x, y, z], fanBlack, covers, name);
    rod(size * 0.42, 0.004, [x + n[0] * 0.0062, y, z + n[2] * 0.0062], steel, covers, axis, `${name}-guard`, 16);
    rod(size * 0.16, 0.006, [x + n[0] * 0.0068, y, z + n[2] * 0.0068], fanBlack, covers, axis, `${name}-hub`, 12);
  };
  for (const side of [-1, 1]) {
    for (const z of [-0.12, 0, 0.12]) fan(side * (W / 2 + 0.006), upMid, z, 0.051, "x", "battery-fan-2in");
    for (const z of [-0.1, 0.1]) fan(side * (W / 2 + 0.014), E.bottom + 0.07, z, 0.025, "x", "battery-fan-1in");
    for (const x of [-0.16, 0.16]) fan(x, E.bottom + 0.07, side * (D / 2 + 0.014), 0.025, "z", "battery-fan-1in");
  }
"""),
("""  // ---- Bus bars: copper straps joining the cells in series, row by row (snake pattern), and two
  // main leads to the power connectors on the forward wall.""",
"""  // ---- Bus bars: copper straps joining the cells in series, row by row (snake pattern), and two
  // main leads to the power connector on the upper housing's forward face."""),
("""  for (const [x, name] of [[-0.19, "battery-main-lead-negative"], [-0.11, "battery-main-lead-positive"]]) {
    tube([[x, busY + 0.006, zs[0]], [x, busY + 0.01, front + 0.03], [x, busY - 0.04, front + 0.01], [x, -0.07, front + 0.006]], 0.006, copper, bus, name);
  }

  // ---- Forward wall: two power connectors and two signal connectors, with cables forward along
  // the floor toward the power units (route and end tie [EST]).
  const connY = -0.07;
  for (const [x, r, name] of [[-0.19, 0.02, "battery-power-connector"], [-0.11, 0.02, "battery-power-connector"], [0.08, 0.011, "battery-signal-connector"], [0.13, 0.011, "battery-signal-connector"]]) {
    box([r * 2.6, r * 2.6, 0.004], [x, connY, front - 0.002], plate, ports, `${name}-flange`);
    rod(r, 0.022, [x, connY, front - 0.013], gold, ports, "z", name, 16);
  }
  for (const [x, r] of [[-0.19, 0.011], [-0.11, 0.011], [0.08, 0.006]]) {
    tube([[x, connY, front - 0.024], [x, connY - 0.035, front - 0.036], [x * 1.08, -0.2, front - 0.046], [x * 1.12, -0.25, front - 0.05], [x * 1.12, -0.26, front - 0.07]], r, jacket, bus, "battery-cable");
  }
  rod(0.016, 0.01, [-0.19 * 1.12, -0.26, front - 0.062], lacing, bus, "z", "battery-harness-tie", 12);""",
"""  const connY = upMid;
  for (const [dx, name] of [[-0.008, "battery-main-lead-negative"], [0.008, "battery-main-lead-positive"]]) {
    tube([[xs[0] + 0.038 + dx, busY + 0.004, zs[0]], [-0.2 + dx, busY + 0.006, front + 0.03], [-0.2 + dx, connY, front + 0.012]], 0.004, copper, bus, name);
  }

  // ---- Upper housing's forward face, as on the test module: one large four-pin power connector
  // and two smaller round connectors, on the port half; cables down the face and forward along the
  // floor toward the power units (route and end tie [EST]).
  const plugs = [[-0.2, 0.022, "battery-power-connector"], [-0.12, 0.012, "battery-signal-connector"], [-0.07, 0.012, "battery-signal-connector"]];
  for (const [x, r, name] of plugs) {
    box([r * 2.5, r * 2.5, 0.004], [x, connY, front - 0.002], plate, ports, `${name}-flange`);
    rod(r, 0.02, [x, connY, front - 0.012], name.includes("power") ? steel : gold, ports, "z", name, 20);
  }
  for (const [px, py] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rod(0.004, 0.003, [-0.2 + px * 0.008, connY + py * 0.008, front - 0.023], fanBlack, ports, "z", "battery-power-connector-socket", 8);
  for (const [x, r] of [[-0.2, 0.011], [-0.12, 0.006], [-0.07, 0.006]]) {
    tube([[x, connY, front - 0.024], [x, connY - 0.03, front - 0.034], [x, -0.12, front - 0.03], [x * 1.05, -0.25, front - 0.034], [x * 1.08, -0.262, front - 0.07]], r, jacket, bus, "battery-cable");
  }
  rod(0.016, 0.01, [-0.2 * 1.08, -0.262, front - 0.062], lacing, bus, "z", "battery-harness-tie", 12);"""),
])
print("ok")
