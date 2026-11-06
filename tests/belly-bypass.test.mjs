import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {bellyBypassAsset,bypassReliefBounds} from '../dist/belly-bypass.mjs';
import {baseline,fullModel,manifest,ray,report} from '../research/belly-bypass-2026-11-06/audit.mjs';
test('Only the existing belly surface changes; all equipment, routes and other surfaces retain exact geometry/poses',async()=>{
 const a=fullModel(),b=await baseline();assert.deepEqual(manifest(a.root),manifest(b.root));
 const bounds=x=>new T.Box3().setFromObject(x.root.getObjectByName('body-foam-belly-surface'));
 const aa=bounds(a),bb=bounds(b);assert.ok(aa.min.distanceTo(bb.min)<1e-7&&aa.max.distanceTo(bb.max)<1e-7);
 assert.equal(bellyBypassAsset.surfaceOnly,true);assert.equal(bellyBypassAsset.flightEdgeConfirmed,false);
});
test('One connected relief exposes the cold channel and retains surrounding belly skin',async()=>{
 const f=fullModel(),b=await baseline(),skin=f.root.getObjectByName('body-foam-belly-surface'),old=b.root.getObjectByName(skin.name),cold=f.root.getObjectByName('cold-duct-channel');
 for(const z of [-.5,-.25,0,.25,.55]){
  const from=new T.Vector3(0,-.6,z),to=new T.Vector3(0,-.35,z);
  assert.ok(ray(from,to,[old]).length>0);assert.equal(ray(from,to,[skin]).length,0);assert.ok(ray(from,to,[cold]).length>0);
 }
 for(const x of [-.25,.25])for(const z of [-.9,-.6,0,.67,1]){
  const from=new T.Vector3(x,-.6,z),to=new T.Vector3(x,-.3,z),a=ray(from,to,[skin]),b=ray(from,to,[old]);
  assert.ok(a.length&&b.length);assert.ok(a[0].point.distanceTo(b[0].point)<1e-7);
 }
 const [channel,front,aft]=bypassReliefBounds(f.subsystems.fuselage,f.subsystems['trim-chimneys']);
 assert.ok(front.max[2]>channel.min[2]&&aft.min[2]<channel.max[2]);
});
test('Installed relief removes exactly both housing intersections and clears every integer flap angle',async()=>{
 const r=await report();assert.deepEqual(r.previousContacts.map(o=>o.other),['body-foam-belly-surface','body-foam-belly-surface']);
 assert.deepEqual(r.contacts,[]);assert.deepEqual(r.flapBellyContacts,[]);
});
test('Relief metadata and camera optical ports stay independently owned by the existing belly region',()=>{
 const f=fullModel(),skin=f.root.getObjectByName('body-foam-belly-surface');
 assert.equal(skin.parent.userData.bodyFoamRegion,'body-foam-belly');assert.equal(skin.userData.bypassRelief,bellyBypassAsset.revision);
 for(const a of Object.values(skin.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));
});
