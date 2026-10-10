"""Prepare credited NASA/APL and Cassini imagery for the Mission backdrops.

The source URLs and adaptations are recorded in dist/assets/exterior/README.md.
Run after extracting the 9-second still from Dragonfly_landscape.mp4 with FFmpeg.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "research/backdrop-sources"
OUTPUT = ROOT / "dist/assets/exterior"
OUTPUT.mkdir(parents=True, exist_ok=True)

# Crop excludes the animated aircraft at the right, retaining the original terrain.
landscape = Image.open(SOURCE / "landscape-frame-9.png").convert("RGB")
landscape.crop((0, 0, 2520, 1080)).save(OUTPUT / "titan-dunes.jpg", quality=94, optimize=True)

# A modest display gamma lifts the dark ring detail without inventing surface features.
saturn = Image.open(SOURCE / "saturn-pia17474.jpg").convert("RGB")
saturn.thumbnail((1800, 1350), Image.Resampling.LANCZOS)
pixels = np.asarray(saturn, dtype=np.float32) / 255
saturn = Image.fromarray(np.uint8(np.clip(pixels ** 0.72 * 255, 0, 255)))
saturn.save(OUTPUT / "saturn-cassini.jpg", quality=94, optimize=True)

# Remove only the surrounding empty frame. The whole moon and blue haze remain.
titan = Image.open(SOURCE / "titan-pia17180.jpg").convert("RGB")
titan.crop((296, 296, 582, 582)).save(OUTPUT / "titan-halo.jpg", quality=95, optimize=True)
