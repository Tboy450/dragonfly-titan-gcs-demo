import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=fileURLToPath(new URL('../../',import.meta.url)),out=fileURLToPath(new URL('./',import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{
 try{
  let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),before=p.startsWith('/before/');
  if(before)p=p.slice(7);
  let file=resolve(root,'.'+p);if(!file.startsWith(root))throw Error('Outside root');
  if(before&&['/dist/ui/layers-panel.mjs','/dist/ui/sampling-connections.mjs'].includes(p))file=resolve(root,'archive/rf-installation-review-2026-10-29',p.split('/').at(-1));
  res.setHeader('Content-Type',mime[extname(file)]??'application/octet-stream');res.end(await readFile(file));
 }catch{res.statusCode=404;res.end('Not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url='http://127.0.0.1:'+server.address().port;
 const prepare=async()=>{
  await page.locator('#mission-view-button').click();
  if(await page.locator('#arrival-skip').isVisible())await page.locator('#arrival-skip').click();
  await page.locator('[data-layer="internal"]').click();
  await page.locator('#avionics-installation').evaluate(e=>{for(let p=e;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;});
  await page.locator('#avionics-installation').waitFor({state:'visible'});
 };
 await page.goto(url+'/before/dist/index.html');
 await page.waitForFunction(()=>document.querySelector('#inspection-part').options.length===33);
 await prepare();
 await page.locator('#avionics-installation').screenshot({path:out+'before.png'});
 await page.goto(url+'/dist/index.html');
 await page.waitForFunction(()=>document.querySelector('#inspection-part').options.length===33);
 await prepare();
 const panel=page.locator('[data-rf-installation-audit]');
 assert.equal(await panel.evaluate(e=>e.open),false);
 await page.locator('#avionics-installation').evaluate(e=>e.open=true);
 await panel.evaluate(e=>e.open=true);
 const rows=panel.locator('[data-connection-evidence]');assert.equal(await rows.count(),7);
 await panel.screenshot({path:out+'review-panel.png'});
 const ids=await rows.evaluateAll(es=>es.map(e=>e.dataset.connectionEvidence));
 for(const id of ids){
  const row=panel.locator('[data-connection-evidence="'+id+'"]');
  await row.locator('button').click();
  const part=await page.locator('#inspection-part').inputValue();
  assert.equal(part,id==='rf-radio-jumpers'?'frontier-radio':['rf-input','rf-hv','rf-waveguide'].includes(id)?'twta':'hga-actuators');
 }
 await panel.locator('[data-connection-evidence="rf-waveguide"] button').click();
 await page.locator('#flight-canvas').screenshot({path:out+'twta-installed.png'});
 await panel.locator('[data-connection-evidence="rf-hidden-transition"] button').click();
 await page.locator('#flight-canvas').screenshot({path:out+'gimbal-installed.png'});
 await page.locator('[data-layer="thermal"]').click();assert.equal(await panel.isVisible(),true);
 await page.locator('#flight-canvas').screenshot({path:out+'thermal.png'});
 await page.locator('[data-layer="exterior"]').click();assert.equal(await panel.isVisible(),false);
 await page.locator('[data-layer="internal"]').click();
 await page.setViewportSize({width:390,height:844});
 await panel.locator('[data-connection-evidence="rf-hidden-transition"] button').click();
 await page.locator('#flight-canvas').screenshot({path:out+'phone.png'});
 const widths=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 assert.equal(widths.client,widths.scroll);assert.deepEqual(errors,[]);
 const report={rows:7,focusActions:7,numberedOptions:33,closedByDefault:true,thermalVisible:true,exteriorHidden:true,widths,errors};
 await writeFile(out+'browser-checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
