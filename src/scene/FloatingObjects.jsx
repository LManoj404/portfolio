import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, getDotTexture } from './store'

// Subtle futuristic objects around the environment: wireframe cubes,
// octahedra, glass panels and tiny glints — kept away from the text zone.
const SPECS = [
  { type: 'box', pos: [-5.2, 1.6, -3.5], s: 0.5, speed: 0.12 },
  { type: 'octa', pos: [-3.4, -1.8, -2.8], s: 0.34, speed: -0.2 },
  { type: 'panel', pos: [-4.4, 0.2, -5.5], s: 1.1, speed: 0.05 },
  { type: 'box', pos: [4.8, -1.6, -3.2], s: 0.42, speed: -0.16 },
  { type: 'octa', pos: [5.6, 1.9, -4.8], s: 0.3, speed: 0.24 },
  { type: 'panel', pos: [4.2, 2.3, -6.5], s: 0.9, speed: -0.04 },
  { type: 'octa', pos: [-2.2, 2.6, -6.0], s: 0.26, speed: 0.3 },
  { type: 'box', pos: [2.9, -2.4, -4.5], s: 0.36, speed: 0.18 },
  { type: 'octa', pos: [-5.8, -0.9, -6.8], s: 0.28, speed: -0.26 },
]

export default function FloatingObjects() {
  const group = useRef()
  const mobile = store.mobile
  const dot = useMemo(() => getDotTexture(), [])
  const items = useMemo(() => (mobile ? SPECS.slice(0, 5) : SPECS), [])
  const glints = useMemo(() => {
    const count = mobile ? 14 : 34
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = -2 - Math.random() * 6
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [mobile])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const pt = store.pulse.t
    const boom = pt >= 0 && pt < 1.5 ? Math.max(0, 1 - pt / 1.5) : 0
    if (!group.current) return
    group.current.scale.setScalar(1 + boom * 0.6)
    group.current.children.forEach((child, i) => {
      if (i >= items.length) return
      const spec = items[i]
      child.rotation.x += dt * spec.speed * 0.6 * (1 + boom * 3)
      child.rotation.y += dt * spec.speed * (1 + boom * 3)
      child.position.y = spec.pos[1] + Math.sin(t * 0.4 + i * 1.7) * 0.18
      child.position.x = spec.pos[0] + Math.cos(t * 0.25 + i) * 0.1
    })
    group.current.position.x = store.pointer.x * -0.12
    group.current.position.y = store.pointer.y * -0.08
  })

  return (
    <group ref={group}>
      {items.map((spec, i) => (
        <group key={i} position={spec.pos}>
          {spec.type === 'box' && (
            <mesh>
              <boxGeometry args={[spec.s, spec.s, spec.s]} />
              <meshBasicMaterial color="#4D8DFF" wireframe transparent opacity={0.28} depthWrite={false} />
            </mesh>
          )}
          {spec.type === 'octa' && (
            <mesh>
              <octahedronGeometry args={[spec.s, 0]} />
              <meshBasicMaterial color="#71A4FF" wireframe transparent opacity={0.3} depthWrite={false} />
            </mesh>
          )}
          {spec.type === 'panel' && (
            <group>
              <mesh>
                <planeGeometry args={[spec.s, spec.s * 0.64]} />
                <meshBasicMaterial color="#0B2A6B" transparent opacity={0.12} depthWrite={false} side={THREE.DoubleSide} />
              </mesh>
              <mesh>
                <planeGeometry args={[spec.s, spec.s * 0.64]} />
                <meshBasicMaterial color="#4D8DFF" wireframe transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </group>
      ))}
      <points geometry={glints}>
        <pointsMaterial
          size={0.08}
          sizeAttenuation
          color="#71A4FF"
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={dot}
          alphaTest={0.01}
        />
      </points>
    </group>
  )
}
