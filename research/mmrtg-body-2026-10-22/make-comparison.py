"""Lay out credited source crops and actual Three.js renders; no generated imagery."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FONT = "C:/Windows/Fonts/arial.ttf"
BOLD = "C:/Windows/Fonts/arialbd.ttf"
canvas = Image.new("RGB", (1800, 1720), "#f3f5f5")
draw = ImageDraw.Draw(canvas)
draw.text((38, 26), "MMRTG / PHOTO-REFERENCED GENERATOR EXTERIOR", font=ImageFont.truetype(BOLD, 36), fill="#132c35")
draw.text((38, 78), "NASA 64 x 66 cm envelope | detailed profile and Dragonfly finish estimated | original mounting pose retained", font=ImageFont.truetype(FONT, 23), fill="#364d56")

def panel(x, y, image, title, caption, crop=None):
    im = Image.open(image).convert("RGB")
    if crop:
        im = im.crop(crop)
    draw.rounded_rectangle((x, y, x + 842, y + 476), radius=6, fill="white", outline="#c8d1d4")
    draw.text((x + 18, y + 12), title, font=ImageFont.truetype(BOLD, 23), fill="#153943")
    im = ImageOps.contain(im, (804, 335))
    canvas.paste(im, (x + 421 - im.width // 2, y + 52 + (335 - im.height) // 2))
    for i, line in enumerate(caption):
        draw.text((x + 18, y + 397 + i * 26), line, font=ImageFont.truetype(FONT, 20), fill="#3b515a")

src = ROOT / "research/sources/nasa-mmrtg-hardware"
panel(38, 125, src / "PIA23306.jpg", "REAL HARDWARE / NASA PIA23306",
      ["Mars2020 MMRTG before fueling/testing, NASA/DOE at INL.",
       "Pale fins, root attachments and end features; related unit."], (260, 110, 600, 560))
panel(920, 125, src / "cataldo-bennett-p15.png", "CGI / HISTORICAL TECHNICAL CUTAWAY",
      ["Cataldo/Bennett, NASA NTRS 20120000731, p.15, fig.12; DOE.",
       "Structure names and overall envelope; hidden internals not modeled."], (150, 155, 1250, 985))
panel(38, 625, ROOT / "archive/mmrtg-body-2026-10-22/before/internal-1440.png", "BEFORE / actual archived generator model",
      ["Dark 40 cm housing, thick rectangular fins and broad collar.",
       "Original files, baseline pictures and recovery tag retained."])
panel(920, 625, HERE / "after/model-threequarter.png", "AFTER / actual Three.js model",
      ["Narrower pale housing, eight thin fins, root tabs and metal ends.",
       "Detailed dimensions, coating and fastener pattern remain estimated."])
panel(38, 1125, HERE / "after/model-mount.png", "AFTER / mounting end and radiator roots",
      ["Fixed bulkhead pose; independent casing/cover/mount/interface masks.",
       "No shipping fixture, hidden fuel or thermoelectric internals drawn."])
panel(920, 1125, HERE / "after/assembly-internal-390.png", "APP SAMPLE / phone generator inspection",
      ["MMRTG body is an unnumbered inspection option.",
       "The original 24 callouts and sensor21's physical size are preserved."])
draw.text((38, 1630), "Original photo, full technical page, before/current samples and checks are preserved in the project.",
          font=ImageFont.truetype(FONT, 22), fill="#2e4852")
draw.text((38, 1664), "Codex / 22 October 2026 | Exterior geometry pass; Thermal retains the existing modeled gas temperature.",
          font=ImageFont.truetype(FONT, 21), fill="#2e4852")
canvas.save(HERE / "mmrtg-real-cad-model-comparison.jpg", quality=94)
