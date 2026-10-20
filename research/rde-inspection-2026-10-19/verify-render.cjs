const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
(async () => {
  const output = process.argv[2], baseline = process.argv.includes('--baseline');
  assert.ok(output, 'Output directory required'); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [], checks = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('dragonfly-arrival-seen', '1'));
    await page.goto(process.env.DRAGONFLY_URL || 'http://127.0.0.1:4195/');
    await page.waitForFunction(() => window.dragonflyRenderer);
    await page.evaluate(() => Object.assign(window.dragonflyState, { view: 'mission', hold: true, vehicleModel: 'research' }));
    await page.locator('[data-layer="internal"]').click();
    await page.locator('#inspection-part').selectOption('rde');
    await page.locator('#inspection-isolate').check();
    const units = baseline ? [''] : ['', 'rde-1', 'rde-2'];
    for (const unit of units) {
      if (!baseline) await page.locator('#inspection-subassembly').selectOption(unit);
      for (const layer of ['internal', 'thermal']) for (const width of [1440, 390, 360]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator(`[data-layer="${layer}"]`).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        await page.locator('#flight-canvas').screenshot({ path: path.join(output, `${unit || 'pair'}-${layer}-${width}.png`) });
        checks.push({ unit, layer, width });
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-layer="internal"]').click();
    if (!baseline) await page.locator('#inspection-subassembly').selectOption('rde-1');
    await page.evaluate(() => document.querySelector('#inspection-layers').open = true);
    await page.locator('#inspection-part-equipment-covers').uncheck();
    assert.ok(await page.evaluate(() => window.dragonflyState.inspector.hiddenPartLayers.rde.includes('equipment-covers')));
    await page.locator('#flight-canvas').screenshot({ path: path.join(output, 'covers-hidden.png') });
    await page.locator('#inspection-restore-layers').click();
    assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(), true);
    if (!baseline) await page.locator('#inspection-subassembly').selectOption('');
    await page.locator('#inspection-isolate').uncheck();
    await page.locator('#flight-canvas').screenshot({ path: path.join(output, 'installed-context.png') });
    await page.locator('#pilot-view-button').click();
    assert.equal(await page.evaluate(() => window.dragonflyState.view), 'pilot');
    const raw = await page.evaluate(async () => {
      const T = await import(new URL('./vendor/three/three.module.min.js', location.href));
      const { buildRotorDriveElectronics } = await import(new URL('./rotor-drive-electronics.mjs', location.href));
      const scene = new T.Scene(); scene.background = new T.Color(0xdde3e5);
      scene.add(new T.HemisphereLight(0xffffff, 0x465b65, 2.8));
      const light = new T.DirectionalLight(0xffffff, 3.8); light.position.set(2, 3, -2); scene.add(light);
      const root = new T.Group(); scene.add(root);
      const mesh = (g, m, p, parent) => { const o = new T.Mesh(g, m); o.position.fromArray(p); parent.add(o); return o; };
      buildRotorDriveElectronics({ parent: root, mesh }); root.updateMatrixWorld(true);
      const manifest = [];
      root.traverse(o => { if (o.isMesh) manifest.push({ name: o.name, matrix: o.matrixWorld.toArray(),
        position: Array.from(o.geometry.attributes.position.array), index: o.geometry.index ? Array.from(o.geometry.index.array) : null,
        color: o.material.color.getHex(), metalness: o.material.metalness, roughness: o.material.roughness }); });
      // Compare by stable mesh identity and geometry, not traversal order after regrouping.
      manifest.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setSize(1100, 750);
      const camera = new T.PerspectiveCamera(35, 1100 / 750, .01, 10), samples = [];
      const center = new T.Box3().setFromObject(root).getCenter(new T.Vector3());
      for (const open of [false, true]) {
        root.traverse(o => { if (o.userData.inspectionLayer === 'equipment-covers') o.visible = !open; });
        camera.position.copy(center).add(new T.Vector3(.65, .5, -.85)); camera.lookAt(center); renderer.render(scene, camera);
        const gl = renderer.getContext(), pixels = new Uint8Array(1100 * 750 * 4);
        gl.readPixels(0, 0, 1100, 750, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        const bg = [...pixels.slice(0, 3)]; let count = 0, minX = 1100, maxX = 0, minY = 750, maxY = 0;
        for (let y = 0; y < 750; y++) for (let x = 0; x < 1100; x++) {
          const k = (y * 1100 + x) * 4;
          if (Math.max(...bg.map((v, i) => Math.abs(pixels[k + i] - v))) > 25) {
            count++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
          }
        }
        samples.push({ name: `rde-pair-${open ? 'covers-hidden' : 'closed'}.png`, data: renderer.domElement.toDataURL(), pixels: { count, minX, maxX, minY, maxY } });
      }
      renderer.dispose(); return { manifest, samples };
    });
    for (const sample of raw.samples) {
      const p = sample.pixels;
      assert.ok(p.count > 1500 && p.minX > 10 && p.maxX < 1090 && p.minY > 10 && p.maxY < 740, `${sample.name}: nonblank and framed`);
      fs.writeFileSync(path.join(output, sample.name), Buffer.from(sample.data.split(',')[1], 'base64'));
    }
    fs.writeFileSync(path.join(output, 'mesh-manifest.json'), JSON.stringify(raw.manifest));
    assert.deepEqual(errors, []);
    const result = { status: 'passed', baseline, checks, samples: raw.samples.map(({ name, pixels }) => ({ name, pixels })), errors, coverHideRestore: true, pilotReturn: true };
    fs.writeFileSync(path.join(output, 'render-checks.json'), JSON.stringify(result, null, 2));
    console.log({ ...result, checks: checks.length });
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
