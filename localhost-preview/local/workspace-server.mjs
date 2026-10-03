import {randomBytes,createHash} from 'node:crypto'
import {execFile} from 'node:child_process'
import * as pty from 'node-pty'
import {prepareTerminal} from './prepare-terminal.mjs'
import {promisify} from 'node:util'
import {realpath,readdir,stat,readFile,writeFile,mkdir,access} from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {fileURLToPath} from 'node:url'
const exec=promisify(execFile)
const swiftSource=fileURLToPath(new URL('./choose-folder.swift',import.meta.url))
let compiling
export async function macFolderPicker({signal}={}){
 if(process.platform!=='darwin')throw Error('The native workspace picker currently requires macOS.')
 if(!compiling)compiling=(async()=>{
  const source=await readFile(swiftSource)
  const dir=path.join(os.tmpdir(),'naclip-local-'+process.getuid())
  await mkdir(dir,{recursive:true,mode:0o700})
  const bundle=path.join(dir,'NaCLip Workspace Access-'+createHash('sha256').update(source).digest('hex').slice(0,16)+'.app')
  const contents=path.join(bundle,'Contents'),macos=path.join(contents,'MacOS'),binary=path.join(macos,'NaCLipWorkspaceAccess')
  await mkdir(macos,{recursive:true,mode:0o700})
  await writeFile(path.join(contents,'Info.plist'),`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleExecutable</key><string>NaCLipWorkspaceAccess</string><key>CFBundleIdentifier</key><string>com.asvlabs.naclip.workspace-access</string><key>CFBundleName</key><string>NaCLip Workspace Access</string><key>CFBundlePackageType</key><string>APPL</string><key>NSHighResolutionCapable</key><true/></dict></plist>`)
  try{await access(binary)}catch{await exec('/usr/bin/xcrun',['swiftc',swiftSource,'-o',binary],{timeout:120000})}
  return binary
 })().catch(error=>{compiling=null;throw error})
 const binary=await compiling
 const result=await exec(binary,[],{timeout:300000,maxBuffer:16384,signal})
 return result.stdout.trim()||null
}
export async function scopedPath(root,relative=''){
 if(typeof relative!=='string'||relative.includes('\0')||path.isAbsolute(relative))throw Error('Invalid workspace path.')
 const resolved=await realpath(path.resolve(root,relative))
 const rel=path.relative(root,resolved)
 if(rel==='..'||rel.startsWith('..'+path.sep)||path.isAbsolute(rel))throw Error('Path is outside the selected workspace.')
 return resolved
}
export function workspaceCompanion({origin='http://127.0.0.1:14327',picker=macFolderPicker,platform=process.platform}={}){
 const sessions=new Map()
 const stopTerminal=session=>{const terminal=session.terminal;session.terminal=null;if(terminal){terminal.data.dispose();terminal.exit.dispose();try{terminal.process.kill()}catch{}}}
 const expiry=setInterval(()=>{for(const [token,session] of sessions){if(session.terminal&&Date.now()-session.used>30000)stopTerminal(session);if(Date.now()-session.used>1800000){session.chooser?.abort();stopTerminal(session);sessions.delete(token)}}},5000)
 expiry.unref()
 const size=(value,low,high)=>Number.isInteger(value)?Math.max(low,Math.min(high,value)):low
 const reply=(res,status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(data))}
 const middleware=async(req,res,next)=>{
  if(!req.url?.startsWith('/api/naclip-local/'))return next()
  const sameOrigin=req.headers.origin===origin||(!req.headers.origin&&req.headers.referer?.startsWith(origin+'/'))
  if(req.headers.host!==new URL(origin).host||!sameOrigin||['cross-site','same-site'].includes(req.headers['sec-fetch-site']))return reply(res,403,{error:'Local workspace access requires the NaCLip localhost page.'})
  const endpoint=req.url.slice('/api/naclip-local/'.length)
  if(endpoint==='session'&&req.method==='GET'){
   const token=randomBytes(32).toString('hex')
   if(sessions.size>=64)return reply(res,429,{error:'Too many local sessions. Restart the preview.'})
   sessions.set(token,{root:null,picking:false,generation:0,terminal:null,chooser:null,used:Date.now()})
   return reply(res,200,{token,available:platform==='darwin',platform})
  }
  const session=sessions.get(req.headers['x-naclip-session'])
  if(!session)return reply(res,401,{error:'Reconnect the local workspace session.'})
  session.used=Date.now()
  if(req.method!=='POST'||req.headers['content-type']!=='application/json')return reply(res,405,{error:'A JSON POST is required.'})
  try{
   let body=''
   for await(const chunk of req){body+=chunk;if(body.length>16384)throw Error('Request is too large.')}
   const input=JSON.parse(body||'{}')
   if(endpoint==='choose'){
    if(session.picking)throw Error('A folder chooser is already open.')
    session.picking=true
    session.chooser=new AbortController()
    const generation=session.generation
    try{const picked=await picker({signal:session.chooser.signal});if(!picked)return reply(res,200,{cancelled:true,root:session.root})
     const root=await realpath(picked);if(!(await stat(root)).isDirectory())throw Error('Choose a folder.')
     if(session.generation!==generation)throw Error('Folder selection was disconnected.')
     stopTerminal(session);session.generation++;session.root=root;return reply(res,200,{root})
    }finally{session.picking=false;session.chooser=null}
   }
   if(endpoint==='disconnect'){session.chooser?.abort();stopTerminal(session);session.generation++;session.root=null;return reply(res,200,{root:null})}
   if(endpoint==='terminal/stop'){if(session.terminal?.id===input.terminalId)stopTerminal(session);return reply(res,200,{stopped:true})}
   if(!session.root)return reply(res,403,{error:'Choose a folder and allow access first.'})
   if(endpoint==='terminal/start'){
    if(input.allow!==true)throw Error('Allow local terminal access first.')
    const root=session.root,generation=session.generation
    await prepareTerminal()
    if(session.root!==root||session.generation!==generation)throw Error('Workspace access changed. Enable the terminal again.')
    stopTerminal(session)
    const env=Object.fromEntries(['PATH','HOME','USER','LOGNAME','LANG','LC_ALL','TMPDIR'].filter(key=>process.env[key]).map(key=>[key,process.env[key]]))
    env.TERM='xterm-256color'
    const shell=platform==='darwin'?'/bin/zsh':'/bin/bash'
    const shellProcess=pty.spawn(shell,platform==='darwin'?['-f']:['--noprofile','--norc'],{name:'xterm-256color',cwd:root,env,cols:size(input.cols,20,240),rows:size(input.rows,5,100)})
    const terminal={id:randomBytes(16).toString('hex'),process:shellProcess,output:'',ended:false,data:null,exit:null}
    session.terminal=terminal
    terminal.data=shellProcess.onData(data=>{terminal.output+=data;if(terminal.output.length>1048576){terminal.output=terminal.output.slice(-524288);terminal.output+='\r\n[Output limit reached; shell stopped.]\r\n';shellProcess.kill()}})
    terminal.exit=shellProcess.onExit(({exitCode})=>{terminal.ended=true;terminal.output+='\r\n[Shell exited: '+exitCode+']\r\n'})
    return reply(res,200,{root:session.root,terminalId:terminal.id})
   }
   if(endpoint.startsWith('terminal/')){
    const terminal=session.terminal
    if(!terminal||terminal.id!==input.terminalId)throw Error('Enable local terminal access first.')
    if(endpoint==='terminal/poll'){const output=terminal.output;terminal.output='';return reply(res,200,{output,ended:terminal.ended})}
    if(endpoint==='terminal/input'){
     if(typeof input.text!=='string'||input.text.length>8192)throw Error('Terminal input is too large.')
     if(terminal.ended)throw Error('The shell has exited.')
     terminal.process.write(input.text);return reply(res,200,{ok:true})
    }
    if(endpoint==='terminal/resize'){terminal.process.resize(size(input.cols,20,240),size(input.rows,5,100));return reply(res,200,{ok:true})}
    throw Error('Unknown terminal action.')
   }
   const target=await scopedPath(session.root,input.path||'')
   if(endpoint==='list'){
    const entries=await readdir(target,{withFileTypes:true})
    const visible=entries.filter(e=>!e.name.startsWith('.')&&!['node_modules','venv','__pycache__'].includes(e.name)).sort((a,b)=>Number(b.isDirectory())-Number(a.isDirectory())||a.name.localeCompare(b.name))
    return reply(res,200,{root:session.root,path:input.path||'',entries:visible.slice(0,250).map(e=>({name:e.name,kind:e.isDirectory()?'directory':e.isSymbolicLink()?'link':'file'})),truncated:visible.length>250})
   }
   if(endpoint==='read'){
    const info=await stat(target);if(!info.isFile()||info.size>262144)throw Error('Text preview supports files up to 256 KB.')
    const buffer=await readFile(target);if(buffer.includes(0))throw Error('This is a binary file; text preview is unavailable.')
    return reply(res,200,{path:input.path,text:buffer.toString('utf8')})
   }
   return reply(res,404,{error:'Unknown local workspace action.'})
  }catch(error){reply(res,400,{error:error.message})}
 }
 const dispose=()=>{clearInterval(expiry);for(const session of sessions.values()){session.chooser?.abort();stopTerminal(session)}sessions.clear()}
 return {middleware,dispose}
}
export default function localWorkspacePlugin(){
 let companion
 return {name:'naclip-local-workspace',configureServer(server){companion=workspaceCompanion();server.middlewares.use(companion.middleware);server.httpServer?.on('close',()=>companion.dispose())}}
}
