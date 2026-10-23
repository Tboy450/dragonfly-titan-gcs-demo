const {chromium}=require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
  const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true,args:process.argv.includes('--http1')?['--disable-http2']:[]});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),pending=new Map(),failed=[],errors=[],events=[];
  if(process.argv.includes('--bust-core'))await page.route('**/three.core.min.js',r=>r.continue({url:r.request().url()+'?probe='+Date.now()}));
  page.on('request',r=>pending.set(r.url(),{url:r.url(),type:r.resourceType()}));
  page.on('requestfinished',r=>pending.delete(r.url()));
  page.on('requestfailed',r=>{pending.delete(r.url());failed.push({url:r.url(),error:r.failure()?.errorText});});
  page.on('pageerror',e=>errors.push(e.message));
  for(const e of ['domcontentloaded','load'])page.on(e,()=>events.push(e));
  try{
    await page.goto('https://tboy450.github.io/dragonfly-titan-gcs-demo/?check='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('#mission-view-button').click({timeout:20000});
    await page.locator('[data-layer="internal"]').click({timeout:20000});
    await page.locator('#part-list > li').first().waitFor({state:'attached',timeout:20000});
  }catch(e){errors.push(e.message);}
  const state=await page.evaluate(()=>({ready:document.readyState,build:document.querySelector('#build-label')?.textContent,parts:document.querySelectorAll('#part-list > li').length}));
  await page.screenshot({path:path.join(out,'load-state.png'),fullPage:false});
  const report={state,events,errors,failed,pending:[...pending.values()]};
  fs.writeFileSync(path.join(out,'load-state.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
