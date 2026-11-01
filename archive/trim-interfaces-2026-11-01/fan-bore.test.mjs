import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../dist/vendor/three/three.module.min.js';
import {buildFans,buildWarmDuct,buildTrimDevice,thermalLoopAsset,airLoopPaths} from '../dist/thermal-loop.mjs';
import {warmDuctChangedNames} from '../dist/warm-duct-passages.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
function build(builder){const root=new T.Group();const result=builder({parent:root,mesh});root.updateMatrixWorld(true);return{root,result};}
async function old(){
 let src=await readFile(new URL('../archive/fan-bore-2026-10-29/thermal-loop.mjs',import.meta.url),'utf8');
 src=src.replace(/from "(\.\/[^"\n]+)"/g,(_,path)=>'from "'+new URL('../dist/'+path.slice(2),import.meta.url).href+'"');
 return import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
}
const changed=name=>/^fan-[ab]-(housing|flange)$/.test(name);
function snapshot(root,skip=()=>false){const rows=[];root.traverse(o=>{if(o.isMesh&&!changed(o.name)&&!skip(o.name))rows.push({name:o.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),vertices:Array.from(o.geometry.attributes.position.array),index:o.geometry.index?Array.from(o.geometry.index.array):null});});return rows;}
test('Both fan housings/flanges have open bores with solid outer rims, viewed from either side',()=>{
 const {root}=build(buildFans),R=thermalLoopAsset.fans.diameter/2;
 for(const [i,[x,y,z]] of thermalLoopAsset.fans.centers.entries()){
  const prefix=i?'fan-b':'fan-a',surfaces=[];
  root.traverse(o=>{if(o.isMesh&&o.name.startsWith(prefix)&&changed(o.name))surfaces.push(o);});
  assert.equal(surfaces.length,3);
  for(const direction of [-1,1]){
   for(let k=0;k<12;k++){
    const a=k*Math.PI/6,r=.85*R;
    const ray=new T.Raycaster(new T.Vector3(x+r*Math.cos(a),y+r*Math.sin(a),z-direction*.1),new T.Vector3(0,0,direction),0,.2);
    assert.equal(ray.intersectObjects(surfaces,false).length,0,'no solid end cap in the bore');
   }
   const rim=new T.Raycaster(new T.Vector3(x+R+.004,y,z-direction*.1),new T.Vector3(0,0,direction),0,.2);
   assert.ok(rim.intersectObjects(surfaces,false).length>0,'retained rim is a real surface');
  }
 }
});
test('Fan correction preserves outer envelopes and every other fan/duct/trim mesh',async()=>{
 const previous=await old(),a=build(buildFans),b=build(previous.buildFans);
 assert.deepEqual(snapshot(a.root),snapshot(b.root));
 a.root.traverse(o=>{if(!o.isMesh||!changed(o.name))return;
  const matches=[];b.root.traverse(p=>{if(p.name===o.name)matches.push(p);});
  const before=matches.find(p=>p.position.equals(o.position));assert.ok(before);
  const x=new T.Box3().setFromObject(o),y=new T.Box3().setFromObject(before);
  assert.ok(x.min.distanceTo(y.min)<3e-8&&x.max.distanceTo(y.max)<3e-8);
 });
 // Named later changes have exact guards in fan-duct-interface and warm-duct-passages suites.
 const later=n=>n==='warm-duct-fan-transition'||warmDuctChangedNames.includes(n);
 assert.deepEqual(snapshot(build(buildWarmDuct).root,later),snapshot(build(previous.buildWarmDuct).root,later));
 assert.deepEqual(snapshot(build(buildTrimDevice).root),snapshot(build(previous.buildTrimDevice).root));
 assert.deepEqual(airLoopPaths(),previous.airLoopPaths());
 assert.deepEqual(thermalLoopAsset.fans,previous.thermalLoopAsset.fans);
});
