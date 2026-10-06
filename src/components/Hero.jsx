import { useState } from 'react'
import { motion } from 'framer-motion'
import { HERO, IDENTITY } from '../data/content'
import Lanyard from './lanyard/Lanyard'
import ErrorBoundary from './ErrorBoundary'
import { store } from '../scene/store'

const ease = [0.22, 1, 0.36, 1]
const rise = (delay) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.9, ease },
})

// Graceful fallback when the 3D physics canvas cannot initialize — the hero
// still delivers the portrait-badge visual, never a blank screen.
function FallbackHero() {
  return (
    <div className="lanyard-fallback" aria-hidden="true">
      <div className="hero-id-frame">
        <img src="/assets/id-photo.png" alt="" className="hero-id-portrait" />
        <span className="hero-id-name">MANOJ L.</span>
        <span className="hero-id-role">AI &amp; DATA SCIENCE DEVELOPER</span>
        <span className="hero-id-tag mono">ML / 26 · AI · DATA · WEB · 3D</span>
      </div>
    </div>
  )
}

// First viewport — the interactive 3D lanyard over huge editorial type.
export default function Hero({ started, active, webgl = true }) {
  const shown = started && active === 'home'
  const [lstate, setLstate] = useState(null)

  return (
    <section id="home" data-section="home" className="section hero lanyard-hero">
      {/* Real h1 for semantics/AT — the giant visual type below is decorative */}
      <h1 className="sr-only">Manoj L. — AI &amp; Data Science Developer</h1>
      {/* Giant editorial type sits BEHIND the card */}
      <div className="hero-type" aria-hidden="true">
        <span className="ht-line solid">BUILDING</span>
        <span className="ht-line outline">INTELLIGENT</span>
        <span className="ht-line solid">EXPERIENCES.</span>
      </div>

      {started && (webgl ? (
        <ErrorBoundary fallback={<FallbackHero />}>
          <Lanyard active={shown} reduced={store.reduced} onState={setLstate} />
        </ErrorBoundary>
      ) : (
        // No WebGL: never even attempt a canvas — the static badge keeps the
        // hero beautiful and the console completely clean.
        <FallbackHero />
      ))}

      <div className="hero-micro">
        <motion.div className="hero-label mono" {...rise(0.15)}>
          <span className="label-line" aria-hidden="true" />
          {IDENTITY.tags}
        </motion.div>
        <motion.div className="hero-meta mono" {...rise(0.9)}>
          {HERO.chips.map((c) => <span key={c} className="hero-chip">{c}</span>)}
        </motion.div>
        <motion.p className="hero-note mono" {...rise(1.05)}>
          AVAILABLE FOR: PROJECTS · COLLABORATIONS · OPPORTUNITIES
        </motion.p>
      </div>

      <div className={`hero-hint${lstate ? '' : ' is-idle'}`} role="status" aria-live="polite">
        {lstate === 'drag' ? 'DRAGGING' : lstate === 'hover' ? 'DRAG' : 'DRAG THE CARD'}
      </div>

      <motion.div className="hero-scroll mono" {...rise(1.15)} aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
        <span className="hero-scroll-line" />
      </motion.div>

      <div className="hud" aria-hidden="true">
        <div className="hud-item"><span className="hud-dot" /><span>AI CORE</span><span className="hud-val mono">SYNC</span></div>
        <div className="hud-item"><span className="hud-dot is-boot" /><span>MODEL</span><span className="hud-val mono">ML/26</span></div>
        <div className="hud-item"><span className="hud-dot" /><span>DATA</span><span className="hud-val mono">2026</span></div>
        <div className="hud-item"><span className="hud-dot" /><span>VISION</span><span className="hud-val mono">∞</span></div>
        <div className="hud-item"><span className="hud-dot is-boot" /><span>SYSTEM ONLINE</span></div>
        <div className="hud-item"><span className="hud-dot is-boot" /><span>BUILDING…</span></div>
      </div>
    </section>
  )
}