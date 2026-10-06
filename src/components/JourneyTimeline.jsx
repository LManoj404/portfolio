import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { JOURNEY } from '../data/content'
import { certificateItems, experienceItems } from '../data/gallery'
import StellarGallery from './gallery/StellarGallery'

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { delay, duration: 0.8, ease },
})

// 04 / JOURNEY — vertical futuristic timeline with activating nodes,
// internship callout and certifications.
export default function JourneyTimeline() {
  const lineRef = useRef()
  useEffect(() => {
    const els = lineRef.current?.querySelectorAll('.timeline-year')
    if (!els || !('IntersectionObserver' in window)) return undefined
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting)),
      { threshold: 0.35 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="journey" data-section="journey" className="section journey">
      <div className="section-head">
        <motion.span className="section-label mono" {...rise()}>{JOURNEY.label}</motion.span>
        <motion.h2 className="section-heading" {...rise(0.1)}>{JOURNEY.heading}</motion.h2>
      </div>
      <div className="timeline" ref={lineRef}>
        <div className="timeline-line" aria-hidden="true" />
        {JOURNEY.years.map((y, yi) => (
          <motion.div
            key={y.year}
            className="timeline-year"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.06 * yi, duration: 0.7, ease }}
          >
            <span className="timeline-node" aria-hidden="true" />
            <div className="timeline-year-label outline">{y.year}</div>
            <ul className="timeline-entries">
              {y.entries.map((e) => <li key={e}><span className="mono tick" aria-hidden="true">/</span>{e}</li>)}
              {y.year === '2024' && (
                <li className="internship-card" data-cursor="3d">
                  <div className="internship-role">{JOURNEY.internship.role}</div>
                  <div className="internship-org">{JOURNEY.internship.org}</div>
                  <div className="internship-dates mono">{JOURNEY.internship.dates}</div>
                  <div className="internship-focus">
                    {JOURNEY.internship.focus.map((f) => <span key={f} className="chip">{f}</span>)}
                  </div>
                </li>
              )}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="certs">
        <motion.h3 className="certs-heading mono" {...rise()}>CERTIFICATIONS</motion.h3>
        <p className="certs-note">Upload artwork to <span className="mono">public/assets/certificates/</span> — missing files render as elegant placeholders.</p>
      </div>
      <StellarGallery
        label="PROFESSIONAL JOURNEY"
        title="EXPERIENCE GALAXY"
        script="DATA / LEADERSHIP"
        meta="INTERNSHIP · COORDINATION"
        items={experienceItems}
      />
      <StellarGallery
        label="CERTIFICATIONS & CREDENTIALS"
        title="CERTIFICATE GALAXY"
        script="LEARNING"
        meta="CREDENTIALS / UPLOAD-READY"
        items={certificateItems}
      />
    </section>
  )
}
