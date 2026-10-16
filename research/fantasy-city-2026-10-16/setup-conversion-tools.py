"""Prepare isolated official Python/Blender wheels for scene conversion. No system install."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent / "tools"
runtime = root / "python311"
packages = runtime / "packages"
runtime.mkdir(exist_ok=True)
packages.mkdir(exist_ok=True)

def unpack(archive, target):
    with zipfile.ZipFile(archive) as z:
        if z.testzip():
            raise ValueError(f"Corrupt archive: {archive.name}")
        for member in z.infolist():
            destination = (target / member.filename).resolve()
            if not destination.is_relative_to(target.resolve()):
                raise ValueError("Unexpected archive path")
        z.extractall(target)

unpack(root / "python-3.11.9-embed-amd64.zip", runtime)
wheels = list((root / "wheels").glob("*.whl"))
if not any(p.name.startswith("bpy-") for p in wheels):
    raise ValueError("Blender wheel download has not finished")
for wheel in wheels:
    unpack(wheel, packages)
(runtime / "python311._pth").write_text("python311.zip\n.\npackages\nimport site\n", encoding="utf-8")
print("Prepared isolated conversion runtime from official Python and PyPI wheels.")
