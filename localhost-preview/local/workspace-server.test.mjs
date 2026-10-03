import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createServer,request as httpRequest} from 'node:http'
import {mkdtemp,mkdir,writeFile,symlink,rm,realpath} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {workspaceCompanion} from './workspace-server.mjs'

test('local grants, origin checks, traversal denial, real interactive shell and revocation',async()=>{
 const temp=await realpath(await mkdtemp(path.join(os.tmpdir(),'naclip-test-'))),root=path.join(temp,'workspace')
 await mkdir(root);await mkdir(path.join(root,'nested'));await writeFile(path.join(root,'hello.txt'),'Local file proof.');await writeFile(path.join(temp,'outside.txt'),'Outside');await symlink(path.join(temp,'outside.txt'),path.join(root,'escaped-link'))
 let origin,companion,terminalId,cancel=false,pendingPick,pickStarted
 const server=createServer((req,res)=>companion.middleware(req,res,()=>{res.statusCode=404;res.end()}))
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port
 companion=workspaceCompanion({origin,picker:async()=>{if(pendingPick){pickStarted();return pendingPick}return cancel?null:root}})
 const request=(action,input,token,headers={})=>new Promise((resolve,reject)=>{
  const body=input===undefined?undefined:JSON.stringify(action.startsWith('terminal/')&&action!=='terminal/start'?{terminalId,...input}:input)
  const req=httpRequest(origin+'/api/naclip-local/'+action,{method:input===undefined?'GET':'POST',headers:{Origin:origin,...(body===undefined?{}:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}),...(token?{'X-NaCLip-Session':token}:{}),...headers}},response=>{let data='';response.on('data',chunk=>data+=chunk);response.on('end',()=>resolve({status:response.statusCode,...JSON.parse(data)}))})
  req.on('error',reject);req.end(body)
 })
 try{
  assert.equal((await request('session',undefined,null,{Origin:'https://example.com'})).status,403)
  assert.equal((await request('session',undefined,null,{Host:'evil.invalid'})).status,403)
  const {token}=await request('session');assert(token)
  assert.equal((await request('list',{},token)).status,403)
  assert.equal((await request('terminal/start',{allow:true},token)).status,403)
  assert.equal((await request('choose',{},'wrong')).status,401)
  assert.equal((await request('choose',{},token)).root,root)
  const second=await request('session');assert.equal((await request('list',{},second.token)).status,403)
  const list=await request('list',{},token);assert(list.entries.some(e=>e.name==='hello.txt'))
  assert.equal((await request('read',{path:'hello.txt'},token)).text,'Local file proof.')
  for(const outside of ['../outside.txt',path.join(temp,'outside.txt'),'escaped-link'])assert.equal((await request('read',{path:outside},token)).status,400)
  cancel=true;assert.equal((await request('choose',{},token)).root,root)
  assert.equal((await request('terminal/start',{},token)).status,400)
  const start=await request('terminal/start',{allow:true,cols:80,rows:24},token);assert.equal(start.status,200,start.error);terminalId=start.terminalId
  let output=''
  const expectOutput=async(pattern)=>{for(let i=0;i<50;i++){const response=await request('terminal/poll',{},token);output+=response.output||'';if(pattern.test(output))return;await new Promise(r=>setTimeout(r,40))}assert.match(output,pattern)}
  await request('terminal/input',{text:"printf 'REAL_PTY_%s\\n' 'READY'\r"},token)
  await expectOutput(/REAL_PTY_READY/)
  await request('terminal/input',{text:"cd nested; printf 'CURRENT_DIRECTORY=%s\\n' \"$PWD\"\r"},token)
  await expectOutput(new RegExp('CURRENT_DIRECTORY='+root.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/nested'))
  await request('terminal/input',{text:'sleep 30\r'},token)
  await new Promise(r=>setTimeout(r,60));await request('terminal/input',{text:'\x03'},token)
  await request('terminal/input',{text:"printf 'INTERRUPT_%s\\n' 'WORKED'\r"},token);await expectOutput(/INTERRUPT_WORKED/)
  assert.equal((await request('terminal/resize',{cols:50,rows:10},token)).status,200)
  const oldTerminalId=terminalId
  const restarted=await request('terminal/start',{allow:true},token);terminalId=restarted.terminalId
  await request('terminal/stop',{terminalId:oldTerminalId},token)
  assert.equal((await request('terminal/poll',{},token)).status,200)
  assert.equal((await request('terminal/input',{terminalId:oldTerminalId,text:'echo stale'},token)).status,400)
  await request('disconnect',{},token)
  assert.equal((await request('terminal/poll',{},token)).status,403)
  assert.equal((await request('read',{path:'hello.txt'},token)).status,403)
  let resolvePick
  pendingPick=new Promise(resolve=>{resolvePick=resolve})
  const started=new Promise(resolve=>{pickStarted=resolve})
  const choosing=request('choose',{},token)
  await started;await request('disconnect',{},token);resolvePick(root)
  assert.equal((await choosing).status,400)
  assert.equal((await request('list',{},token)).status,403)
 }finally{companion.dispose();await new Promise(resolve=>server.close(resolve));await rm(temp,{recursive:true,force:true})}
})
