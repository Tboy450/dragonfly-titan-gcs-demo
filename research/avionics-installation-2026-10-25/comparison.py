from pathlib import Path
import json
from PIL import Image, ImageOps, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FONT = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 23)
SMALL = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
REFERENCES = {
    "iem": ("IEM", "research/iem-2026-10-13/nasa-apl-psu-iem-testing.jpg",
            "Real testing: NASA/JHUAPL/Ed Whitman",
            "research/sources/tfaws2023-thermal-controller/tfaws23-at-14-slide03.jpg",
            "NASA/APL CAD arrangement only; not cable routing"),
    "power-units": ("PSUs", "research/power-units-2026-10-13/psu-detail-crop.jpg",
                    "Real testing crop: NASA/JHUAPL/Ed Whitman",
                    "research/sources/tfaws2023-thermal-controller/tfaws23-at-14-slide03.jpg",
                    "NASA/APL CAD arrangement only; PSU2 location estimated"),
    "frontier-radio": ("Frontier radio", "research/frontier-radio-2026-10-13/nasa-apl-frontier-radio.jpg",
                       "Real Frontier hardware: Johns Hopkins APL",
                       "research/sources/patent-us8417859-jhu-sdr/us8417859-p02.jpg",
                       "JHU patent: architecture only, not flight installation"),
    "nose-electronics": ("Navigation", "research/sources/honeywell-mimu-2026/honeywell-mimu-product.png",
                         "Honeywell MIMU family hardware; not exact Dragonfly variant",
                         "research/sources/honeywell-mimu-2026/honeywell-mimu-2.png",
                         "Honeywell family CAD/dimensions; not hidden flight internals"),
    "battery": ("Battery", "research/battery-2026-10-15/ices2022-fig11-test-module-photo.jpg",
                "Real sub-scale thermal module: APL, ICES2022",
                "research/battery-2026-10-15/ices2022-fig2-module-crop.jpg",
                "APL test-module CAD; not a flight-pack drawing"),
}


def panel(sheet, x, y, title, path, screenshot=False, size=(864, 628)):
    draw = ImageDraw.Draw(sheet)
    draw.rectangle((x, y, x + size[0], y + size[1]), fill="white")
    draw.text((x + 12, y + 12), title, font=SMALL, fill="#17262f")
    picture = Image.open(path).convert("RGB")
    if screenshot:
        picture = picture.crop((0, 58, picture.width - 14, picture.height))
    picture = ImageOps.contain(picture, (size[0] - 24, size[1] - 60), Image.Resampling.LANCZOS)
    sheet.paste(picture, (x + (size[0] - picture.width) // 2,
                         y + 48 + (size[1] - 60 - picture.height) // 2))


for key, (name, photo, credit, context, context_label) in REFERENCES.items():
    sheet = Image.new("RGB", (1800, 1460), "#e3e8eb")
    draw = ImageDraw.Draw(sheet)
    draw.text((28, 20), name + " | reference, dimensional context, before and installation detail",
              font=FONT, fill="#17262f")
    panel(sheet, 22, 80, credit, ROOT / photo)
    panel(sheet, 912, 80, context_label, ROOT / context)
    panel(sheet, 22, 735, "Before: complete prior model", ROOT / "archive/avionics-installation-2026-10-25" / ("before-" + key + ".png"), True)
    panel(sheet, 912, 735, "Current close-up: installation estimate at unchanged model scale", HERE / ("detail-" + key + ".png"), True)
    draw.text((28, 1408), "No prior cable paths or hardware moved. Fittings are estimates, not identified flight hardware.", font=SMALL, fill="#17262f")
    sheet.save(HERE / (key + "-real-context-model.jpg"), quality=92)

sheet = Image.new("RGB", (1800, 2080), "#e3e8eb")
draw = ImageDraw.Draw(sheet)
draw.text((28, 20), "Five-family installation details | actual model geometry, estimated fittings", font=FONT, fill="#17262f")
for i, (key, row) in enumerate(REFERENCES.items()):
    panel(sheet, 22 + i % 2 * 890, 80 + i // 2 * 650, row[0],
          HERE / ("detail-" + key + ".png"), True)
draw.text((930, 1450), "10 cable supports / 6 lacing examples", font=FONT, fill="#17262f")
draw.text((930, 1490), "Navigation: 16 retention heads + 8 washers", font=SMALL, fill="#17262f")
draw.text((930, 1530), "All original cable paths and equipment retained", font=SMALL, fill="#17262f")
draw.text((930, 1570), "IEM middle-column support and flight wiring open", font=SMALL, fill="#17262f")
sheet.save(HERE / "five-family-detail-sheet.jpg", quality=92)

phones = Image.new("RGB", (1950, 920), "#e3e8eb")
draw = ImageDraw.Draw(phones)
checks = []
for i, (key, row) in enumerate(REFERENCES.items()):
    path = HERE / ("mobile-model-" + key + ".png")
    if not path.exists():
        continue
    picture = Image.open(path).convert("RGB")
    crop = picture.crop((45, 70, 320, 330))
    colors = crop.getcolors(crop.width * crop.height)
    checks.append({"family": key, "method": "saved mobile canvas screenshot crop",
                   "cropPx": [45, 70, 320, 330], "uniqueColors": len(colors),
                   "nonblank": len(colors) > 500})
    draw.text((i * 390 + 12, 12), row[0], font=SMALL, fill="#17262f")
    picture = ImageOps.contain(picture, (375, 860), Image.Resampling.LANCZOS)
    phones.paste(picture, (i * 390 + 8, 45))
if checks:
    assert all(row["nonblank"] for row in checks)
    phones.save(HERE / "mobile-model-sheet.jpg", quality=90)
    (HERE / "mobile-canvas-checks.json").write_text(json.dumps(checks, indent=2) + "\n")
