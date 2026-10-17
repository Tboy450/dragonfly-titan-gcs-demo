"""Blender underside-aware foundation authoring; originals and preferred coast are read-only.

Generate exact underside contacts, then use a reusable Geometry Nodes Raycast modifier
to project only foundation bottom vertices onto the preserved coastal terrain.
"""
import json, math
from pathlib import Path
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent.parent
WORK=HERE/'foundation-authoring'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.use_scripts_auto_execute=False
bpy.ops.import_scene.gltf(filepath=str(ROOT/'dist/invasion/environments/assets/source-scenes/cyberpunk.glb'))
source=[o for o in bpy.context.scene.objects if o.type=='MESH']
world_points=[o.matrix_world@v.co for o in source for v in o.data.vertices]
lo=Vector(tuple(min(v[i] for v in world_points) for i in range(3)))
hi=Vector(tuple(max(v[i] for v in world_points) for i in range(3)))
scale=2000/max(hi.x-lo.x,hi.y-lo.y)
center=(hi+lo)*.5
def normalized(v):return Vector(((v.x-center.x)*scale,(v.y-center.y)*scale,(v.z-lo.z)*scale))

# Source copies remain in the editable .blend for inspecting all contact regions.
for o in source:
    mesh=o.data.copy();matrix=o.matrix_world.copy()
    for v in mesh.vertices:v.co=normalized(matrix@v.co)
    if matrix.determinant()<0:mesh.flip_normals()
    o.parent=None;o.matrix_world.identity();o.data=mesh
bpy.context.view_layer.update()

parts=[]
for o in source:
    if o.name.startswith(('NurbsPath','Sphere')):continue
    vs=[v.co for v in o.data.vertices]
    low=Vector(tuple(min(v[i] for v in vs) for i in range(3)))
    high=Vector(tuple(max(v[i] for v in vs) for i in range(3)))
    size=high-low
    if min(size.x,size.y)<18 or size.z<40 or size.z<max(size.x,size.y)*.45:continue
    parts.append((o,low,high))

# Actual downward faces of major structural masses. Lowest-hit filtering below
# selects the exposed underside, including sloping/stepped bases across the full mass.
# Roofs, skyways, globes and tiny facade details never become terrain targets.
triangles=[]
for o,low,high in parts:
    mesh=o.data;mesh.calc_loop_triangles()
    for t in mesh.loop_triangles:
        pts=[mesh.vertices[i].co.copy() for i in t.vertices]
        normal=(pts[1]-pts[0]).cross(pts[2]-pts[0]).normalized()
        if normal.z<-.3:
            triangles.append((o.name,pts))
if not triangles:raise RuntimeError('No genuine underside faces found')
target_vertices=[p for _,ps in triangles for p in ps]
target_faces=[(i,i+1,i+2) for i in range(0,len(target_vertices),3)]
bvh=BVHTree.FromPolygons(target_vertices,target_faces,all_triangles=True)

def subdivide(ps):
    a,b,c=ps
    lengths=[(a-b).length,(b-c).length,(c-a).length]
    if max(lengths)<=18:return [ps]
    edge=lengths.index(max(lengths))
    if edge==0:m=(a+b)*.5;children=[(a,m,c),(m,b,c)]
    elif edge==1:m=(b+c)*.5;children=[(a,b,m),(a,m,c)]
    else:m=(c+a)*.5;children=[(a,b,m),(m,b,c)]
    return [q for child in children for q in subdivide(child)]

vertices=[];faces=[];bottom_ids=[];contacts=[];skipped=0
for name,ps in triangles:
    for tri in subdivide(ps):
        mid=sum(tri,Vector())/3
        hit,_,_,_=bvh.ray_cast(Vector((mid.x,mid.y,-500)),Vector((0,0,1)),2500)
        # A lower source body already occupies this vertical column. Its underside
        # receives support instead; do not fill over its facade with a taller block.
        if hit is None or abs(hit.z-mid.z)>.5:skipped+=1;continue
        top=[Vector((p.x,p.y,p.z-.08)) for p in reversed(tri)] # upward winding
        start=len(vertices)
        vertices += [tuple(p) for p in top]+[(p.x,p.y,p.z-1) for p in top]
        bottom_ids.extend(range(start+3,start+6))
        faces += [tuple(start+i for i in (0,1,2)),tuple(start+i for i in (5,4,3))]
        for a,b in [(0,1),(1,2),(2,0)]:faces.append(tuple(start+i for i in (a,a+3,b+3,b)))
        contacts.append({'source':name,'top':list(mid),'triangle':[list(p) for p in top]})

