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
    await page.evaluate(() => Object.assign(window.dragonflyState.inspector, { azimuth: 2.4, elevation: 1, zoom: 4 }));
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
    await page.locator('#pilot-view-button').click(); assert.equal(await page.evaluate(() => window.dragonflyState.view), 'pilot');
    if (!baseline) {
      assert.match(detail.title, /annotation, not sensor hardware/);
      assert.match(detail.role, /measurement annotation/);
      assert.ok(detail.sources.some(([, href]) => href.includes('mmrtg-factsheet')));
      assert.ok(!detail.meshes.some(([, type]) => type === 'SphereGeometry'), 'no sphere left');
    }
    assert.deepEqual(errors, []);
    const result = { status: 'passed', baseline, port, checks, errors, detail, pilotReturn: true };
    fs.writeFileSync(path.join(output, 'render-checks.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 1).slice(0, 1500));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
