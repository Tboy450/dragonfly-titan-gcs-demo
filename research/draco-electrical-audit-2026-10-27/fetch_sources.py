"""Archive the exact supplier-published images already observed in the page HTML."""
from pathlib import Path
import hashlib
import json
import urllib.request

target=Path(__file__).resolve().parent/'../sources/barber-nichols-draco-2026-10-27'
items=[
 ("engineering-models-original.png","https://barber-nichols.com/wp-content/uploads/2024/06/honeybee-post-image.png","Supplier composite: real EM hardware in lower/right panels, artist concept upper-left. Hardware panels only for appearance."),
 ("bncp74-catalog-original.jpg","https://barber-nichols.com/wp-content/uploads/2024/08/BNCP-74-000-extend-background-fotor-20240508144122-e1723148279452.jpg","Supplier product/background-edited image; outline reference, not an installed flight photo."),
]
records=[]
for name,url,scope in items:
    data=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=30).read()
    (target/name).write_bytes(data)
    records.append({"file":name,"url":url,"credit":"Barber-Nichols","scope":scope,"sha256":hashlib.sha256(data).hexdigest()})
(target/'source-images.json').write_text(json.dumps({"recordedDate":"2026-10-27","images":records},indent=2)+"\n",encoding="utf-8")
print(json.dumps([{"file":r["file"],"sha256":r["sha256"]} for r in records]))
