import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
let order=[4,13,21,26,25,23,24,22];const attempts=[];
for(let seed=0;seed<12;seed++){
 const r=spawnSync(process.execPath,[fileURLToPath(new URL('route-candidates.mjs',import.meta.url))],{
  encoding:'utf8',env:{...process.env,IEM_ORDER:order.join(','),IEM_SEED:String(seed),IEM_REVERSE:'1'},maxBuffer:4*1024*1024});
 const failed=r.stderr?.match(/Error: iem-local-lead-(\d+) no corridor/)?.[1],completed=(r.stdout.match(/iem-local-lead-\d+ \d+ \d+ /g)??[]).length;
 attempts.push({seed,order:[...order],status:r.status,completed,failed:failed?Number(failed):null,log:r.stdout,error:r.stderr});
 writeFileSync(new URL('search-attempts.json',import.meta.url),JSON.stringify(attempts,null,2)+'\n');
 console.log(JSON.stringify({seed,completed,failed,status:r.status}));
 if(r.status===0){console.log('Complete eight-route candidate set. Fittings and acceptance still required.');process.exit(0);}
 if(!failed)throw Error(r.stderr);
 order=[Number(failed),...order.filter(n=>n!==Number(failed))];
}
throw Error('No complete candidate set; no app geometry replaced.');
