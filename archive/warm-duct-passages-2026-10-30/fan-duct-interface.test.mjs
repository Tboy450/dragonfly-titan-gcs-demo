import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {buildFans,buildTrimDevice,thermalLoopAsset,fanDuctInterfaceAsset,airLoopPaths} from '../dist/thermal-loop.mjs';
import {baseline,build,mesh,report,targetName} from '../research/fan-duct-interface-2026-10-29/audit.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
import {inspectionPartNumber} from '../dist/inspection-catalog.mjs';
import {surfacesCross} from '../research/draco-blower-pair-2026-10-27/audit.mjs';
function snapshot(root,skip=''){const rows=[];root.traverse(o=>{if(o.isMesh&&o.name!==skip)rows.push({name:o.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),vertices:Array.from(o.geometry.attributes.position.array),index:o.geometry.index?Array.from(o.geometry.index.array):null});});return rows;}
test('Fan transition has open ends and solid wall rims instead of capped airflow faces',()=>{
 const {transition}=build(),d=thermalLoopAsset.duct,F=fanDuctInterfaceAsset,[,fy,fz]=thermalLoopAsset.fans.centers[0],end=fz-F.fanFrontOffsetM;
 // Trace interior lines in the duct's sloping frame through both end planes.
 for(const dx of [-.03,0,.03])for(const dy of [-.01,0,.01]){
  const a=new T.Vector3(dx,d.y+dy,d.back-.001),b=new T.Vector3(dx,fy+dy,end+.001),v=b.clone().sub(a);
  const ray=new T.Raycaster(a,v.clone().normalize(),0,v.length());assert.equal(ray.intersectObject(transition).length,0);
 }
 const rim=new T.Raycaster(new T.Vector3(0,fy+F.fanEndHeightM/2-F.wallM/2,end+.002),new T.Vector3(0,0,-1),0,.004);
 assert.ok(rim.intersectObject(transition).length>0);
 assert.equal(F.flightGeometryConfirmed,false);assert.ok(F.wallM<d.height/2);
});
test('Both fan mouth apertures reach the unchanged flange plane without a seven-millimeter gap',async()=>{
 const r=await report();for(const p of r.peers){assert.ok(Math.abs(p.oldGapM-.007)<1e-7);assert.ok(Math.abs(p.newGapM)<1e-7);}
 const {transition}=build(),F=fanDuctInterfaceAsset;
 for(const [x,y,z]of thermalLoopAsset.fans.centers)for(let k=0;k<12;k++){
  const a=k*Math.PI/6,r=.04,ray=new T.Raycaster(new T.Vector3(x+r*Math.cos(a),y+r*Math.sin(a),z-F.fanFrontOffsetM+.002),new T.Vector3(0,0,-1),0,.004);
  assert.equal(ray.intersectObject(transition).length,0,'fan opening is not capped by the transition lip');
 }
 // No new hardware intersections; coplanar intended flange contact is not penetration.
 const old=new Set(r.originalContacts.map(o=>JSON.stringify(o)));
 assert.ok(Math.abs(r.ductSeatGapM)<1e-7,'duct lip meets the unchanged run end plane within Float32 precision');
 assert.deepEqual(r.contacts.filter(o=>!old.has(JSON.stringify(o))&&o.other!=='warm-duct-run'),[]);
 assert.ok(r.contacts.every(o=>o.other==='warm-duct-run'||old.has(JSON.stringify(o))));
});
test('Only the named transition changes; fans, remainder of warm duct, trim and airflow retain exact geometry',async()=>{
 const old=await baseline(),a=build(),b=build(old.buildWarmDuct);
 assert.deepEqual(snapshot(a.root,targetName),snapshot(b.root,targetName));
 for(const [current,previous]of [[buildFans,old.buildFans],[buildTrimDevice,old.buildTrimDevice]]){
  const x=new T.Group(),y=new T.Group();current({parent:x,mesh});previous({parent:y,mesh});assert.deepEqual(snapshot(x),snapshot(y));
 }
 assert.deepEqual(thermalLoopAsset.fans,old.thermalLoopAsset.fans);assert.deepEqual(thermalLoopAsset.duct,old.thermalLoopAsset.duct);
 assert.deepEqual(airLoopPaths(),old.airLoopPaths());
});
test('The existing part18 gains a real geometry focus without a new numbered part',()=>{
 const {root,transition}=build();
 assert.equal(inspectionPartNumber('underfloor-duct'),18);
 assert.deepEqual(inspectionSubassemblies(root).map(o=>o.name),[targetName]);
 assert.equal(transition.userData.inspectionMinimumRadiusM,.04);
});
test('Transition walls clear the retained rotors through a full sampled revolution',()=>{
 const {root,transition}=build(),fans=buildFans({parent:root,mesh});
 for(let k=0;k<24;k++){
  fans.rotors.forEach(o=>o.rotation.z=k*Math.PI/12);root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(transition);
  for(const rotor of fans.rotors)rotor.traverse(o=>{
   if(o.isMesh&&bounds.intersectsBox(new T.Box3().setFromObject(o)))assert.equal(surfacesCross(transition,o),false,o.name+' reaches the shell');
  });
 }
});
