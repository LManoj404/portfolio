import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { initStore } from './scene/store'
import LoadingScreen from './components/LoadingScreen'
import CustomCursor from './components/CustomCursor'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import AboutSection from './components/AboutSection'
import SkillsUniverse from './components/SkillsUniverse'
import ProjectsUniverse from './components/ProjectsUniverse'
import JourneyTimeline from './components/JourneyTimeline'
import ContactSection from './components/ContactSection'
import ErrorBoundary from './components/ErrorBoundary'

function webglAvailable() {
  try {
    const cv = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (cv.getContext('webgl2') || cv.getContext('webgl')))
  } catch {
    return false
  }
}

const SECTION_IDS = ['home', 'about', 'skills', 'projects', 'journey', 'contact']

export default function App() {
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [webgl, setWebgl] = useState(true)
  const [active, setActive] = useState('home')

  useEffect(() => initStore(), [])
  useEffect(() => { setWebgl(webglAvailable()) }, [])

  // Scroll-spy for the navigation (cheap rAF-throttled check).
  useEffect(() => {
    if (loading) return undefined
    let raf = null
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        let current = 'home'
        SECTION_IDS.forEach((id) => {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) current = id
        })
        setActive(current)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [loading])

  // Kick off the scene slightly after the loader exits for a cinematic reveal.
  useEffect(() => {
    if (loading) return undefined
    const t = setTimeout(() => setStarted(true), 60)
    return () => clearTimeout(t)
  }, [loading])

  return (
    <>
      <a className="skip-link" href="#projects">Skip to content</a>
      <CustomCursor />
      <AnimatePresence>
        {loading && <LoadingScreen key="loader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <Navigation active={active} />

      {webgl ? (
        // The 3D lanyard hero mounts inside <Hero /> with its own ErrorBoundary
        // and a static fallback badge — no separate background canvas needed.
        <div className="hero-atmosphere" aria-hidden="true" />
      ) : (
        <div className="webgl-fallback" aria-hidden="true" />
      )}

      <main className={`page${started ? ' is-started' : ''}`}>
        <Hero started={started} active={active} webgl={webgl} />
        <AboutSection />
        <SkillsUniverse />
        <ProjectsUniverse />
        <JourneyTimeline />
        <ContactSection />
      </main>
    </>
  )
}
