"""Copy selected CC0 runtime derivatives; keep original archives unchanged."""
import json
import pathlib
import shutil
import tarfile
import zipfile
from io import BytesIO
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
TARGET = PROJECT / "dist/invasion/environments/assets"
TARGET.mkdir(parents=True, exist_ok=True)
vendor = PROJECT / "dist/vendor/three/addons"
with tarfile.open(HERE / "three-0.180.0.tgz") as t:
    for rel in ["loaders/GLTFLoader.js", "utils/BufferGeometryUtils.js", "controls/OrbitControls.js"]:
        data = t.extractfile("package/examples/jsm/" + rel).read()
        dest = vendor / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.read_bytes() != data:
            raise ValueError(f"Existing vendor file differs: {dest}")
        dest.write_bytes(data)

pack = pathlib.Path(r"C:\Users\Heemi\Documents\Game Asset Library\downtown-city-megakit-standard.zip")
models = ["Building_Large_2", "Building_Medium_2_001", "Building_Small_1", "Prop_ACUnit", "Prop_Planter_Single"]
dest = TARGET / "downtown"
dest.mkdir(exist_ok=True)
with zipfile.ZipFile(pack) as z:
    prefix = "Exports/glTF (Godot)/"
    images = set()
    for name in models:
        j = json.loads(z.read(prefix + name + ".gltf"))
        print(name, "triangles", sum(j['accessors'][p['indices']]['count']//3 for m in j['meshes'] for p in m['primitives']))
        (dest / (name + ".gltf")).write_text(json.dumps(j), encoding="utf-8")
        for b in j.get("buffers", []):
            if pathlib.PurePosixPath(b["uri"]).name != b["uri"]:
                raise ValueError("Unexpected external buffer path")
            (dest / b["uri"]).write_bytes(z.read(prefix + b["uri"]))
        images.update(i["uri"] for i in j.get("images", []))
    for name in images:
        if pathlib.PurePosixPath(name).name != name:
            raise ValueError("Unexpected external image path")
        im = Image.open(BytesIO(z.read(prefix + name)))
        im.thumbnail((512, 512), Image.Resampling.LANCZOS)
        im.save(dest / name)
    (dest / "LICENSE.txt").write_bytes(z.read("License_Standard.txt"))

kenney = HERE / "kenney/Models/GLB format"
names = ["wall-wood-window-shutters", "wall-wood-door", "wall-wood", "roof-high", "roof-high-gable", "roof-high-point", "tree-high", "fountain-round-detail", "banner-green"]
dest = TARGET / "fantasy"
dest.mkdir(exist_ok=True)
for name in names:
    shutil.copy2(kenney / (name + ".glb"), dest / (name + ".glb"))
if (kenney / "Textures").exists():
    shutil.copytree(kenney / "Textures", dest / "Textures", dirs_exist_ok=True)
shutil.copy2(HERE / "kenney/License.txt", dest / "LICENSE.txt")
print("Prepared selected CC0 derivatives and official three.js r180 addons.")
