"""Identify the related Honeybee sensor paper; never transfer its sensors to DrACO."""
from pathlib import Path
import urllib.request
from pypdf import PdfReader
url="https://www.tighecosta.com/_files/ugd/8865be_78ab5b9dc0f34c1897151e60748e2ae1.pdf"
target=Path("tmp/pdfs/related-sample-handling-system.pdf")
target.write_bytes(urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=30).read())
reader=PdfReader(target)
print("FIRST PAGE\n"+reader.pages[0].extract_text()[:4200])
for index,page in enumerate(reader.pages):
    text=page.extract_text() or ""
    if "1024" in text or "limit switch" in text.lower():
        print("SENSOR PAGE",index+1)
        pos=text.find("1024")
        print(text[max(0,pos-250):pos+650])
