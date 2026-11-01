"""Arrange downloaded research screenshots; no generative image service is used."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
font_path = Path('C:/Windows/Fonts/segoeui.ttf')
title = ImageFont.truetype(str(font_path), 27)
label = ImageFont.truetype(str(font_path), 19)
small = ImageFont.truetype(str(font_path), 15)
sheet = Image.new('RGB', (1400, 1410), '#0d1523')
draw = ImageDraw.Draw(sheet)
draw.text((24, 18), 'SWARMFALL / CITY REFERENCE COMPARISON', font=title, fill='#f1f4fa')
draw.text((24, 58), 'Scale, architecture and layout references. These screenshots are not reusable game assets.', font=small, fill='#aeb9ce')
entries = [
    ('spiderman-manhattan.jpg', 'Spider-Man / continuous city fabric', 'Dense blocks, rooftop detail, skyline landmarks'),
    ('minecraft-greenfield.jpg', 'Minecraft / Greenfield scale', 'Neighborhoods, highways and rail; no voxel look requested'),
    ('skyrim-solitude.png', 'Skyrim / Solitude fantasy districts', 'Stone, timber, winding streets and cliffside bridges'),
    ('crackdown-skyline.png', 'Crackdown / vertical city', 'Illuminated landmarks and elevated routes (2014 trailer)'),
    ('kakarot-west-city.jpg', 'Kakarot / West City', 'Rounded towers, domes, green spaces and tube transport'),
    ('kakarot-world-map.jpg', 'Kakarot / regional world map', 'Cities inside varied terrain; image has no physical scale bar'),
]
for i, (name, heading, caption) in enumerate(entries):
    x, y = 24 + (i % 2) * 690, 106 + (i // 2) * 424
    with Image.open(root / 'references' / name) as source:
        panel = ImageOps.contain(source.convert('RGB'), (662, 322))
    sheet.paste(panel, (x + (662 - panel.width) // 2, y + (322 - panel.height) // 2))
    draw.text((x, y + 332), heading, font=label, fill='#d6e4ff')
    draw.text((x, y + 362), caption, font=small, fill='#aeb9ce')
draw.text((24, 1380), 'Sources and rights-holder notes: research/fantasy-city-2026-10-16/README.md', font=small, fill='#aeb9ce')
sheet.save(root / 'reference-comparison.jpg', quality=90)
