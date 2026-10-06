import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, tickPulse, triggerPulse } from './store'
import Starfield from './Starfield'
import NeuralNetwork from './NeuralNetwork'
import WireframeSphere from './WireframeSphere'
import OrbitalSystem from './OrbitalSystem'
import FloatingObjects from './FloatingObjects'
import ErrorBoundary from '../components/ErrorBoundary'

// Camera waypoints per section: [position, lookAt]
const WAYPOINTS = [
  [[0, 0.2, 9], [0, 0, 0]], // hero — lanyard card is the centerpiece
  [[-1.2, 0.5, 10.5], [0.6, 0.4, -3]], // about — recede, network brightens
  [[1.6, 0.3, 11.5], [0.2, 0.5, -5]], // skills — neural system focus
  [[-0.9, 0.7, 13.5], [0, 0.3, -6]], // projects — wide universe
  [[0.5, 1.5, 12.0], [0, 0.9, -4]], // journey — elevated view
  [[0, 0.25, 10.2], [0, 0.35, 0]], // contact — settle
]

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _lookCur = new THREE.Vector3(0, 0, 0)

function CameraRig() {
  useFrame((state, dt) => {
    const i0 = Math.min(WAYPOINTS.length - 1, store.section)
    const i1 = Math.min(WAYPOINTS.length - 1, i0 + 1)
    const f = store.sectionT
    const [p0, l0] = WAYPOINTS[i0]
    const [p1, l1] = WAYPOINTS[i1]
    _pos.set(
      THREE.MathUtils.lerp(p0[0], p1[0], f) + store.pointer.x * 0.3,
      THREE.MathUtils.lerp(p0[1], p1[1], f) + store.pointer.y * 0.18,
      THREE.MathUtils.lerp(p0[2], p1[2], f)
    )
    _look.set(THREE.MathUtils.lerp(l0[0], l1[0], f), THREE.MathUtils.lerp(l0[1], l1[1], f), THREE.MathUtils.lerp(l0[2], l1[2], f))
    const k = 1 - Math.exp(-2.4 * dt)
    state.camera.position.lerp(_pos, k)
    _lookCur.lerp(_look, k)
    state.camera.lookAt(_lookCur)
  })
  return null
}

// One very faint ring passing IN FRONT of the portrait for depth.
function FrontRing() {
  const ref = useRef()
  useFrame((state, dt) => {
    if (!ref.current) return
    ref.current.rotation.z += dt * 0.06
    const v = store.section === 0 ? 0.05 : 0.02
    ref.current.material.opacity = v
  })
  return (
    <mesh ref={ref} position={[0.7, 0.1, 1.2]} rotation={[1.3, 0.3, 0]}>
      <torusGeometry args={[3.4, 0.006, 6, 96]} />
      <meshBasicMaterial color="#71A4FF" transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

// Runs the activation clock and triggers the "AI boot" pulse at the right
// moments: when the site starts, and whenever the user scrolls back to hero.
function ActivationController({ started }) {
  const prevStarted = useRef(false)
  const prevSection = useRef(-1)
  useFrame((_state, dt) => {
    tickPulse(dt)
    if (started && !prevStarted.current) triggerPulse()
    if (prevSection.current !== -1 && prevSection.current !== 0 && store.section === 0) triggerPulse()
    prevStarted.current = started
    prevSection.current = store.section
  })
  return null
}

// Expanding blue energy rings that fire from the portrait during an activation.
function PulseShockwave() {
  const rings = [useRef(), useRef()]
  useFrame(() => {
    const pt = store.pulse.t
    const active = pt >= 0 && pt < 1.8
    rings.forEach((r, i) => {
      const el = r.current
      if (!el) return
      const rp = (pt - i * 0.16) / 1.8
      el.visible = active && rp >= 0
      if (rp >= 0 && rp <= 1) {
        el.scale.setScalar(1 + rp * 7)
        el.material.opacity = (i === 0 ? 0.8 : 0.5) * (1 - rp)
      }
    })
  })
  return (
    <>
      <mesh ref={rings[0]} position={[0, 0.4, -1.2]} visible={false}>
        <torusGeometry args={[0.9, 0.012, 8, 120]} />
        <meshBasicMaterial color="#4D8DFF" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={rings[1]} position={[0, 0.4, -1.3]} visible={false}>
        <torusGeometry args={[1.25, 0.01, 8, 120]} />
        <meshBasicMaterial color="#71A4FF" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  )
}

export default function SceneRoot({ started }) {
  const mobile = store.mobile
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.5 : 1.75]}
        camera={{ fov: 42, position: [0, 0.2, 9], near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
      >
        <fog attach="fog" args={['#000000', 13, 34]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 3, 6]} intensity={0.5} color="#9FC2FF" />
        <pointLight position={[-3, 1, -4]} intensity={22} distance={18} color="#4D8DFF" />
        <pointLight position={[5, 2, -6]} intensity={16} distance={18} color="#0B2A6B" />
        <CameraRig />
        <ActivationController started={started} />
        <PulseShockwave />
        <Starfield />
        <WireframeSphere />
        <ErrorBoundary fallback={null}>
          <OrbitalSystem />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <NeuralNetwork />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <FloatingObjects />
        </ErrorBoundary>
        <FrontRing />
      </Canvas>
    </div>
  )
}
