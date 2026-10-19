import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { droneModels } from '../dist/invasion/models.mjs';

const baseline = JSON.parse(readFileSync(new URL('../archive/scout-polish-2026-10-19/baseline-geometry.json', import.meta.url), 'utf8'));

test('Scout polish retains deployment/instancing envelope, rotor anchors and squad lights within a bounded geometry cost', () => {
  const models = droneModels(), scout = models.scout;
  try {
    assert.equal(scout.scale, baseline.scale);
    assert.deepEqual(scout.rotors, baseline.rotors);
    for (const name of ['position', 'normal', 'color']) {
      const field = { position: 'positions', normal: 'normals', color: 'colors' }[name];
      assert.deepEqual([...scout.glow.getAttribute(name).array], baseline.glow[field], 'existing squad lights unchanged');
    }
    const oldBounds = [0, 1, 2].map(axis => {
      const values = baseline.body.positions.filter((_, i) => i % 3 === axis);
      return [Math.min(...values), Math.max(...values)];
    });
    const positions = scout.body.getAttribute('position');
    assert.ok(positions.count <= baseline.body.positions.length / 3 * 1.4, 'CPU template vertex increase capped at 40%; not a GPU benchmark');
    for (let i = 0; i < positions.count; i++) {
      const xyz = [positions.getX(i), positions.getY(i), positions.getZ(i)];
      xyz.forEach((value, axis) => {
        assert.ok(Number.isFinite(value));
        assert.ok(value >= oldBounds[axis][0] - 1e-6 && value <= oldBounds[axis][1] + 1e-6, 'body stays inside prior envelope');
      });
      const normals = scout.body.getAttribute('normal');
      const length = Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i));
      assert.ok(Math.abs(length - 1) < 1e-5, 'finite unit normals for existing lighting');
    }
    assert.deepEqual(Object.keys(scout.body.attributes).sort(), ['color', 'normal', 'position']);
    assert.equal(scout.body.index, null, 'same merged non-indexed body contract');
  } finally {
    for (const model of Object.values(models)) { model.body.dispose(); model.glow.dispose(); }
  }
});
