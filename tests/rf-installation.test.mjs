import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {rfInstallationRows as rows,rfInstallationSources as sources,rfInstallationLimits as limits} from '../dist/rf-installation.mjs';
import {rfFixture,rfInstallationReport} from '../research/rf-installation-2026-10-29/audit.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
import {inspectionPartIds} from '../dist/inspection-catalog.mjs';

test('RF review uses existing numbered equipment and real available focus targets',()=>{
 const {root}=rfFixture();
 assert.equal(rows.length,7);assert.equal(new Set(rows.map(r=>r.id)).size,7);
 assert.equal(inspectionPartIds.indexOf('hga-actuators')+1,10);
 assert.equal(inspectionPartIds.indexOf('frontier-radio')+1,13);
 assert.equal(inspectionPartIds.indexOf('twta')+1,14);
 for(const r of rows){
  assert.ok(sources[r.source]);assert.ok(['frontier-radio','twta','hga-actuators'].includes(r.inspect));
  if(r.subassembly)assert.ok(inspectionSubassemblies(root).some(o=>o.name===r.subassembly));
  assert.equal(r.flightMatingConfirmed,false);
 }
});
test('Audit distinguishes physical joins from missing internal RF transition and rigid-arm feed motion',()=>{
 const r=rfInstallationReport();
 assert.ok(r.radioPlugContact);assert.ok(r.fixedWaveguideFlangeContact);
 assert.ok(r.radioPlugBoundsGapM<r.boundsContactToleranceM);
 assert.match(r.contactMeaning,/not a reconstructed connector bore/);
 assert.ok(r.stowedAnchorSeparationM>.1);
 assert.match(r.separationMeaning,/not reconstructed/);assert.equal(r.flightMatingConfirmed,false);
 assert.equal(r.feedDeformationModeled,false);assert.equal(r.poses.length,36);
 assert.ok(r.flexibleFeedGeometryReused&&r.fixedFlangeRestored);
 assert.ok(r.poses.every(p=>Math.abs(p.lengthM-r.armFeed.lengthM)<1e-12));
 assert.ok(r.poses.some(p=>p.start.some((v,i)=>Math.abs(v-r.armFeed.start[i])>.02)));
 assert.match(rows.find(o=>o.id==='rf-hidden-transition').modeled,/not reconstructed/);
 assert.match(rows.find(o=>o.id==='rf-hv').modeled,/not an RF feed/);
 assert.match(rows.find(o=>o.id==='rf-moving-feed').modeled,/do not deform/);
});
test('RF material stays inside closed nested details and every focus action retains its row identity',async()=>{
 class E{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.attrs={};this.events={};this.open=false;}
  append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}
  setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,v){this.events[k]=v;}
 }
 const code=(await readFile(new URL('../dist/ui/sampling-connections.mjs',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replaceAll('export function','function');
 const scope={document:{createElement:t=>new E(t)},rfInstallationRows:rows,rfInstallationSources:sources,rfInstallationLimits:limits};
 runInNewContext(code+'\nthis.render=renderRfInstallationAudit',scope);
 const clicked=[],parent=new E('div'),details=scope.render(parent,row=>clicked.push(row.id)),all=[];
 const visit=n=>{all.push(n);n.children.forEach(visit);};visit(details);
 assert.equal(details.tag,'details');assert.equal(details.open,false);assert.equal(details.dataset.rfInstallationAudit,'true');
 assert.equal(all.filter(n=>n.dataset.connectionEvidence).length,7);
 all.filter(n=>n.tag==='button').forEach(n=>n.events.click());
 assert.deepEqual(clicked,rows.map(r=>r.id));assert.equal(all.filter(n=>n.tag==='a').length,7);
});
