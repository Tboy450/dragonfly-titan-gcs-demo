import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectionAccessViews,inspectionAccessPreset,applyInspectionAccessPreset,createInspectionVisibility,restoreInspectionLayers,setInspectionLayer} from '../dist/inspection-visibility.mjs';
import {createInspector,inspectionGroups} from '../dist/vehicle-inspector.mjs';
import {fullModel} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
test('Six access presets use independent masks, recognize manual changes and restore the open default',()=>{
 const a=createInspector(),b=createInspector();
 assert.deepEqual(inspectionAccessViews.map(v=>v.id),['all','open','body','attic','belly','harness']);
 for(const view of inspectionAccessViews){applyInspectionAccessPreset(a,view.id);assert.equal(inspectionAccessPreset(a),view.id);assert.deepEqual(a.hiddenPartLayers,{});}
 assert.equal(inspectionAccessPreset(b),'open');setInspectionLayer(a,'body-shell',true);assert.equal(inspectionAccessPreset(a),'custom');
 applyInspectionAccessPreset(a,'open');assert.equal(a.onlyLayer,null);restoreInspectionLayers(a);assert.equal(inspectionAccessPreset(a),'all');
});
test('Wiring diagram shows existing harness meshes across assemblies and restores every visibility flag',()=>{
 const f=fullModel(),masks=createInspectionVisibility(f.subsystems),i=createInspector(),saved=new Map();applyInspectionAccessPreset(i,'harness');masks.apply(i,saved);
 const visible=[];f.root.traverseVisible(o=>{if(o.isMesh)visible.push(o);});assert.ok(visible.length>20);
 for(const o of visible){let p=o,wire=false;while(p){wire||=p.userData.inspectionLayer==='harnesses';p=p.parent;}assert.ok(wire,o.name);}
 assert.ok(visible.some(o=>o.name.startsWith('main-harness-')));assert.ok(visible.some(o=>o.name.startsWith('iem-')));
 for(const [object,value]of saved)object.visible=value;
 assert.ok([...saved].every(([o,v])=>o.visible===v));
});
test('Body, attic and belly presets retain independent surface controls and belly context',()=>{
 const f=fullModel(),masks=createInspectionVisibility(f.subsystems),i=createInspector();
 for(const view of ['body','attic','belly']){
  applyInspectionAccessPreset(i,view);const saved=new Map();masks.apply(i,saved);
  assert.ok((view==='attic'?f.subsystems.attic:f.subsystems.fuselage).visible);
  if(view==='belly'){assert.ok(f.root.getObjectByName('body-foam-belly').visible);assert.equal(f.root.getObjectByName('body-foam-top').visible,false);}
  for(const [object,value]of saved)object.visible=value;
 }
 assert.deepEqual(inspectionGroups('fuselage','body-foam-belly'),['fuselage','trim-chimneys','underfloor-duct']);
 assert.deepEqual(inspectionGroups('fuselage'),['fuselage']);
});
