// ─────────────────────────────────────────────────────────────
// PROFILE — single file to edit everything personal.
// Edit these values; every section of the site updates.
// ─────────────────────────────────────────────────────────────

export const PROFILE = {
  // Identity
  name: 'MANOJ L.',
  mark: 'ML/26',
  role: 'AI & DATA SCIENCE DEVELOPER',
  tags: 'AI / DATA / WEB / 3D',
  location: 'Tamil Nadu, India',

  // Contact — use real values only; leave empty to show a clear "configure me" hint.
  email: 'manojservices.ai@gmail.com',
  linkedin: 'https://linkedin.com/in/manoj404',
  // GITHUB_URL — paste your GitHub profile URL, e.g. 'https://github.com/yourname'
  github: '',
  // WHATSAPP_NUMBER — digits only with country code, no "+" or spaces.
  // Example: '919876543210' → opens https://wa.me/919876543210
  whatsapp: '',

  // Education
  education: {
    degree: 'B.Tech — Artificial Intelligence & Data Science',
    school: 'Panimalar Engineering College, Chennai',
    years: '2022 – 2026',
  },

  // Short pitches used across the site
  intro:
    "I'm Manoj, an AI & Data Science developer focused on turning complex ideas into useful products. My work spans machine learning, data analytics, computer vision and full-stack development.",
  statement:
    'I enjoy the intersection between logic and visual experience — from AI-powered applications and data-driven systems to immersive web experiences.',

  // Core skills — shown in the Skills universe
  skills: [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Data Analytics',
    'Python', 'Java', 'JavaScript', 'SQL', 'HTML', 'CSS', 'PHP',
    'React', 'Node.js', 'MongoDB', 'Database', 'Power BI',
    'Computer Vision', 'Three.js', 'Frontend Development',
    'Deep Learning', 'NumPy', 'Pandas', 'Excel',
    'Unity', 'Blender', 'AR', 'VR', 'WebXR',
  ],

  // Projects — order = display order (01 → 04)
  projects: [
    {
      id: 'build-my-home', num: '01',
      title: 'BUILD MY HOME',
      category: 'AI / PROPERTY / PLANNING',
      tech: ['React', 'Node.js', 'MongoDB', 'AI', '3D'],
      desc: 'AI-powered property visualization and construction resource optimization — visualize home concepts, explore materials, compare quantities and prices.',
      objective: 'Build an AI-assisted planning platform that turns property ideas into measurable, visual construction plans with resource awareness.',
      features: [
        'AI-powered property visualization',
        'Construction resource optimization',
        'Material comparison: quantities & prices',
        'Interactive construction information',
      ],
      role: 'Full-Stack Developer — React UI, Node.js API, MongoDB schema, 3D visualization layer.',
    },
    {
      id: 'lm-trading-erp', num: '02',
      title: 'LM TRADING ERP',
      category: 'LOCAL / OFFLINE ERP',
      tech: ['React', 'Node.js', 'SQLite', 'PDF', 'Inventory'],
      desc: 'Offline/local business ERP for an electronics, plumbing and hardware business — inventory, billing, customers, suppliers and products with no cloud dependency.',
      objective: 'Replace scattered paper/Excel workflows with a single offline Windows application covering the complete trading workflow.',
      features: [
        'Offline Windows desktop application',
        'Billing with PDF generation',
        'Inventory management',
        'Customers & suppliers',
        'Barcode scanning',
      ],
      role: 'Solo Developer / Lead Architect — schema design, React+Node desktop app, PDF + barcode pipeline.',
    },
    {
      id: 'retinascope', num: '03',
      title: 'RETINASCOPE',
      category: 'AI / HEALTHCARE',
      tech: ['Python', 'CNN', 'U-Net', 'Computer Vision'],
      desc: 'AI-powered retinal image analysis and segmentation — automated screening of fundus imagery for faster, more consistent analysis.',
      objective: 'Assist clinicians by automatically segmenting and highlighting retinal structures in fundus images using deep learning.',
      features: [
        'Retinal / fundus image analysis',
        'U-Net semantic segmentation',
        'Deep-learning screening pipeline',
      ],
      role: 'AI Engineer — dataset pipeline, CNN/U-Net training, evaluation harness.',
    },
    {
      id: 'ai-hologram', num: '04',
      title: 'AI HOLOGRAM DETECTION / RENDERING',
      category: 'AI / 3D',
      tech: ['Python', 'Blender', 'Unity'],
      desc: 'AI-powered hologram detection and rendering — computer-vision detection feeding stylized 3D visual output.',
      objective: 'Detect and track holographic projections in imagery and render them into interactive 3D experiences.',
      features: [
        'Hologram detection pipeline',
        'Computer-vision tracking',
        '3D rendering (Blender / Unity)',
      ],
      role: 'AI + 3D Developer — detection model, 3D rendering pipeline and integration.',
    },
  ],
}