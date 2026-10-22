import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {buildTopDeck,topDeckAsset as A} from '../dist/top-deck.mjs';
import {buildHgaGimbal,hgaAsset} from '../dist/hga-gimbal.mjs';
import {buildTwta,twtaAsset} from '../dist/twta.mjs';
import {sideWallAsset} from '../dist/side-wall.mjs';
import {createInspectionVisibility} from '../dist/inspection-visibility.mjs';
import {inspectionSubassemblies} from '../dist/vehicle-inspector.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const build=()=>{const parent=new T.Group(),p=buildTopDeck({parent,mesh});parent.updateMatrixWorld(true);return{parent,...p};};
test('Deck faces retain published thickness and the existing HGA/TWTA mounting plane',()=>{
  const {upper,lower}=build();assert.equal(A.faceM,.000254);assert.equal(A.bottomY,hgaAsset.deckY);assert.equal(A.bottomY,twtaAsset.deckY);
  const u=new T.Box3().setFromObject(upper),l=new T.Box3().setFromObject(lower);
  assert.ok(Math.abs(u.max.y-u.min.y-A.faceM)<1e-7&&Math.abs(l.max.y-l.min.y-A.faceM)<1e-7);
  assert.ok(Math.abs(l.min.y-A.bottomY)<1e-7&&Math.abs(u.max.y-A.topY)<1e-7);
  assert.equal(A.halfWidthM,sideWallAsset.outerX);assert.equal(A.bottomY,sideWallAsset.topY);
});
test('Antenna opening passes through both faces while adjacent deck material remains',()=>{
  const {upper,lower}=build(),ray=new T.Raycaster();
  const [x,z]=A.cutoutCenter;ray.set(new T.Vector3(x,.3,z),new T.Vector3(0,-1,0));
  assert.equal(ray.intersectObjects([upper,lower],true).length,0);
  ray.set(new T.Vector3(x+A.cutoutRadiusM+.015,.3,z),new T.Vector3(0,-1,0));
  assert.ok(ray.intersectObjects([upper,lower],true).length>=2);
  assert.ok(A.cutoutRadiusM-.085>.0039,'estimated collar gap is not a seal');
});
test('Three foundation examples touch the existing stow-lock bases without moving them',()=>{
  const {pads}=build(),parent=new T.Group();buildHgaGimbal({parent,mesh});parent.updateMatrixWorld(true);
  const bases=[];parent.traverse(o=>{if(['hga-launch-lock-base','hga-flight-lock-base'].includes(o.name))bases.push(o);});
  assert.equal(pads.children.length,3);assert.equal(bases.length,3);
  for(const pad of pads.children){const b=new T.Box3().setFromObject(pad),c=b.getCenter(new T.Vector3());
    const base=bases.find(o=>{const p=new T.Box3().setFromObject(o).getCenter(new T.Vector3());return Math.hypot(c.x-p.x,c.z-p.z)<1e-6;});
    assert.ok(base);const bb=new T.Box3().setFromObject(base);
    assert.ok(Math.abs(b.max.y-bb.min.y)<1e-7&&Math.abs(b.min.y-A.topY)<1e-7);
    assert.ok(b.min.x>=bb.min.x-1e-7&&b.max.x<=bb.max.x+1e-7&&b.min.z>=bb.min.z-1e-7&&b.max.z<=bb.max.z+1e-7);
  }
});
test('Existing gimbal motion clears the deck faces across deploy and pointing states',()=>{
  const {upper,lower}=build(),parent=new T.Group(),gimbal=buildHgaGimbal({parent,mesh});
  const faces=[upper,lower],ray=new T.Raycaster();let checked=0;
  for(const deploy of[0,.25,.5,.75,1])for(const target of[new T.Vector3(1,1,0),new T.Vector3(-1,.5,.2),new T.Vector3(0,.2,-1)]){
    gimbal.pose(deploy,target);parent.updateMatrixWorld(true);
    parent.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o);
      if(b.max.y<A.bottomY||b.min.y>A.topY)return;
      const p=o.geometry.attributes.position,ix=o.geometry.index;
      for(let i=0;i<(ix?.count??p.count);i+=3){
        const tri=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(o.matrixWorld));
        for(const y of[A.bottomY,A.topY])for(let j=0;j<3;j++){
          const a=tri[j],b=tri[(j+1)%3];if(Math.min(a.y,b.y)>=y-1e-7||Math.max(a.y,b.y)<=y+1e-7)continue;
          const v=a.clone().lerp(b,(y-a.y)/(b.y-a.y));ray.set(new T.Vector3(v.x,.4,v.z),new T.Vector3(0,-1,0));
          assert.equal(ray.intersectObjects(faces,true).length,0,`${deploy}:${o.name}`);checked++;
        }
      }
    });
  }
  assert.ok(checked>100);assert.ok(hgaAsset.stowedDishCenter[1]-hgaAsset.dishThicknessM/2>A.supportTopY);
});
test('TWTA thermal pads meet the new underside; no cruise liquid loop is invented',()=>{
  const parent=new T.Group();buildTwta({parent,mesh});parent.updateMatrixWorld(true);let count=0;
  parent.traverse(o=>{if(o.name.includes('thermal-pad')){const b=new T.Box3().setFromObject(o);assert.ok(Math.abs(b.max.y-A.bottomY)<1e-7);count++;}});
  assert.equal(count,2);
});
test('Deck groups and four masks restore independently without creating a numbered part',()=>{
  const {parent,faces,edges,supports,upper,lower,mounts,interfaces,pads}=build();
  assert.equal(parent.userData.label,undefined);assert.equal(parent.userData.inspectionTitle,'Top deck / attic edge');
  assert.equal(parent.userData.coreMicrostructureModeled,false);assert.deepEqual(inspectionSubassemblies(parent),[faces,edges,supports]);
  const layers=createInspectionVisibility({'top-deck':parent});
  for(const[id,hidden]of[['equipment-covers',[upper]],['equipment-casings',[lower]],['mounts',[mounts,pads]],['interfaces',[interfaces]]]){
    const previous=new Map();layers.apply({hiddenPartLayers:{'top-deck':[id]}},previous);assert.equal(previous.size,hidden.length);
    hidden.forEach(o=>assert.equal(o.visible,false));if(id==='mounts')assert.equal(interfaces.visible,true);
    for(const[o,v]of previous)o.visible=v;
  }
  const previous=new Map();layers.apply({hiddenLayers:['deck-panels']},previous);assert.equal(parent.visible,false);for(const[o,v]of previous)o.visible=v;
});
test('Attic-edge lip is only a short estimated closeout; geometry stays finite and bounded',()=>{
  const {parent}=build();let count=0;const lip=parent.getObjectByName('deck-attic-edge-lip'),b=new T.Box3().setFromObject(lip);
  assert.ok(Math.abs(b.max.y-b.min.y-.018)<1e-7);assert.ok(b.max.y<.101);
  parent.traverse(o=>{assert.doesNotMatch(o.name,/honeycomb-cell|adhesive|seal|coolant|wire/);if(o.isMesh){count++;
    const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){
      const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
      assert.ok(Number.isFinite(v.length())&&Math.abs(v.x)<.374&&v.y>.0699&&v.y<.101&&v.z>-.731&&v.z<.991);
    }
  }});assert.ok(count<80,count);
});
