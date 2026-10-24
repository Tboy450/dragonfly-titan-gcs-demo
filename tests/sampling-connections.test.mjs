import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {samplingElectronics as rows,samplingConnectionSources as sources,samplingConnectionLimits as limits} from '../dist/sampling-connections.mjs';

test('Sampling evidence separates six functional roles from unverified physical interfaces',()=>{
 assert.equal(rows.length,6);assert.equal(new Set(rows.map(r=>r.id)).size,6);
 for(const row of rows){assert.equal(row.roleConfidence,'PUB');assert.equal(row.wiringConfidence,'unresolved');assert.equal(row.flightMatingConfirmed,false);assert.ok(Object.isFrozen(row));assert.ok(row.role&&row.modeled);assert.ok(sources[row.source]);}
 assert.equal(rows.find(r=>r.id==='draco-avionics').inspect,null);
 assert.equal(rows.find(r=>r.id==='drams-leu').inspect,null);
 assert.match(rows.find(r=>r.id==='drams-leu').role,/engineering-model/);
 assert.match(limits.naming,/different instrument and a different unit/);
 assert.match(limits.scope,/not a flight wiring diagram/);
 assert.match(limits.boundary,/does not establish an electrical feedthrough/);
});

test('Only existing modeled assemblies receive focus controls; no protocol or pinout is invented',()=>{
 assert.deepEqual(rows.filter(r=>r.inspect).map(r=>[r.inspect,r.subassembly??null]),[['iem',null],['power-units',null],['drams',null],['sample-carousel','carousel-drive-1']]);
 for(const source of Object.values(sources)){assert.equal(new URL(source.url).protocol,'https:');assert.match(new URL(source.url).hostname,/(nasa\.gov|jhuapl\.edu|blueorigin\.com)$/);}
 for(const row of rows){assert.equal(row.protocol,undefined);assert.equal(row.voltage,undefined);assert.equal(row.pinout,undefined);}
});

test('Connection evidence is collapsed by default and cannot replace numbered geometry or simulation state',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(html,/<details id="sampling-connections" class="component-temperatures" hidden>/);
 const ui=await readFile(new URL('../dist/ui/sampling-connections.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(ui,/innerHTML|flight-model|mission-systems|save-game/);
 assert.match(ui,/button\.title = `Inspect/);assert.match(ui,/onInspect\(row\)/);
 const layers=await readFile(new URL('../dist/ui/layers-panel.mjs',import.meta.url),'utf8');
 assert.match(layers,/\$\("sampling-connections"\)\.hidden = !layered \|\| mock \|\| !chaseRenderer/);
});

test('Original-demo selection does not pass a false sentinel into research-only component metadata',async()=>{
 const ui=await readFile(new URL('../dist/ui/layers-panel.mjs',import.meta.url),'utf8');
 const statement=ui.match(/const external = [^;]+;/)[0];
 const lookup=new Function('mock','chaseRenderer','state',statement+' return external?.userData.inspectionTitle;');
 const renderer={subsystems:{iem:{userData:{inspectionTitle:'IEM'}}}},state={selectedPart:'iem'};
 assert.equal(lookup(true,renderer,state),undefined);
 assert.equal(lookup(false,renderer,state),'IEM');
 assert.equal(lookup(false,null,state),undefined);
});
