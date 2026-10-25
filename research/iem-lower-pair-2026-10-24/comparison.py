from pathlib import Path
import json
from PIL import Image, ImageOps, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 23)
small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 19)
sheet = Image.new("RGB", (1800, 1460), "#e3e8eb")
draw = ImageDraw.Draw(sheet)
draw.text((28, 20), "IEM lower service pair | real reference, arrangement and model", font=font, fill="#17262f")
items = [
    ("Real IEM / PSU testing: NASA/JHUAPL/Ed Whitman",
     ROOT / "research/iem-2026-10-13/nasa-apl-psu-iem-testing.jpg", False),
    ("CAD arrangement only: NASA/APL TFAWS 2023, slide 3",
     ROOT / "research/sources/tfaws2023-thermal-controller/tfaws23-at-14-slide03.jpg", False),
    ("Before: lower pair beneath the completed upper pair",
     ROOT / "archive/iem-lower-pair-2026-10-24/before-lower.png", True),
    ("After: height-separated lower bends; estimates",
     HERE / "current-lower.png", True),
]
for i, (title, path, screenshot) in enumerate(items):
    x, y = 22 + (i % 2) * 890, 80 + (i // 2) * 655
    draw.rectangle((x, y, x + 864, y + 628), fill="white")
    draw.text((x + 12, y + 12), title, font=small, fill="#17262f")
    picture = Image.open(path).convert("RGB")
    if screenshot:
        picture = picture.crop((0, 58, picture.width - 14, picture.height))
    picture = ImageOps.contain(picture, (840, 570), Image.Resampling.LANCZOS)
    sheet.paste(picture, (x + (864 - picture.width) // 2, y + 49 + (570 - picture.height) // 2))
draw.text((28, 1408), "All 26 endpoints retained. Upper pair unchanged. Remaining 22 leads and actual flight wiring remain unresolved.", font=small, fill="#17262f")
sheet.save(HERE / "iem-lower-real-cad-before-after.jpg", quality=92)

# Screenshot crop lies within the mobile canvas, over the visible equipment.
mobile = Image.open(HERE / "installed-mobile.png").convert("RGB")
crop = mobile.crop((65, 80, 295, 315))
colors = crop.getcolors(crop.width * crop.height)
report = {"method": "saved mobile canvas screenshot crop, not a framebuffer readback",
          "cropPx": [65, 80, 295, 315], "uniqueColors": len(colors),
          "nonblank": len(colors) > 500}
assert report["nonblank"]
(HERE / "mobile-canvas-pixels.json").write_text(json.dumps(report, indent=2) + "\n")
