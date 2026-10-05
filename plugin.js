// NaCLip — a customizable skin for Hermes Desktop.
// https://github.com/ASV-Labs/naclip  ·  MIT
//
// Disk plugin: plain ESM, loaded uncompiled. Only `@hermes/plugin-sdk`, `react`
// and `react/jsx-runtime` resolve, so the RFB viewer lives in this file too.

import * as sdk from '@hermes/plugin-sdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { jsx, jsxs, Fragment } from 'react/jsx-runtime'

const { host, cn, icons, useValue, atom, Button, Input } = sdk

const ID = 'tandem'
const VERSION = '0.4.2'

// ─────────────────────────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────────────────────────

const SIGNAL = '#3366FF'

const TANDEM_THEME = {
  name: 'tandem',
  label: 'NaCLip · Graphite',
  description: 'Graphite surfaces, signal-blue voice. Pairs with the NaCLip rail, dock and computer pane.',
  colors: {
    background: '#F6F7F9',
    foreground: '#15171C',
    card: '#FFFFFF',
    cardForeground: '#15171C',
    muted: '#EEF0F3',
    mutedForeground: '#5E6573',
    popover: '#FFFFFF',
    popoverForeground: '#15171C',
    primary: '#2F5BEA',
    primaryForeground: '#FFFFFF',
    secondary: '#EEF0F3',
    secondaryForeground: '#15171C',
    accent: '#E7ECFD',
    accentForeground: '#1B3FB8',
    border: '#E1E4EA',
    input: '#E1E4EA',
    ring: '#2F5BEA',
    midground: '#2F5BEA',
    composerRing: '#2F5BEA',
    destructive: '#D92D20',
    destructiveForeground: '#FFFFFF',
    sidebarBackground: '#EEF0F3',
    sidebarBorder: '#E1E4EA',
    userBubble: '#2F5BEA',
    userBubbleBorder: '#2F5BEA'
  },
  darkColors: {
    background: '#16181D',
    foreground: '#E9EBF0',
    card: '#1E2128',
    cardForeground: '#E9EBF0',
    muted: '#22252D',
    mutedForeground: '#8C92A3',
    popover: '#1E2128',
    popoverForeground: '#E9EBF0',
    primary: SIGNAL,
    primaryForeground: '#FFFFFF',
    secondary: '#262A33',
    secondaryForeground: '#E9EBF0',
    accent: '#1F2A4D',
    accentForeground: '#C9D6FF',
    border: '#2B2F38',
    input: '#2B2F38',
    ring: SIGNAL,
    midground: SIGNAL,
    composerRing: SIGNAL,
    destructive: '#F04438',
    destructiveForeground: '#FFFFFF',
    sidebarBackground: '#111317',
    sidebarBorder: '#23262E',
    userBubble: SIGNAL,
    userBubbleBorder: SIGNAL
  },
  typography: {
    fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif",
    fontMono: "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace"
  },
  // Cosmetic only. These selectors target core markup and may stop matching
  // after a Hermes update; nothing breaks when they do, the shape just reverts.
  customCSS: `
[data-slot='aui_user-message-root'] .composer-human-message {
  border-radius: 20px;
  border-color: transparent;
  background: var(--dt-primary-solid, var(--ui-accent));
  color: var(--dt-primary-solid-foreground, #fff);
}
[data-slot='aui_user-message-root'] .composer-human-message :where(p, li, span, strong, em, a) { color: inherit; }
[data-slot='composer-root'] { border-radius: 24px; }
`
}

// --- appearance:begin ---
export const SKIN_NAME = 'NaCLip'
export const PALETTE_PRESETS = [
 {id:'graphite',name:'Graphite',light:{background:'#F6F7F9',sidebar:'#EEF0F3',surface:'#FFFFFF',text:'#15171C',secondary:'#5E6573',border:'#E1E4EA',accent:'#2F5BEA'},dark:{background:'#16181D',sidebar:'#111317',surface:'#1E2128',text:'#E9EBF0',secondary:'#ADB3C1',border:'#2B2F38',accent:'#3366FF'}},
 {id:'ocean',name:'Ocean',light:{background:'#F1F7F8',sidebar:'#E3EFF0',surface:'#FFFFFF',text:'#142E36',secondary:'#4D6870',border:'#CBDDE0',accent:'#087E8B'},dark:{background:'#10232B',sidebar:'#0B1B22',surface:'#19313B',text:'#E4F3F5',secondary:'#9FC2CB',border:'#304D58',accent:'#39B4C1'}},
 {id:'paper',name:'Paper',light:{background:'#F4F3F0',sidebar:'#E8E7E2',surface:'#FFFFFF',text:'#242A28',secondary:'#5F6661',border:'#D7D9D3',accent:'#3F6E52'},dark:{background:'#202522',sidebar:'#171C19',surface:'#2A322D',text:'#EDF1EB',secondary:'#B5C3B8',border:'#3D4B41',accent:'#94C3A4'}}
]
export const WIDGET_ICONS = ['Plus','Bot','Users','Monitor','Plug','MessageCircle','Package','Clock','LayoutDashboard','Settings','Send','ExternalLink','Zap','Mail','Hash','Sun','Moon','Search','Terminal','FolderOpen','Bookmark','Compass','Briefcase']
export const WIDGET_STYLES = [{id:'signal',name:'Signal',description:'Colored tiles'}, {id:'outline',name:'Outline',description:'Quiet line icons'}, {id:'mono',name:'Mono',description:'One accent color'}]
export const DEFAULT_WIDGETS = [
 {id:'new',label:'New chat',icon:'Plus',color:'#4264E8',visible:true},
 {id:'bots',label:'Bots',icon:'Bot',color:'#159DC6',visible:true},
 {id:'profiles',label:'Instances and profiles',icon:'Users',color:'#34C989',visible:true},
 {id:'computer',label:'Agent’s computer',icon:'Monitor',color:'#D78925',visible:true},
 {id:'capabilities',label:'Capabilities',icon:'Plug',color:'#762CE0',visible:true},
 {id:'messaging',label:'Messaging',icon:'MessageCircle',color:'#2876CC',visible:true},
 {id:'artifacts',label:'Artifacts',icon:'Package',color:'#D33274',visible:true},
 {id:'cron',label:'Automations',icon:'Clock',color:'#CD4936',visible:true},
 {id:'command',label:'Command center',icon:'LayoutDashboard',color:'#28B6AE',visible:true},
 {id:'settings',label:'Settings',icon:'Settings',color:'#BDA23D',visible:true}
]
const PACK_FORMAT='naclip/appearance@1'
export const DEFAULT_APPEARANCE = {format:PACK_FORMAT,name:'Graphite',palette:{light:PALETTE_PRESETS[0].light,dark:PALETTE_PRESETS[0].dark},widgetStyle:'signal',widgetShape:'rounded',widgets:DEFAULT_WIDGETS}
const ALLOWED_ROUTES=['/','/profiles','/agents','/capabilities','/capabilities?tab=skills','/capabilities?tab=toolsets','/capabilities?tab=connectors','/capabilities?tab=plugins','/messaging','/artifacts','/cron','/command-center','/github','/kanban','/settings','/settings?tab=config:appearance','/settings?tab=config:model','/settings?tab=config:chat','/settings?tab=config:workspace','/settings?tab=config:safety','/settings?tab=config:browser','/settings?tab=vault','/settings?tab=config:memory','/settings?tab=config:voice','/settings?tab=config:advanced','/settings?tab=notifications','/settings?tab=billing','/settings?tab=providers','/settings?tab=gateway','/settings?tab=connections','/settings?tab=keybinds','/settings?tab=keys','/settings?tab=sessions','/settings?tab=about','/session-import','/webhooks','/starmap']
export function contrastRatio(a,b) {
 const lum=c=>{const parts=c.slice(1).match(/../g).map(h=>parseInt(h,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return parts[0]*.2126+parts[1]*.7152+parts[2]*.0722}
 const aa=lum(a),bb=lum(b);return (Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05)
}
export function readableInk(hex) {return contrastRatio(hex,'#FFFFFF')>=contrastRatio(hex,'#15171C')?'#FFFFFF':'#15171C'}
export function parseAppearance(input) {
 if(typeof input==='string'&&input.length>50000)throw new Error('Appearance packs must be smaller than 50 KB.')
 const data=typeof input==='string'?JSON.parse(input):input
 const object=(v,allowed,where)=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error(`${where} must be an object.`);for(const k of Object.keys(v))if(!allowed.includes(k))throw new Error(`Unknown ${where} field: ${k}`)}
 const text=(v,n,where)=>{if(typeof v!=='string'||!v.trim()||v.length>n)throw new Error(`${where} must be 1–${n} characters.`);return v.trim()}
 const color=(v,where)=>{if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))throw new Error(`${where} must be a six-digit hex color.`);return v.toUpperCase()}
 object(data,['format','name','palette','widgetStyle','widgetShape','widgets'],'pack')
 if(data.format!==PACK_FORMAT)throw new Error('Unsupported appearance pack format.')
 const name=text(data.name,48,'Name');object(data.palette,['light','dark'],'palette')
 const palette={}
 for(const mode of ['light','dark']) {
  const source=data.palette[mode],keys=['background','sidebar','surface','text','secondary','border','accent'];object(source,keys,mode)
  palette[mode]=Object.fromEntries(keys.map(k=>[k,color(source[k],`${mode}.${k}`)]))
  for(const surface of ['background','sidebar','surface']) {
   if(contrastRatio(palette[mode].text,palette[mode][surface])<4.5)throw new Error(`${mode} text needs at least 4.5:1 contrast on ${surface}.`)
   if(contrastRatio(palette[mode].secondary,palette[mode][surface])<4.5)throw new Error(`${mode} secondary text needs at least 4.5:1 contrast on ${surface}.`)
  }
 }
 if(!WIDGET_STYLES.some(s=>s.id===data.widgetStyle))throw new Error('Choose signal, outline or mono widgets.')
 if(!['rounded','circle','square'].includes(data.widgetShape))throw new Error('Choose rounded, circle or square widget shape.')
 if(!Array.isArray(data.widgets)||!data.widgets.length||data.widgets.length>20)throw new Error('A pack needs 1–20 widgets.')
 const ids=new Set()
 const widgets=data.widgets.map(w=>{
  object(w,['id','label','icon','color','visible','kind','value'],'widget');const id=text(w.id,64,'Widget id')
  if(!/^(?:[a-z][a-z0-9-]*)$/.test(id)||ids.has(id)||id==='expand')throw new Error('Widget ids must be unique; Expand is reserved.')
  ids.add(id)
  if(!WIDGET_ICONS.includes(w.icon))throw new Error(`Unsupported widget icon: ${w.icon}`)
  if(id==='settings'&&w.visible===false)throw new Error('Settings must remain visible.');
  if(typeof w.visible!=='boolean')throw new Error('Widget visibility must be true or false.')
  const row={id,label:text(w.label,40,'Widget label'),icon:w.icon,color:color(w.color,'Widget color'),visible:w.visible}
  if(DEFAULT_WIDGETS.some(b=>b.id===id)){if(w.kind!==undefined||w.value!==undefined)throw new Error('Built-in widget actions cannot be replaced.');return row}
  if(!id.startsWith('custom-'))throw new Error('Custom widget ids must start with custom-.')
  if(!['route','prompt','link'].includes(w.kind))throw new Error('Custom widgets support route, prompt or link actions.')
  const value=text(w.value,4096,'Widget action')
  if(w.kind==='route'&&!ALLOWED_ROUTES.includes(value))throw new Error('Choose a supported Hermes route.')
  if(w.kind==='link'){let u;try{u=new URL(value)}catch{throw new Error('Link widgets require an HTTP(S) URL.')}if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw new Error('Link widgets require HTTP(S) without embedded credentials.')}
  return {...row,kind:w.kind,value}
 })
 if(!widgets.some(w=>w.visible))throw new Error('Keep at least one widget visible.')
 return {format:PACK_FORMAT,name,palette,widgetStyle:data.widgetStyle,widgetShape:data.widgetShape,widgets}
}
export function appearancePrompt(description,pack=DEFAULT_APPEARANCE) {
 return `Create a ${SKIN_NAME} appearance pack for my Hermes Desktop overlay. Design brief: ${String(description).trim()||'A calm, readable productivity workspace.'}\n\nReturn one JSON object only, matching this exact schema/example. Keep format, required palette keys and existing built-in widget ids. Each palette uses #RRGGBB colors. Both text and secondary text must have at least 4.5:1 contrast on background, sidebar and surface. widgetStyle is signal, outline or mono; widgetShape is rounded, circle or square. Icons must be chosen from: ${WIDGET_ICONS.join(', ')}. Custom widgets use unique custom- ids with kind route, prompt or link. Links must be HTTP(S) without credentials. Settings stays available automatically. Do not change provider, model, profiles, memory, schedules or gateway configuration; do not write executable CSS, JavaScript, SVG or remote assets. I will review and import the pack in Appearance.\n\n${JSON.stringify(pack,null,2)}`
}
// --- appearance:end ---

