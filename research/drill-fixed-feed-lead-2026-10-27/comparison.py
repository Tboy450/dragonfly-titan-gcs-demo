"""Mechanical crops of a reused real photo and actual model/UI captures. No synthesis."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
base=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
panels=[
 ('REAL / EM1 DEVELOPMENT LEADS',base/'../sources/draco-ams2024/draco-ams2024-210.jpg',(550,760,865,1130)),
 ('SIM / FIXED LOCAL EXAMPLE',base/'isolated-covers-on.png',(480,120,890,590)),
 ('UI / PART 12 + OPEN INTERIOR',base/'numbered-selector.png',(335,155,915,705)),
]
out=Image.new('RGB',(1320,650),'#edf1f3');draw=ImageDraw.Draw(out)
for i,(title,path,crop) in enumerate(panels):
 x=i*440;draw.text((x+12,20),title,font=font,fill='#152634')
 pic=ImageOps.contain(Image.open(path).convert('RGB').crop(crop),(410,490))
 out.paste(pic,(x+(440-pic.width)//2,65+(490-pic.height)//2))
draw.text((15,585),'Source: Honeybee Robotics / Adams et al., AMS2024 fig.2; NASA proceedings. Model/UI: actual browser captures.',font=small,fill='#253b4c')
draw.text((15,615),'Lead exit, routing, diameter and retention are estimates. No confirmed flight circuit, cable count or remote endpoint.',font=small,fill='#253b4c')
out.save(base/'real-model-ui-comparison.jpg',quality=92)
