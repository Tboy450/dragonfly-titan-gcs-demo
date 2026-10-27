"""Mechanical crops/composition of original sources and actual browser capture. No synthesis."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
base=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',17)
panels=[
 ('REAL EM1 HARDWARE / 2024',base/'../sources/draco-ams2024/draco-ams2024-210.jpg',(120,750,1280,1560)),
 ('CAD / 2022 MECHANICS ONLY',base/'../sources/draco-lpsc2022/lpsc2022-1069-p02.jpg',(140,560,595,975)),
 ('SIM / ESTIMATED MOVING LEADS',base/'port-extended.png',(540,235,705,490)),
]
out=Image.new('RGB',(1320,650),'#edf1f3');draw=ImageDraw.Draw(out)
for i,(title,path,crop) in enumerate(panels):
 x=i*440;draw.text((x+15,20),title,font=font,fill='#152634')
 picture=ImageOps.contain(Image.open(path).convert('RGB').crop(crop),(410,500))
 out.paste(picture,(x+(440-picture.width)//2,65+(500-picture.height)//2))
draw.text((15,590),'Credits: Honeybee Robotics / Adams et al. 2024; Zacny et al. 2022; simulator capture: Codex.',font=small,fill='#253b4c')
draw.text((15,617),'Photo does not establish complete flight wiring. Cable routes, clips and round envelopes remain estimates.',font=small,fill='#253b4c')
out.save(base/'real-cad-model-comparison.jpg',quality=92)