// --- update:begin ---
export const REPO_URL = 'https://github.com/ASV-Labs/naclip'
export const UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/ASV-Labs/naclip/main/version.json'
export const PLUGIN_RAW_URL = 'https://raw.githubusercontent.com/ASV-Labs/naclip/main/plugin.js'
/** Numeric x.y.z comparison: >0 when a is newer than b. */
export function compareVersions(a,b) {
 const pa=String(a).split('.').map(n=>parseInt(n,10)||0),pb=String(b).split('.').map(n=>parseInt(n,10)||0)
 for(let i=0;i<3;i++){const d=(pa[i]||0)-(pb[i]||0);if(d)return d>0?1:-1}
 return 0
}
/** version.json is untrusted network data: keep only a strict version, short plain-text notes and a repo-owned link. */
export function parseVersionManifest(input) {
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Version manifest must be an object.')
 const version=String(input.version||'')
 if(!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(version))throw new Error('Version manifest has no valid version.')
 const notes=(Array.isArray(input.notes)?input.notes:[]).filter(n=>typeof n==='string'&&n.trim()).map(n=>n.trim().slice(0,200)).slice(0,6)
 const url=typeof input.url==='string'&&/^https:\/\/github\.com\/ASV-Labs\/naclip(\/[\w./#?=-]*)?$/.test(input.url)?input.url:REPO_URL+'/releases'
 return {version,notes,url}
}
// --- update:end ---

export const $appearance = atom(DEFAULT_APPEARANCE)
export const $railExpanded = atom(false)
let disposeCustomTheme=()=>{}
function paletteToTheme(pack) {
 const colors=p=>({background:p.background,foreground:p.text,card:p.surface,cardForeground:p.text,muted:p.sidebar,mutedForeground:p.secondary,popover:p.surface,popoverForeground:p.text,primary:p.accent,primaryForeground:readableInk(p.accent),secondary:p.sidebar,secondaryForeground:p.text,accent:p.sidebar,accentForeground:p.text,border:p.border,input:p.border,ring:p.accent,midground:p.accent,composerRing:p.accent,destructive:'#D92D20',destructiveForeground:'#FFFFFF',sidebarBackground:p.sidebar,sidebarBorder:p.border,userBubble:p.accent,userBubbleBorder:p.accent})
 return {...TANDEM_THEME,name:'naclip-custom',label:`${SKIN_NAME} · ${pack.name}`,description:'Personal workspace palette',colors:colors(pack.palette.light),darkColors:colors(pack.palette.dark),customCSS:TANDEM_THEME.customCSS}
}
function registerAppearanceTheme(pack) {
 disposeCustomTheme();disposeCustomTheme=()=>{}
 if(pluginCtx)disposeCustomTheme=pluginCtx.register({id:'custom-theme',area:sdk.THEMES_AREA||'themes',data:paletteToTheme(pack)})||(()=>{})
}
export function applyAppearance(input) {
 const pack=parseAppearance(input);$appearance.set(pack)
 if(pluginCtx){pluginCtx.storage.set('appearance',pack);registerAppearanceTheme(pack)}
 if(sdk.requestTheme)sdk.requestTheme('naclip-custom')
 return pack
}
export async function draftAppearancePrompt(description) {
 const text=appearancePrompt(description,$appearance.get())
 const inserted=host.composer&&await host.composer.insertText('append',text)
 if(!inserted)throw new Error('Open a chat composer to draft the theme request.')
 host.navigate('/');host.composer.focus&&host.composer.focus()
 return text
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared state
// ─────────────────────────────────────────────────────────────────────────────

let pluginCtx = null
let closeAppearanceWorkspace = null
let closeComputerWorkspace = null
const $computerWorkspaceOpen = atom(false)

/** The viewer this window holds on the agent's screen, if a computer view is mounted. */
const $viewer = atom(null) // { profile, viewerId, hash } | null
const $chips = atom([])
const $navTidy = atom(false)
// Which window edge the widget rail sits on ('right' after Swap sidebar sides).
const $railSide = atom('left')
// Newer NaCLip release found by the update check: {version, notes, url} | null.
const $update = atom(null)

const DEFAULT_CHIPS = [
  { id: 'c1', label: 'Status report', kind: 'prompt', value: 'Give me a two-line status report on what you are working on right now.' },
  { id: 'c2', label: 'Automations', kind: 'route', value: '/cron' },
  { id: 'c3', label: 'Artifacts', kind: 'route', value: '/artifacts' },
  { id: 'c4', label: 'Hermes docs', kind: 'link', value: 'https://hermes-agent.nousresearch.com/docs/' }
]

const TILE_HUES = [221, 199, 152, 32, 268, 205, 340, 12, 175, 48]

function tileColor(key, index) {
  try {
    const c = typeof sdk.profileColor === 'function' ? sdk.profileColor(`tandem-${key}`) : null
    if (c) return c
  } catch {}
  return `hsl(${TILE_HUES[index % TILE_HUES.length]} 72% 52%)`
}

function agentName(profile) {
  if (!profile || profile === 'default') return 'Hermes'
  return profile.charAt(0).toUpperCase() + profile.slice(1)
}

function Icon({ name, className = 'size-4' }) {
  const aliases = { Bot:'Cpu', Bookmark:'BookOpen', Compass:'Globe', Briefcase:'FolderOpen' }
  const C = icons && (icons[name] || icons[aliases[name]] || icons.CircleIcon || icons.MessageCircle)
  return C ? jsx(C, { className, 'aria-hidden': true }) : null
}

function safeHttpUrl(value) {
  try {
    const u = new URL(String(value))
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null
  } catch {
    return null
  }
}

function useFocusedProfile() {
  const focused = host.state.focusedSessionProfile ? useValue(host.state.focusedSessionProfile) : null
  const active = useValue(host.state.profile)
  return focused || active || 'default'
}

// ─────────────────────────────────────────────────────────────────────────────
// Gateway routing for display.* (Bot Screen RPC)
// ─────────────────────────────────────────────────────────────────────────────

async function routeFor(profile) {
  if (typeof host.profileRoutes !== 'function') return null
  const routes = await host.profileRoutes()
  const ownerAtom = host.state.focusedSessionOwner
  const owner = ownerAtom ? ownerAtom.get() : null
  const connectionId = owner ? owner.connectionId : host.state.connectionId ? host.state.connectionId.get() : null
  if (ownerAtom && !owner) throw new Error('The focused chat has no unambiguous connection owner.')
  const matches = (routes || []).filter(r =>
    (r.profile === profile || r.targetProfile === profile) && (!connectionId || r.connectionId === connectionId)
  )
  if (matches.length > 1) throw new Error('Choose the owning Hermes instance before opening its computer.')
  if (connectionId && !matches.length) throw new Error('The focused chat’s Hermes connection is unavailable.')
  return matches[0] || null
}

function useFocusedOwnerKey(profile) {
  const owner = host.state.focusedSessionOwner ? useValue(host.state.focusedSessionOwner) : null
  const connectionId = host.state.connectionId ? useValue(host.state.connectionId) : null
  return `${owner ? owner.connectionId : connectionId || 'legacy'}:${owner ? owner.profile : profile}`
}

async function displayRpc(profile, method, params = {}, { userAction = false, timeoutMs } = {}) {
  const route = await routeFor(profile)
  const body = { profile: route ? route.targetProfile || route.profile : profile, ...params }
  if (route && typeof host.requestProfile === 'function') {
    return host.requestProfile(route, method, body, timeoutMs, userAction ? { spawnPriority: 'foreground' } : undefined)
  }
  return host.request(method, body)
}

function isMethodMissing(error) {
  const code = error && typeof error === 'object' ? error.code : null
  const msg = String((error && error.message) || '').toLowerCase()
  return code === -32601 || msg.includes('method not found')
}

async function viewerHash(viewerId) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(viewerId))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('').slice(0, 12)
}

async function screenSocketUrl(profile, ticket) {
  if (typeof sdk.resolveSiblingWsUrl !== 'function') {
    throw new Error('This Hermes Desktop build cannot open the screen stream. Update Hermes Desktop.')
  }
  const route = await routeFor(profile)
  const raw = await sdk.resolveSiblingWsUrl(
    { connectionId: route ? route.connectionId : null, profile: route ? route.targetProfile || route.profile : profile },
    '/api/display/ws',
    { stripGatewayCredential: true }
  )
  const url = new URL(raw)
  url.searchParams.set('display_ticket', ticket)
  return url.toString()
}

// --- rfb:begin ---------------------------------------------------------------
// Minimal RFB 3.8 client for Hermes Bot Screen. Xvnc there runs
// `-SecurityTypes None` behind a ticketed WebSocket bridge, so the handshake is
// fixed. Encodings: Raw, CopyRect, DesktopSize. Input is gated server-side by
// the takeover lease; `canControl` only decides whether we send it.

const ENC_RAW = 0
const ENC_COPYRECT = 1
const ENC_DESKTOPSIZE = -223

const KEYSYMS = {
  Backspace: 0xff08, Tab: 0xff09, Enter: 0xff0d, Escape: 0xff1b, Delete: 0xffff,
  Home: 0xff50, ArrowLeft: 0xff51, ArrowUp: 0xff52, ArrowRight: 0xff53, ArrowDown: 0xff54,
  PageUp: 0xff55, PageDown: 0xff56, End: 0xff57, Insert: 0xff63,
  Shift: 0xffe1, Control: 0xffe3, Alt: 0xffe9, AltGraph: 0xfe03, Meta: 0xffeb, CapsLock: 0xffe5,
  F1: 0xffbe, F2: 0xffbf, F3: 0xffc0, F4: 0xffc1, F5: 0xffc2, F6: 0xffc3,
  F7: 0xffc4, F8: 0xffc5, F9: 0xffc6, F10: 0xffc7, F11: 0xffc8, F12: 0xffc9
}

function keysymFor(key) {
  if (KEYSYMS[key] !== undefined) return KEYSYMS[key]
  if ([...key].length === 1) {
    const cp = key.codePointAt(0)
    return cp < 0x100 ? cp : 0x01000000 | cp
  }
  return null
}

class RfbClient {
  constructor({ url, canvas, onState, onResize, WebSocketImpl }) {
    this.url = url
    this.canvas = canvas
    this.ctx2d = canvas.getContext('2d')
    this.onState = onState || (() => {})
    this.onResize = onResize || (() => {})
    this.WS = WebSocketImpl || WebSocket
    this.buf = new Uint8Array(1 << 16)
    this.len = 0
    this.pos = 0
    this.phase = 'version'
    this.width = 0
    this.height = 0
    this.fbu = null
    this.mask = 0
    this.closed = false
  }

  connect() {
    const ws = new this.WS(this.url)
    ws.binaryType = 'arraybuffer'
    ws.onmessage = ev => this._recv(new Uint8Array(ev.data))
    ws.onclose = ev => { this.closed = true; this.onState('closed', ev && ev.code) }
    ws.onerror = () => this.onState('error')
    this.ws = ws
    this.onState('connecting')
  }

  disconnect() {
    this.closed = true
    try { this.ws && this.ws.close() } catch {}
  }

  _send(bytes) {
    if (this.ws && this.ws.readyState === 1) this.ws.send(bytes)
  }

  _recv(chunk) {
    if (this.len + chunk.length > this.buf.length) {
      // Compact unread bytes to the front; grow only when that isn't enough.
      const live = this.len - this.pos
      if (live + chunk.length > this.buf.length) {
        const next = new Uint8Array(Math.max(this.buf.length * 2, (live + chunk.length) * 2))
        next.set(this.buf.subarray(this.pos, this.len), 0)
        this.buf = next
      } else {
        this.buf.copyWithin(0, this.pos, this.len)
      }
      this.len = live
      this.pos = 0
    }
    this.buf.set(chunk, this.len)
    this.len += chunk.length
    try {
      while (this._step()) {}
    } catch (err) {
      this.onState('error', err && err.message)
      this.disconnect()
    }
  }

  _avail() { return this.len - this.pos }
  _u8(o = 0) { return this.buf[this.pos + o] }
  _u16(o = 0) { return (this.buf[this.pos + o] << 8) | this.buf[this.pos + o + 1] }
  _u32(o = 0) { return ((this.buf[this.pos + o] << 24) >>> 0) + (this.buf[this.pos + o + 1] << 16) + (this.buf[this.pos + o + 2] << 8) + this.buf[this.pos + o + 3] }
  _s32(o = 0) { return this._u32(o) | 0 }

  _step() {
    switch (this.phase) {
      case 'version': {
        if (this._avail() < 12) return false
        this.pos += 12
        this._send(new TextEncoder().encode('RFB 003.008\n'))
        this.phase = 'security'
        return true
      }
      case 'security': {
        if (this._avail() < 1) return false
        const n = this._u8()
        if (n === 0) throw new Error('Screen refused the connection')
        if (this._avail() < 1 + n) return false
        const types = Array.from(this.buf.subarray(this.pos + 1, this.pos + 1 + n))
        this.pos += 1 + n
        if (!types.includes(1)) throw new Error('Screen requires an unsupported security type')
        this._send(new Uint8Array([1]))
        this.phase = 'secresult'
        return true
      }
      case 'secresult': {
        if (this._avail() < 4) return false
        const ok = this._u32() === 0
        this.pos += 4
        if (!ok) throw new Error('Screen rejected the session')
        this._send(new Uint8Array([1])) // ClientInit: shared
        this.phase = 'serverinit'
        return true
      }
      case 'serverinit': {
        if (this._avail() < 24) return false
        const nameLen = this._u32(20)
        if (this._avail() < 24 + nameLen) return false
        this._resize(this._u16(0), this._u16(2))
        this.pos += 24 + nameLen
        this._sendPixelFormat()
        this._sendEncodings([ENC_RAW, ENC_COPYRECT, ENC_DESKTOPSIZE])
        this._requestUpdate(false)
        this.phase = 'normal'
        this.onState('connected')
        return true
      }
      case 'normal':
        return this.fbu ? this._fbuStep() : this._message()
    }
    return false
  }

  _message() {
    if (this._avail() < 1) return false
    const type = this._u8()
    if (type === 0) {
      if (this._avail() < 4) return false
      this.fbu = { rects: this._u16(2), rect: null }
      this.pos += 4
      return true
    }
    if (type === 1) {
      if (this._avail() < 6) return false
      const n = this._u16(4)
      if (this._avail() < 6 + n * 6) return false
      this.pos += 6 + n * 6
      return true
    }
    if (type === 2) { this.pos += 1; return true }
    if (type === 3) {
      if (this._avail() < 8) return false
      const n = this._u32(4)
      if (this._avail() < 8 + n) return false
      this.pos += 8 + n
      return true
    }
    throw new Error(`Unexpected screen message ${type}`)
  }

  _fbuStep() {
    const f = this.fbu
    if (!f.rect) {
      if (f.rects === 0) {
        this.fbu = null
        this._requestUpdate(true)
        return true
      }
      if (this._avail() < 12) return false
      f.rect = { x: this._u16(0), y: this._u16(2), w: this._u16(4), h: this._u16(6), enc: this._s32(8) }
      this.pos += 12
      return true
    }
    const { x, y, w, h, enc } = f.rect
    if (enc === ENC_RAW) {
      const need = w * h * 4
      if (this._avail() < need) return false
      if (w && h) {
        const img = this.ctx2d.createImageData(w, h)
        const d = img.data
        const s = this.buf
        for (let i = 0, p = this.pos; i < need; i += 4, p += 4) {
          d[i] = s[p + 2]
          d[i + 1] = s[p + 1]
          d[i + 2] = s[p]
          d[i + 3] = 255
        }
        this.ctx2d.putImageData(img, x, y)
      }
      this.pos += need
    } else if (enc === ENC_COPYRECT) {
      if (this._avail() < 4) return false
      const sx = this._u16(0)
      const sy = this._u16(2)
      this.pos += 4
      if (w && h) this.ctx2d.drawImage(this.canvas, sx, sy, w, h, x, y, w, h)
    } else if (enc === ENC_DESKTOPSIZE) {
      this._resize(w, h)
    } else {
      throw new Error(`Unsupported screen encoding ${enc}`)
    }
    f.rect = null
    f.rects -= 1
    return true
  }

  _resize(w, h) {
    this.width = w
    this.height = h
    this.canvas.width = w
    this.canvas.height = h
    this.onResize(w, h)
  }

  _sendPixelFormat() {
    const m = new Uint8Array(20)
    m[0] = 0
    m[4] = 32 // bpp
    m[5] = 24 // depth
    m[6] = 0 // little-endian
    m[7] = 1 // true colour
    m[9] = 255; m[11] = 255; m[13] = 255 // r/g/b max
    m[14] = 16; m[15] = 8; m[16] = 0 // shifts → BGRX in memory
    this._send(m)
  }

  _sendEncodings(list) {
    const m = new Uint8Array(4 + list.length * 4)
    const v = new DataView(m.buffer)
    m[0] = 2
    v.setUint16(2, list.length)
    list.forEach((e, i) => v.setInt32(4 + i * 4, e))
    this._send(m)
  }

  _requestUpdate(incremental) {
    const m = new Uint8Array(10)
    const v = new DataView(m.buffer)
    m[0] = 3
    m[1] = incremental ? 1 : 0
    v.setUint16(6, this.width)
    v.setUint16(8, this.height)
    this._send(m)
  }

  pointer(x, y, mask) {
    const m = new Uint8Array(6)
    const v = new DataView(m.buffer)
    m[0] = 5
    m[1] = mask
    v.setUint16(2, Math.max(0, Math.min(this.width - 1, Math.round(x))))
    v.setUint16(4, Math.max(0, Math.min(this.height - 1, Math.round(y))))
    this._send(m)
  }

  key(keysym, down) {
    const m = new Uint8Array(8)
    const v = new DataView(m.buffer)
    m[0] = 4
    m[1] = down ? 1 : 0
    v.setUint32(4, keysym)
    this._send(m)
  }
}
// --- rfb:end -----------------------------------------------------------------

// ─────────────────────────────────────────────────────────────────────────────
// Computer view
// ─────────────────────────────────────────────────────────────────────────────

function useDisplayStatus(profile, scopeKey) {
  const [state, setState] = useState({ loading: true, status: null, unavailable: false, error: null })
  const gen = useRef(0)

  const refresh = useCallback(async () => {
    const mine = ++gen.current
    try {
      const status = await displayRpc(profile, 'display.status')
      if (mine === gen.current) setState({ loading: false, status, unavailable: false, error: null })
    } catch (error) {
      if (mine !== gen.current) return
      if (isMethodMissing(error)) setState({ loading: false, status: null, unavailable: true, error: null })
      else setState(s => ({ ...s, loading: false, error: String((error && error.message) || error) }))
    }
  }, [profile, scopeKey])

  useEffect(() => {
    setState({ loading: true, status: null, unavailable: false, error: null })
    refresh()
    const offs = [
      host.onEvent('display.status', ev => {
        const p = (ev && ev.payload) || ev
        if (p && p.profile === profile) setState(s => ({ ...s, status: { ...s.status, ...p } }))
      }),
      host.onEvent('display.lease', ev => {
        const p = (ev && ev.payload) || ev
        setState(s =>
          s.status && p && p.profile_key === s.status.profile_key ? { ...s, status: { ...s.status, lease: p.lease } } : s
        )
      })
    ]
    return () => offs.forEach(off => { try { off && off() } catch {} })
  }, [profile, refresh])

  return [state, refresh]
}

function ScreenCanvas({ profile, scopeKey, canControl, onViewer }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const clientRef = useRef(null)
  const viewerRef = useRef(null)
  const controlRef = useRef(canControl)
  const [phase, setPhase] = useState('connecting')
  const [message, setMessage] = useState('')
  const [thumb, setThumb] = useState(null)

  controlRef.current = canControl

  const fit = useCallback(() => {
    const wrap = wrapRef.current
    const c = clientRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas || !c || !c.width) return
    const scale = Math.min(wrap.clientWidth / c.width, wrap.clientHeight / c.height)
    canvas.style.width = `${Math.floor(c.width * scale)}px`
    canvas.style.height = `${Math.floor(c.height * scale)}px`
  }, [])

  // Connect, and reconnect on a fresh ticket when the bridge drops us (a lease
  // flip can evict the socket by design).
  useEffect(() => {
    let alive = true
    let retry = 0
    let timer = null

    const attach = async () => {
      if (!alive) return
      setPhase('connecting')
      try {
        const observe = await displayRpc(profile, 'display.observe', viewerRef.current ? { viewer_id: viewerRef.current } : {})
        if (!alive) return
        viewerRef.current = observe.viewer_id
        const hash = await viewerHash(observe.viewer_id)
        $viewer.set({ profile, scopeKey, viewerId: observe.viewer_id, hash, streamReady: false })
        onViewer && onViewer({ viewerId: observe.viewer_id, hash })
        const url = await screenSocketUrl(profile, observe.ticket)
        if (!alive) return
        const client = new RfbClient({
          url,
          canvas: canvasRef.current,
          onResize: () => fit(),
          onState: (s, detail) => {
            if (!alive || client !== clientRef.current) return
            if (s === 'connected') { retry = 0; setPhase('live'); setMessage(''); const v = $viewer.get(); if (v && v.viewerId === viewerRef.current && v.scopeKey === scopeKey) $viewer.set({ ...v, streamReady: true }) }
            if (s === 'error' && detail) setMessage(detail)
            if (s === 'closed') {
              const v = $viewer.get(); if (v && v.viewerId === viewerRef.current && v.scopeKey === scopeKey) $viewer.set({ ...v, streamReady: false })
              setPhase('reconnecting')
              const delay = Math.min(8000, 600 * 2 ** retry++)
              timer = setTimeout(attach, delay)
            }
          }
        })
        clientRef.current = client
        client.connect()
      } catch (error) {
        if (!alive) return
        setPhase('failed')
        setMessage(String((error && error.message) || error))
        timer = setTimeout(attach, Math.min(15000, 2000 * 2 ** retry++))
      }
    }

    attach()
    return () => {
      alive = false
      clearTimeout(timer)
      clientRef.current && clientRef.current.disconnect()
      clientRef.current = null
      const v = $viewer.get()
      if (v && v.viewerId === viewerRef.current) $viewer.set(null)
    }
  }, [profile])

  // Still image while the live stream isn't up (suppressed while a human holds).
  useEffect(() => {
    if (phase === 'live') return
    let alive = true
    const grab = async () => {
      try {
        const r = await displayRpc(profile, 'display.thumbnail')
        if (alive && r && r.data_url) setThumb(r.data_url)
      } catch {}
    }
    grab()
    const t = setInterval(grab, 4000)
    return () => { alive = false; clearInterval(t) }
  }, [profile, phase])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => fit())
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [fit])

  // Input — sent only while this window holds control.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pressed = new Map()
    let wheel = 0

    const pos = e => {
      const c = clientRef.current
      const r = canvas.getBoundingClientRect()
      return [((e.clientX - r.left) * c.width) / r.width, ((e.clientY - r.top) * c.height) / r.height]
    }
    const maskOf = e => (e.buttons & 1 ? 1 : 0) | (e.buttons & 4 ? 2 : 0) | (e.buttons & 2 ? 4 : 0)
    const live = () => controlRef.current && clientRef.current && clientRef.current.width

    const onPointer = e => {
      if (!live()) return
      if (e.type === 'pointerdown') { canvas.focus(); canvas.setPointerCapture(e.pointerId) }
      const [x, y] = pos(e)
      clientRef.current.mask = maskOf(e)
      clientRef.current.pointer(x, y, clientRef.current.mask)
      e.preventDefault()
    }
    const onWheel = e => {
      if (!live()) return
      e.preventDefault()
      wheel += e.deltaY
      const [x, y] = pos(e)
      const c = clientRef.current
      while (Math.abs(wheel) >= 50) {
        const bit = wheel < 0 ? 8 : 16
        c.pointer(x, y, c.mask | bit)
        c.pointer(x, y, c.mask)
        wheel += wheel < 0 ? 50 : -50
      }
    }
    const onKey = e => {
      if (!live()) return
      const down = e.type === 'keydown'
      const sym = down ? keysymFor(e.key) : pressed.get(e.code)
      if (sym == null) return
      e.preventDefault()
      e.stopPropagation()
      if (down) pressed.set(e.code, sym)
      else pressed.delete(e.code)
      clientRef.current.key(sym, down)
    }
    const onBlur = () => {
      const c = clientRef.current
      if (c) pressed.forEach(sym => c.key(sym, false))
      pressed.clear()
    }
    const noMenu = e => { if (live()) e.preventDefault() }

    const add = (t, f, o) => canvas.addEventListener(t, f, o)
    add('pointerdown', onPointer); add('pointerup', onPointer); add('pointermove', onPointer)
    add('wheel', onWheel, { passive: false }); add('keydown', onKey); add('keyup', onKey)
    add('blur', onBlur); add('contextmenu', noMenu)
    return () => {
      for (const [t, f] of [['pointerdown', onPointer], ['pointerup', onPointer], ['pointermove', onPointer], ['wheel', onWheel], ['keydown', onKey], ['keyup', onKey], ['blur', onBlur], ['contextmenu', noMenu]]) {
        canvas.removeEventListener(t, f)
      }
    }
  }, [])

  return jsxs('div', {
    ref: wrapRef,
    className: 'tandem-screen relative flex h-full w-full items-center justify-center overflow-hidden',
    children: [
      phase !== 'live' && thumb
        ? jsx('img', { src: thumb, alt: '', className: 'absolute inset-0 h-full w-full object-contain opacity-70' })
        : null,
      jsx('canvas', {
        ref: canvasRef,
        tabIndex: 0,
        'aria-label': canControl ? 'Agent screen, you have control' : 'Agent screen, view only',
        className: cn('tandem-canvas block outline-none', phase === 'live' ? 'opacity-100' : 'opacity-0', canControl ? 'cursor-default' : 'cursor-not-allowed')
      }),
      phase !== 'live'
        ? jsx('div', {
            className: 'absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-(--ui-bg-elevated,rgba(0,0,0,.55)) px-3 py-1 text-[0.6875rem] text-(--ui-text-secondary)',
            children: phase === 'failed' ? message || 'Screen unreachable. Retrying.' : 'Connecting to screen'
          })
        : null
    ]
  })
}

