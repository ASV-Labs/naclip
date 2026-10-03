import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import localWorkspace from './local/workspace-server.mjs'
import { fileURLToPath } from 'node:url'
export default defineConfig({plugins:[tailwindcss(),localWorkspace()],resolve:{dedupe:['react','react-dom'],alias:{'@hermes/plugin-sdk':fileURLToPath(new URL('./sdk.jsx',import.meta.url))}},server:{fs:{allow:['..']}}})
