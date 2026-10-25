from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FONT = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 24)
SMALL = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 19)

def panel(sheet, x, y, title, path, render=False, size=(864, 610)):
    draw = ImageDraw.Draw(sheet)
    draw.rectangle((x, y, x + size[0], y + size[1]), fill='white')
    draw.text((x + 14, y + 12), title, font=SMALL, fill='#17262f')
    picture = Image.open(path).convert('RGB')
    if render:
        picture = picture.crop((0, 75, picture.width - 14, min(735, picture.height)))
    picture = ImageOps.contain(picture, (size[0] - 24, size[1] - 58), Image.Resampling.LANCZOS)
    sheet.paste(picture, (x + (size[0] - picture.width) // 2, y + 48 + (size[1] - 58 - picture.height) // 2))

source = ROOT / 'research/iem-2026-10-13/nasa-apl-psu-iem-testing.jpg'
Image.open(source).crop((690, 435, 1040, 805)).save(HERE / 'real-iem-testing-crop.jpg', quality=94)
sheet = Image.new('RGB', (1800, 1430), '#e3e8eb')
draw = ImageDraw.Draw(sheet)
draw.text((28, 20), 'IEM middle lead | real evidence, dimensional context and actual model', font=FONT, fill='#17262f')
panel(sheet, 22, 75, 'Real testing crop: NASA / JHUAPL / Ed Whitman', HERE / 'real-iem-testing-crop.jpg')
panel(sheet, 912, 75, 'NASA / APL CAD: arrangement only, not cable routing', ROOT / 'research/sources/tfaws2023-thermal-controller/tfaws23-at-14-slide03.jpg')
panel(sheet, 22, 710, 'Before: overlapping legacy middle lead', HERE / 'before.png', True)
panel(sheet, 912, 710, 'After: separated estimated route; original scale and endpoints', HERE / 'current.png', True)
draw.text((28, 1360), 'Only lead 6, its attached label and new fittings change. Terminal bundle overlaps remain unresolved.', font=SMALL, fill='#17262f')
draw.text((28, 1390), 'Geometry estimate, not flight routing or a qualified cable design. Credits and limits: README.md.', font=SMALL, fill='#17262f')
sheet.save(HERE / 'iem-real-cad-model-comparison.jpg', quality=93)

sheet = Image.new('RGB', (1800, 800), '#e3e8eb')
draw = ImageDraw.Draw(sheet)
draw.text((28, 20), 'IEM middle-lead service route | before and after', font=FONT, fill='#17262f')
panel(sheet, 22, 75, 'Before', HERE / 'before.png', True)
panel(sheet, 912, 75, 'After: new separated bend, label, support and two ties', HERE / 'current.png', True)
draw.text((28, 725), 'All 26 endpoints and every unrelated mesh remain fixed. Five routes reviewed; 21 still open.', font=SMALL, fill='#17262f')
draw.text((28, 758), 'The inherited terminal gathering zone is not claimed collision-free. Installation is illustrative.', font=SMALL, fill='#17262f')
sheet.save(HERE / 'iem-before-after.jpg', quality=93)
