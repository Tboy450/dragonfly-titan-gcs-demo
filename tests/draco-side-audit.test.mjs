import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three/three.module.min.js';
import {readFile} from 'node:fs/promises';
import {fixture,baseline,fingerprint,counts,report} from '../research/draco-side-audit-2026-10-26/audit.mjs';
import {drillAsset} from '../dist/drills.mjs';
import {inspectionSubassemblies,createInspector,focusInspector,selectInspectionSubassembly} from '../dist/vehicle-inspector.mjs';
import {createInspectionVisibility,setInspectionLayer} from '../dist/inspection-visibility.mjs';
import {dracoInventory as rows,dracoInventorySources as sources,dracoInventoryLimits as limits} from '../dist/sampling-connections.mjs';

test('DrACO audit retains all hardware except the separately tested October27 return seating correction',async()=>{
  const current=fixture(),before=await baseline();
  // The continuity regression suite verifies the sole later geometry change and detects its old gap.
  const unchanged = root => fingerprint(root).filter(row=>row.name!=='draco-return-tube');
  assert.deepEqual(unchanged(current.root),unchanged(before.root));
  for(const feed of [0,.065,.13]){
    for(const f of [current,before])for(const [i,d] of f.drills.entries()){
      d.carriage.position.y=drillAsset.stowedY-feed;f.lines.hoseParts[i].setFeed(feed);
    }
    assert.deepEqual(unchanged(current.root),unchanged(before.root));
  }
});

test('Port and starboard drills retain equal named equipment inventories and two independent focuses',()=>{
  const f=fixture(),groups=f.drills.map(d=>d.drill),count=groups.map(counts);
  assert.deepEqual(count[0],count[1]);
  for(const c of count){
    for(const name of ['drill-percussion-actuator','drill-rotation-actuator','drill-z-motor','drill-z-rail','drill-swivel'])assert.equal(c[name],1,name);
    assert.equal(c['drill-body-mount'],2);assert.equal(c['drill-motor-lead'],2);assert.equal(c['drill-bit-tooth'],8);
  }
  const holder=new THREE.Group();holder.name='drills';holder.add(...groups);
  const targets=inspectionSubassemblies(holder);assert.deepEqual(targets.map(g=>g.name),['drill-port','drill-starboard']);
  const state={inspector:createInspector()};focusInspector(state,'drills');
  for(const group of targets){selectInspectionSubassembly(state,holder,group.name);assert.equal(state.inspector.subassembly,group.name);}
});

test('Each isolated drill label remains on its own fixed rail throughout feed and craft rotation',()=>{
  const f=fixture();
  for(const feed of [0,.065,.13])for(const d of f.drills){
    d.carriage.position.y=drillAsset.stowedY-feed;
    const rail=d.stage.getObjectByName('drill-z-rail');
    f.root.rotation.set(.17,.48,-.12);f.root.updateMatrixWorld(true);
    const craftPoint=d.drill.userData.labelAnchor.clone().applyMatrix4(f.root.matrixWorld);
    const railPoint=rail.worldToLocal(craftPoint.clone());rail.geometry.computeBoundingBox();
    assert.ok(rail.geometry.boundingBox.clone().expandByScalar(1e-8).containsPoint(railPoint));
    assert.equal(Math.sign(d.drill.userData.labelAnchor.x),Math.sign(d.drill.position.x));
  }
});

test('Both sample hoses meet their respective drills throughout the feed stroke',()=>{
  const {drills,lines}=fixture();
  for(const [i,side] of [-1,1].entries())for(let step=0;step<=8;step++){
    const feed=.13*step/8;drills[i].carriage.position.y=drillAsset.stowedY-feed;lines.hoseParts[i].setFeed(feed);
    const expected=new THREE.Vector3(side*(drillAsset.lateralM-drillAsset.portLocal[0]),drillAsset.stowedY-feed+drillAsset.portLocal[1],drillAsset.foreAftM);
    assert.ok(lines.hoseParts[i].mesh.geometry.parameters.path.getPoint(1).distanceTo(expected)<1e-9);
  }
});

test('Sample/gas plumbing hides independently of drill electrical leads and restores',()=>{
  const f=fixture(),drillRoot=new THREE.Group();drillRoot.add(...f.drills.map(d=>d.drill));
  const visibility=createInspectionVisibility({'sample-lines':f.lines.lines,drills:drillRoot}),i=createInspector();
  assert.equal(visibility.available('plumbing','sample-lines'),true);assert.equal(visibility.available('harnesses','sample-lines'),false);
  assert.equal(visibility.available('harnesses','drills'),true);
  setInspectionLayer(i,'plumbing',false,'sample-lines');const previous=new Map();visibility.apply(i,previous);
  assert.equal(f.lines.tubes.visible,false);assert.equal(f.lines.hoses.visible,false);
  for(const d of f.drills)assert.equal(d.leads.visible,true);
  for(const [object,value] of previous)object.visible=value;
  assert.equal(f.lines.tubes.visible,true);assert.equal(f.lines.hoses.visible,true);
});

test('Side inventory distinguishes paired mechanisms, shared suction, one-sided optics and unresolved wiring',()=>{
  const measured=report();assert.equal(measured.pairedInventoryEqual,true);
  assert.deepEqual(measured.clamps,{port:7,starboard:4});assert.equal(measured.sampleTransport.length,5);
  assert.equal(measured.blowers['draco-forward-blower-volute'],1);assert.equal(measured.blowers['draco-aft-blower-volute'],1);
  assert.deepEqual(measured.cameras.map(r=>r.name),['microscopic-camera','led-array','port-down-camera','starboard-down-camera']);
  assert.equal(rows.length,8);assert.equal(new Set(rows.map(r=>r.id)).size,8);
  for(const row of rows){assert.ok(Object.isFrozen(row));assert.equal(row.flightMatingConfirmed,false);assert.ok(sources[row.source]);}
  assert.match(rows.find(r=>r.id==='draco-blower-location').modeled,/does not confirm both exact flight positions/);
  assert.match(rows.find(r=>r.id==='draco-electrical-gap').modeled,/Z-feed leads/);
  assert.equal(rows.find(r=>r.id==='draco-electrical-gap').inspect,null);
  assert.match(limits.scope,/matching counts do not establish flight completeness/);
});

test('DrACO evidence remains collapsed and research-only, using the existing focus controls',async()=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.match(html,/<details id="draco-inventory" class="component-temperatures" hidden>/);
  const ui=await readFile(new URL('../dist/ui/layers-panel.mjs',import.meta.url),'utf8');
  assert.match(ui,/\$\("draco-inventory"\)\.hidden = !layered \|\| mock \|\| !chaseRenderer/);
  assert.match(ui,/rows:dracoInventory,sources:dracoInventorySources,limits:dracoInventoryLimits/);
  for(const row of rows.filter(r=>r.inspect))assert.ok(['drills','sample-lines','drill-blower','side-cameras'].includes(row.inspect));
});
