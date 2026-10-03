import React,{useEffect,useRef,useState} from 'react'
import {useValue} from './sdk.jsx'
import {localWorkspace,localCall,chooseLocalFolder,disconnectLocalFolder} from './local/workspace-client.js'

function WorkspaceAccess(){
 const state=useValue(localWorkspace)
 return <><p className="panel-subtitle">Local Mac workspace</p>{state.root?<><p className="local-workspace-path">{state.root}</p><div className="local-workspace-actions"><button className="sdk-button outline" disabled={state.busy} onClick={chooseLocalFolder}>{state.busy?'Folder chooser open…':'Change folder'}</button><button className="sdk-button outline" onClick={()=>disconnectLocalFolder().catch(e=>localWorkspace.set({...state,error:e.message}))}>Disconnect access</button></div></>:<><p>Choose a folder in the macOS system dialog to allow listing and reading its files. File contents stay on this Mac and are never sent to your agent.</p><button className="sdk-button outline" disabled={state.busy} onClick={chooseLocalFolder}>{state.busy?'Folder chooser open…':'Choose workspace folder…'}</button></>}{state.error&&<p role="alert">{state.error}</p>}</>
}
export function FilesPanel(){
 const {root}=useValue(localWorkspace),[relative,setRelative]=useState(''),[entries,setEntries]=useState([]),[selected,setSelected]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[refresh,setRefresh]=useState(0),[truncated,setTruncated]=useState(false)
 useEffect(()=>{setRelative('');setSelected(null);setEntries([])},[root])
 useEffect(()=>{if(!root)return;let active=true;setLoading(true);setError('');setSelected(null);localCall('list',{path:relative}).then(result=>{if(active){setEntries(result.entries);setTruncated(result.truncated)}}).catch(e=>{if(active){setError(e.message);setEntries([])}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[root,relative,refresh])
 const open=async entry=>{const pathname=[relative,entry.name].filter(Boolean).join('/');if(entry.kind==='directory'){setRelative(pathname);return}setError('');try{const result=await localCall('read',{path:pathname});if(root===localWorkspace.get().root)setSelected(result)}catch(e){setError(e.message)}}
 return <><WorkspaceAccess/>{root&&<><div className="local-workspace-actions"><button className="sdk-button outline" disabled={!relative} onClick={()=>setRelative(relative.split('/').slice(0,-1).join('/'))}>Up a folder</button><button className="sdk-button outline" onClick={()=>setRefresh(v=>v+1)}>Refresh files</button><span className="local-workspace-path">{relative||'Workspace root'}</span></div>{loading?<p role="status">Reading folder…</p>:<div className="local-file-list" aria-label="Workspace files">{entries.map(entry=><button key={entry.name} onClick={()=>open(entry)}><span aria-hidden="true">{entry.kind==='directory'?'▸':'·'}</span><span>{entry.name}</span><small>{entry.kind}</small></button>)}{!entries.length&&<p>No visible files in this folder.</p>}</div>}{truncated&&<p>Showing the first 250 entries. Hidden files and dependency folders are omitted.</p>}{selected&&<section aria-label="File preview"><h3 className="local-workspace-path">{selected.path}</h3><pre className="local-file-preview">{selected.text}</pre></section>}</>}{error&&<p role="alert">{error}</p>}</>
}
function LiveTerminal({onStop}){
 const root=useValue(localWorkspace).root,ref=useRef(null),[error,setError]=useState(''),[ended,setEnded]=useState(false)
 useEffect(()=>{
  let alive=true,timer,observer,term,fit,subscription,terminalId,queue=Promise.resolve()
  const fail=e=>{if(alive)setError(e.message)}
  async function start(){
   const [{Terminal:XTerm},{FitAddon}]=await Promise.all([import('@xterm/xterm'),import('@xterm/addon-fit'),import('@xterm/xterm/css/xterm.css')])
   if(!alive)return
   term=new XTerm({cursorBlink:true,scrollback:3000,fontSize:13,theme:{background:'#101820',foreground:'#E5F0F4',cursor:'#76C9D2'}});fit=new FitAddon();term.loadAddon(fit);term.open(ref.current);fit.fit()
   const started=await localCall('terminal/start',{allow:true,cols:term.cols,rows:term.rows})
   terminalId=started.terminalId
   if(!alive){await localCall('terminal/stop',{terminalId});return}
   subscription=term.onData(text=>{queue=queue.then(()=>localCall('terminal/input',{text,terminalId})).catch(fail)})
   observer=new ResizeObserver(()=>{fit.fit();localCall('terminal/resize',{cols:term.cols,rows:term.rows,terminalId}).catch(fail)});observer.observe(ref.current)
   const poll=async()=>{try{const result=await localCall('terminal/poll',{terminalId});if(!alive)return;if(result.output)term.write(result.output);if(result.ended){setEnded(true);return}}catch(e){fail(e);return}if(alive)timer=setTimeout(poll,150)}
   void poll();term.focus()
  }
  start().catch(fail)
  return()=>{alive=false;clearTimeout(timer);observer?.disconnect();subscription?.dispose();term?.dispose();if(terminalId)void localCall('terminal/stop',{terminalId},true).catch(()=>{})}
 },[root])
 return <><p className="native-surface-note">Real local shell · Runs as your Mac account.</p><div className="local-terminal" ref={ref} aria-label="Interactive local terminal"/>{error&&<p role="alert">{error}</p>}{ended&&<p role="status">Shell exited. Stop and enable a new terminal to continue.</p>}<button className="sdk-button outline" onClick={onStop}>Stop terminal</button></>
}
export function TerminalPanel(){
 const {root}=useValue(localWorkspace),[enabled,setEnabled]=useState(false)
 useEffect(()=>{setEnabled(false)},[root])
 return <><WorkspaceAccess/>{root&&(enabled?<LiveTerminal onStop={()=>setEnabled(false)}/>:<div className="local-terminal-permission"><p>Allow an interactive terminal to start in this folder. Commands run locally with your Mac account’s permissions and can access files outside this folder. Closing this panel stops its shell.</p><button className="sdk-button outline" onClick={()=>setEnabled(true)}>Enable local terminal</button></div>)}</>
}
