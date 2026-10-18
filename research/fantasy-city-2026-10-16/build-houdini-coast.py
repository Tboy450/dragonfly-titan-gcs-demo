"""Author a continuous, underside-constrained coastal terrain in Houdini Apprentice.

Original city geometry is read only. No building extensions are generated.
"""
import hou, json, math
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'research/fantasy-city-2026-10-16/houdini-authoring'
WORK.mkdir(exist_ok=True)
hou.hipFile.clear(suppress_save_prompt=True)
obj=hou.node('/obj')
source=obj.createNode('geo','CITY_READ_ONLY')
load=source.createNode('gltf','Original_Cyberpunk_City')
load.parm('gltffile').set(str(ROOT/'dist/invasion/environments/assets/source-scenes/cyberpunk.glb'))
load.parm('enablematerialimport').set(0)
box=load.geometry().boundingBox(); lo=box.minvec(); hi=box.maxvec()
scale=2000/max(hi[0]-lo[0],hi[2]-lo[2]); center=(lo+hi)*.5
norm=source.createNode('xform','Normalize_like_browser'); norm.setInput(0,load)
norm.parmTuple('t').set((-center[0]*scale,-lo[1]*scale,-center[2]*scale))
norm.parmTuple('s').set((scale,scale,scale))
geo=norm.geometry().freeze()
base=geo.addAttrib(hou.attribType.Prim,'base_y',0.)
height=geo.addAttrib(hou.attribType.Prim,'part_height',0.)
selected=[]; parts=[]
for p in geo.prims():
    b=p.boundingBox(); low=b.minvec(); high=b.maxvec(); size=high-low
    name=p.attribValue('name')
    if name.startswith(('NurbsPath','Sphere','BezierCurve')): continue
    # Short facade blocks, roof machinery and balconies are not ground-bearing districts.
    if min(size[0],size[2])<18 or size[1]<100 or size[1]<max(size[0],size[2])*.45: continue
    p.setAttribValue(base,low[1]);p.setAttribValue(height,size[1])
    selected.append(p.number())
    parts.append(dict(name=name,x=(low[0]+high[0])*.5,z=(low[2]+high[2])*.5,
                      bottom=low[1],top=high[1],width=size[0],depth=size[2]))
selected_ids=set(selected)
geo.deletePrims([p for p in geo.prims() if p.number() not in selected_ids],keep_points=False)
geo.saveToFile(str(WORK/'structural-masses.bgeo.sc'))
print('Selected',len(parts),'structural masses',flush=True)
unpackAll=source.createNode('unpack','Unchanged_city_for_review');unpackAll.setInput(0,norm)
unpackAll.setDisplayFlag(True);unpackAll.setRenderFlag(True)
source.setColor(hou.Color((.4,.55,.64)))

# Elevated transit is a clearance ceiling, never a terrain projection target.
transit=norm.geometry().freeze()
transit.deletePrims([p for p in transit.prims() if not p.attribValue('name').startswith('NurbsPath')],keep_points=False)
transit.saveToFile(str(WORK/'skyways.bgeo.sc'))

