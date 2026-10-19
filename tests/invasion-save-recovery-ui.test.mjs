// Actual entry-point wiring with DOM/storage/download stand-ins. No browser/GPU acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createProgress, SAVE_KEY } from '../dist/invasion/campaign.mjs';
import { recoveryBackupPrefix } from '../dist/invasion/save-recovery.mjs';
import { createBattle, requestDrop } from '../dist/invasion/battle.mjs';
import { planetById } from '../dist/invasion/campaign.mjs';
import { missionCheckpoint } from '../dist/invasion/mission-save.mjs';

import { harness } from './helpers/invasion-ui-harness.mjs';

test('Healthy title save controls export the exact original through Blob without changing storage',async()=>{
  const raw=JSON.stringify({...createProgress(),activeMission:null},null,2),h=harness(raw);h.start();
  assert.equal(h.nodes.get('save-notice').hidden,true);assert.deepEqual(h.writes,[]);
  await h.click('save-files-button');assert.equal(h.nodes.get('save-dialog').open,true);
  await h.click('save-download-original');assert.equal(await h.blobs[0].text(),raw);
  assert.match(h.nodes.get('save-action-status').textContent,/download requested/);
  assert.equal(h.revoked.length,1);assert.deepEqual(h.writes,[]);
});

test('A blocked download reports failure without deleting or rewriting the saved file',async()=>{
  const raw='{broken',h=harness(raw);h.start();await h.click('save-review');
  vm.runInContext("URL.createObjectURL=()=>{throw new Error('downloads blocked');};",h.context);
  await h.click('save-download-original');assert.match(h.nodes.get('save-action-status').textContent,/download could not start/i);
  assert.equal(h.data.get(SAVE_KEY),raw);assert.deepEqual(h.writes,[]);
});

test('Recovery confirmation cancel keeps the original; confirmed recovery exposes its preserved backup',async()=>{
  const raw=JSON.stringify({...createProgress(),matter:321,activeMission:{version:999}}),h=harness(raw);h.start();
  assert.equal(h.nodes.get('play-button').disabled,true);assert.equal(h.nodes.get('save-notice').hidden,false);
  await h.click('save-review');await h.confirmAction('save-resolve',false);assert.deepEqual(h.writes,[]);
  await h.confirmAction('save-resolve');assert.equal(h.nodes.get('play-button').disabled,false);
  assert.equal(JSON.parse(h.data.get(SAVE_KEY)).matter,321);assert.equal(JSON.parse(h.data.get(SAVE_KEY)).activeMission,null);
  assert.ok(h.writes[0].key.startsWith(recoveryBackupPrefix));assert.equal(h.writes[0].value,raw);
  assert.equal(h.nodes.get('save-backups').hidden,false);await h.click('save-download-backup');
  assert.equal(await h.blobs[0].text(),raw);
});

test('Backup failure keeps recovery blocked and shows a useful explanation in the dialog',async()=>{
  const raw='{broken',h=harness(raw);h.failBackup(true);h.start();await h.click('save-review');await h.confirmAction('save-resolve');
  assert.equal(h.data.get(SAVE_KEY),raw);assert.equal(h.nodes.get('play-button').disabled,true);
  assert.match(h.nodes.get('save-summary').textContent,/backup could not be stored/i);
  h.failBackup(false);await h.confirmAction('save-resolve');assert.equal(h.nodes.get('play-button').disabled,false);
});

test('Storage access failure offers temporary play and can retry reading the original campaign',async()=>{
  const h=harness(JSON.stringify({...createProgress(),matter:777,activeMission:null}));h.failReading(true);h.start();
  assert.equal(h.nodes.get('play-button').textContent,'Play without saving');assert.equal(h.nodes.get('play-button').disabled,false);
  assert.equal(h.nodes.get('reset-button').disabled,true);await h.click('save-files-button');
  await h.click('save-retry-read');assert.match(h.nodes.get('save-action-status').textContent,/storage is unavailable/i);
  h.failReading(false);await h.click('save-retry-read');assert.match(h.nodes.get('save-record').textContent,/777 matter/);
  assert.equal(h.nodes.get('save-notice').hidden,true);assert.deepEqual(h.writes,[]);
});

