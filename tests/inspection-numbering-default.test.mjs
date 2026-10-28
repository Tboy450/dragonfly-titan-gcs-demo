import test from 'node:test';
import assert from 'node:assert/strict';
import {createInspector,resetInspector,inspectionOptionTitle} from '../dist/vehicle-inspector.mjs';
import {inspectionAccessPreset,applyInspectionAccessPreset,setInspectionLayer,openInteriorLayers} from '../dist/inspection-visibility.mjs';
import {fullModel} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
import {numberedInspectionParts,inspectionPartNumber,inspectionPartIds} from '../dist/inspection-catalog.mjs';

test('Selector numbers follow actual model marker order for all 24 parts; extra assemblies and hidden suffixes do not renumber them',()=>{
 const f=fullModel(),numbered=Object.values(f.subsystems).filter(o=>o.userData.label);
 assert.deepEqual(numbered.map(o=>o.name),f.labeledParts.map(o=>o.name));
 assert.equal(numbered.length,24);
 f.labeledParts.forEach((part,i)=>{
  assert.equal(inspectionOptionTitle(part,numbered),`${i+1}. ${part.userData.label}`);
  assert.equal(inspectionOptionTitle(part,numbered,2),`${i+1}. ${part.userData.label} / 2 hidden`);
 });
 const all=numberedInspectionParts(f.subsystems);assert.equal(all.length,32);
 assert.deepEqual(new Set(all.map(p=>p.name)),new Set(Object.values(f.subsystems).filter(p=>p.userData.label||p.userData.inspectionTitle).map(p=>p.name)));
 assert.deepEqual(all.map(p=>p.name),[...inspectionPartIds]);
 assert.deepEqual(all.slice(0,24).map(p=>p.name),numbered.map(p=>p.name));
 assert.equal(new Set(all.map(p=>p.name)).size,all.length);
 for(const part of all.slice(24))assert.equal(inspectionOptionTitle(part,all),`${inspectionPartNumber(part)}. ${part.userData.inspectionTitle}`);
});

test('Fresh and reset inspection use Open interior while explicit All/custom remain available without sharing masks',()=>{
 const a=createInspector(),b=createInspector();
 assert.equal(inspectionAccessPreset(a),'open');assert.deepEqual(a.hiddenLayers,[...openInteriorLayers]);
 applyInspectionAccessPreset(a,'all');assert.equal(inspectionAccessPreset(a),'all');
 setInspectionLayer(a,'body-shell',false);assert.equal(inspectionAccessPreset(a),'custom');
 assert.equal(inspectionAccessPreset(b),'open');
 resetInspector(a);assert.equal(inspectionAccessPreset(a),'open');
 assert.deepEqual(a.hiddenPartLayers,{});
});
