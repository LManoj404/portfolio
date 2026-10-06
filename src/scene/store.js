// Shared, render-free interaction + scroll state.
// Updated by DOM listeners only — consumed inside useFrame loops (no React re-renders).
import * as THREE from 'three'

export const SECTIONS = ['home', 'about', 'skills', 'projects', 'journey', 'contact']

export const store = {
  progress: 0, // 0..1 over the whole document
  section: 0, // active section index
  sectionT: 0, // 0..1 progress inside the active section
  pointer: { x: 0, y: 0 }, // -1..1, y up
  mobile: false,
  reduced: false,
  // AI activation pulse — t >= 0 while an activation wave is playing.
  pulse: { t: -1 },
  // Cursor state (read every frame by CustomCursor — no React re-renders).
  // mode: 'default' | 'hover' | 'view' | 'open' | 'drag' | 'dragging' | 'text'
  cursor: { mode: 'default', label: '' },
}

// Set the custom-cursor state. `label` is the micro-caption shown next to the
// ring (DRAG / DRAGGING / VIEW / OPEN). Passing null restores default.
export function setCursor(mode = 'default', label = '') {
  store.cursor.mode = mode
  store.cursor.label = label
}

// Fire the signature "AI boot" activation: particles burst, orbitals accelerate,
// the neural network flashes and a blue energy ring expands from the portrait.
// Called on load, when the user clicks the avatar, and when scrolling back to hero.
export function triggerPulse() {
  store.pulse.t = 0
}

// Advance the pulse clock — called once per frame from the scene rAF loop.
export function tickPulse(dt) {
  if (store.pulse.t >= 0) {
    store.pulse.t += dt
    if (store.pulse.t > 2) store.pulse.t = -1
  }
}

export function initStore() {
  store.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  store.mobile = window.innerWidth < 768

  const onMove = (e) => {
    store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    store.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    store.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    const secs = document.querySelectorAll('[data-section]')
    let idx = 0
    let t = 0
    secs.forEach((el, i) => {
      const r = el.getBoundingClientRect()
      if (r.top <= window.innerHeight * 0.5) {
        idx = i
        const span = Math.max(1, r.height - window.innerHeight)
        t = Math.min(1, Math.max(0, -r.top / span))
      }
    })
    store.section = idx
    store.sectionT = t
  }

  const onResize = () => {
    store.mobile = window.innerWidth < 768
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  onScroll()

  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
  }
}

// Small radial-gradient sprite used by every particle system (shared).
let _dotTex = null
export function getDotTexture() {
  if (_dotTex) return _dotTex
  const size = 64
  const cv = document.createElement('canvas')
  cv.width = size
  cv.height = size
  const ctx = cv.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.7)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  _dotTex = new THREE_CanvasTexture(cv)
  return _dotTex
}

function THREE_CanvasTexture(cv) {
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
