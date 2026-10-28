import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {createInspectionAnchorResolver} from '../dist/inspection-anchor.mjs';
import {fullModel,triangles} from '../research/drill-moving-leads-2026-10-27/audit.mjs';
import {numberedInspectionParts,inspectionPartNumber} from '../dist/inspection-catalog.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
const distance=(point,mesh)=>{const q=new T.Vector3();return Math.min(...triangles(mesh).filter(t=>t.getArea()>1e-14).map(t=>point.distanceTo(t.closestPointToPoint(point,q))));};
const box=(parent,x)=>{const o=new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial());o.position.x=x;parent.add(o);return o;};
test('Separated units and a hollow flange anchor on real triangles rather than their empty centers',()=>{
 const root=new T.Group(),pair=new T.Group();root.add(pair);box(pair,-2);box(pair,2);root.updateMatrixWorld(true);
 const resolve=createInspectionAnchorResolver(),pin=resolve(pair,root);
 assert.ok(Math.abs(pin.point.x)>=1.5);assert.ok(distance(pin.point,pin.mesh)<1e-8);
 const shape=new T.Shape();shape.moveTo(-1,-1);shape.lineTo(1,-1);shape.lineTo(1,1);shape.lineTo(-1,1);shape.closePath();
 const hole=new T.Path();hole.absarc(0,0,.3,0,2*Math.PI,true);shape.holes.push(hole);
 const owner=new T.Group(),ring=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:false,curveSegments:32}),new T.MeshBasicMaterial());
 owner.add(ring);root.add(owner);root.updateMatrixWorld(true);
 const anchor=resolve(owner,root,new T.Vector3(0,0,.05));
 assert.ok(Math.hypot(anchor.point.x,anchor.point.y)>.299);assert.ok(distance(anchor.point,ring)<1e-8);
});
test('Hidden covers re-anchor to visible hardware; empty/hidden owners have no visible pin',()=>{
 const root=new T.Group(),owner=new T.Group();root.add(owner);const body=box(owner,0),cover=box(owner,0);cover.position.y=2;
 root.updateMatrixWorld(true);const resolve=createInspectionAnchorResolver(),hint=new T.Vector3(0,2.5,0);
 assert.equal(resolve(owner,root,hint).mesh,cover);cover.visible=false;
 assert.equal(resolve(owner,root,hint).mesh,body);body.visible=false;assert.equal(resolve(owner,root,hint),null);
 body.visible=true;root.visible=false;assert.equal(resolve(owner,root,hint),null);
});
test('Cached barycentric pins follow mesh transforms, root rotations and changing vertex positions',()=>{
 const root=new T.Group(),owner=new T.Group();root.add(owner);const mesh=box(owner,0),resolve=createInspectionAnchorResolver();
 root.updateMatrixWorld(true);resolve(owner,root);
 mesh.position.set(.3,.8,-.4);mesh.rotation.set(.4,.2,.8);root.rotation.set(.3,.6,-.5);
 const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)*1.7);
 root.updateMatrixWorld(true);const pin=resolve(owner,root),world=pin.point.clone().applyMatrix4(root.matrixWorld);
 assert.ok(distance(world,mesh)<1e-7);assert.equal(pin.mesh,mesh);
});
test('All 32 real model entries retain stable numbers and surface anchors across rotation and access masks',()=>{
 const f=fullModel(),parts=numberedInspectionParts(f.subsystems),resolve=createInspectionAnchorResolver();
 assert.equal(parts.length,32);assert.equal(inspectionPartNumber('nose-electronics'),5);
 assert.equal(inspectionPartNumber('main-harness'),32);assert.equal(inspectionPartNumber('navigation-meb-link'),null);
 const mask=createInspectionVisibility(f.subsystems),pins=[];
 for(const azimuth of [0,1.2,3.4]){
  f.root.rotation.set(.35,azimuth,-.2);f.root.updateMatrixWorld(true);
  for(const part of parts){const pin=resolve(part,f.root);if(!pin)continue;
   const world=pin.point.clone().applyMatrix4(f.root.matrixWorld);
   assert.ok(distance(world,pin.mesh)<1e-6,part.name+' pin on actual hardware');
   assert.ok(part.getObjectById(pin.mesh.id),part.name+' owns anchor');pins.push(part.name);
  }
 }
 assert.equal(new Set(pins).size,32);
 const hidden=new Map();mask.apply({hiddenPartLayers:{'nose-electronics':['equipment-covers']}},hidden);
 const part=f.subsystems['nose-electronics'],pin=resolve(part,f.root);assert.ok(pin&&distance(pin.point.clone().applyMatrix4(f.root.matrixWorld),pin.mesh)<1e-6);
 for(const [o,v]of hidden)o.visible=v;
});
