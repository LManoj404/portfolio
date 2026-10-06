import { useState } from 'react'
import { motion } from 'framer-motion'
import { SKILLS } from '../data/content'

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { delay, duration: 0.8, ease },
})

// Layout: two elliptical rings around a central AI CORE node.
const W = 1000, H = 640, CX = W / 2, CY = H / 2
function layout(items) {
  const nodes = items.map((skill, i) => {
    const ring = i < 6 ? 0 : 1
    const n = ring === 0 ? 6 : items.length - 6
    const idx = ring === 0 ? i : i - 6
    const a = -Math.PI / 2 + idx * (Math.PI * 2 / n)
    const r = ring === 0 ? 150 : 265
    return { skill, x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r * 0.82, ring }
  })
  return nodes
}

// 02 / SKILLS — interactive neural network: AI CORE in the center, skills
// orbiting around it, glowing pulses travelling along the connections.
export default function SkillsUniverse() {
  const [active, setActive] = useState(null) // skill name or null
  const nodes = layout(SKILLS.items)
  const edges = nodes.map((n) => ({ x1: CX, y1: CY, x2: n.x, y2: n.y }))

  return (
    <section id="skills" data-section="skills" className="section skills">
      <div className="section-head">
        <motion.span className="section-label mono" {...rise()}>{SKILLS.label}</motion.span>
        <motion.h2 className="section-heading" {...rise(0.1)}>{SKILLS.heading}</motion.h2>
      </div>

      <motion.div
        className="skill-net"
        data-active={active ?? ''}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1, ease }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="skill-net-svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {/* orbital rings */}
          <circle cx={CX} cy={CY} r="150" className="net-orbit" />
          <circle cx={CX} cy={CY} r="265" className="net-orbit" />
          <circle cx={CX} cy={CY} r="56" className="net-core-ring" />
          {/* connections */}
          {edges.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className={`skill-edge${nodes[i].skill === active ? ' is-active' : ''}`} />
          ))}
        </svg>

        {/* center node */}
        <div className={`net-core${active ? ' is-awake' : ''}`}
          style={{ left: `${(CX / W) * 100}%`, top: `${(CY / H) * 100}%` }}
        >
          <span className="net-core-dot" aria-hidden="true" />
          <span className="net-core-label">{SKILLS.core}</span>
        </div>

        {/* skill nodes */}
        {nodes.map((n, i) => (
          <button
            key={n.skill}
            className="skill-node"
            data-cursor="3d"
            aria-label={`${n.skill} — ${SKILLS.descriptions[n.skill] || 'skill'}`}
            onMouseEnter={() => setActive(n.skill)}
            onMouseLeave={() => setActive(active === n.skill ? null : active)}
            onFocus={() => setActive(n.skill)}
            onBlur={() => setActive(null)}
            style={{
              left: `${(n.x / W) * 100}%`,
              top: `${(n.y / H) * 100}%`,
              '--drift': `${2 + (i % 3)}s`,
            }}
          >
            <span className="skill-node-dot" aria-hidden="true" />
            <span className="skill-node-label">{n.skill}</span>
          </button>
        ))}

        {/* tooltip */}
        <div className={`net-tip${active ? ' is-visible' : ''}`}>
          {active && (
            <>
              <span className="net-tip-name">{active}</span>
              <span className="net-tip-desc mono">{SKILLS.descriptions[active] || 'Core skill'}</span>
            </>
          )}
        </div>
      </motion.div>
    </section>
  )
}