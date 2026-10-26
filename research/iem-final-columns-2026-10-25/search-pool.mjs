import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {selectCompatible} from './select-compatible.mjs';
const attempts=[];
for(let seed=0;seed<8;seed++){
 const r=spawnSync(process.execPath,[fileURLToPath(new URL('route-candidates.mjs',import.meta.url))],{
  encoding:'utf8',maxBuffer:4*1024*1024,env:{...process.env,IEM_ORDER:'4,13,21,22,23,24,25,26',IEM_INDEPENDENT:'1',IEM_REVERSE:'1',IEM_SEED:String(seed)}});
 attempts.push({seed,status:r.status,log:r.stdout,error:r.stderr});
 await writeFile(new URL('pool-attempts.json',import.meta.url),JSON.stringify(attempts,null,2)+'\n');
 const report=await selectCompatible({write:true});console.log(JSON.stringify({seed,...report}));
 if(report.complete)process.exit(0);
}
process.exitCode=1;
