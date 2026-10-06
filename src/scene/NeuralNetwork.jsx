import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, getDotTexture } from './store'

// Clustered neural network — three lobes, k-nearest connections inside each
// cluster so it reads as structured intelligence, never a random spider web.
const CLUSTERS = [
  { center: [-4.4, 0.7, -5.5], count: 26, radius: 1.9, link: 1.7 },
  { center: [0.6, 0.1, -7.0], count: 34, radius: 2.4, link: 2.1 },
  { center: [4.6, 0.9, -6.0], count: 22, radius: 1.7, link: 1.6 },
]

function buildNetwork(mobile) {
  const nodes = []
  const positions = []
  const links = []
  CLUSTERS.forEach((cl, ci) => {
    const n = mobile ? Math.round(cl.count * 0.55) : cl.count
    const pts = []
    for (let i = 0; i < n; i++) {
      const r = cl.radius * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const p = new THREE.Vector3(
        cl.center[0] + r * Math.sin(phi) * Math.cos(theta),
        cl.center[1] + r * Math.cos(phi) * 0.75,
        cl.center[2] + r * Math.sin(phi) * Math.sin(theta)
      )
      pts.push(p)
      nodes.push(p)
    }
    for (let i = 0; i < pts.length; i++) {
      const dists = pts
        .map((q, j) => ({ j, d: pts[i].distanceTo(q) }))
        .filter((o) => o.j !== i && o.d < cl.link)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
      dists.forEach(({ j }) => {
        if (!links.some((l) => (l.a === j && l.b === i && l.c === ci))) links.push({ a: i + positions.length / 3, b: j + positions.length / 3, c: ci })
      })
    }
    positions.push(...pts.map((p) => [p.x, p.y, p.z]).flat())
  })
  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const linePos = new Float32Array(links.length * 6)
  links.forEach((l, i) => {
    const a = nodes[l.a]
    const b = nodes[l.b]
    linePos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6)
  })
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
  return { nodeGeo, lineGeo, links, nodes }
}

export default function NeuralNetwork() {
  const group = useRef()
  const nodesMat = useRef()
  const linesMat = useRef()
  const pulsesRef = useRef()
  const mobile = store.mobile
  const dot = useMemo(() => getDotTexture(), [])
  const net = useMemo(() => buildNetwork(mobile), [mobile])

  // Travelling energy pulses along random connections.
  const pulses = useMemo(() => {
    const n = mobile ? 4 : 8
    return Array.from({ length: n }, () => ({
      link: (Math.random() * net.links.length) | 0,
      t: Math.random(),
      speed: 0.18 + Math.random() * 0.22,
    }))
  }, [mobile, net])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const s = store.section
    const pulseK = store.pulse.t >= 0 && store.pulse.t < 1.4 ? Math.max(0, 1 - store.pulse.t / 1.4) : 0
    // Brighter while About/Skills are in focus, dimmer elsewhere.
    const focus = s === 1 ? 1 : s === 2 ? 1.25 : s === 0 ? 0.55 : 0.3
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.05) * 0.12 + store.pointer.x * 0.05
      group.current.position.y = Math.sin(t * 0.16) * 0.15
      group.current.scale.setScalar(1 + pulseK * 0.18)
    }
    if (nodesMat.current) {
      nodesMat.current.size = 0.16 + Math.sin(t * 1.6) * 0.03 + focus * 0.03 + pulseK * 0.2
      nodesMat.current.opacity = (0.9 + pulseK * 0.5) * Math.min(focus + pulseK, 1)
    }
    if (linesMat.current) linesMat.current.opacity = 0.16 * Math.min(focus + 0.15, 1) + pulseK * 0.3
    if (pulsesRef.current) {
      const arr = pulsesRef.current.userData.pulses
      if (arr) {
        arr.forEach((p, i) => {
          p.t += dt * p.speed * (1 + pulseK * 4)
          if (p.t > 1) {
            p.t = 0
            p.link = (Math.random() * net.links.length) | 0
          }
          const l = net.links[p.link]
          if (!l) return
          const a = net.nodes[l.a]
          const b = net.nodes[l.b]
          const m = pulsesRef.current.children[i]
          if (m) m.position.lerpVectors(a, b, p.t)
        })
      }
    }
  })

  return (
    <group ref={group}>
      <lineSegments geometry={net.lineGeo}>
        <lineBasicMaterial ref={linesMat} color="#4D8DFF" transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points geometry={net.nodeGeo}>
        <pointsMaterial
          ref={nodesMat}
          size={0.16}
          sizeAttenuation
          color="#9FC2FF"
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={dot}
          alphaTest={0.01}
        />
      </points>
      <group ref={pulsesRef} userData={{ pulses }}>
        {pulses.map((p, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#71A4FF" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
