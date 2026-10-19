import test from 'node:test';
import assert from 'node:assert/strict';
import { createBattle, requestDrop, stepBattle, orderSquads, objectiveStatus, starsEarned, extractVictory, flatTerrain } from '../dist/invasion/battle.mjs';
import { planets, planetById } from '../dist/invasion/campaign.mjs';
import { objectiveText } from '../dist/invasion/objective-rules.mjs';
import { missionCheckpoint, restoreMissionCheckpoint } from '../dist/invasion/mission-save.mjs';

const cam={focus:{x:0,z:0},distance:230,yaw:0,pitch:.9};
const goal=b=>objectiveStatus(b).find(o=>['towers','jammers'].includes(o.id));
const run=(b,seconds,until=()=>false)=>{for(let i=0;i<seconds*10&&!until();i++)stepBattle(b,.1);};
function arena(type,payload){
  const planet=planetById(type==='watchtower'?'velm':'halcyon');
  const b=createBattle({...planet,hazards:[]},{matter:2000,podSlots:24,unlocks:['scout','link','striker']}),
    target=b.units.find(u=>u.type===type),native=b.units.find(u=>!u.structure);
  const zone=type==='jammer'?b.zones.find(z=>z.kind==='capital'):b.zones.find(z=>z.id===target.home);
  if(type==='jammer')Object.assign(target,{x:zone.x+50,z:zone.z,home:zone.id});
  b.units=[target];b.reinforceIn=10000;b.strikeIn=10000; // Isolate the objective paths from timed reinforcements.
  const home=b.zones[0],drop=requestDrop(b,{x:home.x,z:home.z,payload});assert.ok(drop.ok);
  run(b,11);return {b,target,native,zone,squad:drop.squad};
}

test('All campaign goal labels agree with their live rules, and neutralization explicitly permits both routes',()=>{
  for(const planet of planets){
    const b=createBattle(planet),live=objectiveStatus(b);
    for(const objective of planet.objectives){
      assert.equal(live.find(o=>o.id===objective.id).text,objectiveText(objective));
      if(objective.kind==='destroyType'){
        assert.match(objective.text,/Neutralize every .+ \(destroy or capture\)/);
        assert.ok(b.units.some(u=>u.alive&&u.side==='native'&&u.type===objective.type),'garrison still provides the required target');
      }
    }
  }
});

test('Actual weapon kills satisfy tower and jammer goals and count only live hostiles',()=>{
  for(const type of ['watchtower','jammer']){
    const {b,target,squad}=arena(type,{striker:8});assert.equal(goal(b).done,false);
    orderSquads(b,[squad.id],{kind:'attack',x:target.x,z:target.z,target:target.id});
    run(b,150,()=>!target.alive);
    assert.equal(target.alive,false,type+' is destroyed by combat');assert.equal(b.stats.defensesDestroyed,1);
    assert.equal(goal(b).done,true);assert.equal(goal(b).progress,'0 hostile remaining');
    b.units.push(target);assert.equal(goal(b).done,true,'a dead record awaiting pruning is not an outstanding defense');
  }
});

test('Actual zone capture counts a converted defense; native retaking makes it hostile again',()=>{
  for(const type of ['watchtower','jammer']){
    const {b,target,native,zone,squad}=arena(type,{link:type==='jammer'?1:8});
    // In the capital, approach the far edge outside the jammer's existing 95 m aura.
    // Jammed Links still cannot capture; this test does not weaken that combat rule.
    const x=type==='jammer'?zone.x-55:zone.x;
    orderSquads(b,[squad.id],{kind:'capture',zone:zone.id,x,z:zone.z});
    run(b,400,()=>target.converted);
    assert.equal(target.converted,true,type+' changes side through real capture');
    assert.equal(target.side,'swarm');assert.equal(b.stats.defensesDestroyed,0);
    assert.equal(goal(b).done,true);
    b.units=[target,native];Object.assign(native,{x:zone.x,z:zone.z,hp:1e6,maxHp:1e6});zone.control=.05;
    stepBattle(b,.1);
    assert.equal(zone.captured,false);assert.equal(target.side,'native');
    assert.equal(goal(b).done,false);assert.equal(goal(b).progress,'1 hostile remaining');
  }
});

test('Legacy objective tokens and wording resume with clear labels without mutating old battle data',()=>{
  const {b}=arena('watchtower',{link:1});
  const saved=missionCheckpoint({battle:b,cam});saved.battle.objectives[0].text='Topple every watchtower';
  const before=structuredClone(saved);
  const restored=restoreMissionCheckpoint(saved,flatTerrain);assert.ok(restored);
  assert.equal(restored.battle.objectives[0].kind,'destroyType','no saved rule/schema rename');
  assert.match(goal(restored.battle).text,/destroy or capture/);assert.deepEqual(saved,before);
});

test('Neutralization stars finalize at extraction and use the final hostile ownership state',()=>{
  for(const hostile of [false,true]){
    const {b,target}=arena('watchtower',{link:1});
    if(!hostile){target.side='swarm';target.converted=true;}
    b.victoryAvailable=true;b.victoryAvailableAt=b.time;
    assert.equal(starsEarned(b),0);assert.ok(extractVictory(b));
    assert.equal(starsEarned(b),hostile?2:3);
  }
});

test('Loss, alarm and time goals use their documented boundary, while recovered artifacts remain recovered',()=>{
  const b=createBattle(planetById('titan'));
  b.objectives=[{id:'losses',kind:'maxLosses',value:2,text:'Lose 2 drones or fewer'},
    {id:'alarm',kind:'alarmBelow',value:50,text:'Keep the alarm under 50'},
    {id:'time',kind:'timeUnder',value:600,text:'Win within 10 minutes'},
    {id:'weather',kind:'noHazardLosses',text:'Lose no drones to weather'},
    ...b.objectives.filter(o=>o.kind==='captureZone')];
  b.stats.dronesLost=2;b.stats.alarmPeak=49.9;b.time=600;b.endTime=600;b.outcome='won';
  assert.ok(objectiveStatus(b).filter(o=>['losses','alarm','time','weather'].includes(o.id)).every(o=>o.done));
  b.stats.dronesLost=3;b.stats.alarmPeak=50;b.endTime=600.1;b.stats.hazardLosses=1;
  assert.ok(objectiveStatus(b).filter(o=>['losses','alarm','time','weather'].includes(o.id)).every(o=>o.failed));
  b.specials=['dragonfly'];b.zones.find(z=>z.id==='relic').captured=false;
  assert.equal(objectiveStatus(b).find(o=>o.id==='dragonfly').done,true);
});
