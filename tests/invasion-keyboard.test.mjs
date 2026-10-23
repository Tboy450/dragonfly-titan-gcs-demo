// Keyboard paths and shortcut safety (ACCESS-01), run through the real entry point.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldGuide } from '../dist/invasion/field-guide.mjs';
import { harness } from './helpers/invasion-ui-harness.mjs';

// Titan with one landed Scout squad; `squad` selects it. The stand-in renderer's middle of the
// screen is the ground point (400, 300).
function arena(squad = true) {
  const h = harness(null, { renderer: true }); h.start();
  h.run(`startMission(planetById('titan')); closeDropPanel(); mission.battle.matter = 1000;
    const home = mission.battle.zones[0], drop = requestDrop(mission.battle, { x: home.x, z: home.z, payload: { scout: 1 } });
    for (let i = 0; i < 110; i++) stepBattle(mission.battle, .1);
    mission.selected = new Set(${squad} ? [drop.squad.id] : []); mission.paused = true; mission.battle.events = [];`);
  h.key = (key, extra = {}) => h.dispatch('window', 'keydown', { key, target: { closest: () => null }, ...extra });
  h.toasts = () => h.nodes.get('toasts').children.map(n => n.textContent);
  h.orders = () => h.json('mission.battle.events.filter(e => e.kind === "order")');
  return h;
}
// A focused element: `closest(selector)` matches when the selector names its tag.
const focused = tag => ({ closest: selector => (selector.split(',').some(s => s.trim().startsWith(tag)) ? {} : null) });

test('Enter orders the selected squads to the middle of the screen; Shift+Enter adds a waypoint', () => {
  const h = arena();
  const event = h.key('Enter');
  assert.equal(event.defaultPrevented, true);
  assert.equal(h.orders().length, 1);
  const order = h.json('mission.battle.units.find(u => u.side === "swarm").order');
  assert.ok(Math.hypot(order.x - 400, order.z - 300) < 30, JSON.stringify(order));
  h.key('Enter', { shiftKey: true });
  assert.ok(h.toasts().some(t => /Waypoint added/.test(t)));
});

test('Enter with nothing selected explains instead of doing nothing', () => {
  const h = arena(false);
  h.key('Enter');
  assert.equal(h.orders().length, 0);
  assert.ok(h.toasts().some(t => /Select a squad first/.test(t)));
});

test('Space and Enter on a focused button press the button, not the game', () => {
  const h = arena();
  for (const key of [' ', 'Enter']) {
    const event = h.key(key, { target: focused('button') });
    assert.notEqual(event.defaultPrevented, true);
  }
  assert.equal(h.json('mission.paused'), true);
  assert.equal(h.orders().length, 0);
  // Other shortcuts still work with a button focused.
  h.run('mission.battle.squads.at(-1).order = { kind: "move", x: 0, z: 0 };');
  h.key('h', { target: focused('button') });
  assert.equal(h.json('mission.battle.squads.at(-1).order.kind'), 'hold');
});

test('Shortcuts are silent in menus and fields and with Ctrl, Alt or Cmd held', () => {
  const h = arena(false);
  for (const tag of ['select', 'input', 'textarea']) h.key('h', { target: focused(tag) });
  for (const mod of ['ctrlKey', 'altKey', 'metaKey']) { h.key('h', { [mod]: true }); h.key(' ', { [mod]: true }); }
  assert.deepEqual(h.toasts(), []);
  assert.equal(h.json('mission.paused'), true);
  h.key(' ');
  assert.equal(h.json('mission.paused'), false);
});

test('A squad number selects it, and pressed again brings the camera to it', () => {
  const h = arena(false);
  h.run('mission.cam.focus = { x: -200, z: -200 };');
  h.key('1');
  assert.equal(h.json('mission.selected.size'), 1);
  h.key('1');
  assert.equal(h.json('mission.selected.size'), 1);
  const focus = h.json('mission.cam.focus'), drone = h.json('mission.battle.units.find(u => u.side === "swarm" && u.alive)');
  assert.ok(Math.hypot(focus.x - drone.x, focus.z - drone.z) < 40, JSON.stringify({ focus, drone: [drone.x, drone.z] }));
  h.key('1', { shiftKey: true });
  assert.equal(h.json('mission.selected.size'), 0);
});

test('Number keys for a squad that does not exist say how many there are', () => {
  const h = arena();
  h.key('4');
  assert.ok(h.toasts().some(t => /There is 1 squad; 4 selects squad 4/.test(t)), h.toasts().join(' | '));
});

test('Placing pods from the keyboard: Enter previews at the middle, Enter again launches', () => {
  const h = arena();
  h.run(`{ const hive = mission.battle.zones[0]; scene.pickGround = () => ({ x: hive.x + 5, z: hive.z }); }
    mission.payload = { scout: 1 }; mission.placing = true; mission.dropPoint = null;`);
  const squads = h.json('mission.battle.squads.length');
  h.key('Enter');
  assert.equal(h.json('mission.placing'), true);
  assert.equal(h.json('!!mission.dropPreview?.ok'), true);
  h.key('Enter');
  assert.equal(h.json('mission.placing'), false);
  assert.equal(h.json('mission.battle.squads.length'), squads + 1);
});

test('B from the keyboard opens the drop panel on its first usable button; Escape returns', () => {
  const h = arena();
  const focus = [];
  for (const id of ['drop-home', 'drop-close', 'drop-button']) h.nodes.get(id).focus = () => focus.push(id);
  h.key('b');
  assert.equal(h.nodes.get('drop-panel').hidden, false);
  assert.equal(focus.at(-1), 'drop-home');
  h.key('Escape');
  assert.equal(h.nodes.get('drop-panel').hidden, true);
  assert.equal(focus.at(-1), 'drop-button');
});

test('The field guide lists a key for every essential action', () => {
  const controls = fieldGuide().find(s => s.section === 'Controls');
  const text = controls.items.flatMap(i => i.facts).join(' ');
  for (const key of ['1-9', 'Enter', 'Space', 'B opens', 'Escape', 'H holds', 'Tab']) assert.ok(text.includes(key), key);
});
