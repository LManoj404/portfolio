import { motion } from 'framer-motion'
import { PROJECTS } from '../data/content'
import { projectItems } from '../data/gallery'
import StellarGallery from './gallery/StellarGallery'

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { delay, duration: 0.8, ease },
})

// 03 / PROJECTS — editorial head + reusable 3D stellar gallery.
export default function ProjectsUniverse() {
  return (
    <section id="projects" data-section="projects" className="section projects">
      <div className="section-head">
        <motion.span className="section-label mono" {...rise()}>{PROJECTS.label}</motion.span>
        <motion.h2 className="section-heading" {...rise(0.1)}>{PROJECTS.heading}</motion.h2>
      </div>
      <StellarGallery
        label="SELECTED WORK"
        title="PROJECT GALAXY"
        script="SELECTED WORK"
        meta="AI / DATA / WEB / 3D"
        items={projectItems}
      />
    </section>
  )
}

