/* eslint-disable react/no-unknown-property */
// LANYARD — interactive physics identity card (the hero's centerpiece).
// Physics: @react-three/rapier · Rope: meshline · Card: original GLB geometry
// with a fully original procedural texture (Manoj's badge — no third-party art).
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'

import cardGLB from '../../assets/lanyard/card.glb'
import lanyard from '../../assets/lanyard/lanyard.png'
import { ensureRapier } from './rapierInit'
import { setCursor } from '../../scene/store'
import Atmosphere from './Atmosphere'
import { makeCardFront, makeCardBack, paintAtlas, makeCanvasTexture } from './cardTextures'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

// Fixed atlas dimensions — independent of any texture embedded in the model,
// so the 2.19MB baked-in third-party art can be stripped from card.glb.
const ATLAS_SIZE = 1024

// A finite {x,y,z} check used to keep NaN out of the rope geometry.
const isFiniteVec = (v) => !!v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)

// Desktop card enlargement (+20% over the previous 1.5: clearly readable,
// portrait proportionally larger, still breathing room). Mobile keeps 1× so
// the card never overflows the small viewport.
const SCALE = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 1.8

// card.glb geometry, measured from the asset itself (_audit/glbbounds.cjs):
//   card face  y 0.0229 → 1.0229, x ±0.3582   (1.0 tall × 0.7164 wide)
//   clamp      y 0.9324 → 1.1183
//   clip       y 1.1183 → 1.2294
// The card's bottom edge sits at the model origin, so the three pieces only stay
// assembled (clip threaded through the card's top slot) when they share ONE
// scale. The group therefore carries the full scale and is shifted so the card's
// centre lands on the rigid body: the collider then matches the visible card
// exactly and the rope joint attaches at the top of the clip — no gap, no
// invisible collider floating away from the badge.
const BASE_GROUP_SCALE = 2.25
const CARD_MIN_Y = 0.0229
const CARD_MAX_Y = 1.0229
const CLIP_TOP_Y = 1.2294
const CARD_HALF_X = 0.3582
const GROUP_SCALE = BASE_GROUP_SCALE * SCALE
const CARD_MID_Y = (CARD_MIN_Y + CARD_MAX_Y) / 2
const CARD_OFFSET_Y = -CARD_MID_Y * GROUP_SCALE // card centre → body centre
const CARD_ANCHOR_Y = (CLIP_TOP_Y - CARD_MID_Y) * GROUP_SCALE // clip top → body
const CARD_HALF_Y = ((CARD_MAX_Y - CARD_MIN_Y) / 2) * GROUP_SCALE

// Builds the card atlas: ALWAYS an original texture (dark base + our two
// faces), never the GLB's baked-in art, so no third-party branding can appear.
function makeAtlas(baseMap, designs) {
  if (!designs) return baseMap
  const W = ATLAS_SIZE
  const H = ATLAS_SIZE
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')
  if (!ctx) return baseMap
  paintAtlas(ctx, W, H, designs.front, designs.back)
  const t = makeCanvasTexture(cv)
  t.flipY = baseMap?.flipY ?? false
  return t
}

// Prepares the front/back face images: user URLs when provided, otherwise the
// original generated MANOJ badge (front, with portrait cutout) + back face.
function useCardDesigns(frontImage, backImage) {
  const [designs, setDesigns] = useState(null)
  useEffect(() => {
    let cancel = false
    const run = async () => {
      try {
        if (typeof document.fonts?.ready === 'object') await document.fonts.ready
        let front = null
        let back = null
        if (frontImage) {
          const img = new Image()
          img.src = frontImage
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
          front = img
        } else {
          const portrait = new Image()
          portrait.decoding = 'async'
          portrait.src = '/assets/id-photo.png'
          await new Promise((res) => { portrait.onload = res; portrait.onerror = res })
          front = makeCardFront(600, 900, portrait.complete && portrait.naturalWidth > 0 ? portrait : null)
        }
        if (backImage) {
          const img = new Image()
          img.src = backImage
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
          back = img
        } else {
          back = makeCardBack(600, 900)
        }
        if (!cancel) setDesigns({ front, back })
      } catch {
        if (!cancel) setDesigns({ front: null, back: null })
      }
    }
    void run()
    return () => { cancel = true }
  }, [frontImage, backImage])
  return designs
}

