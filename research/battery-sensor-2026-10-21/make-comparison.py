"""Lay out credited source crops and actual Three.js renders; no generated imagery."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FONT = "C:/Windows/Fonts/arial.ttf"
BOLD = "C:/Windows/Fonts/arialbd.ttf"
canvas = Image.new("RGB", (1800, 1720), "#f3f5f5")
draw = ImageDraw.Draw(canvas)
draw.text((38, 26), "20 / BATTERY TEMPERATURE SENSOR", font=ImageFont.truetype(BOLD, 36), fill="#132c35")
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

src = ROOT / "research/sources/te44909-family"
panel(38, 125, src / "te-44909-1.png", "REAL HARDWARE / TE 44909 product photograph",
      ["TE / Measurement Specialties, TESS-ANDO-DS0059 Rev A, p.1.",
       "Related space-thermistor family; no Dragonfly adoption established."], (85, 240, 410, 495))
panel(920, 125, src / "te-44909-2.png", "DIMENSION DRAWING / manufacturer reference",
      ["TE DS0059 p.2: 2.4 mm maximum bead, leads >= 3 inches.",
       "The drawing does not define full depth or installed geometry."], (90, 470, 860, 810))
panel(38, 625, ROOT / "research/battery-2026-10-15/ices2022-fig2-module-crop.jpg",
      "CAD / APL battery thermal-test module",
      ["Balakrishnan et al., ICES-2022-256, fig.2. Test-module context.",
       "This CAD does not identify the flight sensor or its sensing point."])
panel(920, 625, HERE / "after/sensor-macro.png", "ACTUAL MODEL / bead and local lead exits",
      ["Black/gray family appearance; 2.4 mm maximum envelope.",
       "Estimated bond pad/profile. Macro crop; long leads continue off-frame."])
panel(38, 1125, HERE / "after/sensor-installation.png", "ACTUAL MODEL / complete local installation",
      ["Two 76.2 mm leads; estimated adhesive tacks and bends.",
       "Unconnected ends indicate unmodeled routing. Not a flight pinout."])
panel(920, 1125, HERE / "after/battery-sensor-head-internal-360.png", "APP SAMPLE / phone macro inspection",
      ["Camera magnification preserves the tiny physical dimensions.",
       "Casings, Mounts and Harnesses remain independently selectable."])
draw.text((38, 1630), "Saved originals, prior annotation, first finish draft, sources and acceptance checks are preserved in the project.",
          font=ImageFont.truetype(FONT, 22), fill="#2e4852")
draw.text((38, 1664), "Codex / 21 October 2026 | Educational geometry; existing bulk battery-temperature simulation unchanged.",
          font=ImageFont.truetype(FONT, 21), fill="#2e4852")
canvas.save(HERE / "battery-sensor-real-cad-model-comparison.jpg", quality=94)
