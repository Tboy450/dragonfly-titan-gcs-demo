from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root=Path(__file__).resolve().parents[2]
here=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
sheet=Image.new('RGB',(1800,1580),'#e7ecef')
draw=ImageDraw.Draw(sheet)
panels=[
    ('REAL: top-deck fit check',root/'research/lander-structure-2026/nasa-apl-top-deck-fit-check.jpg',None,'NASA / Johns Hopkins APL / Ed Whitman. Not flight CAD.'),
    ('TECHNICAL CAD: internal arrangement',root/'research/sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg',None,'Coker et al., ICES-2023-389 p5. Layout, not surface finish.'),
    ('MODEL: deck, opening and foundation examples',here/'after/model-upper.png',None,'Published face thickness; outline, depth and details estimated.'),
    ('MODEL: underside with TWTA context',here/'after/underside-context.png',None,'Existing equipment translucent; mounting plane unchanged.'),
    ('MODEL: HGA / attic-edge context',here/'after/upper-context.png',None,'Opening clears existing dome; lip is not a thermal bulkhead.'),
    ('APP: phone inspection',here/'after/assembly-internal-390.png',None,'Three focuses, four part masks, separate global deck mask.'),
]
for i,(title,path,crop,caption) in enumerate(panels):
    x,y=(i%2)*900,(i//2)*510
    draw.text((x+20,y+16),title,font=font,fill='#17242b')
    im=Image.open(path).convert('RGB')
    if crop:im=im.crop(crop)
    im=ImageOps.contain(im,(860,405));sheet.paste(im,(x+20+(860-im.width)//2,y+53+(405-im.height)//2))
    draw.text((x+20,y+470),caption,font=small,fill='#17242b')
draw.text((20,1540),'Codex / October 22, 2026. Educational approximation, not flight structure or a validated thermal/strength model.',font=small,fill='#17242b')
sheet.save(here/'top-deck-real-cad-model-comparison.jpg',quality=94)
