import {createPortal} from 'react-dom'
import React, {useSyncExternalStore,createContext,useContext,useEffect,useRef,useState} from 'react'
import {contextKey,sessionRows,saveCurrent,applySessionAction,snapshot} from './session-state.mjs'
export {sessionRows,sessionName} from './session-state.mjs'
import {Plus,Monitor,Plug,MessageCircle,Package,Clock,LayoutDashboard,Settings,Send,ExternalLink,Zap,Mail,Hash,Sun,Moon,Bot,Users,Search,Terminal,FolderOpen,Bookmark,Compass,Briefcase,Palette} from 'lucide-react'
import {providers} from './hermes-catalog.mjs'
export const IS_PREVIEW=true
export const icons={Plus,Monitor,Plug,MessageCircle,Package,Clock,LayoutDashboard,Settings,Send,ExternalLink,Zap,Mail,Hash,Sun,Moon,Bot,Users,Search,Terminal,FolderOpen,Bookmark,Compass,Briefcase,Palette}
export const profileColor=()=>null
export const cn=(...v)=>v.filter(Boolean).join(' ')
export function atom(initial){let value=initial;const listeners=new Set();return {get:()=>value,set:v=>{value=v;listeners.forEach(f=>f())},subscribe:f=>{listeners.add(f);return()=>listeners.delete(f)}}}
export const useValue=a=>useSyncExternalStore(a.subscribe,a.get,a.get)
// Fixtures are sample instances, not an inventory of the user's credentials or models.
export const instances=[{id:'local',name:'Local workspace',detail:'On this Mac',defaultProvider:'local'}, {id:'openai',name:'OpenAI workspace',detail:'Cloud provider',defaultProvider:'openai'}, {id:'grok',name:'Grok workspace',detail:'Sample gateway · xAI model',defaultProvider:'xai'}, {id:'anthropic',name:'Anthropic workspace',detail:'Sample gateway · Anthropic model',defaultProvider:'anthropic'}, {id:'gemini',name:'Gemini workspace',detail:'Sample gateway · Google model',defaultProvider:'google'}]
export const catalogs={...Object.fromEntries(providers.map(p=>[p.id,[{id:p.id+'-configured',name:'Configured '+p.name+' model'}]])),local:[{id:'qwen',name:'Qwen · Local LLM'},{id:'local-custom',name:'Custom local model'}],openai:[{id:'openai-configured',name:'Configured OpenAI model'},{id:'openai-custom',name:'Custom OpenAI model'}],xai:[{id:'grok-configured',name:'Configured Grok model'},{id:'grok-custom',name:'Custom Grok model'}],custom:[{id:'custom-endpoint',name:'Custom compatible endpoint'}]}
export const bots=[{id:'vision',name:'Vision',role:'General assistant'},{id:'build',name:'Build',role:'Product and code'},{id:'research',name:'Research',role:'Research and evidence'}]
const storageKey='tandem-preview:chats:v1'
let saved={}
try {
 const data=JSON.parse(localStorage.getItem(storageKey)||'null')
 if(data&&instances.some(i=>i.id===data.instance)&&bots.some(b=>b.id===data.profile)&&typeof data.chatId==='string'&&data.contexts&&data.sessionMeta) saved=data
}catch{}
export const preview=atom({route:'/',draft:'',messages:[],dark:true,computer:true,tab:'chat',toast:'',scenario:'off',themeName:'naclip-custom',tidy:false,instance:'local',profile:'vision',mode:'sessions',chatId:'session-1',contexts:{},sessionMeta:{},sessionView:'active',query:'',panel:null,pendingDelete:null,attachments:[],effort:'medium',language:'en',...saved,...(saved.contexts?.[contextKey(saved)]||{})})
preview.subscribe(()=>{try{localStorage.setItem(storageKey,JSON.stringify(snapshot(preview.get())))}catch{/* Private browsing or storage limits: current state remains usable. */}})
export function update(v){preview.set({...preview.get(),...v})}
export function currentSelection(s=preview.get()){return s.contexts[contextKey(s)]?.selection||{provider:instances.find(i=>i.id===s.instance).defaultProvider,model:catalogs[instances.find(i=>i.id===s.instance).defaultProvider][0].id}}
export function selectModel(selection){const s=preview.get();update({contexts:{...s.contexts,[contextKey(s)]:{...s.contexts[contextKey(s)],draft:s.draft,messages:s.messages,attachments:s.attachments,selection}}})}
export function selectContext(patch){const s=preview.get(),saved=saveCurrent(s),next={...s,...patch};if(next.chatId.startsWith('session-')&&(s.sessionMeta[contextKey(next)]?.archived||s.sessionMeta[contextKey(next)]?.deleted))next.chatId=sessionRows(next)[0]?.id||`session-${crypto.randomUUID()}`;const restored=saved[contextKey(next)]||{};update({...patch,chatId:next.chatId,contexts:saved,draft:restored.draft||'',messages:restored.messages||[],attachments:restored.attachments||[],route:'/',tab:'chat',panel:null});location.hash='/';host.state.profile.set(next.profile);host.state.focusedSessionProfile.set(next.profile);status={...status,profile:next.profile,profile_key:`preview:${next.instance}:${next.profile}`,lease:{holder:'agent'}}}
export function sessionAction(target,action){preview.set(applySessionAction(preview.get(),target,action));if(preview.get().route==='/')location.hash='/';notify(action==='delete'?'Chat deleted from this preview.':action==='archive'?'Chat archived. Find it in Archived.':'Chat restored to Chats.')}
let toastTimer
export function notify(message){update({toast:message});clearTimeout(toastTimer);toastTimer=setTimeout(()=>update({toast:''}),4500)}
const handlers=new Map()
let status={profile:preview.get().profile,profile_key:`preview:${preview.get().instance}:${preview.get().profile}`,supported:true,installed:true,running:false,placement:'docker',lease:{holder:'agent'}}
const emit=(name,p)=>handlers.get(name)?.forEach(f=>f({payload:p}))
export function scenario(name){update({scenario:name});status={...status,supported:name!=='unsupported',installed:name!=='missing',running:name==='running'||name==='stream-error',lease:{holder:'agent'},blocker:name==='unsupported'?'Simulated gateway: Docker desktop support is unavailable.':null,install_command:name==='missing'?'hermes computer-use screen install':null};emit('display.status',status)}
const viewerId='tandem-local-preview-viewer'
async function request(method,params={}){
 if(method==='display.status'){if(preview.get().scenario==='error')throw Error('Simulated gateway connection failure');return {...status,profile:params.profile||preview.get().profile}}
 if(method==='display.start'){scenario('running');return {...status}}
 if(method==='display.observe')return {viewer_id:viewerId,ticket:'simulated-ticket'}
 if(method==='display.thumbnail')return {}
 if(method==='display.lease.acquire'){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(params.viewer_id));status={...status,lease:{holder:'human',viewer_hash:Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('').slice(0,12)}}
  emit('display.lease',{profile_key:status.profile_key,lease:status.lease});return {}
 }
 if(method==='display.lease.release'){status={...status,lease:{holder:'agent'}};emit('display.lease',{profile_key:status.profile_key,lease:status.lease});return {}}
 throw Error('Unsupported simulated RPC: '+method)
}
export const host={state:{profile:atom(preview.get().profile),focusedSessionProfile:atom(preview.get().profile)},profileRoutes:async()=>[],request,
 onEvent:(name,fn)=>{if(!handlers.has(name))handlers.set(name,new Set());handlers.get(name).add(fn);return()=>handlers.get(name).delete(fn)},
 navigate:route=>{location.hash=route;update({route,tab:'chat',panel:null})},newChat:()=>selectContext({chatId:`session-${crypto.randomUUID()}`,mode:'sessions',sessionView:'active'}),openWorkspace:id=>{if(id==='tandem:appearance')host.navigate('/settings?tab=config:appearance&page=theme');else update({computer:true,tab:'computer'});return()=>{}},
 paneVisibility:id=>({get:()=>id==='hermes-bots:pane'&&preview.get().mode==='bots',subscribe:preview.subscribe}),
 revealPane:id=>{if(id==='hermes-bots:pane')update({mode:'bots',panel:window.innerWidth<1120?'roster':null,query:''});else if(id==='sessions')update({mode:'sessions',panel:window.innerWidth<1120?'roster':null,query:''});else {host.navigate('/');update({computer:true,tab:'computer'})}},
 composer:{insertText:async(_,text)=>{update({draft:[preview.get().draft,text].filter(Boolean).join('\n')});return true},focus:()=>document.querySelector('textarea')?.focus()},
 notify:({message})=>notify(message),notifyError:(e,fallback)=>notify(fallback+': '+e.message)
}
export const THEMES_AREA='themes',TITLEBAR_AREAS={right:'titlebar.right'},PALETTE_AREA='palette',TRANSCRIPT_DIRECTIVE_AREA='directives',APPEARANCE_AREAS={extra:'appearance.extra'},SIDEBAR_NAV_PREFS_AREA='sidebar-prefs'
export const useTheme=()=>{const s=useValue(preview);return {themeName:s.themeName,renderedMode:s.dark?'dark':'light',resolvedMode:s.dark?'dark':'light',setMode:mode=>update({dark:mode==='dark'}),setTheme:themeName=>update({themeName})}}
export const requestTheme=themeName=>{update({themeName});return true}
export const resolveSiblingWsUrl=async()=>{if(preview.get().scenario==='stream-error')throw Error('Simulated screen stream unavailable');return 'ws://tandem-simulation.invalid/api/display/ws'}
export const haptic=()=>{}
export function Button({children,variant='default',size,className='',...props}){return <button type="button" className={cn('sdk-button',variant,className)} {...props}>{children}</button>}
export const Input=props=><input {...props} className={cn('sdk-input',props.className)}/>
export const Switch=({checked,onCheckedChange})=><input type="checkbox" role="switch" checked={checked} onChange={e=>onCheckedChange(e.target.checked)}/>
export function Tip({label,children}){const [point,setPoint]=useState(null);const show=e=>{const r=e.currentTarget.getBoundingClientRect();setPoint({left:r.right+8,top:r.top+r.height/2})};return <span onMouseEnter={show} onMouseLeave={()=>setPoint(null)} onFocus={show} onBlur={()=>setPoint(null)}>{children}{point&&createPortal(<span role="tooltip" className="skin-tooltip" style={{left:point.left,top:point.top}}>{label}</span>,document.body)}</span>}
const DialogContext=createContext(null)
export function Dialog({open,onOpenChange,children}){const ref=useRef(null);useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close()},[open]);return <DialogContext.Provider value={onOpenChange}><dialog ref={ref} onCancel={()=>onOpenChange(false)} onClick={e=>{if(e.target===e.currentTarget)onOpenChange(false)}}>{open&&children}</dialog></DialogContext.Provider>}
export const DialogContent=({children})=>{const close=useContext(DialogContext);return <div className="dialog-content"><button aria-label="Close dialog" className="close-dialog" onClick={()=>close(false)}>×</button>{children}</div>}
export const DialogHeader=({children})=><header className="dialog-header">{children}</header>
export const DialogTitle=({children})=><h2>{children}</h2>
export const DialogDescription=({children})=><p>{children}</p>
export const DialogFooter=({children})=><footer className="dialog-footer">{children}</footer>
const MenuContext=createContext(null)
export function ContextMenu({children}){const [point,setPoint]=useState(null);return <MenuContext.Provider value={{point,setPoint}}><span onContextMenu={e=>{e.preventDefault();setPoint({x:e.clientX,y:e.clientY})}}>{children}</span></MenuContext.Provider>}
export const ContextMenuTrigger=({children})=>children
export const ContextMenuContent=({children})=>{const {point,setPoint}=useContext(MenuContext);useEffect(()=>{if(!point)return;const close=()=>setPoint(null);document.addEventListener('click',close);return()=>document.removeEventListener('click',close)},[point]);return point?<div className="context-menu" style={{left:point.x,top:point.y}}>{children}</div>:null}
export const ContextMenuItem=({children,onSelect})=>{const {setPoint}=useContext(MenuContext);return <button onClick={()=>{onSelect();setPoint(null)}}>{children}</button>}

