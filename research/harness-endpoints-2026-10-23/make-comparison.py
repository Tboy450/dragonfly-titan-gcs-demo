from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(__file__).resolve().parents[2]
here = Path(__file__).resolve().parent
canvas = Image.new('RGB', (1600, 1330), '#e5ecef')
draw = ImageDraw.Draw(canvas)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)
panels = [
    ('REAL: flight-fuselage wiring', root/'research/main-harness-2026-10-21/photo-crop-bay-harness.jpg', None,
     'NASA / Johns Hopkins APL / Ed Whitman. Appearance only; no circuit map.'),
    ('CAD: lower-camera arrangement', root/'research/sources/dragoncam-2026/dragoncam-p03.jpg', (.10, .23, .90, .475),
     'Clark et al. / MSSS, 2026, fig. 3. CAD, not hardware photograph.'),
    ('BEFORE: omitted port-camera branch', root/'archive/lower-camera-harness-2026-10-23/before/port.png', (0, .08, 1, .94),
     'Exact prior harness; camera leads present but branch absent.'),
    ('MODEL: port bypass and corrected joins', here/'model-port.png', (0, .08, 1, .94),
     'Amber is review highlighting. Hardware/wall translucent for inspection.'),
]
for index, (title, source, crop, credit) in enumerate(panels):
    x = 20 + (index % 2)*800
    y = 20 + (index // 2)*620
    draw.text((x, y), title, font=font, fill='#152d3b')
    image = Image.open(source).convert('RGB')
    if crop:
        image = image.crop(tuple(int(v * (image.width if j % 2 == 0 else image.height)) for j, v in enumerate(crop)))
    image = ImageOps.contain(image, (760, 520), Image.Resampling.LANCZOS)
    canvas.paste(image, (x+(760-image.width)//2, y+40+(520-image.height)//2))
    draw.text((x, y+570), credit, font=small, fill='#263d49')
draw.text((20, 1270), 'Codex / October 23, 2026. Routing/support estimates; geometric joins do not establish flight electrical mating.', font=small, fill='#263d49')
draw.text((20, 1300), 'No equipment moved. Main trunk/other routes unchanged. Actual sources and original/rejected models retained.', font=small, fill='#263d49')
canvas.save(here/'lower-camera-real-cad-before-after.jpg', quality=93)
