import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url)),base=resolve(root),mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.json':'application/json'};
createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),p=resolve(base,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));if(!p.startsWith(base+sep))throw Error('Outside workspace');res.setHeader('Content-Type',mime[extname(p)]??'application/octet-stream');res.end(await readFile(p));}catch{res.statusCode=404;res.end('Not found');}}).listen(4216,'127.0.0.1',()=>console.log('Thermal audit http://127.0.0.1:4216'));
