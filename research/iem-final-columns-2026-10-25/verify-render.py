import json
from pathlib import Path
from PIL import Image, ImageChops

root = Path(__file__).resolve().parents[2]
folder = Path(__file__).resolve().parent
rows = json.loads((folder / 'browser-checks.json').read_text())
images, results = {}, []
for row in rows:
    image = Image.open(root / 'tmp' / row['file']).convert('RGB')
    r = row['canvas']
    box = (int(r['x'] + 70), int(r['y'] + 80),
           int(r['x'] + r['width'] - 70), int(r['y'] + r['height'] - 80))
    crop = image.crop(box)
    pixels = list(crop.getdata())
    dark = sum(max(p) < 100 for p in pixels)
    green = sum(g > r * 1.3 and g > b * 1.3 for r, g, b in pixels)
    assert dark > 1000 if row['mode'] == 'Internal' else green > 1000
    assert row['client'] == row['scroll']
    images[(row['mode'], row['column'])] = crop
    results.append(dict(mode=row['mode'], column=row['column'], dark=dark, green=green))
differences = {}
for mode in ('Internal', 'Thermal'):
    diff = ImageChops.difference(images[(mode, 'iem-seventh-column')],
                                images[(mode, 'iem-eighth-column')])
    count = sum(max(p) > 8 for p in diff.getdata())
    assert count > 1000
    differences[mode] = count
(folder / 'render-checks.json').write_text(json.dumps(dict(cases=results, differences=differences), indent=2) + '\n')
print(json.dumps(dict(cases=results, differences=differences)))
