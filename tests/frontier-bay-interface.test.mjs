import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three/three.module.min.js';
import {frontierBayInterface as A} from '../dist/frontier-bay-interface.mjs';
import {mainHarnessAsset,buildMainHarness} from '../dist/main-harness.mjs';
import {fullModel,triangles} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
import {bodyHits} from '../research/draco-blower-pair-2026-10-27/audit.mjs';
import {inspectionGroups} from '../dist/vehicle-inspector.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {inspectionPartNumber,numberedInspectionParts} from '../dist/inspection-catalog.mjs';
import {buildEndpointAudit} from '../research/harness-endpoints-2026-10-23/audit.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} / ${b}`);
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};

test('Only the radio branch is refitted; radio hardware, other routes and both junction controls stay exact',async()=>{
 let source=await readFile(new URL('../archive/frontier-bay-link-2026-10-28/dist/main-harness.mjs',import.meta.url),'utf8');
 for(const file of ['vendor/three/three.module.min.js','navigation-meb-interface.mjs'])source=source.replaceAll('./'+file+'?v=dev',new URL('../dist/'+file+'?v=dev',import.meta.url).href);
 const old=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).mainHarnessAsset;
 for(const key of ['trunk','strands','crossBundles','clampSpacingM'])assert.deepEqual(mainHarnessAsset[key],old[key]);
 for(const b of mainHarnessAsset.branches){const prev=old.branches.find(o=>o.name===b.name);
  if(b.name==='radio'){assert.deepEqual(b.points.slice(0,2),prev.points.slice(0,2));assert.equal(prev.radiusM,.007);assert.equal(b.radiusM,.003);}
  else assert.deepEqual(b,prev);
 }
 assert.equal(await readFile(new URL('../dist/frontier-radio.mjs',import.meta.url),'utf8'),await readFile(new URL('../archive/frontier-bay-link-2026-10-28/dist/frontier-radio.mjs',import.meta.url),'utf8'));
});

test('Estimated shell meets the actual photo-labeled J22 insert face and clears its mounting ribs and other ports',()=>{
 const f=fullModel(),link=f.subsystems['radio-harness-link'],mate=link.getObjectByName('frontier-bay-est-mating-shell'),insert=f.root.getObjectByName('frontier-radio-J22-insert');
 const a=new T.Box3().setFromObject(mate),b=new T.Box3().setFromObject(insert);near(a.max.x,b.min.x);near(a.getCenter(new T.Vector3()).y,b.getCenter(new T.Vector3()).y);near(a.getCenter(new T.Vector3()).z,b.getCenter(new T.Vector3()).z);
 const contacts=bodyHits(f.root,link);assert.deepEqual(contacts,[{mesh:mate.name,other:insert.name,owner:'frontier-radio-connectors'}]);
 assert.equal(A.flightMatingConfirmed,false);assert.equal(A.circuitAssigned,false);assert.equal(A.photoPort,'J22');
});

test('The single lead enters its hollow relief normally; its bend does not fold the drawn cable',()=>{
 const f=fullModel(),wire=f.root.getObjectByName('main-harness-radio'),path=wire.geometry.parameters.path;
 path.getPoint(1).toArray().forEach((v,i)=>near(v,A.seat[i]));assert.ok(path.getTangent(1).x>.99999);
 assert.ok(A.boreRadiusM>A.cableRadiusM);
 for(let i=0;i<=80;i++){const p=path.getPoint(.85+i/80*.15);if(p.x<A.face[0]-.022)continue;near(p.y,A.seat[1]);near(p.z,A.seat[2]);}
 let radius=Infinity;for(let i=1;i<800;i++){
  const a=path.getPointAt((i-1)/800),b=path.getPointAt(i/800),c=path.getPointAt((i+1)/800),ab=b.clone().sub(a),bc=c.clone().sub(b),cross=ab.clone().cross(bc).length();
  if(cross>1e-12)radius=Math.min(radius,ab.length()*bc.length()*c.distanceTo(a)/(2*cross));
 }
 assert.ok(radius>2*A.cableRadiusM,'basic drawn-geometry fold guard, not a qualified cable bend limit');
 const support=wire.userData.installationSupports[0],pad=f.root.getObjectByName('install-radio-bay-pad');
 assert.equal(support.id,'radio-bay');near(new T.Box3().setFromObject(pad).min.y,-.284);
});

test('The fitted lead clears installed hardware; only existing peer junctions and its own lacing/support are contacts',()=>{
 const f=fullModel(),wire=f.root.getObjectByName('main-harness-radio'),path=wire.geometry.parameters.path,r=A.cableRadiusM,q=new T.Vector3();
 const range=new T.Box3().setFromObject(wire).expandByScalar(r),obstacles=[];
 f.root.traverse(o=>{if(!o.isMesh||o===wire||o.isInstancedMesh||o.userData.routeName==='radio'||o.userData.wireId===wire.name)return;
  const b=new T.Box3().setFromObject(o);if(b.intersectsBox(range))obstacles.push({o,b:b.expandByScalar(r),t:triangles(o).filter(t=>t.getArea()>1e-14)});
 });
 for(const p of path.getSpacedPoints(600))for(const {o,b,t}of obstacles){if(!b.containsPoint(p))continue;
  const peers=/^main-harness-(trunk|tie|trunk-strand-starboard|power-unit-2-to-radio)$/.test(o.name);
  if(peers&&(p.distanceTo(new T.Vector3(...A.cableControls[0]))<.04||p.distanceTo(new T.Vector3(...A.cableControls[1]))<.025))continue;
  assert.ok(!t.some(t=>t.closestPointToPoint(p,q).distanceTo(p)<r-.00003),o.name+' intersects the radio lead');
 }
});

test('Radio13 and Bay32 share one link; RF-only and camera focuses omit it, and independent masks restore',()=>{
 const f=fullModel();assert.equal(inspectionPartNumber('frontier-radio'),13);assert.equal(numberedInspectionParts(f.subsystems).length,32);
 for(const name of ['frontier-radio','main-harness'])assert.ok(inspectionGroups(name).includes('radio-harness-link'));
 assert.ok(inspectionGroups('frontier-radio','frontier-radio-connectors').includes('radio-harness-link'));
 assert.deepEqual(inspectionGroups('frontier-radio','frontier-radio-rf-lines'),['frontier-radio']);
 assert.deepEqual(inspectionGroups('main-harness','main-harness-port-down-camera'),['main-harness']);
 assert.equal(f.subsystems['main-harness'].getObjectByName('main-harness-radio'),undefined);
 const visibility=createInspectionVisibility(f.subsystems),link=f.subsystems['radio-harness-link'];
 for(const owner of ['frontier-radio','main-harness'])for(const category of ['harnesses','interfaces','mounts']){
  const before=new Map();visibility.apply({hiddenPartLayers:{[owner]:[category]}},before);
  for(const child of link.children)assert.equal(child.visible,child.userData.inspectionLayer!==category);
  for(const[o,v]of before)o.visible=v;
 }
});

test('Endpoint register reports geometric contact only without assigning a radio power/data circuit',()=>{
 const row=buildEndpointAudit().routes.find(o=>o.owner==='radio');assert.equal(row.status,'geometric-contact-only');
 assert.equal(row.flightTopologyConfirmed,false);near(row.targetStubs[0].centerlineGapM,0);
 assert.match(row.medium,/unassigned/);assert.match(row.missingSegment,/unverified/);
});
