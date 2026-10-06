import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, getDotTexture } from './store'

// 3-5 thin orbital rings around the hero area, different speeds/angles,
// with tiny particles travelling along selected paths.
const RINGS = [
  { r: 3.0, tube: 0.008, rot: [1.35, 0.2, 0.15], speed: 0.10, opacity: 0.20 },
  { r: 3.7, tube: 0.007, rot: [1.05, -0.35, 0.4], speed: -0.07, opacity: 0.14 },
  { r: 4.5, tube: 0.006, rot: [1.5, 0.55, -0.2], speed: 0.05, opacity: 0.10 },
  { r: 5.4, tube: 0.005, rot: [1.2, 0.9, 0.25], speed: -0.04, opacity: 0.07 },
]

export default function OrbitalSystem() {
  const group = useRef()
  const movers = useRef([])
  const mobile = store.mobile
  const dot = useMemo(() => getDotTexture(), [])

  const orbits = useMemo(() => {
    const list = RINGS.map((ring, ri) => ({
      ...ring,
      dots: mobile && ri > 1 ? 0 : 1 + (ri % 2),
    }))
    return list
  }, [mobile])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const s = store.section
    const pt = store.pulse.t
    const boom = pt >= 0 && pt < 1.6 ? Math.max(0, 1 - pt / 1.6) : 0
    // Most prominent in the hero, quiet but present afterwards.
    const focus = s === 0 ? 1 : s === 5 ? 0.7 : 0.45
    if (group.current) {
      group.current.scale.setScalar(1 + boom * 0.5)
      group.current.rotation.z = Math.sin(t * 0.06) * 0.08
      group.current.position.x = 1.4 + store.pointer.x * 0.25
      group.current.position.y = 0.2 + store.pointer.y * 0.15
      group.current.children.forEach((child, i) => {
        if (i < orbits.length) child.rotation.z += dt * orbits[i].speed * (1 + boom * 5)
      })
    }
    movers.current.forEach((m) => {
      if (!m) return
      const { ri, phase, speed } = m.userData
      const a = phase + t * speed * (1 + boom * 4)
      const r = orbits[ri].r * (1 + boom * 0.6)
      m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0)
      m.material.opacity = 0.85 * focus
    })
  })

  return (
    <group ref={group} position={[1.4, 0.2, -2.2]}>
      {orbits.map((ring, ri) => (
        <group key={ri} rotation={ring.rot}>
          <mesh>
            <torusGeometry args={[ring.r, ring.tube, 8, 128]} />
            <meshBasicMaterial color="#4D8DFF" transparent opacity={ring.opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ring.r * 1.004, ring.tube * 0.5, 6, 96]} />
            <meshBasicMaterial color="#71A4FF" transparent opacity={ring.opacity * 0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          {Array.from({ length: ring.dots }).map((_, di) => (
            <mesh
              key={di}
              ref={(el) => { if (el) { el.userData = { ri, phase: Math.random() * Math.PI * 2, speed: ring.speed * (di === 0 ? 3.2 : -2.1) } ; movers.current.push(el) } }}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#C7DBFF" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
