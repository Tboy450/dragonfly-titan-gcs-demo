from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root=Path(__file__).resolve().parents[2]
here=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
sheet=Image.new('RGB',(1800,1580),'#e7ecef')
draw=ImageDraw.Draw(sheet)
panels=[
    ('REAL: insulation test segment',root/'research/sources/nasa-foam-2025/dragoncam-insulation-test.png','Johns Hopkins APL / Justin Artis. Test hardware, not flight tiling.'),
    ('CAD + DESIGN: foam overview, slide 3',root/'research/sources/nasa-foam-2025/nesc-2026-slide3.png','NASA NESC / Rolando Rodarte / APL. CAD, not a hardware photo.'),
    ('BEFORE: combined body / cross-bay seam boxes',root/'archive/body-foam-2026-10-22/before/assembly-internal-1440.png','Previous app representation; archived unchanged.'),
    ('MODEL: unchanged outer body, five surface regions',here/'after/model-upper.png','Broad inspection boundaries; not flight tile cuts or foam volume.'),
    ('MODEL: top region hidden',here/'after/model-peeled.png','Open view exposes unmodeled space, not hollow flight construction.'),
    ('APP: phone inspection',here/'after/assembly-internal-390.png','Five focuses and surface masks. All 24 numbered parts preserved.'),
]
for i,(title,path,caption) in enumerate(panels):
    x,y=(i%2)*900,(i//2)*510
    draw.text((x+20,y+16),title,font=font,fill='#17242b')
    im=ImageOps.contain(Image.open(path).convert('RGB'),(860,405))
    sheet.paste(im,(x+20+(860-im.width)//2,y+53+(405-im.height)//2))
    draw.text((x+20,y+470),caption,font=small,fill='#17242b')
draw.text((20,1540),'Codex / October 22, 2026. Educational surface inspection; local thickness, encapsulation and tile map remain unmodeled.',font=small,fill='#17242b')
sheet.save(here/'body-foam-real-cad-model-comparison.jpg',quality=94)
