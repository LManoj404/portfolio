// ─────────────────────────────────────────────────────────────
// CONTENT LAYER — derives everything from the single source of
// truth at src/config/profile.js. Edit YOUR information there.
// ─────────────────────────────────────────────────────────────

import { PROFILE } from '../config/profile'

export const IDENTITY = {
  name: PROFILE.name,
  mark: PROFILE.mark,
  role: PROFILE.role,
  tags: PROFILE.tags,
  location: PROFILE.location,
}

export const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
]

export const HERO = {
  line1: 'CURIOUS MIND.',
  line2: "BUILDER'S ATTITUDE.",
  desc: PROFILE.intro,
  chips: ['CHENNAI / INDIA', 'B.TECH AI & DS · 2026', 'OPEN TO OPPORTUNITIES'],
}

export const ABOUT = {
  label: '01 / ABOUT',
  heading: 'BUILDING INTELLIGENT DIGITAL EXPERIENCES.',
  byline: 'Manoj L. — AI & Data Science Developer',
  bigLine1: 'CURIOUS MIND.',
  bigLine2: "BUILDER'S ATTITUDE.",
  bio: [
    PROFILE.intro,
    PROFILE.statement,
  ],
  focus: [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Data Analytics',
    'Computer Vision', 'Full-Stack Development', '3D Web Experiences',
  ],
  facts: [
    ['04+', 'BUILT PROJECTS'],
    ['03', 'CORE STACKS'],
    ['2026', 'B.TECH GRADUATION'],
  ],
}

// Skills network — the exact 15 skills, orbiting an AI CORE node.
export const SKILLS = {
  label: '02 / SKILLS',
  heading: 'TECHNOLOGIES I WORK WITH',
  core: 'AI CORE',
  items: [
    'Python', 'Java', 'JavaScript', 'React.js', 'Node.js', 'SQL', 'MongoDB',
    'Machine Learning', 'Data Science', 'Data Analytics', 'Computer Vision',
    'Power BI', 'HTML', 'CSS',
  ],
  descriptions: {
    'Python': 'ML, CV & automation', 'Java': 'OOP & robust backends', 'JavaScript': 'web & realtime apps',
    'React.js': 'modern component UIs', 'Node.js': 'APIs & tooling', 'SQL': 'relational data',
    'MongoDB': 'document databases', 'Machine Learning': 'predictive systems', 'Data Science': 'insight from data',
    'Data Analytics': 'measure & decide', 'Computer Vision': 'machines that see', 'Power BI': 'interactive dashboards',
    'HTML': 'the semantic web', 'CSS': 'the visual web',
  },
}

export const PROJECTS = {
  label: '03 / PROJECTS',
  heading: 'FEATURED PROJECTS',
  items: PROFILE.projects,
}

export const JOURNEY = {
  label: '04 / JOURNEY',
  heading: 'MY TIMELINE',
  years: [
    { year: '2022', title: 'B.Tech AI & Data Science', sub: 'Degree begins', entries: ['Started B.Tech — Artificial Intelligence & Data Science', 'Panimalar Engineering College, Chennai'] },
    { year: '2023', title: 'Technical Events', sub: 'Coordination & academic activities', entries: ['Technical events participation', 'Coordination & academic activities'] },
    { year: '2024', title: 'Data Science Internship', sub: 'Guha Industrial Solutions', entries: ['Data Science internship', 'Research & AI projects'] },
    { year: '2025', title: 'Student Leadership', sub: 'Technical events and academic projects', entries: ['Leadership — Head Student Coordinator', 'Advanced technical projects'] },
    { year: '2026', title: 'B.Tech AI & Data Science', sub: 'Degree completed', entries: ['Degree completed', 'Higher studies — AI & Data Science career direction'] },
  ],
  internship: {
    role: 'Data Science Intern',
    org: 'Guha Industrial Solutions Ltd., Neyveli',
    dates: 'June 22 – July 06, 2024',
    focus: ['Python', 'Data Science', 'Data Analysis'],
  },
  certs: [
    { issuer: 'NASSCOM', name: 'Data Science', year: '2024' },
    { issuer: 'Oracle', name: 'Oracle Cloud Infrastructure 2024 — Generative AI Certified Professional', year: '2024' },
    { issuer: 'IBM / Coursera', name: 'Exploratory Data Analysis for Machine Learning', year: '—' },
  ],
}

// Contact channels — built so the WhatsApp number NEVER appears in frontend
// code: the server redirects via /api/contact/whatsapp (server-side env).
const githubLink = PROFILE.github
  ? PROFILE.github
  : null

export const CONTACT = {
  label: '05 / CONTACT',
  heading1: "LET'S BUILD",
  heading2: 'SOMETHING INTELLIGENT.',
  support: "Have an idea, project or opportunity? Let's turn it into something useful.",
  channels: [
    { id: 'email', label: 'EMAIL ME', action: 'mailto', href: `mailto:${PROFILE.email}`, display: PROFILE.email },
    { id: 'linkedin', label: 'LINKEDIN', action: 'link', href: PROFILE.linkedin, display: 'linkedin.com/in/manoj404' },
    { id: 'github', label: 'GITHUB', action: 'link', href: githubLink, display: githubLink ? githubLink.replace(/^https?:\/\/(www\.)?/, '') : 'GITHUB_URL — set in src/config/profile.js' },
    { id: 'whatsapp', label: 'MESSAGE ON WHATSAPP', action: 'whatsapp', href: null, display: 'opens WhatsApp chat' },
  ],
  api: { whatsapp: '/api/contact/whatsapp', contact: '/api/contact' },
  projectTypes: ['AI / ML', 'DATA ANALYTICS', 'FULL STACK', '3D / AR', 'OTHER'],
}