# Join adjacent contact cells into a continuous shell. Internal prism walls caused
# stripes/overdraw in the first draft; only actual outer boundary edges get walls.
top_vertices=[];top_faces=[];vertex_keys={};face_keys=set();edge_counts={}
for start in range(0,len(vertices),6):
    ids=[]
    for point in vertices[start:start+3]:
        key=tuple(round(v,4) for v in point)
        if key not in vertex_keys:vertex_keys[key]=len(top_vertices);top_vertices.append(point)
        ids.append(vertex_keys[key])
    face_key=tuple(sorted(ids))
    if len(set(ids))<3 or face_key in face_keys:continue
    face_keys.add(face_key);top_faces.append(tuple(ids))
    for a,b in zip(ids,ids[1:]+ids[:1]):
        key=tuple(sorted((a,b)))
        if key in edge_counts:edge_counts[key][0]+=1
        else:edge_counts[key]=[1,a,b]
count=len(top_vertices)
vertices=top_vertices+[(x,y,z-1) for x,y,z in top_vertices]
bottom_ids=list(range(count,count*2))
faces=top_faces+[tuple(i+count for i in reversed(face)) for face in top_faces]
boundaries=[(a,b) for n,a,b in edge_counts.values() if n==1]
faces += [(a,a+count,b+count,b) for a,b in boundaries]

def object_from_mesh(name,vs,fs):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);return obj
coast=json.loads((WORK/'coast-input.json').read_text())
ground=object_from_mesh('Preferred coast - raycast target',coast['vertices'],[coast['indices'][i:i+3] for i in range(0,len(coast['indices']),3)])
foundation=object_from_mesh('Underside-fitted structural foundation',vertices,faces)
attribute=foundation.data.attributes.new('ground_contact','BOOLEAN','POINT')
for i in bottom_ids:attribute.data[i].value=True

# Editable, reusable Geometry Nodes setup. Only the foundation's bottoms move.
nodes=bpy.data.node_groups.new('Fit foundation bottoms to terrain - Raycast','GeometryNodeTree')
nodes.interface.new_socket(name='Geometry',in_out='INPUT',socket_type='NodeSocketGeometry')
nodes.interface.new_socket(name='Geometry',in_out='OUTPUT',socket_type='NodeSocketGeometry')
node=nodes.nodes;links=nodes.links
inp=node.new('NodeGroupInput');inp.location=(-650,100)
out=node.new('NodeGroupOutput');out.location=(500,100)
info=node.new('GeometryNodeObjectInfo');info.inputs['Object'].default_value=ground;info.location=(-650,-130)
position=node.new('GeometryNodeInputPosition');position.location=(-650,-370)
ray=node.new('GeometryNodeRaycast');ray.data_type='FLOAT';ray.inputs['Ray Direction'].default_value=(0,0,-1);ray.inputs['Ray Length'].default_value=3000;ray.location=(-380,-100)
origin=node.new('ShaderNodeVectorMath');origin.operation='ADD';origin.inputs[1].default_value=(0,0,1800);origin.location=(-650,-520)
links.new(position.outputs['Position'],origin.inputs[0]);links.new(info.outputs['Geometry'],ray.inputs['Target Geometry']);links.new(origin.outputs['Vector'],ray.inputs['Source Position'])
attr=node.new('GeometryNodeInputNamedAttribute');attr.data_type='BOOLEAN';attr.inputs['Name'].default_value='ground_contact';attr.location=(-360,220)
select=node.new('FunctionNodeBooleanMath');select.operation='AND';select.location=(-80,240)
links.new(attr.outputs['Attribute'],select.inputs[0]);links.new(ray.outputs['Is Hit'],select.inputs[1])
offset=node.new('ShaderNodeVectorMath');offset.operation='ADD';offset.inputs[1].default_value=(0,0,-.5);offset.location=(-50,-100)
links.new(ray.outputs['Hit Position'],offset.inputs[0])
clamp=node.new('ShaderNodeVectorMath');clamp.operation='MINIMUM';clamp.location=(90,-160)
links.new(offset.outputs['Vector'],clamp.inputs[0]);links.new(position.outputs['Position'],clamp.inputs[1])
setpos=node.new('GeometryNodeSetPosition');setpos.location=(220,100)
links.new(inp.outputs['Geometry'],setpos.inputs['Geometry']);links.new(select.outputs[0],setpos.inputs['Selection']);links.new(clamp.outputs['Vector'],setpos.inputs['Position']);links.new(setpos.outputs['Geometry'],out.inputs['Geometry'])
modifier=foundation.modifiers.new('Terrain contact - edit the raycast target','NODES');modifier.node_group=nodes

