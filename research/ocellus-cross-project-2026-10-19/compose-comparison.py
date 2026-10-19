"""Lay out inspected source images; no generated or reconstructed hardware."""
from pathlib import Path
import textwrap

from PIL import Image, ImageDraw, ImageFont, ImageOps


HERE = Path(__file__).resolve().parent
RESEARCH = HERE.parent
SOURCES = RESEARCH / "sources"
FONT_DIR = Path("C:/Windows/Fonts")
FONT = ImageFont.truetype(str(FONT_DIR / "arial.ttf"), 25)
TITLE = ImageFont.truetype(str(FONT_DIR / "arialbd.ttf"), 40)
LABEL = ImageFont.truetype(str(FONT_DIR / "arialbd.ttf"), 28)
SHEET = Image.new("RGB", (2700, 1680), "#eef1f3")
DRAW = ImageDraw.Draw(SHEET)
DRAW.text((35, 20), "OCELLUS: CROSS-PROJECT EVIDENCE / PART 05 STILL OPEN", font=TITLE, fill="#17222b")
DRAW.text((35, 75), "Real related hardware, manufacturer imagery, identified CAD and unchanged app sample. Not an as-built reconstruction.", font=FONT, fill="#34434c")

PANELS = [
    (SOURCES / "nasa-sqrli2024-review/image8.png", None,
     "REAL RELATED HARDWARE: SQRLi",
     "NASA GSFC / Gill, 2024 cover. Related optics; NOT an identified complete Ocellus FEB."),
    (SOURCES / "ocellus-cross-project-lineage/spacecube-family-12.png", (1080, 480, 1965, 890),
     "REAL FAMILY HARDWARE: SpaceCube",
     "NASA GSFC / Brewer, 2019 p12 crop. v2.0 Mini shown; Ocellus generation NOT established."),
    (SOURCES / "ocellus-cross-project-lineage/diamond-micro-avim.jpg", None,
     "SUPPLIER PRODUCT: Micro AVIM",
     "DIAMOND SA, rights retained. Supplier names Ocellus mission interface; location/routing unknown."),
    (SOURCES / "nasa-optics2023-ocellus/ocellus-packaging-13.png", None,
     "IDENTIFIED OCELLUS CAD, NOT PHOTO",
     "NASA GSFC / Georgieva, 2023 p13. Packaging reference only; CAD colors are NOT verified coatings."),
    (SOURCES / "ocellus-cross-project-lineage/optotune-mirrors-2.png", None,
     "UNPROVEN LEAD: Optotune scanner",
     "Optotune brochure p2, rights retained. SQRLi procurement lead; NO direct Ocellus association found."),
    (RESEARCH / "nose-electronics-2026-10-19/ocellus-feb-closed.png", None,
     "UNCHANGED APP SAMPLE: FEB study",
     "Codex, existing 2023 nominal envelope / estimated housing. NOT a new model or a completed part."),
]

for index, (path, crop, title, caption) in enumerate(PANELS):
    x = 25 + (index % 3) * 895
    y = 130 + (index // 3) * 730
    DRAW.rectangle((x, y, x + 870, y + 705), fill="white", outline="#b9c2c8", width=2)
    DRAW.text((x + 16, y + 16), title, font=LABEL, fill="#17222b")
    with Image.open(path) as original:
        picture = original.convert("RGB")
    if crop:
        picture = picture.crop(crop)
    picture = ImageOps.contain(picture, (830, 525), Image.Resampling.LANCZOS)
    SHEET.paste(picture, (x + (870 - picture.width) // 2, y + 65 + (525 - picture.height) // 2))
    for line_number, line in enumerate(textwrap.wrap(caption, width=65)):
        DRAW.text((x + 16, y + 607 + 29 * line_number), line, font=FONT, fill="#34434c")

DRAW.text((35, 1620), "Original complete pages, credits, lineage matrix and limitations saved alongside this sheet. Codex / October 19, 2026.", font=FONT, fill="#34434c")
SHEET.save(HERE / "ocellus-cross-project-evidence.jpg", quality=93, subsampling=0)
