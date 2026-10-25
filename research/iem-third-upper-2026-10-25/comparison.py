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

sheet = Image.new('RGB', (1800, 1430), '#e3e8eb')
draw = ImageDraw.Draw(sheet)
draw.text((28, 20), 'IEM third-column upper pair | real hardware, CAD context and actual model', font=FONT, fill='#17262f')
panel(sheet, 22, 75, 'Real IEM testing: NASA / JHUAPL / Ed Whitman', ROOT / 'research/iem-middle-lead-2026-10-25/real-iem-testing-crop.jpg')
panel(sheet, 912, 75, 'NASA / APL CAD: arrangement only, not cable routing', ROOT / 'research/sources/tfaws2023-thermal-controller/tfaws23-at-14-slide03.jpg')
panel(sheet, 22, 710, 'Before: seven reviewed routes, third upper pair unreviewed', HERE / 'before.png', True)
panel(sheet, 912, 710, 'After: leads 8/9 refined; full IEM, all columns visible', HERE / 'current.png', True)
draw.text((28, 1360), 'All 26 endpoints and every unrelated mesh preserved. Nine local routes reviewed; 17 remain.', font=SMALL, fill='#17262f')
draw.text((28, 1390), 'Installation estimates, not flight routing. The inherited terminal bundle still has unresolved overlaps.', font=SMALL, fill='#17262f')
sheet.save(HERE / 'iem-real-cad-model-comparison.jpg', quality=93)

sheet = Image.new('RGB', (1800, 1430), '#e3e8eb')
draw = ImageDraw.Draw(sheet)
draw.text((28, 20), 'Third-column upper pair | actual model geometry and scale', font=FONT, fill='#17262f')
for x, y, title, file in [(22, 75, 'Complete current IEM', 'current.png'), (912, 75, 'Side view', 'side.png'),
                          (22, 710, 'Lead 8 support', 'lead-8-support.png'), (912, 710, 'Lead 9 support and attached label', 'lead-9-support.png')]:
    panel(sheet, x, y, title, HERE / file, True)
draw.text((28, 1360), 'Two estimated supports and four ties added. Both completed columns remain exact and present.', font=SMALL, fill='#17262f')
draw.text((28, 1390), 'Support construction, attachment, cable type, qualified bend radius and actual circuits remain unverified.', font=SMALL, fill='#17262f')
sheet.save(HERE / 'iem-installation-details.jpg', quality=93)
