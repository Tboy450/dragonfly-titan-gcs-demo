const {chromium}=require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('dragonfly-arrival-seen','1'));
  await page.goto(process.env.DRAGONFLY_URL||'http://127.0.0.1:4195/');await page.waitForFunction(()=>window.dragonflyRenderer);
  await page.waitForFunction(()=>window.dragonflyRenderer.subsystems['nose-electronics'].userData.assetRevision==='nose-electronics-ocellus-outer-estimate-2026-10-19');
  await page.evaluate(()=>Object.assign(window.dragonflyState,{view:'mission',hold:true,vehicleModel:'research'}));
  await page.locator('[data-layer="internal"]').click();await page.locator('#inspection-part').selectOption('nose-electronics');
  await page.locator('#inspection-isolate').check();
  const ids=['ocellus-meb','ocellus-feb','imu-a','imu-b','imu-estimated-support'],checks=[];
  for(const id of ids){await page.locator('#inspection-subassembly').selectOption(id);
   for(const layer of ['internal','thermal'])for(const width of [1440,390,360]){
    await page.setViewportSize({width,height:1000});await page.locator(`[data-layer="${layer}"]`).click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
    await page.locator('#flight-canvas').screenshot({path:path.join(process.argv[2],`${id}-${layer}-${width}.png`)});checks.push({id,layer,width});
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#inspection-subassembly').selectOption('');
  for(const layer of ['internal','thermal'])for(const azimuth of [0,1.5,3.1,4.7]){
   await page.locator(`[data-layer="${layer}"]`).click();
   await page.evaluate(a=>Object.assign(window.dragonflyState.inspector,{azimuth:a,elevation:.55}),azimuth);
   await page.locator('#flight-canvas').screenshot({path:path.join(process.argv[2],`installed-${layer}-${azimuth}.png`)});
   checks.push({layer,azimuth,width:1440});
  }
  await page.locator('[data-layer="internal"]').click();
  await page.locator('#inspection-subassembly').selectOption('ocellus-feb');
  await page.evaluate(()=>document.querySelector('#inspection-layers').open=true);
  await page.locator('#inspection-part-equipment-covers').uncheck();
  assert.ok(await page.evaluate(()=>window.dragonflyState.inspector.hiddenPartLayers['nose-electronics'].includes('equipment-covers')));
  await page.locator('#flight-canvas').screenshot({path:path.join(process.argv[2],'feb-ui-covers-hidden.png')});
  await page.locator('#inspection-restore-layers').click();
  assert.equal(await page.locator('#inspection-part-equipment-covers').isChecked(),true);
  await page.locator('#inspection-isolate').uncheck();
  await page.locator('#inspection-subassembly').selectOption('');
  await page.locator('#flight-canvas').screenshot({path:path.join(process.argv[2],'installed-context.png')});
  await page.locator('#pilot-view-button').click();
  assert.equal(await page.evaluate(()=>window.dragonflyState.view),'pilot');
  const samples=await page.evaluate(async()=>{
   const T=await import(new URL('./vendor/three/three.module.min.js',location.href)),{buildNoseElectronics}=await import(new URL('./nose-electronics.mjs',location.href));
   const scene=new T.Scene();scene.background=new T.Color(0xdde3e5);scene.add(new T.HemisphereLight(0xffffff,0x465b65,2.8));
   const key=new T.DirectionalLight(0xffffff,3.8);key.position.set(2,3,-2);scene.add(key);
   const fill=new T.DirectionalLight(0xffffff,1.8);fill.position.set(-2,1,2);scene.add(fill);
   const root=new T.Group();scene.add(root);const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
   const {units,imus,support}=buildNoseElectronics({parent:root,mesh});support.visible=false;
   const all=[...units,...imus.map(group=>({group,spec:{name:group.name},cover:group.getObjectByName(`${group.name}-cover`)}))];
   const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1100,750);
   const camera=new T.PerspectiveCamera(35,1100/750,.01,10),result=[];
   for(const u of all){all.forEach(v=>v.group.visible=v===u);
    const c=new T.Box3().setFromObject(u.group).getCenter(new T.Vector3());
    for(const open of [false,true]){u.cover.visible=!open;camera.position.copy(c).add(new T.Vector3(.42,.35,-.50));camera.lookAt(c);renderer.render(scene,camera);
     const pixels=new Uint8Array(1100*750*4),gl=renderer.getContext();gl.readPixels(0,0,1100,750,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
     const bg=[...pixels.slice(0,3)];let count=0,minX=1100,maxX=0,minY=750,maxY=0;
     for(let y=0;y<750;y++)for(let x=0;x<1100;x++){
      const k=(y*1100+x)*4;
      if(Math.max(...bg.map((v,i)=>Math.abs(pixels[k+i]-v)))>25){count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
     }
     result.push({name:`${u.spec.name}-${open?'cover-hidden':'closed'}.png`,data:renderer.domElement.toDataURL(),pixels:{count,minX,maxX,minY,maxY}});}
    u.cover.visible=true;
   }
   renderer.dispose();return result;
  });
  for(const s of samples){
   assert.ok(s.pixels.count>1500&&s.pixels.minX>10&&s.pixels.maxX<1090&&s.pixels.minY>10&&s.pixels.maxY<740,`${s.name} nonblank and framed`);
   fs.writeFileSync(path.join(process.argv[2],s.name),Buffer.from(s.data.split(',')[1],'base64'));
  }
  assert.deepEqual(errors,[]);const result={status:'passed',url:page.url(),errors,checks,samples:samples.map(({name,pixels})=>({name,pixels})),coverHideRestore:true,pilotReturn:true};
  fs.writeFileSync(path.join(process.argv[2],'render-checks.json'),JSON.stringify(result,null,2));console.log({status:result.status,errors,checks:checks.length,samples:result.samples});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
