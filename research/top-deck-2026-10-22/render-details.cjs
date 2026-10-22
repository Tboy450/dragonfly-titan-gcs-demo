const {chromium}=require('C:/Users/Heemi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try{
    const page=await browser.newPage();await page.goto('http://127.0.0.1:4198/');
    await page.waitForFunction(()=>window.dragonflyRenderer?.subsystems['top-deck']);
    const pictures=await page.evaluate(async()=>{
      const T=await import('./vendor/three/three.module.min.js'),groups=window.dragonflyRenderer.subsystems;
      const copy=(o,context=false)=>{
        const material=o.isMesh?(o.userData.baseMaterial||o.material).clone():null;
        if(context&&material)Object.assign(material,{transparent:true,opacity:.28,depthWrite:false});
        const n=o.isMesh?new T.Mesh(o.geometry,material):new T.Group();
        n.name=o.name;n.position.copy(o.position);n.quaternion.copy(o.quaternion);n.scale.copy(o.scale);
        o.children.forEach(c=>n.add(copy(c,context)));return n;
      };
      const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1200,800);
      const pictures={};
      for(const end of ['upper','underside']){
        const scene=new T.Scene();scene.background=new T.Color(0xe2e7e9);
        scene.add(new T.HemisphereLight(0xffffff,0x607781,3));
        const light=new T.DirectionalLight(0xffffff,4);light.position.set(3,4,-2);scene.add(light);
        const joints=copy(groups['top-deck']);scene.add(joints);
        for(const name of ['hga-actuators','twta'])scene.add(copy(groups[name],true));
        const center=new T.Box3().setFromObject(joints).getCenter(new T.Vector3());
        const camera=new T.OrthographicCamera(-1.35,1.35,.9,-.9,.01,20);
        camera.position.copy(center).add(new T.Vector3(1.2,end==='upper'?2:-2,end==='upper'?1.2:-1.2));camera.lookAt(center);
        renderer.render(scene,camera);
        const gl=renderer.getContext(),p=new Uint8Array(1200*800*4);gl.readPixels(0,0,1200,800,gl.RGBA,gl.UNSIGNED_BYTE,p);
        const bg=[...p.slice(0,3)];let count=0,edge=0;
        for(let y=0;y<800;y++)for(let x=0;x<1200;x++){
          const k=(y*1200+x)*4;if(Math.max(...bg.map((v,c)=>Math.abs(p[k+c]-v)))>20){count++;if(x<5||x>1194||y<5||y>794)edge++;}
        }
        pictures[end]={image:renderer.domElement.toDataURL(),pixels:{count,edge}};
      }
      renderer.dispose();return pictures;
    });
    const checks={};for(const[name,p]of Object.entries(pictures)){
      assert.ok(p.pixels.count>5000&&p.pixels.edge===0,JSON.stringify(p.pixels));
      fs.writeFileSync(`research/top-deck-2026-10-22/after/${name}-context.png`,Buffer.from(p.image.split(',')[1],'base64'));checks[name]=p.pixels;
    }
    fs.writeFileSync('research/top-deck-2026-10-22/after/detail-pixel-checks.json',JSON.stringify(checks,null,2));console.log(JSON.stringify(checks));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
