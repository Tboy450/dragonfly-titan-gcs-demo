import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createBattle, requestDrop, orderSquads, orderHold, stepBattle, flatTerrain } from '../dist/invasion/battle.mjs';
import { planets, planetById, createProgress, validProgress } from '../dist/invasion/campaign.mjs';
import { droneTypes } from '../dist/invasion/units.mjs';
import { checkpointLimits, missionCheckpoint, validMissionCheckpoint, restoreMissionCheckpoint } from '../dist/invasion/mission-save.mjs';

const cam={focus:{x:0,z:0},distance:230,yaw:0,pitch:.9};
const snapshot=battle=>missionCheckpoint({battle,cam});
const durable=b=>{const saved=snapshot(b);delete saved.battle.events;return saved;};
const run=(b,seconds)=>{for(let i=0;i<Math.round(seconds*20);i++)stepBattle(b,.05);};
function wave(planet=planetById('velm')){
  const b=createBattle(planet,{matter:10000,podSlots:44,unlocks:Object.keys(droneTypes)}),home=b.zones[0];
  assert.ok(requestDrop(b,{x:home.x,z:home.z,payload:{scout:4,link:2}}).ok);return b;
}
function rejectChanges(saved,changes){
  for(const [label,change] of Object.entries(changes)){
    const bad=structuredClone(saved);change(bad);const before=structuredClone(bad);
    assert.equal(validMissionCheckpoint(bad),null,label);assert.deepEqual(bad,before,'rejecting must not mutate '+label);
  }
}

test('Checkpoint counters, required stats, flags and camera must be safe before resume',()=>{
  const saved=snapshot(wave());
  rejectChanges(saved,{
    'fractional next ID':s=>s.battle.nextId+=.5,
    'invalid random state':s=>s.battle.rngState=-1,
    'unknown tier':s=>s.battle.tier=99,
    'negative matter':s=>s.battle.matter=-1,
    'excessive slots':s=>s.battle.podSlots=45,
    'impossible requirement':s=>s.battle.required=999,
    'missing loss counter':s=>delete s.battle.stats.dronesLost,
    'negative counter':s=>s.battle.stats.dronesDropped=-1,
    'fractional count':s=>s.battle.stats.dronesLost=.5,
    'reset paid-wave cooldown':s=>s.battle.lastDropAt=null,
    'bad pause flag':s=>s.battle.paused='no',
    'future cooldown':s=>s.battle.lastDropAt=s.battle.time+1,
    'unbounded camera':s=>s.cam.distance=1e30,
    'invalid pitch':s=>s.cam.pitch=9,
  });
});

test('Zones, objectives and recovery references must exist and have unique identities',()=>{
  rejectChanges(snapshot(wave()),{
    'duplicate zone':s=>s.battle.zones[1].id=s.battle.zones[0].id,
    'duplicate home':s=>s.battle.zones[1].kind='beachhead',
    'invalid control':s=>s.battle.zones[1].control=101,
    'missing ownership':s=>delete s.battle.zones[1].captured,
    'missing objective zone':s=>s.battle.objectives[0]={id:'bad',kind:'captureZone',zone:'missing',text:'Capture'},
    'invalid objective type':s=>s.battle.objectives[0].type='constructor',
    'unknown objective rule':s=>s.battle.objectives[0].kind='oops',
    'duplicate objective':s=>s.battle.objectives.push(structuredClone(s.battle.objectives[0])),
    'unearned special reference':s=>s.battle.specials.push('missing'),
    'inherited unlock':s=>s.battle.unlocks[0]='constructor',
    'duplicate unlock':s=>s.battle.unlocks[0]=s.battle.unlocks[1],
  });
});

