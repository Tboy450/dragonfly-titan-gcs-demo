const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
(async () => {
  const output = process.argv[2], url = process.env.DRAGONFLY_URL || 'http://127.0.0.1:4195/';
  const live = url.startsWith('https:'); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [], failed = [], checks = []; page.on('pageerror', e => errors.push(e.message)); page.on('requestfailed', r => failed.push(r.url()));
    await page.addInitScript(() => localStorage.setItem('dragonfly-arrival-seen', '1'));
    await page.goto(url); await page.locator('#mission-view-button').click();
    await page.locator('[data-layer="internal"]').click();
    if (!live) await page.evaluate(() => window.dragonflyState.hold = true);
    const build = await page.locator('#build-label').textContent();
    if (process.env.DRAGONFLY_BUILD) assert.ok(build.includes(process.env.DRAGONFLY_BUILD), build);
    await page.locator('#inspection-part').selectOption('mmrtg'); await page.locator('#inspection-isolate').check();
    await page.evaluate(() => document.querySelector('#component-temperatures').open = true);
    await page.locator('#part-title').filter({ hasText: 'MMRTG generator body' }).waitFor();
    assert.equal(await page.locator('#part-list > li').count(), 24, 'original numbered list preserved');
    assert.match(await page.locator('#part-role').textContent(), /64 cm.*66 cm/);
    const links = await page.locator('#part-sources a').evaluateAll(a => a.map(x => x.href));
    assert.ok(links.some(x => x.includes('mars-2020s-mmrtg')) && links.some(x => x.includes('20120000731')));
    for (const sub of ['', 'mmrtg-housing-focus', 'mmrtg-fins-focus', 'mmrtg-ends-focus']) {
      await page.locator('#inspection-subassembly').selectOption(sub);
      for (const layer of ['internal', 'thermal']) for (const width of [1440, 390, 360]) {
        await page.setViewportSize({ width, height: 1000 }); await page.locator(`[data-layer="${layer}"]`).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        await page.locator('#flight-canvas').screenshot({ path: path.join(output, `${sub || 'assembly'}-${layer}-${width}.png`) }); checks.push({ sub, layer, width });
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.locator('[data-layer="internal"]').click();
    await page.locator('#inspection-subassembly').selectOption('');
    await page.evaluate(() => document.querySelector('#inspection-layers').open = true);
    assert.equal(await page.locator('#inspection-part-layer-title').textContent(), 'MMRTG generator body');
    for (const id of ['equipment-casings', 'equipment-covers', 'mounts', 'interfaces']) {
      const input = page.locator(`#inspection-part-${id}`); await input.uncheck();
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `hidden-${id}.png`) });
      await page.locator('#inspection-restore-layers').click(); assert.equal(await input.isChecked(), true);
    }
    await page.locator('#inspection-part').selectOption('mmrtg-sensor');
    await page.locator('#part-title').filter({ hasText: '21.' }).waitFor();
    await page.locator('#inspection-subassembly').selectOption('fin-root-rtd-element');
    await page.locator('#flight-canvas').screenshot({ path: path.join(output, 'sensor21-refit.png') });
    if (!live) {
      const raw = await page.evaluate(async () => {
        const T = await import('./vendor/three/three.module.min.js'), groups = window.dragonflyRenderer.subsystems;
        const copy = o => {
          const n = o.isMesh ? new T.Mesh(o.geometry, o.material.clone()) : new T.Group();
          n.name = o.name; n.position.copy(o.position); n.quaternion.copy(o.quaternion); n.scale.copy(o.scale);
          o.children.forEach(c => n.add(copy(c))); return n;
        };
        const manifest = {};
        for (const name of ['mmrtg', 'mmrtg-sensor', 'battery', 'battery-sensor']) {
          const g = copy(groups[name]); g.updateMatrixWorld(true); const meshes = [];
          g.traverse(o => { if (o.isMesh) meshes.push({ name: o.name, matrix: o.matrixWorld.toArray(), positions: Array.from(o.geometry.attributes.position.array) }); }); manifest[name] = meshes;
        }
        const gen = copy(groups.mmrtg); gen.updateMatrixWorld(true);
        const probes = []; gen.traverse(o => { if (o.isMesh) {
          const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) probes.push([o.name, new T.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld)]);
        } });
        const hits = [];
        for (const [name, source] of Object.entries(groups)) {
          if (['mmrtg', 'mmrtg-sensor'].includes(name) || (!source.userData.label && name !== 'fins')) continue;
          const g = copy(source); g.updateMatrixWorld(true);
          g.traverse(o => { if (o.isMesh) {
            o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().expandByScalar(-1e-7), inv = o.matrixWorld.clone().invert();
            for (const [mine, p] of probes) if (b.containsPoint(p.clone().applyMatrix4(inv))) { hits.push({ mine, part: name, mesh: o.name }); break; }
          } });
        }
        const scene = new T.Scene(); scene.background = new T.Color(0xe2e7e9);
        scene.add(new T.HemisphereLight(0xffffff, 0x6d7e86, 2.5));
        const light = new T.DirectionalLight(0xffffff, 3.5); light.position.set(3, 4, 5); scene.add(light);
        const root = new T.Group(); root.add(gen); root.add(copy(groups['mmrtg-sensor'])); scene.add(root);
        const center = new T.Box3().setFromObject(root).getCenter(new T.Vector3());
        const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setSize(1100, 850);
        const pictures = {}, pixels = {};
        for (const [name, offset] of [['model-threequarter', [1.1, .75, 1.35]], ['model-front', [0, .8, 1.65]], ['model-mount', [0, .15, -1.7]]]) {
          const camera = new T.OrthographicCamera(-.50 * 1100 / 850, .50 * 1100 / 850, .50, -.50, .01, 10);
          camera.position.copy(center).add(new T.Vector3(...offset)); camera.lookAt(center); renderer.render(scene, camera);
          pictures[name] = renderer.domElement.toDataURL();
          const gl = renderer.getContext(), data = new Uint8Array(1100 * 850 * 4); gl.readPixels(0, 0, 1100, 850, gl.RGBA, gl.UNSIGNED_BYTE, data);
          const bg = [...data.slice(0, 3)]; let count = 0, minX = 1100, maxX = 0, minY = 850, maxY = 0;
          for (let y = 0; y < 850; y++) for (let x = 0; x < 1100; x++) {
            const k = (y * 1100 + x) * 4;
            if (Math.max(...bg.map((v, c) => Math.abs(data[k + c] - v))) > 25) { count++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
          }
          pixels[name] = { count, minX, maxX, minY, maxY };
        }
        renderer.dispose(); return { manifest, hits, pictures, pixels };
      });
      for (const [name, data] of Object.entries(raw.pictures)) fs.writeFileSync(path.join(output, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
      fs.writeFileSync(path.join(output, 'mesh-manifest.json'), JSON.stringify(raw.manifest));
      fs.writeFileSync(path.join(output, 'clearance.json'), JSON.stringify(raw.hits, null, 2));
      fs.writeFileSync(path.join(output, 'pixel-checks.json'), JSON.stringify(raw.pixels, null, 2));
      assert.deepEqual(raw.hits, [], 'generator clears numbered parts and stabilizers');
      for (const p of Object.values(raw.pixels)) assert.ok(p.count > 5000 && p.minX > 10 && p.maxX < 1090 && p.minY > 10 && p.maxY < 840);
      const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, '../../archive/mmrtg-body-2026-10-22/before/mesh-manifest.json')));
      for (const name of ['battery', 'battery-sensor']) assert.equal(JSON.stringify(raw.manifest[name]), JSON.stringify(baseline[name]), `${name} unchanged`);
    }
    await page.locator('#inspection-part').selectOption('mmrtg'); await page.locator('#inspection-reset').click();
    await page.locator('#pilot-view-button').click(); assert.equal(await page.locator('#vehicle-inspector').isVisible(), false);
    const loaded = await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name).filter(x => x.includes('/mmrtg.mjs')));
    assert.ok(loaded.length); assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    const result = { status: 'passed', live, build, checks, errors, failed, loaded, links, stable24Numbers: true, masksRestore: true, sensor21Refit: true, pilotReturn: true };
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify({ ...result, checks: checks.length }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
