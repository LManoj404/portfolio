// Standalone Express server — same API as the Vite middleware, plus static
// hosting of the production build. For LOCAL development `npm run dev` is the
// primary command (vite serves both pages and /api); this server is for real
// hosting and for `npm run server` (runs side-by-side with vite at :8787).
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { apiHandler } from './api.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.env.PORT || 8787)
const DIST = path.join(ROOT, 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary', '.wasm': 'application/wasm',
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) return apiHandler(req, res)
  // Static files (index.html fallback for SPA routes)
  let p = path.normalize(path.join(DIST, req.url.split('?')[0]))
  if (!p.startsWith(DIST)) { res.statusCode = 403; return res.end('forbidden') }
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(DIST, 'index.html')
  try {
    const ext = path.extname(p)
    res.statusCode = 200
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
    fs.createReadStream(p).pipe(res)
  } catch {
    res.statusCode = 404
    res.end('not found')
  }
})

server.listen(PORT, () => {
  console.log(`\n  Manoj portfolio API + static server → http://localhost:${PORT}`)
  console.log(`  (serving ${fs.existsSync(DIST) ? 'dist/ build' : 'no dist yet — run npm run build first'})`)
})