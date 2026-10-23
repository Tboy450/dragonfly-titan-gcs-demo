const {chromium}=require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}});await p.goto('http://127.0.0.1:4199/');
 await p.locator('#mission-view-button').click();await p.locator('[data-layer="internal"]').click();
 await p.locator('#inspection-part').selectOption('side-cameras');await p.locator('#inspection-isolate').check();
 await p.locator('#inspection-subassembly').selectOption('port-down-camera-insulation-surround');
 await p.locator('#flight-canvas').screenshot({path:'archive/attic-local-insulation-2026-10-22/draft-camera-rims/port-down-surround.png'});
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
