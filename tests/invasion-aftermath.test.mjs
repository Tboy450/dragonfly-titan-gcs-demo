import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three/three.module.min.js';
import { createCityAftermath, aftermathBudgets, selectAftermathSites } from '../dist/invasion/environments/aftermath.mjs';
import { damagePart, damageAnchors, createCityDamageVariant, disposeCityDamageVariant } from '../dist/invasion/environments/city-damage.mjs';

const material=new THREE.MeshStandardMaterial({color:0x91a9bb});
const parts=()=>Array.from({length:16},(_,i)=>damagePart(new THREE.BoxGeometry(30,120,30),material,
  new THREE.Matrix4().makeTranslation(i*55-380,90,i%3*75),`building-${i}`));
const sources=Array.from({length:100},(_,i)=>({id:`site-${i}`,position:[i*30,60+i,i%5*80],scale:4,seed:(i*.61803398875)%1}));

test('All city styles expose finite effect sources on actual fracture intersections',()=>{
  for(const type of ['alien','metropolis','citadel','cyberpunk','drone']){
    const original=parts(),anchors=damageAnchors(original);
    for(const stage of ['damaged','heavy','ruins']){
      const variant=createCityDamageVariant(original,stage,{type}),sites=variant.userData.effectSources;
      const cutVertices=[];
      variant.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)cutVertices.push([p.getX(i),p.getY(i),p.getZ(i)]);}});
      assert.ok(sites.length>0,`${type}/${stage} has usable fractures`);
      for(const site of sites){
        const anchor=anchors.find(a=>a.id===site.id),[x,y,z]=site.position;
        assert.ok(anchor);
        // Clipping interpolates triangle edges across a nonlinear fracture field.
        // Check the retained geometry itself, rather than re-evaluating that field.
        assert.ok(cutVertices.some(p=>Math.hypot(p[0]-x,p[1]-(y-.25),p[2]-z)<1e-3),'emission lies on the retained fracture geometry');
        assert.ok(site.position.every(Number.isFinite));assert.ok(site.scale>0&&site.scale<=12);
        assert.ok(y>anchor.bottom&&y<anchor.top);
      }
      const fx=createCityAftermath(sites,stage);assert.ok(fx.stats.sites>0);fx.dispose();disposeCityDamageVariant(variant);
    }
  }
});

test('Intact views and unsupported empty assets allocate no effect geometry or lights',()=>{
  for(const [stage,sites] of [['intact',sources],['heavy',[]]]){
    const fx=createCityAftermath(sites,stage);
    assert.equal(fx.stats.instances,0);assert.equal(fx.stats.lights,0);assert.equal(fx.group.children.length,0);
    assert.equal(fx.group.visible,false);fx.dispose();fx.dispose();
  }
  assert.throws(()=>createCityAftermath(sources,'bad-stage'),/Unknown/);
});

test('Selection is deterministic, bounded and does not mutate source metadata',()=>{
  const before=structuredClone(sources),selected=selectAftermathSites(sources,8);
  assert.equal(selected.length,8);assert.deepEqual(selectAftermathSites([...sources].reverse(),8),selected);
  selected[0].position[1]=999;
  assert.deepEqual(sources,before);
  assert.equal(selectAftermathSites([null,{position:[NaN,0,0],scale:4,seed:1},...sources],2).length,2);
  assert.throws(()=>selectAftermathSites(sources,Infinity),/finite/);
});

test('High and Light cap instanced particle work, draw layers and local lights',()=>{
  for(const quality of ['high','low'])for(const stage of ['damaged','heavy','ruins']){
    const fx=createCityAftermath(sources,stage,{quality}),budget=aftermathBudgets[quality];
    assert.ok(fx.stats.sites<=budget.sites);
    assert.ok(fx.stats.instances<=budget.sites*(budget.smoke+budget.fire+budget.embers));
    assert.equal(fx.stats.draws,3);assert.ok(fx.stats.lights<=budget.lights);
    fx.group.traverse(o=>{
      if(!o.isMesh)return;
      assert.equal(o.geometry.isInstancedBufferGeometry,true);assert.equal(o.frustumCulled,false);
      assert.equal(o.material.depthWrite,false);assert.equal(o.material.fog,true);
      for(const attribute of Object.values(o.geometry.attributes))assert.ok([...attribute.array].every(Number.isFinite));
    });
    fx.dispose();
  }
});

