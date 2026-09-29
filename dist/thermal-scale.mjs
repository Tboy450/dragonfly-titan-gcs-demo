// Shared temperature color scale for the Mission view thermal layer and its legend.
export const thermalRanges = Object.freeze({
  full: Object.freeze({ min: -180, max: 40, label: "Whole lander" }),
  inside: Object.freeze({ min: -30, max: 40, label: "Inside" }),
});

const stops = [
  [0, [43, 26, 110]], [0.2, [31, 95, 214]], [0.4, [25, 195, 217]], [0.55, [95, 211, 90]],
  [0.7, [242, 227, 58]], [0.85, [242, 138, 46]], [1, [217, 52, 43]],
];

// Returns [r, g, b] (0-255) for a temperature in degrees C within the chosen range.
export function thermalRgb(celsius, range = thermalRanges.full) {
  const t = Math.min(1, Math.max(0, (celsius - range.min) / (range.max - range.min)));
  for (let i = 1; i < stops.length; i += 1) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1], [t1, c1] = stops[i];
      const u = (t - t0) / (t1 - t0);
      return c0.map((value, k) => Math.round(value + (c1[k] - value) * u));
    }
  }
  return stops.at(-1)[1];
}

export const thermalCss = (celsius, range) => `rgb(${thermalRgb(celsius, range).join(", ")})`;
export const thermalGradientCss = () => `linear-gradient(90deg, ${stops.map(([t, c]) => `rgb(${c.join(", ")}) ${Math.round(t * 100)}%`).join(", ")})`;