fit=obj.createNode('geo','HOUDINI_COAST')
routes=fit.createNode('file','Elevated_routes_read_only');routes.parm('file').set(str(WORK/'skyways.bgeo.sc'))
route_mesh=fit.createNode('unpack','Skyway_clearance_geometry');route_mesh.setInput(0,routes)
route_flat=fit.createNode('attribwrangle','Skyway_corridor_plan');route_flat.setInput(0,route_mesh)
route_flat.parm('snippet').set('f@route_height=@P.y; @P.y=0;')
masses=fit.createNode('file','Ground_contact_candidates');masses.parm('file').set(str(WORK/'structural-masses.bgeo.sc'))
unpack=fit.createNode('unpack','Actual_building_surfaces');unpack.setInput(0,masses)
unpack.parm('transfer_attributes').set('*')
undersides=fit.createNode('attribwrangle','Keep_only_low_undersides');undersides.setInput(0,unpack)
undersides.parm('class').set(1)
undersides.parm('snippet').set('''
vector n=prim_normal(0,@primnum,set(.33,.33,0));
vector c=primuv(0,"P",@primnum,set(.33,.33,0));
// Limit each object to its base region. Upper overhangs must stay elevated.
if(n.y>-.3 || c.y>f@base_y+max(4.,f@part_height*.045)) removeprim(0,@primnum,1);
''')
exposed=fit.createNode('attribwrangle','Exclude_bases_supported_by_lower_city');exposed.setInput(0,undersides)
exposed.setInput(1,unpack);exposed.parm('class').set(1)
exposed.parm('snippet').set('''
vector c=primuv(0,"P",@primnum,set(.33,.33,0)),hit,uv;
int p=intersect(1,set(c.x,-250,c.z),set(0,2000,0),hit,uv);
if(p>=0 && hit.y<c.y-8.) removeprim(0,@primnum,1);
''')
contacts=exposed.geometry()
if not contacts.prims():raise RuntimeError('No exposed base contacts')
contacts.saveToFile(str(WORK/'contacts.bgeo.sc'))
flat=fit.createNode('attribwrangle','Planar_contact_distance_target');flat.setInput(0,exposed)
flat.parm('snippet').set('f@contact_height=@P.y; @P.y=0;')

# Broad district slope prevents isolated Gaussian mounds around every building.
samples=np.array([(p.position()[0],p.position()[2],p.position()[1]) for p in contacts.points()])
coeff=np.linalg.lstsq(np.column_stack((samples[:,:2],np.ones(len(samples)))),samples[:,2],rcond=None)[0]
print('Contact primitives',len(contacts.prims()),'slope',coeff.tolist(),flush=True)
coast=json.loads((ROOT/'research/fantasy-city-2026-10-16/foundation-authoring/coast-input.json').read_text())
cg=hou.Geometry(); cp=cg.createPoints([(x,z,-y) for x,y,z in coast['vertices']])
for i in range(0,len(coast['indices']),3):
    poly=cg.createPolygon();poly.addVertex(cp[coast['indices'][i]]);poly.addVertex(cp[coast['indices'][i+1]]);poly.addVertex(cp[coast['indices'][i+2]])
cg.saveToFile(str(WORK/'preferred-coast.bgeo.sc'))
baseline=fit.createNode('file','Preferred_second_coast');baseline.parm('file').set(str(WORK/'preferred-coast.bgeo.sc'))
hf=fit.createNode('heightfield','Coastal_heightfield_8m')
hf.parmTuple('size').set((7200,7200)) if hf.parmTuple('size') else None
hf.parm('sizex').set(7200);hf.parm('sizey').set(7200);hf.parm('gridspacing').set(8)
hf.parm('initialheight').set(-250)
project=fit.createNode('heightfield_project','Project_lowest_actual_bases');project.setInput(0,hf);project.setInput(1,exposed)
project.parm('hitfarthest').set(0);project.parm('combine').set(0);project.parm('maxraydist').set(2000)
mask=fit.createNode('heightfield_maskbyobject','Protect_building_contact_footprints');mask.setInput(0,project);mask.setInput(1,exposed)
shape=fit.createNode('volumewrangle','Fit_connected_districts_to_low_coast');shape.setInput(0,mask);shape.setInput(1,baseline);shape.setInput(2,flat)
a,b,c=coeff.tolist()
shape.parm('snippet').set(f'''
vector hit,uv; int bp=intersect(1,set(@P.x,1600,@P.z),set(0,-4000,0),hit,uv);
float coast=bp>=0?hit.y:-90.;
int pr; vector puv; float d=xyzdist(2,set(@P.x,0,@P.z),pr,puv);
float nearest=primuv(2,"contact_height",pr,puv);
float macro={a:.9f}*@P.x+{b:.9f}*@P.z+{c:.9f};
float local=lerp(macro,nearest,exp(-d/130.));
float blend=1.-smooth(180.,650.,d);
float terrain=lerp(coast,local,blend);
if(@mask>.5) terrain=@height-.7;
@height=terrain;
''')
blur=fit.createNode('heightfield_blur','Soften_district_transitions');blur.setInput(0,shape)
blur.parm('radius').set(24);blur.parm('iterations').set(2)
clamp=fit.createNode('volumewrangle','Restore_contacts_and_prevent_burial');clamp.setInput(0,blur);clamp.setInput(1,unpack);clamp.setInput(2,exposed)
clamp.parm('snippet').set('''
vector hit,uv; int p=intersect(1,set(@P.x,-250,@P.z),set(0,2000,0),hit,uv);
// The first solid city surface is a ceiling for ground, including nearby lower masses.
if(p>=0) @height=min(@height,hit.y-.7);
int q=intersect(2,set(@P.x,-250,@P.z),set(0,2000,0),hit,uv);
if(q>=0) @height=hit.y-.7;
''')
convert=fit.createNode('convertheightfield','Continuous_coastal_mesh');convert.setInput(0,clamp)
# Preserve actual base edges in a constrained triangular terrain mesh. A regular
# heightfield alone can cut across narrow/angled contacts between its sample cells.
points=hou.Geometry()
coords=[(x,0,z) for z in range(-3600,3601,60) for x in range(-3600,3601,60) if abs(x)>=1500 or abs(z)>=1500]
coords += [(x,0,z) for z in range(-1500,1501,12) for x in range(-1500,1501,12)]
# Interior contact samples preserve small exposed strips beside stacked buildings.
for poly in contacts.prims():
    for u,v in [(.2,.2),(.6,.2),(.2,.6),(.33,.33)]:
        p=poly.positionAtInterior(u,v);coords.append((p[0],0,p[2]))
