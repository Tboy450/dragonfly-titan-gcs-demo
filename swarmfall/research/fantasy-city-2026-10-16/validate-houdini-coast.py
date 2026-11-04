"""Measure fit on the evaluated terrain, including both gaps and burial."""
import hou,json,numpy as np
import random
from pathlib import Path
WORK=Path(__file__).resolve().parent/'houdini-authoring'
# Validate baked output directly, avoiding another cook of the authoring graph.
terrain=hou.Geometry();terrain.loadFromFile(str(WORK/'skyway-houdini-coast.obj'))
contact=hou.Geometry();contact.loadFromFile(str(WORK/'contacts.bgeo.sc'))
container=hou.node('/obj').createNode('geo','validation_source')
load=container.createNode('file');load.parm('file').set(str(WORK/'structural-masses.bgeo.sc'))
unpack=container.createNode('unpack');unpack.setInput(0,load)
body=unpack.geometry()
gaps=[];misses=0;examples=[];supported=0
samples=[(p.attribValue('name'),p.positionAtInterior(.33,.33)) for p in contact.prims()]
samples += [('contact vertex',p.position()) for p in contact.points()]
# Independent barycentric probes are not the points used to author the terrain.
rng=random.Random(20261017)
for poly in contact.prims():
    for _ in range(3):
        u,v=rng.random(),rng.random()
        if u+v>1:u,v=1-u,1-v
        samples.append((poly.attribValue('name'),poly.positionAtInterior(u,v)))
hit=hou.Vector3();normal=hou.Vector3();uvw=hou.Vector3()
for name,c in samples:
    p=body.intersect(hou.Vector3((c[0],-250,c[2])),hou.Vector3((0,2000,0)),hit,normal,uvw)
    if p>=0 and hit[1]<c[1]-2:
        supported+=1;continue
    p=terrain.intersect(hou.Vector3((c[0],1800,c[2])),hou.Vector3((0,-3000,0)),hit,normal,uvw)
    if p<0:misses+=1;continue
    gap=c[1]-hit[1];gaps.append(gap)
    if abs(gap) > 8:examples.append(dict(name=name,position=list(c),gap=gap))
gaps=np.array(gaps)
report=json.loads((WORK/'fit-report.json').read_text())
report['method']='HeightField Project, protected contacts, district fit, constrained TIN, adaptive joins, transit clearance'
report['transit_clearance_target']=50
report['verification']={'candidate_samples':len(samples),'samples':len(gaps),'already_supported_by_lower_city':supported,'ray_misses':misses,'min_clearance':float(gaps.min()),'max_gap':float(gaps.max()),
                        'median_gap':float(np.median(gaps)),'p95_gap':float(np.percentile(gaps,95)),
                        'buried_over_3':int(np.count_nonzero(gaps < -3)),'gaps_over_8':int(np.count_nonzero(gaps >8)),
                        'worst':sorted(examples,key=lambda a:abs(a['gap']),reverse=True)[:8]}
routes=container.createNode('file','transit');routes.parm('file').set(str(WORK/'skyways.bgeo.sc'))
route_mesh=container.createNode('unpack','transit_mesh');route_mesh.setInput(0,routes)
clearances=[];contacts_under_route=0
for poly in route_mesh.geometry().prims()[::19]:
    if poly.normal()[1]>-.3:continue
    c=poly.positionAtInterior(.33,.33)
    if contact.intersect(hou.Vector3((c[0],-250,c[2])),hou.Vector3((0,2000,0)),hit,normal,uvw)>=0:
        contacts_under_route+=1;continue
    if terrain.intersect(hou.Vector3((c[0],1800,c[2])),hou.Vector3((0,-3000,0)),hit,normal,uvw)>=0:
        clearances.append(c[1]-hit[1])
report['transit_verification']={'samples':len(clearances),'above_building_contact':contacts_under_route,
                              'minimum_clearance':min(clearances) if clearances else None,
                              'below_20':sum(c<20 for c in clearances)}
(WORK/'fit-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report['verification']),flush=True)
print(json.dumps(report['transit_verification']),flush=True)
