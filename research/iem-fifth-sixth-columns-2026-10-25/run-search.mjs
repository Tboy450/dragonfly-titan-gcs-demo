// Serial offline trials only; no simulator file is modified.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
let order=[21,20,17,19,16,18,15];const attempts=[];
for(let seed=0;seed<12;seed++){
 const r=spawnSync(process.execPath,[fileURLToPath(new URL('route-candidates.mjs',import.meta.url))],{
  encoding:'utf8',env:{...process.env,IEM_ORDER:order.join(','),IEM_SEED:String(seed)},maxBuffer:4*1024*1024});
 const failed=r.stderr?.match(/Error: iem-local-lead-(\d+) no corridor/)?.[1];
 attempts.push({seed,order:[...order],status:r.status,failed:failed?Number(failed):null,log:r.stdout});
 writeFileSync(new URL('search-attempts.json',import.meta.url),JSON.stringify(attempts,null,2)+'\n');
 console.log(JSON.stringify({seed,failed:failed??null,completed:(r.stdout.match(/iem-local-lead-\d+ \d+ \d+ /g)??[]).length,status:r.status}));
 if(r.status===0){console.log('All seven candidates found.');process.exit(0);}
 if(!failed)throw new Error(r.stderr);
 order=[Number(failed),...order.filter(n=>n!==Number(failed))];
}
throw new Error('No complete candidate set; no app geometry changed.');
