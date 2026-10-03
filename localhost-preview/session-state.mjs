// Local preview lifecycle only. No Hermes RPCs or native storage access.
export const contextKey = s => `${s.instance}::${s.profile}::${s.chatId}`
export const sessionName = id => id === 'session-1' ? 'Trying NaCLip' : 'New conversation'

export function saveCurrent(s) {
  return {...s.contexts, [contextKey(s)]: {...s.contexts[contextKey(s)],
    draft:s.draft, messages:s.messages, attachments:s.attachments}}
}

export function sessionRows(s, archived = false) {
  const prefix = `${s.instance}::${s.profile}::`
  const ids = new Set(['session-1', s.chatId,
    ...Object.keys(s.contexts || {}).filter(k=>k.startsWith(prefix)).map(k=>k.slice(prefix.length)),
    ...Object.keys(s.sessionMeta || {}).filter(k=>k.startsWith(prefix)).map(k=>k.slice(prefix.length))])
  return [...ids].filter(id=>id.startsWith('session-')).map(id=>({
    id, name:sessionName(id), ...(s.sessionMeta?.[prefix+id] || {})
  })).filter(row=>!row.deleted && Boolean(row.archived)===archived)
}

export function applySessionAction(s, target, action, newId = ()=>`session-${crypto.randomUUID()}`) {
  if (!['archive','restore','delete'].includes(action) || !target.chatId.startsWith('session-'))
    throw new Error('Only regular preview sessions support lifecycle actions')
  const key = contextKey(target)
  const next = {...s, contexts:saveCurrent(s), sessionMeta:{...s.sessionMeta}}
  if (next.sessionMeta[key]?.deleted) return s
  if (action==='delete') {
    delete next.contexts[key]
    // Tombstone prevents the implicit starter chat from reappearing after reload.
    next.sessionMeta[key] = {deleted:true}
  } else next.sessionMeta[key] = {...next.sessionMeta[key], archived:action==='archive'}
  if (contextKey(s)===key && action!=='restore') {
    next.chatId = sessionRows(next)[0]?.id || newId()
    const restored = next.contexts[contextKey(next)] || {}
    Object.assign(next,{draft:restored.draft || '',messages:restored.messages || [],
      attachments:restored.attachments || [],panel:null,route:'/',mode:'sessions'})
  }
  return next
}

export function snapshot(s) {
  return {instance:s.instance,profile:s.profile,chatId:s.chatId,mode:s.mode,
    contexts:saveCurrent(s),sessionMeta:s.sessionMeta,dark:s.dark}
}
