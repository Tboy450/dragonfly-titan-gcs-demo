import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three/three.module.min.js';
import {buildAtticInsulation,atticInsulationGeometry,atticInsulationRegions} from '../dist/attic-insulation.mjs';
import {buildBodyFoam,bodyFoamGeometry} from '../dist/body-foam.mjs';
import {buildHgaGimbal,hgaAsset} from '../dist/hga-gimbal.mjs';
import {buildSideCameras} from '../dist/side-cameras.mjs';
import {cutSurfacePort,openBodyCameraPorts} from '../dist/foam-optical-ports.mjs';
import {createInspectionVisibility,applyInspectionAccessPreset,inspectionAccessPreset,setInspectionLayer} from '../dist/inspection-visibility.mjs';
const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
const triangleBag=(g,matrix=new T.Matrix4())=>{
  const s=g.index?g.toNonIndexed():g,p=s.attributes.position,result=[];
  for(let i=0;i<p.count;i+=3)result.push(JSON.stringify([0,1,2].flatMap(j=>new T.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(matrix).toArray())));
  return result.sort();
};
const fixture=()=>{const body=new T.Group(),attic=new T.Group(),hga=new T.Group(),cameras=new T.Group();
  buildBodyFoam({parent:body,mesh,material:new T.MeshStandardMaterial()});
  buildAtticInsulation({parent:attic,mesh,material:new T.MeshStandardMaterial()});
  const gimbal=buildHgaGimbal({parent:hga,mesh}),lower=buildSideCameras({parent:cameras,mesh});
  return{body,attic,hga,cameras,gimbal,lower};
};
test('Attic regions retain the original arched cover geometry and add no numbered equipment',()=>{
  const {attic}=fixture(),old=atticInsulationGeometry();attic.updateMatrixWorld(true);
  const bag=[];attic.traverse(o=>{if(o.isMesh)bag.push(...triangleBag(o.geometry,o.matrixWorld));});
  assert.deepEqual(bag.sort(),triangleBag(old));assert.equal(attic.children.length,5);
  assert.ok(attic.children.every(g=>g.children.length&&g.userData.surfaceOnly));
  assert.equal(attic.userData.localThicknessModeled,false);assert.equal(attic.userData.label,undefined);
  assert.deepEqual(new T.Box3().setFromObject(attic),old.computeBoundingBox()||old.boundingBox);
});
test('HGA surface split exactly retains the old capsule at the original actuator frame',()=>{
  const {gimbal}=fixture();gimbal.assembly.updateMatrixWorld(true);
  const old=new T.Mesh(new T.CapsuleGeometry(hgaAsset.domeRadiusM,.13,6,20));
  old.position.set(0,hgaAsset.hinge[1]-hgaAsset.foamTop,0);old.rotation.z=Math.PI/2;
  const stage=new T.Group();stage.position.fromArray([hgaAsset.hinge[0],hgaAsset.foamTop,hgaAsset.hinge[2]]);stage.add(old);stage.updateMatrixWorld(true);
  const actual=[];gimbal.dome.traverse(o=>{if(o.isMesh)actual.push(...triangleBag(o.geometry,o.matrixWorld));});
  assert.deepEqual(actual.sort(),triangleBag(old.geometry,old.matrixWorld));
  assert.ok(gimbal.dome.getObjectByName('hga-dome-upper')&&gimbal.dome.getObjectByName('hga-dome-lower'));
});
test('Port subtraction removes the opening, preserves exterior area and interpolated UVs',()=>{
  const source=new T.PlaneGeometry(4,4),g=cutSurfacePort(source,new T.Matrix4(),.5,-.1,.1);
  let area=0;const p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),c=new T.Vector3().fromBufferAttribute(p,i+2);area+=b.sub(a).cross(c.sub(a)).length()/2;}
  assert.ok(Math.abs(area-15)<1e-7);const o=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));o.updateMatrixWorld(true);
  assert.equal(new T.Raycaster(new T.Vector3(0,0,1),new T.Vector3(0,0,-1)).intersectObject(o).length,0);
  assert.ok(new T.Raycaster(new T.Vector3(1,0,1),new T.Vector3(0,0,-1)).intersectObject(o).length);
  for(let i=0;i<p.count;i++){assert.ok(Math.abs(uv.getX(i)-(p.getX(i)+2)/4)<1e-7);assert.ok(Math.abs(uv.getY(i)-(p.getY(i)+2)/4)<1e-7);}
});
test('Four lower optical corridors and new surrounds leave the window sight rays unobstructed',()=>{
  const {body,lower,cameras}=fixture();openBodyCameraPorts(body,lower.cameras);body.updateMatrixWorld(true);cameras.updateMatrixWorld(true);
  const material=new T.MeshBasicMaterial({side:T.DoubleSide});body.traverse(o=>{if(o.isMesh)o.material=material;});
  const newFoam=[];cameras.traverse(o=>{if(o.isMesh&&o.name.includes('surround'))newFoam.push(o);});
  let rays=0;
  for(const cam of lower.cameras){
    const port=cam.window.userData.opticalPort,q=cam.group.quaternion,dir=new T.Vector3(0,0,1).applyQuaternion(q);
    for(const[x,y]of [[0,0],[.5,0],[-.5,0],[0,.5],[0,-.5]]){
      const from=new T.Vector3(x*port.halfWidth,y*port.halfWidth,port.from+.0001).applyMatrix4(cam.group.matrixWorld);
      const ray=new T.Raycaster(from,dir,0,port.to-port.from);
      assert.equal(ray.intersectObject(body,true).length,0,cam.group.name+' body port');
      const hits=ray.intersectObjects(newFoam);
      assert.equal(hits.length,0,cam.group.name+' surround sightline '+x+','+y+' '+hits.map(h=>h.object.name).join(','));rays++;
    }
  }
  assert.equal(rays,20);
  const original=bodyFoamGeometry();original.computeBoundingBox();
  assert.deepEqual(new T.Box3().setFromObject(body),original.boundingBox,'ports do not enlarge the old body');
  body.traverse(o=>{if(o.isMesh)assert.ok(o.geometry.attributes.position.count<20000);});
});
test('Attic, HGA and camera insulation controls restore independently without moving hardware',()=>{
  const {body,attic,hga,cameras,gimbal}=fixture(),wall=new T.Group(),deck=new T.Group();
  const layers=createInspectionVisibility({fuselage:body,attic,'hga-actuators':hga,'side-cameras':cameras,'starboard-wall':wall,'top-deck':deck});
  for(const id of [...atticInsulationRegions.map(r=>r.id),'attic-shell','hga-insulation','camera-insulation']){
    assert.ok(layers.available(id),id);const previous=new Map();layers.apply({hiddenLayers:[id]},previous);
    assert.ok(previous.size>0);assert.ok(body.visible&&wall.visible&&deck.visible&&gimbal.drive.visible);
    for(const[o,v]of previous)o.visible=v;
  }
  assert.ok(layers.available('insulation','hga-actuators')&&layers.available('insulation','side-cameras'));
});
test('Open interior hides obstructions but keeps equipment, mounts and connections at installed poses',()=>{
  const {body,attic,hga,cameras,gimbal}=fixture(),wall=new T.Group(),deck=new T.Group(),bulkhead=new T.Group();
  const i={azimuth:1.1,zoom:1.7,focusPart:'battery',subassembly:'cells',isolate:false,hiddenPartLayers:{battery:['equipment-covers']}};
  const layers=createInspectionVisibility({fuselage:body,attic,'hga-actuators':hga,'side-cameras':cameras,'starboard-wall':wall,'top-deck':deck,'nose-bulkhead':bulkhead});
  applyInspectionAccessPreset(i,'open');assert.equal(inspectionAccessPreset(i),'open');
  const previous=new Map();layers.apply(i,previous);
  assert.ok(!body.visible&&!attic.visible&&!wall.visible&&!deck.visible&&!bulkhead.visible);
  assert.ok(hga.visible&&cameras.visible&&gimbal.drive.visible&&gimbal.harness.visible&&gimbal.mounts.visible);
  assert.equal(i.azimuth,1.1);assert.equal(i.zoom,1.7);assert.equal(i.focusPart,'battery');assert.equal(i.subassembly,'cells');
  for(const[o,v]of previous)o.visible=v;
  setInspectionLayer(i,'partitions',true);assert.equal(inspectionAccessPreset(i),'custom');
  applyInspectionAccessPreset(i,'all');assert.equal(inspectionAccessPreset(i),'all');assert.deepEqual(i.hiddenLayers,[]);
});
