import {fixture,installedFixture,routeHits,bodyHits} from '../draco-blower-pair-2026-10-27/audit.mjs';
import {writeFile} from 'node:fs/promises';
const previous={'draco-forward-blower-exhaust':.27049790990571737,'draco-aft-blower-exhaust':.2704979099057174,
 'draco-forward-blower-selector-inlet':.9430874786431173,'draco-aft-blower-selector-inlet':1.3638143587910152};
const local=fixture(),installed=installedFixture(),owner=installed.subsystems['drill-blower'];
const result={date:'2026-10-28',scope:'Compact estimated rigid-tube geometry, not verified flight routing or pressure-loss analysis',
 routes:local.blowers.plumbing.children.map(o=>{const path=o.geometry.parameters.path,lengthM=path.getLength();return{
  name:o.name,lengthM,previousLengthM:previous[o.name],reductionPercent:100*(1-lengthM/previous[o.name]),
  construction:path.type,segmentTypes:path.curves.map(c=>c.type)};}),
 retentionClips:2,unitExteriorsAndPoses:'Exact archive-preservation regression',newInsulationHoles:0,
 tubeSurfaceHits:routeHits(installed.root,owner,true),bodyContacts:bodyHits(installed.root,owner),
 intendedContact:'Existing return tube seated in the unchanged selector',flightInstallationConfirmed:false};
await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
