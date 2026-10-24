from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(__file__).resolve().parents[2]
here = Path(__file__).resolve().parent
canvas = Image.new('RGB', (1600, 1330), '#e5ecef')
draw = ImageDraw.Draw(canvas)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)
panels = [
    ('REAL: DraMS integration, including test setup', root/'research/drams-detail-2026-10-20/photo-crop-drams.png', None,
     'NASA / Mike Guinto. Appearance reference, not flight wiring topology.'),
    ('CAD: warm/cold arrangement, not a circuit map', root/'research/sources/scitech2024-sdc-drams-interface/scitech2024-p03.jpg', (.18,.32,.87,.66),
     'Barfknecht et al., NASA GSFC / Aerodyne, SciTech 2024, fig. 2.'),
    ('BEFORE: existing short wire example', root/'archive/attic-connection-media-2026-10-23/before/wire.png', (0,.08,1,.94),
     'Original endpoints retained. Ghosted enclosure is inspection styling.'),
    ('MODEL: slack, lacing and enclosure support', here/'model-wire.png', (0,.08,1,.94),
     'Installation estimate; no flight mating or cable qualification claim.'),
]
for i, (title, source, crop, credit) in enumerate(panels):
    x, y = 20+(i % 2)*800, 20+(i // 2)*620
    draw.text((x,y), title, font=font, fill='#152d3b')
    im = Image.open(source).convert('RGB')
    if crop:
        im = im.crop(tuple(int(v*(im.width if j % 2 == 0 else im.height)) for j,v in enumerate(crop)))
    im = ImageOps.contain(im, (760,520), Image.Resampling.LANCZOS)
    canvas.paste(im, (x+(760-im.width)//2, y+40+(520-im.height)//2))
    draw.text((x,y+570), credit, font=small, fill='#263d49')
draw.text((20,1270), 'Codex / October 23, 2026. Eight local line examples audited; electrical, tubing and unclassified controls separated.', font=small, fill='#263d49')
draw.text((20,1300), 'Instrument hardware and carousel unchanged. Full attic trunk, drive leads and electrical feedthrough remain unresolved.', font=small, fill='#263d49')
canvas.save(here/'attic-lines-real-cad-before-after.jpg', quality=93)
