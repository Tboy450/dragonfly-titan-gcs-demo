const {chromium}=require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const out=process.argv[2],url=process.env.DRAGONFLY_URL||'http://127.0.0.1:4199/',live=url.startsWith('https:');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],failed=[],coreRequests=[];let cases=0;
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
  page.on('request',r=>{if(r.url().includes('/three.core.min.js'))coreRequests.push(r.url());});
  await page.addInitScript(()=>localStorage.setItem('dragonfly-arrival-seen','1'));
  // App readiness, not unrelated deferred backdrop-image completion, gates interactions.
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('#mission-view-button').click();await page.locator('[data-layer="internal"]').click();
  await page.locator('#part-list > li').first().waitFor({state:'attached'});assert.equal(await page.locator('#part-list > li').count(),24);
  if(!live)await page.evaluate(()=>window.dragonflyState.hold=true);
  const build=await page.locator('#build-label').textContent();if(process.env.DRAGONFLY_BUILD)assert.ok(build.includes(process.env.DRAGONFLY_BUILD),build);
  assert.ok(coreRequests.length&&coreRequests.every(x=>x.includes('?v=')),JSON.stringify(coreRequests));
  await page.evaluate(()=>document.querySelector('#component-temperatures').open=true);
  for(const part of ['attic','hga-actuators','side-cameras']){
   await page.locator('#inspection-part').selectOption(part);await page.locator('#inspection-isolate').check();
   assert.ok(await page.locator('#part-role').textContent());assert.ok(await page.locator('#part-sources a').count()>=3);
   const subs=await page.locator('#inspection-subassembly option').evaluateAll(a=>a.map(x=>x.value));
   for(const sub of subs){
    await page.locator('#inspection-subassembly').selectOption(sub);
    await page.locator('#flight-canvas').screenshot({path:path.join(out,part+'-'+(sub||'all')+'.png')});cases++;
   }
   await page.locator('#inspection-subassembly').selectOption('');
   for(const layer of ['internal','thermal'])for(const width of [1440,390,360]){
    await page.setViewportSize({width,height:width>600?1000:844});await page.locator('[data-layer="'+layer+'"]').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
    await page.locator('#flight-canvas').screenshot({path:path.join(out,part+'-'+layer+'-'+width+'.png')});cases++;
   }
  }
  await page.setViewportSize({width:1440,height:1000});await page.locator('[data-layer="internal"]').click();
  await page.locator('#inspection-part').selectOption('attic');await page.locator('#inspection-subassembly').selectOption('');
  await page.locator('#inspection-isolate').check();await page.locator('#inspection-access-preset').selectOption('open');
  assert.equal(await page.locator('#inspection-part').inputValue(),'');assert.equal(await page.locator('#inspection-isolate').isChecked(),false);
  await page.locator('#flight-canvas').screenshot({path:path.join(out,'open-interior.png')});
  for(const width of [390,360]){
   await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
   await page.locator('#flight-canvas').screenshot({path:path.join(out,'open-interior-'+width+'.png')});
  }
  await page.locator('#inspection-access-preset').selectOption('all');assert.equal(await page.locator('#inspection-access-preset').inputValue(),'all');
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.querySelector('#inspection-layers').open=true);
  for(const id of ['attic-foam-top','attic-foam-port','attic-foam-starboard','attic-foam-belly','attic-foam-ends','attic-shell','camera-insulation','hga-insulation','insulation']){
   const input=page.locator('#inspection-global-'+id);assert.ok(await input.isEnabled());await input.uncheck();
   assert.equal(await page.locator('#inspection-access-preset').inputValue(),'custom');
   await page.locator('#inspection-restore-layers').click();assert.ok(await input.isChecked());
  }
  for(const part of ['attic','hga-actuators','side-cameras']){
   await page.locator('#inspection-part').selectOption(part);const control=page.locator('#inspection-part-insulation');assert.ok(await control.isEnabled());
   await control.uncheck();await page.locator('#flight-canvas').screenshot({path:path.join(out,part+'-insulation-hidden.png')});
   await page.locator('#inspection-restore-layers').click();assert.ok(await control.isChecked());
  }
  await page.locator('#inspection-part').selectOption('');await page.locator('#inspection-access-preset').selectOption('all');
  await page.locator('#flight-canvas').screenshot({path:path.join(out,'all-layers.png')});
  if(!live){
   const data=await page.evaluate(async()=>{
    const T=await import('./vendor/three/three.module.min.js'),groups=window.dragonflyRenderer.subsystems,manifest={};
    const copy=o=>{const n=o.isMesh?new T.Mesh(o.geometry,o.userData.baseMaterial||o.material):new T.Group();n.name=o.name;n.position.copy(o.position);n.quaternion.copy(o.quaternion);n.scale.copy(o.scale);o.children.forEach(c=>n.add(copy(c)));return n;};
    for(const[name,source]of Object.entries(groups))if(source.userData.label||['starboard-wall','port-wall','wall-end-joints','top-deck','attic'].includes(name)){
     const g=copy(source);g.updateMatrixWorld(true);manifest[name]=[];
     g.traverse(o=>{if(o.isMesh)manifest[name].push({name:o.name,matrix:o.matrixWorld.toArray(),positions:Array.from(o.geometry.attributes.position.array)});});
    }
    const scene=new T.Scene();scene.background=new T.Color(0xe2e7e9);scene.add(new T.HemisphereLight(0xffffff,0x63727a,2.5));
    const sun=new T.DirectionalLight(0xffffff,3.5);sun.position.set(3,5,4);scene.add(sun);
    const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1200,720);
    const pictures={},pixels={};
    for(const[name,original,hidden]of [
     ['attic',groups.attic],['attic-open',groups.attic,'attic-foam-top'],
     ['hga',groups['hga-actuators']],['hga-open',groups['hga-actuators'],'hga-dome-upper'],
     ['microscope',groups['side-cameras'].getObjectByName('microscopic-camera')],
     ['down-camera',groups['side-cameras'].getObjectByName('port-down-camera')]
    ]){
     const g=copy(original);if(hidden)g.getObjectByName(hidden).visible=false;scene.add(g);g.updateMatrixWorld(true);
     const box=new T.Box3().setFromObject(g),center=box.getCenter(new T.Vector3()),camera=new T.OrthographicCamera(-1,1,1,-1,.001,30);
     camera.position.copy(center).add(new T.Vector3(2,1.8,2));camera.lookAt(center);camera.updateMatrixWorld(true);let hh=0;
     for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
      const v=new T.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse);hh=Math.max(hh,Math.abs(v.y),Math.abs(v.x)/(1200/720));
     }
     hh*=1.12;camera.top=hh;camera.bottom=-hh;camera.left=-hh*1200/720;camera.right=hh*1200/720;camera.updateProjectionMatrix();
     renderer.render(scene,camera);pictures[name]=renderer.domElement.toDataURL();const gl=renderer.getContext(),p=new Uint8Array(1200*720*4);
     gl.readPixels(0,0,1200,720,gl.RGBA,gl.UNSIGNED_BYTE,p);const bg=[...p.slice(0,3)];let count=0,edge=0;
     for(let y=0;y<720;y++)for(let x=0;x<1200;x++){const k=(y*1200+x)*4;if(Math.max(...bg.map((v,c)=>Math.abs(p[k+c]-v)))>25){count++;if(x<3||x>1196||y<3||y>716)edge++;}}
     pixels[name]={count,edge};scene.remove(g);
    }
    renderer.dispose();return{manifest,pictures,pixels};
   });
   fs.writeFileSync(path.join(out,'mesh-manifest.json'),JSON.stringify(data.manifest));
   const baseline=JSON.parse(fs.readFileSync('archive/attic-local-insulation-2026-10-22/before/mesh-manifest.json'));
   for(const[name,list]of Object.entries(baseline))if(name!=='attic'){
    const keep=o=>name==='hga-actuators'?!/hga-(rohacell-dome|dome-(upper|lower)-surface)/.test(o.name)
      :name==='side-cameras'?!/foam-cavity|camera-window|surround/.test(o.name):true;
    const actual=data.manifest[name].filter(keep),expected=list.filter(keep);
    assert.equal(actual.length,expected.length,name+' mesh count');
    for(let i=0;i<actual.length;i++){
     const a=actual[i],b=expected[i],movingFan=name==='fan'&&['','fan-blade'].includes(a.name);
     assert.ok(JSON.stringify(a.positions)===JSON.stringify(b.positions)&&a.name===b.name,name+' geometry '+a.name);
     if(movingFan){
      // Different startup timestamps legitimately change the fan animation phase.
      assert.ok(Math.abs(a.matrix[14]-b.matrix[14])<1e-9,'fan rotor fore/aft mounting unchanged');
      if(!a.name)assert.deepEqual(a.matrix.slice(12,15),b.matrix.slice(12,15),'fan hub installed center');
     }else assert.ok(JSON.stringify(a.matrix)===JSON.stringify(b.matrix),name+' pose '+a.name);
    }
   }
   const bag=list=>list.flatMap(o=>{const r=[];for(let i=0;i<o.positions.length;i+=9)r.push(JSON.stringify(o.positions.slice(i,i+9)));return r;}).sort();
   assert.deepEqual(bag(data.manifest.attic),bag(baseline.attic),'exact original attic surface');
   for(const[name,img]of Object.entries(data.pictures))fs.writeFileSync(path.join(out,'model-'+name+'.png'),Buffer.from(img.split(',')[1],'base64'));
   fs.writeFileSync(path.join(out,'pixel-checks.json'),JSON.stringify(data.pixels,null,2));
   for(const p of Object.values(data.pixels))assert.ok(p.count>3000&&p.edge===0,JSON.stringify(p));
  }
  await page.locator('#pilot-view-button').click();await page.locator('#flight-canvas').screenshot({path:path.join(out,'pilot-return.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  const result={passed:true,live,build,cases,original24Numbers:true,globalMasks:9,componentInsulationMasks:3,openInterior:true,coreRequests,errors,failed};
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
