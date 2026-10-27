import * as T from './vendor/three/three.module.min.js?v=dev';
import {buildDrillDrive} from './drill-drive.mjs?v=dev';

// [PUB] Adams et al., AMS2024 printed192 fig2: covered actuator/gear pair,
// metal guide and two polymer dust bellows. Printed197: ETFE film and fold family.
// [EST] all fitted dimensions/outline/fold counts below. Existing130 mm stroke kept.
export const drillFeedAsset=Object.freeze({
 revision:'drill-feed-drive-2026-10-27',strokeM:.13,
 filmReferenceM:.000127,filmThicknessModeled:false,
 outerRadiusM:.020,innerRadiusM:.013,folds:16,facets:8,
 upperFixedY:-.312,lowerFixedY:-.745,
 upperMovingY:.216,lowerMovingY:.164,
});

// Surface-only corrugation. It approximates the photographed folded polymer sleeve;
// no exact crease pattern, material mechanics or sealed interior is reconstructed.
function bellowsGeometry(){
 const rings=drillFeedAsset.folds*2+1,facets=drillFeedAsset.facets;
 const g=new T.BufferGeometry(),indices=[];
 g.setAttribute('position',new T.BufferAttribute(new Float32Array(rings*(facets+1)*3),3).setUsage(T.DynamicDrawUsage));
 for(let row=0;row<rings-1;row++)for(let col=0;col<facets;col++){
  const a=row*(facets+1)+col,b=a+facets+1;
  indices.push(a,b,a+1,b,b+1,a+1);
 }
 g.setIndex(indices);g.userData.update=(bottom,top)=>{
  const p=g.attributes.position;
  for(let row=0;row<rings;row++){
   const radius=row%2?drillFeedAsset.outerRadiusM:drillFeedAsset.innerRadiusM;
   for(let col=0;col<=facets;col++){
    const angle=col/facets*Math.PI*2;
    p.setXYZ(row*(facets+1)+col,radius*Math.cos(angle),bottom+(top-bottom)*row/(rings-1),radius*Math.sin(angle));
   }
  }
  p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
 };
 return g;
}

export function buildDrillFeedStage({drill,carriage,stage,mesh,side,railX,stowedY,silver,grey}){
 const group=(parent,name,inspectionLayer)=>{const g=new T.Group();g.name=name;g.userData.inspectionLayer=inspectionLayer;parent.add(g);return g;};
 const covers=group(drill,'drill-feed-covers','equipment-covers');
 const casings=group(drill,'drill-feed-drive-casings','equipment-casings');
 const interfaces=group(drill,'drill-feed-fixed-interfaces','interfaces');
 const movingInterfaces=group(carriage,'drill-feed-moving-interfaces','interfaces');
 const film=new T.MeshStandardMaterial({color:0xe1dfca,roughness:.56,metalness:0,flatShading:true,side:T.DoubleSide,transparent:true,opacity:.90,depthWrite:false});
 const drive=buildDrillDrive({mesh,side,railX,silver,grey,stage,covers,casings,interfaces});
 // Actual estimated V-flanks now live in drillGuideGeometry; no painted groove strips.
 const collar=(parent,y,name)=>{
  const h=.006,ri=.007,ro=.020;
  const shape=[new T.Vector2(ri,-h/2),new T.Vector2(ro,-h/2),new T.Vector2(ro,h/2),new T.Vector2(ri,h/2),new T.Vector2(ri,-h/2)];
  const o=mesh(new T.LatheGeometry(shape,24),grey,[railX,y,.045],parent);o.name=name;return o;
 };
 collar(interfaces,drillFeedAsset.upperFixedY+.003,'drill-bellows-upper-fixed-collar');
 collar(interfaces,drillFeedAsset.lowerFixedY-.003,'drill-bellows-lower-fixed-collar');
 const spacerShape=[new T.Vector2(.007,-.0045),new T.Vector2(.011,-.0045),new T.Vector2(.011,.0045),new T.Vector2(.007,.0045),new T.Vector2(.007,-.0045)];
 const spacer=mesh(new T.LatheGeometry(spacerShape,24),grey,[railX,-.7555,.045],interfaces);spacer.name='drill-bellows-lower-stand';
 collar(movingInterfaces,drillFeedAsset.upperMovingY-.003,'drill-bellows-upper-moving-collar');
 collar(movingInterfaces,drillFeedAsset.lowerMovingY+.003,'drill-bellows-lower-moving-collar');
 const upper=mesh(bellowsGeometry(),film,[railX,0,.045],covers);upper.name='drill-upper-dust-bellows';
 const lower=mesh(bellowsGeometry(),film,[railX,0,.045],covers);lower.name='drill-lower-dust-bellows';
 let previous=null;
 const setFeed=feed=>{
  const value=T.MathUtils.clamp(Number.isFinite(feed)?feed:0,0,drillFeedAsset.strokeM);
  if(value===previous)return;previous=value;
  upper.geometry.userData.update(stowedY-value+drillFeedAsset.upperMovingY,drillFeedAsset.upperFixedY);
  lower.geometry.userData.update(drillFeedAsset.lowerFixedY,stowedY-value+drillFeedAsset.lowerMovingY);
 };
 setFeed(0);return{covers,casings,interfaces,movingInterfaces,upper,lower,drive,setFeed};
}
