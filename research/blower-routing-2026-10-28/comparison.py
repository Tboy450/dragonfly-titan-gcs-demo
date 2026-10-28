from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
p=Path(__file__).resolve().parent
sheet=Image.new('RGB',(1480,590),'#e5e9eb');d=ImageDraw.Draw(sheet)
font=lambda n:ImageFont.truetype('C:/Windows/Fonts/arial.ttf',n)
d.text((24,18),'Part 24 / same blower equipment, corrected tube routing',font=font(29),fill='#172b39')
for i,(file,title) in enumerate([('before.png','BEFORE / long unsupported-looking loops'),('after.png','AFTER / compact rigid runs and retention clips')]):
 x=20+i*740
 d.text((x,75),title,font=font(22),fill='#172b39')
 photo=Image.open(p/file).crop((132,188,1132,778)).convert('RGB').resize((700,413),Image.Resampling.LANCZOS)
 sheet.paste(photo,(x,111))
d.text((24,544),'Both installations are estimates. Unit exteriors, poses, selector and upstream sample routes are unchanged.',font=font(20),fill='#172b39')
sheet.save(p/'before-after.jpg',quality=94)
