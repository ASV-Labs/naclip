import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const source=readFileSync(new URL('../../plugin.js',import.meta.url),'utf8')
const body=source.slice(source.indexOf('async function routeFor(profile) {'),source.indexOf('function useFocusedOwnerKey'))
const routes=[{connectionId:'local',profile:'vision',targetProfile:'vision'},{connectionId:'remote',profile:'vision',targetProfile:'vision'}]
const make=host=>new Function('host',`${body};return routeFor`)(host)
const host={profileRoutes:async()=>routes,state:{focusedSessionOwner:{get:()=>({connectionId:'remote',profile:'vision'})}}}
assert.equal((await make(host)('vision')).connectionId,'remote')
await assert.rejects(make({...host,state:{}})('vision'),/owning Hermes instance/)
await assert.rejects(make({...host,state:{focusedSessionOwner:{get:()=>null}}})('vision'),/unambiguous connection owner/)
await assert.rejects(make({...host,profileRoutes:async()=>[routes[0]]})('vision'),/connection is unavailable/)
await assert.rejects(make({...host,profileRoutes:async()=>{throw Error('registry offline')}})('vision'),/registry offline/)
console.log('PASS: owner-qualified routing, ambiguous-owner refusal, missing-route refusal, and failed-read refusal')
