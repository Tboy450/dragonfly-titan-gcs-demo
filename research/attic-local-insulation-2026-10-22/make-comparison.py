from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
root=Path(__file__).resolve().parents[2]
here=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
sheet=Image.new('RGB',(1800,2080),'#e7ecef');d=ImageDraw.Draw(sheet)
panels=[
 ('REAL: insulation test hardware',root/'research/sources/nasa-foam-2025/dragoncam-insulation-test.png','Johns Hopkins APL / Justin Artis. Not installed flight tiling.'),
 ('DESIGN CAD: insulation / attic arrangement',root/'research/sources/nasa-foam-2025/nesc-2026-slide3.png','NASA NESC / Rolando Rodarte / APL. CAD, not a photograph.'),
 ('MODEL: attic roof region hidden',here/'after/model-attic-open.png','Original outer surface retained; inner construction unmodeled.'),
 ('MODEL: whole-vehicle Open interior preset',here/'after/open-interior.png','Enclosing layers hidden; installed equipment and connections retained.'),
 ('REAL: HGA arm / mechanism context',root/'research/hga-actuators-2026-10-14/apl-hga-arm-2026-07.jpg','NASA / Johns Hopkins APL / Ed Whitman. Not hidden dome foam.'),
 ('MODEL: upper HGA dome surface hidden',here/'after/model-hga-open.png','Existing mechanism/outer geometry; estimated inspection split.'),
 ('MODEL: Microscopic Camera window surround',here/'after/model-microscope.png','Estimated local rim and relief; not a complete flight foam blister.'),
 ('MODEL: Down Camera window surround',here/'after/model-down-camera.png','3 mm window meets actual model surface; local details estimated.'),
]
for i,(title,p,caption) in enumerate(panels):
 x,y=(i%2)*900,(i//2)*510
 d.text((x+20,y+16),title,font=font,fill='#17242b')
 im=ImageOps.contain(Image.open(p).convert('RGB'),(860,405));sheet.paste(im,(x+20+(860-im.width)//2,y+53+(405-im.height)//2))
 d.text((x+20,y+470),caption,font=small,fill='#17242b')
d.text((20,2045),'Codex / October 22-23, 2026. Educational inspection assets, not flight CAD or a validated thermal model.',font=small,fill='#17242b')
sheet.save(here/'attic-local-real-cad-model-comparison.jpg',quality=94)
