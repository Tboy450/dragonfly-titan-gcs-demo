import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),out=fileURLToPath(new URL('./',import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{try{
 let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),before=p.startsWith('/before/');if(before)p=p.slice(7);
 let path=resolve(root,'.'+p);if(!path.startsWith(root))throw Error('Outside root');
 if(before&&p==='/dist/thermal-loop.mjs')path=resolve(root,'archive/fan-bore-2026-10-29/thermal-loop.mjs');
 res.setHeader('Content-Type',mime[extname(path)]??'application/octet-stream');res.end(await readFile(path));
}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:760}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;
 for(const before of [true,false]){
  await page.goto(base+'/research/fan-bore-2026-10-29/render.html'+(before?'?before':''));
  await page.waitForSelector('canvas[data-nonblank="true"]');
  await page.screenshot({path:out+(before?'before.png':'after.png')});
 }
 await page.setViewportSize({width:1440,height:1050});await page.goto(base+'/dist/index.html');
 await page.waitForFunction(()=>document.querySelector('#inspection-part').options.length===33);
 await page.locator('#mission-view-button').click();if(await page.locator('#arrival-skip').isVisible())await page.locator('#arrival-skip').click();
 await page.locator('[data-layer="internal"]').click();await page.locator('#inspection-part').selectOption('fan');
 await page.locator('#inspection-isolate').check();await page.locator('#inspection-focus').click();
 await page.locator('#flight-canvas').screenshot({path:out+'app-fans.png'});
 await page.locator('#inspection-layers').evaluate(e=>e.open=true);
 await page.locator('#inspection-part-equipment-casings').uncheck();
 await page.locator('#flight-canvas').screenshot({path:out+'app-casings-hidden.png'});
 await page.locator('#inspection-part-equipment-casings').check();
 await page.locator('[data-layer="thermal"]').click();await page.locator('#flight-canvas').screenshot({path:out+'app-thermal.png'});
 await page.locator('[data-layer="internal"]').click();await page.setViewportSize({width:390,height:844});
 await page.locator('#flight-canvas').screenshot({path:out+'app-phone.png'});
 const widths=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 assert.equal(widths.client,widths.scroll);assert.deepEqual(errors,[]);
 const result={beforeAfterNonblank:true,part:'fan',partNumber:17,options:33,casingsHideRestore:true,internalThermal:true,widths,errors};
 await writeFile(out+'browser-checks.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
