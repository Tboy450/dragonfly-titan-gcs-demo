import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url)),port=4214;
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.json':'application/json'};
createServer(async(req,res)=>{try{
 let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),before=p.startsWith('/before/');if(before)p=p.slice(7);
 let path=resolve(root,'.'+p);if(!path.startsWith(resolve(root)+sep))throw Error('Outside workspace');
 if(before&&['/dist/thermal-loop.mjs','/dist/warm-duct-passages.mjs'].includes(p))path=resolve(root,'archive/trim-interfaces-2026-11-01',p.split('/').at(-1));
 res.setHeader('Content-Type',mime[extname(path)]??'application/octet-stream');res.end(await readFile(path));
}catch{res.statusCode=404;res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log('Trim preview http://127.0.0.1:'+port));
