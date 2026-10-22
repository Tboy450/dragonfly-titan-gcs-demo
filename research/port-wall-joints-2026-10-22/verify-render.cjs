const { chromium } = require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
(async () => {
  const out = process.argv[2], before = process.argv.includes('--before');
  const url = process.env.DRAGONFLY_URL || 'http://127.0.0.1:4197/';
  const target=process.env.DRAGONFLY_PART||'port-wall', joints=target==='wall-end-joints';
  const title=joints?'Wall end joints (estimated)':'Port structural wall';
  const subs=joints?['','nose-joints-focus','aft-joints-focus']:['','port-wall-outer-focus','port-wall-inner-focus','port-wall-edge-focus'];
  const live = url.startsWith('https:'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [], failed = [], cases = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('requestfailed', r => failed.push(r.url()));
    await page.addInitScript(() => localStorage.setItem('dragonfly-arrival-seen', '1'));
    await page.goto(url); await page.locator('#mission-view-button').click();
    await page.locator('[data-layer="internal"]').click();
    if (!live) await page.evaluate(() => window.dragonflyState.hold = true);
    const build = await page.locator('#build-label').textContent();
    if (process.env.DRAGONFLY_BUILD) assert.ok(build.includes(process.env.DRAGONFLY_BUILD), build);
    await page.locator('#part-list > li').first().waitFor({ state: 'attached' });
    assert.equal(await page.locator('#part-list > li').count(), 24);
    if (!before) {
      await page.locator('#inspection-part').selectOption(target);
      await page.locator('#inspection-isolate').check();
      await page.evaluate(() => document.querySelector('#component-temperatures').open = true);
      await page.locator('#part-title').filter({ hasText: title }).waitFor();
      assert.match(await page.locator('#part-role').textContent(), joints?/estimated/i:/0.254 mm/);
    }
    for (const sub of before ? [''] : subs) {
      if (!before) await page.locator('#inspection-subassembly').selectOption(sub);
      for (const layer of ['internal', 'thermal']) for (const width of [1440, 390, 360]) {
        await page.setViewportSize({ width, height: width > 600 ? 1000 : 844 });
        await page.locator(`[data-layer="${layer}"]`).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        await page.locator('#flight-canvas').screenshot({ path: path.join(out, `${sub || 'assembly'}-${layer}-${width}.png`) });
        cases.push({ sub, layer, width });
      }
    }
    if (!live) {
      const data = await page.evaluate(async ({before,target}) => {
        const T = await import('./vendor/three/three.module.min.js');
        const groups = window.dragonflyRenderer.subsystems, manifest = {}, bounds = {};
        const copy = o => {
          const n = o.isMesh ? new T.Mesh(o.geometry, o.userData.baseMaterial || o.material) : new T.Group();
          n.name = o.name; n.position.copy(o.position); n.quaternion.copy(o.quaternion); n.scale.copy(o.scale);
          o.children.forEach(c => n.add(copy(c))); return n;
        };
        for (const [name, source] of Object.entries(groups)) {
          const g = copy(source); g.updateMatrixWorld(true);
          if (source.userData.label || name==='starboard-wall') {
            manifest[name] = [];
            g.traverse(o => { if (o.isMesh) manifest[name].push({ name: o.name, matrix: o.matrixWorld.toArray(), positions: Array.from(o.geometry.attributes.position.array) }); });
          }
          if (['port-wall','wall-end-joints'].includes(name)) {
            bounds[name] = []; g.traverse(o => { if (o.isMesh) { const b = new T.Box3().setFromObject(o); bounds[name].push({ name: o.name, min: b.min.toArray(), max: b.max.toArray() }); } });
          }
        }
        if (before) return { manifest, bounds };
        const source = groups[target];
        const {portWallAsset:A}=await import('./side-wall.mjs?v=dev');
        const wall = copy(groups['port-wall']); wall.updateMatrixWorld(true);
        const faces = ['port-wall-outer-aluminum-face','port-wall-inner-aluminum-face'].map(n=>wall.getObjectByName(n));
        const crossings = [], contacts = [], ray = new T.Raycaster();
        for (const [name, original] of Object.entries(groups)) {
          if (!original.userData.label && name !== 'arms') continue;
          const other=copy(original); other.updateMatrixWorld(true);
          other.traverse(o=>{ if(!o.isMesh) return;
            const b=new T.Box3().setFromObject(o);
            if(b.max.x< -A.outerX || b.min.x> -A.innerX || b.max.z<-1.51 || b.min.z>1 || b.max.y<-.32 || b.min.y>.075) return;
            const p=o.geometry.attributes.position, ix=o.geometry.index;
            let hit=false;
            for(let i=0;i<(ix?.count??p.count) && !hit;i+=3) {
              const tri=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(o.matrixWorld));
              for(const x of [-A.innerX,-A.outerX]) {
                const cuts=[];
                for(let j=0;j<3;j++) {
                  const a=tri[j],b=tri[(j+1)%3];
                  if(Math.min(a.x,b.x)<x-1e-7 && Math.max(a.x,b.x)>x+1e-7) cuts.push(a.clone().lerp(b,(x-a.x)/(b.x-a.x)));
                }
                if(cuts.length===2) cuts.push(cuts[0].clone().lerp(cuts[1],.5));
                for(const v of cuts) {
                  ray.set(new T.Vector3(.5,v.y,v.z),new T.Vector3(-1,0,0));
                  if(ray.intersectObjects(faces).length) {hit=true;break;}
                }
              }
            }
            if(hit) {
              const strapContact=name==='iem' && o.name==='iem-ground-strap-braid'
                && b.min.x>=-.3621 && b.max.x>-.36 && b.min.z>-.29 && b.max.z<-.26;
              (strapContact?contacts:crossings).push({part:name,mesh:o.name,...(strapContact?{reason:'existing estimated wall-bond endpoint',depthM:-A.innerX-b.min.x}:{})});
            }
          });
        }
        const jointCopy=copy(groups['wall-end-joints']);jointCopy.updateMatrixWorld(true);
        const jointVertices=[];jointCopy.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;
          for(let i=0;i<p.count;i++)jointVertices.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));
        }});
        const jointCrossings=[];
        for(const [name,original] of Object.entries(groups)) {
          if(!original.userData.label || ['nose-bulkhead','aft-bulkhead'].includes(name))continue;
          const other=copy(original);other.updateMatrixWorld(true);
          other.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();
            const b=o.geometry.boundingBox.clone().expandByScalar(-1e-7),inv=o.matrixWorld.clone().invert();
            const candidates=jointVertices.map(p=>p.clone().applyMatrix4(inv)).filter(p=>b.containsPoint(p));
            if(!candidates.length)return;
            if(o.geometry.type==='TubeGeometry') {
              const {path,radius,tubularSegments}=o.geometry.parameters,points=path.getPoints(tubularSegments*2);
              if(!candidates.some(p=>points.slice(1).some((q,i)=>new T.Line3(points[i],q).closestPointToPoint(p,true,new T.Vector3()).distanceTo(p)<radius-1e-7)))return;
            }
            jointCrossings.push({part:name,mesh:o.name});
          });
        }
        const scene = new T.Scene(); scene.background = new T.Color(0xe2e7e9);
        scene.add(new T.HemisphereLight(0xffffff, 0x63727a, 2.5));
        const sun = new T.DirectionalLight(0xffffff, 3.5); sun.position.set(3, 5, 4); scene.add(sun);
        const g = copy(source); scene.add(g);
        const center = new T.Box3().setFromObject(g).getCenter(new T.Vector3());
        const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setSize(1200, 720);
        const pictures = {}, pixels = {};
        for (const [name, offset] of [['outer', [4, 1, 1.1]], ['inner', [-4, 1, -.5]], ['edge', [3, 2, 2]]]) {
          const camera = new T.OrthographicCamera(-1.7, 1.7, 1.02, -1.02, .01, 20);
          camera.position.copy(center).add(new T.Vector3(...offset)); camera.lookAt(center); renderer.render(scene, camera);
          pictures[name] = renderer.domElement.toDataURL();
          const gl = renderer.getContext(), p = new Uint8Array(1200 * 720 * 4); gl.readPixels(0, 0, 1200, 720, gl.RGBA, gl.UNSIGNED_BYTE, p);
          const bg = [...p.slice(0, 3)]; let count = 0, edge = 0;
          for (let y = 0; y < 720; y++) for (let x = 0; x < 1200; x++) {
            const k = (y * 1200 + x) * 4;
            if (Math.max(...bg.map((v, c) => Math.abs(p[k + c] - v))) > 25) { count++; if (x < 3 || x > 1196 || y < 3 || y > 716) edge++; }
          }
          pixels[name] = { count, edge };
        }
        renderer.dispose(); return { manifest, bounds, pictures, pixels, crossings, contacts, jointCrossings };
        }, {before,target});
      fs.writeFileSync(path.join(out, 'mesh-manifest.json'), JSON.stringify(data.manifest));
      fs.writeFileSync(path.join(out, 'bounds.json'), JSON.stringify(data.bounds, null, 2));
      if (!before) {
        const baseline = JSON.parse(fs.readFileSync('archive/port-wall-joints-2026-10-22/before/mesh-manifest.json'));
        assert.equal(JSON.stringify(data.manifest), JSON.stringify(baseline), 'all24 numbered parts remain geometrically unchanged');
        for (const [name, image] of Object.entries(data.pictures)) fs.writeFileSync(path.join(out, `model-${name}.png`), Buffer.from(image.split(',')[1], 'base64'));
        fs.writeFileSync(path.join(out, 'pixel-checks.json'), JSON.stringify(data.pixels, null, 2));
        fs.writeFileSync(path.join(out, 'clearance.json'), JSON.stringify(data.crossings, null, 2));
        fs.writeFileSync(path.join(out, 'installation-contacts.json'), JSON.stringify(data.contacts, null, 2));
        fs.writeFileSync(path.join(out, 'joint-clearance.json'), JSON.stringify(data.jointCrossings, null, 2));
        assert.deepEqual(data.crossings, [], 'wall faces do not intersect existing numbered hardware or shoulders');
        assert.deepEqual(data.jointCrossings, [], 'joint geometry clears equipment; bulkhead/wall mating contacts checked separately');
        for (const p of Object.values(data.pixels)) assert.ok(p.count > 5000 && p.edge === 0, JSON.stringify(p));
      }
    }
    if (!before) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.locator('#inspection-subassembly').selectOption('');
      await page.evaluate(() => document.querySelector('#inspection-layers').open = true);
      for (const id of joints?['mounts','interfaces']:['equipment-casings', 'equipment-covers', 'mounts']) {
        const input = page.locator(`#inspection-part-${id}`); await input.uncheck();
        await page.locator('#flight-canvas').screenshot({ path: path.join(out, `hidden-${id}.png`) });
        await page.locator('#inspection-restore-layers').click(); assert.equal(await input.isChecked(), true);
      }
      const globalWall=page.locator('#inspection-global-structural-panels');
      await globalWall.uncheck();
      await page.locator('#flight-canvas').screenshot({path:path.join(out,'hidden-structural-wall.png')});
      await page.locator('#inspection-restore-layers').click(); assert.equal(await globalWall.isChecked(),true);
      await page.locator('#inspection-isolate').uncheck();
      await page.locator('#flight-canvas').screenshot({ path: path.join(out, 'installed-context.png') });
      const links = await page.locator('#part-sources a').evaluateAll(a => a.map(x => x.href));
      assert.ok(links.some(x => x.includes('2026/04/23')) && links.some(x => /2026\/07\/09|260709/.test(x)));
      await page.locator('#pilot-view-button').click(); await page.locator('#flight-canvas').screenshot({ path: path.join(out, 'pilot-return.png') });
    }
    assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    const result = { passed: true, before, live, build, target, cases: cases.length, stable24Numbers: true, errors, failed };
    fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
