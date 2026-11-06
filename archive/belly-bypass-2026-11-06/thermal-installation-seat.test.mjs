import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {floorSeat,inspect,numericalEpsilonM,modelFloorYM} from '../research/thermal-installation-2026-11-06/audit.mjs';
const fixture=()=>{
 const root=new T.Group();
 const foot=new T.Mesh(new T.BoxGeometry(.03,.003,.012));foot.position.set(0,modelFloorYM+.0015,0);root.add(foot);
 const flange=new T.Mesh(new T.BoxGeometry(.15,.057,.012));flange.position.set(0,modelFloorYM-.0285,0);root.add(flange);
 return {root,foot,flange};
};
test('Float32 face seating is classified with an explicit common floor plane',()=>{
 const {root,foot,flange}=fixture(),r=floorSeat(foot,flange,root);
 assert.equal(r.classification,'numerical-floor-seat');assert.ok(r.planeResidualM<numericalEpsilonM);
});
test('A real penetration, a visible gap and a disjoint footprint are not floor seats',()=>{
 for(const [axis,offset]of [['y',-.0005],['y',.0005],['x',.2]]){
  const {root,foot,flange}=fixture();foot.position[axis]+=offset;
  assert.equal(floorSeat(foot,flange,root).classification,'not-a-floor-seat');
 }
});
test('Seat classification uses the construction frame and survives world rotation/translation',()=>{
 const {root,foot,flange}=fixture(),initial=floorSeat(foot,flange,root);
 root.position.set(2,-3,5);root.rotation.set(.8,1.2,-.3);
 const result=floorSeat(foot,flange,root);assert.equal(result.classification,initial.classification);
 assert.ok(Math.abs(result.signedGapM-initial.signedGapM)<1e-12);
});
test('Installed audit distinguishes the one numerical seat from two genuine insulation intersections',()=>{
 const r=inspect();assert.equal(r.seats.length,1);assert.equal(r.seats[0].route,'power-unit-1-to-rde-1');
 assert.ok(Math.abs(r.seats[0].signedGapM)<1e-9);
 assert.deepEqual(r.rawWarmContacts,[{mesh:'warm-duct-flange',other:'main-harness-clamp',owner:'main-harness-clamps'}]);
 assert.deepEqual(r.rawTrimContacts.map(o=>o.other),['body-foam-belly-surface','body-foam-belly-surface']);
 assert.ok(r.coldDuctBoundsM.min.y>r.bellyBoundsM.min.y,'existing belly lies below the cold duct; exposure boundary still needs review');
});
