const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
(async () => {
  const out=process.argv[2],before=process.argv.includes('--before');
  const url=process.env.DRAGONFLY_URL||'http://127.0.0.1:4199/',live=url.startsWith('https:');
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const errors=[],failed=[],cases=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
    await page.addInitScript(()=>localStorage.setItem('dragonfly-arrival-seen','1'));
    await page.goto(url,{timeout:90000});await page.locator('#mission-view-button').click();
    await page.locator('[data-layer="internal"]').click();
    if(!live){await page.waitForFunction(()=>window.dragonflyState);await page.evaluate(()=>window.dragonflyState.hold=true);}
    const build=await page.locator('#build-label').textContent();
    if(process.env.DRAGONFLY_BUILD)assert.ok(build.includes(process.env.DRAGONFLY_BUILD),build);
    await page.locator('#part-list > li').first().waitFor({state:'attached'});
    assert.equal(await page.locator('#part-list > li').count(),24);
    const ids=['body-foam-top','body-foam-port','body-foam-starboard','body-foam-belly','body-foam-ends'];
    if(!before){
      await page.locator('#inspection-part').selectOption('fuselage');await page.locator('#inspection-isolate').check();
      await page.evaluate(()=>document.querySelector('#component-temperatures').open=true);
      await page.locator('#part-title').filter({hasText:'Body insulation'}).waitFor();
      assert.match(await page.locator('#part-role').textContent(),/Solimide/);
    }
    for(const sub of before?['']:['',...ids]){
      if(!before)await page.locator('#inspection-subassembly').selectOption(sub);
      for(const layer of ['internal','thermal'])for(const width of [1440,390,360]){
        await page.setViewportSize({width,height:width>600?1000:844});await page.locator(`[data-layer="${layer}"]`).click();
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
        await page.locator('#flight-canvas').screenshot({path:path.join(out,`${sub||'assembly'}-${layer}-${width}.png`)});
        cases.push({sub,layer,width});
      }
    }
    if(!live){
      const data=await page.evaluate(async before=>{
        const T=await import('./vendor/three/three.module.min.js'),groups=window.dragonflyRenderer.subsystems,manifest={},triangles=[];
        const copy=o=>{const n=o.isMesh?new T.Mesh(o.geometry,o.userData.baseMaterial||o.material):new T.Group();
          n.name=o.name;n.position.copy(o.position);n.quaternion.copy(o.quaternion);n.scale.copy(o.scale);o.children.forEach(c=>n.add(copy(c)));return n;};
        for(const[name,source]of Object.entries(groups))if(source.userData.label||['starboard-wall','port-wall','wall-end-joints','top-deck','attic'].includes(name)){
          const g=copy(source);g.updateMatrixWorld(true);manifest[name]=[];
          g.traverse(o=>{if(o.isMesh)manifest[name].push({name:o.name,matrix:o.matrixWorld.toArray(),positions:Array.from(o.geometry.attributes.position.array)});});
        }
        const body=groups.fuselage;
        const addTriangles=o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,a=g.attributes.position.array;
          for(let i=0;i<a.length;i+=9)triangles.push(JSON.stringify(Array.from(a.slice(i,i+9))));};
        if(before)addTriangles(body.children.find(o=>o.isMesh));else body.traverse(o=>{if(o.isMesh)addTriangles(o);});
        triangles.sort();if(before)return{manifest,triangles};
        const scene=new T.Scene();scene.background=new T.Color(0xe2e7e9);
        scene.add(new T.HemisphereLight(0xffffff,0x63727a,2.5));const sun=new T.DirectionalLight(0xffffff,3.5);sun.position.set(3,5,4);scene.add(sun);
        const g=copy(body);scene.add(g);const center=new T.Box3().setFromObject(g).getCenter(new T.Vector3());
        const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1200,720);
        const pictures={},pixels={};
        for(const[name,offset,peeled]of[['upper',[1,3,1.1]],['lower',[1,-3,-.5]],['side',[3,1,2]],['peeled',[1,3,1.1],true]]){
          g.getObjectByName('body-foam-top').visible=!peeled;
          const camera=new T.OrthographicCamera(-1,1,1,-1,.01,20);
          camera.position.copy(center).add(new T.Vector3(...offset));camera.lookAt(center);camera.updateMatrixWorld(true);
          const box=new T.Box3().setFromObject(g);let halfHeight=0;
          for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
            const v=new T.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse);
            halfHeight=Math.max(halfHeight,Math.abs(v.y),Math.abs(v.x)/(1200/720));
          }
          halfHeight*=1.12;camera.top=halfHeight;camera.bottom=-halfHeight;
          camera.left=-halfHeight*1200/720;camera.right=halfHeight*1200/720;camera.updateProjectionMatrix();renderer.render(scene,camera);
          pictures[name]=renderer.domElement.toDataURL();
          const gl=renderer.getContext(),p=new Uint8Array(1200*720*4);gl.readPixels(0,0,1200,720,gl.RGBA,gl.UNSIGNED_BYTE,p);
          const bg=[...p.slice(0,3)];let count=0,edge=0;
          for(let y=0;y<720;y++)for(let x=0;x<1200;x++){const k=(y*1200+x)*4;
            if(Math.max(...bg.map((v,c)=>Math.abs(p[k+c]-v)))>25){count++;if(x<3||x>1196||y<3||y>716)edge++;}}
          pixels[name]={count,edge};
        }
        renderer.dispose();return{manifest,triangles,pictures,pixels};
      },before);
      fs.writeFileSync(path.join(out,'mesh-manifest.json'),JSON.stringify(data.manifest));
      fs.writeFileSync(path.join(out,'outer-triangles.json'),JSON.stringify(data.triangles));
      if(!before){
        const baseline='archive/body-foam-2026-10-22/before/';
        // JSON baseline normalizes signed zero; compare the current manifest identically.
        assert.equal(JSON.stringify(data.manifest),fs.readFileSync(baseline+'mesh-manifest.json','utf8'),'24 parts, walls, joints, deck and attic unchanged');
        assert.deepEqual(data.triangles,JSON.parse(fs.readFileSync(baseline+'outer-triangles.json')),'original outer body triangles retained exactly');
        for(const[name,img]of Object.entries(data.pictures))fs.writeFileSync(path.join(out,`model-${name}.png`),Buffer.from(img.split(',')[1],'base64'));
        fs.writeFileSync(path.join(out,'pixel-checks.json'),JSON.stringify(data.pixels,null,2));
        for(const p of Object.values(data.pixels))assert.ok(p.count>5000&&p.edge===0,JSON.stringify(p));
      }
    }
    if(!before){
      await page.setViewportSize({width:1440,height:1000});await page.locator('#inspection-subassembly').selectOption('');
      await page.evaluate(()=>document.querySelector('#inspection-layers').open=true);
      for(const id of [...ids,'body-shell','insulation']){
        const input=page.locator(`#inspection-global-${id}`);await input.uncheck();
        await page.locator('#flight-canvas').screenshot({path:path.join(out,`hidden-${id}.png`)});
        assert.ok(await page.locator('#inspection-global-structural-panels').isChecked());assert.ok(await page.locator('#inspection-global-deck-panels').isChecked());
        await page.locator('#inspection-restore-layers').click();assert.ok(await input.isChecked());
      }
      await page.locator('#inspection-isolate').uncheck();await page.locator('#inspection-global-body-foam-top').uncheck();
      await page.locator('#flight-canvas').screenshot({path:path.join(out,'installed-top-removed.png')});
      await page.locator('[data-layer="internal"]').click();
      await page.locator('#inspection-global-body-foam-starboard').uncheck();
      await page.locator('#inspection-global-deck-panels').uncheck();
      await page.locator('#flight-canvas').screenshot({path:path.join(out,'installed-open-bay.png')});
      await page.locator('#inspection-restore-layers').click();
      const links=await page.locator('#part-sources a').evaluateAll(a=>a.map(x=>x.href));
      assert.ok(links.some(x=>x.includes('2025/09/08'))&&links.some(x=>x.includes('nescacademy.nasa.gov')));
      await page.locator('#pilot-view-button').click();await page.locator('#flight-canvas').screenshot({path:path.join(out,'pilot-return.png')});
    }
    assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
    const result={passed:true,before,live,build,cases:cases.length,stable24Numbers:true,errors,failed};
    fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