test('Unit class, ownership, health, formation and live combat fields cannot corrupt a resumed battle',()=>{
  const b=wave();run(b,10.3);const saved=snapshot(b),drone=saved.battle.units.findIndex(u=>u.type==='scout');
  rejectChanges(saved,{
    'inherited unit type':s=>s.battle.units[drone].type='constructor',
    'native drone class':s=>s.battle.units[drone].side='native',
    'mobile defender converted to drone':s=>{const u=s.battle.units.find(u=>u.type==='rifleman');u.side='swarm';u.converted=true;},
    'missing squad':s=>s.battle.units[drone].squad=999,
    'duplicate unit ID':s=>s.battle.units[drone].id=s.battle.units[0].id,
    'missing damage multiplier':s=>delete s.battle.units[drone].damageScale,
    'negative damage multiplier':s=>s.battle.units[drone].damageScale=-1,
    'health exceeds max':s=>s.battle.units[drone].hp=1e8,
    'zero maximum health':s=>s.battle.units[drone].maxHp=0,
    'dead-but-alive':s=>s.battle.units[drone].hp=0,
    'incorrect structure class':s=>s.battle.units[drone].structure=true,
    'landed non-Dragonfly':s=>s.battle.units[drone].landed=true,
    'nonfinite velocity':s=>s.battle.units[drone].vx=NaN,
    'huge formation offset':s=>s.battle.units[drone].slot.dx=1e30,
    'missing home zone':s=>s.battle.units[0].home='missing',
    'missing raid zone':s=>s.battle.units[0].raid='missing',
    'never-issued target ID':s=>s.battle.units[drone].target=s.battle.nextId,
  });
});

test('Bare squad hold is legal, but incomplete numeric and capture orders are rejected',()=>{
  const b=wave();orderHold(b,[1]);const saved=snapshot(b);assert.ok(validMissionCheckpoint(saved));
  rejectChanges(saved,{
    'partial hold coordinates':s=>s.battle.squads[0].order.x=0,
    'hold bypassing invalid pace':s=>s.battle.squads[0].order.pace=-1,
    'hold bypassing NaN':s=>s.battle.squads[0].order.x=NaN,
    'missing capture zone':s=>s.battle.squads[0].order={kind:'capture',x:0,z:0,zone:'missing'},
    'unissued attack target':s=>s.battle.squads[0].order={kind:'attack',x:0,z:0,target:s.battle.nextId},
  });
});

test('Pruned attack targets and converted structures retain valid deterministic recovery',()=>{
  const b=wave();run(b,10.3);
  const target=b.units.find(u=>u.structure),oldTargetId=target.id;
  orderSquads(b,[1],{kind:'attack',x:target.x,z:target.z,target:oldTargetId});
  b.units=b.units.filter(u=>u.id!==oldTargetId);
  const converted=b.units.find(u=>u.structure);converted.side='swarm';converted.converted=true;
  const saved=snapshot(b),restored=restoreMissionCheckpoint(saved,flatTerrain);
  assert.ok(restored,'dead target does not invalidate the saved attack-move order');
  assert.equal(restored.battle.squads[0].order.target,oldTargetId);
  assert.ok(restored.battle.units.some(u=>u.id===converted.id&&u.converted));
  assert.deepEqual(restored.battle.events,[],'one-frame effects do not replay on load');
  run(b,.5);run(restored.battle,.5);assert.deepEqual(durable(restored.battle),durable(b));
});

test('A paid wave rejects missing siblings, reused IDs, overlapping formation slots and excess cargo',()=>{
  const b=wave();orderSquads(b,[1],{kind:'move',x:0,z:0});const saved=snapshot(b);
  rejectChanges(saved,{
    'missing inbound sibling':s=>s.battle.pods.pop(),
    'reused entity as wave':s=>{for(const p of s.battle.pods)p.waveId=s.battle.units[0].id;},
    'inconsistent launch':s=>{s.battle.time=1;s.battle.pods[1].launchedAt=.5;s.battle.pods[1].t=.4;s.battle.pods[0].t=1;},
    'overlapping global slots':s=>s.battle.pods[1].slotStart=0,
    'invalid slot offsets':s=>s.battle.pods[0].pendingSlots[0].dz=1e12,
    'incorrect stagger':s=>{s.battle.pods[1].stagger=.2;s.battle.pods[1].t=-.2;},
    'locked cargo':s=>s.battle.unlocks.splice(s.battle.unlocks.indexOf('link'),1),
    'over-capacity cargo':s=>s.battle.podSlots=1,
  });
});

test('Independently expired sibling backshells remain valid at the retention boundary',()=>{
  const b=wave(planetById('titan'));run(b,16.05);
  assert.equal(b.pods.length,1);assert.equal(b.pods[0].waveIndex,1);
  const restored=restoreMissionCheckpoint(snapshot(b),flatTerrain);assert.ok(restored);
  run(b,.3);run(restored.battle,.3);assert.deepEqual(durable(restored.battle),durable(b));
  assert.equal(b.pods.length,0);assert.equal(b.stats.dronesDropped,6);
});