test('Pause freezes shader time and firelight; resume advances by a bounded delta',()=>{
  const fx=createCityAftermath(sources,'heavy');
  const start=fx.stats.clock;fx.update(.05);assert.equal(fx.stats.clock,start+.05);
  fx.setOptions({paused:true});
  const lights=fx.group.children.filter(o=>o.isPointLight).map(l=>l.intensity);
  fx.update(1000);assert.equal(fx.stats.clock,start+.05);
  assert.deepEqual(fx.group.children.filter(o=>o.isPointLight).map(l=>l.intensity),lights);
  fx.setOptions({paused:false});fx.update(1000);assert.ok(fx.stats.clock-start<.151);
  const now=fx.stats.clock;fx.update(NaN);fx.update(-1);assert.equal(fx.stats.clock,now);
  fx.dispose();
});

test('Smoke/fire toggles preserve the model and allocation; firelight follows fire visibility',()=>{
  const fx=createCityAftermath(sources,'heavy'),before=structuredClone(sources);
  const geometries=fx.group.children.filter(o=>o.isMesh).map(o=>o.geometry);
  fx.setOptions({fire:false});assert.equal(fx.stats.draws,1);assert.equal(fx.stats.lights,0);
  fx.setOptions({smoke:false});assert.equal(fx.stats.draws,0);assert.equal(fx.group.visible,false);
  fx.setOptions({fire:true});assert.equal(fx.stats.draws,2);assert.equal(fx.group.visible,true);
  fx.setOptions({smoke:true});assert.equal(fx.stats.draws,3);
  assert.deepEqual(fx.group.children.filter(o=>o.isMesh).map(o=>o.geometry),geometries);
  assert.deepEqual(sources,before);fx.dispose();
});

test('Quality changes and repeated stage changes dispose owned resources once',()=>{
  const parent=new THREE.Scene();let disposedGeometries=0,disposedMaterials=0;
  for(let cycle=0;cycle<8;cycle++){
    const fx=createCityAftermath(sources,'heavy');parent.add(fx.group);
    for(const mesh of fx.group.children.filter(o=>o.isMesh)){
      mesh.geometry.addEventListener('dispose',()=>disposedGeometries++);
      mesh.material.addEventListener('dispose',()=>disposedMaterials++);
    }
    const clock=fx.stats.clock;fx.setOptions({quality:'low'});
    assert.equal(fx.stats.quality,'low');assert.equal(fx.stats.clock,clock);assert.equal(fx.stats.lights,0);
    for(const mesh of fx.group.children.filter(o=>o.isMesh)){
      mesh.geometry.addEventListener('dispose',()=>disposedGeometries++);
      mesh.material.addEventListener('dispose',()=>disposedMaterials++);
    }
    fx.dispose();fx.dispose();fx.setOptions({quality:'high'});fx.update(.05);
    assert.equal(fx.stats.disposed,true);assert.equal(fx.stats.instances,0);assert.equal(parent.children.length,0);
  }
  assert.equal(disposedGeometries,8*6);assert.equal(disposedMaterials,8*6);
});

test('Actual Three shader chunks used by every effect exist and fog/working coordinates are declared',()=>{
  const fx=createCityAftermath(sources,'heavy');
  for(const mesh of fx.group.children.filter(o=>o.isMesh)){
    const {vertexShader,fragmentShader}=mesh.material;
    for(const source of [vertexShader,fragmentShader]){
      for(const match of source.matchAll(/#include\s+<([\w_]+)>/g))assert.ok(THREE.ShaderChunk[match[1]],match[1]);
    }
    assert.ok(vertexShader.includes('vec4 mvPosition='));
    for(const name of ['effectOrigin','effectScale','effectPhase','effectSeed'])assert.ok(mesh.geometry.attributes[name]);
    assert.ok(mesh.material.uniforms.fogDensity);
  }
  fx.dispose();
});
