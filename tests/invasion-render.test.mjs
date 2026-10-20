import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, requestDrop, stepBattle, flatTerrain } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";

// Exercise the real Three.js scene without a browser or GPU. This checks scene allocation,
// visibility, payload bodies and disposal; it does not certify appearance or phone performance.
const context2d = new Proxy({}, {
  get: (target, key) => key in target ? target[key] : ["createLinearGradient", "createRadialGradient"].includes(key)
    ? () => ({ addColorStop() {} }) : () => {},
  set: (target, key, value) => { target[key] = value; return true; },
});
const element = () => ({ style: {}, width: 0, height: 0, getContext: () => context2d, addEventListener() {}, setAttribute() {} });
globalThis.document = { createElement: element, createElementNS: element };
globalThis.window = { devicePixelRatio: 1 };
const renderer = () => ({
  frames: 0, capabilities: { getMaxAnisotropy: () => 1 }, setClearColor() {}, setPixelRatio() {}, setSize() {},
  render(scene, camera) { scene.updateMatrixWorld(true); camera.updateMatrixWorld(true); this.frames++; },
});

test("Real scene renders every pod beyond the old three-slot limit and releases its resources", async () => {
  const { createInvasionScene } = await import("../dist/invasion/scene.mjs");
  const engine = renderer(), view = createInvasionScene(element(), { renderer: engine });
  const planet = planetById("kepra"), terrain = { ...flatTerrain, liquid: null };
  const b = createBattle(planet, { terrain, podSlots: 44, matter: 10000 });
  const home = b.zones[0];
  const result = requestDrop(b, { x: home.x, z: home.z, payload: { scout: 44 } });
  assert.ok(result.ok);
  view.load(planet, terrain, b);
  for (let i = 0; i < 120; i++) stepBattle(b, 0.05);
  const cam = { focus: home, distance: 350, yaw: 0, pitch: 0.9 };
  view.frame(b, cam, [], 0.05, b.time);
  const hardware = view.scene.children.filter(p => p.name === "drop-hardware");
  const payloads = view.scene.children.filter(p => p.name === "drop-payload");
  assert.equal(hardware.length, 15);
  assert.ok(hardware.every(p => p.visible), "all 15 assemblies remain visible");
  assert.equal(payloads.length, 15);
  assert.equal(payloads.reduce((n, p) => n + p.children[0].children.filter(c => c.visible).length, 0), 44);
  assert.equal(new Set(payloads.map(p => `${p.position.x}:${p.position.z}`)).size, 15);
  let disposed = 0;
  const geometry = hardware[0].children.find(p => p.geometry)?.geometry;
  assert.ok(geometry);
  geometry.addEventListener("dispose", () => disposed++);
  view.unload();
  assert.equal(disposed, 1);
  assert.equal(view.scene.children.filter(p => p.name.startsWith("drop-")).length, 0);
  view.load(planet, terrain, b);
  view.frame(b, cam, [], 0, b.time);
  assert.equal(view.scene.children.filter(p => p.name === "drop-hardware").length, 15);
  assert.equal(engine.frames, 2);
});

test('Real camera and Scout model bounds produce smaller marker sizes when zooming out without DPR dependence',async()=>{
  const {createInvasionScene}=await import('../dist/invasion/scene.mjs');
  const view=createInvasionScene(element(),{renderer:renderer()}),planet=planetById('titan'),terrain={...flatTerrain,liquid:null};
  const b=createBattle(planet,{terrain}),home=b.zones[0],unit={x:home.x,z:home.z,alt:20,type:'scout',side:'swarm',structure:false};
  try{
    view.load(planet,terrain,b);view.resize(800,600);
    const camera={focus:home,distance:100,yaw:0,pitch:.9};view.setCamera(camera);
    const near=view.unitPixelSize(unit,600);assert.ok(Number.isFinite(near)&&near>8);
    view.setCamera({...camera,distance:750});const far=view.unitPixelSize(unit,600);
    assert.ok(far>0&&far<8,'far Scout qualifies for the small-unit marker');assert.ok(far<near);
    assert.equal(view.unitPixelSize(unit,300),far/2,'viewport CSS height drives the size');
    assert.equal(view.unitPixelSize({...unit,type:'unknown'},600),Infinity);
  }finally{view.unload();}
});
