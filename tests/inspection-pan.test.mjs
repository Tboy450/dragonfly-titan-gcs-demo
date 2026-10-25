import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import * as inspector from "../dist/vehicle-inspector.mjs";
import * as visibility from "../dist/inspection-visibility.mjs";
import { createFlightState } from "../dist/flight-model.mjs";
import { samplingSequence } from "../dist/science.mjs";

function ui() {
  const state = { ...createFlightState(), view: "mission", missionLayer: "internal",
    vehicleModel: "research", inspector: inspector.createInspector() };
  const elements = new Map();
  class Element {
    constructor() { this.events={}; this.options=[]; this.dataset={}; this.textContent=""; this.value=""; this.attrs={}; }
    addEventListener(type, fn) { (this.events[type] ??= []).push(fn); }
    append(...items) { this.options.push(...items); }
    replaceChildren(...items) { this.options=items; }
    setAttribute(key, value) { this.attrs[key]=value; }
    getAttribute(key) { return this.attrs[key] ?? null; }
    querySelector() { return {}; }
    setPointerCapture(id) { this.pointer=id; }
    hasPointerCapture(id) { return this.pointer===id; }
    releasePointerCapture() { this.pointer=null; }
    getBoundingClientRect() { return { width:600, height:400 }; }
    fire(type, values={}) {
      const event={ pointerId:1,pointerType:"mouse",button:0,buttons:1,clientX:100,clientY:100,
        preventDefault() { this.defaultPrevented=true; }, stopPropagation() {}, stopImmediatePropagation() { this.stopped=true; },
        ...values };
      for (const fn of this.events[type] ?? []) { fn(event); if(event.stopped) break; }
      return event;
    }
  }
  const $ = id => { if(!elements.has(id)) elements.set(id,new Element()); return elements.get(id); };
  const canvas=$("flight-canvas");
  const scope={ ...inspector,...visibility,state,$,flightCanvas:canvas,samplingSequence,
    chaseRenderer:{subsystems:{},inspectionLayers:{available:()=>false}},
    document:{createElement:()=>new Element(),createTextNode:text=>({text}),body:{classList:{toggle(){}}}} };
  const source=readFileSync(new URL("../dist/ui/vehicle-inspector.mjs",import.meta.url),"utf8")
    .replace(/^import[\s\S]*?from "[^"]+";\r?\n/gm,"").replace("export function updateInspectorUI","function updateInspectorUI");
  runInNewContext(source,scope);
  return { state, canvas, $ };
}

test("Pan is screen-relative, bounded, angle-independent and reset with focus/subassembly",()=>{
  const s={view:"mission",missionLayer:"internal",vehicleModel:"research",inspector:inspector.createInspector()};
  const i=s.inspector, angles=[i.azimuth,i.elevation];
  inspector.panInspector(i,120,-60,600,400);
  assert.deepEqual([i.panX,i.panY],[.2,-.15]);
  assert.deepEqual([i.azimuth,i.elevation],angles);
  assert.equal(inspector.inspectionModified(i,null),true);
  const before={...i};
  for(const args of [[NaN,0,600,400],[1,1,0,400],[1,1,600,-1]]) inspector.panInspector(i,...args);
  assert.deepEqual(i,before);
  inspector.panInspector(i,1e9,-1e9,600,400);
  assert.deepEqual([i.panX,i.panY],[1,-1]);
  inspector.focusInspector(s,"battery");
  assert.deepEqual([i.panX,i.panY],[0,0]);
  i.panX=.5;
  const group={name:"battery",traverse(fn){fn({name:"cells",userData:{inspectionLabel:"Cells"}});}};
  inspector.selectInspectionSubassembly(s,group,"cells");
  assert.deepEqual([i.panX,i.panY],[0,0]);
  i.panY=.5; inspector.resetInspector(i);
  assert.deepEqual([i.panX,i.panY],[0,0]);
});

