"""Read supplier HTML as data; print only the relevant original image references."""
import json
import urllib.request
from html.parser import HTMLParser

class Images(HTMLParser):
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "img" and any(name in str(data) for name in ("honeybee-post-image", "BNCP-74-000")):
            print(json.dumps({key: data[key] for key in ("src", "srcset", "alt", "width", "height") if key in data}))

for url in (
    "https://barber-nichols.com/barber-nichols-blower-will-ride-on-nasas-dragonfly-rotorcraft-to-saturns-moon-titan/",
    "https://barber-nichols.com/cryogenic-compressors-blowers/",
):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    Images().feed(urllib.request.urlopen(request, timeout=30).read().decode("utf-8"))
