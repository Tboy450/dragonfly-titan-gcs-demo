"""Lay out credited source crops and actual Three.js renders; no generated imagery."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FONT = "C:/Windows/Fonts/arial.ttf"
BOLD = "C:/Windows/Fonts/arialbd.ttf"
canvas = Image.new("RGB", (1800, 1720), "#f3f5f5")
draw = ImageDraw.Draw(canvas)
draw.text((38, 26), "21 / MMRTG FIN-ROOT RTD EXAMPLE", font=ImageFont.truetype(BOLD, 36), fill="#132c35")
draw.text((38, 78), "Reference-family approximation | real scale | Dragonfly package and installation unconfirmed", font=ImageFont.truetype(FONT, 23), fill="#364d56")

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

src = ROOT / "research/sources/omega-rtd-family"
panel(38, 125, src / "omega-4.png", "REAL HARDWARE / Omega F2020 catalog photo",
      ["Omega OMEGAFILM catalog, C-118. Promotional photo retouching.",
       "2 x 2 mm element; no Dragonfly/RTG adoption established."], (110, 950, 665, 1200))
panel(920, 125, src / "omega-3.png", "DIMENSION DRAWING / manufacturer reference",
      ["Omega catalog C-117: 2 x 2 x 0.8 mm, two 10 mm leads.",
       "Class B catalog band -70 to +500 C covers the 157 C rating."], (400, 870, 825, 1105))
panel(38, 625, src / "omega-3.png", "CGI / CONSTRUCTION ILLUSTRATION",
      ["Omega catalog C-117: ceramic, platinum film and glass structure.",
       "Illustration only. Hidden circuit pattern is not reconstructed."], (730, 270, 1285, 560))
panel(920, 625, HERE / "after/sensor-macro.png", "ACTUAL MODEL / ceramic and blue glass",
      ["Nominal package size; coating proportions and bond are estimates.",
       "Macro crop; paired leads continue beyond the frame."])
panel(38, 1125, HERE / "after/sensor-installation.png", "ACTUAL MODEL / complete local installation",
      ["Two 10 mm leads; estimated curved bond and local bends.",
       "Unconnected ends indicate unmodeled routing and destination."])
panel(920, 1125, HERE / "after/fin-root-rtd-element-internal-360.png", "APP SAMPLE / phone macro inspection",
      ["Camera magnification preserves the tiny physical dimensions.",
       "Casings, Mounts and Harnesses remain independently selectable."])
draw.text((38, 1630), "Saved originals, Claude's previous annotation, sources and acceptance checks are preserved in the project.",
          font=ImageFont.truetype(FONT, 22), fill="#2e4852")
draw.text((38, 1664), "Codex / 21 October 2026 | Educational geometry; Thermal retains modeled generator gas temperature.",
          font=ImageFont.truetype(FONT, 21), fill="#2e4852")
canvas.save(HERE / "fin-root-real-cad-model-comparison.jpg", quality=94)
