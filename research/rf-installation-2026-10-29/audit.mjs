import * as T from '../../dist/vendor/three/three.module.min.js';
import {buildFrontierRadio} from '../../dist/frontier-radio.mjs';
import {buildTwta} from '../../dist/twta.mjs';
import {buildHgaGimbal} from '../../dist/hga-gimbal.mjs';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function rfFixture(){
 const root=new T.Group();
 const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
 const radio=buildFrontierRadio({parent:root,mesh}),twta=buildTwta({parent:root,mesh}),hga=buildHgaGimbal({parent:root,mesh});
 root.updateMatrixWorld(true);return{root,radio,twta,hga};
}
const xyz=p=>p.toArray().map(n=>Math.round(n*1e6)/1e6);
export function rfInstallationReport(){
 const {root,hga}=rfFixture();
 const get=name=>{const o=root.getObjectByName(name);if(!o)throw Error('Missing modeled item '+name);return o;};
 const ends=name=>{const o=get(name),p=o.geometry.parameters.path;return{start:xyz(o.localToWorld(p.getPoint(0))),end:xyz(o.localToWorld(p.getPoint(1))),lengthM:p.getLength()};};
 const box=name=>new T.Box3().setFromObject(get(name));
 const feed=get('hga-flexible-feed'),fixed=get('hga-rotary-joint-flange');
 const fixedCenter=box(fixed.name).getCenter(new T.Vector3());
 const fixedMatrix=fixed.matrixWorld.toArray();
 const plugBox=box('twta-rf-input-coax-plug'),radioBox=box('frontier-radio-J31');
 const axisGaps=['x','y','z'].map(k=>Math.max(0,radioBox.min[k]-plugBox.max[k],plugBox.min[k]-radioBox.max[k]));
 const radioPlugBoundsGapM=Math.hypot(...axisGaps),boundsContactToleranceM=1e-8;
 const geometry=feed.geometry,poses=[];
 for(const target of [[0,1,1],[1,1,0],[-1,1,0],[0,1,-1]])for(let i=0;i<=8;i++){
  const state=hga.pose(i/8,new T.Vector3(...target).normalize());root.updateMatrixWorld(true);
  const e=ends(feed.name);
  poses.push({target,deployed:i/8,theta:state.theta,phi:state.phi,limited:state.limited,...e});
 }
 hga.pose(0);root.updateMatrixWorld(true);
 const stowed=ends(feed.name);
 return{
  scope:'Measured rendered installation only; not verified RF continuity or flight routing',
  flightMatingConfirmed:false,
  coax:ends('twta-rf-input-coax'),hvUmbilical:ends('twta-hv-umbilical'),armFeed:stowed,
  radioPlugContact:radioPlugBoundsGapM<=boundsContactToleranceM,
  radioPlugBoundsGapM,boundsContactToleranceM,
  contactMeaning:'Outer bounding-envelope face contact with 10 nm Float32 tolerance; not a reconstructed connector bore, mating proof or verified circuit.',
  fixedWaveguideFlangeContact:box('twta-waveguide-joint-flange').intersectsBox(box('hga-rotary-joint-flange')),
  underDeckFlangeCenter:xyz(fixedCenter),
  stowedAnchorSeparationM:new T.Vector3(...stowed.start).distanceTo(fixedCenter),
  separationMeaning:'Distance between displayed lower-flange center and arm-feed start; hidden gimbal route is not reconstructed. Not a measured flight gap or required cable length.',
  flexibleFeedGeometryReused:geometry===feed.geometry,
  fixedFlangeRestored:fixedMatrix.every((n,i)=>Math.abs(n-fixed.matrixWorld.elements[i])<1e-12),
  feedDeformationModeled:false,poses,
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const r=rfInstallationReport();await writeFile(new URL('measurements.json',import.meta.url),JSON.stringify(r,null,2)+'\n');
 console.log(JSON.stringify({radioPlugContact:r.radioPlugContact,fixedFlangeContact:r.fixedWaveguideFlangeContact,stowedAnchorSeparationM:r.stowedAnchorSeparationM,poses:r.poses.length}));
}
