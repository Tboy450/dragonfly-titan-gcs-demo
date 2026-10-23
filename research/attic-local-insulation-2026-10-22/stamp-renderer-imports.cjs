// Mechanical import-URL rewrite; preserve every original source before changing it.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve('dist'),archive=path.resolve('archive/attic-local-insulation-2026-10-22/renderer-imports'),changed=[];
for(const file of fs.readdirSync(root,{recursive:true}).filter(f=>/\.(?:m?js|html)$/.test(f))){
 const target=path.join(root,file),old=fs.readFileSync(target,'utf8');
 const next=old.replace(/(["'])(\.{1,2}\/[^"'\r\n]*three\.module\.min\.js)\1/g,'$1$2?v=dev$1');
 if(next===old)continue;
 const saved=path.resolve(archive,file);if(!saved.startsWith(archive+path.sep))throw Error('Archive path outside target');
 fs.mkdirSync(path.dirname(saved),{recursive:true});if(!fs.existsSync(saved))fs.writeFileSync(saved,old);
 fs.writeFileSync(target,next);changed.push(file);
}
console.log(JSON.stringify({changed},null,2));
