// Reproduce the acceptance gaps against the exact preserved production validator.
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createBattle, requestDrop, stepBattle } from '../../dist/invasion/battle.mjs';
import { planetById } from '../../dist/invasion/campaign.mjs';
import { missionCheckpoint, validMissionCheckpoint } from '../../dist/invasion/mission-save.mjs';
const baseline=readFileSync(new URL('../../archive/swarmfall-checkpoint-validation-2026-10-19/original/mission-save.mjs',import.meta.url),'utf8')
  .replace(/"\.\/([^"\n]+)"/g,(_,name)=>JSON.stringify(new URL('../../dist/invasion/'+name,import.meta.url).href));
const previous=await import('data:text/javascript;base64,'+Buffer.from(baseline).toString('base64'));
const b=createBattle(planetById('velm'));
assert.ok(requestDrop(b,{x:b.zones[0].x,z:b.zones[0].z,payload:{scout:4,link:2}}).ok);
for(let i=0;i<201;i++)stepBattle(b,.05);
const saved=missionCheckpoint({battle:b,cam:{focus:{x:0,z:0},distance:230,yaw:0,pitch:.9}});
const drone=s=>s.battle.units.find(u=>u.type==='scout');
const cases={
  'Inherited unit type':s=>drone(s).type='constructor',
  'Missing damage multiplier':s=>delete drone(s).damageScale,
  'Native-side Scout':s=>drone(s).side='native',
  'Nonfinite squad hold coordinate':s=>s.battle.squads[0].order={kind:'hold',x:NaN,z:0},
  'Unknown capture-zone reference':s=>drone(s).order={kind:'capture',x:0,z:0,zone:'missing'},
  'Missing paid inbound sibling':s=>s.battle.pods.pop(),
  'Missing required loss counter':s=>delete s.battle.stats.dronesLost,
  'Malformed pending strike':s=>s.battle.strikes.push({source:'artillery'}),
};
const report=Object.entries(cases).map(([name,change])=>{
  const value=structuredClone(saved);change(value);
  const row={name,previousAccepted:!!previous.validMissionCheckpoint(value),currentAccepted:!!validMissionCheckpoint(value)};
  assert.equal(row.previousAccepted,true,name);assert.equal(row.currentAccepted,false,name);return row;
});
writeFileSync(new URL('validation-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
