import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './helpers/invasion-ui-harness.mjs';

function arena(phone = true) {
  const h = harness(null, { renderer: true });
  h.start();
  h.context.phoneViewport = phone;
  h.run(`window.matchMedia = () => ({ matches: phoneViewport });
    startMission(planetById('titan')); closeDropPanel();`);
  h.panels = () => ['objectives-box', 'log-box'].map(id => h.nodes.get(id).open);
  h.capture = () => h.run('mission.battle.stats.zonesCaptured++; updateHud();');
  return h;
}

test('Phone instructions remain open until a capture, then both panels collapse', () => {
  const h = arena();
  assert.deepEqual(h.panels(), [true, true]);
  h.run('updateHud();');
  assert.deepEqual(h.panels(), [true, true]);
  h.capture();
  assert.deepEqual(h.panels(), [false, false]);
});

test('Manually reopened panels stay open through later updates and captures', () => {
  const h = arena(); h.capture();
  h.nodes.get('log-box').open = true;
  h.capture();
  assert.deepEqual(h.panels(), [false, true]);
  h.nodes.get('objectives-box').open = true;
  h.run('updateHud();');
  assert.deepEqual(h.panels(), [true, true]);
});

test('Wide screens keep panels open; narrowing compacts once and a new mission resets them', () => {
  const h = arena(false); h.capture();
  assert.deepEqual(h.panels(), [true, true]);
  h.context.phoneViewport = true;
  h.run('updateHud();');
  assert.deepEqual(h.panels(), [false, false]);
  h.run(`startMission(planetById('titan'));`);
  assert.deepEqual(h.panels(), [true, true]);
  h.capture();
  assert.deepEqual(h.panels(), [false, false]);
});

test('Resumed captured missions start compact on phones, with their log retained', () => {
  const h = arena(); h.capture();
  const before = h.nodes.get('hud-log').innerHTML;
  h.run(`const checkpoint = missionCheckpoint(mission); startMission(planetById('titan'), checkpoint);`);
  assert.equal(h.json('mission.paused'), true);
  assert.deepEqual(h.panels(), [false, false]);
  assert.equal(h.nodes.get('hud-log').innerHTML, before);
  h.context.phoneViewport = false;
  h.run(`startMission(planetById('titan'), checkpoint);`);
  assert.deepEqual(h.panels(), [true, true]);
});

test('Collapsed log still updates and warns; open details do not block keyboard commands', () => {
  const h = arena(); h.capture();
  h.run(`mission.battle.log.push({text:'Incoming raid',tone:'warn'}); handleEvents([]); updateHud();`);
  assert.match(h.nodes.get('hud-log').innerHTML, /Incoming raid/);
  assert.ok(h.nodes.get('toasts').children.some(n => n.textContent === 'Incoming raid'));
  h.nodes.get('log-box').open = true;
  h.nodes.get('objectives-box').open = true;
  h.dispatch('window', 'keydown', { key: 'h', target: { closest: () => null } });
  assert.ok(h.nodes.get('toasts').children.some(n => /select/i.test(n.textContent)));
});
