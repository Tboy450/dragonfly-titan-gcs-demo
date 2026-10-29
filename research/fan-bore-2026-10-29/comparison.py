from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
out=Path(__file__).resolve().parent
root=out.parent.parent
im=Image.new('RGB',(1600,1130),'#f4f2ed');d=ImageDraw.Draw(im)
def font(n,b=False):return ImageFont.truetype('C:/Windows/Fonts/seguisb.ttf' if b else 'C:/Windows/Fonts/segoeui.ttf',n)
def text(x,y,s,n=23,b=False):d.text((x,y),s,font=font(n,b),fill='#17323d')
def place(pic,box):
 pic=ImageOps.contain(pic,(box[2]-box[0],box[3]-box[1]))
 im.paste(pic,(box[0]+(box[2]-box[0]-pic.width)//2,box[1]+(box[3]-box[1]-pic.height)//2))
text(38,22,'17 / circulation fans — open housing section',36,True)
text(40,72,'Inspection correction within retained envelopes; not a new flight fan identification.',22)
text(40,122,'REAL: NASA/APL thermal test module',25,True)
text(825,122,'PUBLISHED PLAN: arrangement / scale context',25,True)
source=Image.open(root/'research/sources/tfaws2024-dtm/tfaws2024-at-02-slide05.jpg')
place(source.crop((1465,192,1878,506)),(40,167,770,490))
place(Image.open(root/'research/thermal-loop-2026-10-14/tfaws2023-slide3-plan-view-ducting-fans.jpg'),(825,167,1550,490))
text(40,503,'Development article; not a detailed flight-fan photo.',20)
text(825,503,'TFAWS 2023 schematic; not an appearance source.',20)
text(40,556,'BEFORE: solid housing end caps',26,True)
text(825,556,'AFTER: open bore and retained rotor',26,True)
for name,x in [('before.png',40),('after.png',825)]:
 pic=Image.open(out/name);place(pic.crop((40,110,960,605)),(x,605,x+730,1000))
text(40,1030,'Generic 115 mm bore is EST; existing seven blades, motor and installed pose retained.',22)
text(40,1068,'Credits: NASA/Johns Hopkins APL, TFAWS 2023/2024. Model samples: actual project WebGL.',20)
im.save(out/'fan-real-plan-before-after.jpg',quality=94)