# Closely spaced samples on both sides of footprint rims allow sharp cut/fill
# steps at stacked districts. Without these, one triangle bridges two different
# elevations over several metres and leaves a wedge-shaped gap.
edges={}
for poly in contacts.prims():
    vs=[v.point().position() for v in poly.vertices()]
    for p,q in zip(vs,vs[1:]+vs[:1]):
        key=tuple(sorted((tuple(round(x,4) for x in p),tuple(round(x,4) for x in q))))
        if key in edges:edges[key][0]+=1
        else:edges[key]=[1,p,q]
rim_lines=[]
for count,p,q in edges.values():
    if count!=1:continue
    dx,dz=q[0]-p[0],q[2]-p[2];length=math.hypot(dx,dz)
    if length<.05:continue
    nx,nz=-dz/length,dx/length
    steps=max(1,math.ceil(length/5))
    start=len(coords)
    for j in range(steps+1):
        t=j/steps;x,z=p[0]+dx*t,p[2]+dz*t
        for offset in [-.3,-.025,.025,.3]:coords.append((x+nx*offset,0,z+nz*offset))
    rim_lines.extend([[start+j*4+k for j in range(steps+1)] for k in range(4)])
gridpoints=points.createPoints(coords)
for line in rim_lines:
    curve=points.createPolygon(is_closed=False)
    for i in line:curve.addVertex(gridpoints[i])
