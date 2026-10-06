import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, getDotTexture } from './store'

const STAR_COLORS = ['#F5F5F7', '#DCE6FF', '#71A4FF']
const DUST_COLORS = ['#4D8DFF', '#71A4FF', '#0B2A6B']

function makeGeometry(count, spread, palette, flat) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    const r = spread * (0.3 + Math.random() * 0.7)
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = flat ? (Math.random() - 0.5) * 12 : r * Math.cos(phi) * 0.6
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.85 - 5
    c.set(palette[(Math.random() * palette.length) | 0])
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return g
}

export default function Starfield() {
  const starsRef = useRef()
  const dustRef = useRef()
  const fgRef = useRef()
  const mobile = store.mobile

  const starsGeo = useMemo(() => makeGeometry(mobile ? 420 : 1400, 22, STAR_COLORS, false), [mobile])
  const dustGeo = useMemo(() => makeGeometry(mobile ? 110 : 340, 16, DUST_COLORS, false), [mobile])
  const fgGeo = useMemo(() => makeGeometry(mobile ? 30 : 90, 9, DUST_COLORS, true), [mobile])
  const dot = useMemo(() => getDotTexture(), [])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const pt = store.pulse.t
    const boom = pt >= 0 && pt < 1.6 ? Math.max(0, 1 - pt / 1.6) : 0
    if (starsRef.current) {
      starsRef.current.rotation.y += dt * 0.008
      starsRef.current.rotation.x = Math.sin(t * 0.05) * 0.02
      starsRef.current.scale.setScalar(1 + boom * 0.5)
    }
    if (dustRef.current) {
      dustRef.current.rotation.y -= dt * 0.02
      dustRef.current.position.y = Math.sin(t * 0.18) * 0.25
      dustRef.current.scale.setScalar(1 + boom * 0.8)
    }
    if (fgRef.current) {
      // Foreground layer drifts opposite the pointer for parallax depth.
      fgRef.current.position.x = -store.pointer.x * 0.55
      fgRef.current.position.y = -store.pointer.y * 0.3 + Math.sin(t * 0.22) * 0.15
      fgRef.current.rotation.z += dt * 0.01
      fgRef.current.scale.setScalar(1 + boom * 1.1)
    }
  })

  return (
    <group>
      <points ref={starsRef} geometry={starsGeo}>
        <pointsMaterial
          size={0.055}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={dot}
          alphaTest={0.01}
        />
      </points>
      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial
          size={0.14}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={dot}
          alphaTest={0.01}
        />
      </points>
      <points ref={fgRef} geometry={fgGeo} position={[0, 0, 4.5]}>
        <pointsMaterial
          size={0.1}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={dot}
          alphaTest={0.01}
        />
      </points>
    </group>
  )
}
