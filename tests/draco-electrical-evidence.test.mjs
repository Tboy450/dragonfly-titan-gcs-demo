import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {dracoBlowerReference as reference,dracoElectricalEvidence as rows,dracoElectricalSources as sources,dracoElectricalLimits as limits} from '../dist/draco-electrical-evidence.mjs';
import {report} from '../research/draco-electrical-audit-2026-10-27/audit.mjs';

test('Supplier units normalize from the saved catalog snapshot without inventing flight/power conditions',async()=>{
 const snapshot=JSON.parse(await readFile(new URL('../research/sources/barber-nichols-draco-2026-10-27/specification-snapshot.json',import.meta.url),'utf8'));
 assert.equal(reference.lengthM,snapshot.lengthMm/1000);
 assert.equal(reference.diameterM,snapshot.diameterMm/1000);
 assert.equal(reference.volumeFlowM3PerS,snapshot.volumeFlowLitersPerSec/1000);
 assert.equal(reference.massKg,snapshot.massKg);assert.equal(reference.gasHeadM,snapshot.gasHeadMeters);
 assert.equal(reference.maxRpm,snapshot.maxRpm);assert.equal(reference.flightDrawingConfirmed,false);
 assert.equal(reference.motorPowerW,undefined);assert.equal(reference.voltage,undefined);
 assert.ok(Object.isFrozen(reference));assert.match(reference.referenceConditions,/not stated/);
 const blower=rows.find(r=>r.id==='draco-blower-supplier-audit');
 assert.match(blower.role,/345 mm long × 168 mm diameter/);assert.match(blower.role,/1\.3 L\/s/);
 assert.match(blower.modeled,/BNCP-21.*different product/);
});

test('Evidence preserves unresolved sensor/diverter interfaces and distinguishes related KArLE from Dragonfly',async()=>{
 assert.equal(rows.length,4);
 for(const row of rows){
  assert.ok(Object.isFrozen(row));assert.equal(row.flightMatingConfirmed,false);assert.equal(row.hardwareAdded,false);
  assert.equal(row.pinout,undefined);assert.equal(row.voltage,undefined);assert.ok(sources[row.source]);
 }
 assert.equal(rows.find(r=>r.source==='related').inspect,null);
 assert.match(rows.find(r=>r.source==='related').role,/lunar KArLE/);
 assert.match(rows.find(r=>r.source==='related').modeled,/not copied/);
 assert.match(rows.find(r=>r.source==='flow').modeled,/separate from the lander thermal trim valves/);
 assert.match(limits.naming,/Supplier blower rpm is not rotor rpm/);
 const code=await readFile(new URL('../dist/draco-electrical-evidence.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(code,/from .*flight-model|from .*mission-systems|localStorage|fetch\(/);
});

test('Audit leaves blower/plumbing geometry exact and reports reference-envelope overlap without claiming solid collision',async()=>{
 const current=await readFile(new URL('../archive/draco-blower-pair-2026-10-27/draco-plumbing.mjs',import.meta.url),'utf8');
 const before=await readFile(new URL('../archive/draco-electrical-audit-2026-10-27/draco-plumbing.mjs',import.meta.url),'utf8');
 assert.equal(current,before);
 const result=report();assert.equal(result.rows.length,2);
 for(const unit of result.rows){
  assert.ok(unit.axialLengthRatio>2.9);assert.ok(unit.housingDiameterRatio>2.1);
  assert.equal(unit.supplierLengthM,reference.lengthM);
 }
 assert.ok(result.sameAxisEnvelopeScreen.cylinderEnvelopeOverlapM>.08);
 assert.match(result.sameAxisEnvelopeScreen.warning,/actual shaped solids\/flight orientation not established/);
});

test('Nested evidence is closed by default and only its existing inspection targets receive working controls',async()=>{
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.attrs={};this.events={};this.open=false;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(k,v){this.events[k]=v;}
 }
 const document={createElement:tag=>new Element(tag)},clicks=[];
 const code=(await readFile(new URL('../dist/ui/sampling-connections.mjs',import.meta.url),'utf8'))
  .replace(/^import .*;\r?\n/gm,'').replaceAll('export function','function');
 const scope={document,dracoElectricalEvidence:rows,dracoElectricalSources:sources,dracoElectricalLimits:limits};
 runInNewContext(code+'\nthis.renderAudit=renderDracoElectricalAudit;',scope);
 const parent=new Element('div'),details=scope.renderAudit(parent,row=>clicks.push(row.inspect));
 assert.equal(details.tag,'details');assert.equal(details.open,false);assert.equal(details.dataset.dracoElectricalAudit,'true');
 const all=[];const visit=n=>{all.push(n);for(const c of n.children)visit(c);};visit(details);
 assert.equal(all.filter(n=>n.dataset.connectionEvidence).length,4);
 for(const button of all.filter(n=>n.tag==='button'))button.events.click();
 assert.deepEqual(clicks,['drills','drill-blower','sample-lines']);
 assert.equal(all.filter(n=>n.tag==='a').length,4);
});
