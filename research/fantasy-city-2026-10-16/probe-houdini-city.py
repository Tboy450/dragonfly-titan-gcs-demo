"""Inspect source geometry through Houdini without modifying the city."""
import hou, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
g=hou.node('/obj').createNode('geo','source_city')
n=g.createNode('gltf','original_glb')
n.parm('gltffile').set(str(ROOT/'dist/invasion/environments/assets/source-scenes/cyberpunk.glb'))
n.parm('enablematerialimport').set(0)
geo=n.geometry()
print('SOURCE',len(geo.points()),len(geo.prims()),geo.boundingBox())
print('ATTR',[(a.name(),str(a.dataType())) for a in geo.primAttribs()])
print('PRIMS',[(str(p.type()),str(p.attribValue('name')) if geo.findPrimAttrib('name') else '') for p in geo.prims()[:4]])
print('TYPES',[k for k in hou.sopNodeTypeCategory().nodeTypes() if 'heightfield' in k and ('convert' in k or 'wrangle' in k)])
for name in ['ray','convertheightfield','volumevop','volumewrangle']:
    x=g.createNode(name)
    print('NODE',name,[(p.name(),p.eval()) for p in x.parms() if not p.isHidden()][:60])
for name in ['heightfield_project','heightfield_maskbyobject']:
    x=g.createNode(name)
    print('MENUS',name,[(p.name(),p.parmTemplate().menuItems(),p.parmTemplate().menuLabels()) for p in x.parms() if isinstance(p.parmTemplate(),hou.MenuParmTemplate)])