material=bpy.data.materials.new('Foundation - city ceramic retaining structure');material.diffuse_color=(.27,.36,.38,1);material.use_nodes=True
bsdf=material.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=material.diffuse_color;bsdf.inputs['Roughness'].default_value=.82
foundation.data.materials.append(material)
ground.hide_render=True
foundation['workflow']='Actual underside triangles; lowest structural surface per column; Geometry Nodes Raycast bottoms to preserved coast. Visual estimate, no collision.'
foundation['source_credit']='cyberpunk City by carlcapu333, BlendSwap 21664, CC-BY 3.0. Source unchanged; this is an original support derivative.'
bpy.ops.object.select_all(action='DESELECT');foundation.select_set(True);bpy.context.view_layer.objects.active=foundation
bpy.context.view_layer.update()
evaluated=foundation.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh()
heights=[v.co.z for v in evaluated.vertices]
ground_bvh=BVHTree.FromPolygons([v.co for v in ground.data.vertices],[p.vertices[:] for p in ground.data.polygons])
bottom_misses=0;bottom_error=0;top_shift=0;underside_distance=0;already_below_coast=0
for i in range(count):
    top=evaluated.vertices[i].co;bottom=evaluated.vertices[i+count].co
    top_shift=max(top_shift,(top-Vector(top_vertices[i])).length)
    nearest=bvh.find_nearest(top)
    if nearest[0] is not None:underside_distance=max(underside_distance,nearest[3])
    hit,_,_,_=ground_bvh.ray_cast(Vector((bottom.x,bottom.y,1800)),Vector((0,0,-1)),3000)
    if hit is None:bottom_misses+=1
    else:
        expected=min(hit.z-.5,top.z-1)
        if hit.z>top.z:already_below_coast+=1
        bottom_error=max(bottom_error,abs(bottom.z-expected))
if bottom_misses or bottom_error>.02 or top_shift>.001 or underside_distance>.2:
    raise RuntimeError(f'Foundation contact validation failed: {bottom_misses}, {bottom_error}, {top_shift}, {underside_distance}')
report={'blender':bpy.app.version_string,'method':'Geometry Nodes Raycast','source_objects':len(source),'structural_masses':len(parts),'underside_triangles':len(triangles),'support_cells':len(top_faces),'boundary_edges':len(boundaries),'occluded_cells_skipped':skipped,'vertices':len(vertices),'minimum_evaluated_height':min(heights),'maximum_evaluated_height':max(heights),'originals_modified':False,'coast_modified':False,'contact_clearance':.08,'bottom_embed':.5}
report['verification']={'bottom_ray_misses':bottom_misses,'max_bottom_embed_error':bottom_error,'max_top_shift':top_shift,'max_top_distance_to_actual_underside':underside_distance,'vertices_already_below_baseline_coast':already_below_coast,'checked_top_vertices':count,'checked_bottom_vertices':count,'underside_distance_tolerance':.2}
(WORK/'fit-report.json').write_text(json.dumps(report,indent=2))
(WORK/'contacts.json').write_text(json.dumps(contacts))
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'skyway-foundation-raycast.blend'))
target=ROOT/'dist/invasion/environments/assets/source-scenes/skyway-foundation.glb'
bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
print(json.dumps(report,indent=2),flush=True)
