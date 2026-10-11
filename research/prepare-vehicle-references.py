"""Make compact, unretouched web copies of the preserved APL reference media."""
import argparse
from pathlib import Path
import subprocess

from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("--ffmpeg", default="ffmpeg")
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
source = root / "research/apl-spacecraft-models"
output = root / "dist/assets/vehicle-references"
output.mkdir(parents=True, exist_ok=True)

with Image.open(source / "FullPayload.png") as image:
    image.convert("RGB").save(output / "payload-cutaway.webp", quality=92, method=6)
with Image.open(source / "cad-first-frame.png") as image:
    image = image.convert("RGB")
    image.thumbnail((960, 540), Image.Resampling.LANCZOS)
    image.save(output / "cad-poster.webp", quality=90, method=6)
subprocess.run([
    args.ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
    "-i", str(source / "Dragonfly_2024_RotatingCADmodel_ver3-slower.mp4"),
    "-vf", "scale=960:-2,fps=24", "-c:v", "libx264", "-preset", "slow",
    "-crf", "25", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    str(output / "cad-rotation.mp4"),
], check=True)
for file in sorted(output.glob("*")):
    if file.suffix != ".md":
        print(f"{file.name}: {file.stat().st_size:,} bytes")
