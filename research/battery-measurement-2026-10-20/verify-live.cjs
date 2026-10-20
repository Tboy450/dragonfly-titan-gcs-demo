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
    await page.locator('#inspection-part').selectOption('battery-sensor'); await page.locator('#inspection-isolate').check();
    await page.locator('#component-temperatures summary').click();
    await page.locator('#part-title').filter({ hasText: '20.' }).waitFor();
    assert.match(await page.locator('#part-role').textContent(), /measurement annotation, not a modeled sensor package/);
    assert.match(await page.locator('#part-assumptions').textContent(), /20 of the 24/);
    const moduleText = await page.evaluate(async b => {
      const response = await fetch(new URL(`./battery-measurement.mjs?v=${b}`, location.href));
      if (!response.ok) throw new Error(`Module ${response.status}`); return response.text();
    }, build);
    assert.match(moduleText, /battery-measurement-annotation-2026-10-20/);
    const links = await page.locator('#part-sources a').evaluateAll(a => a.map(x => x.href));
    assert.ok(links.some(x => x.includes('TFAWS23-AT-14'))); assert.ok(links.some(x => x.includes('a6b6bdc1')));
    for (const width of [1440, 390, 360]) for (const layer of ['internal', 'thermal']) {
      await page.setViewportSize({ width, height: 1100 }); await page.locator(`[data-layer="${layer}"]`).click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `live-${build}-${layer}-${width}.png`) }); checks.push({ width, layer });
    }
    await page.locator('#inspection-part').selectOption('battery');
    await page.locator('#inspection-layers summary').click(); await page.locator('#inspection-part-equipment-covers').uncheck();
    await page.locator('#flight-canvas').screenshot({ path: path.join(output, `live-${build}-covers-hidden.png`) });
    await page.locator('#inspection-restore-layers').click(); assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(), true);
    await page.locator('#inspection-reset').click(); await page.locator('#pilot-view-button').click();
    assert.equal(await page.locator('#vehicle-inspector').isVisible(), false);
    const loaded = await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name).filter(x => x.includes('battery-measurement.mjs')));
    assert.ok(loaded.some(x => x.endsWith(`?v=${build}`))); assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    const result = { status: 'passed', build, checks, errors, failed, loaded, links, coverHideRestore: true, pilotReturn: true };
    fs.writeFileSync(path.join(output, `live-${build}-checks.json`), JSON.stringify(result, null, 2)); console.log(result);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
