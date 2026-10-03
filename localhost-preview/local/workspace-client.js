import {atom} from '../sdk.jsx'
export const localWorkspace=atom({root:null,available:null,busy:false,error:''})
let token,connecting
async function connect(){
 if(!connecting)connecting=fetch('/api/naclip-local/session',{cache:'no-store'}).then(async response=>{
  if(!response.headers.get('content-type')?.includes('application/json'))throw Error('Local workspace access requires the npm run dev server on this Mac.');const result=await response.json();if(!response.ok)throw Error(result.error||'Local companion is unavailable.')
  token=result.token;localWorkspace.set({...localWorkspace.get(),available:result.available});return result
 }).catch(error=>{connecting=null;throw error})
 return connecting
}
export async function localCall(action,input={},keepalive=false){
 await connect()
 const response=await fetch('/api/naclip-local/'+action,{method:'POST',headers:{'Content-Type':'application/json','X-NaCLip-Session':token},body:JSON.stringify(input),keepalive})
 const result=await response.json()
 if(!response.ok){if(response.status===401){token=null;connecting=null;localWorkspace.set({root:null,available:null,busy:false,error:'Local access expired. Choose your folder again.'})}throw Error(result.error||'Local workspace action failed.')}
 return result
}
export async function chooseLocalFolder(){
 localWorkspace.set({...localWorkspace.get(),busy:true,error:''})
 try{await connect();if(!localWorkspace.get().available)throw Error('The local native folder chooser currently requires macOS. Use native Hermes on other platforms.')
  const result=await localCall('choose');localWorkspace.set({...localWorkspace.get(),root:result.root,busy:false})
 }catch(error){localWorkspace.set({...localWorkspace.get(),busy:false,error:error.name==='AbortError'||error.message==='The operation was aborted'?'':error.message})}
}
export async function disconnectLocalFolder(){await localCall('disconnect');localWorkspace.set({...localWorkspace.get(),root:null,error:''})}
window.addEventListener('beforeunload',()=>{if(token)void localCall('disconnect',{},true).catch(()=>{})})
