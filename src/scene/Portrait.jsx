import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store, triggerPulse } from './store'

// The hero portrait: a real transparent cutout of Manoj rendered as a large
// cinematic object inside the 3D scene — floating, breathing, parallaxing,
// with blue rim light + atmospheric glow behind. Swap TEXTURE_URL for a GLB
// avatar later; every effect here is independent of the source asset.
const TEXTURE_URL = '/assets/manoj-cutout.webp'

function makeGlowTexture() {
  const size = 256
  const cv = document.createElement('canvas')
  cv.width = size
  cv.height = size
  const ctx = cv.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(77,141,255,0.55)')
  g.addColorStop(0.35, 'rgba(77,141,255,0.22)')
  g.addColorStop(0.65, 'rgba(11,42,107,0.10)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Pre-flight the cutout with a plain Image() so a failed asset never reaches
// THREE.TextureLoader (which logs console errors). The halo/rim environment
// keeps animating even if the portrait itself is unavailable.
function usePortraitTexture(url) {
  const [tex, setTex] = useState(null)
  useEffect(() => {
    let cancel = false
    const img = new Image()
    img.onload = () => {
      if (cancel) return
      new THREE.TextureLoader().load(
        url,
        (t) => { if (!cancel) { t.colorSpace = THREE.SRGBColorSpace; setTex(t) } },
        undefined,
        () => { /* silent */ }
      )
    }
    img.onerror = () => { /* silent — glow/rings remain, no crash */ }
    img.src = url
    return () => { cancel = true }
  }, [url])
  return tex
}

export default function Portrait() {
  const tex = usePortraitTexture(TEXTURE_URL)
  const ready = !!tex
  const group = useRef()
  const portraitMat = useRef()
  const rimMat = useRef()
  const glowMat = useRef()

  const glowTex = makeGlowTexture()
  const aspect = ready ? (tex.image?.width || 3) / (tex.image?.height || 4) : 0.72
  const mobile = store.mobile
  const height = mobile ? 4.4 : 5.7
  const width = height * Math.min(aspect, 1.1)
  const base = mobile ? [0.55, -0.45, -1.6] : [1.45, 0.05, -1.2]

  const vis = useRef(1)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const s = store.section
    const targetVis = s === 0 ? 0 : s === 1 ? 0.45 : 0
    vis.current = THREE.MathUtils.lerp(vis.current, targetVis, 1 - Math.exp(-2.4 * dt))
    const v = vis.current
    if (!group.current) return

    // Elegant idle motion — slow float, breathing scale, pointer parallax.
    group.current.position.y = base[1] + Math.sin(t * 0.5) * 0.07 + store.pointer.y * 0.06
    group.current.position.x = base[0] + store.pointer.x * 0.1 + (1 - v) * 0.8
    group.current.position.z = base[2] + (1 - v) * -2.6
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, store.pointer.x * 0.09, 1 - Math.exp(-3 * dt))
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -store.pointer.y * 0.045, 1 - Math.exp(-3 * dt))
    const breath = 1 + Math.sin(t * 0.42) * 0.012
    const pt = store.pulse.t
    const boom = pt >= 0 && pt < 1.4 ? Math.max(0, 1 - pt / 1.4) : 0
    const sc = (0.82 + 0.18 * v) * breath * (1 + boom * 0.12)
    group.current.scale.setScalar(sc)

    if (portraitMat.current) portraitMat.current.opacity = v * 0.98
    if (rimMat.current) rimMat.current.opacity = v * (ready ? 0.55 : 0.85)
    if (glowMat.current) glowMat.current.opacity = v * (ready ? 0.6 : 0.8)
  })

  return (
    <group ref={group} position={base}>
      {/* Atmospheric glow behind the subject — always present */}
      <mesh position={[0.1, 0.15, -0.6]} renderOrder={4}>
        <planeGeometry args={[height * 1.9, height * 1.9]} />
        <meshBasicMaterial
          ref={glowMat}
          map={glowTex}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Blue rim silhouette slightly behind the cutout */}
      {ready && (
        <mesh position={[0.045, -0.02, -0.045]} scale={1.015} renderOrder={8}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            ref={rimMat}
            map={tex}
            color="#4D8DFF"
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      )}
      {/* The portrait itself — clickable: fires the AI activation pulse */}
      {ready && (
        <mesh
          renderOrder={10}
          onClick={(e) => { e.stopPropagation(); triggerPulse() }}
          onPointerUp={(e) => { e.stopPropagation(); triggerPulse() }}
        >
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            ref={portraitMat}
            map={tex}
            transparent
            opacity={0.98}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}
