# Manoj — 3D Portfolio

A cinematic React + Three.js portfolio starter.

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Personalize before publishing

1. Replace `public/assets/manoj.png` with your preferred portrait.
2. In `src/App.jsx`, replace the placeholder email, LinkedIn and GitHub links.
3. Edit project descriptions in `src/data/content.js`.
4. Add your real resume PDF to `public/assets/` and connect it to a Resume button.
5. For a true animated 3D avatar, add a `.glb/.gltf` character and replace the portrait panel in `src/components/Scene.jsx` with `useGLTF`.
6. Export your Lottie intro animation and replace the placeholder `animationData` in `LottieIntro.jsx`.

## Architecture

- React + Vite
- Three.js via React Three Fiber
- Drei for 3D helpers
- Framer Motion for UI motion
- GSAP can be added for cinematic camera choreography
- Lottie integration included
- Responsive CSS fallback for mobile
