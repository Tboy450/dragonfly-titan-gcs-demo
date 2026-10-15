import sys
sys.path.insert(0, "C:/Users/Heemi/AppData/Local/Temp/claude/C--Users-Heemi-OneDrive-Documents-ChatGPT-Nasa-dragonfly/1e40e9d2-db40-497e-b305-c0c476295378/scratchpad")
from edit_util import edit

edit("dist/battery.mjs", [
("""  const cream = new THREE.MeshStandardMaterial({ color: 0xe7e0cb, roughness: 0.6, metalness: 0.15 });""",
 """  const cream = new THREE.MeshStandardMaterial({ color: 0xd6ceb5, roughness: 0.7, metalness: 0.1 });
  const creamRib = new THREE.MeshStandardMaterial({ color: 0xf0ebdc, roughness: 0.5, metalness: 0.15 });"""),
("""    for (let i = 0; i <= 4; i += 1) box([0.012, lowH, 0.008], [-W / 2 + 0.006 + i * (W - 0.012) / 4, lowMid, s * (D / 2 + 0.004)], cream, covers, "battery-wall-rib");
    for (const y of [E.bottom + 0.006, lowMid, E.split - 0.006]) box([W, 0.012, 0.008], [0, y, s * (D / 2 + 0.004)], cream, covers, "battery-wall-rib");
    for (let i = 0; i <= 2; i += 1) box([0.008, lowH, 0.012], [s * (W / 2 + 0.004), lowMid, -D / 2 + 0.006 + i * (D - 0.012) / 2], cream, covers, "battery-wall-rib");
    for (const y of [E.bottom + 0.006, lowMid, E.split - 0.006]) box([0.008, 0.012, D], [s * (W / 2 + 0.004), y, 0], cream, covers, "battery-wall-rib");""",
"""    for (let i = 0; i <= 4; i += 1) box([0.014, lowH, 0.012], [-W / 2 + 0.007 + i * (W - 0.014) / 4, lowMid, s * (D / 2 + 0.006)], creamRib, covers, "battery-wall-rib");
    for (const y of [E.bottom + 0.007, lowMid, E.split - 0.007]) box([W, 0.014, 0.012], [0, y, s * (D / 2 + 0.006)], creamRib, covers, "battery-wall-rib");
    for (let i = 0; i <= 2; i += 1) box([0.012, lowH, 0.014], [s * (W / 2 + 0.006), lowMid, -D / 2 + 0.007 + i * (D - 0.014) / 2], creamRib, covers, "battery-wall-rib");
    for (const y of [E.bottom + 0.007, lowMid, E.split - 0.007]) box([0.012, 0.014, D], [s * (W / 2 + 0.006), y, 0], creamRib, covers, "battery-wall-rib");"""),
])
print("ok")