test('Strike and eruption data cannot introduce nonfinite damage or invalid hazard state',()=>{
  const b=wave(planetById('ashfall'));run(b,90);const saved=snapshot(b);
  saved.battle.strikes=[{x:0,z:0,radius:22,damage:40,markedAt:b.time,hitAt:b.time+4,source:'artillery',hit:false}];
  assert.ok(validMissionCheckpoint(saved));
  rejectChanges(saved,{
    'negative strike damage':s=>s.battle.strikes[0].damage=-40,
    'missing hit time':s=>delete s.battle.strikes[0].hitAt,
    'early-hit strike':s=>s.battle.strikes[0].hit=true,
    'unknown strike source':s=>s.battle.strikes[0].source='constructor',
    'unknown hazard':s=>s.battle.hazards.types[0]='constructor',
    'duplicate hazard type':s=>s.battle.hazards.types.push(s.battle.hazards.types[0]),
    'missing hazard effect':s=>delete s.battle.hazards.effects.speed,
    'missing hazard stun':s=>delete s.battle.hazards.effects.stun,
    'invalid hazard wind':s=>s.battle.hazards.effects.wind.x=Infinity,
    'bad eruption zone':s=>s.battle.hazards.effects.zones=[{x:0,z:0,radius:-1,damage:1}],
    'invalid event phase':s=>s.battle.hazards.events[0].phase='oops',
    'duplicate event identity':s=>s.battle.hazards.events.push(structuredClone(s.battle.hazards.events[0])),
    'negative severity':s=>s.battle.hazards.severity=-1,
  });
});

test('Collection and JSON bounds reject malformed data before cloning or migrating it',()=>{
  const saved=snapshot(wave());
  for(const [key,limit] of Object.entries(checkpointLimits)){
    const bad=structuredClone(saved);bad.battle[key]=Array(limit+1).fill(null);
    assert.equal(validMissionCheckpoint(bad),null,key+' bound');
  }
  const cyclic=structuredClone(saved);cyclic.extra=cyclic;assert.equal(validMissionCheckpoint(cyclic),null);
  const deep=structuredClone(saved);let cursor=deep;for(let i=0;i<30;i++)cursor=cursor.extra={};
  assert.equal(validMissionCheckpoint(deep),null);
  rejectChanges(saved,{
    'sparse JSON array':s=>{s.battle.log.length=10;},
    'huge text':s=>s.battle.log[0].text='x'.repeat(5000),
  });
  const callable=structuredClone(saved);callable.extra=()=>0;assert.equal(validMissionCheckpoint(callable),null);
  for(const name of ['mission-v1-mid-drop.json','mission-v2-between-arrivals.json']){
    const old=JSON.parse(readFileSync(new URL('./fixtures/invasion/'+name,import.meta.url)));
    assert.ok(validMissionCheckpoint(old));old.battle.squads[0].order={kind:'hold',x:NaN,z:0};
    assert.equal(validMissionCheckpoint(old),null,'migration cannot hide NaN as JSON null');
  }
});

test('Rejecting an active checkpoint preserves the surrounding campaign bank and conquests',()=>{
  const progress=createProgress();progress.captured.titan=true;progress.matter=321;progress.stars.titan=2;
  const envelope={...progress,activeMission:snapshot(wave())};envelope.activeMission.battle.units[0].type='bad';
  const disk=JSON.stringify(envelope),parsed=JSON.parse(disk);
  assert.equal(validMissionCheckpoint(parsed.activeMission),null);
  assert.deepEqual(validProgress(parsed),validProgress(progress));assert.equal(JSON.stringify(parsed),disk);
});

test('Active weather, artillery and ordinary save boundaries remain valid on all seven planets',()=>{
  for(const planet of planets){
    const b=wave(planet);let sawHazard=false,sawStrike=false;
    for(let second=0;second<220;second++){
      if(b.tier>0)b.alarm=99;
      run(b,1);
      sawHazard||=b.hazards.events.length>0;sawStrike||=b.strikes.length>0;
      assert.ok(validMissionCheckpoint(snapshot(b)),`${planet.id} at ${b.time}`);
    }
    assert.ok(sawHazard,planet.id+' exercises hazard events');
    if(b.tier>=3)assert.ok(sawStrike,planet.id+' exercises artillery or lightning');
  }
});