export default function Lanyard({
  position = [0, 0, 22],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  active = true,
  reduced = false,
  onState = null,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  // Warm up the Rapier WASM early so the physics world appears instantly.
  useEffect(() => { void ensureRapier().catch(() => {}) }, [])

  return (
    <div className={`lanyard-wrapper${active ? '' : ' is-away'}`}>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.35 : 1.75]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        {/* Cinematic 3D environment — star field, dust, grid, blue/violet glow */}
        <Atmosphere reduced={reduced} mobile={isMobile} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            reduced={reduced}
            onState={onState}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#9FC2FF" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#71A4FF" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}
function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  reduced = false,
  onState = null,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
}) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef()
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3()
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 }
  const { nodes, materials } = useGLTF(cardGLB)
  const texture = useTexture(lanyardImage || lanyard)
  const designs = useCardDesigns(frontImage, backImage)
  const cardMap = useMemo(() => makeAtlas(materials.base.map, designs), [materials.base.map, designs])
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  )
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)
  // Smoothed AI reaction intensity (idle → hover → drag).
  const reaction = useRef(reduced ? 0.25 : 0.14)
  const emittedState = useRef(null)
  const fxGroup = useRef(), scanRef = useRef(), scanMat = useRef(), ringMat = useRef()
  const orbitRefs = Array.from({ length: 8 }, () => useRef())
  const orbitPhases = useMemo(() => Array.from({ length: 8 }, () => Math.random() * Math.PI * 2), [])

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, CARD_ANCHOR_Y, 0]])

  // Publish the card's interaction state to the custom cursor
  // (DRAG while hovered, DRAGGING while held) — no React re-renders.
  useEffect(() => {
    if (dragged) setCursor('dragging', 'DRAGGING')
    else if (hovered) setCursor('drag', 'DRAG')
    else setCursor('default', '')
    return () => setCursor('default', '')
  }, [hovered, dragged])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => void (document.body.style.cursor = 'auto')
    }
  }, [hovered, dragged])

  // Report idle / hover / drag up to the DOM layer (hint text, cursor…).
  useEffect(() => {
    const state = dragged ? 'drag' : hovered ? 'hover' : null
    if (state !== emittedState.current) {
      emittedState.current = state
      onState?.(state)
    }
  }, [dragged, hovered, onState])

  // Seed the band with finite points immediately. Rapier's WASM init is async, so
  // for the first frames the geometry would otherwise hold an empty position
  // attribute and three.js would report a NaN bounding-sphere radius.
  useEffect(() => {
    const g = band.current?.geometry
    if (!g) return
    const pts = []
    for (let i = 0; i <= 32; i++) {
      const k = i / 32
      pts.push(new THREE.Vector3(1.5 * k, 4 - k * 5.5, 0))
    }
    g.setPoints(pts)
  }, [])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
    }
    if (fixed.current && j1.current && j2.current && j3.current && card.current) {
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
      })
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      // Guard: Rapier's WASM world is created asynchronously, so for the first
      // frames every joint reports (0,0,0). CatmullRom 'chordal' divides by the
      // distance between consecutive control points, so identical points divide
      // by zero → NaN positions, and meshline computes the bounding sphere on
      // every setPoints() → a three.js warning each frame. Nudge duplicates
      // apart and never hand NaN to the geometry.
      let finite = true
      for (let i = 0; i < 4; i++) if (!isFiniteVec(curve.points[i])) finite = false
      for (let i = 1; i < 4; i++) {
        if (curve.points[i].distanceToSquared(curve.points[i - 1]) < 1e-8) curve.points[i].z += 1e-3
      }
      if (finite) {
        const pts = curve.getPoints(isMobile ? 16 : 32)
        if (band.current && pts.every(isFiniteVec)) band.current.geometry.setPoints(pts)
      }
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }

    // ── AI reaction system: subtle idle → stronger hover → strongest drag ──
    const target = reduced ? 0.22 : dragged ? 1 : hovered ? 0.55 : 0.14
    reaction.current += (target - reaction.current) * (1 - Math.exp(-3.2 * delta))
    const r = reaction.current
    const t = state.clock.elapsedTime
    if (fxGroup.current) {
      fxGroup.current.visible = r > 0.02
      fxGroup.current.position.copy(card.current?.translation() ?? new THREE.Vector3())
      fxGroup.current.children.forEach((child, i) => {
        // orbiting holographic nodes around the card
        const speed = 0.5 + r * 1.4
        const a = orbitPhases[i] + t * speed
        const rad = 1.9 + (i % 2) * 0.35
        child.position.set(Math.cos(a) * rad, Math.sin(a) * rad * 0.78, Math.sin(a * 0.5) * 0.25 - 0.06)
        child.material.opacity = 0.12 + r * 0.5
      })
    }
    if (ringMat.current) ringMat.current.opacity = 0.045 + r * 0.3
    if (scanMat.current) {
      scanMat.current.opacity = r > 0.3 ? (r - 0.3) * 0.9 : 0
      if (scanRef.current) scanRef.current.position.y = Math.sin(t * 2.6) * 1.05
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return (
    <>
      <group position={[0, 5.6, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2.8, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[CARD_HALF_X * GROUP_SCALE, CARD_HALF_Y, 0.02]} />
          <group
            scale={GROUP_SCALE}
            position={[0, CARD_OFFSET_Y, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            {/* ── card + clamp + clip: ONE assembly, exactly as authored ── */}
            <mesh geometry={nodes.card.geometry} castShadow>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      {/* AI reaction FX — follows the card; subtle idle, brighter hover, full drag */}
      <group ref={fxGroup} visible={false}>
        {orbitRefs.map((ref, i) => (
          <mesh key={i} ref={ref}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#71A4FF" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2.15, 0, 0]}>
          <torusGeometry args={[2.1, 0.006, 6, 120]} />
          <meshBasicMaterial ref={ringMat} color="#4D8DFF" transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={scanRef} position={[0, 0, 0.12]}>
          <planeGeometry args={[1.7, 0.03]} />
          <meshBasicMaterial ref={scanMat} color="#71A4FF" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  )
}