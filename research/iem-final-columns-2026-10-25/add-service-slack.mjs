import {readFile,writeFile} from 'node:fs/promises';
const url=new URL('candidate-routes.json',import.meta.url),rows=JSON.parse(await readFile(new URL('candidate-before-slack.json',import.meta.url),'utf8'));
for(const[id,lo,hi,amplitude]of[['iem-local-lead-4',.085,.115,.012],['iem-local-lead-21',-.070,-.052,.005]]){
 const row=rows.find(r=>r.id===id);
 row.points=row.points.map(([x,y,z],i)=>i>0&&i<row.points.length-1&&x>lo&&x<hi?[x,y+amplitude*Math.sin(Math.PI*(x-lo)/(hi-lo))**2,z]:[x,y,z]);
}
await writeFile(url,JSON.stringify(rows,null,2)+'\n');
