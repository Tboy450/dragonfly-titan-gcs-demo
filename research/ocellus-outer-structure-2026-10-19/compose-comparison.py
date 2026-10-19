"""Compose existing real references, CAD and actual app captures with explicit labels."""
from pathlib import Path
import textwrap
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
RESEARCH = HERE.parent
FONT = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 24)
LABEL = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 26)
TITLE = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 38)
sheet = Image.new("RGB", (2700, 1670), "#eef1f3")
draw = ImageDraw.Draw(sheet)
draw.text((30, 18), "PART 05 / OCELLUS: APPROVED OUTER-STRUCTURE APPROXIMATION", font=TITLE, fill="#17222b")
draw.text((30, 70), "Related real hardware for construction; identified NASA CAD for scale/layout. NOT photo-matched flight units.", font=FONT, fill="#34434c")
panels = [
    (RESEARCH / "sources/nasa-sqrli2024-review/image8.png", None,
     "REAL RELATED: SQRLi prototype", "NASA GSFC / Gill, 2024. Related construction only; NOT an Ocellus FEB photo."),
    (RESEARCH / "nose-electronics-2026-10-19/nasa-kodiak-heritage-not-ocellus.jpg", None,
     "REAL HERITAGE: Kodiak", "NASA / W. Hrybyk, 2018. Heritage context, NOT Ocellus housing dimensions or flight finish."),
    (RESEARCH / "sources/nasa-mss2023-ocellus/mss2023-page06.png", (.39,.15,1,.53),
     "IDENTIFIED CAD: NASA Ocellus", "NASA / Amzajerdian, 2023 p6 crop. Historical design envelopes; CAD colors are not materials."),
    (HERE / "ocellus-meb-closed.png", None,
     "ACTUAL MODEL: MEB estimate", "Codex. Nominal 2023 envelope; structure, details, finish and installation remain estimates."),
    (HERE / "ocellus-feb-closed.png", None,
     "ACTUAL MODEL: FEB estimate", "Codex. Outer receiver/collimator housings only; no detailed optics, boards or harness invented."),
    (HERE / "ocellus-feb-cover-hidden.png", None,
     "PROCESS: FEB caps removed", "Codex. Unmodeled interiors, NOT verified hollow hardware. Independent covers/casings/mounts."),
]
for i, (path, crop, label, caption) in enumerate(panels):
    x, y = 25 + (i % 3) * 895, 125 + (i // 3) * 730
    draw.rectangle((x, y, x+870, y+705), fill="white", outline="#b9c2c8", width=2)
    draw.text((x+16, y+16), label, font=LABEL, fill="#17222b")
    with Image.open(path) as source:
        picture = source.convert("RGB")
    if crop:
        w, h = picture.size
        picture = picture.crop(tuple(round(v * (w if j % 2 == 0 else h)) for j, v in enumerate(crop)))
    picture = ImageOps.contain(picture, (830, 520), Image.Resampling.LANCZOS)
    sheet.paste(picture, (x+(870-picture.width)//2, y+65+(520-picture.height)//2))
    for line, text in enumerate(textwrap.wrap(caption, 66)):
        draw.text((x+16, y+605+29*line), text, font=FONT, fill="#34434c")
draw.text((30, 1615), "Initial pass 20/24. Existing MIMUs and installation unchanged. Originals, rejected drafts, sources and tests retained. Codex / Oct 19, 2026.", font=FONT, fill="#34434c")
sheet.save(HERE / "ocellus-real-cad-model-comparison.jpg", quality=94, subsampling=0)
