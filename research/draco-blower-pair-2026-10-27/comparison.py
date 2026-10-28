from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
here=Path(__file__).resolve().parent
root=here.parent.parent
out=Image.new('RGB',(1920,800),'#e7ecef')
d=ImageDraw.Draw(out)
font=lambda n:ImageFont.truetype('C:/Windows/Fonts/arial.ttf',n)
d.text((35,23),'Part 24 / DrACO blower: real hardware, layout reference and model',font=font(33),fill='#142e40')
panels=[
 ('REAL HARDWARE / appearance',Image.open(root/'research/sources/barber-nichols-draco-2026-10-27/engineering-models-original.png').crop((100,350,630,625)),['Barber-Nichols engineering model, June 2024.','No installed flight wiring or port ICD established.']),
 ('PUBLISHED THERMAL MODEL / layout only',Image.open(root/'research/draco-plumbing-2026-10-14/ices2023-fig2-blower-behind-port-arm.jpg'),['ICES-2023-389: one exposed port blower identified.','Not a photograph or proof of both installed poses.']),
 ('SIMULATOR SAMPLE / estimated details',Image.open(here/'single-unit.png').crop((330,310,930,630)),['Nominal 345 x168 mm reference; details estimated.','Installed adapters/pipes extend beyond unit envelope.'])]
for i,(title,img,lines) in enumerate(panels):
 x=25+i*635
 d.rounded_rectangle((x,96,x+610,755),radius=12,fill='white')
 d.text((x+18,116),title,font=font(22),fill='#142e40')
 img=ImageOps.contain(img.convert('RGB'),(575,465))
 out.paste(img,(x+int((610-img.width)/2),170+int((465-img.height)/2)))
 for j,line in enumerate(lines):d.text((x+18,666+j*30),line,font=font(20),fill='#243e4e')
d.text((35,770),'Credits: Barber-Nichols; NASA/APL thermal paper. Research copies and exact source links retained in project. Model: Codex (OpenAI).',font=font(18),fill='#243e4e')
out.save(here/'real-model-comparison.jpg',quality=94)
