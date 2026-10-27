"""Compose source/model/scale evidence; no generated or retouched hardware."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
data = json.loads((HERE / 'measurements.json').read_text())
canvas = Image.new('RGB', (1440, 900), '#101e29')
d = ImageDraw.Draw(canvas)
font_path = 'C:/Windows/Fonts/segoeui.ttf'
font = ImageFont.truetype(font_path, 22)
small = ImageFont.truetype(font_path, 19)
title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 31)

def text(x, y, value, f=font, color='#e0edf2'):
    d.multiline_text((x,y), value, font=f, fill=color, spacing=8)

text(30,22,'DrACO blower evidence audit | current asset needs a scale rebuild',title)
text(30,76,'Real supplier hardware, unchanged simulator meshes, and a conservative dimension screen.',small)
for x in (20,495,970):
    d.rounded_rectangle((x,120,x+450,860),12,fill='#1b303f')
text(38,138,'REAL SUPPLIER HARDWARE')
photo = Image.open(ROOT/'research/sources/barber-nichols-draco-2026-10-27/bncp74-catalog-original.jpg')
photo = ImageOps.contain(photo,(422,330))
canvas.paste(photo,(34,200+(330-photo.height)//2))
text(38,565,'Barber-Nichols BNCP-74-000\n345 mm long × 168 mm diameter\n2.83 kg | up to 25,000 rpm',small)
text(38,700,'Supplier product photo; background\nextended/edited by supplier.\nNot an installed flight photograph.\nCredit: Barber-Nichols.',small)

text(513,138,'CURRENT MODEL / UNCHANGED')
model = Image.open(HERE/'current-placeholder.png').crop((420,150,850,535))
model = ImageOps.contain(model,(422,360))
canvas.paste(model,(509,185))
text(513,565,'Existing pair: compact volute shapes.\nFull axial span: 117.5 mm per unit.\nCasing span: 79.3 mm.\nNo housing rebuilt in this pass.',small)
text(513,735,'New app disclosure records the mismatch.\nElectrical interfaces remain unresolved.\nNo invented sensors or wires added.',small)

text(988,138,'SAME SCALE / NOT FLIGHT FIT')
scale = 1.0
for y, label, mm, color in (
    (240,'Supplier length',345,'#72d9ee'),
    (335,'Current full Y span',117.5,'#f4c67e'),
    (455,'Supplier diameter',168,'#72d9ee'),
    (550,'Current casing span',79.3,'#f4c67e')):
    text(988,y-38,f'{label}: {mm:g} mm',small)
    d.rectangle((990,y,990+mm*scale,y+23),fill=color)
text(988,640,'Current center spacing: 85 mm.\nParallel 168 mm cylinders would\noverlap by 83 mm at those centers.',small)
text(988,750,'Envelope screen only: cone shape and\nflight orientation not established.\nNOT actual solid-collision proof.',small)
canvas.save(HERE/'blower-real-current-scale-comparison.jpg',quality=93)
