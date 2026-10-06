import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IDENTITY, NAV } from '../data/content'

// Minimal glass navigation — logo left, links center, CTA right.
// Hamburger + full-screen overlay menu below 900px.
export default function Navigation({ active }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (id) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header className="nav">
        <button className="nav-logo" onClick={() => go('home')} aria-label="Go to home">
          <span className="nav-logo-name">{IDENTITY.name}</span>
          <span className="nav-logo-mark mono">/ {IDENTITY.mark}</span>
        </button>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-link${active === item.id ? ' is-active' : ''}`}
              onClick={() => go(item.id)}
              aria-current={active === item.id ? 'true' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="nav-right">
          <button className="nav-cta mono" onClick={() => go('contact')}>LET'S TALK ↗</button>
          <button
            className={`nav-burger${open ? ' is-open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {NAV.map((item, i) => (
              <motion.button
                key={item.id}
                className="mobile-link"
                onClick={() => go(item.id)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12, transition: { duration: 0.16, delay: 0 } }}
                transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="mono mobile-link-num">0{i + 1}</span>
                {item.label}
              </motion.button>
            ))}
            <motion.button
              className="btn btn-primary mobile-cta"
              onClick={() => go('contact')}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.16, delay: 0 } }}
              transition={{ delay: 0.42, duration: 0.4 }}
            >
              LET'S TALK ↗
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