points.saveToFile(str(WORK/'terrain-sampling-points.bgeo.sc'))
cloud=fit.createNode('file','Dense_city_coarse_outer_coast');cloud.parm('file').set(str(WORK/'terrain-sampling-points.bgeo.sc'))
constraints=fit.createNode('groupcreate','Protect_exact_base_outlines');constraints.setInput(0,flat)
constraints.parm('groupname').set('base_outlines')
merge=fit.createNode('merge','Terrain_samples_and_base_constraints');merge.setInput(0,cloud);merge.setInput(1,constraints)
tin=fit.createNode('triangulate2d','Constrained_contact_edge_terrain');tin.setInput(0,merge)
tin.parm('useconstrpolys').set(1);tin.parm('constrpolys').set('base_outlines');tin.parm('restorepos').set(0)
tin.parm('useconstredges').set(1);tin.parm('constredges').set('*')
seat=fit.createNode('attribwrangle','Seat_mesh_at_exact_base_edges');seat.setInput(0,tin);seat.setInput(1,clamp);seat.setInput(2,unpack);seat.setInput(3,exposed)
seat.parm('snippet').set('''
float h=volumesample(1,"height",@P);
int pr;vector uv;string flat="op:/obj/HOUDINI_COAST/Planar_contact_distance_target";
float d=xyzdist(flat,set(@P.x,0,@P.z),pr,uv);
float target=primuv(flat,"contact_height",pr,uv);
vector hit,huv;int body=intersect(2,set(@P.x,-250,@P.z),set(0,2000,0),hit,huv);
float ceiling=body>=0?hit.y-.7:1e9;
if(d<.05){h=target-.7;if(body>=0)h=min(h,hit.y-.7);}
else if(body>=0)h=min(h,hit.y-.7);
int contact=intersect(3,set(@P.x,-250,@P.z),set(0,2000,0),hit,huv);
if(contact>=0) h=min(hit.y-.7,ceiling);
else {
    string route="op:/obj/HOUDINI_COAST/Skyway_corridor_plan";
    int rp;vector ruv;float rd=xyzdist(route,set(@P.x,0,@P.z),rp,ruv);
    float routeheight=primuv(route,"route_height",rp,ruv);
    float corridor=1.-smooth(25.,70.,rd);
    h=min(h,lerp(h,routeheight-50.,corridor));
    int sky=intersect("op:/obj/HOUDINI_COAST/Skyway_clearance_geometry",set(@P.x,-250,@P.z),set(0,2000,0),hit,huv);
    if(sky>=0)h=min(h,hit.y-50.);
}
@P.y=h;
''')
current=seat;sampling=merge
# Bounded adaptive refinement targets interpolation errors at steep cut/fill joins,
# independently of the random validation probes. It adds terrain samples, not walls.
for iteration in range(2):
    refine=fit.createNode('python','Refine_steep_contact_joins_'+str(iteration+1))
    refine.setInput(0,sampling);refine.setInput(1,current);refine.setInput(2,exposed);refine.setInput(3,unpack)
    refine.parm('python').set('''
import hou
node=hou.pwd();out=node.geometry()
terrain=node.inputs()[1].geometry();contacts=node.inputs()[2].geometry();body=node.inputs()[3].geometry()
hit=hou.Vector3();normal=hou.Vector3();uv=hou.Vector3();extra=[]
for poly in terrain.prims():
    ps=[v.point().position() for v in poly.vertices()]
    if len(ps)!=3 or max(p[1] for p in ps)-min(p[1] for p in ps)<8:continue
    for w in [(.333,.333,.334),(.6,.2,.2),(.2,.6,.2),(.2,.2,.6)]:
        p=ps[0]*w[0]+ps[1]*w[1]+ps[2]*w[2]
        origin=hou.Vector3((p[0],-250,p[2]));direction=hou.Vector3((0,2000,0))
        if contacts.intersect(origin,direction,hit,normal,uv)<0:continue
        target=hit[1]-.7
        if body.intersect(origin,direction,hit,normal,uv)>=0:target=min(target,hit[1]-.7)
        if abs(target-p[1])>2:extra.append((p[0],0,p[2]))
out.createPoints(extra)
''')
    triangulate=fit.createNode('triangulate2d','Refined_contact_terrain_'+str(iteration+1));triangulate.setInput(0,refine)
    triangulate.setParms({'useconstrpolys':1,'constrpolys':'base_outlines','restorepos':0,'useconstredges':1,'constredges':'*'})
    projected=fit.createNode('attribwrangle','Reseat_refined_terrain_'+str(iteration+1))
    projected.setInput(0,triangulate);projected.setInput(1,clamp);projected.setInput(2,unpack);projected.setInput(3,exposed)
    projected.parm('snippet').set(seat.parm('snippet').eval())
    current=projected;sampling=refine
