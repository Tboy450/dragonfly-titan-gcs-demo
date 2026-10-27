import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,baseline,fingerprint} from '../research/draco-side-audit-2026-10-26/audit.mjs';
import {trace} from '../research/draco-connectivity-2026-10-27/trace.mjs';
import {dracoPlumbingAsset} from '../dist/draco-plumbing.mjs';

test('Both drill intake routes reach the shared selector/return and both blower inlet envelopes without a seating margin',()=>{
  const result=trace();
  assert.equal(result.rows.length,10);
  for(const row of result.rows)assert.ok(row.connected,`${row.name}: ${row.gapM} m outside`);
  assert.equal(result.connected,true);
  const seated=result.rows.find(row=>row.name==='shared return to blower selector');
  assert.ok(Math.abs(seated.gapM+dracoPlumbingAsset.returnSeatDepthM)<1e-8);
});

test('Strict continuity check detects the archived 1 mm return gap that the older expanded-box check accepted',async()=>{
  const result=trace(await baseline()),gaps=result.rows.filter(row=>!row.connected);
  assert.equal(result.connected,false);assert.equal(gaps.length,1);
  assert.equal(gaps[0].name,'shared return to blower selector');
  assert.ok(Math.abs(gaps[0].gapM-.001)<1e-8);
});

test('Return correction changes only its final control point by 4 mm, preserving all other hardware and line endpoints',async()=>{
  const current=fixture(),before=await baseline();
  const a=current.lines.returnRoute,b=before.lines.returnRoute;
  assert.deepEqual(a.slice(0,-1),b.slice(0,-1));
  assert.deepEqual(a.at(-1).slice(0,2),b.at(-1).slice(0,2));
  assert.ok(Math.abs(a.at(-1)[2]-b.at(-1)[2]-.004)<1e-12);
  const keep=root=>fingerprint(root).filter(row=>row.name!=='draco-return-tube');
  assert.deepEqual(keep(current.root),keep(before.root));
  const oldTube=before.root.getObjectByName('draco-return-tube'),newTube=current.root.getObjectByName('draco-return-tube');
  for(const parameter of ['radius','tubularSegments','radialSegments','closed'])
    assert.equal(newTube.geometry.parameters[parameter],oldTube.geometry.parameters[parameter]);
});
