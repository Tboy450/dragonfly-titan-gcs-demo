"""Inspect/convert archived Blender scenes with automatic embedded scripts disabled.

Usage: tools/python311/python.exe convert-source-scene.py cyberpunk [--export]
The archived original is read only. Derived files go in the project research/browser folders.
"""
import argparse
import json
from pathlib import Path
import zipfile
import bpy
from mathutils import Vector

parser = argparse.ArgumentParser()
parser.add_argument("asset", choices=["cyberpunk", "drone"])
parser.add_argument("--export", action="store_true")
args = parser.parse_args()
here = Path(__file__).resolve().parent
library = Path(r"C:\Users\Heemi\Documents\Game Asset Library")
work = here / "converted-sources" / args.asset
work.mkdir(parents=True, exist_ok=True)
if args.asset == "cyberpunk":
    with zipfile.ZipFile(library / "cyberpunk-city.zip") as z:
        source = work / "original-scene.blend"
        if not source.exists():
            source.write_bytes(z.read("CITTA DEL FUTURO.blend"))
else:
    source = library / "drone-city.blend"

bpy.context.preferences.filepaths.use_scripts_auto_execute = False
bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False, use_scripts=False)
bpy.context.preferences.filepaths.use_scripts_auto_execute = False
objects = [o for o in bpy.context.scene.objects if o.type in ("MESH", "CURVE", "FONT", "SURFACE") and not o.hide_render]
depsgraph = bpy.context.evaluated_depsgraph_get()
triangles = 0
bounds = []
for obj in objects:
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    if mesh:
        mesh.calc_loop_triangles()
        triangles += len(mesh.loop_triangles)
        evaluated.to_mesh_clear()
    bounds += [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
report = {"asset": args.asset, "blender": bpy.app.version_string, "objects": len(objects), "triangles_evaluated": triangles, "bounds": [[min(p[i] for p in bounds), max(p[i] for p in bounds)] for i in range(3)], "images": [{"name": im.name, "size": list(im.size), "packed": bool(im.packed_file), "path": im.filepath} for im in bpy.data.images], "materials": len(bpy.data.materials), "scripts_auto_execute": False}
print(json.dumps(report, indent=2), flush=True)
(work / "inspection.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
if not args.export:
    raise SystemExit(0)

# Existing image data is resized only in this unsaved conversion session.
for image in bpy.data.images:
    w, h = image.size
    if max(w, h) > 1024 and image.type != "RENDER_RESULT":
        scale = 1024 / max(w, h)
        image.scale(max(1, round(w * scale)), max(1, round(h * scale)))

if args.asset == "cyberpunk":
    # The creator explicitly supplied untextured architecture. These are new PBR looks.
    palette = [(0.30, 0.43, 0.49, 1), (0.65, 0.70, 0.67, 1), (0.12, 0.22, 0.28, 1), (0.38, 0.48, 0.42, 1)]
    new_materials = []
    for i, color in enumerate(palette):
        material = bpy.data.materials.new(f"Swarmfall ceramic {i}")
        material.use_nodes = True
        bsdf = material.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Metallic"].default_value = .35
        bsdf.inputs["Roughness"].default_value = .48
        new_materials.append(material)
    for i, obj in enumerate(objects):
        if obj.type == "MESH":
            obj.data.materials.clear()
            obj.data.materials.append(new_materials[i % len(new_materials)])

def include_collections(layer):
    layer.exclude = False
    layer.hide_viewport = False
    for child in layer.children:
        include_collections(child)

include_collections(bpy.context.view_layer.layer_collection)
bpy.context.view_layer.update()
bpy.ops.object.select_all(action="DESELECT")
for obj in objects:
    obj.hide_viewport = False
    obj.hide_set(False)
    obj.select_set(True)
output = here.parent.parent / "dist/invasion/environments/assets/source-scenes"
output.mkdir(parents=True, exist_ok=True)
target = output / (args.asset + ".glb")
result = bpy.ops.export_scene.gltf(filepath=str(target), export_format="GLB", use_selection=True, export_apply=True, export_animations=False, export_cameras=False, export_lights=False, export_extras=False)
print(json.dumps({"result": list(result), "output": str(target), "bytes": target.stat().st_size}), flush=True)
