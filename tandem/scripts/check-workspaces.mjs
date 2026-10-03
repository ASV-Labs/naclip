import {readFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
import vm from 'node:vm'
const source=await readFile(new URL('../../plugin.js',import.meta.url),'utf8')
const code=source.split('// --- workspace-navigation:begin ---')[1].split('// --- workspace-navigation:end ---')[0]
function setup(host){
 const context={host,ID:'tandem',closeComputerWorkspace:null,
  $computerWorkspaceOpen:{value:false,set(value){this.value=value}},
  jsx:(type,props)=>({type,props}),ComputerView:()=>{},
  element:(type,props,children)=>({type,props,children}),
  workspaceHeader:(title,label,close)=>({title,label,close})}
 vm.createContext(context);vm.runInContext(code,context);return context
}
// An existing side pane must not absorb the action while a full-page route covers it.
let calls=[],closed=0,options
const modern=setup({openWorkspace:(id,opts)=>{calls.push(id);options=opts;return()=>{closed++;opts.onClose()}},revealPane:()=>assert.fail('Side-pane reveal would hide the requested view')})
modern.openComputer()
assert.deepEqual(calls,['tandem:computer-main'])
assert.equal(options.minWidth,'22rem')
assert.equal(modern.$computerWorkspaceOpen.value,true)
assert.equal(options.render().children[0].label,'Close computer')
options.render().children[0].close()
assert.equal(closed,1);assert.equal(modern.closeComputerWorkspace,null)
assert.equal(modern.$computerWorkspaceOpen.value,false)
modern.openComputer();assert.equal(calls[1],calls[0]) // Stable ID lets Hermes re-front the same tab.
let revealed,notice
setup({revealPane:id=>{revealed=id},notify:value=>{notice=value.message}}).openComputer()
assert.equal(revealed,'tandem:computer');assert.match(notice,/return to your chat/)
setup({notify:value=>{notice=value.message}}).openComputer()
assert.match(notice,/Update Hermes Desktop/)
console.log('PASS: computer opens a main workspace rather than silently revealing a covered side pane; close disposal, stable tab ID and explicit older-SDK fallback.')
