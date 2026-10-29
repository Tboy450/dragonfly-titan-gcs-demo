import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const build=process.argv[2];if(!build)throw Error('Provide deployed build');
const out=fileURLToPath(new URL('./',import.meta.url)),errors=[];
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://tboy450.github.io/dragonfly-titan-gcs-demo/?v='+build,{waitUntil:'networkidle'});
 await page.waitForFunction(b=>document.querySelector('[data-build-stamp]')?.textContent.includes(b),build);
 await page.locator('#mission-view-button').click();if(await page.locator('#arrival-skip').isVisible())await page.locator('#arrival-skip').click();
 await page.locator('[data-layer="internal"]').click();await page.waitForFunction(()=>document.querySelectorAll('#part-list [data-part]').length===32);
 await page.locator('#inspection-part').selectOption('underfloor-duct');await page.locator('#inspection-subassembly').selectOption('warm-duct-fan-transition');await page.locator('#inspection-isolate').check();
 assert.equal(await page.locator('#inspection-subassembly').inputValue(),'warm-duct-fan-transition');
 await page.locator('#flight-canvas').screenshot({path:out+'public-transition.png'});
 const state=await page.evaluate(async b=>{
  const M=await import('./thermal-loop.mjs?v='+b);return{wallM:M.fanDuctInterfaceAsset.wallM,throatM:M.fanDuctInterfaceAsset.fanThroatM,flightConfirmed:M.fanDuctInterfaceAsset.flightGeometryConfirmed};
 },build);assert.equal(state.wallM,.0015);assert.equal(state.throatM,.016);assert.equal(state.flightConfirmed,false);
 assert.match(await page.locator('#part-detail').textContent(),/7 mm gap/);
 await page.locator('[data-layer="thermal"]').click();await page.locator('#flight-canvas').screenshot({path:out+'public-thermal.png'});
 await page.locator('[data-layer="internal"]').click();await page.setViewportSize({width:390,height:844});
 await page.locator('#flight-canvas').screenshot({path:out+'public-phone.png'});
 const widths=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.equal(widths.client,widths.scroll);assert.deepEqual(errors,[]);
 const r={build,part:18,focus:'warm-duct-fan-transition',rows:32,options:await page.locator('#inspection-part option').count(),singleDetailVisible:await page.locator('#inspection-subassembly').isVisible(),state,widths,errors};
 await writeFile(out+'public-checks.json',JSON.stringify(r,null,2)+'\n');console.log(r);
}finally{await browser.close();}
