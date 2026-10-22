from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root=Path(__file__).resolve().parents[2]
here=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
sheet=Image.new('RGB',(1800,1580),'#e7ecef')
draw=ImageDraw.Draw(sheet)
panels=[
    ('REAL: panel edge at the aft bulkhead',root/'research/lander-structure-2026/nasa-apl-top-deck-fit-check.jpg',(1540,1210,2800,2230),'NASA / Johns Hopkins APL / Ed Whitman. Appearance only.'),
    ('TECHNICAL CAD: body arrangement',root/'research/sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg',None,'Coker et al., ICES-2023-389 p5. Not fitting/layup evidence.'),
    ('MODEL: port panel, two camera reliefs',here/'port-after/model-inner.png',None,'0.254 mm faces. Reliefs and detailed construction estimated.'),
    ('MODEL: nose joint pair in context',here/'joints-after/nose-joint-context.png',None,'New estimated joints; existing bulkhead shown translucent.'),
    ('MODEL: canted aft joints in context',here/'joints-after/aft-joint-context.png',None,'Follows the existing 25-degree frame. Not flight joint CAD.'),
    ('APP: phone joint inspection',here/'joints-after/assembly-internal-390.png',None,'Separate joint masks; all 24 numbered parts remain unchanged.'),
]
for i,(title,path,crop,caption) in enumerate(panels):
    x,y=(i%2)*900,(i//2)*510
    draw.text((x+20,y+16),title,font=font,fill='#17242b')
    im=Image.open(path).convert('RGB')
    if crop:im=im.crop(crop)
    im=ImageOps.contain(im,(860,405))
    sheet.paste(im,(x+20+(860-im.width)//2,y+53+(405-im.height)//2))
    draw.text((x+20,y+470),caption,font=small,fill='#17242b')
draw.text((20,1540),'Codex / October 22, 2026. Educational installation estimates, not flight CAD. Original sources retained.',font=small,fill='#17242b')
sheet.save(here/'port-wall-joints-real-cad-model-comparison.jpg',quality=94)
