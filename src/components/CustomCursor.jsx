import { useEffect, useRef, useState } from 'react'
import { store } from '../scene/store'

// Futuristic custom cursor: small dot + trailing ring + micro-label.
//
// Label states (brief): links → VIEW · buttons → OPEN · 3D card → DRAG/DRAGGING.
// DOM-derived labels are resolved on pointermove; the 3D canvas publishes
// DRAG/DRAGGING through the shared store (read every frame, zero re-renders).
// Disabled entirely on touch / coarse-pointer devices.
function labelFor(el) {
  if (!el) return null
  const explicit = el.closest?.('[data-cursor-label]')
  if (explicit) return explicit.getAttribute('data-cursor-label')
  if (el.closest?.('[data-cursor="drag"]')) return 'DRAG'
  if (el.closest?.('a[href]')) return 'VIEW'
  if (el.closest?.('button, [role="button"], input[type="submit"]')) return 'OPEN'
  return null
}

export default function CustomCursor({ disabled = false }) {
  const dotRef = useRef()
  const ringRef = useRef()
  const labelRef = useRef()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (disabled) return undefined
    if (!window.matchMedia('(pointer: fine)').matches) return undefined
    setEnabled(true)

    const pos = { x: -100, y: -100 }
    const ring = { x: -100, y: -100 }
    let domLabel = null
    let domMode = 'default'
    let shownLabel = ''

    const onMove = (e) => {
      const el = e.target
      const overText = el.closest?.('input, textarea, select')
      domLabel = overText ? null : labelFor(el)
      domMode = overText
        ? 'text'
        : domLabel === 'DRAG'
          ? 'drag'
          : domLabel
            ? 'hover'
            : el.closest?.('[data-cursor], a, button, label')
              ? 'hover'
              : 'default'
    }

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.16
      ring.y += (pos.y - ring.y) * 0.16
      // The 3D scene wins when it publishes a state (card hover / drag).
      const s3d = store.cursor.mode
      const active3d = s3d === 'drag' || s3d === 'dragging'
      const mode = active3d ? s3d : domMode
      const label = active3d ? store.cursor.label : domLabel || ''

      if (dotRef.current) {
        const ds = mode === 'hover' ? 0.5 : mode === 'text' ? 0.3 : mode === 'dragging' ? 0.4 : 1
        dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${ds})`
      }
      if (ringRef.current) {
        const rs =
          mode === 'hover' ? 1.9 : mode === 'drag' ? 2.6 : mode === 'dragging' ? 3 : mode === 'text' ? 0.6 : 1
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%, -50%) scale(${rs})`
        ringRef.current.className = `cursor-ring${active3d ? ' is-3d' : ''}${mode === 'hover' ? ' is-hover' : ''}`
      }
      if (labelRef.current) {
        if (label !== shownLabel) {
          shownLabel = label
          labelRef.current.textContent = label
          labelRef.current.style.opacity = label ? '1' : '0'
        }
        labelRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(20px, 14px)`
      }
      raf = requestAnimationFrame(loop)
    }
    let raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.classList.add('has-custom-cursor')
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [disabled])

  if (!enabled) return null
  return (
    <div aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={labelRef} className="cursor-label mono" />
    </div>
  )
}
