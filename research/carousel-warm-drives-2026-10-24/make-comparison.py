from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
photo = Image.open(ROOT / "research/carousel-2026-10-12/nasa-carousel-integration.jpg")
w, h = photo.size
crop = photo.crop((int(w * .53), int(h * .72), int(w * .98), h))
crop.save(HERE / "nasa-warm-drive-crop.jpg", quality=95)
cad = Image.open(ROOT / "research/sources/scitech2024-sdc-drams-interface/scitech2024-p03.jpg")
cad = cad.crop((170, 405, 920, 895))
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 23)
small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 19)
sheet = Image.new("RGB", (1800, 1400), "#f0f3f5")
draw = ImageDraw.Draw(sheet)
panels = [
    (crop, "REAL: NASA/Mike Guinto, SVS15003", "Warm-side hardware; fixture/test cabling is not flight routing."),
    (cad, "CAD: NASA GSFC/Aerodyne, SciTech2024 Fig.2", "Warm actuators below cold carousel; not a dimensioned motor drawing."),
    (Image.open(ROOT / "archive/carousel-warm-drives-2026-10-24/before-drives.png"), "BEFORE: simplified drive examples", "Nominal can sizes and three centers retained, not flight measurements."),
    (Image.open(HERE / "model-drives.png"), "AFTER: local installation estimates", "Separate cases/caps/mounts/leads. Bus and controller mating unresolved."),
]
for i, (picture, title, caption) in enumerate(panels):
    x, y = (i % 2) * 900, (i // 2) * 700
    draw.text((x + 22, y + 18), title, fill="#172b35", font=font)
    if i > 1:
        picture = picture.crop((0, 58, picture.width, min(picture.height, 710)))
    fit = ImageOps.contain(picture.convert("RGB"), (856, 575))
    sheet.paste(fit, (x + 22 + (856 - fit.width) // 2, y + 60 + (575 - fit.height) // 2))
    draw.text((x + 22, y + 651), caption, fill="#334853", font=small)
sheet.save(HERE / "carousel-drives-real-cad-before-after.jpg", quality=94)
