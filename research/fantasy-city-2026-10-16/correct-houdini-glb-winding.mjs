// Orient an evaluated height surface upward regardless of the source SOP's winding.
import {readFileSync,writeFileSync,copyFileSync,existsSync,mkdirSync} from 'node:fs';
const target=new URL('../../dist/invasion/environments/assets/source-scenes/skyway-houdini-coast.glb',import.meta.url);
const draft=new URL('./houdini-authoring/drafts/',import.meta.url);mkdirSync(draft,{recursive:true});
const original=new URL('coast-first-export.glb',draft);
if(!existsSync(original))copyFileSync(target,original);
const data=readFileSync(target),length=data.readUInt32LE(12),doc=JSON.parse(data.toString('utf8',20,20+length));
const a=doc.accessors[2],view=doc.bufferViews[a.bufferView],start=28+length+view.byteOffset;
const pos=28+length+doc.bufferViews[doc.accessors[0].bufferView].byteOffset;let fixed=0;
for(let i=0;i<a.count;i+=3){
  const ids=[0,1,2].map(k=>data.readUInt32LE(start+(i+k)*4));
  const p=ids.map(k=>[data.readFloatLE(pos+k*12),data.readFloatLE(pos+k*12+8)]);
  const normalY=(p[1][1]-p[0][1])*(p[2][0]-p[0][0])-(p[1][0]-p[0][0])*(p[2][1]-p[0][1]);
  if(normalY<0){data.writeUInt32LE(ids[2],start+(i+1)*4);data.writeUInt32LE(ids[1],start+(i+2)*4);fixed++;}
}
writeFileSync(target,data);
console.log(`Oriented ${fixed} triangles upward; first draft preserved.`);
