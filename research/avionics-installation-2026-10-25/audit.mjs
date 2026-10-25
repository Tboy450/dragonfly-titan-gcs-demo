import * as T from '../../dist/vendor/three/three.module.min.js?v=dev';
import {pathToFileURL} from 'node:url';
import {buildIem} from '../../dist/iem.mjs';
import {buildPowerUnits} from '../../dist/power-units.mjs';
import {buildFrontierRadio} from '../../dist/frontier-radio.mjs';
import {buildNoseElectronics} from '../../dist/nose-electronics.mjs';
import {buildBattery} from '../../dist/battery.mjs';
export const builders={iem:buildIem,'power-units':buildPowerUnits,'frontier-radio':buildFrontierRadio,'nose-electronics':buildNoseElectronics,battery:buildBattery};
export const mesh=(g,m,p,parent)=>{const o=new T.Mesh(g,m);o.position.fromArray(p);parent.add(o);return o;};
export function buildFamily(builder){const parent=new T.Group();const result=builder({parent,mesh});parent.updateMatrixWorld(true);return{parent,...result};}
export function installationAudit(){
 const families=[];
 for(const[id,builder]of Object.entries(builders)){
  const{parent}=buildFamily(builder),rows=[],supports=[],additions=[];
  parent.traverse(o=>{
   if(o.userData.installationExample)additions.push(o.name);
   const path=o.geometry?.parameters?.path;if(!path)return;
   const medium=o.name.includes('cap-chain')?'mechanical tether':o.name.includes('ground-strap')?'bonding strap estimate':id==='frontier-radio'?'local RF example':id==='battery'&&o.name.includes('main-lead')?'internal cell interconnect estimate':'electrical bundle example, function unverified';
   rows.push({id:o.userData.connectionId??o.name,name:o.name,medium,radiusM:o.geometry.parameters.radius,
    start:path.getPoint(0).applyMatrix4(o.matrixWorld).toArray(),end:path.getPoint(1).applyMatrix4(o.matrixWorld).toArray(),
    lengthM:path.getLength(),confidence:'EST',flightMatingConfirmed:false});
   supports.push(...(o.userData.installationSupports??[]).map(s=>({...s,wire:o.userData.connectionId??o.name})));
  });
   families.push({id,rows,supports,additions,limits:id==='nose-electronics'?'Retention heads only; caps retained, no fabricated flight harness.':id==='iem'?'All endpoints retained; middle lead has a revised estimated service route. Terminal bundle overlaps; full routing and flight identities remain open.':'Existing paths/endpoints retained. Support installation estimated; full routing and flight identities remain open.'});
 }
 return{frame:'construction metres: +x starboard, +y up, +z aft',families,scope:'Five-family installation examples, not a complete flight harness or electrical solver.'};
}
if(process.argv.includes('--write')&&process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const{writeFile}=await import('node:fs/promises');const report=installationAudit();
 await writeFile(new URL('installation-register.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report.families.map(f=>({id:f.id,paths:f.rows.length,supports:f.supports.length,additions:f.additions.length}))));
}
