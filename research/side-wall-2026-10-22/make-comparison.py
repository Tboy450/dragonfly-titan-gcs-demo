from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(__file__).resolve().parents[2]
here = Path(__file__).resolve().parent
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
sheet = Image.new('RGB', (1800, 1580), '#e7ecef')
draw = ImageDraw.Draw(sheet)
panels = [
    ('REAL: May2026 flight structure', root/'research/rotor-heads-2026-10-15/nasa-apl-lander-frame-tap-test-2026-05.jpg', (930,750,2670,1570), 'NASA / Johns Hopkins APL / Ed Whitman. Real hardware.'),
    ('TECHNICAL CAD: arrangement only', root/'research/sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg', None, 'Coker et al., ICES-2023-389 p5. Not appearance evidence.'),
    ('MODEL: new outer aluminum face', here/'after/model-outer.png', None, 'Published0.254mm faces; outline and detail estimated.'),
    ('MODEL: edge fittings and camera relief', here/'after/model-edge.png', None, '12mm separation estimated. Core cells not reconstructed.'),
    ('APP: layered inspection on desktop', here/'after/assembly-internal-1440.png', None, 'Separate outer/inner/edge targets; original24 numbers retained.'),
    ('APP: phone inspection', here/'after/assembly-internal-390.png', None, 'Existing parts unchanged; layer masks restore installed positions.'),
]
for i, (title, path, crop, caption) in enumerate(panels):
    x, y = (i % 2)*900, (i // 2)*510
    draw.text((x+20,y+16),title,font=font,fill='#17242b')
    im = Image.open(path).convert('RGB')
    if crop: im=im.crop(crop)
    im=ImageOps.contain(im,(860,405))
    sheet.paste(im,(x+20+(860-im.width)//2,y+53+(405-im.height)//2))
    draw.text((x+20,y+470),caption,font=small,fill='#17242b')
draw.text((20,1540),'Codex / October22,2026. Educational approximation, not flight CAD. Original sources retained in project.',font=small,fill='#17242b')
sheet.save(here/'side-wall-real-cad-model-comparison.jpg',quality=94)
