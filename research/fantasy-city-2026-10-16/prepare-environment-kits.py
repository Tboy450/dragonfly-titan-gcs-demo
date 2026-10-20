"""Copy the modular CC0 kit pieces the Environment Lab assembles into buildings and streets.

Second preparation step (Claude, October 16, 2026), after Codex's
prepare-environment-assets.py. Original archives stay unchanged in the owner's
Game Asset Library; this writes browser copies under dist/invasion/environments/assets/.

- Downtown City MegaKit (Quaternius, CC0): every modular glTF piece from the free Standard
  edition (walls, windows, corners, cornices, roofs, doors, streets, sidewalks, props) into
  assets/downtown-kit/, sharing one texture folder. Textures are reduced to 512 px, as before.
- Fantasy Town Kit 2.0 (Kenney, CC0): every GLB model into assets/fantasy-kit/ with its
  colormap texture.

Run with the project's Python (needs Pillow): python prepare-environment-kits.py
"""
import json
import pathlib
import shutil
import zipfile
from io import BytesIO

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
TARGET = PROJECT / "dist/invasion/environments/assets"
DOWNTOWN = pathlib.Path(r"C:\Users\Heemi\Documents\Game Asset Library\downtown-city-megakit-standard.zip")
KENNEY = HERE / "kenney/Models/GLB format"
# Whole prebuilt buildings are already copied by the first step (assets/downtown/).
SKIP = {"Building_Large_2", "Building_Medium_2_001", "Building_Small_1"}


def safe_name(uri):
    if pathlib.PurePosixPath(uri).name != uri:
        raise ValueError(f"Unexpected nested path in a glTF reference: {uri}")
    return uri


def prepare_downtown():
    dest = TARGET / "downtown-kit"
    dest.mkdir(parents=True, exist_ok=True)
    prefix = "Exports/glTF (Godot)/"
    pieces, images, total = [], set(), 0
    with zipfile.ZipFile(DOWNTOWN) as archive:
        names = sorted(n[len(prefix):-5] for n in archive.namelist()
                       if n.startswith(prefix) and n.endswith(".gltf") and "/" not in n[len(prefix):])
        for name in names:
            if name in SKIP:
                continue
            gltf = json.loads(archive.read(prefix + name + ".gltf"))
            (dest / f"{name}.gltf").write_text(json.dumps(gltf), encoding="utf-8")
            for buffer in gltf.get("buffers", []):
                data = archive.read(prefix + safe_name(buffer["uri"]))
                (dest / buffer["uri"]).write_bytes(data)
                total += len(data)
            images.update(safe_name(image["uri"]) for image in gltf.get("images", []))
            pieces.append(name)
        for name in sorted(images):
            image = Image.open(BytesIO(archive.read(prefix + name)))
            image.thumbnail((512, 512), Image.Resampling.LANCZOS)
            image.save(dest / name)
        (dest / "LICENSE.txt").write_bytes(archive.read("License_Standard.txt"))
    (dest / "pieces.json").write_text(json.dumps(pieces, indent=1), encoding="utf-8")
    print(f"Downtown kit: {len(pieces)} pieces, {total / 1e6:.1f} MB geometry, {len(images)} textures")


def prepare_fantasy():
    dest = TARGET / "fantasy-kit"
    dest.mkdir(parents=True, exist_ok=True)
    models = sorted(path.stem for path in KENNEY.glob("*.glb"))
    for name in models:
        shutil.copy2(KENNEY / f"{name}.glb", dest / f"{name}.glb")
    shutil.copytree(KENNEY / "Textures", dest / "Textures", dirs_exist_ok=True)
    shutil.copy2(HERE / "kenney/License.txt", dest / "LICENSE.txt")
    (dest / "pieces.json").write_text(json.dumps(models, indent=1), encoding="utf-8")
    print(f"Fantasy kit: {len(models)} models")


if __name__ == "__main__":
    prepare_downtown()
    prepare_fantasy()