test("Actual UI listeners pan only with right hold and Rotate selected; left/touch still orbit",()=>{
  const h=ui(), i=h.state.inspector;
  const drag=(type,button,buttons,x=220,y=40)=>h.canvas.fire(type,{button,buttons,clientX:x,clientY:y});
  drag("pointerdown",2,2,100,100); drag("pointermove",2,2);
  assert.deepEqual([i.panX,i.panY],[0,0]);
  assert.equal(h.canvas.fire("contextmenu").defaultPrevented,undefined);
  i.rotate=true;
  const before=structuredClone(h.state);
  drag("pointerdown",2,2,100,100); drag("pointermove",2,2); drag("pointerup",2,0);
  assert.deepEqual([i.panX,i.panY],[.2,-.15]);
  assert.equal(i.azimuth,before.inspector.azimuth);
  assert.equal(i.elevation,before.inspector.elevation);
  assert.equal(h.canvas.fire("contextmenu").defaultPrevented,true);
  assert.equal(h.canvas.fire("auxclick",{button:2}).defaultPrevented,true);
  i.panX=i.panY=0; assert.deepEqual(h.state,before,"pan never changes flight/science or model pose");
  drag("pointerdown",0,1,100,100); drag("pointermove",0,1); drag("pointerup",0,0);
  assert.notEqual(i.azimuth,before.inspector.azimuth);
  assert.deepEqual([i.panX,i.panY],[0,0]);
  const angle=i.azimuth;
  h.canvas.fire("pointerdown",{pointerType:"touch"});
  h.canvas.fire("pointermove",{pointerType:"touch",clientX:180});
  h.canvas.fire("pointerup",{pointerType:"touch",buttons:0});
  assert.notEqual(i.azimuth,angle);
  assert.deepEqual([i.panX,i.panY],[0,0]);
});

test("Right-drag releases on cancellation, lost capture, button chords and leaving inspection",()=>{
  for(const reason of ["pointercancel","lostpointercapture","chord","mode","toggle"]){
    const h=ui(),i=h.state.inspector; i.rotate=true;
    h.canvas.fire("pointerdown",{button:2,buttons:2});
    if(reason==="chord")h.canvas.fire("pointermove",{buttons:3,clientX:200});
    else if(reason==="mode"){h.state.view="pilot";h.canvas.fire("pointermove",{buttons:2,clientX:200});}
    else if(reason==="toggle")h.$("inspection-rotate").fire("click");
    else h.canvas.fire(reason);
    h.canvas.fire("pointermove",{buttons:2,clientX:250});
    assert.deepEqual([i.panX,i.panY],[0,0],reason);
  }
  for(const patch of [{view:"pilot"},{missionLayer:"exterior"},{vehicleModel:"original"}]){
    const h=ui(); h.state.inspector.rotate=true; Object.assign(h.state,patch);
    h.canvas.fire("pointerdown",{button:2,buttons:2});
    h.canvas.fire("pointermove",{buttons:2,clientX:220});
    assert.equal(h.state.inspector.panX,0);
    assert.equal(h.canvas.fire("contextmenu").defaultPrevented,undefined);
  }
  const h=ui();h.state.inspector.rotate=true;h.state.inspector.panX=.4;
  h.$("inspection-follow").fire("change",{target:{checked:true}});
  assert.deepEqual([h.state.inspector.panX,h.state.inspector.panY],[0,0]);
});

test("Shift arrows provide gated keyboard panning and Home recenters it",()=>{
  const h=ui(),i=h.state.inspector,angle=i.azimuth;
  assert.equal(h.canvas.fire("keydown",{key:"ArrowRight",shiftKey:true}).defaultPrevented,undefined);
  assert.equal(i.panX,0);
  i.rotate=true;
  assert.equal(h.canvas.fire("keydown",{key:"ArrowRight",shiftKey:true}).defaultPrevented,true);
  h.canvas.fire("keydown",{key:"ArrowDown",shiftKey:true});
  assert.deepEqual([i.panX,i.panY],[.05,.05]);
  assert.equal(i.azimuth,angle);
  h.canvas.fire("keydown",{key:"Home"});
  assert.deepEqual([i.panX,i.panY],[0,0]);
});
