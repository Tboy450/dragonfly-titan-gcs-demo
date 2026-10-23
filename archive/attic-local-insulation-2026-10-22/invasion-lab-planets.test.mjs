import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { planetChoices, planetLayout } from '../dist/invasion/environments/worlds/planets.mjs';
import { moduleWorlds } from '../dist/invasion/environments/worlds/index.mjs';
import { planets, frontiers } from '../dist/invasion/campaign.mjs';
import { createPlanetTerrain } from '../dist/invasion/planet-terrain.mjs';
import { createBattle } from '../dist/invasion/battle.mjs';
import * as core from '../dist/invasion/environments/kit/core.mjs';
import * as scenery from '../dist/invasion/environments/kit/scenery.mjs';

const lab = file => readFileSync(new URL(`../dist/invasion/environments/${file}`, import.meta.url), 'utf8');

test('Campaign planets cover every non-Titan planet and each Frontier map once', () => {
  const ids = planetChoices.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, [...planets.filter(p => p.biome !== 'titan'), ...frontiers].map(p => p.id));
  assert.ok(!ids.includes('titan'));
  assert.equal(planetLayout('../../not-a-planet').planet.id, planetChoices[0].id);
});

test('The lab shows the zones a new mission places, on the same terrain', () => {
  for (const id of ['kepra', 'halcyon', 'aurex', 'velm-frontier']) {
    const { planet, battle } = planetLayout(id);
    const fresh = createBattle(planet, { terrain: createPlanetTerrain(planet), seed: planet.seed });
    assert.deepEqual(battle.zones.map(z => [z.x, z.z, z.radius]), fresh.zones.map(z => [z.x, z.z, z.radius]), id);
    assert.ok(battle.zones.length >= 5, id);
  }
});

test("Aurex's drawn skyline is the solid one and leaves its zones clear; Frontier maps carry a city", () => {
  const { terrain, battle } = planetLayout('aurex');
  assert.ok(terrain.skyline.length > 100);
  for (const tower of terrain.skyline) for (const zone of battle.zones)
    assert.ok(Math.hypot(tower.x - zone.x, tower.z - zone.z) >= zone.radius + 16, tower.id);
  for (const frontier of frontiers) assert.ok(planetLayout(frontier.id).terrain.city, frontier.id);
});

test('Campaign planets are listed in the lab and offer a planet picker', () => {
  assert.equal(typeof moduleWorlds.planets.load, 'function');
  assert.ok(moduleWorlds.planets.info.ownSky && moduleWorlds.planets.info.views.vista);
  assert.match(lab('index.html'), /data-scene="planets"/);
  assert.match(lab('index.html'), /id="world-choices"/);
  assert.match(lab('lab.mjs'), /world\.choices/);
  // One shared three.js: the world reaches it only through the kit, never a ?v=dev three import.
  assert.doesNotMatch(lab('worlds/planets.mjs'), /three\.module\.min\.js/);
});

test('Kit exports the game draws its Frontier cities with are unchanged', () => {
  for (const name of ['THREE', 'rng', 'Batches', 'Massing', 'paint', 'unitBox', 'unitCylinder', 'unitCone', 'lathe', 'shape']) assert.ok(name in core, name);
  for (const name of ['facadeMaterials', 'roofMaterial', 'groundPatch', 'tree']) assert.equal(typeof scenery[name], 'function', name);
  assert.match(lab('kit/core.mjs'), /from "\.\.\/\.\.\/\.\.\/vendor\/three\/three\.module\.min\.js"/);
});
