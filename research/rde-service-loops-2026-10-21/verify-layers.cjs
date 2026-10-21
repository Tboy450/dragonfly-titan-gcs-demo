const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
(async () => {
  const output = process.argv[2], build = process.argv[3]; assert.ok(output); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' }), errors = [], failed = [], checks = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push(e.message)); page.on('requestfailed', r => failed.push(r.url()));
    await page.addInitScript(() => localStorage.setItem('dragonfly-arrival-seen', '1'));
    await page.goto(build ? `https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=${build}` : 'http://127.0.0.1:4195/');
    if (build) await page.locator('#build-label').filter({ hasText: `Build ${build}` }).waitFor({ timeout: 25000 });
    else await page.evaluate(() => { window.dragonflyState.hold = true; });
    await page.locator('#mission-view-button').click(); await page.locator('[data-layer="internal"]').click();
    await page.locator('#inspection-part').selectOption('rde'); await page.locator('#inspection-isolate').check();
    await page.locator('#component-temperatures summary').click();
    await page.locator('#part-role').filter({ hasText: 'initial part 09 pass complete' }).waitFor();
    assert.match(await page.locator('#part-assumptions').textContent(), /22 of the 24/);
    const links = await page.locator('#part-sources a').evaluateAll(a => a.map(x => x.href));
    assert.ok(links.some(x => x.includes('NASA-STD-87394'))); assert.ok(links.some(x => x.includes('2026/09/02')));
    await page.evaluate(() => document.querySelector('#inspection-layers').open = true);
    const harness = page.locator('#inspection-part-harnesses'), interfaces = page.locator('#inspection-part-interfaces');
    assert.equal(await harness.isDisabled(), false); assert.equal(await interfaces.isDisabled(), false);
    for (const width of [1440, 390, 360]) for (const layer of ['internal', 'thermal']) {
      await page.setViewportSize({ width, height: 1000 }); await page.locator(`[data-layer="${layer}"]`).click();
      await page.locator('#inspection-subassembly').selectOption(width === 390 ? 'rde-1' : 'rde-2');
      if (await page.locator('#inspection-restore-layers').isEnabled()) await page.locator('#inspection-restore-layers').click();
      await harness.uncheck(); assert.equal(await interfaces.isChecked(), true);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `${layer}-${width}-harness-hidden.png`) });
      await harness.check(); await interfaces.uncheck(); assert.equal(await harness.isChecked(), true);
      await page.locator('#flight-canvas').screenshot({ path: path.join(output, `${layer}-${width}-interfaces-hidden.png`) });
      await page.locator('#inspection-restore-layers').click();
      assert.equal(await harness.isChecked(), true); assert.equal(await interfaces.isChecked(), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      checks.push({ width, layer, independentHarnessAndInterfaces: true });
    }
    await page.locator('#inspection-reset').click(); await page.locator('#pilot-view-button').click();
    assert.equal(await page.locator('#vehicle-inspector').isVisible(), false);
    if (build) {
      const source = await page.evaluate(async b => {
        const r = await fetch(new URL(`./rotor-drive-electronics.mjs?v=${b}`, location.href));
        if (!r.ok) throw new Error(`module ${r.status}`); return r.text();
      }, build); assert.match(source, /rde-2026-10-21-service-loops/);
    }
    assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    const result = { status: 'passed', build: build || 'local', checks, errors, failed, links, pilotReturn: true };
    fs.writeFileSync(path.join(output, 'layer-checks.json'), JSON.stringify(result, null, 2)); console.log(result);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
