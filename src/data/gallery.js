// ─────────────────────────────────────────────────────────────
// GALLERY DATA — real portfolio content for the 3D StellarGallery.
// Certificate `image` stays null until you upload the file, then set
// e.g. image: '/assets/certificates/oracle-generative-ai.png'.
// ─────────────────────────────────────────────────────────────

import { PROFILE } from '../config/profile'

const github = PROFILE.github ? PROFILE.github : null

export const projectItems = [
  {
    id: 'build-my-home', num: '01', title: 'BUILD MY HOME',
    category: 'AI / PROPERTY / PLANNING', visual: 'blueprint', image: null, github,
    desc: 'Spatial Intelligence Framework for AR-Based Property Visualization and AI-Powered Construction Resource Optimization.',
    tech: ['React', 'Node.js', 'MongoDB Atlas', 'AI', '3D Visualization'],
    features: [
      'Property visualization from land / plot input',
      'House design visualization',
      'Construction resource optimization',
      'Material quantities, pricing & quality information',
      'Shop stock / location + engineer information',
      'Interactive 3D visualization & dashboard',
    ],
  },
  {
    id: 'lm-trading-erp', num: '02', title: 'LM TRADING ERP',
    category: 'OFFLINE DESKTOP ERP', visual: 'erp', image: null, github,
    desc: 'Offline-first desktop ERP for electronics, plumbing and hardware trading operations. Local data, no cloud dependency.',
    tech: ['React', 'Node.js', 'SQLite', 'Electron'],
    features: [
      'Inventory, products & stock management',
      'Billing with PDF bills & e-bill import',
      'Customers, suppliers & credit / pay-later tracking',
      'GST, warranty & barcode / product management',
      'Local / offline-first data',
    ],
  },
  {
    id: 'retinascope', num: '03', title: 'RETINASCOPE',
    category: 'AI / RESEARCH', visual: 'retina', image: null, github,
    desc: 'AI-based retinal image analysis and segmentation research project exploring deep-learning screening workflows.',
    tech: ['Python', 'CNN', 'U-Net', 'Computer Vision'],
    features: [
      'Retinal image analysis pipeline',
      'U-Net semantic segmentation experiments',
      'Computer-vision evaluation workflow',
    ],
  },
  {
    id: 'ai-hologram', num: '04', title: 'AI HOLOGRAM DETECTION',
    category: 'AI / 3D RESEARCH', visual: 'hologram', image: null, github,
    desc: 'AI + 3D visualization research project combining detection experiments with Blender / Unity rendered output.',
    tech: ['Python', 'Blender', 'Unity', 'AI', '3D Visualization'],
    features: [
      'Hologram detection experiments',
      'Computer-vision tracking workflow',
      '3D visualization (Blender / Unity)',
    ],
  },
]

export const experienceItems = [
  {
    id: 'ds-intern', num: '01', title: 'DATA SCIENCE INTERN',
    category: 'INTERNSHIP · ON-SITE', visual: 'data', image: null, github: null,
    org: 'Guha Industrial Solutions — Neyveli',
    dates: '22 June 2024 – 06 July 2024',
    mode: 'On-site · Data Science with Python',
    desc: 'On-site Data Science internship focused on Python-based data analysis and machine-learning fundamentals.',
    tech: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Machine Learning'],
    features: [
      'Data analysis with Pandas & NumPy',
      'Visualization with Matplotlib',
      'Machine-learning fundamentals',
    ],
  },
  {
    id: 'best-coordinator', num: '02', title: 'BEST COORDINATOR',
    category: 'LEADERSHIP · 2023 & 2024', visual: 'leadership', image: null, github: null,
    org: 'Panimalar International Conferences',
    dates: '2023 & 2024',
    mode: 'Technical / coding event coordination',
    desc: 'Recognized as Best Coordinator for technical and coding event coordination across conferences.',
    tech: ['Event Coordination', 'Technical Events', 'Team Leadership'],
    features: [
      'Technical / coding event coordination',
      'Student & academic coordination',
      'Awarded Best Coordinator — 2023 & 2024',
    ],
  },
  {
    id: 'head-coordinator', num: '03', title: 'HEAD STUDENT COORDINATOR',
    category: 'LEADERSHIP · 2025', visual: 'leadership', image: null, github: null,
    org: 'Panimalar — Student & Academic Coordination',
    dates: '2025',
    mode: 'Student / academic coordination',
    desc: 'Head Student Coordinator leading student and academic coordination across technical events.',
    tech: ['Student Leadership', 'Academic Coordination', 'Event Management'],
    features: [
      'Led student coordination teams',
      'Academic & technical event management',
      'Mentoring junior coordinators',
    ],
  },
]

// Certificate artwork is OPTIONAL. Keep `image: null` until you upload
// the file, then set e.g. image: '/assets/certificates/oracle-generative-ai.png'.
export const certificateItems = [
  {
    id: 'oracle-generative-ai', num: '01',
    title: 'ORACLE OCI 2024 GENERATIVE AI CERTIFIED PROFESSIONAL',
    category: 'GENERATIVE AI', issuer: 'Oracle', year: '2024',
    visual: 'certificate', image: null, file: 'oracle-generative-ai.png', github: null,
    desc: 'Oracle Cloud Infrastructure 2024 Certified Generative AI Professional.',
    tech: ['Generative AI', 'OCI', 'LLMs'], features: [],
  },
  {
    id: 'nasscom-data-science', num: '02',
    title: 'DATA SCIENCE', category: 'DATA SCIENCE', issuer: 'NASSCOM', year: '2024',
    visual: 'certificate', image: null, file: 'nasscom-data-science.png', github: null,
    desc: 'NASSCOM Data Science certification (2024).',
    tech: ['Data Science', 'Analytics'], features: [],
  },
  {
    id: 'ibm-eda-ml', num: '03',
    title: 'EXPLORATORY DATA ANALYSIS FOR MACHINE LEARNING',
    category: 'MACHINE LEARNING', issuer: 'IBM / Coursera', year: '—',
    visual: 'certificate', image: null, file: 'ibm-exploratory-data-analysis.png', github: null,
    desc: 'IBM Coursera course: Exploratory Data Analysis for Machine Learning.',
    tech: ['EDA', 'Machine Learning', 'Python'], features: [],
  },
]
