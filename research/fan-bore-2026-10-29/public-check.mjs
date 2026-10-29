import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const build=process.argv[2]??'bd5e42b',out=fileURLToPath(new URL('./',import.meta.url));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://tboy450.github.io/dragonfly-titan-gcs-demo/?v='+build,{waitUntil:'networkidle'});
 await page.waitForFunction(b=>document.querySelector('[data-build-stamp]')?.textContent.includes(b),build);
 await page.waitForFunction(()=>document.querySelector('#inspection-part').options.length===33);
 await page.locator('#mission-view-button').click();if(await page.locator('#arrival-skip').isVisible())await page.locator('#arrival-skip').click();
 await page.locator('[data-layer="internal"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('#part-list [data-part]').length===32);
 await page.locator('#inspection-part').selectOption('fan');await page.locator('#inspection-isolate').check();
 await page.locator('#inspection-focus').click();await page.locator('#flight-canvas').screenshot({path:out+'public-fans.png'});
 const panel=page.locator('[data-rf-installation-audit]');assert.equal(await panel.evaluate(e=>e.open),false);
 await page.locator('#avionics-installation').evaluate(e=>{for(let p=e;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;});
 await panel.evaluate(e=>e.open=true);assert.equal(await panel.locator('[data-connection-evidence]').count(),7);
 await panel.locator('[data-connection-evidence="rf-hidden-transition"] button').click();assert.equal(await page.locator('#inspection-part').inputValue(),'hga-actuators');
 await page.locator('#inspection-part').selectOption('fan');
 await page.setViewportSize({width:390,height:844});await page.locator('#flight-canvas').screenshot({path:out+'public-phone.png'});
 const widths=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.equal(widths.client,widths.scroll);
 const text=await page.locator('#part-detail').textContent();assert.match(text,/open circular bores/);
 const geometry=await page.evaluate(async b=>{
  const T=await import('./vendor/three/three.module.min.js?v='+b),M=await import('./thermal-loop.mjs?v='+b),root=new T.Group();
  M.buildFans({parent:root,mesh:(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;}});
  return root.getObjectByName('fan-a-housing').geometry.type;
 },build);assert.equal(geometry,'ExtrudeGeometry');
 assert.deepEqual(errors,[]);
 const result={build,rows:32,options:33,rfRows:7,rfClosedDefault:true,rfFocus:true,fanBoreDisclosure:true,fanHousingGeometry:geometry,widths,errors};
 await writeFile(out+'public-checks.json',JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{await browser.close();}
