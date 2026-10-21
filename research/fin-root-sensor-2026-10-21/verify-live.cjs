const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
(async () => {
  const build = process.argv[2], output = process.argv[3]; assert.ok(build && output); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' }), errors = [], failed = [], checks = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push(e.message)); page.on('requestfailed', r => failed.push(r.url()));
    await page.addInitScript(() => localStorage.setItem('dragonfly-arrival-seen', '1'));
    await page.goto(`https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=${build}`);
    await page.locator('#build-label').filter({ hasText: `Build ${build}` }).waitFor({ timeout: 25000 });
    await page.locator('#mission-view-button').click(); await page.locator('[data-layer="internal"]').click();
    await page.locator('#inspection-part').selectOption('mmrtg-sensor'); await page.locator('#inspection-isolate').check();
    await page.locator('#component-temperatures summary').click();
    await page.locator('#part-title').filter({ hasText: '21.' }).waitFor();
    assert.match(await page.locator('#part-role').textContent(), /Omega F2020 Class B/);
    assert.match(await page.locator('#part-assumptions').textContent(), /24 of the 24/);
    const moduleText = await page.evaluate(async b => {
      const response = await fetch(new URL(`./mmrtg-measurement.mjs?v=${b}`, location.href));
      if (!response.ok) throw new Error(`Module ${response.status}`); return response.text();
    }, build);
    assert.match(moduleText, /fin-root-rtd-family-estimate-2026-10-21/);
    const links = await page.locator('#part-sources a').evaluateAll(a => a.map(x => x.href));
    assert.ok(links.some(x => x.includes('TFAWS23-AT-14'))); assert.ok(links.some(x => x.includes('F1500_F2000_F4000.pdf')));
    assert.ok(links.some(x => x.includes('mmrtg-factsheet')));
    for (const subassembly of ['', 'fin-root-rtd-element', 'fin-root-rtd-installation']) {
    await page.locator('#inspection-subassembly').selectOption(subassembly);
    for (const width of [1440, 390, 360]) for (const layer of ['internal', 'thermal']) {
      await page.setViewportSize({ width, height: 1100 }); await page.locator(`[data-layer="${layer}"]`).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `live-${build}-${subassembly || 'context'}-${layer}-${width}.png`) }); checks.push({ subassembly, width, layer });
    }
    }
    await page.locator('#inspection-subassembly').selectOption('');
    await page.locator('#inspection-layers summary').click();
    for (const id of ['equipment-casings', 'mounts', 'harnesses']) {
      const input = page.locator(`#inspection-part-${id}`); await input.uncheck();
      assert.equal(await input.isChecked(), false);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `live-${build}-hidden-${id}.png`) });
      await page.locator('#inspection-restore-layers').click(); assert.equal(await input.isChecked(), true);
    }
    await page.locator('#inspection-part').selectOption('battery');
    await page.locator('#inspection-part-equipment-covers').uncheck();
    await page.locator('#flight-canvas').screenshot({ path: path.join(output, `live-${build}-covers-hidden.png`) });
    await page.locator('#inspection-restore-layers').click(); assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(), true);
    await page.locator('#inspection-reset').click(); await page.locator('#pilot-view-button').click();
    assert.equal(await page.locator('#vehicle-inspector').isVisible(), false);
    const loaded = await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name).filter(x => x.includes('mmrtg-measurement.mjs')));
    assert.ok(loaded.some(x => x.endsWith(`?v=${build}`))); assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    const result = { status: 'passed', build, checks, errors, failed, loaded, links, sensorMaskRestore: true, macroFocus: true, coverHideRestore: true, pilotReturn: true };
    fs.writeFileSync(path.join(output, `live-${build}-checks.json`), JSON.stringify(result, null, 2)); console.log(result);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
