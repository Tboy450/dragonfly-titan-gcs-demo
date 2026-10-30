import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url)),port=4194;
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{try{
 let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),before=p.startsWith('/before/');
 if(before)p=p.slice(7);
 let path=resolve(root,'.'+p);if(!path.startsWith(resolve(root)+sep))throw Error('Outside workspace');
 if(before&&p==='/dist/thermal-loop.mjs')path=resolve(root,'archive/warm-duct-passages-2026-10-30/thermal-loop.mjs');
 res.setHeader('Content-Type',mime[extname(path)]??'application/octet-stream');res.end(await readFile(path));
}catch{res.statusCode=404;res.end('Not found');}});
server.listen(port,'127.0.0.1',()=>console.log('Dragonfly duct preview: http://127.0.0.1:'+port));