test('A failed reset never replaces the current in-memory campaign and retains the disk original',async()=>{
  const raw=JSON.stringify({...createProgress(),matter:555,activeMission:null}),h=harness(raw);h.start();h.failPrimary(true);
  await h.confirmAction('reset-button');assert.equal(h.data.get(SAVE_KEY),raw);
  assert.match(h.nodes.get('save-record').textContent,/555 matter/);assert.ok(h.writes.every(w=>w.key!==SAVE_KEY));
  assert.match(h.nodes.get('save-summary').textContent,/could not be written/i);
});

test('Cross-tab conflict preserves unsaved session data; reading newer data requires an explicit choice',async()=>{
  const raw=JSON.stringify({...createProgress(),activeMission:null}),h=harness(raw);h.start();
  h.data.set(SAVE_KEY,JSON.stringify({...createProgress(),matter:999,activeMission:null}));
  vm.runInContext('progress.matter=444;saveProgress();',h.context);await h.click('save-files-button');
  assert.equal(h.nodes.get('play-button').disabled,true);await h.click('save-download-session');
  assert.equal(JSON.parse(await h.blobs[0].text()).matter,444);
  await h.confirmAction('save-retry-read',false);assert.match(h.nodes.get('save-record').textContent,/444 matter/);
  await h.confirmAction('save-retry-read');assert.match(h.nodes.get('save-record').textContent,/999 matter/);
  assert.equal(h.nodes.get('play-button').disabled,false);assert.deepEqual(h.writes,[]);
});

function savedCommandMission(dropPanelOpen){
  const battle=createBattle(planetById('titan'),{matter:1000});
  assert.ok(requestDrop(battle,{x:battle.zones[0].x,z:battle.zones[0].z,payload:{scout:4,link:2}}).ok);
  return missionCheckpoint({battle,cam:{focus:{x:-220,z:180},distance:340,yaw:.6,pitch:.8},
    selected:new Set([1]),payload:{scout:0,link:2},dropPanelOpen,placing:true,dropPoint:{x:999,z:999},speed:3});
}

test('Actual Resume restores command intent while cancelling placement and keeping the battle paused',async()=>{
  const checkpoint=savedCommandMission(true),raw=JSON.stringify({...createProgress(),activeMission:checkpoint});
  const h=harness(raw,{renderer:true});h.start();await h.click('resume-button');
  const restored=JSON.parse(vm.runInContext('JSON.stringify({paused:mission.paused,speed:mission.speed,selected:[...mission.selected],payload:mission.payload,cam:mission.cam,placing:mission.placing,dropPoint:mission.dropPoint,cleanView:mission.cleanView,matter:mission.battle.matter})',h.context));
  assert.equal(restored.paused,true);assert.equal(restored.speed,1);assert.deepEqual(restored.selected,[1]);
  assert.deepEqual(restored.payload,checkpoint.command.payload);assert.deepEqual(restored.cam,checkpoint.cam);
  assert.equal(restored.placing,false);assert.equal(restored.dropPoint,null);assert.equal(restored.cleanView,false);
  assert.equal(restored.matter,checkpoint.battle.matter);assert.equal(h.nodes.get('placement-hint').hidden,true);
  assert.equal(h.nodes.get('placement-launch').disabled,true);assert.equal(h.nodes.get('drop-panel').hidden,false);
  assert.deepEqual(JSON.parse(h.data.get(SAVE_KEY)).activeMission.command.selected,[1],'selection remains saved across VM realms');
});

test('A saved closed drop panel stays closed on Resume and no pod is launched by a stale preview',async()=>{
  const checkpoint=savedCommandMission(false),h=harness(JSON.stringify({...createProgress(),activeMission:checkpoint}),{renderer:true});
  h.start();await h.click('resume-button');assert.equal(h.nodes.get('drop-panel').hidden,true);
  await h.click('placement-launch');
  const disk=JSON.parse(h.data.get(SAVE_KEY));assert.equal(disk.activeMission.battle.stats.drops,1);
  assert.equal(disk.activeMission.battle.pods.length,checkpoint.battle.pods.length);
  assert.equal(disk.activeMission.command.dropPanelOpen,false);
});
