// Part 21 render check (Claude, October 20, 2026), after Codex's part 20 script in
// research/battery-measurement-2026-10-20. Usage:
//   node verify-render.cjs <output folder> <port> [--baseline]
// Real Edge (Playwright): part 21 selected and isolated in Internal and Thermal at 1440/390/360 px
// (no horizontal page overflow), four orbit angles, a close view, the part text and sources, and
// the return to Pilot view. --baseline records the old sphere from a checkout of the old build.
const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
(async () => {
  const output = process.argv[2], port = Number(process.argv[3]), baseline = process.argv.includes('--baseline');
  assert.ok(output && port); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }), errors = [], checks = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('dragonfly-arrival-seen', '1'));
    await page.goto(`http://127.0.0.1:${port}/`); await page.waitForFunction(() => window.dragonflyRenderer);
    await page.evaluate(() => Object.assign(window.dragonflyState, { view: 'mission', hold: true, vehicleModel: 'research' }));
    await page.locator('[data-layer="internal"]').click(); await page.locator('#inspection-part').selectOption('mmrtg-sensor');
    await page.locator('#inspection-isolate').check();
    for (const layer of ['internal', 'thermal']) for (const width of [1440, 390, 360]) {
      await page.setViewportSize({ width, height: 1000 }); await page.locator(`[data-layer="${layer}"]`).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `no overflow at ${width}`);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `${layer}-${width}.png`) }); checks.push({ layer, width });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-layer="internal"]').click();
    for (const angle of [0, 1.5, 3.1, 4.7]) {
      await page.evaluate(a => Object.assign(window.dragonflyState.inspector, { azimuth: a, elevation: .55 }), angle);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `angle-${angle}.png`) });
    }
    await page.evaluate(() => Object.assign(window.dragonflyState.inspector, { azimuth: 2.4, elevation: 1, zoom: 3 }));
    await page.locator('#flight-canvas').screenshot({ path: path.join(output, 'close.png') });
    // The part list entry: title, text and sources as a reader sees them.
    await page.evaluate(() => { window.dragonflyState.selectedPart = 'mmrtg-sensor'; });
    await page.waitForFunction(() => document.getElementById('part-title')?.textContent.startsWith('21.'));
    const detail = await page.evaluate(() => ({
      title: document.getElementById('part-title').textContent,
      placement: document.getElementById('part-placement').textContent,
      role: document.getElementById('part-role').hidden ? '' : document.getElementById('part-role').textContent,
      live: document.getElementById('part-live').hidden ? '' : document.getElementById('part-live').textContent,
      sources: [...document.querySelectorAll('#part-sources a')].map(a => [a.textContent, a.href]),
      meshes: (() => { const out = []; window.dragonflyRenderer.subsystems['mmrtg-sensor'].traverse(o => { if (o.isMesh) out.push([o.name, o.geometry.type]); }); return out; })(),
    }));
    await page.evaluate(() => { document.getElementById('component-temperatures').open = true; });
    await page.locator('#part-detail').screenshot({ path: path.join(output, 'part-detail-1440.png') });
    const manifest = await page.evaluate(() => {
      const out = {};
      for (const name of ['mmrtg', 'mmrtg-sensor', 'battery', 'battery-sensor']) {
        const group = window.dragonflyRenderer.subsystems[name], meshes = [];
        // Record installed local transforms, independent of display rotation.
        group.updateMatrix();
        const visit = (o, matrix) => {
          o.updateMatrix(); const local = matrix.clone().multiply(o.matrix);
          if (o.isMesh) meshes.push({ name: o.name, matrix: local.toArray(), positions: Array.from(o.geometry.attributes.position.array) });
          o.children.forEach(child => visit(child, local));
        };
        group.children.forEach(child => visit(child, group.matrix)); out[name] = meshes;
      }
      return out;
    });
    fs.writeFileSync(path.join(output, 'mesh-manifest.json'), JSON.stringify(manifest));
    if (!baseline) {
      const prior = JSON.parse(fs.readFileSync(path.join(__dirname, '../../archive/fin-root-sensor-2026-10-21/before/mesh-manifest.json')));
      for (const name of ['mmrtg', 'battery', 'battery-sensor']) assert.equal(JSON.stringify(manifest[name]), JSON.stringify(prior[name]), `${name} unchanged`);
      const intersections = await page.evaluate(async () => {
        const T = await import('./vendor/three/three.module.min.js'), groups = window.dragonflyRenderer.subsystems;
        const points = [], hits = [];
        groups['mmrtg-sensor'].updateWorldMatrix(true, true);
        groups['mmrtg-sensor'].traverse(o => { if (o.isMesh) {
          const p = o.geometry.attributes.position;
          for (let i = 0; i < p.count; i++) points.push([o.name, new T.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld)]);
        } });
        for (const [name, group] of Object.entries(groups)) {
          if (['mmrtg', 'mmrtg-sensor'].includes(name) || !group.userData.label) continue;
          group.updateWorldMatrix(true, true);
          group.traverse(o => { if (o.isMesh) {
            o.geometry.computeBoundingBox(); const inv = o.matrixWorld.clone().invert();
            const bounds = o.geometry.boundingBox.clone().expandByScalar(-1e-7);
            for (const [mine, p] of points) if (bounds.containsPoint(p.clone().applyMatrix4(inv))) { hits.push({ mine, part: name, mesh: o.name }); break; }
          } });
        }
        return hits;
      });
      fs.writeFileSync(path.join(output, 'clearance.json'), JSON.stringify(intersections, null, 2));
      assert.deepEqual(intersections, [], 'sensor clears other numbered parts; own housing/fins tested in generator frame');
      await page.evaluate(() => Object.assign(window.dragonflyState.inspector, { azimuth: 2.4, elevation: .75, zoom: 1 }));
      for (const name of ['fin-root-rtd-element', 'fin-root-rtd-installation']) {
        await page.locator('#inspection-subassembly').selectOption(name);
        for (const layer of ['internal', 'thermal']) for (const width of [1440, 390, 360]) {
          await page.setViewportSize({ width, height: 1000 }); await page.locator(`[data-layer="${layer}"]`).click();
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
          await page.locator('#flight-canvas').screenshot({ path: path.join(output, `${name}-${layer}-${width}.png`) }); checks.push({ name, layer, width });
        }
      }
      await page.locator('#inspection-subassembly').selectOption('');
      await page.evaluate(() => document.querySelector('#inspection-layers').open = true);
      for (const id of ['equipment-casings', 'mounts', 'harnesses']) {
        const input = page.locator(`#inspection-part-${id}`); await input.uncheck();
        await page.locator('#flight-canvas').screenshot({ path: path.join(output, `hidden-${id}.png`) });
        await page.locator('#inspection-restore-layers').click(); assert.equal(await input.isChecked(), true);
      }
      const previews = await page.evaluate(async () => {
        const T = await import('./vendor/three/three.module.min.js');
        const scene = new T.Scene(); scene.background = new T.Color(0xe2e7e9);
        scene.add(new T.HemisphereLight(0xffffff, 0x687884, 3));
        const light = new T.DirectionalLight(0xffffff, 4); light.position.set(2, 4, 6); scene.add(light);
        const copy = o => {
          const n = o.isMesh ? new T.Mesh(o.geometry, o.material.clone()) : new T.Group();
          n.position.copy(o.position); n.quaternion.copy(o.quaternion); n.scale.copy(o.scale); n.name = o.name;
          o.children.forEach(c => n.add(copy(c))); return n;
        };
        const root = copy(window.dragonflyRenderer.subsystems['mmrtg-sensor']); scene.add(root); root.updateMatrixWorld(true);
        const mounted = root.getObjectByName('fin-root-installation-frame');
        const anchor = new T.Vector3(0, 0, .0006).applyMatrix4(mounted.matrixWorld);
        const normal = new T.Vector3(0, .2, 1).transformDirection(mounted.matrixWorld);
        const up = new T.Vector3(0, 1, 0).transformDirection(mounted.matrixWorld);
        const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setSize(1000, 700);
        const images = {}, pixels = {};
        for (const [name, half, center] of [['sensor-macro', .0035, anchor], ['sensor-installation', .009, new T.Box3().setFromObject(root).getCenter(new T.Vector3())]]) {
          const camera = new T.OrthographicCamera(-half * 1000 / 700, half * 1000 / 700, half, -half, .001, 2);
          camera.up.copy(up); camera.position.copy(center).addScaledVector(normal, .15); camera.lookAt(center); renderer.render(scene, camera);
          images[name] = renderer.domElement.toDataURL();
          const gl = renderer.getContext(), data = new Uint8Array(1000 * 700 * 4); gl.readPixels(0, 0, 1000, 700, gl.RGBA, gl.UNSIGNED_BYTE, data);
          const bg = [...data.slice(0, 3)]; let count = 0, minX = 1000, maxX = 0, minY = 700, maxY = 0;
          for (let y = 0; y < 700; y++) for (let x = 0; x < 1000; x++) {
            const k = (y * 1000 + x) * 4;
            if (Math.max(...bg.map((v, c) => Math.abs(data[k + c] - v))) > 25) { count++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
          }
          pixels[name] = { count, minX, maxX, minY, maxY };
        }
        renderer.dispose(); return { images, pixels };
      });
      for (const [name, url] of Object.entries(previews.images)) fs.writeFileSync(path.join(output, `${name}.png`), Buffer.from(url.split(',')[1], 'base64'));
      assert.ok(previews.pixels['sensor-macro'].count > 1500);
      const p = previews.pixels['sensor-installation']; assert.ok(p.count > 1000 && p.minX > 10 && p.maxX < 990 && p.minY > 10 && p.maxY < 690);
      fs.writeFileSync(path.join(output, 'pixel-checks.json'), JSON.stringify(previews.pixels, null, 2));
    }
    await page.locator('#pilot-view-button').click(); assert.equal(await page.evaluate(() => window.dragonflyState.view), 'pilot');
    if (!baseline) {
      assert.match(detail.title, /RTD family approximation/);
      assert.match(detail.role, /Omega F2020 Class B/);
      assert.ok(detail.sources.some(([, href]) => href.includes('mmrtg-factsheet')));
      assert.ok(detail.sources.some(([, href]) => href.includes('F1500_F2000_F4000.pdf')));
    }
    assert.deepEqual(errors, []);
    const result = { status: 'passed', baseline, port, checks, errors, detail, pilotReturn: true };
    fs.writeFileSync(path.join(output, 'render-checks.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 1).slice(0, 1500));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
