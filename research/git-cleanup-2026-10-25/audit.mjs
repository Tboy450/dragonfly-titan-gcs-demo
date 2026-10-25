// Read-only audit. It never deletes objects or invokes general Git maintenance.
import {readdir,readFile,writeFile,stat} from 'node:fs/promises';
import {join,resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
const gitDir=resolve('C:/Users/Heemi/OneDrive/Documents/ChatGPT/Nasa dragonfly/.git');
const backup=resolve('C:/Users/Heemi/.codex/visualizations/2026/09/21/01a0c1fe-26e1-7300-9b26-02e6197228f6/git-recovery-2026-10-25-controlled');
const git=(args,dir=gitDir)=>{
 const r=spawnSync('git',['-c','gc.auto=0','-c','maintenance.auto=false','--git-dir='+dir,...args],{encoding:'utf8',maxBuffer:32*1024*1024});
 if(r.status!==0)throw new Error(args.join(' ')+': '+(r.error?.message??r.stderr));
 return r.stdout;
};
const hash=data=>createHash('sha256').update(data).digest('hex');
async function inventory(dir){
 const rows=[];
 async function visit(path){
  for(const item of await readdir(path,{withFileTypes:true})){
   const full=join(path,item.name);
   if(item.isSymbolicLink())throw new Error('Unexpected symlink: '+full);
   if(item.isDirectory())await visit(full);
   else if(item.isFile()){const data=await readFile(full);rows.push({path:relative(dir,full).replaceAll('\\','/'),bytes:data.length,sha256:hash(data)});}
  }
 }
 await visit(dir);return rows.sort((a,b)=>a.path.localeCompare(b.path));
}
const mode=process.argv[2]??'before',records=new URL('./',import.meta.url);
if(mode==='before'){
 const files=await inventory(gitDir),copy=await inventory(backup);
 if(JSON.stringify(files)!==JSON.stringify(copy))throw new Error('Backup is not a byte-for-byte match; no cleanup allowed.');
 const packFiles=(await readdir(join(gitDir,'objects/pack'))).filter(n=>n.endsWith('.idx'));
 const packed=new Set(),packs=[];
 for(const file of packFiles){
  const output=git(['verify-pack','-v',join(gitDir,'objects/pack',file)]);
  for(const line of output.split(/\r?\n/)){const id=line.split(' ')[0];if(/^[0-9a-f]{40}$/.test(id))packed.add(id);}
  packs.push({index:file,verified:true});
 }
 const dryRun=git(['prune-packed','--dry-run']),paths=dryRun.split(/\r?\n/).filter(Boolean).map(line=>{
  if(!line.startsWith('rm -f '))throw new Error('Unexpected dry-run line: '+line);
  const path=resolve(line.slice(6)),rel=relative(join(gitDir,'objects'),path).replaceAll('\\','/');
  if(!/^[0-9a-f]{2}\/[0-9a-f]{38}$/.test(rel))throw new Error('Candidate outside loose-object scope: '+path);
  return {path:rel,id:rel.replace('/','')};
 });
 for(const row of paths){
  if(!packed.has(row.id))throw new Error('Object not in verified pack: '+row.id);
  const data=await readFile(join(gitDir,'objects',row.path));
  if(createHash('sha1').update(inflateSync(data)).digest('hex')!==row.id)throw new Error('Loose-object hash mismatch: '+row.id);
  row.bytes=data.length;row.sha256=hash(data);
 }
 const report={scope:'Only verified redundant loose objects; no project files, archives, unreferenced-only objects, temporary files, worktree metadata or browser storage.',
  backup,backupFiles:files.length,backupBytes:files.reduce((n,r)=>n+r.bytes,0),packs,packedObjects:packed.size,
  candidates:paths.length,redundantBytes:paths.reduce((n,r)=>n+r.bytes,0),beforeCount:git(['count-objects','-vH']),
  beforeRefs:git(['show-ref']),beforeFsck:git(['fsck','--full']),files,paths};
 await writeFile(new URL('before.json',records),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({backupFiles:report.backupFiles,backupBytes:report.backupBytes,candidates:report.candidates,redundantBytes:report.redundantBytes,verifiedPacks:packs.length}));
}else if(mode==='after'){
 const before=JSON.parse(await readFile(new URL('before.json',records),'utf8'));
 const removed=new Set(before.paths.map(r=>'objects/'+r.path)),now=await inventory(gitDir),current=new Map(now.map(r=>[r.path,r]));
 for(const row of before.files){
  if(removed.has(row.path)){if(current.has(row.path))throw new Error('Redundant file remains: '+row.path);}
  else if(JSON.stringify(current.get(row.path))!==JSON.stringify(row))throw new Error('Non-candidate Git file changed: '+row.path);
 }
 if(git(['show-ref'])!==before.beforeRefs)throw new Error('Refs changed during cleanup.');
 const after={removed:removed.size,nonCandidatesPreserved:before.files.length-removed.size,backupVerified:true,
  count:git(['count-objects','-vH']),fsck:git(['fsck','--full']),backupFsck:git(['fsck','--full'],backup)};
 for(const {index}of before.packs)git(['verify-pack',join(gitDir,'objects/pack',index)]);
 await writeFile(new URL('after.json',records),JSON.stringify(after,null,2)+'\n');
 console.log(JSON.stringify({removed:after.removed,nonCandidatesPreserved:after.nonCandidatesPreserved,count:after.count,fsck:'passed',backupFsck:'passed'}));
}else throw new Error('Use before or after.');
