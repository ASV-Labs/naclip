import {createRequire} from 'node:module'
import {stat,chmod,realpath} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
// node-pty 1.1.0's macOS prebuilt spawn-helper is published without its execute bit.
// Limit the repair to that official dependency's helper, preserving all other mode bits.
export async function prepareTerminal(){
 if(process.platform!=='darwin')return
 const require=createRequire(import.meta.url)
 const root=await realpath(path.dirname(require.resolve('node-pty/package.json')))
 for(const folder of ['build/Release','build/Debug','prebuilds/darwin-'+process.arch]){
  const helper=path.join(root,folder,'spawn-helper')
  let info;try{info=await stat(helper)}catch(error){if(error.code==='ENOENT')continue;throw error}
  const resolved=await realpath(helper)
  if(!resolved.startsWith(root+path.sep)||!info.isFile())throw Error('Invalid node-pty helper path.')
  if(!(info.mode&0o100))await chmod(resolved,info.mode|0o100)
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await prepareTerminal()
