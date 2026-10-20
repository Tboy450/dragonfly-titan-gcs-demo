"""Compose cited originals and a real Three.js render, without generating assets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
canvas = Image.new("RGB", (1600, 1430), "#f4f6f7")
draw = ImageDraw.Draw(canvas)
font = lambda size: ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
draw.text((30, 20), "Part 20 | Battery-temperature measurement annotation", font=font(30), fill="#172d35")
draw.text((30, 66), "NOT a reconstructed flight sensor. Package, mounting point and physical sensor count remain unknown.", font=font(20), fill="#783820")

def panel(x, y, label, source, lines):
    draw.text((x, y), label, font=font(23), fill="#172d35")
    image = ImageOps.contain(Image.open(source).convert("RGB"), (740, 470))
    draw.rectangle((x, y + 40, x + 740, y + 510), fill="white")
    canvas.paste(image, (x + (740 - image.width) // 2, y + 40 + (470 - image.height) // 2))
    for n, line in enumerate(lines):
        draw.text((x, y + 522 + n * 25), line, font=font(19), fill="#334a52")

panel(30, 120, "REAL | Ground-test battery module, not flight sensors", ROOT / "research/battery-2026-10-15/ices2022-fig10a-test-module-photo.jpg", [
    "Balakrishnan et al. / Johns Hopkins APL, ICES2022 fig.10A.",
    "Real test leads/tape; a nine-cell thermal test article.",
    "Individual flight sensing packages cannot be identified here."])
panel(830, 120, "CAD | Battery test-module arrangement ONLY", ROOT / "research/battery-2026-10-15/ices2022-fig2-module-crop.jpg", [
    "Balakrishnan et al. / Johns Hopkins APL, ICES2022 fig.2.",
    "Historical test-module CAD, not a hardware photograph.",
    "No flight sensor shape or mounting inferred from this view."])
panel(30, 770, "DIAGRAM | Published battery-temperature input", ROOT / "research/sources/tfaws2023-battery-feedback/tfaws2023-07.jpg", [
    "Holtzman / Castano, APL, TFAWS2023 slide7.",
    "A control-system input, not an identified sensor assembly.",
    "Historical pre-decisional design; model controller unchanged."])
panel(830, 770, "MODEL | Open target replaces intersecting sphere", HERE / "after/battery-context.png", [
    "Actual render; small green crosshair is a viewing annotation.",
    "Location/size illustrative; one target does not mean one sensor.",
    "Battery and part21 unchanged; part20 remains unchecked."])
canvas.save(HERE / "battery-real-cad-model-comparison.jpg", quality=94)
