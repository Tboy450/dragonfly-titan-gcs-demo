// Bake the preferred coast into a Blender authoring target without changing the browser baseline.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCityFoundation} from '../../dist/invasion/environments/history/contour-v2.mjs';
const parts=JSON.parse(readFileSync(new URL('./environment-tests/cyberpunk-bounds.json',import.meta.url)));
const legacy=new Map();
for(const a of parts)if(a.bottom>=-1&&a.bottom<180&&a.width>=18&&a.depth>=18&&a.width<350&&a.depth<350&&a.height>Math.max(40,a.width*.5,a.depth*.5)){
  const key=Math.round(a.x/15)+','+Math.round(a.z/15),previous=legacy.get(key);
  if(!previous||a.bottom<previous.bottom)legacy.set(key,a);
}
const anchors=[...legacy.values()].sort((a,b)=>b.width*b.depth-a.width*a.depth).slice(0,100);
const coast=createCityFoundation([[-1000,-1000],[1000,-1000],[1000,1000],[-1000,1000]],anchors);
const geometry=coast.getObjectByName('Ground fitted to architecture').geometry,p=geometry.attributes.position;
// Blender is Z-up; glTF/Three is Y-up.
const vertices=Array.from({length:p.count},(_,i)=>[p.getX(i),-p.getZ(i),p.getY(i)]);
const indices=Array.from(geometry.index.array);
mkdirSync('research/fantasy-city-2026-10-16/foundation-authoring',{recursive:true});
writeFileSync('research/fantasy-city-2026-10-16/foundation-authoring/coast-input.json',JSON.stringify({vertices,indices,anchors}));
console.log(JSON.stringify({anchors:anchors.length,vertices:vertices.length,triangles:indices.length/3}));
