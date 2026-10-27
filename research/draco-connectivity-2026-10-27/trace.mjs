// Research-only boundary checks on actual rendered paths and valve envelopes.
// Valve internals, pressure losses and flight plumbing are not reconstructed.
import * as THREE from '../../dist/vendor/three/three.module.min.js';
import {fixture} from '../draco-side-audit-2026-10-26/audit.mjs';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';

export function trace(f = fixture()) {
  f.root.updateMatrixWorld(true);
  const find = name => {
    const object = f.root.getObjectByName(name);
    if (!object) throw new Error(`Missing ${name}`);
    return object;
  };
  const point = (name, t) => {
    const object = find(name);
    return object.geometry.parameters.path.getPoint(t).applyMatrix4(object.matrixWorld);
  };
  const rows = [];
  const boxJoin = (name, p, target) => {
    const object = find(target);
    object.geometry.computeBoundingBox();
    const local = object.worldToLocal(p.clone()), b = object.geometry.boundingBox;
    const gap = Math.max(...['x','y','z'].map(axis => Math.max(b.min[axis]-local[axis],local[axis]-b.max[axis])));
    rows.push({name,target,gapM:gap,connected:gap <= 1e-8,point:p.toArray()});
  };
  for (const side of ['port','starboard']) {
    const hose = `draco-flexible-hose-${side}`, tube = `draco-intake-tube-${side}`;
    const gap = point(hose,0).distanceTo(point(tube,0));
    rows.push({name:`${side} hose to intake`,target:tube,gapM:gap,connected:gap <= 1e-8});
    boxJoin(`${side} intake to carousel selector`,point(tube,1),'draco-flow-diverter-manifold');
  }
  boxJoin('carousel selector to shared return',point('draco-return-tube',0),'draco-flow-diverter-manifold');
  boxJoin('shared return to blower selector',point('draco-return-tube',1),'draco-blower-flow-diverter');
  for (const side of ['forward','aft']) {
    const inlet = find(`draco-${side}-blower-inlet`), half = inlet.geometry.parameters.height/2;
    boxJoin(`blower selector to ${side} inlet`,inlet.localToWorld(new THREE.Vector3(0,half,0)),'draco-blower-flow-diverter');
    boxJoin(`${side} inlet to blower body`,inlet.localToWorld(new THREE.Vector3(0,-half,0)),`draco-${side}-blower-volute`);
  }
  return {scope:'Rendered endpoint/envelope continuity only; no valve-interior or flow solver',rows,
    connected:rows.every(row=>row.connected),
    route:'Either drill -> its flexible hose -> its own intake tube -> shared carousel selector -> shared return -> blower selector -> either blower',
    limits:'Simplified carousel junction; separate LDMS/GCMS elevator branches and internal valve passages remain unmodeled.'};
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const result = trace();
  await writeFile(new URL('continuity.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}
