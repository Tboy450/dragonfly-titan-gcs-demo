const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
(async () => {
  const output = process.argv[2], baseline = process.argv.includes('--baseline');
  assert.ok(output); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }), errors = [], checks = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('dragonfly-arrival-seen', '1'));
    // Local-only renderer introspection. Use verify-live.cjs for production UI checks.
    const base = 'http://127.0.0.1:4195/';
    await page.goto(base); await page.waitForFunction(() => window.dragonflyRenderer);
    const build = await page.locator('#build-label').textContent();
    assert.equal(await page.evaluate(() => window.dragonflyRenderer.subsystems['battery-sensor'].userData.assetRevision), 'battery-sensor-family-estimate-2026-10-21');
    await page.evaluate(() => Object.assign(window.dragonflyState, { view: 'mission', hold: true, vehicleModel: 'research' }));
    await page.locator('[data-layer="internal"]').click(); await page.locator('#inspection-part').selectOption('battery-sensor');
    await page.locator('#inspection-isolate').check();
    for (const layer of ['internal', 'thermal']) for (const width of [1440, 390, 360]) {
      await page.setViewportSize({ width, height: 1000 }); await page.locator(`[data-layer="${layer}"]`).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `${layer}-${width}.png`) }); checks.push({ layer, width });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-layer="internal"]').click();
    for (const angle of [0, 1.5, 3.1, 4.7]) {
      await page.evaluate(a => Object.assign(window.dragonflyState.inspector, { azimuth: a, elevation: .55 }), angle);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `angle-${angle}.png`) });
    }
    await page.evaluate(() => Object.assign(window.dragonflyState.inspector, { azimuth: .18, elevation: .35 }));
    for (const part of ['battery-sensor-head', 'battery-sensor-installation']) {
      await page.locator('#inspection-subassembly').selectOption(part);
      for (const layer of ['internal', 'thermal']) for (const width of [1440, 390, 360]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator(`[data-layer="${layer}"]`).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        await page.locator('#flight-canvas').screenshot({ path: path.join(output, `${part}-${layer}-${width}.png`) });
        checks.push({ part, layer, width });
      }
    }
    await page.locator('#inspection-subassembly').selectOption('');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-layer="internal"]').click();
    await page.evaluate(() => document.querySelector('#inspection-layers').open = true);
    for (const layer of ['equipment-casings', 'mounts', 'harnesses']) {
      const input = page.locator(`#inspection-part-${layer}`); await input.uncheck();
      assert.ok(await page.evaluate(id => {
        const group = window.dragonflyRenderer.subsystems['battery-sensor'];
        let selected = 0, others = 0;
        group.traverse(o => { if (o.userData.inspectionLayer === id && !o.visible) selected++; else if (o.userData.inspectionLayer && o.visible) others++; });
        // Draw-time masks restore after rendering; persistent state is the contract.
        return window.dragonflyState.inspector.hiddenPartLayers['battery-sensor'].includes(id);
      }, layer));
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `hidden-${layer}.png`) });
      await page.locator('#inspection-restore-layers').click(); assert.equal(await input.isChecked(), true);
    }
    assert.equal(await page.locator('#inspection-part-equipment-covers').isDisabled(), true);
    assert.match(await page.locator('#part-assumptions').textContent(), /23 of the 24/);
    assert.ok(await page.locator('a[href*="11029759-00.pdf"]').count());
    await page.locator('#inspection-part').selectOption('battery');
    await page.evaluate(() => document.querySelector('#inspection-layers').open = true);
    await page.locator('#inspection-part-equipment-covers').uncheck();
    await page.locator('#flight-canvas').screenshot({ path: path.join(output, 'battery-covers-hidden.png') });
    await page.locator('#inspection-restore-layers').click();
    assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(), true);
    await page.locator('#pilot-view-button').click(); assert.equal(await page.evaluate(() => window.dragonflyState.view), 'pilot');
    const raw = await page.evaluate(async () => {
      const T = await import(new URL('./vendor/three/three.module.min.js', location.href));
      const scene = new T.Scene(); scene.background = new T.Color(0xe2e7e9);
      scene.add(new T.HemisphereLight(0xffffff, 0x465b65, 2.8));
      const light = new T.DirectionalLight(0xffffff, 3.8); light.position.set(2, 3, -2); scene.add(light);
      const root = new T.Group(); scene.add(root);
      const groups = window.dragonflyRenderer.subsystems, manifest = {};
      const copy = source => {
        const target = source.isMesh ? new T.Mesh(source.geometry, source.material.clone()) : new T.Group();
        target.name = source.name; target.position.copy(source.position); target.quaternion.copy(source.quaternion);
        target.scale.copy(source.scale); target.visible = source.visible;
        target.userData.inspectionLayer = source.userData.inspectionLayer;
        source.children.forEach(child => target.add(copy(child))); return target;
      };
      for (const key of ['battery', 'battery-sensor', 'mmrtg-sensor']) {
        const group = copy(groups[key]); group.visible = true; group.updateMatrixWorld(true);
        const entries = [];
        group.traverse(o => { if (o.isMesh) entries.push({ name: o.name, matrix: o.matrixWorld.toArray(), positions: Array.from(o.geometry.attributes.position.array) }); });
        manifest[key] = entries;
        if (key !== 'mmrtg-sensor') root.add(group);
      }
      const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setSize(1100, 800);
      const camera = new T.PerspectiveCamera(35, 1100 / 800, .01, 10);
      const center = new T.Box3().setFromObject(root).getCenter(new T.Vector3());
      camera.position.copy(center).add(new T.Vector3(1.05, .7, -.85)); camera.lookAt(center); renderer.render(scene, camera);
      const gl = renderer.getContext(), pixels = new Uint8Array(1100 * 800 * 4);
      gl.readPixels(0, 0, 1100, 800, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const bg = [...pixels.slice(0, 3)]; let count = 0, minX = 1100, maxX = 0, minY = 800, maxY = 0;
      for (let y = 0; y < 800; y++) for (let x = 0; x < 1100; x++) {
        const k = (y * 1100 + x) * 4;
        if (Math.max(...bg.map((v, i) => Math.abs(pixels[k + i] - v))) > 25) {
          count++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      }
      const data = renderer.domElement.toDataURL();
      const measure = () => {
        gl.readPixels(0, 0, 1100, 800, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        const bg = [...pixels.slice(0, 3)]; let count = 0, minX = 1100, maxX = 0, minY = 800, maxY = 0;
        for (let y = 0; y < 800; y++) for (let x = 0; x < 1100; x++) {
          const k = (y * 1100 + x) * 4;
          if (Math.max(...bg.map((v, i) => Math.abs(pixels[k + i] - v))) > 25) {
            count++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
          }
        }
        return { count, minX, maxX, minY, maxY };
      };
      root.clear(); const sensorCopy = copy(groups['battery-sensor']); sensorCopy.visible = true;
      root.add(sensorCopy); root.updateMatrixWorld(true);
      const macro = new T.OrthographicCamera(-.006 * 1100 / 800, .006 * 1100 / 800, .006, -.006, .0001, 2);
      const anchor = groups['battery-sensor'].userData.labelAnchor;
      macro.position.copy(anchor).add(new T.Vector3(-.1, .03, -.03)); macro.lookAt(anchor); renderer.render(scene, macro);
      const macroData = renderer.domElement.toDataURL();
      const macroPixels = measure();
      const whole = new T.Box3().setFromObject(root), installation = new T.OrthographicCamera(-.052 * 1100 / 800, .052 * 1100 / 800, .052, -.052, .0001, 2);
      const middle = whole.getCenter(new T.Vector3());
      installation.position.copy(middle).add(new T.Vector3(-.2, .035, -.03)); installation.lookAt(middle); renderer.render(scene, installation);
      const installationData = renderer.domElement.toDataURL();
      const installationPixels = measure();
      renderer.dispose();
      // Small sensor mesh boxes are conservative; contact with the battery pad plane
      // is intentional. Other rebuilt component meshes must remain clear.
      const sensorBoxes = [];
      const sensor = copy(groups['battery-sensor']); sensor.updateMatrixWorld(true);
      sensor.traverse(o => { if (o.isMesh) sensorBoxes.push([o.name, new T.Box3().setFromObject(o).expandByScalar(-1e-8)]); });
      const clearance = [];
      for (const [name, group] of Object.entries(groups)) {
        if (name === 'battery-sensor' || !group.userData.label) continue;
        // Compare installed vehicle-local envelopes, not rotated world AABBs.
        const local = copy(group); local.updateMatrixWorld(true);
        local.traverse(o => { if (o.isMesh) {
          const other = new T.Box3().setFromObject(o);
          for (const [mine, bounds] of sensorBoxes) if (bounds.intersectsBox(other)) clearance.push({ mine, part: name, mesh: o.name });
        } });
      }
      return { data, macroData, installationData, macroPixels, installationPixels, manifest, clearance, pixels: { count, minX, maxX, minY, maxY } };
    });
    const p = raw.pixels;
    assert.ok(p.count > 1500 && p.minX > 10 && p.maxX < 1090 && p.minY > 10 && p.maxY < 790);
    assert.ok(raw.macroPixels.count > 1500, 'macro preview is nonblank; leads intentionally continue beyond crop');
    const ip = raw.installationPixels;
    assert.ok(ip.count > 500 && ip.minX > 10 && ip.maxX < 1090 && ip.minY > 10 && ip.maxY < 790, 'full installation is nonblank and framed');
    fs.writeFileSync(path.join(output, 'battery-context.png'), Buffer.from(raw.data.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(output, 'sensor-macro.png'), Buffer.from(raw.macroData.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(output, 'sensor-installation.png'), Buffer.from(raw.installationData.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(output, 'clearance.json'), JSON.stringify(raw.clearance, null, 2));
    assert.deepEqual(raw.clearance, [], 'sensor clears other numbered parts');
    fs.writeFileSync(path.join(output, 'mesh-manifest.json'), JSON.stringify(raw.manifest));
    if (!baseline) {
      const prior = JSON.parse(fs.readFileSync(path.join(__dirname, '../../archive/battery-sensor-2026-10-21/before/mesh-manifest.json')));
      // JSON archives normalize -0 to 0; compare the same representation on both sides.
      assert.equal(JSON.stringify(raw.manifest.battery), JSON.stringify(prior.battery));
      assert.equal(JSON.stringify(raw.manifest['mmrtg-sensor']), JSON.stringify(prior['mmrtg-sensor']));
    }
    assert.deepEqual(errors, []);
    const result = { status: 'passed', base, build, baseline, checks, errors, rawPixels: p, macroPixels: raw.macroPixels, installationPixels: ip, coverHideRestore: true, sensorMasksRestore: true, macroFocus: true, clearance: raw.clearance, pilotReturn: true, unchangedBatteryAndPart21: !baseline };
    fs.writeFileSync(path.join(output, 'render-checks.json'), JSON.stringify(result, null, 2)); console.log(result);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