// In-memory RFB 3.8 peer: the unmodified plugin still parses and paints protocol frames.
// Only this reserved simulated URL is intercepted; no gateway credentials are loaded.
const NativeWebSocket=window.WebSocket
function desktopFrame(){
 const c=document.createElement('canvas');c.width=960;c.height=600;const x=c.getContext('2d');
 x.fillStyle='#e8edf4';x.fillRect(0,0,960,600);x.fillStyle='#263142';x.fillRect(0,0,960,32);x.font='13px system-ui';x.fillStyle='#fff';x.fillText(preview.get().profile+' · Simulated Linux desktop',18,21);
 x.fillStyle='#fff';x.fillRect(42,64,876,494);x.fillStyle='#f5f6f8';x.fillRect(42,64,876,44);x.fillStyle='#566073';x.fillText('Browser     localhost / practice-workspace',66,92);
 x.fillStyle='#f0f3f7';x.fillRect(70,127,820,34);x.fillStyle='#677285';x.fillText('naclip://local-preview  ·  No external connection',88,149);
 x.fillStyle='#172033';x.font='bold 30px system-ui';x.fillText('A computer beside your agent.',90,224);
 x.font='17px system-ui';x.fillStyle='#687487';x.fillText('Practice the handoff here before connecting a real screen.',90,264);
 const human=status.lease.holder==='human';x.fillStyle='#3366ff';x.fillRect(90,306,305,48);x.fillStyle='#fff';x.font='bold 16px system-ui';x.fillText(human?'You have the simulated controls':'Vision has the simulated controls',107,337);
 x.fillStyle='#172033';x.font='16px system-ui';x.fillText('This desktop is drawn by the local test harness.',90,403);x.fillStyle='#687487';x.fillText('No host access, browser session, or agent task is running.',90,434);
 const pixels=x.getImageData(0,0,960,600).data,b=new Uint8Array(16+pixels.length),v=new DataView(b.buffer);b[0]=0;v.setUint16(2,1);v.setUint16(8,960);v.setUint16(10,600);v.setInt32(12,0);
 for(let i=0;i<pixels.length;i+=4){b[16+i]=pixels[i+2];b[17+i]=pixels[i+1];b[18+i]=pixels[i]}
 return b
}
class SimulationSocket{
 constructor(){this.readyState=1;this.phase=0;this.lastLease='';this.closed=false;setTimeout(()=>this.deliver(new TextEncoder().encode('RFB 003.008\n')),20)}
 deliver(b){if(!this.closed)this.onmessage?.({data:b.buffer})}
 send(b){if(this.closed)return;const bytes=new Uint8Array(b);
  if(this.phase===0){this.phase=1;setTimeout(()=>this.deliver(new Uint8Array([1,1])),5);return}
  if(this.phase===1){this.phase=2;setTimeout(()=>this.deliver(new Uint8Array(4)),5);return}
  if(this.phase===2){this.phase=3;const init=new Uint8Array(24);const v=new DataView(init.buffer);v.setUint16(0,960);v.setUint16(2,600);setTimeout(()=>this.deliver(init),5);return}
  if(bytes[0]===3){const lease=status.lease.holder;if(!bytes[1]||lease!==this.lastLease){this.lastLease=lease;setTimeout(()=>this.deliver(desktopFrame()),20)}else setTimeout(()=>this.deliver(new Uint8Array(4)),400)}
  if(bytes[0]===5&&bytes[1]===1)notify('Simulated click received. This screen has no live application.')
 }
 close(){this.closed=true;this.readyState=3;this.onclose?.({code:1000})}
}
window.WebSocket=class extends NativeWebSocket {constructor(url,...rest){if(String(url).startsWith('ws://tandem-simulation.invalid/'))return new SimulationSocket();super(url,...rest)}}
