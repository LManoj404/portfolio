import { useEffect, useRef, useState } from 'react'

const STATUS_LINES = [
  'LOADING 3D ENVIRONMENT',
  'LOADING NEURAL NETWORK',
  'LOADING PROJECTS',
  'LOADING EXPERIENCE',
]

// Cinematic boot sequence: ML/26 mark, progress, cycling status lines.
// Waits for the hero portrait to decode (capped at 3.5s) before exiting.
export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState(0)
  const [exiting, setExiting] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf
    let start = performance.now()
    const img = new Image()
    let imgOk = false
    img.onload = () => { imgOk = true }
    img.src = '/assets/id-photo.png'

    const tick = (now) => {
      const el = now - start
      const cap = reduced ? 400 : 2400
      // Eased progress that waits for the portrait near the end.
      const timeP = Math.min(1, el / cap)
      const eased = 1 - Math.pow(1 - timeP, 2.2)
      const imgP = imgOk || el > 3500 ? 1 : Math.min(0.85, el / 3500)
      const p = Math.min(1, eased * 0.7 + imgP * 0.3)
      setProgress(Math.round(p * 100))
      setStatus(Math.min(STATUS_LINES.length - 1, Math.floor(p * STATUS_LINES.length)))
      if (p >= 1 && el > cap && !doneRef.current) {
        doneRef.current = true
        setExiting(true)
        setTimeout(onDone, reduced ? 150 : 700)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div className={`loader${exiting ? ' loader-exit' : ''}`} role="status" aria-label="Loading">
      <div className="loader-glow" aria-hidden="true" />
      <div className="loader-center">
        <div className="loader-name mono">MANOJ L.</div>
        <div className="loader-mark">ML/26</div>
        <div className="loader-sub mono">INITIALIZING DIGITAL UNIVERSE</div>
        <div className="loader-bar" aria-hidden="true">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="loader-meta mono">
          <span>{STATUS_LINES[status]}</span>
          <span className="loader-pct">{String(progress).padStart(3, '0')}%</span>
        </div>
      </div>
      <div className="loader-corner mono" aria-hidden="true">PORTFOLIO — V2.6</div>
      <div className="loader-corner-br mono" aria-hidden="true">AI · DATA · WEB · 3D</div>
    </div>
  )
}
