import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PROJECTS } from '../data/content'

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { delay, duration: 0.8, ease },
})

// Deterministic generative "blueprint" visual per project — abstract wireframe
// motif derived from the project index. Honest: decorative, not a screenshot.
function ProjectVisual({ num, detail }) {
  const seed = parseInt(num, 10)
  const nodes = useMemo(() => {
    const arr = []
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + seed
      const r = 18 + ((seed * 7 + i * 13) % 26)
      arr.push([60 + Math.cos(a) * r, 40 + Math.sin(a) * r * 0.72])
    }
    return arr
  }, [seed])
  return (
    <div className={`pvisual${detail ? ' pvisual-detail' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice">
        <circle cx="60" cy="40" r={26 + seed * 2} className="pv-orbit" />
        <circle cx="60" cy="40" r={14 + seed} className="pv-orbit pv-orbit2" />
        {nodes.map(([x, y], i) => (
          <g key={i}>
            <line x1="60" y1="40" x2={x} y2={y} className="pv-line" />
            <circle cx={x} cy={y} r="1.6" className="pv-node" />
          </g>
        ))}
        <circle cx="60" cy="40" r="2.6" className="pv-core" />
        <rect x="4" y="4" width="112" height="72" className="pv-frame" />
      </svg>
      <span className="pvisual-num mono">{num}</span>
    </div>
  )
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={onClose}>
      <motion.div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.45, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close project details">✕</button>
        <ProjectVisual num={project.num} detail />
        <div className="modal-body">
          <span className="modal-cat mono">{project.category}</span>
          <h3 className="modal-title">{project.title}</h3>
          <p className="modal-desc">{project.desc}</p>
          <div className="modal-block">
            <h4 className="mono">TECHNOLOGIES</h4>
            <div className="modal-chips">{project.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          </div>
          {project.features && (
            <div className="modal-block">
              <h4 className="mono">KEY FEATURES</h4>
              <ul className="modal-features">
                {project.features.map((f) => <li key={f}><span aria-hidden="true">▸</span>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// 03 / PROJECTS — floating project cards + immersive detail panel.
export default function ProjectsUniverse() {
  const [open, setOpen] = useState(null)
  return (
    <section id="projects" data-section="projects" className="section projects">
      <div className="section-head">
        <motion.span className="section-label mono" {...rise()}>{PROJECTS.label}</motion.span>
        <motion.h2 className="section-heading" {...rise(0.1)}>{PROJECTS.heading}</motion.h2>
      </div>
      <div className="projects-list">
        {PROJECTS.items.map((p, i) => (
          <motion.button
            key={p.id}
            className={`project-row${i % 2 ? ' is-flipped' : ''}`}
            data-cursor="3d"
            onClick={() => setOpen(p)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.05 * i, duration: 0.7, ease }}
          >
            <span className="project-num mono">{p.num}</span>
            <ProjectVisual num={p.num} />
            <span className="project-info">
              <span className="project-cat mono">{p.category}</span>
              <span className="project-title">{p.title}</span>
              <span className="project-tech">{p.tech.slice(0, 4).map((t) => <em key={t}>{t}</em>)}</span>
            </span>
            <span className="project-arrow" aria-hidden="true">↗</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  )
}
