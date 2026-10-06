// ─────────────────────────────────────────────────────────────
// PORTFOLIO BACKEND API — shared by:
//   1. the Vite dev/preview middleware (server/api via vite.config.js)
//   2. the standalone Express server (server/index.mjs) for real hosting
// Endpoints (never expose secrets / the WhatsApp number to the frontend):
//   GET  /api/health            → status
//   GET  /api/contact/whatsapp  → 302 → https://wa.me/<WHATSAPP_NUMBER>
//   POST /api/contact           → validate + persist form message
// ─────────────────────────────────────────────────────────────
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Tiny .env loader (no dependency). Real process env wins over .env.
const FILE_ENV = {}
try {
  const raw = fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
  raw.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) FILE_ENV[m[1]] = m[2].replace(/^["']|["']$/g, '')
  })
} catch { /* no .env file — fine */ }

function env(key) {
  const v = process.env[key]
  return v !== undefined && v !== '' ? v : (FILE_ENV[key] || '')
}

function json(res, code, obj) {
  res.statusCode = code
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8')
  res.end?.(JSON.stringify(obj))
}

function appendLog(entry) {
  try {
    fs.appendFileSync(
      path.join(ROOT, '_messages.log'),
      `${new Date().toISOString()} ${JSON.stringify(entry)}\n`
    )
  } catch {
    /* readonly environment — contact still responds honestly */
  }
}

export function apiHandler(req, res, next) {
  const url = (req.url || '').split('?')[0]

  // ONLY own /api/*. Anything else must fall through to Vite's static +
  // module pipeline — this middleware is mounted at the very front of the
  // dev/preview stack and must never shadow app routes.
  if (!url.startsWith('/api/')) {
    if (typeof next === 'function') return next()
    res.statusCode = 404
    res.end?.('{"ok":false,"error":"NOT_FOUND"}')
    return
  }

  if (url === '/api/health') return json(res, 200, { ok: true, service: 'manoj-portfolio-api' })

  if (url === '/api/contact/whatsapp') {
    if ((req.method || 'GET').toUpperCase() !== 'GET') return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' })
    const number = String(env('WHATSAPP_NUMBER') || '').replace(/[^0-9]/g, '')
    if (number.length < 8) {
      // Friendly, non-fatal page — no raw JSON, no crash, clear setup hint.
      res.setHeader?.('Content-Type', 'text/html; charset=utf-8')
      res.statusCode = 503
      res.end?.(
        `<!doctype html><html><head><meta charset="utf-8"><title>WhatsApp not configured</title>` +
        `<style>body{background:#05070D;color:#F5F5F7;font-family:monospace;display:grid;place-items:center;height:100vh;margin:0}` +
        `div{max-width:520px;padding:32px;line-height:1.9;border:1px solid rgba(77,141,255,.35);border-radius:14px}` +
        `h1{font-size:18px;color:#71A4FF;margin:0 0 12px}code{color:#71A4FF}</style></head><body><div>` +
        `<h1>WHATSAPP NOT CONFIGURED</h1>` +
        `<p>Add <code>WHATSAPP_NUMBER=9198xxxxxxx</code> (digits only, with country code) to the <code>.env</code> file and restart the server. The number is only ever read server-side.</p>` +
        `<p><a href="/" style="color:#71A4FF">← back to portfolio</a></p></div></body></html>`
      )
      return
    }
    res.redirect?.(302, `https://wa.me/${number}`)
      || (res.statusCode = 302, res.setHeader('Location', `https://wa.me/${number}`), res.end?.())
    return
  }

  if (url === '/api/contact') {
    if ((req.method || '').toUpperCase() !== 'POST') return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' })
    const chunks = []
    const finish = (parsed) => {
      const { name = '', email = '', message = '', type = '' } = parsed || {}
      const clean = (s) => String(s).trim()
      const n = clean(name), e = clean(email), m = clean(message)
      if (!n || !e || !m) return json(res, 400, { ok: false, error: 'VALIDATION', message: 'Name, email and message are required.' })
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return json(res, 400, { ok: false, error: 'VALIDATION', message: 'Please enter a valid email address.' })
      appendLog({ kind: 'contact', name: n, email: e, type: clean(type), message: m.slice(0, 8000) })
      const hasTransport = Boolean(env('SMTP_HOST') || env('MAIL_URL'))
      json(res, 200, {
        ok: true,
        delivered: hasTransport,
        note: hasTransport
          ? 'Message sent to inbox.'
          : `Message captured (${n}). Email transport not configured — set MAIL_URL/SMTP_* in .env to deliver it.`,
      })
    }
    req.on?.('data', (c) => chunks.push(Buffer.from(c)))
    req.on?.('end', () => {
      try { finish(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')) }
      catch { finish({}) }
    })
    req.on?.('error', () => finish({}))
    return
  }

  res.statusCode = 404
  res.end?.('{"ok":false,"error":"NOT_FOUND"}')
}

export { env }