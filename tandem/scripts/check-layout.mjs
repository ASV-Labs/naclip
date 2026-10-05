// Offline checks for the 0.4.2 layout guard and update prompt.
import {readFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
import vm from 'node:vm'

const source=await readFile(new URL('../../plugin.js',import.meta.url),'utf8')
const between=(a,b)=>source.split(a)[1].split(b)[0]

// 1. Update helpers and the published manifest agree with the plugin.
const update=await import('data:text/javascript;base64,'+Buffer.from(between('// --- update:begin ---','// --- update:end ---')).toString('base64'))
const VERSION=source.match(/const VERSION = '([^']+)'/)[1]
const manifest=JSON.parse(await readFile(new URL('../../version.json',import.meta.url),'utf8'))
assert.equal(manifest.version,VERSION,'version.json must match plugin.js VERSION')
assert.equal(update.parseVersionManifest(manifest).version,VERSION)
assert(update.parseVersionManifest(manifest).notes.length>0,'version.json needs release notes')
assert.equal(update.compareVersions('0.4.10','0.4.9'),1)
assert.equal(update.compareVersions('0.4.2','0.4.2'),0)
assert.equal(update.compareVersions('0.4.1','0.4.2'),-1)
assert.equal(update.compareVersions('1.0.0','0.99.99'),1)
for(const bad of [null,[],'0.5.0',{version:'latest'},{version:'1.0'},{version:'1.0.0<script>'}])assert.throws(()=>update.parseVersionManifest(bad))
assert.equal(update.parseVersionManifest({version:'9.9.9',url:'https://evil.example/naclip'}).url,update.REPO_URL+'/releases')
assert.equal(update.parseVersionManifest({version:'9.9.9',url:'javascript:alert(1)'}).url,update.REPO_URL+'/releases')
assert.equal(update.parseVersionManifest({version:'9.9.9',notes:['x'.repeat(900),3,'ok']}).notes[0].length,200)
assert.deepEqual(update.parseVersionManifest({version:'9.9.9',notes:['x'.repeat(900),3,'ok']}).notes.length,2)

// 2. NaCLip's strips are fixed tracks with no room to grow or shrink.
const rail=source.match(/id: 'rail',[\s\S]*?data: (\{[^\n]*\})/)[1]
const dock=source.match(/id: 'dock',[\s\S]*?data: (\{[^\n]*\})/)[1]
for(const k of ['width','minWidth','maxWidth'])assert.match(rail,new RegExp(`${k}: '64px'`),`rail ${k}`)
for(const k of ['height','minHeight','maxHeight'])assert.match(dock,new RegExp(`${k}: '56px'`),`dock ${k}`)

// 3. Layout guard against a minimal fake DOM.
function el({rect={left:0,top:0,width:0,height:0},classes=[],display=''}={}){
 const r={...rect,right:rect.left+rect.width,bottom:rect.top+rect.height}
 return {dataset:{},style:{display,_props:{},setProperty(k,v){this._props[k]=v},removeProperty(k){delete this._props[k]}},classList:{contains:c=>classes.includes(c)},getBoundingClientRect:()=>r,parentElement:null,previousElementSibling:null}
}
function row(tracks){ // tracks: [{w, hidden}] → wrappers with sashes on every track after the first
 const wrappers=[],sashes=[];let x=0
 tracks.forEach((t,i)=>{const w=el({rect:{left:x,top:0,width:t.hidden?0:t.w,height:900},display:t.hidden?'none':''});w.previousElementSibling=wrappers[i-1]||null;wrappers.push(w);if(!t.hidden)x+=t.w
  if(i>0){const s=el({classes:['cursor-col-resize']});s.parentElement=w;sashes.push(s)}})
 return {wrappers,sashes}
}
const ctx={window:{innerWidth:1898},document:{documentElement:el(),querySelectorAll:()=>[]},$railSide:{v:'left',get(){return this.v},set(v){this.v=v}}}
vm.createContext(ctx);vm.runInContext(between('// --- layout-guard:begin ---','// --- layout-guard:end ---')+';this.syncSashes=syncSashes;this.syncSidebarSide=syncSidebarSide',ctx)

// Unflipped: [rail 60][sessions 240][main] — the rail's seam (owned by sessions) locks.
let {wrappers,sashes}=row([{w:60},{w:240},{w:1598}])
ctx.document.querySelectorAll=()=>sashes
ctx.syncSashes(new Set([wrappers[0]]))
assert.equal(sashes[0].dataset.naclipSash,'locked')
assert.equal(sashes[1].dataset.naclipSash,'below-titlebar')
// Flipped with a hidden zone between: [main][hidden][sessions][rail] — rail owns its seam; partner skips hidden.
;({wrappers,sashes}=row([{w:1598},{w:300,hidden:true},{w:240},{w:60}]))
ctx.document.querySelectorAll=()=>sashes
ctx.syncSashes(new Set([wrappers[3]]))
assert.equal(sashes[2].dataset.naclipSash,'locked')
assert.equal(sashes[1].dataset.naclipSash,'below-titlebar')
// A seam whose track starts below the titlebar keeps Hermes's full-height sash.
const low=el({rect:{left:0,top:400,width:100,height:56}}),lowSash=el({classes:['cursor-row-resize']});lowSash.parentElement=low
ctx.document.querySelectorAll=()=>[lowSash];ctx.syncSashes(new Set());assert.equal(lowSash.dataset.naclipSash,undefined)

// Sidebar side + glass edge follow the sessions zone.
const R=(left,width)=>({left,width,right:left+width,top:0,height:900})
ctx.syncSidebarSide(R(0,60),R(60,240))
assert.equal(ctx.$railSide.get(),'left');assert.equal(ctx.document.documentElement.dataset.naclipSidebarSide,'left')
assert.equal(ctx.document.documentElement.style._props['--naclip-glass-edge'],'300px')
ctx.syncSidebarSide(R(1838,60),R(1598,240))
assert.equal(ctx.$railSide.get(),'right');assert.equal(ctx.document.documentElement.dataset.naclipSidebarSide,'right')
assert.equal(ctx.document.documentElement.style._props['--naclip-glass-edge'],'300px')
ctx.syncSidebarSide(R(1838,60),null)
assert.equal(ctx.document.documentElement.dataset.naclipSidebarSide,undefined)

console.log('PASS: version manifest in sync, strict manifest parsing, fixed rail/dock tracks, seam locking across flips and hidden zones, titlebar-safe seams, and glass/rail side tracking.')
