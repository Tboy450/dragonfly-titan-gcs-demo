import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three/three.module.min.js';
import {createHoudiniCoast} from '../dist/invasion/environments/houdini-coast.mjs';

const file=new URL('../dist/invasion/environments/assets/source-scenes/skyway-houdini-coast.glb',import.meta.url);
test('Houdini terrain is finite, faces upward and retains a continuous coastal extent',()=>{
  const b=readFileSync(file),length=b.readUInt32LE(12),d=JSON.parse(b.toString('utf8',20,20+length)),binary=28+length;
  assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(8),b.length);
  const a=d.accessors[0],v=d.bufferViews[a.bufferView],i=d.accessors[2],iv=d.bufferViews[i.bufferView];
  assert.ok(a.min[0]<=-3599&&a.max[0]>=3599);assert.ok(a.min[2]<=-3599&&a.max[2]>=3599);
  assert.ok(a.min[1]<-38,'ocean has an underwater shore');
  assert.ok(i.count/3<350000,'mesh stays within the preview geometry budget');
  const point=n=>[0,1,2].map(k=>b.readFloatLE(binary+v.byteOffset+n*12+k*4));
  for(let n=0;n<a.count;n++)assert.ok(point(n).every(Number.isFinite));
  for(let n=0;n<i.count;n+=3){
    const ids=[0,1,2].map(k=>b.readUInt32LE(binary+iv.byteOffset+(n+k)*4));
    assert.ok(ids.every(n=>n<a.count));
    const [p,q,r]=ids.map(point);
    const up=(q[2]-p[2])*(r[0]-p[0])-(q[0]-p[0])*(r[2]-p[2]);
    assert.ok(up>=-1e-6,'terrain cannot disappear when viewed from above');
  }
});

test('Houdini variant replaces old pads, terrain and support blocks while keeping animated ocean',()=>{
  const terrain=new THREE.Group();terrain.name='Houdini mesh';
  const group=createHoudiniCoast([[-800,-650],[850,-650],[850,700],[-800,700]],[],terrain);
  assert.equal(group.children.length,2);
  assert.ok(group.getObjectByName('Coastal ocean'));assert.ok(group.children.includes(terrain));
  assert.equal(group.getObjectByName('Individual foundation pads'),undefined);
  const normal=group.getObjectByName('Coastal ocean').material.normalMap;
  group.userData.animate(30);assert.ok(normal.offset.x>0);
});

test('Independent Houdini probes check gaps and burial at ground-bearing bases',()=>{
  const report=JSON.parse(readFileSync(new URL('../research/fantasy-city-2026-10-16/houdini-authoring/fit-report.json',import.meta.url),'utf8'));
  assert.equal(report.source_modified,false);assert.equal(report.building_extensions,false);
  const v=report.verification;assert.ok(v.samples>20000);
  assert.equal(v.ray_misses,0);assert.equal(v.buried_over_3,0);assert.equal(v.gaps_over_8,0);
  assert.ok(v.min_clearance>=0);assert.ok(v.max_gap<8);
});
