import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getDotTexture } from '../../scene/store'

// A faint technical grid drawn to a canvas (no external texture asset).
function makeGridTexture() {
  const s = 512
  const cv = document.createElement('canvas')
  cv.width = s
  cv.height = s
  const ctx = cv.getContext('2d')
  ctx.clearRect(0, 0, s, s)
  ctx.strokeStyle = 'rgba(120,165,255,0.85)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 8; i++) {
    const p = (i / 8) * s
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, s); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(s, p); ctx.stroke()
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 3)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Soft radial glow sprite (blue / violet atmosphere).
function makeGlowTexture(rgb) {
  const s = 256
  const cv = document.createElement('canvas')
  cv.width = s
  cv.height = s
  const ctx = cv.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, `rgba(${rgb},0.55)`)
  g.addColorStop(0.4, `rgba(${rgb},0.16)`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function buildLayer({ count, spread, zRange, colors, rng }) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rng() * 2 - 1) * spread[0]
    pos[i * 3 + 1] = (rng() * 2 - 1) * spread[1]
    pos[i * 3 + 2] = zRange[0] + rng() * (zRange[1] - zRange[0])
    c.set(colors[(rng() * colors.length) | 0])
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return geo
}

// Deterministic PRNG so the star layout never re-shuffles between renders.
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// Cinematic 3D atmosphere that lives in the SAME canvas as the lanyard, so it
// shares one WebGL context and one camera: real depth behind the card, star
// field / drifting dust / faint grid / blue+violet glow — no second renderer.
export default function Atmosphere({ reduced = false, mobile = false }) {
  const starCount = reduced ? 60 : mobile ? 170 : 430
  const dustCount = reduced ? 20 : mobile ? 60 : 130

  const dot = useMemo(() => getDotTexture(), [])
  const gridTex = useMemo(() => makeGridTexture(), [])
  const blueGlow = useMemo(() => makeGlowTexture('77,141,255'), [])
  const violetGlow = useMemo(() => makeGlowTexture('150,120,255'), [])

  const stars = useMemo(
    () => buildLayer({ count: starCount, spread: [17, 12], zRange: [-26, -2], colors: ['#ffffff', '#c7dbff', '#9fc2ff', '#71a4ff'], rng: mulberry32(2026) }),
    [starCount]
  )
  const dust = useMemo(
    () => buildLayer({ count: dustCount, spread: [7, 6], zRange: [-6, 5], colors: ['#71a4ff', '#c7dbff', '#9fc2ff'], rng: mulberry32(426) }),
    [dustCount]
  )

  const starRef = useRef()
  const dustRef = useRef()
  const gridRef = useRef()
  const glowRef = useRef()

  // Release GPU resources on unmount (no leaks).
  useEffect(() => () => {
    stars.dispose(); dust.dispose(); gridTex.dispose(); blueGlow.dispose(); violetGlow.dispose()
  }, [stars, dust, gridTex, blueGlow, violetGlow])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const k = reduced ? 0.15 : 1
    if (starRef.current) {
      starRef.current.rotation.z += dt * 0.012 * k
      starRef.current.rotation.x = Math.sin(t * 0.05) * 0.02 * k
    }
    if (dustRef.current) {
      dustRef.current.rotation.y += dt * 0.05 * k
      dustRef.current.position.y = Math.sin(t * 0.25) * 0.22 * k
    }
    if (gridRef.current) gridRef.current.material.opacity = 0.045 + Math.sin(t * 0.35) * 0.012 * k
    if (glowRef.current) {
      glowRef.current.rotation.z += dt * 0.02 * k
      const s = 1 + Math.sin(t * 0.3) * 0.03 * k
      glowRef.current.scale.set(s, s, 1)
    }
  })

  return (
    <group>
      {/* faint technical grid, far back */}
      <mesh ref={gridRef} position={[0, -1.6, -21]}>
        <planeGeometry args={[62, 40]} />
        <meshBasicMaterial map={gridTex} transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* soft radial light: blue + violet atmosphere */}
      <group ref={glowRef}>
        <mesh position={[2.6, 0.6, -15]}>
          <planeGeometry args={[26, 26]} />
          <meshBasicMaterial map={blueGlow} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[-4.4, -1.4, -17]}>
          <planeGeometry args={[22, 22]} />
          <meshBasicMaterial map={violetGlow} transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* star field */}
      <points ref={starRef} geometry={stars}>
        <pointsMaterial
          map={dot}
          vertexColors
          transparent
          opacity={0.72}
          size={0.085}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* floating dust around the card */}
      <points ref={dustRef} geometry={dust}>
        <pointsMaterial
          map={dot}
          vertexColors
          transparent
          opacity={0.45}
          size={0.05}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}