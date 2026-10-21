"""Compose original credited references and actual old/new Three.js renders."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sheet = Image.new("RGB", (1600, 1400), "#f3f5f6")
draw = ImageDraw.Draw(sheet)
font = lambda size: ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
draw.text((30, 20), "RDE connector installation | service loops and independent wire layers", font=font(29), fill="#18303a")
draw.text((30, 66), "Estimated detail on an approved approximation, NOT an identified flight wiring reconstruction.", font=font(20), fill="#76391e")

def panel(x, y, label, source, lines):
    draw.text((x, y), label, font=font(23), fill="#18303a")
    image = ImageOps.contain(Image.open(source).convert("RGB"), (740, 450))
    draw.rectangle((x, y + 40, x + 740, y + 490), fill="white")
    sheet.paste(image, (x + (740 - image.width) // 2, y + 40 + (450 - image.height) // 2))
    for i, line in enumerate(lines):
        draw.text((x, y + 504 + i * 25), line, font=font(19), fill="#334650")

panel(30, 120, "REAL | Flight-fuselage wiring context", ROOT / "research/main-harness-2026-10-21/photo-crop-bay-harness.jpg", [
    "NASA / Johns Hopkins APL / Ed Whitman, September2026.",
    "Silver looped bundles and lacing; exact RDE routes unresolved.",
    "Not a photograph of the two modeled controller connections."])
panel(830, 120, "CAD | Historical thermal layout, NOT wire geometry", ROOT / "research/sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg", [
    "Coker et al. / Johns Hopkins APL, ICES2023 page5.",
    "Layout context only. Colors are temperatures, not finishes.",
    "No actual connector routes or slack dimensions derived."])
panel(30, 750, "BEFORE | Claude's approved approximation", ROOT / "archive/rde-service-loops-2026-10-21/before/rde-pair-closed.png", [
    "Actual archived module render from baseline5f9e1bb.",
    "Short leads shared the Interfaces visibility layer.",
    "Enclosures, fins, plugs and mounting poses retained below."])
panel(830, 750, "AFTER | Four estimated slack bows and lacing", HERE / "after/rde-pair-closed.png", [
    "Actual current module render; no generated artwork.",
    "Wire-only layer separate from plugs/vents; endpoints preserved.",
    "Not flight routing or bend-radius qualification. Count22/24."])
sheet.save(HERE / "rde-real-cad-before-after.jpg", quality=94)