function Notice({ title, body, action }) {
  return jsxs('div', {
    className: 'tandem-screen-notice flex h-full flex-col items-center justify-center gap-2 p-6 text-center',
    children: [
      jsx('div', { className: 'text-sm font-medium text-(--ui-text-primary,inherit)', children: title }),
      body ? jsx('div', { className: 'max-w-[34ch] text-xs leading-relaxed text-(--ui-text-tertiary)', children: body }) : null,
      action || null
    ]
  })
}

function ComputerView() {
  const profile = useFocusedProfile()
  const scopeKey = useFocusedOwnerKey(profile)
  const [{ loading, status, unavailable, error }, refresh] = useDisplayStatus(profile, scopeKey)
  const viewer = useValue($viewer)
  const [busy, setBusy] = useState(false)
  const name = agentName(profile)

  const lease = status && status.lease
  const mine = !!(lease && lease.holder === 'human' && viewer && viewer.profile === profile && viewer.scopeKey === scopeKey && lease.viewer_hash === viewer.hash)

  const act = async (fn, fallback) => {
    setBusy(true)
    try { await fn() } catch (e) { host.notifyError(e, fallback) } finally { setBusy(false); refresh() }
  }

  const takeOver = () =>
    act(async () => {
      if (!viewer || viewer.profile !== profile || viewer.scopeKey !== scopeKey || !viewer.streamReady) throw new Error('The screen is still connecting.')
      await displayRpc(profile, 'display.lease.acquire', { viewer_id: viewer.viewerId, reason: 'Taken over in NaCLip' }, { userAction: true })
    }, 'Could not take over the screen')

  const handBack = () =>
    act(async () => {
      await displayRpc(profile, 'display.lease.release', viewer ? { viewer_id: viewer.viewerId } : {}, { userAction: true })
    }, 'Could not hand control back')

  const start = () =>
    act(async () => { await displayRpc(profile, 'display.start', {}, { userAction: true, timeoutMs: 90000 }) }, 'Could not start the screen')

  let body
  if (loading) body = jsx(Notice, { title: 'Checking the screen' })
  else if (unavailable)
    body = jsx(Notice, { title: 'No agent screen on this Hermes', body: 'This gateway has no Bot Screen support. Run `hermes update` on the machine the agent runs on.' })
  else if (error && !status) body = jsx(Notice, { title: 'Screen status unavailable', body: error, action: jsx(Button, { size: 'sm', variant: 'outline', onClick: refresh, children: 'Try again' }) })
  else if (!status.supported)
    body = jsx(Notice, {
      title: 'The screen can’t run here yet',
      body: status.blocker || 'Configure a supported Hermes computer sandbox for this profile. See the NaCLip README for Docker and other backend options.'
    })
  else if (!status.installed)
    body = jsx(Notice, {
      title: 'Desktop packages missing',
      body: status.install_command ? `Run once where the screen lives: ${status.install_command}` : `Missing: ${(status.missing || []).join(', ')}`,
      action: status.install_command
        ? jsx(Button, { size: 'sm', variant: 'outline', onClick: () => pluginCtx && pluginCtx.os.writeClipboard(status.install_command), children: 'Copy command' })
        : null
    })
  else if (!status.running)
    body = jsx(Notice, {
      title: `${name}’s computer is off`,
      body: status.blocker || 'It also starts on its own the first time the agent uses the browser or computer_use.',
      action: status.blocker ? null : jsx(Button, { size: 'sm', disabled: busy, onClick: start, children: busy ? 'Starting' : 'Start computer' })
    })
  else body = jsx(ScreenCanvas, { profile, scopeKey, canControl: mine && viewer && viewer.streamReady }, scopeKey)

  const running = status && status.running && status.installed && status.supported

  return jsxs('div', {
    className: 'tandem-computer flex h-full flex-col gap-3 p-3',
    children: [
      jsxs('div', {
        className: 'flex items-center gap-2 text-xs text-(--ui-text-secondary)',
        children: [
          jsx(Icon, { name: 'Monitor', className: 'size-3.5' }),
          jsx('span', { className: 'font-medium', children: `${name}’s computer` }),
          status && status.placement && status.placement !== 'gateway'
            ? jsx('span', { className: 'text-(--ui-text-quaternary)', children: 'sandboxed' })
            : null
        ]
      }),
      jsx('div', { className: 'tandem-bezel min-h-0 flex-1', children: jsx('div', { className: 'tandem-glass h-full', children: body }) }),
      running
        ? jsxs('div', {
            className: 'flex items-center justify-center gap-3 pb-1',
            children: [
              jsx('span', {
                className: 'text-sm text-(--ui-text-secondary)',
                children: !lease || lease.holder === 'agent' ? `${name} has control` : mine ? 'You have control' : 'Another window has control'
              }),
              mine
                ? jsx(Button, { size: 'sm', variant: 'outline', className: 'rounded-full', disabled: busy, onClick: handBack, children: 'Hand back' })
                : jsx(Button, { size: 'sm', className: 'tandem-takeover rounded-full', disabled: busy || !viewer || viewer.scopeKey !== scopeKey || !viewer.streamReady, onClick: takeOver, children: 'Take over' })
            ]
          })
        : null
    ]
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Rail
// ─────────────────────────────────────────────────────────────────────────────

// --- workspace-navigation:begin ---
function openComputer() {
  if (typeof host.openWorkspace === 'function') {
    closeComputerWorkspace = host.openWorkspace(`${ID}:computer-main`, {
      title: 'Agent’s computer', minWidth: '22rem',
      onClose: () => { closeComputerWorkspace = null; $computerWorkspaceOpen.set(false) },
      render: () => element('div', {className:'skin-computer-workspace'}, [
        workspaceHeader('Agent’s computer', 'Close computer', () => closeComputerWorkspace?.()),
        element('div', {className:'skin-computer-workspace-body'}, jsx(ComputerView, {}))
      ])
    })
    $computerWorkspaceOpen.set(true)
    return
  }
  if (typeof host.revealPane === 'function') {
    host.revealPane(`${ID}:computer`)
    host.notify({kind:'info',message:'Computer pane revealed. If the current page covers it, return to your chat to view it.'})
    return
  }
  host.notify({kind:'info',message:'This Hermes version cannot open the computer view. Update Hermes Desktop to use the computer workspace.'})
}
// --- workspace-navigation:end ---

function ComputerPane() {
  const inWorkspace = useValue($computerWorkspaceOpen)
  // Mount only one live viewer: two copies would compete for the viewer/lease state.
  return inWorkspace
    ? jsx(Notice, {title:'Computer open in main workspace',body:'Close the computer tab to return its screen here.'})
    : jsx(ComputerView, {})
}

function workspaceHeader(title, closeLabel, close) {
  return element('header', {className:'skin-workspace-header'}, [
    element('strong', {}, title),
    element('button', {type:'button',className:'skin-workspace-close','aria-label':closeLabel,title:closeLabel,onClick:close},
      element('span', {'aria-hidden':true}, '×'))
  ])
}

function openBots() {
  if (typeof host.revealPane === 'function') host.revealPane('hermes-bots:pane')
  else host.navigate('/capabilities?tab=plugins')
}

function openAppearance() {
  if (typeof host.openWorkspace !== 'function') {
    host.navigate('/settings?tab=config:appearance')
    return
  }
  closeAppearanceWorkspace = host.openWorkspace(`${ID}:appearance`, {
    title: 'NaCLip appearance',
    minWidth: '22rem',
    onClose: () => { closeAppearanceWorkspace = null },
    render: () => element('div', {className:'skin-appearance-workspace'}, [
      workspaceHeader('NaCLip appearance', 'Close appearance', () => closeAppearanceWorkspace?.()),
      element('div', {className:'skin-workspace-body'}, [
        element('button', {type:'button',className:'skin-button',onClick:()=>{
          closeAppearanceWorkspace?.()
          host.navigate('/settings?tab=config:appearance')
        }}, 'Hermes appearance settings'),
        jsx(AppearanceSettings,{})
      ])
    ])
  })
}

function ThemeToggle() {
  const theme = sdk.useTheme ? sdk.useTheme() : null
  const dark = theme && (theme.renderedMode || theme.resolvedMode || theme.mode) === 'dark'
  return jsx('button', { type: 'button', className: 'tandem-theme-toggle', 'aria-label': dark ? 'Switch to light mode' : 'Switch to dark mode', title: dark ? 'Switch to light mode' : 'Switch to dark mode', onClick: () => theme && theme.setMode && theme.setMode(dark ? 'light' : 'dark'), children: jsx(Icon, { name: dark ? 'Sun' : 'Moon' }) })
}

const RAIL = [
  { id: 'new', label: 'New chat', icon: 'Plus', run: () => host.newChat() },
  { id: 'bots', label: 'Bots', icon: 'Bot', run: openBots },
  { id: 'profiles', label: 'Instances and profiles', icon: 'Users', route: '/profiles' },
  { id: 'computer', label: 'Agent’s computer', icon: 'Monitor', run: openComputer },
  { id: 'capabilities', label: 'Capabilities', icon: 'Plug', route: '/capabilities' },
  { id: 'messaging', label: 'Messaging', icon: 'MessageCircle', route: '/messaging' },
  { id: 'artifacts', label: 'Artifacts', icon: 'Package', route: '/artifacts' },
  { id: 'cron', label: 'Automations', icon: 'Clock', route: '/cron' },
  { id: 'command', label: 'Command center', icon: 'LayoutDashboard', route: '/command-center' }
]

function useHashRoute() {
  const read = () => (typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

function runWidget(item) {
 sdk.haptic&&sdk.haptic('tap')
 if(item.route)host.navigate(item.route)
 else if(item.kind==='prompt')host.composer.insertText('append',item.value).then(ok=>{if(ok){host.navigate('/');host.composer.focus&&host.composer.focus()}else host.notify({kind:'info',message:'Open a chat to use this prompt widget.'})})
 else if(item.kind==='link')pluginCtx&&pluginCtx.os.openExternal(item.value)
 else if(item.run)item.run()
}
function RailTile({item,index,active,expanded=false,badge=false}) {
 const pack=useValue($appearance),side=useValue($railSide),color=item.color||tileColor(item.id,index)
 const label=badge?item.label+' (update available)':item.label
 const tile=jsxs('button',{type:'button','aria-label':label,'aria-current':active?'page':undefined,onClick:()=>runWidget(item),className:cn('skin-rail-item',expanded&&'with-label',active&&'is-active'),style:{'--tile':color,'--tile-ink':readableInk(/^#[0-9a-f]{6}$/i.test(color)?color:'#3366FF')},children:[jsxs('span',{className:'tandem-tile',children:[jsx(Icon,{name:item.icon,className:'size-[18px]'}),badge?jsx('span',{className:'skin-update-dot','aria-hidden':true}):null]}),expanded?jsx('span',{className:'skin-widget-label',children:label}):null]})
 // Tooltips open toward the window, not off its edge, when the rail is swapped right.
 return !expanded&&sdk.Tip?jsx(sdk.Tip,{label,side:side==='right'?'left':'right',children:tile}):tile
}
function Rail() {
 const route=useHashRoute(),pack=useValue($appearance),expanded=useValue($railExpanded),update=useValue($update),popup=useRef(null),rail=useRef(null)
 const botsActive=typeof host.paneVisibility==='function'?useValue(host.paneVisibility('hermes-bots:pane')):false
 const toggle=value=>{$railExpanded.set(value);pluginCtx&&pluginCtx.storage.set('railExpanded',value)}
 const widgets=pack.widgets.filter(w=>w.visible&&w.id!=='settings').map(w=>({...RAIL.find(r=>r.id===w.id),...w,...(w.kind==='route'?{route:w.value}:{})}))
 const settings={id:'settings',label:'Settings',icon:'Settings',color:'#BDA23D',route:'/settings',...pack.widgets.find(w=>w.id==='settings')}
 useEffect(()=>{
  const el=popup.current
  if(expanded){
   // Anchor to whichever edge the rail is on so the panel opens into the window.
   const position=()=>{if(!rail.current)return;const rect=rail.current.getBoundingClientRect(),right=rect.left+rect.width/2>innerWidth/2;el.dataset.side=right?'right':'left';el.style.top=rect.top+'px';el.style.left=right?'auto':rect.left+'px';el.style.right=right?Math.max(0,innerWidth-rect.right)+'px':'auto';el.style.height=Math.max(0,innerHeight-rect.top)+'px'}
   position();el.showPopover();window.addEventListener('resize',position);window.addEventListener(LAYOUT_EVENT,position)
   const observer=new ResizeObserver(position);observer.observe(rail.current)
   return()=>{window.removeEventListener('resize',position);window.removeEventListener(LAYOUT_EVENT,position);observer.disconnect()}
  }
  else if(el.matches(':popover-open')){const restore=el.contains(document.activeElement);el.hidePopover();if(restore)rail.current.querySelector('button').focus()}
 },[expanded])
 const contents=wide=>[
  jsx('button',{type:'button',className:'skin-rail-expand','aria-label':wide?'Collapse widget sidebar':'Expand widget sidebar','aria-expanded':expanded,'aria-controls':'naclip-expanded-widgets',onClick:()=>toggle(!expanded),children:wide?'‹  Collapse sidebar':'›'},'expand'),
  jsx('div',{className:'skin-widget-list',children:widgets.map((item,i)=>jsx(RailTile,{item,index:i,expanded:wide,active:item.id==='bots'?botsActive:!!item.route&&(item.route==='/'?route==='/':route.startsWith(item.route))},item.id))},'widgets'),
  element('div',{key:'settings-group',className:'skin-rail-settings'},[
   jsx(RailTile,{item:{id:'appearance',label:'Customize appearance',icon:'Palette',color:'#638D87',run:openAppearance},index:10,expanded:wide,badge:!!update},'appearance'),
   jsx(RailTile,{item:settings,index:9,expanded:wide,active:route.startsWith('/settings')},'settings')
  ])
 ]
 return jsxs(Fragment,{children:[jsx('nav',{ref:rail,'aria-label':SKIN_NAME+' widgets',className:'tandem-rail skin-collapsed-rail','data-style':pack.widgetStyle,'data-shape':pack.widgetShape,children:contents(false)}),jsx('nav',{id:'naclip-expanded-widgets',ref:popup,popover:'manual','aria-label':'Expanded widget sidebar',className:'skin-expanded-rail','data-style':pack.widgetStyle,'data-shape':pack.widgetShape,onKeyDown:e=>{if(e.key==='Escape'){e.stopPropagation();toggle(false)}},children:contents(true)})]})
}

// ─────────────────────────────────────────────────────────────────────────────
// Dock
// ─────────────────────────────────────────────────────────────────────────────

const KIND_ICON = { prompt: 'Send', route: 'LayoutDashboard', link: 'ExternalLink' }

function saveChips(next) {
  $chips.set(next)
  pluginCtx && pluginCtx.storage.set('chips', next)
}

async function runChip(chip) {
  if (chip.kind === 'route') return host.navigate(chip.value)
  if (chip.kind === 'link') {
    const url = safeHttpUrl(chip.value)
    if (url && pluginCtx) await pluginCtx.os.openExternal(url)
    return
  }
  const composer = host.composer
  const ok = composer ? await composer.insertText(null, chip.value, { mode: 'block' }) : false
  if (ok) composer.focus(null)
  else if (pluginCtx && (await pluginCtx.os.writeClipboard(chip.value)))
    host.notify({ kind: 'info', message: 'Open a chat first. The prompt is on your clipboard.' })
}

function ChipEditor({ open, onOpenChange }) {
  const [label, setLabel] = useState('')
  const [kind, setKind] = useState('prompt')
  const [value, setValue] = useState('')
  const valid = label.trim() && value.trim() && (kind !== 'link' || safeHttpUrl(value))
  const placeholder = { prompt: 'What the agent should do', route: '/capabilities', link: 'https://…' }[kind]

  const save = () => {
    if (!valid) return
    saveChips([...$chips.get(), { id: `c${Date.now().toString(36)}`, label: label.trim().slice(0, 40), kind, value: value.trim() }])
    setLabel(''); setValue(''); setKind('prompt')
    onOpenChange(false)
  }

  return jsx(sdk.Dialog, {
    open,
    onOpenChange,
    children: jsxs(sdk.DialogContent, {
      children: [
        jsxs(sdk.DialogHeader, {
          children: [
            jsx(sdk.DialogTitle, { children: 'Add a shortcut' }),
            jsx(sdk.DialogDescription, { children: 'Shortcuts sit in the dock under the chat.' })
          ]
        }),
        jsxs('div', {
          className: 'flex flex-col gap-3',
          children: [
            jsx(Input, { value: label, onChange: e => setLabel(e.target.value), placeholder: 'Name', autoFocus: true }),
            jsx('div', {
              className: 'flex gap-1.5',
              role: 'radiogroup',
              'aria-label': 'What it does',
              children: [['prompt', 'Ask the agent'], ['route', 'Open a page'], ['link', 'Open a link']].map(([k, l]) =>
                jsx(Button, { size: 'sm', variant: kind === k ? 'default' : 'outline', role: 'radio', 'aria-checked': kind === k, onClick: () => setKind(k), children: l }, k)
              )
            }),
            jsx(Input, { value, onChange: e => setValue(e.target.value), placeholder, onKeyDown: e => e.key === 'Enter' && save() })
          ]
        }),
        jsx(sdk.DialogFooter, { children: jsx(Button, { disabled: !valid, onClick: save, children: 'Add shortcut' }) })
      ]
    })
  })
}

function DockChip({ chip, index }) {
  const color = tileColor(chip.id, index + 3)
  const button = jsxs('button', {
    type: 'button',
    onClick: () => runChip(chip),
    className: 'tandem-chip',
    title: chip.kind === 'prompt' ? chip.value : undefined,
    children: [
      jsx('span', { className: 'tandem-chip-glyph', style: { '--tile': color }, children: jsx(Icon, { name: KIND_ICON[chip.kind] || 'Zap', className: 'size-3' }) }),
      jsx('span', { className: 'truncate', children: chip.label })
    ]
  })
  if (!sdk.ContextMenu) return button
  return jsxs(sdk.ContextMenu, {
    children: [
      jsx(sdk.ContextMenuTrigger, { asChild: true, children: button }),
      jsx(sdk.ContextMenuContent, {
        children: jsx(sdk.ContextMenuItem, { onSelect: () => saveChips($chips.get().filter(c => c.id !== chip.id)), children: 'Remove shortcut' })
      })
    ]
  })
}

function Dock() {
  const chips = useValue($chips)
  const [editing, setEditing] = useState(false)
  return jsxs('div', {
    className: 'tandem-dock flex h-full items-center gap-2 overflow-x-auto px-3',
    children: [
      ...chips.map((chip, i) => jsx(DockChip, { chip, index: i }, chip.id)),
      jsx('button', {
        type: 'button',
        'aria-label': 'Add a shortcut',
        onClick: () => setEditing(true),
        className: 'tandem-chip tandem-chip-add',
        children: jsx(Icon, { name: 'Plus', className: 'size-3.5' })
      }),
      jsx(ChipEditor, { open: editing, onOpenChange: setEditing })
    ]
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout guard
//
// Hermes measures each zone's titlebar reservation (traffic lights on the
// left, the tool cluster on the right) only when a zone RESIZES. Swap sidebar
// sides moves zones without resizing them, so the old reservations stay: the
// sessions header's window-drag strip lands on top of the swap/settings
// buttons (macOS turns those clicks into a window drag — "swap works once")
// and the chat tabs slide under the traffic lights. Whenever zone positions
// change we ask Hermes to re-measure with its own chrome-changed event.
//
// The same pass keeps NaCLip's fixed strips fixed: the widget rail and the
// shortcut dock lose their resize seams, other seams start below the
// titlebar so their hover line never crosses the window controls, and the
// glass backdrop follows the sidebar to whichever side it is on.
// ─────────────────────────────────────────────────────────────────────────────

const TITLEBAR_CHROME_EVENT = 'hermes:titlebar-chrome-changed'
const LAYOUT_EVENT = 'naclip:layout-changed'
const TITLEBAR_BAND_PX = 34

// --- layout-guard:begin ---
const zoneOf = selector => {
  const el = document.querySelector(selector)
  return el ? el.closest('[data-tree-group]') : null
}
const shownRect = el => {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 ? r : null
}
const setData = (el, key, value) => {
  if (value == null) { if (key in el.dataset) delete el.dataset[key] }
  else if (el.dataset[key] !== value) el.dataset[key] = value
}

function layoutSignature() {
  let sig = String(window.innerWidth)
  for (const g of document.querySelectorAll('[data-tree-group]')) {
    const r = g.getBoundingClientRect()
    if (r.width && r.height) sig += `|${g.getAttribute('data-tree-group')}:${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}`
  }
  return sig
}

function syncSashes(lockedWrappers) {
  for (const sash of document.querySelectorAll('[data-tree-split] > div > [role="separator"]')) {
    const wrapper = sash.parentElement
    // The sash belongs to the seam between this track and its nearest SHOWN previous sibling.
    let partner = wrapper.previousElementSibling
    while (partner && partner.style.display === 'none') partner = partner.previousElementSibling
    if (lockedWrappers.has(wrapper) || (partner && lockedWrappers.has(partner))) {
      setData(sash, 'naclipSash', 'locked')
    } else {
      const vertical = sash.classList.contains('cursor-col-resize')
      // Measure the TRACK, not the sash: the sash's own top moves once we inset it.
      setData(sash, 'naclipSash', vertical && wrapper.getBoundingClientRect().top < 4 ? 'below-titlebar' : null)
    }
  }
}

function syncSidebarSide(rail, sessions) {
  const root = document.documentElement
  const mid = window.innerWidth / 2
  const sideOf = r => (r.left + r.width / 2 > mid ? 'right' : 'left')
  const railSide = rail ? sideOf(rail) : 'left'
  if ($railSide.get() !== railSide) $railSide.set(railSide)
  if (!sessions) {
    setData(root, 'naclipSidebarSide', null)
    root.style.removeProperty('--naclip-glass-edge')
    return
  }
  const side = sideOf(sessions)
  const group = [sessions, rail].filter(r => r && sideOf(r) === side)
  const edge = side === 'right' ? window.innerWidth - Math.min(...group.map(r => r.left)) : Math.max(...group.map(r => r.right))
  setData(root, 'naclipSidebarSide', side)
  root.style.setProperty('--naclip-glass-edge', `${Math.max(0, Math.round(edge))}px`)
}

// --- layout-guard:end ---

function startLayoutGuard(ctx) {
  if (sdk.IS_PREVIEW || typeof MutationObserver === 'undefined') return () => {}
  let lastSig = ''
  let pending = 0
  let frame = 0
  let observedZones = []
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => schedule()) : null

  const run = () => {
    pending = 0
    const railZone = zoneOf('.skin-collapsed-rail')
    const dockZone = zoneOf('.tandem-dock')
    const sessionsZone = zoneOf('[data-tree-tab="sessions"]') || zoneOf('[data-slot="sidebar"]')
    const locked = new Set([railZone, dockZone].filter(Boolean).map(z => z.parentElement))
    syncSashes(locked)
    syncSidebarSide(shownRect(railZone), shownRect(sessionsZone))
    const zones = [railZone, dockZone, sessionsZone].filter(Boolean)
    if (resizeObserver && (zones.length !== observedZones.length || zones.some((z, i) => z !== observedZones[i]))) {
      resizeObserver.disconnect()
      zones.forEach(z => resizeObserver.observe(z))
      observedZones = zones
    }
    const sig = layoutSignature()
    if (sig !== lastSig) {
      const first = !lastSig
      lastSig = sig
      if (!first) {
        // Hermes re-measures every zone's titlebar reservation on this event.
        window.dispatchEvent(new CustomEvent(TITLEBAR_CHROME_EVENT))
        window.dispatchEvent(new Event(LAYOUT_EVENT))
      }
    }
  }
  function schedule() {
    if (pending) return
    // Let the flip/drop commit and paint, then measure once.
    pending = window.setTimeout(() => { frame = requestAnimationFrame(run) }, 80)
  }

  const mutations = new MutationObserver(records => {
    for (const r of records) {
      const t = r.target
      // Chat streaming and pane content churn live inside zone bodies; ignore them.
      if (t.nodeType === 1 && !t.closest('[data-zone-body]')) { schedule(); return }
    }
  })
  mutations.observe(document.body, { childList: true, subtree: true })
  const listen = (target, type, fn, opts) => {
    if (ctx && typeof ctx.addEventListener === 'function') return ctx.addEventListener(target, type, fn, opts)
    target.addEventListener(type, fn, opts)
    return () => target.removeEventListener(type, fn, opts)
  }
  const offs = [listen(window, 'pointerup', schedule, true), listen(window, 'keyup', schedule, true), listen(window, 'resize', schedule)]
  schedule()

  return () => {
    mutations.disconnect()
    resizeObserver && resizeObserver.disconnect()
    offs.forEach(off => off())
    clearTimeout(pending)
    cancelAnimationFrame(frame)
    const root = document.documentElement
    setData(root, 'naclipSidebarSide', null)
    root.style.removeProperty('--naclip-glass-edge')
    document.querySelectorAll('[data-naclip-sash]').forEach(el => setData(el, 'naclipSash', null))
    // Hand the reservations back to Hermes's own measurements.
    window.dispatchEvent(new CustomEvent(TITLEBAR_CHROME_EVENT))
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Update check
//
// Reads a tiny version.json from the NaCLip repo (no cookies, no referrer,
// nothing sent but the request itself) and offers the update. Updating stays
// the user's action: Hermes's own Install from Git replaces the plugin in
// place and keeps saved settings. Turn checks off in NaCLip appearance.
// ─────────────────────────────────────────────────────────────────────────────

const UPDATE_FIRST_CHECK_MS = 15_000
const UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000
const UPDATE_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000

async function checkForUpdate({ manual = false } = {}) {
  if (sdk.IS_PREVIEW || !pluginCtx || typeof fetch !== 'function') return null
  if (!manual && pluginCtx.storage.get('updateChecks', true) === false) return null
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timer = setTimeout(() => controller && controller.abort(), 10_000)
  try {
    const res = await fetch(`${UPDATE_MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller ? controller.signal : undefined })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    if (text.length > 8000) throw new Error('Version manifest too large.')
    const info = parseVersionManifest(JSON.parse(text))
    if (!pluginCtx) return null
    pluginCtx.storage.set('updateCheckedAt', Date.now())
    if (compareVersions(info.version, VERSION) <= 0) {
      $update.set(null)
      if (manual) host.notify({ kind: 'success', message: `NaCLip ${VERSION} is up to date.` })
      return null
    }
    $update.set(info)
    const snooze = pluginCtx.storage.get('updateSnooze', null)
    const snoozed = snooze && snooze.version === info.version && snooze.until > Date.now()
    if (manual || !snoozed) promptUpdate(info)
    return info
  } catch {
    if (manual) host.notify({ kind: 'warning', message: 'Could not reach GitHub to check for NaCLip updates. Try again later.' })
    return null
  } finally {
    clearTimeout(timer)
  }
}

function promptUpdate(info) {
  host.notify({
    id: 'naclip-update',
    kind: 'info',
    title: `NaCLip ${info.version} is available`,
    message: info.notes[0] || 'A new version of your Hermes skin is ready.',
    detail: `You have ${VERSION}. Your theme, widgets and shortcuts are kept.`,
    durationMs: 0,
    placement: 'default',
    action: { label: 'Update', onClick: () => startUpdate(info) },
    secondaryAction: {
      label: 'Later',
      onClick: () => pluginCtx && pluginCtx.storage.set('updateSnooze', { version: info.version, until: Date.now() + UPDATE_SNOOZE_MS })
    }
  })
}

async function startUpdate(info) {
  const copied = pluginCtx ? await pluginCtx.os.writeClipboard(REPO_URL) : false
  host.navigate('/capabilities?tab=plugins')
  host.notify({
    id: 'naclip-update-steps',
    kind: 'info',
    title: `Update NaCLip to ${info ? info.version : 'the latest version'}`,
    message: copied
      ? 'Link copied. Choose Install from Git, paste it, and install. NaCLip is replaced in place.'
      : `Choose Install from Git, paste ${REPO_URL}, and install. NaCLip is replaced in place.`,
    detail: 'Installed by copying plugin.js? Replace that file with the new plugin.js instead (Open plugin.js in NaCLip appearance).',
    durationMs: 0,
    placement: 'default'
  })
}

function startUpdateChecks(ctx) {
  if (sdk.IS_PREVIEW) return () => {}
  const later = (fn, ms) => (typeof ctx.setTimeout === 'function' ? ctx.setTimeout(fn, ms) : (id => () => clearTimeout(id))(setTimeout(fn, ms)))
  const every = (fn, ms) => (typeof ctx.setInterval === 'function' ? ctx.setInterval(fn, ms) : (id => () => clearInterval(id))(setInterval(fn, ms)))
  const offs = [later(() => checkForUpdate(), UPDATE_FIRST_CHECK_MS), every(() => checkForUpdate(), UPDATE_INTERVAL_MS)]
  return () => offs.forEach(off => off())
}

function UpdateCard() {
  const info = useValue($update)
  const [checks, setChecks] = useState(() => (pluginCtx ? pluginCtx.storage.get('updateChecks', true) !== false : true))
  const [busy, setBusy] = useState(false)
  const btn = (label, run, props = {}) => element('button', { type: 'button', className: 'skin-button', onClick: run, ...props }, label)
  return element('section', { className: cn('skin-update', info && 'has-update'), 'aria-label': 'NaCLip updates' }, [
    element('div', { key: 'text', className: 'skin-update-text' }, [
      element('strong', { key: 'title' }, info ? `NaCLip ${info.version} is available` : `NaCLip ${VERSION}`),
      info && info.notes.length
        ? element('ul', { key: 'notes' }, info.notes.map((n, i) => element('li', { key: i }, n)))
        : element('p', { key: 'note', className: 'skin-help' }, info ? 'A new version is ready.' : 'Updates are offered here and as a notification when a new version is published.')
    ]),
    element('div', { key: 'actions', className: 'skin-inline-actions' }, [
      info ? btn('Update', () => startUpdate(info), { key: 'update', 'data-primary': true }) : null,
      info ? btn('Open plugin.js', () => pluginCtx && pluginCtx.os.openExternal(PLUGIN_RAW_URL), { key: 'raw' }) : null,
      info ? btn('What’s new', () => pluginCtx && pluginCtx.os.openExternal(info.url), { key: 'notes' }) : null,
      btn(busy ? 'Checking…' : 'Check for updates', async () => { setBusy(true); try { await checkForUpdate({ manual: true }) } finally { setBusy(false) } }, { key: 'check', disabled: busy }),
      element('label', { key: 'auto', className: 'skin-checkbox' }, [
        element('input', { key: 'box', type: 'checkbox', checked: checks, onChange: e => { setChecks(e.target.checked); pluginCtx && pluginCtx.storage.set('updateChecks', e.target.checked) } }),
        element('span', { key: 'label' }, 'Check automatically')
      ])
    ])
  ])
}

// ─────────────────────────────────────────────────────────────────────────────
// ::tandem-sent receipts
// ─────────────────────────────────────────────────────────────────────────────

function SentReceipt({ attrs, streaming }) {
  const to = String(attrs.to || '').slice(0, 120)
  if (!to) return null
  const via = String(attrs.via || '').slice(0, 40)
  const subject = String(attrs.subject || '').slice(0, 160)
  const link = safeHttpUrl(attrs.link)
  const icon = /mail/i.test(via) ? 'Mail' : to.startsWith('#') ? 'Hash' : 'Send'
  return jsxs('div', {
    className: cn('tandem-receipt', streaming && 'opacity-70'),
    children: [
      jsx('span', { className: 'tandem-receipt-glyph', children: jsx(Icon, { name: icon, className: 'size-3.5' }) }),
      jsxs('div', {
        className: 'min-w-0 flex-1',
        children: [
          jsxs('div', {
            className: 'truncate text-sm',
            children: [jsx('span', { className: 'text-(--ui-text-tertiary)', children: 'Sent to ' }), jsx('span', { className: 'font-medium', children: to }), via ? jsx('span', { className: 'text-(--ui-text-tertiary)', children: ` on ${via}` }) : null]
          }),
          subject ? jsx('div', { className: 'truncate text-xs text-(--ui-text-tertiary)', children: subject }) : null
        ]
      }),
      link
        ? jsx(Button, { size: 'sm', variant: 'ghost', onClick: () => pluginCtx && pluginCtx.os.openExternal(link), children: 'Open' })
        : null
    ]
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings card + chrome stylesheet
// ─────────────────────────────────────────────────────────────────────────────

const NAV_TIDY = { hide: ['capabilities', 'messaging', 'artifacts', 'cron', 'command-center'] }
let disposeNavPrefs = () => {}

function applyNavTidy(on) {
  disposeNavPrefs()
  disposeNavPrefs = () => {}
  $navTidy.set(on)
  pluginCtx && pluginCtx.storage.set('navTidy', on)
  if (on && sdk.SIDEBAR_NAV_PREFS_AREA && pluginCtx) {
    disposeNavPrefs = pluginCtx.register({ id: 'nav-prefs', area: sdk.SIDEBAR_NAV_PREFS_AREA, data: NAV_TIDY })
  }
}

function element(tag,props={},children) {const {key,...rest}=props;return (Array.isArray(children)?jsxs:jsx)(tag,{...rest,children},key)}
export function AppearanceSettings() {
 const pack=useValue($appearance),theme=sdk.useTheme?sdk.useTheme():null
 const [draft,setDraft]=useState(pack),[editingMode,setEditingMode]=useState('dark'),[selected,setSelected]=useState(pack.widgets[0].id),[json,setJson]=useState(''),[message,setMessage]=useState(''),[brief,setBrief]=useState(''),[newLabel,setNewLabel]=useState(''),[newKind,setNewKind]=useState('prompt'),[newValue,setNewValue]=useState('')
 useEffect(()=>setDraft(pack),[pack])
 const apply=value=>{try{applyAppearance(value);setMessage('Appearance applied.');return true}catch(e){setMessage(e.message);return false}}
 const changeWidget=patch=>setDraft({...draft,widgets:draft.widgets.map(w=>w.id===selected?{...w,...patch}:w)})
 const reorder=direction=>{const rows=[...draft.widgets],index=rows.findIndex(w=>w.id===selected),next=index+direction;if(next<0||next>=rows.length)return;[rows[index],rows[next]]=[rows[next],rows[index]];setDraft({...draft,widgets:rows})}
 const load=value=>{try{const parsed=parseAppearance(value);setDraft(parsed);setSelected(parsed.widgets[0].id);setMessage(`Previewing ${parsed.name}. Review it below, then Apply appearance.`)}catch(e){setMessage(e.message)}}
 const active=draft.widgets.find(w=>w.id===selected)||draft.widgets[0],dirty=JSON.stringify(pack)!==JSON.stringify(draft)
 const field=(label,control)=>element('label',{className:'skin-field'},[element('span',{},label),control])
 const btn=(label,run,props={})=>element('button',{type:'button',className:'skin-button',onClick:run,...props},label)
 const palette=draft.palette[editingMode]
 return element('section',{className:'skin-appearance','aria-label':SKIN_NAME+' appearance'},[
  element('div',{className:'skin-settings-heading'},[element('h3',{},SKIN_NAME),element('p',{},'Your skin for Hermes. Make the desk yours.')]),
  jsx(UpdateCard,{}),
  element('div',{className:'skin-palette-choices'},PALETTE_PRESETS.map(p=>btn(p.name,()=>apply({...pack,name:p.name,palette:{light:p.light,dark:p.dark}}),{key:p.id,'aria-pressed':pack.name===p.name&&JSON.stringify(pack.palette)===JSON.stringify({light:p.light,dark:p.dark}),children:undefined}))),
  field('Pack name',element('input',{value:draft.name,maxLength:48,onChange:e=>setDraft({...draft,name:e.target.value})})),
  element('div',{className:'skin-section-heading'},[element('h4',{},'Colors'),field('Editing palette',element('select',{value:editingMode,onChange:e=>setEditingMode(e.target.value),'aria-label':'Editing palette'},['light','dark'].map(m=>element('option',{key:m,value:m},m==='light'?'Light':'Dark'))))]),
  element('div',{className:'skin-color-grid'},Object.entries(palette).map(([key,value])=>field(key.charAt(0).toUpperCase()+key.slice(1),element('input',{type:'color',value,'aria-label':key+' color',onInput:e=>setDraft({...draft,palette:{...draft.palette,[editingMode]:{...palette,[key]:e.target.value}}})})))),
  element('div',{className:'skin-section-heading'},element('h4',{},'Widget pack')),
  element('div',{className:'skin-pack-choices'},WIDGET_STYLES.map(style=>btn(style.name,()=>setDraft({...draft,widgetStyle:style.id}),{key:style.id,'aria-pressed':draft.widgetStyle===style.id,title:style.description}))),
  field('Widget shape',element('select',{value:draft.widgetShape,'aria-label':'Widget shape',onChange:e=>setDraft({...draft,widgetShape:e.target.value})},['rounded','circle','square'].map(v=>element('option',{key:v,value:v},v)))),
  element('p',{className:'skin-help'},'Choose a widget to change its name, icon, color, order or visibility. Settings always stays available.'),
  field('Edit widget',element('select',{value:active.id,'aria-label':'Edit widget',onChange:e=>setSelected(e.target.value)},draft.widgets.map(w=>element('option',{key:w.id,value:w.id},w.label)))),
  element('div',{className:'skin-widget-editor'},[
   field('Widget name',element('input',{value:active.label,maxLength:40,'aria-label':'Widget name',onChange:e=>changeWidget({label:e.target.value})})),
   field('Icon',element('select',{value:active.icon,'aria-label':'Widget icon',onChange:e=>changeWidget({icon:e.target.value})},WIDGET_ICONS.map(i=>element('option',{key:i,value:i},i)))),
   field('Widget color',element('input',{type:'color',value:active.color,'aria-label':'Widget color',onInput:e=>changeWidget({color:e.target.value})})),
   element('label',{className:'skin-checkbox'},[element('input',{type:'checkbox',checked:active.visible,disabled:active.id==='settings',onChange:e=>changeWidget({visible:e.target.checked})}),element('span',{},'Show widget')]),
   element('div',{className:'skin-inline-actions'},[btn('Move up',()=>reorder(-1),{disabled:draft.widgets[0].id===active.id}),btn('Move down',()=>reorder(1),{disabled:draft.widgets.at(-1).id===active.id}),active.id.startsWith('custom-')?btn('Remove widget',()=>{const rows=draft.widgets.filter(w=>w.id!==active.id);setDraft({...draft,widgets:rows});setSelected(rows[0].id)}):null])
  ]),
  element('details',{className:'skin-details'},[element('summary',{},'Add a custom widget'),
   field('New widget name',element('input',{value:newLabel,maxLength:40,'aria-label':'New widget name',onChange:e=>setNewLabel(e.target.value)})),
   field('Action',element('select',{value:newKind,'aria-label':'New widget action',onChange:e=>{setNewKind(e.target.value);setNewValue('')}},['prompt','route','link'].map(v=>element('option',{key:v,value:v},v)))),
   field(newKind==='prompt'?'Prompt':newKind==='link'?'Website URL':'Hermes page',newKind==='route'?element('select',{value:newValue,'aria-label':'New widget value',onChange:e=>setNewValue(e.target.value)},[element('option',{value:''},'Choose a page'),...ALLOWED_ROUTES.map(v=>element('option',{key:v,value:v},v))]):element('textarea',{value:newValue,'aria-label':'New widget value',maxLength:4096,onChange:e=>setNewValue(e.target.value)})),
   btn('Add widget',()=>{const next={...draft,widgets:[...draft.widgets,{id:'custom-'+crypto.randomUUID(),label:newLabel,icon:newKind==='prompt'?'Send':newKind==='link'?'ExternalLink':'LayoutDashboard',color:palette.accent,visible:true,kind:newKind,value:newValue}]};try{const parsed=parseAppearance(next);setDraft(parsed);setSelected(parsed.widgets.at(-1).id);setNewLabel('');setNewValue('');setMessage('Widget added to this draft. Apply appearance to show it.')}catch(e){setMessage(e.message)}},{disabled:!newLabel.trim()||!newValue.trim()||draft.widgets.length>=20})
  ]),
  element('div',{className:'skin-apply-row'},[btn('Apply appearance',()=>apply(draft),{'data-primary':true}),btn('Reset appearance',()=>{apply(DEFAULT_APPEARANCE);setSelected(DEFAULT_APPEARANCE.widgets[0].id)}),element('span',{},dirty?'Unsaved changes':'Saved')]),
  element('details',{className:'skin-details'},[element('summary',{},'Import or export a pack'),element('p',{className:'skin-help'},'Share a palette and widget layout as JSON. Import loads a review draft; it does not apply automatically.'),
   element('textarea',{className:'skin-json','aria-label':'Appearance pack JSON',value:json,onChange:e=>setJson(e.target.value),placeholder:'Paste a theme or widget pack…',maxLength:50000}),
   element('div',{className:'skin-inline-actions'},[btn('Preview pack',()=>load(json),{disabled:!json.trim()}),btn('Export pack',()=>{setJson(JSON.stringify(pack,null,2));setMessage('Pack ready. Copy it or save the JSON as a .json file.')}),btn('Copy JSON',async()=>{try{if(!json.trim())return;const ok=pluginCtx&&await pluginCtx.os.writeClipboard(json);setMessage(ok?'JSON copied.':'Copy the JSON from the field.')}catch{setMessage('Copy the JSON from the field.')}},{disabled:!json.trim()})]),
   field('Choose pack file',element('input',{type:'file',accept:'.json,application/json','aria-label':'Choose appearance pack file',onChange:async e=>{const file=e.target.files[0];if(!file)return;if(file.size>50000){setMessage('Appearance packs must be smaller than 50 KB.');return}const text=await file.text();setJson(text);load(text);e.target.value=''}}))
  ]),
  element('div',{className:'skin-agent-theme'},[element('h4',{},'Create with your agent'),element('p',{className:'skin-help'},'Describe a look. We draft the request in your current chat so you can review and send it. Import the returned pack above.'),field('Theme brief',element('textarea',{'aria-label':'Theme brief',value:brief,placeholder:'A calm ocean workspace with teal accents and quiet icons…',maxLength:2000,onChange:e=>setBrief(e.target.value)})),btn('Draft theme request',async()=>{try{await draftAppearancePrompt(brief);setMessage('Theme request added to your chat draft.')}catch(e){setMessage(e.message)}},{disabled:!brief.trim()})]),
  element('p',{className:'skin-settings-status',role:'status'},message)
 ])
}
function SettingsCard(){return jsx(AppearanceSettings,{})}

const CHROME_CSS = `
.skin-collapsed-rail,.skin-expanded-rail{display:flex;flex-direction:column;gap:8px;padding:8px;background:var(--ui-bg-sidebar);color:var(--ui-text-primary)}
.skin-collapsed-rail{height:100%;width:100%;position:relative}.skin-expanded-rail{position:fixed;inset:auto;margin:0;width:214px;border:0;border-right:1px solid var(--ui-stroke-secondary);box-shadow:12px 0 28px #0002;overflow:hidden}
.skin-expanded-rail[data-side='right']{border-right:0;border-left:1px solid var(--ui-stroke-secondary);box-shadow:-12px 0 28px #0002}.skin-expanded-rail[data-side='right'] .skin-rail-expand{justify-content:flex-end}
.skin-expanded-rail:not(:popover-open){display:none}.skin-expanded-rail::backdrop{background:transparent;pointer-events:none}
.skin-rail-expand{display:flex;align-items:center;justify-content:center;min-height:44px;flex:none;border-radius:8px;font-size:20px;color:var(--ui-text-secondary)}.skin-expanded-rail .skin-rail-expand{justify-content:flex-start;font-size:12px;padding:0 12px}.skin-rail-expand:hover{background:var(--ui-bg-elevated)}
.skin-widget-list{display:flex;flex-direction:column;align-items:stretch;gap:8px;overflow:auto;overflow-x:hidden;flex:1;min-height:0;padding:3px 2px;scrollbar-width:thin}.skin-widget-list>span{display:block}
.skin-rail-settings{display:flex;flex-direction:column;gap:8px}.skin-rail-settings>span{display:block}.skin-appearance-workspace,.skin-computer-workspace{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--ui-bg);color:var(--ui-text-primary)}
.skin-workspace-header{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px 8px 20px;border-bottom:1px solid var(--ui-stroke-secondary);background:var(--ui-bg-elevated)}
.skin-workspace-header strong{font-size:14px;line-height:1.4}
.skin-workspace-close{flex:none;width:44px;height:44px;display:grid;place-items:center;border:1px solid var(--ui-stroke-secondary);border-radius:10px;background:var(--ui-bg);color:var(--ui-text-primary);cursor:pointer;font-size:28px;line-height:1}
.skin-workspace-close:hover{background:var(--ui-bg-hover);border-color:var(--ui-accent)}
.skin-workspace-close:focus-visible{outline:2px solid var(--ui-accent);outline-offset:2px}
.skin-workspace-body{flex:1;min-height:0;overflow:auto;padding:24px;display:flex;flex-direction:column;gap:20px}
.skin-computer-workspace-body{flex:1;min-height:0;overflow:auto}
@media(max-width:700px){.skin-workspace-body{padding:16px}.skin-workspace-header{padding-left:16px}}
.skin-rail-item{display:flex;align-items:center;gap:11px;flex:none;min-height:44px;padding:0 2px;width:48px;border-radius:9px;text-align:left;color:var(--ui-text-primary)}.skin-rail-item.with-label{width:100%;padding:0 2px}.skin-widget-label{font-size:12px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.skin-rail-item .tandem-tile{flex:none;color:var(--tile-ink)}.skin-rail-item.with-label:hover{background:var(--ui-bg-elevated)}.skin-rail-item.is-active .tandem-tile{box-shadow:0 0 0 2px var(--ui-accent)}.skin-rail-item:focus-visible,.skin-rail-expand:focus-visible{outline:2px solid var(--ui-accent);outline-offset:-1px}
[data-style='outline'] .tandem-tile{background:transparent;color:var(--ui-text-secondary);border:1px solid var(--ui-stroke-secondary);box-shadow:none}[data-style='outline'] .is-active .tandem-tile{color:var(--ui-accent)}[data-style='mono'] .tandem-tile{background:var(--ui-accent);color:var(--skin-accent-ink,#fff);box-shadow:none}[data-shape='circle'] .tandem-tile{border-radius:50%}[data-shape='square'] .tandem-tile{border-radius:4px}
.skin-appearance{font-size:12px;display:flex;flex-direction:column;gap:14px;max-width:760px}.skin-settings-heading h3{font-size:19px;margin:0}.skin-settings-heading p,.skin-help{font-size:12px;line-height:1.6;color:var(--ui-text-secondary);margin:6px 0}.skin-palette-choices,.skin-pack-choices,.skin-inline-actions,.skin-apply-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.skin-button{min-height:44px;padding:8px 14px;border:1px solid var(--ui-stroke-secondary);border-radius:8px;color:var(--ui-text-primary);background:var(--ui-bg)}.skin-button[aria-pressed='true']{border-color:var(--ui-accent);box-shadow:inset 0 0 0 1px var(--ui-accent)}.skin-button:hover{background:var(--ui-bg-elevated)}.skin-button[data-primary]{background:var(--ui-accent);color:var(--skin-accent-ink,#fff)}.skin-button:focus-visible{outline:2px solid var(--ui-accent)}.skin-button:disabled{opacity:.45;cursor:default}
.skin-field{display:flex;flex-direction:column;gap:7px;min-width:0;color:var(--ui-text-secondary)}.skin-field input,.skin-field select,.skin-field textarea,.skin-json{width:100%;max-width:none;min-width:0;min-height:44px;padding:9px 10px;border:1px solid var(--ui-stroke-secondary);border-radius:7px;color:var(--ui-text-primary);background:var(--ui-bg)}.skin-field textarea{min-height:85px;resize:vertical}.skin-field input[type=color]{height:44px;padding:4px;cursor:pointer}.skin-section-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--ui-stroke-secondary);padding-top:16px}.skin-section-heading h4,.skin-agent-theme h4{font-size:14px;font-weight:600;margin:0}.skin-section-heading .skin-field{min-width:120px;font-size:10px}.skin-color-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.skin-widget-editor{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.skin-widget-editor .skin-inline-actions{grid-column:1/-1}.skin-checkbox{display:flex;align-items:center;gap:8px;min-height:44px}.skin-checkbox input{width:18px;height:18px;accent-color:var(--ui-accent)}.skin-details{border-top:1px solid var(--ui-stroke-secondary);padding:10px 0}.skin-details summary{min-height:44px;cursor:pointer;align-content:center;font-weight:500}.skin-details[open]{display:flex;flex-direction:column;gap:12px}.skin-json{font:11px/1.6 ui-monospace,monospace;min-height:170px;resize:vertical}.skin-apply-row{padding:12px 0;border-top:1px solid var(--ui-stroke-secondary)}.skin-apply-row>span{font-size:10px;color:var(--ui-text-tertiary)}.skin-settings-status{font-size:12px;line-height:1.6;color:var(--ui-text-secondary);min-height:20px}.skin-agent-theme{border-top:1px solid var(--ui-stroke-secondary);padding-top:20px;display:flex;flex-direction:column;gap:10px}
@media(max-width:700px){.skin-collapsed-rail{padding:8px 5px}.skin-expanded-rail{width:214px}.skin-color-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.skin-widget-editor{grid-template-columns:1fr}.skin-section-heading{flex-wrap:wrap}.skin-appearance{gap:12px}.skin-button{padding:8px 10px}}

/* Layout guard (see startLayoutGuard): fixed NaCLip strips have no seam, and
   other vertical seams start below the titlebar so they never cross the window
   controls. */
[data-naclip-sash='locked']{display:none!important}
[data-naclip-sash='below-titlebar']{top:${TITLEBAR_BAND_PX}px!important}
/* Hermes's sidebar glass paints from the left edge only; follow the sidebar. */
html:root[data-hermes-glass][data-hermes-glass-scope='sidebar'][data-naclip-sidebar-side='left'] body{background:linear-gradient(to right,color-mix(in srgb,var(--ui-bg-chrome) var(--translucency-glass-keep,100%),transparent) var(--naclip-glass-edge,0px),var(--ui-bg-chrome) var(--naclip-glass-edge,0px))}
html:root[data-hermes-glass][data-hermes-glass-scope='sidebar'][data-naclip-sidebar-side='right'] body{background:linear-gradient(to left,color-mix(in srgb,var(--ui-bg-chrome) var(--translucency-glass-keep,100%),transparent) var(--naclip-glass-edge,0px),var(--ui-bg-chrome) var(--naclip-glass-edge,0px))}
.tandem-tile{position:relative}.skin-update-dot{position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:var(--ui-accent);box-shadow:0 0 0 2px var(--ui-bg-sidebar,var(--ui-bg))}
.skin-update{display:flex;flex-direction:column;gap:10px;padding:12px 14px;border:1px solid var(--ui-stroke-secondary);border-radius:10px;background:var(--ui-bg-elevated)}.skin-update.has-update{border-color:var(--ui-accent);box-shadow:inset 0 0 0 1px var(--ui-accent)}.skin-update strong{font-size:13px}.skin-update ul{margin:6px 0 0;padding-left:18px;line-height:1.6;color:var(--ui-text-secondary)}
.tandem-theme-toggle { display:grid;place-items:center;width:44px;height:44px;border-radius:10px;color:var(--ui-text-secondary); }
.tandem-theme-toggle:hover { background:var(--ui-bg-elevated); }
.tandem-theme-toggle:focus-visible { outline:2px solid var(--ui-accent); }
.tandem-rail { background: var(--ui-bg-sidebar, transparent); }
/* Cosmetic treatment of core SearchField. Its React events and native search remain intact. */
html[data-naclip-page="capabilities"] .inline-flex:has(> svg + input[aria-label]) {
  opacity:1;min-height:44px;padding:6px 12px;border:1px solid var(--ui-stroke-secondary);border-radius:12px;
  background:var(--ui-bg-elevated);color:var(--ui-text-primary);
}
html[data-naclip-page="capabilities"] .inline-flex:has(> svg + input[aria-label]):focus-within {outline:2px solid var(--ui-accent);outline-offset:2px}
html[data-naclip-page="capabilities"] .inline-flex > svg + input[aria-label] {font-size:13px;color:var(--ui-text-primary)}
.tandem-tile {
  display: grid; place-items: center; width: 44px; height: 44px; border-radius: 11px;
  color: #fff; background: var(--tile);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .22), inset 0 -1px 0 rgb(0 0 0 / .18);
  transition: transform .12s ease, box-shadow .12s ease;
}
.tandem-tile:hover { transform: translateY(-1px); }
.tandem-tile:focus-visible { outline: 2px solid var(--ui-accent); outline-offset: 2px; }
.tandem-tile.is-active { box-shadow: 0 0 0 2px var(--ui-accent), inset 0 1px 0 rgb(255 255 255 / .22); }
.tandem-dock { scrollbar-width: none; }
.tandem-chip {
  display: inline-flex; flex: none; align-items: center; gap: 8px; height: 44px; max-width: 220px;
  padding: 0 14px 0 8px; border-radius: 10px; font-size: .8125rem;
  color: var(--ui-text-secondary); border: 1px solid var(--ui-stroke-secondary);
  background: color-mix(in oklab, var(--ui-text-secondary) 5%, transparent);
}
.tandem-chip:hover { color: var(--ui-text-primary, inherit); background: color-mix(in oklab, var(--ui-text-secondary) 10%, transparent); }
.tandem-chip:focus-visible { outline: 2px solid var(--ui-accent); outline-offset: 1px; }
.tandem-chip-add { padding: 0 10px; color: var(--ui-text-tertiary); }
.tandem-chip-glyph { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 6px; color: #fff; background: var(--tile); }
.tandem-bezel {
  border-radius: 18px; padding: 14px;
  background: radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, var(--ui-accent) 85%, white 15%), var(--ui-accent) 60%, color-mix(in oklab, var(--ui-accent) 70%, black 30%));
}
.tandem-glass { border-radius: 8px; overflow: hidden; background: color-mix(in oklab, var(--ui-accent) 18%, black 82%); }
.tandem-glass .tandem-screen-notice>div:first-child{color:#E9EEF9}.tandem-glass .tandem-screen-notice>div:nth-child(2){color:#B7C2D6}
.tandem-takeover { background: #fff !important; color: #111 !important; }
.tandem-receipt {
  display: flex; align-items: center; gap: 10px; max-width: 30rem; padding: 10px 12px; border-radius: 14px;
  border: 1px solid var(--ui-stroke-secondary); background: color-mix(in oklab, var(--ui-text-secondary) 5%, transparent);
}
.tandem-receipt-glyph { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; color: #fff; background: var(--ui-accent); }
@media (prefers-reduced-motion: reduce) { .tandem-tile { transition: none; } .tandem-tile:hover { transform: none; } }
`

function ChromeStyles() {
 const pack=useValue($appearance),theme=sdk.useTheme?sdk.useTheme():null,route=useHashRoute()
 const dark=theme&&(theme.renderedMode||theme.resolvedMode||theme.mode)==='dark'
 useEffect(()=>{
  const root=document.documentElement,p=pack.palette[dark?'dark':'light'];root.style.setProperty('--skin-accent-ink',readableInk(p.accent))
  if(sdk.IS_PREVIEW){const vars={'--ui-bg':p.background,'--ui-bg-sidebar':p.sidebar,'--ui-bg-elevated':p.surface,'--ui-text-primary':p.text,'--ui-text-secondary':p.secondary,'--ui-text-tertiary':p.secondary,'--ui-text-quaternary':p.secondary,'--ui-stroke-secondary':p.border,'--ui-accent':p.accent};for(const [k,v] of Object.entries(vars))root.style.setProperty(k,v)}
 },[pack,dark])
 return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Registration
// ─────────────────────────────────────────────────────────────────────────────

export default {
  id: ID,
  name: 'NaCLip',
  register(ctx) {
    pluginCtx = ctx
    // Core settings hides the titlebar slot; styles belong to plugin lifetime.
    const stylesheet = document.createElement('style')
    stylesheet.dataset.naclip = VERSION
    stylesheet.textContent = CHROME_CSS
    document.head.appendChild(stylesheet)
    const markPage = () => {
      if (!sdk.IS_PREVIEW) document.documentElement.dataset.naclipPage = window.location.hash.replace(/^#\//,'').split('?')[0]
    }
    markPage()
    window.addEventListener('hashchange',markPage)
    const stored = ctx.storage.get('chips', null)
    $chips.set(Array.isArray(stored) ? stored : DEFAULT_CHIPS)
    try {$appearance.set(parseAppearance(ctx.storage.get('appearance',DEFAULT_APPEARANCE)))}catch {$appearance.set(DEFAULT_APPEARANCE)}
    $railExpanded.set(!!ctx.storage.get('railExpanded',false))
    registerAppearanceTheme($appearance.get())

    const contributions = [
      // A title-bar slot stays mounted across every page, so it owns the stylesheet.
      { id: 'styles', area: sdk.TITLEBAR_AREAS ? sdk.TITLEBAR_AREAS.right : 'titlebar.right', order: 999, render: () => jsxs(Fragment, { children: [jsx(ChromeStyles, {}), jsx(ThemeToggle, {})] }) },
      { id: 'theme', area: sdk.THEMES_AREA || 'themes', data: {...TANDEM_THEME,label:SKIN_NAME+' · Classic'} },
      {
        id: 'rail',
        area: 'panes',
        title: 'Rail',
        // Fixed strip: min = max = width, so no seam can stretch it across the window.
        data: { placement: 'left', dock: { pane: 'sessions', pos: 'left' }, width: '64px', minWidth: '64px', maxWidth: '64px' },
        render: () => jsx(Rail, {})
      },
      {
        id: 'computer',
        area: 'panes',
        title: 'Computer',
        data: { placement: 'right', dock: { pane: 'workspace', pos: 'right' }, width: '520px' },
        render: () => jsx(ComputerPane, {})
      },
      {
        id: 'dock',
        area: 'panes',
        title: 'Dock',
        // Fixed strip: a free height let the dock seam drag the chips mid-window.
        data: { placement: 'bottom', dock: { pane: 'workspace', pos: 'bottom' }, height: '56px', minHeight: '56px', maxHeight: '56px' },
        render: () => jsx(Dock, {})
      },
      { id: 'open-computer', area: sdk.PALETTE_AREA, data: { id: 'tandem.open-computer', label: 'NaCLip: Open agent’s computer', keywords: ['screen', 'vm', 'computer'], run: openComputer } },
      { id: 'check-update', area: sdk.PALETTE_AREA, data: { id: 'naclip.check-update', label: 'NaCLip: Check for updates', keywords: ['update', 'version', 'upgrade'], run: () => checkForUpdate({ manual: true }) } },
      { id: 'open-appearance', area: sdk.PALETTE_AREA, data: { id:'naclip.open-appearance',label:'NaCLip: Customize appearance',keywords:['settings','theme','widgets','packs'],run:openAppearance } },
      {
        id: 'use-theme',
        area: sdk.PALETTE_AREA,
        data: {
          id: 'tandem.use-theme',
          label: 'NaCLip: Use theme',
          keywords: ['theme', 'appearance'],
          run: () => { if (!sdk.requestTheme || !sdk.requestTheme('naclip-custom')) host.notify({ kind: 'info', message: 'Pick NaCLip in Settings → Appearance.' }) }
        }
      }
    ]

    if (sdk.TRANSCRIPT_DIRECTIVE_AREA) {
      contributions.push({ id: 'sent', area: sdk.TRANSCRIPT_DIRECTIVE_AREA, data: { name: 'tandem-sent', render: props => jsx(SentReceipt, props) } })
    }
    if (sdk.APPEARANCE_AREAS) {
      contributions.push({ id: 'settings', area: sdk.APPEARANCE_AREAS.extra, render: () => jsx(SettingsCard, {}) })
    }

    ctx.registerMany(contributions.filter(c => c.area))
    applyNavTidy(true)
    const stopLayoutGuard = startLayoutGuard(ctx)
    const stopUpdateChecks = startUpdateChecks(ctx)

    ctx.onDispose(() => {
      stylesheet.remove()
      window.removeEventListener('hashchange',markPage)
      if (!sdk.IS_PREVIEW) delete document.documentElement.dataset.naclipPage
      document.documentElement.style.removeProperty('--skin-accent-ink')
      closeAppearanceWorkspace?.()
      closeAppearanceWorkspace = null
      closeComputerWorkspace?.()
      closeComputerWorkspace = null
      $computerWorkspaceOpen.set(false)
      stopLayoutGuard()
      stopUpdateChecks()
      $update.set(null)
      disposeNavPrefs()
      disposeCustomTheme()
      $railExpanded.set(false)
      $viewer.set(null)
      pluginCtx = null
    })
  }
}
