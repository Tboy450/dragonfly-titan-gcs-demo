"""Mechanical crops of the real source and actual WebGL mesh captures; no synthesis."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
base=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',21)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',17)
panels=[
 ('REAL / EM1 COVERED DRIVE',base/'../sources/draco-ams2024/draco-ams2024-210.jpg',(620,875,825,1130)),
 ('SIM / COVERS ON',base/'isolated-drive-covers-on.png',(450,120,890,590)),
 ('SIM / COVERS OFF / ESTIMATES',base/'isolated-drive-covers-off.png',(450,120,890,590)),
]
out=Image.new('RGB',(1320,650),'#edf1f3');draw=ImageDraw.Draw(out)
for i,(title,path,crop) in enumerate(panels):
 x=i*440;draw.text((x+12,20),title,font=font,fill='#152634')
 pic=ImageOps.contain(Image.open(path).convert('RGB').crop(crop),(410,490))
 out.paste(pic,(x+(440-pic.width)//2,65+(490-pic.height)//2))
draw.text((15,585),'Source: Adams / Dottinger / Corrigan, Honeybee Robotics, AMS2024 fig.2; NASA proceedings.',font=small,fill='#253b4c')
draw.text((15,614),'Fitted mounting and shaft envelopes are estimates. Actual U-joint forks/gears and flight load path remain unknown.',font=small,fill='#253b4c')
out.save(base/'real-model-comparison.jpg',quality=92)
