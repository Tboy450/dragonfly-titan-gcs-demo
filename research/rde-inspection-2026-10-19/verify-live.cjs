const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const build = process.argv[2], output = process.argv[3];
(async () => {
  assert.ok(build && output, 'Build hash and output directory required'); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const errors = [], failed = [], checks = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push(e.message)); page.on('requestfailed', r => failed.push(r.url()));
    await page.addInitScript(() => localStorage.setItem('dragonfly-arrival-seen', '1'));
    await page.goto(`https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=${build}`);
    await page.locator('#build-label').filter({ hasText: `Build ${build}` }).waitFor({ timeout: 25000 });
    await page.locator('#mission-view-button').click(); await page.locator('[data-layer="internal"]').click();
    await page.locator('#inspection-part').selectOption('rde'); await page.locator('#inspection-isolate').check();
    await page.locator('#component-temperatures summary').click();
    await page.locator('#part-title').filter({ hasText: '9.' }).waitFor();
    assert.match(await page.locator('#part-role').textContent(), /provisional enclosure illustration/);
    assert.match(await page.locator('#part-role').textContent(), /separately selectable/);
    assert.match(await page.locator('#part-assumptions').textContent(), /20 of the 24/);
    const moduleText = await page.evaluate(async build => {
      const response = await fetch(new URL(`./rotor-drive-electronics.mjs?v=${build}`, location.href));
      if (!response.ok) throw new Error(`RDE module ${response.status}`); return response.text();
    }, build);
    assert.match(moduleText, /rde-provisional-inspection-2026-10-19/);
    const links = await page.locator('#part-sources a').evaluateAll(a => a.map(x => x.href));
    assert.ok(links.some(x => x.includes('a-a-c.com'))); assert.ok(links.some(x => x.includes('indico.cern.ch')));
    const options = await page.locator('#inspection-subassembly option').evaluateAll(a => a.map(x => x.value));
    for (const id of ['rde-1', 'rde-2']) assert.ok(options.includes(id));
    for (const width of [1440, 390, 360]) for (const unit of ['rde-1', 'rde-2']) {
      await page.setViewportSize({ width, height: 1100 });
      await page.locator('#inspection-subassembly').selectOption(unit);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `live-${build}-${unit}-${width}.png`) });
      checks.push({ width, unit });
    }
    await page.locator('#inspection-layers summary').click();
    await page.locator('#inspection-part-equipment-covers').uncheck();
    await page.locator('[data-layer="thermal"]').click();
    assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(), false);
    await page.locator('#inspection-restore-layers').click();
    assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(), true);
    await page.locator('#inspection-reset').click(); await page.locator('#pilot-view-button').click();
    assert.equal(await page.locator('#vehicle-inspector').isVisible(), false);
    const loaded = await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name).filter(x => x.includes('rotor-drive-electronics.mjs')));
    assert.ok(loaded.some(x => x.endsWith(`?v=${build}`))); assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    const result = { status: 'passed', build, errors, failed, checks, loaded, links, options, coverHideRestore: true, pilotReturn: true };
    fs.writeFileSync(path.join(output, `live-${build}-checks.json`), JSON.stringify(result, null, 2)); console.log(result);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
