const {chromium}=require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const build=process.argv[2];
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[],failed=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
  await page.addInitScript(()=>localStorage.setItem('dragonfly-arrival-seen','1'));
  await page.goto(`https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=${build}`);
  await page.locator('#build-label').filter({hasText:`Build ${build}`}).waitFor({timeout:25000});
  await page.locator('#mission-view-button').click();await page.locator('[data-layer="internal"]').click();
  await page.locator('#inspection-part').selectOption('nose-electronics');await page.locator('#inspection-isolate').check();
  await page.locator('#component-temperatures summary').click();
  await page.locator('#part-title').filter({hasText:'5.'}).waitFor();
  assert.match(await page.locator('#part-role').textContent(),/Owner-approved outer-structure approximation/);
  assert.match(await page.locator('#part-assumptions').textContent(),/20 of the 24/);
  const moduleText=await page.evaluate(async build=>{
   const response=await fetch(new URL(`./nose-electronics.mjs?v=${build}`,location.href));
   if(!response.ok)throw new Error(`Model module ${response.status}`);return response.text();
  },build);
  assert.match(moduleText,/nose-electronics-ocellus-outer-estimate-2026-10-19/);
  const links=await page.locator('#part-sources a').evaluateAll(a=>a.map(x=>x.href));
  assert.ok(links.some(x=>x.includes('honeywell')));assert.ok(links.some(x=>x.includes('appendix-c.pdf')));
  assert.ok(links.some(x=>x.includes('20230014147')));assert.ok(links.some(x=>x.includes('20240010518')));
  const options=await page.locator('#inspection-subassembly option').evaluateAll(a=>a.map(x=>x.value));
  for(const id of ['ocellus-meb','ocellus-feb','imu-a','imu-b','imu-estimated-support'])assert.ok(options.includes(id));
  for(const width of [1440,390,360]){
   await page.setViewportSize({width,height:1100});await page.locator('#inspection-subassembly').selectOption('ocellus-feb');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
   await page.locator('#flight-canvas').screenshot({path:path.join(__dirname,`live-${build}-ocellus-${width}.png`)});
  }
  await page.locator('#inspection-layers summary').click();await page.locator('#inspection-part-equipment-covers').uncheck();
  await page.locator('[data-layer="thermal"]').click();assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(),false);
  await page.locator('#inspection-restore-layers').click();assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(),true);
  await page.locator('#inspection-reset').click();await page.locator('#pilot-view-button').click();
  assert.equal(await page.locator('#vehicle-inspector').isVisible(),false);
  const loaded=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name).filter(x=>x.includes('nose-electronics.mjs')));
  assert.ok(loaded.some(x=>x.endsWith(`?v=${build}`)));assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  const result={status:'passed',build,errors,failed,loaded,links,options,widths:[1440,390,360]};
  fs.writeFileSync(path.join(__dirname,`live-${build}-ocellus-checks.json`),JSON.stringify(result,null,2));console.log(result);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
