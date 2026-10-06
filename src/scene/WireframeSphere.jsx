import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, getDotTexture } from './store'

// Large wireframe sphere sitting behind / beside the portrait.
// Slowly rotates, reacts subtly to the pointer, contains small particles.
export default function WireframeSphere() {
  const group = useRef()
  const inner = useRef()
  const mobile = store.mobile

  const innerGeo = useMemo(() => {
    const count = mobile ? 60 : 150
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.6 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [mobile])
  const dot = useMemo(() => getDotTexture(), [])

  const target = useRef({ rx: 0, ry: 0 })

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const pt = store.pulse.t
    const boom = pt >= 0 && pt < 1.5 ? Math.max(0, 1 - pt / 1.5) : 0
    if (group.current) {
      // Subtle pointer reaction, smoothly interpolated.
      target.current.ry = store.pointer.x * 0.12
      target.current.rx = -store.pointer.y * 0.08
      group.current.rotation.y += dt * 0.05
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x % (Math.PI * 2),
        target.current.rx + Math.sin(t * 0.1) * 0.05,
        1 - Math.exp(-2 * dt)
      )
      group.current.position.x = 2.2 + store.pointer.x * 0.18
      group.current.position.y = 0.3 + store.pointer.y * 0.12 + Math.sin(t * 0.35) * 0.08
      group.current.scale.setScalar(1 + boom * 0.35)
    }
    if (inner.current) inner.current.rotation.y -= dt * 0.03
  })

  return (
    <group ref={group} position={[2.2, 0.3, -4.5]}>
      <mesh>
        <icosahedronGeometry args={[2.6, 2]} />
        <meshBasicMaterial color="#4D8DFF" wireframe transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh scale={1.35}>
        <icosahedronGeometry args={[2.6, 1]} />
        <meshBasicMaterial color="#0B2A6B" wireframe transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <points ref={inner} geometry={innerGeo}>
        <pointsMaterial
          size={0.05}
          sizeAttenuation
          color="#71A4FF"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={dot}
          alphaTest={0.01}
        />
      </points>
    </group>
  )
}