normal=fit.createNode('normal','Landscape_normals');normal.setInput(0,current);normal.parm('type').set(0)
color=fit.createNode('attribwrangle','Rock_soil_and_shore');color.setInput(0,normal)
color.parm('snippet').set('''
float slope=1.-abs(@N.y);
vector soil=set(.27,.36,.31),rock=set(.23,.30,.32),sand=set(.48,.49,.39);
@Cd=lerp(soil,rock,clamp(slope*2.8,0.,1.));
@Cd=lerp(@Cd,sand,(1.-smooth(0.,14.,abs(@P.y+38.)))*.7);
''')
out=fit.createNode('null','OUT_COAST');out.setInput(0,color);out.setDisplayFlag(True);out.setRenderFlag(True)
fit.layoutChildren();source.layoutChildren()
final=out.geometry()
final.saveToFile(str(WORK/'skyway-houdini-coast.obj'))
hou.hipFile.save(str(WORK/'skyway-coast.hipnc'))
print('Saved',len(final.points()),len(final.prims()),final.boundingBox(),flush=True)
# Browser consumes Houdini's evaluated mesh rather than regenerating the terrain in JS.
positions=np.array(final.pointFloatAttribValues('P'),dtype='<f4').reshape(-1,3)
colors=np.array(final.pointFloatAttribValues('Cd'),dtype='<f4').reshape(-1,3)
indices=[]
for poly in final.prims():
    ids=[v.point().number() for v in poly.vertices()]
    for j in range(1,len(ids)-1):indices.extend((ids[0],ids[j],ids[j+1]))
idx=np.array(indices,dtype='<u4').reshape(-1,3)
# SOPs differ in winding. Orient all height-surface triangles upward in one batch.
ab=positions[idx[:,1]]-positions[idx[:,0]];ac=positions[idx[:,2]]-positions[idx[:,0]]
reverse=(ab[:,2]*ac[:,0]-ab[:,0]*ac[:,2])<0
idx[reverse]=idx[reverse][:,[0,2,1]];idx=idx.reshape(-1)
chunks=[positions.tobytes(),colors.tobytes(),idx.tobytes()];offset=0;views=[]
for chunk in chunks:
    views.append({'buffer':0,'byteOffset':offset,'byteLength':len(chunk)});offset+=len(chunk)
doc={'asset':{'version':'2.0','generator':'Houdini '+hou.applicationVersionString()+' coastal terrain'},
     'buffers':[{'byteLength':offset}],'bufferViews':views,
     'accessors':[{'bufferView':0,'componentType':5126,'count':len(positions),'type':'VEC3','min':positions.min(0).tolist(),'max':positions.max(0).tolist()},
                  {'bufferView':1,'componentType':5126,'count':len(colors),'type':'VEC3'},
                  {'bufferView':2,'componentType':5125,'count':len(idx),'type':'SCALAR'}],
     'meshes':[{'name':'Houdini fitted continuous coast','primitives':[{'attributes':{'POSITION':0,'COLOR_0':1},'indices':2,'material':0}]}],
     'materials':[{'name':'Coastal stone and soil','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':1}}],
     'nodes':[{'mesh':0}],'scenes':[{'nodes':[0]}],'scene':0}
import struct
j=json.dumps(doc,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
binary=b''.join(chunks)
target=ROOT/'dist/invasion/environments/assets/source-scenes/skyway-houdini-coast.glb'
target.write_bytes(struct.pack('<III',0x46546c67,2,28+len(j)+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(binary),0x004e4942)+binary)
report={'houdini':hou.applicationVersionString(),'license':str(hou.licenseCategory()),'method':'HeightField Project, protected contacts, district fit, constrained TIN, adaptive joins, transit clearance',
        'structural_masses':len(parts),'contact_primitives':len(contacts.prims()),'grid_spacing':8,'vertices':len(positions),'triangles':len(idx)//3,
        'height_range':[float(positions[:,1].min()),float(positions[:,1].max())],'macro_slope':coeff.tolist(),'source_modified':False,'building_extensions':False,'sea_level':-38,'transit_clearance_target':50}
(WORK/'fit-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report),flush=True)
