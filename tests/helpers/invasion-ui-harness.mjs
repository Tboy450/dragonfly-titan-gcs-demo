// Executes actual entry-point code using DOM/renderer stand-ins; not browser/GPU QA.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SAVE_KEY } from '../../dist/invasion/campaign.mjs';
import { recoveryBackupPrefix } from '../../dist/invasion/save-recovery.mjs';

const entry=new URL('../../dist/invasion/main.mjs',import.meta.url),source=readFileSync(entry,'utf8');
const html=readFileSync(new URL('../../dist/invasion/index.html',import.meta.url),'utf8');
const importPattern=/^import[\s\S]*?from\s+["']([^"']+)["'];?\r?$/gm;
const bindings={};
for(const match of source.matchAll(importPattern)){
  if(match[1].includes('scene.mjs')){bindings.createInvasionScene=()=>{throw new Error('No renderer in this test');};continue;}
  if(match[1].includes('galaxy.mjs')){Object.assign(bindings,{drawStarfield(){},drawGalaxy:()=>[],titleGalaxyPlace:(await import(new URL(match[1],entry).href)).titleGalaxyPlace});continue;}
  Object.assign(bindings,await import(new URL(match[1],entry).href));
}

export function harness(raw=null,{renderer=false}={}){
  const windowHandlers={},documentHandlers={};
  const data=new Map(raw===null?[]:[[SAVE_KEY,raw]]),writes=[],nodes=new Map(),blobs=[],revoked=[];
  let failRead=false,failBackup=false,failPrimary=false;
  const storage={get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:key=>data.get(key)??null,
    setItem(key,value){if(failPrimary&&key===SAVE_KEY||failBackup&&key.startsWith(recoveryBackupPrefix))throw new Error('quota');writes.push({key,value});data.set(key,value);}};
  class Element{
    constructor(id='',tag='div'){this.id=id;this.tagName=tag;this.hidden=false;this.disabled=false;this.open=false;this.value='';this.children=[];this.handlers={};this.dataset={};this.style={setProperty(){}};this.queries=new Map();this.classList={toggle(){},add(){},remove(){},contains:()=>false};this.clientWidth=800;this.clientHeight=600;this.captured=new Set();}
    addEventListener(kind,fn){(this.handlers[kind]??=[]).push(fn);}
    async click(){if(this.disabled)return;this.onclick?.();await Promise.all((this.handlers.click||[]).map(fn=>fn({currentTarget:this,target:this})));}
    showModal(){this.open=true;}
    close(){this.open=false;queueMicrotask(()=>this.onclose?.());}
    append(child){this.children.push(child);if(this.id==='save-backup-choice'&&this.children.length===1)this.value=child.value;}
    replaceChildren(){this.children=[];this.value='';}
    setAttribute(){} remove(){} focus(){} contains(){return false;}
    setPointerCapture(id){this.captured.add(id);}
    hasPointerCapture(id){return this.captured.has(id);}
    releasePointerCapture(id){this.captured.delete(id);}
    getBoundingClientRect(){return {left:0,top:0,width:800,height:600};}
    getContext(){return {setTransform(){}};}
    querySelector(selector){if(!this.queries.has(selector))this.queries.set(selector,new Element());return this.queries.get(selector);}
    querySelectorAll(){return [];}
  }
  for(const tag of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){
    const node=new Element(tag[1],tag[0].match(/^<(\w+)/)[1]);node.hidden=/\bhidden(?:\s|>)/.test(tag[0]);nodes.set(tag[1],node);
  }
  const document={body:new Element(),getElementById:id=>nodes.get(id)||null,
    querySelectorAll:selector=>selector==='.screen'?[...nodes.values()].filter(n=>n.id.startsWith('screen-')):[],
    querySelector:selector=>selector==='dialog[open]'?[...nodes.values()].find(n=>n.tagName==='dialog'&&n.open)||null:null,
    createElement:tag=>new Element('',tag),addEventListener(kind,fn){(documentHandlers[kind]??=[]).push(fn);}};
  class DownloadURL extends URL{
    static createObjectURL(blob){blobs.push(blob);return 'blob:test-'+blobs.length;}
    static revokeObjectURL(url){revoked.push(url);}
  }
  const context=vm.createContext({...bindings,document,window:{devicePixelRatio:1,matchMedia:()=>({matches:false}),addEventListener(kind,fn){(windowHandlers[kind]??=[]).push(fn);}},location:{hostname:'unit-test'},
    URL:DownloadURL,Blob,console,performance,queueMicrotask,requestAnimationFrame(){},setInterval(){},setTimeout(fn){queueMicrotask(fn);},addEventListener(){}});
  if(renderer)context.createInvasionScene=()=>({load(){},resize(){},unitTop:()=>10,
    project:(x,y,z)=>({x,y:z,visible:true}),pickGround:(x,y)=>({x:(x+1)*400,z:(1-y)*300})});
  Object.defineProperty(context,'localStorage',{get(){if(failRead)throw new Error('permission denied');return storage;}});
  const start=()=>vm.runInContext(source.replace(importPattern,''),context,{filename:'Swarmfall entry-point unit harness'});
  const click=id=>nodes.get(id).click();
  async function confirmAction(id,answer=true){const pending=click(id);assert.equal(nodes.get('confirm-dialog').open,true);await click(answer?'confirm-yes':'confirm-no');await pending;}
  const run=code=>vm.runInContext(code,context);
  const json=code=>JSON.parse(run(`JSON.stringify(${code})`));
  const dispatch=(target,type,extra={})=>{
    const event={type,target,clientX:100,clientY:100,pointerId:1,pointerType:'mouse',button:0,buttons:type==='pointerup'?0:1,preventDefault(){this.defaultPrevented=true;},...extra};
    const handlers=target==='window'?windowHandlers:target==='document'?documentHandlers:nodes.get(target).handlers;
    for(const fn of handlers[type]||[])fn(event);
    return event;
  };
  return {data,writes,nodes,blobs,revoked,storage,context,start,click,confirmAction,run,json,dispatch,
    failReading(value){failRead=value;},failBackup(value){failBackup=value;},failPrimary(value){failPrimary=value;}};
}
