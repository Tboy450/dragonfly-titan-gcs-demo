from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
out=Path(__file__).resolve().parent
im=Image.new('RGB',(1600,810),'#f4f2ed');d=ImageDraw.Draw(im)
def f(n,b=False):return ImageFont.truetype('C:/Windows/Fonts/seguisb.ttf' if b else 'C:/Windows/Fonts/segoeui.ttf',n)
def text(x,y,s,n=23,b=False):d.text((x,y),s,font=f(n,b),fill='#17323d')
text(40,25,'18 / fan-side duct connection',36,True)
text(40,80,'Actual model views; estimated shell and attachment, not an identified flight coupling.',22)
for label,name,x in [('BEFORE: solid cap / 7 mm gap','before.png',40),('AFTER: open shell / seated flange plane','after.png',825)]:
 text(x,136,label,24,True)
 pic=Image.open(out/name).crop((70,70,930,670));pic=ImageOps.contain(pic,(735,505));im.paste(pic,(x+(735-pic.width)//2,185+(505-pic.height)//2))
text(40,710,'Generic 1.5 mm wall + 16 mm throat; original fans and simulation retained.',23)
text(40,753,'Real DTM photos and plan/section references reused from the source packet; no new synthetic reference.',19)
im.save(out/'transition-before-after.jpg',quality=94)
