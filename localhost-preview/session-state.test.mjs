import test from 'node:test'
import assert from 'node:assert/strict'
import {applySessionAction,sessionRows,contextKey,snapshot} from './session-state.mjs'
const initial = ()=>({instance:'local',profile:'vision',chatId:'session-1',draft:'Keep this draft',
  messages:[{role:'user',text:'Keep this message'}],attachments:['sample.txt'],
  contexts:{'openai::vision::session-1':{draft:'Cloud draft'},'local::research::session-1':{draft:'Research draft'}},sessionMeta:{}})
test('archive preserves content, excludes active list, and restore returns it',()=>{
  const s=initial(),archived=applySessionAction(s,s,'archive',()=> 'session-new')
  assert.equal(archived.chatId,'session-new')
  assert.equal(archived.draft,'')
  assert.equal(archived.contexts[contextKey(s)].draft,s.draft)
  assert.deepEqual(archived.contexts[contextKey(s)].messages,s.messages)
  assert.deepEqual(sessionRows(archived,true).map(r=>r.id),['session-1'])
  const restored=applySessionAction(archived,s,'restore')
  assert(sessionRows(restored).some(r=>r.id==='session-1'))
  assert.deepEqual(sessionRows(restored,true),[])
})
test('same session id in another instance or profile remains untouched',()=>{
  const s=initial(),next=applySessionAction(s,s,'delete',()=> 'session-new')
  assert.deepEqual(next.contexts['openai::vision::session-1'],s.contexts['openai::vision::session-1'])
  assert.deepEqual(next.contexts['local::research::session-1'],s.contexts['local::research::session-1'])
  assert(sessionRows({...next,instance:'openai'}).some(r=>r.id==='session-1'))
})
test('delete removes content permanently from persisted snapshot and cannot resurrect starter row',()=>{
  const s=initial(),next=applySessionAction(s,s,'delete',()=> 'session-new')
  const persisted=JSON.parse(JSON.stringify(snapshot(next)))
  assert.equal(persisted.contexts[contextKey(s)],undefined)
  assert.equal(sessionRows({...next,...persisted}).some(r=>r.id==='session-1'),false)
  assert.equal(applySessionAction(next,s,'restore'),next)
})
test('deleting a background session retains current bot chat and rejects bot deletion',()=>{
  const s={...initial(),chatId:'bot-chat'},target={...s,chatId:'session-1'}
  assert.equal(applySessionAction(s,target,'delete').chatId,'bot-chat')
  assert.throws(()=>applySessionAction(s,s,'delete'),/regular preview sessions/)
})
