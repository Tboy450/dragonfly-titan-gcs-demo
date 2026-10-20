"""Lay out saved source images and actual model renders; no generated imagery."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
FONT = "C:/Windows/Fonts/arial.ttf"
sheet = Image.new("RGB", (1600, 1440), "#f3f5f6")
draw = ImageDraw.Draw(sheet)
title = ImageFont.truetype(FONT, 31)
heading = ImageFont.truetype(FONT, 23)
body = ImageFont.truetype(FONT, 19)
draw.text((30, 22), "Part 09 | RDE evidence and inspection sample", font=title, fill="#182b35")
draw.text((30, 68), "October 19, 2026 | PROVISIONAL casing: no appearance or dimension upgrade claimed", font=body, fill="#783b20")

def panel(x, y, label, image, lines):
    draw.text((x, y), label, font=heading, fill="#182b35")
    framed = ImageOps.contain(image.convert("RGB"), (740, 470))
    draw.rectangle((x, y + 40, x + 740, y + 510), fill="white")
    sheet.paste(framed, (x + (740 - framed.width) // 2, y + 40 + (470 - framed.height) // 2))
    for n, line in enumerate(lines):
        draw.text((x, y + 524 + 25 * n), line, font=body, fill="#34454e")

real = Image.open(ROOT / "research/rde-2026-10-15/caps2024-slide27.png")
# Keep the caption with the real test scene, not the unrelated large-chamber DTM.
real = real.crop((10, 185, 675, 860))
panel(30, 120, "REAL | RDE thermal-test scene (obscured)", real, [
    "Elizabeth Turtle / Johns Hopkins APL, CAPS 2024 slide 27.",
    "People, wiring and test fixtures obscure the module.",
    "This does not resolve the flight casing or installed fan layout."])
panel(830, 120, "CAD | Historical thermal layout, NOT a photo", Image.open(
    ROOT / "research/sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg"), [
    "Coker et al. / Johns Hopkins APL, ICES-2023-389 page 5.",
    "Thermal colors are temperatures, not material finishes.",
    "No manufacturing dimensions inferred from this rendering."])
panel(30, 770, "MODEL | Same estimated casings, individual focus", Image.open(
    HERE / "after/rde-pair-closed.png"), [
    "Actual Three.js render from the current simulator module.",
    "Both units retain every vertex, material and installed pose.",
    "Casing size, vents, count/layout of fans and connectors: EST."])
panel(830, 770, "PROCESS | Covers hidden (unmodeled electronics)", Image.open(
    HERE / "after/rde-pair-covers-hidden.png"), [
    "Existing illustrative fans remain; no circuit boards invented.",
    "Unmodeled space does NOT mean an empty flight enclosure.",
    "Initial-pass checklist remains 20/24; part 09 stays open."])
sheet.save(HERE / "rde-real-cad-model-comparison.jpg", quality=94)
