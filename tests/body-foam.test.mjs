import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import { aftFaceZ } from '../dist/aft-bulkhead.mjs';
import { bodyFoamAsset as A, bodyFoamGeometry, splitBodyFoamSurface, buildBodyFoam, bodyFoamRegions } from '../dist/body-foam.mjs';
import { createInspectionVisibility, globalInspectionLayers } from '../dist/inspection-visibility.mjs';
import { inspectionSubassemblies } from '../dist/vehicle-inspector.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const build=()=>{const parent=new T.Group(),material=new T.MeshStandardMaterial();buildBodyFoam({parent,mesh,material});return{parent,material};};
const triangleAttributes=g=>{
  const s=g.index?g.toNonIndexed():g,keys=Object.keys(s.attributes).sort(),bag=[];
  for(let i=0;i<s.attributes.position.count;i+=3)bag.push(JSON.stringify(keys.map(k=>{
    const a=s.attributes[k];return[k,a.itemSize,a.normalized,Array.from(a.array.slice(i*a.itemSize,(i+3)*a.itemSize))];
  })));
  return bag.sort();
};
test('Body regions preserve every original position, normal, UV and triangle exactly once',()=>{
  const outline=new T.Shape();
  [[-1.90,-.05],[-1.78,-.27],[-1.48,-.36],[aftFaceZ(-.36),-.36],[aftFaceZ(.10),.10],[-1.83,.10]]
    .forEach(([z,y],i)=>i?outline.lineTo(z,y):outline.moveTo(z,y));outline.closePath();
  const old=new T.ExtrudeGeometry(outline,{depth:.86-2*.05,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:5,curveSegments:18});
  old.rotateY(-Math.PI/2);old.translate((.86-2*.05)/2,0,0);
  const current=bodyFoamGeometry(),parts=splitBodyFoamSurface(current);
  assert.deepEqual(triangleAttributes(current),triangleAttributes(old));
  assert.deepEqual([...parts.values()].flatMap(triangleAttributes).sort(),triangleAttributes(old));
  const total=[...parts.values()].reduce((n,g)=>n+g.attributes.position.count,0);
  assert.equal(total,old.attributes.position.count);
});
test('Five nonempty broad regions follow geometric face direction, not smoothed bevel normals',()=>{
  const parts=splitBodyFoamSurface(bodyFoamGeometry());
  for(const[id,g]of parts){assert.ok(g.attributes.position.count>0,id);const p=g.attributes.position;
    for(let i=0;i<p.count;i+=3){
      const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),c=new T.Vector3().fromBufferAttribute(p,i+2);
      const x=(a.x+b.x+c.x)/3,n=b.sub(a).cross(c.sub(a)),nx=Math.abs(n.x),ny=Math.abs(n.y),nz=Math.abs(n.z);
      if(id.endsWith('port')&&!id.endsWith('starboard'))assert.ok(x<0&&nx>=ny&&nx>=nz);
      else if(id.endsWith('starboard'))assert.ok(x>=0&&nx>=ny&&nx>=nz);
      else if(id.endsWith('top'))assert.ok(n.y>0&&ny>=nx&&ny>=nz);
      else if(id.endsWith('belly'))assert.ok(n.y<=0&&ny>=nx&&ny>=nz);
      else assert.ok(nz>nx&&nz>ny);
    }
  }
});
test('Indexed geometry also retains attributes and source geometry is not mutated',()=>{
  const g=new T.BoxGeometry(1,1,1),snapshot=Array.from(g.attributes.position.array);
  const parts=splitBodyFoamSurface(g);assert.deepEqual(Array.from(g.attributes.position.array),snapshot);
  assert.deepEqual([...parts.values()].flatMap(triangleAttributes).sort(),triangleAttributes(g));
});
test('Inspection regions are surface-only, keep the material and add no numbered equipment',()=>{
  const {parent,material}=build();assert.equal(parent.userData.label,undefined);assert.equal(parent.userData.surfaceOnly,true);
  assert.equal(A.localThicknessModeled,false);assert.equal(A.nominalSourceThicknessM,.076);
  assert.match(A.sourceMaterial,/Solimide/);
  assert.deepEqual(inspectionSubassemblies(parent).map(o=>o.name),bodyFoamRegions.map(r=>r.id));
  assert.equal(parent.children.length,5);
  for(const group of parent.children){assert.equal(group.children.length,1);assert.equal(group.children[0].material,material);assert.equal(group.userData.inspectionLayer,'insulation');}
});
test('Individual surface masks, all-body and all-insulation restore without hiding structure',()=>{
  const {parent}=build(),wall=new T.Group(),deck=new T.Group(),attic=new T.Group(),equipment=new T.Group();
  const foam=new T.Group();foam.userData.inspectionLayer='insulation';equipment.add(foam);
  const controls=createInspectionVisibility({fuselage:parent,attic,'starboard-wall':wall,'top-deck':deck,equipment});
  for(const id of [...bodyFoamRegions.map(r=>r.id),'body-shell','insulation']){
    assert.ok(controls.available(id));const previous=new Map();controls.apply({hiddenLayers:[id]},previous);
    assert.ok(wall.visible&&deck.visible&&attic.visible);assert.equal(parent.visible,id!=='body-shell');
    for(const g of parent.children)assert.equal(g.visible,id!=='insulation'&&id!==g.name);
    assert.equal(foam.visible,id!=='insulation');
    for(const[o,v]of previous)o.visible=v;
    assert.ok(parent.visible&&parent.children.every(o=>o.visible)&&foam.visible);
  }
  assert.equal(new Set(globalInspectionLayers.map(r=>r.id)).size,globalInspectionLayers.length);
});
test('Geometry stays finite and bounded; retired cross-bay seam boxes are not retained',()=>{
  const {parent}=build(),original=bodyFoamGeometry();original.computeBoundingBox();
  assert.deepEqual(new T.Box3().setFromObject(parent),original.boundingBox);
  let count=0;parent.traverse(o=>{if(!o.isMesh)return;count++;
    assert.notEqual(o.geometry.type,'BoxGeometry');
    assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));
    assert.ok(o.geometry.attributes.position.count<5000);
  });assert.equal(count,5);
});
