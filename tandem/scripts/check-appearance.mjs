import {readFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const source=await readFile(new URL('../../plugin.js',import.meta.url),'utf8')
const code=source.split('// --- appearance:begin ---')[1].split('// --- appearance:end ---')[0]
const skin=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))
const clone=v=>JSON.parse(JSON.stringify(v))
for(const p of skin.PALETTE_PRESETS) {
 const parsed=skin.parseAppearance({...skin.DEFAULT_APPEARANCE,name:p.name,palette:{light:p.light,dark:p.dark}})
 assert.equal(parsed.name,p.name)
 for(const mode of ['light','dark'])assert(skin.contrastRatio(parsed.palette[mode].text,parsed.palette[mode].surface)>=4.5)
}
const pack=clone(skin.DEFAULT_APPEARANCE)
pack.widgets.push({id:'custom-focus',label:'Daily brief',icon:'Briefcase',color:'#3366FF',visible:true,kind:'prompt',value:'Draft a daily plan.'})
assert.equal(skin.parseAppearance(JSON.stringify(pack)).widgets.at(-1).kind,'prompt')
assert.equal(skin.parseAppearance(JSON.stringify(pack)).widgets[0].id,'new')
assert(skin.appearancePrompt('Quiet ocean',pack).includes('Quiet ocean'))
assert(skin.appearancePrompt('Quiet ocean',pack).includes('Do not change provider'))
const invalids=[
 {...pack,provider:'openai'},
 {...pack,palette:{...pack.palette,dark:{...pack.palette.dark,background:'#FFFFFF'}}},
 {...pack,widgets:pack.widgets.map((w,i)=>i===0?{...w,kind:'link',value:'https://example.com'}:w)},
 {...pack,widgets:[...pack.widgets,{...pack.widgets[0]}]},
 {...pack,widgets:[{id:'custom-bad',label:'Bad',icon:'Plus',color:'#3366FF',visible:true,kind:'link',value:'javascript:alert(1)'}]},
 {...pack,widgets:[{id:'custom-bad',label:'Bad',icon:'Plus',color:'#3366FF',visible:true,kind:'link',value:'https://secret:password@example.com'}]},
 {...pack,widgets:[{id:'custom-bad',label:'Bad',icon:'Plus',color:'#3366FF',visible:true,kind:'route',value:'/api/delete-all'}]},
 {...pack,widgets:pack.widgets.map(w=>({...w,visible:false}))},
 {...pack,widgets:pack.widgets.map(w=>w.id==='settings'?{...w,visible:false}:w)}
]
for(const input of invalids)assert.throws(()=>skin.parseAppearance(input))
assert.throws(()=>skin.parseAppearance('x'.repeat(50001)))
console.log('PASS: three light/dark palettes, JSON round trip, scoped prompt schema, and rejection of executable links, embedded credentials, arbitrary routes, low contrast, duplicate ids, hidden Settings, and unknown fields.')
export {skin}
