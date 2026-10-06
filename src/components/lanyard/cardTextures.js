// ─────────────────────────────────────────────────────────────
// ORIGINAL card-face generator for the Lanyard identity card.
// Everything is drawn from scratch (no third-party pixels) so the card never
// shows third-party branding — it is Manoj L.'s own identity badge.
// The front/back designs are composited into the GLB's two UV halves.
// ─────────────────────────────────────────────────────────────
import * as THREE from 'three'

export const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 }
export const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 }

const C = {
  bgTop: '#03050A', bgBot: '#0A101C', ink: '#F5F5F7',
  muted: '#8E8E8F', blue: '#4D8DFF', sky: '#71A4FF',
  deep: '#0B2A6B', elevated: '#F0F0F2', line: 'rgba(124,170,255,0.42)',
}

// Width helper: use measureText when available, otherwise estimate.
function m(ctx, s) {
  if (typeof ctx.measureText === 'function') return ctx.measureText(s).width
  const size = parseFloat(ctx.font) || 16
  const mono = /mono/i.test(ctx.font)
  const cw = mono ? size * 0.62 : size * 0.52
  let w = 0
  for (const ch of s) w += cw + (ch === ' ' ? cw * 0.5 : 0)
  return w
}

function rr(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r)
  else {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }
}

function bgGrad(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, C.bgTop)
  g.addColorStop(1, C.bgBot)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  const v = ctx.createRadialGradient(w / 2, h * 0.28, 40, w / 2, h * 0.28, w * 0.95)
  v.addColorStop(0, 'rgba(11,42,107,0.35)')
  v.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, w, h)
}

function grid(ctx, w, h, step, alpha) {
  ctx.save()
  ctx.strokeStyle = `rgba(142,170,255,${alpha})`
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.restore()
}

function scanlines(ctx, w, h) {
  ctx.save()
  for (let y = 0; y < h; y += 3) {
    ctx.fillStyle = 'rgba(255,255,255,0.018)'
    ctx.fillRect(0, y, w, 1)
  }
  ctx.restore()
}

function text(ctx, str, x, y, size, font, color, tracking = 0, caseUp = false) {
  ctx.save()
  ctx.font = `${size}px ${font}`
  ctx.fillStyle = color
  const s = caseUp ? str.toUpperCase() : str
  let cx = x
  for (const ch of s) {
    ctx.fillText(ch, cx, y)
    cx += m(ctx, ch) + tracking
  }
  ctx.restore()
}

function pill(ctx, cx, cy, label) {
  const pw = m(ctx, label) + 34
  const ph = 34
  ctx.save()
  rr(ctx, cx - pw / 2, cy - ph / 2, pw, ph, ph / 2)
  ctx.clip()
  const g = ctx.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0)
  g.addColorStop(0, 'rgba(77,141,255,0.16)')
  g.addColorStop(1, 'rgba(113,164,255,0.3)')
  ctx.fillStyle = g
  ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph)
  ctx.strokeStyle = 'rgba(124,170,255,0.5)'
  ctx.lineWidth = 1
  rr(ctx, cx - pw / 2 + 0.5, cy - ph / 2 + 0.5, pw - 1, ph - 1, ph / 2)
  ctx.stroke()
  ctx.fillStyle = '#C7DBFF'
  ctx.font = '600 15px "DM Mono", monospace'
  ctx.fillText(label, cx - pw / 2 + 17, cy + 5)
  ctx.restore()
}

function chip(ctx, x, y, label) {
  ctx.save()
  ctx.font = '600 14px "DM Mono", monospace'
  const w = m(ctx, label) + 30
  ctx.fillStyle = 'rgba(77,141,255,0.18)'
  rr(ctx, x, y, w, 30, 8)
  ctx.fill()
  ctx.strokeStyle = 'rgba(124,170,255,0.45)'
  ctx.lineWidth = 1
  rr(ctx, x + 0.5, y + 0.5, w - 1, 29, 8)
  ctx.stroke()
  ctx.fillStyle = C.sky
  ctx.fillText(label, x + 15, y + 20)
  ctx.restore()
}
function frame(ctx, w, h) {
  ctx.save()
  rr(ctx, 12, 12, w - 24, h - 24, 24)
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, 'rgba(124,170,255,0.55)')
  g.addColorStop(0.5, 'rgba(77,141,255,0.35)')
  g.addColorStop(1, 'rgba(124,170,255,0.55)')
  ctx.strokeStyle = g
  ctx.lineWidth = 2.4
  ctx.stroke()
  ctx.strokeStyle = C.sky
  ctx.lineWidth = 2
  const t = 26, o = 12
  const corners = [
    [o, o, o + t, o], [o, o, o, o + t],
    [w - o - t, o, w - o, o], [w - o, o, w - o, o + t],
    [o, h - o - t, o, h - o], [o, h - o, o + t, h - o],
    [w - o - t, h - o, w - o, h - o], [w - o, h - o - t, w - o, h - o],
  ]
  for (let i = 0; i < corners.length; i += 2) {
    ctx.beginPath(); ctx.moveTo(corners[i][0], corners[i][1]); ctx.lineTo(corners[i][2], corners[i][3]); ctx.stroke()
  }
  ctx.restore()
}

