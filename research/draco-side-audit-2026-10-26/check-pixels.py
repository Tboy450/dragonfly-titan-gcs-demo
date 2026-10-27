"""Check model-colored pixels in the central viewport, excluding HUD and grid edges."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent
report = json.loads((root / "browser-checks.json").read_text())
results = []
for row in report["renders"]:
    canvas = row["canvas"]
    with Image.open(root / row["file"]) as image:
        bounds = (
            round(canvas["x"] + canvas["width"] * .34),
            round(canvas["y"] + canvas["height"] * .18),
            round(canvas["x"] + canvas["width"] * .66),
            round(canvas["y"] + canvas["height"] * .82),
        )
        assert 0 <= bounds[0] < bounds[2] <= image.width
        assert 0 <= bounds[1] < bounds[3] <= image.height
        pixels = list(image.convert("RGB").crop(bounds).getdata())
        gold = sum(r > 65 and r > g * 1.1 and g > b * 1.2 for r, g, b in pixels)
        cold = sum(b > r * 1.2 and b > g * 1.25 and b > 50 for r, g, b in pixels)
        dark = sum(max(r, g, b) < 85 for r, g, b in pixels)
        count = cold if "Thermal" in row["mode"] else gold
        assert count > 50, (row["mode"], gold, cold, dark)
        results.append({"mode": row["mode"], "gold": gold, "cold": cold, "dark": dark})
(root / "render-checks.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))
