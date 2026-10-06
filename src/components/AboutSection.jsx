import { motion } from 'framer-motion'
import { ABOUT } from '../data/content'

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { delay, duration: 0.8, ease },
})

// 01 / ABOUT — biography, floating data cards, quick facts.
export default function AboutSection() {
  return (
    <section id="about" data-section="about" className="section about">
      <div className="section-head">
        <motion.span className="section-label mono" {...rise()}>{ABOUT.label}</motion.span>
        <motion.h2 className="section-heading" {...rise(0.1)}>{ABOUT.heading}</motion.h2>
      </div>
      <motion.p className="about-bigline outline" {...rise(0.18)} aria-hidden="true">
        {ABOUT.bigLine1} {ABOUT.bigLine2}
      </motion.p>
      <div className="about-grid">
        <div className="about-bio">
          {ABOUT.bio.map((p, i) => <motion.p key={i} {...rise(0.1 + i * 0.08)}>{p}</motion.p>)}
          <motion.div className="about-facts" {...rise(0.3)}>
            {ABOUT.facts.map(([v, l]) => (
              <div key={l} className="fact">
                <div className="fact-value">{v}</div>
                <div className="fact-label mono">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="about-cards" aria-label="Focus areas">
          {ABOUT.focus.map((c, i) => (
            <motion.div
              key={c}
              className="data-card"
              data-cursor="3d"
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 * i, duration: 0.7, ease }}
              style={{ '--float-dur': `${5 + i * 0.9}s`, '--float-del': `${-i * 1.3}s` }}
            >
              <span className="data-card-dot" aria-hidden="true" />
              {c}
              <span className="data-card-node mono" aria-hidden="true">NODE_0{i + 1}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