/** Front face — portrait-forward premium badge. */
export function makeCardFront(w = 600, h = 900, portrait = null) {
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')
  bgGrad(ctx, w, h)
  grid(ctx, w, h, 56, 0.035)
  frame(ctx, w, h)
  chip(ctx, 34, 40, 'ML / 26')
  chip(ctx, w - 150, 40, 'ID · 26')

  // Portrait panel — the supplied cartoon portrait is an opaque 1:1 image, so
  // it is composited as a rounded, card-integrated panel drawn EXACTLY 1:1
  // (zero crop, zero stretch, no filters/blur on the face). Guarded against
  // broken/empty images so a failed portrait never produces WebGL warnings.
  const cxR = w / 2
  const cyR = 360
  const portraitOk = portrait && portrait.complete && portrait.naturalWidth > 0 && portrait.naturalHeight > 0
  if (portraitOk) {
    // blue rim glow behind the panel
    const glow = ctx.createRadialGradient(cxR, cyR, 20, cxR, cyR, 280)
    glow.addColorStop(0, 'rgba(77,141,255,0.42)')
    glow.addColorStop(0.6, 'rgba(77,141,255,0.14)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.beginPath(); ctx.arc(cxR, cyR, 280, 0, Math.PI * 2); ctx.fill()

    // square panel matching the image's own aspect ratio — no crop at all
    const panel = 440
    const dx = cxR - panel / 2
    const dy = cyR - panel / 2
    ctx.save()
    rr(ctx, dx, dy, panel, panel, 26)
    ctx.clip()
    // deep backing so the opaque photo sits inside the card's world
    ctx.fillStyle = '#0A0F18'
    ctx.fillRect(dx, dy, panel, panel)
    ctx.drawImage(portrait, dx, dy, panel, panel)
    // very subtle holographic scanlines over the panel only
    ctx.strokeStyle = 'rgba(113,164,255,0.12)'
    ctx.lineWidth = 1
    for (let yy = 4; yy < panel; yy += 6) {
      ctx.beginPath(); ctx.moveTo(dx, dy + yy); ctx.lineTo(dx + panel, dy + yy); ctx.stroke()
    }
    ctx.restore()

    // fine inner frame + HUD corner ticks (card-integrated, not a floating img)
    ctx.save()
    ctx.strokeStyle = 'rgba(124,170,255,0.55)'
    ctx.lineWidth = 1.6
    rr(ctx, dx + 1, dy + 1, panel - 2, panel - 2, 25)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(113,164,255,0.8)'
    ctx.lineWidth = 2.4
    const tk = 22, off = 8
    ;[
      [dx - off, dy - off, 1, 1], [dx + panel + off, dy - off, -1, 1],
      [dx - off, dy + panel + off, 1, -1], [dx + panel + off, dy + panel + off, -1, -1],
    ].forEach(([tx, ty, sx, sy]) => {
      ctx.beginPath()
      ctx.moveTo(tx + tk * sx, ty); ctx.lineTo(tx, ty); ctx.lineTo(tx, ty + tk * sy)
      ctx.stroke()
    })
    ctx.restore()
  } else {
    ctx.save()
    ctx.strokeStyle = C.blue
    ctx.lineWidth = 2
    ctx.setLineDash([10, 8])
    ctx.beginPath(); ctx.arc(cxR, cyR, 140, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = 'rgba(113,164,255,0.06)'
    ctx.beginPath(); ctx.arc(cxR, cyR, 140, 0, Math.PI * 2); ctx.fill()
    text(ctx, 'LOADING PORTRAIT', cxR - 80, cyR + 6, 17, '"DM Mono", monospace', C.muted, 0, true)
    ctx.restore()
  }

  scanlines(ctx, w, h)
  // Name block — stacked BELOW the portrait panel with clear separation. The
  // role line used to share the 52px name's baseline (glyphs collided) and the
  // hairline rule sat exactly on that baseline (it struck through the name).
  text(ctx, 'AI & DATA SCIENCE DEVELOPER', (w - m(ctx, 'AI & DATA SCIENCE DEVELOPER')) / 2, 646, 20, '"Space Grotesk", sans-serif', C.elevated, 1, true)
  ctx.save()
  ctx.font = '700 52px "Space Grotesk", sans-serif'
  const nameFirst = 'MANOJ'
  const nameLast = 'L.'
  const gapW = m(ctx, ' ')
  const nameW = m(ctx, nameFirst) + gapW + m(ctx, nameLast)
  const nameX = (w - nameW) / 2
  ctx.fillStyle = C.ink
  ctx.fillText(nameFirst, nameX, 718)
  ctx.fillStyle = C.sky
  ctx.fillText(nameLast, nameX + m(ctx, nameFirst) + gapW, 718)
  ctx.restore()
  ctx.save()
  ctx.fillStyle = 'rgba(124,170,255,0.5)'
  ctx.fillRect(40, 744, w - 80, 1)
  ctx.restore()
  text(ctx, 'AI · DATA · WEB · 3D', (w - m(ctx, 'AI · DATA · WEB · 3D')) / 2, 790, 19, '"DM Mono", monospace', C.sky, 2, true)
  text(ctx, 'SERIAL-26-ML·FIELD', 40, h - 26, 12, '"DM Mono", monospace', 'rgba(142,142,143,0.8)', 1, true)
  text(ctx, 'VERIFIED', w - 120, h - 26, 12, '"DM Mono", monospace', C.sky, 1, true)
  return cv
}
/** Back face — details + badge pills + barcode motif. */
export function makeCardBack(w = 600, h = 900) {
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')
  bgGrad(ctx, w, h)
  grid(ctx, w, h, 56, 0.03)
  frame(ctx, w, h)
  chip(ctx, 34, 40, 'ML/26 · VERIFIED')

  const stripG = ctx.createLinearGradient(40, 0, w - 40, 0)
  stripG.addColorStop(0, '#4D8DFF')
  stripG.addColorStop(0.5, '#71A4FF')
  stripG.addColorStop(1, '#0B2A6B')
  ctx.fillStyle = stripG
  rr(ctx, 40, 150, w - 80, 8, 4)
  ctx.fill()

  ctx.font = '700 46px "Space Grotesk", sans-serif'
  ctx.fillStyle = C.ink
  ctx.fillText('MANOJ L.', (w - m(ctx, 'MANOJ L.')) / 2, 250)
  ctx.font = '500 24px "Space Grotesk", sans-serif'
  ctx.fillStyle = C.elevated
  ctx.fillText('B.TECH ARTIFICIAL INTELLIGENCE', (w - m(ctx, 'B.TECH ARTIFICIAL INTELLIGENCE')) / 2, 330)
  ctx.fillText('& DATA SCIENCE', (w - m(ctx, '& DATA SCIENCE')) / 2, 372)
  ctx.font = '500 26px "DM Mono", monospace'
  ctx.fillStyle = C.sky
  ctx.fillText('2022 — 2026', (w - m(ctx, '2022 — 2026')) / 2, 430)

  const pills = ['AI', 'ML', 'DATA', 'WEB', '3D']
  ctx.font = '600 15px "DM Mono", monospace'
  let tw = 0
  pills.forEach((p) => { tw += m(ctx, p) + 34 })
  tw += (pills.length - 1) * 16
  let px = w / 2 - tw / 2
  pills.forEach((p) => {
    const pw = m(ctx, p) + 34
    pill(ctx, px + pw / 2, 546, p)
    px += pw + 16
  })

  // deterministic barcode motif
  ctx.save()
  ctx.fillStyle = 'rgba(240,240,242,0.7)'
  const bx = w / 2 - 190
  let bw = 0
  for (let i = 0; i < 38; i++) {
    const cw = 2 + (i * 7) % 5
    ctx.fillRect(bx + bw, 700, cw, 92)
    bw += cw + (i % 3 === 0 ? 4 : 2)
  }
  ctx.restore()
  scanlines(ctx, w, h)
  text(ctx, 'MANOJ•L · ML/26', w / 2 - 60, 836, 14, '"DM Mono", monospace', C.muted, 1, true)
  text(ctx, 'ISSUED 2026 · TM', 40, h - 26, 11, '"DM Mono", monospace', 'rgba(142,142,143,0.75)', 1, true)
  return cv
}

/** Full-coverage atlas: wipes any baked-in art, then draws our two faces. */
export function paintAtlas(ctx, W, H, frontCv, backCv, fit = 'cover') {
  ctx.fillStyle = '#05070D'
  ctx.fillRect(0, 0, W, H)
  const paint = (img, rect) => {
    if (!img || !img.width || !img.height) return
    const rx = rect.x * W
    const ry = rect.y * H
    const rw = rect.w * W
    const rh = rect.h * H
    const scale = fit === 'contain' ? Math.min(rw / img.width, rh / img.height) : Math.max(rw / img.width, rh / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    const dx = rx + (rw - dw) / 2
    const dy = ry + (rh - dh) / 2
    ctx.save()
    ctx.beginPath()
    ctx.rect(rx, ry, rw, rh)
    ctx.clip()
    ctx.drawImage(img, dx, dy, dw, dh)
    ctx.restore()
  }
  paint(frontCv, FRONT_UV_RECT)
  paint(backCv, BACK_UV_RECT)
  // subtle blue tint over the whole atlas (card edges pick up the accent)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(77,141,255,0.12)'
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

export function makeCanvasTexture(cv) {
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 16
  t.needsUpdate = true
  return t
}