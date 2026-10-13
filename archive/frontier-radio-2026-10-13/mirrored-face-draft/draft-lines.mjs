// Unpublished draft (2026-10-13): these lines of dist/frontier-radio.mjs had the connector
// face mirrored relative to the APL photo (slice 1 / J11 appeared on the viewer's right).
// Replace the published lines with these to see the draft.

  const centers = [];
  let x = -W / 2;
  slicesM.forEach((t, i) => {
    centers.push(x + t / 2);
    box([t - 0.0012, H, L], [x + t / 2, H / 2, 0], anodized, slices, `frontier-radio-slice-${i + 1}`);
    x += t;
  });

    let seamX = -W / 2;
    for (let i = 0; i <= slicesM.length; i += 1) {
      box([0.003, 0.02, 0.014], [Math.max(-W / 2 + 0.0015, Math.min(W / 2 - 0.0015, seamX)), 0.01, zf], anodized, mounts, "frontier-radio-foot-rib");
      seamX += slicesM[i] ?? 0;
    }

  plate(s2 - 0.009, 0.072, "frontier-radio-J23");
  dsub(s2 + 0.008, 0.068, "frontier-radio-J21");
  plate(s2 - 0.009, 0.034, "frontier-radio-J24");
  dsub(s2 + 0.008, 0.032, "frontier-radio-J22");

  rod(0.0044, 0.009, [s4 + 0.002, 0.042, face - 0.009], gold, connectors, "z", "frontier-radio-J32-cap", 12);
  tube([[s4 + 0.004, 0.039, face - 0.012], [s4 + 0.012, 0.03, face - 0.014], [s4 + 0.012, 0.016, face - 0.01], [s4 + 0.006, 0.008, face - 0.004]], 0.0007, gold, connectors, "frontier-radio-J32-cap-chain");
