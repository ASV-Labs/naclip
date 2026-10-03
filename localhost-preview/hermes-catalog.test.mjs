import test from 'node:test'
import assert from 'node:assert/strict'
import {filterCatalog,settingsSections,settingsRoute,resolveSettings} from './hermes-catalog.mjs'

const rows=[
 {id:'files',name:'Files',description:'Read and patch documents',tools:['read_file'],category:'Development',source:'Built In',enabled:true},
 {id:'search',name:'Search',description:'Read web pages',tools:['web_search'],category:'Web',source:'Plugin',enabled:false},
 {id:'code',name:'Code',description:'Execute scripts',tools:['execute_code'],category:'Development',source:'Plugin',enabled:false}
]
test('search matches tool names and requires all query terms',()=>{
 assert.deepEqual(filterCatalog(rows,{query:'READ_FILE documents'}).map(r=>r.id),['files'])
 assert.equal(filterCatalog(rows,{query:'read_file web'}).length,0)
})
test('category, source and status filters combine without mutating inventory',()=>{
 const before=JSON.stringify(rows)
 assert.deepEqual(filterCatalog(rows,{category:'Development',source:'Plugin',status:'disabled'}).map(r=>r.id),['code'])
 assert.equal(filterCatalog(rows,{category:'Development',source:'Plugin',status:'enabled'}).length,0)
 assert.equal(filterCatalog(rows).length,rows.length)
 assert.equal(JSON.stringify(rows),before)
})
test('each settings child round-trips through its own deep-link parameter',()=>{
 for(const section of settingsSections)for(const page of section.children){const decoded=resolveSettings(settingsRoute(section,page.id));assert.equal(decoded.section.id,section.id);assert.equal(decoded.page.id,page.id)}
 assert.equal(resolveSettings('/settings?tab=connections').section.id,'gateway')
 assert.equal(resolveSettings('/settings?tab=invalid').section.id,'config:appearance')
})
