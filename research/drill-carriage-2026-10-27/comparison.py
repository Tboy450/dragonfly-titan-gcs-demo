"""Crops of credited source pages and the actual browser capture; no synthesis."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
base=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',21)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',17)
panels=[
 ('REAL / ETU SPHERICAL JOINT',base/'../sources/draco-ams2024/draco-ams2024-213.jpg',(190,180,720,590)),
 ('CAD / EM1 ROLLER ARRANGEMENT',base/'../sources/draco-ams2024/draco-ams2024-217.jpg',(450,175,930,615)),
 ('SIM / ISOLATED ACTUAL MESHES',base/'isolated-carriage.png',(505,250,790,490)),
]
out=Image.new('RGB',(1320,650),'#edf1f3');draw=ImageDraw.Draw(out)
for i,(title,path,crop) in enumerate(panels):
 x=i*440;draw.text((x+12,20),title,font=font,fill='#152634')
 picture=ImageOps.contain(Image.open(path).convert('RGB').crop(crop),(410,490))
 out.paste(picture,(x+(440-picture.width)//2,65+(490-picture.height)//2))
draw.text((15,585),'Sources: Adams / Dottinger / Corrigan, Honeybee Robotics, AMS2024 figs.6 and11; NASA proceedings.',font=small,fill='#253b4c')
draw.text((15,614),'Model dimensions/finish estimated. No flight CAD, needle internals, thread or joint-friction simulation.',font=small,fill='#253b4c')
out.save(base/'real-cad-model-comparison.jpg',quality=92)
