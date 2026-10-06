/* eslint-disable react/no-unknown-property */
// STELLAR GALLERY — reusable 3D card galaxy adapted from the 21st.dev
// 3d-image-gallery interaction model (golden-ratio sphere, floating cards,
// OrbitControls drag/zoom, hover, click → modal), fully restyled to the
// Manoj portfolio identity: black cinematic, electric blue / violet glow.
// Data-driven: pass `items`. No demo content lives here.
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

// Golden-ratio spherical distribution (21st.dev core model, preserved).
function spherePositions(count, radius) {
  const pts = []
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN_ANGLE * i
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius * 0.72, Math.sin(theta) * r * radius))
  }
  return pts
}

// Honest abstract visuals — decorative SVG motifs per item. Never a fake
// screenshot, never a stock photo. Real `image` URLs render on top of this.
function CardVisual({ item, large }) {
  const seed = parseInt(String(item.num || '1'), 10) || 1
  const nodes = useMemo(() => {
    const arr = []
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + seed * 0.7
      const r = 20 + ((seed * 11 + i * 17) % 24)
      arr.push([60 + Math.cos(a) * r, 42 + Math.sin(a) * r * 0.7])
    }
    return arr
  }, [seed])
  const isCert = item.visual === 'certificate' || item.kind === 'certificate'
  return (
    <div className={`sg-visual${large ? ' sg-visual-large' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 120 84" preserveAspectRatio="xMidYMid slice">
        {isCert ? (
          <>
            <rect x="28" y="16" width="64" height="52" rx="3" className="sgv-frame" />
            <rect x="34" y="24" width="52" height="3" className="sgv-bar" />
            <rect x="40" y="32" width="40" height="2" className="sgv-bar-dim" />
            <circle cx="60" cy="49" r="8" className="sgv-orbit" />
            <path d="M52 49l5 5 9-10" className="sgv-check" />
            <rect x="42" y="60" width="36" height="2" className="sgv-bar-dim" />
          </>
        ) : (
          <>
            <circle cx="60" cy="42" r={26 + seed * 2} className="sgv-orbit" />
            <circle cx="60" cy="42" r={13 + seed} className="sgv-orbit sgv-orbit2" />
            {nodes.map(([x, y], i) => (
              <g key={i}>
                <line x1="60" y1="42" x2={x} y2={y} className="sgv-line" />
                <circle cx={x} cy={y} r="1.7" className="sgv-node" />
              </g>
            ))}
            <circle cx="60" cy="42" r="2.8" className="sgv-core" />
            <rect x="4" y="4" width="112" height="76" className="sgv-frame" />
          </>
        )}
      </svg>
      <span className="sg-visual-num mono">{item.num}</span>
    </div>
  )
}

// Card face rendered inside the 3D scene via drei Html. Real image when
// present; otherwise the abstract motif (certificates get an explicit
// "IMAGE COMING SOON" placeholder instead of any broken img).
function CardFace({ item, hovered, onOpen }) {
  const hasImage = Boolean(item.image)
  const isCert = item.visual === 'certificate' || item.kind === 'certificate'
  return (
    <button
      type="button"
      className={`sg-card${hovered ? ' is-hover' : ''}`}
      onClick={onOpen}
      aria-label={`Open details for ${item.title}`}
      data-cursor="3d"
    >
      <div className="sg-card-top">
        {hasImage ? (
          <img src={item.image} alt={`${item.title} preview`} className="sg-img" loading="lazy" draggable={false} />
        ) : (
          <CardVisual item={item} />
        )}
        {isCert && !hasImage && (
          <span className="sg-coming mono">CERTIFICATE<br />IMAGE COMING SOON</span>
        )}
        <span className="sg-num mono">{item.num}</span>
      </div>
      <span className="sg-cat mono">{item.category}</span>
      <span className="sg-title">{item.title}</span>
      <span className="sg-tags">{(item.tech || []).slice(0, 3).map((t) => <em key={t}>{t}</em>)}</span>
      <span className="sg-open mono">OPEN ↗</span>
    </button>
  )
}

// One floating card: gentle float + billboard to face the camera,
// hover glow/scale, click opens the modal.
function FloatingCard({ item, position, hovered, onHover, onOpen }) {
  const group = useRef()
  const seed = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame(({ clock, camera }) => {
    const g = group.current
    if (!g) return
    const t = clock.getElapsedTime()
    g.position.set(
      position.x,
      position.y + Math.sin(t * 0.7 + seed) * 0.35,
      position.z,
    )
    g.quaternion.copy(camera.quaternion)
    const s = hovered ? 1.12 : 1
    g.scale.lerp(new THREE.Vector3(s, s, s), 0.12)
  })
  return (
    <group ref={group} position={position}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover(item.id); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = '' }}
        onClick={(e) => { e.stopPropagation(); onOpen(item) }}
      >
        <planeGeometry args={[5.4, 7.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html transform distanceFactor={11} position={[0, 0, 0.05]} occlude="blending" zIndexRange={[30, 0]}>
        <CardFace item={item} hovered={hovered} onOpen={() => onOpen(item)} />
      </Html>
    </group>
  )
}

// Modal: black glass, blue/violet border, tilt-on-mousemove preview.
// VIEW DETAILS (scroll hint) + GITHUB only when a real URL exists.
function GalleryModal({ item, onClose }) {
  const tilt = useRef()
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])
  const onTilt = (e) => {
    const el = tilt.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
  }
  const resetTilt = () => { if (tilt.current) tilt.current.style.transform = '' }
  return (
    <motion.div className="modal-backdrop sg-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={onClose}>
      <motion.div
        className="modal sg-modal" role="dialog" aria-modal="true" aria-label={item.title}
        initial={{ opacity: 0, y: 48, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={`Close details for ${item.title}`}>✕</button>
        <div ref={tilt} className="sg-modal-visual" onMouseMove={onTilt} onMouseLeave={resetTilt}>
          {item.image
            ? <img src={item.image} alt={`${item.title} preview`} className="sg-modal-img" draggable={false} />
            : <CardVisual item={item} large />}
          {(!item.image && (item.visual === 'certificate' || item.kind === 'certificate')) && (
            <span className="sg-coming mono">CERTIFICATE<br />IMAGE COMING SOON</span>
          )}
        </div>
        <div className="modal-body">
          <span className="modal-cat mono">{item.category}</span>
          <h3 className="modal-title">{item.title}</h3>
          {(item.org || item.dates || item.mode) && (
            <p className="sg-meta mono">{[item.org, item.dates, item.mode].filter(Boolean).join(' · ')}</p>
          )}
          {(item.issuer || item.year) && (
            <p className="sg-meta mono">{[item.issuer, item.year].filter(Boolean).join(' · ')}</p>
          )}
          <p className="modal-desc">{item.desc}</p>
          {item.tech && item.tech.length > 0 && (
            <div className="modal-block">
              <h4 className="mono">TECHNOLOGIES</h4>
              <div className="modal-chips">{item.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </div>
          )}
          {item.features && item.features.length > 0 && (
            <div className="modal-block">
              <h4 className="mono">KEY FEATURES</h4>
              <ul className="modal-features">
                {item.features.map((f) => <li key={f}><span aria-hidden="true">▸</span>{f}</li>)}
              </ul>
            </div>
          )}
          <div className="sg-actions">
            {item.github && (
              <a className="btn btn-ghost" href={item.github} target="_blank" rel="noreferrer">GITHUB ↗</a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Reusable section: editorial heading + one 3D galaxy canvas.
// Canvas mounts only when near the viewport (perf: max 1 active at a
// time is typical while scrolling). OrbitControls: rotate + zoom, no pan.
export default function StellarGallery({ id, label, title, script, meta, items, hint }) {
  const [hovered, setHovered] = useState(null)
  const [open, setOpen] = useState(null)
  const [near, setNear] = useState(false)
  const host = useRef()
  useEffect(() => {
    const el = host.current
    if (!el || !('IntersectionObserver' in window)) { setNear(true); return undefined }
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const positions = useMemo(() => spherePositions(items.length, 7.5), [items.length])
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <div className="sg" ref={host}>
      <div className="sg-head">
        <span className="section-label mono">{label}</span>
        <h2 className="section-heading">{title}</h2>
        {script && <p className="sg-script" aria-hidden="true">{script}</p>}
        {meta && <p className="sg-meta-line mono">{meta}</p>}
      </div>
      <div className="sg-canvas-wrap" data-cursor="3d">
        {near ? (
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.6, mobile ? 20 : 16], fov: 50 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} intensity={1.1} color="#71a4ff" />
              <pointLight position={[-10, -6, -6]} intensity={0.5} color="#8b5cf6" />
              <Stars radius={60} depth={30} count={mobile ? 1200 : 2600} factor={3} saturation={0} fade speed={0.6} />
              <Sparkles count={mobile ? 30 : 70} scale={[16, 10, 16]} size={2} speed={0.25} color="#71a4ff" opacity={0.5} />
              {items.map((item, i) => (
                <FloatingCard
                  key={item.id}
                  item={item}
                  position={positions[i]}
                  hovered={hovered === item.id}
                  onHover={setHovered}
                  onOpen={setOpen}
                />
              ))}
              <OrbitControls
                enablePan={false}
                enableZoom
                enableRotate
                rotateSpeed={0.55}
                zoomSpeed={0.7}
                minDistance={8}
                maxDistance={30}
                makeDefault
              />
            </Suspense>
          </Canvas>
        ) : (
          <div className="sg-canvas-idle" aria-hidden="true" />
        )}
        <p className="sg-hint mono" aria-hidden="true">{hint || 'DRAG TO ROTATE · SCROLL TO ZOOM · CLICK A CARD'}</p>
      </div>
      <AnimatePresence>
        {open && <GalleryModal item={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  )
}
