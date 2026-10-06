import { useState } from 'react'
import { motion } from 'framer-motion'
import { CONTACT, IDENTITY } from '../data/content'

const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { delay, duration: 0.8, ease },
})

// 05 / CONTACT — futuristic environment, live API form + channels.
// Form → POST /api/contact (validated server-side, persisted to _messages.log).
// WhatsApp → /api/contact/whatsapp (server-side 302 to wa.me — the number is
// read from WHATSAPP_NUMBER in .env and is NEVER present in frontend code).
export default function ContactSection() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [feedback, setFeedback] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    // Use the live form element (never a ref that may be unset) so the
    // handler always has access to the fields.
    const form = e.currentTarget
    if (!form || status === 'sending') return
    const name = form.elements.name.value.trim()
    const email = form.elements.email.value.trim()
    const message = form.elements.message.value.trim()
    if (!name || !email || !message) {
      setStatus('error')
      setFeedback('Please fill in name, email and message.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setFeedback('Please enter a valid email address.')
      return
    }
    setStatus('sending')
    setFeedback('')
    try {
      const res = await fetch(CONTACT.api.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, type: form.elements.projectType.value }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setStatus('error')
        setFeedback(data.message || 'Could not send right now — please use email instead.')
        return
      }
      setStatus('sent')
      setFeedback(data.note || 'Message received — I will get back to you soon.')
      form.reset()
    } catch {
      setStatus('error')
      setFeedback('Network error — please use email instead.')
    }
  }

  return (
    <section id="contact" data-section="contact" className="section contact">
      <div className="contact-nodes" aria-hidden="true">
        {[...Array(6)].map((_, i) => <span key={i} className="cnode" style={{ '--d': `${7 + i * 1.7}s`, '--x': `${8 + i * 16}%`, '--y': `${12 + (i % 3) * 30}%` }} />)}
      </div>
      <div className="section-head">
        <motion.span className="section-label mono" {...rise()}>{CONTACT.label}</motion.span>
        <motion.h2 className="contact-heading" {...rise(0.1)}>
          {CONTACT.heading1}<br /><span className="outline">{CONTACT.heading2}</span>
        </motion.h2>
        <motion.p className="contact-support" {...rise(0.18)}>{CONTACT.support}</motion.p>
      </div>

      <div className="contact-grid">
        <motion.form className="contact-form" onSubmit={onSubmit} noValidate {...rise(0.2)}>
          <div className="field-row">
            <label className="field">
              <span className="field-label mono">NAME</span>
              <input name="name" type="text" placeholder="Your name" autoComplete="name" />
            </label>
            <label className="field">
              <span className="field-label mono">EMAIL</span>
              <input name="email" type="email" placeholder="you@example.com" autoComplete="email" />
            </label>
          </div>
          <label className="field">
            <span className="field-label mono">PROJECT TYPE</span>
            <select name="projectType" defaultValue="">
              <option value="" disabled>Select a project type</option>
              {CONTACT.projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label mono">MESSAGE</span>
            <textarea name="message" rows="5" placeholder="Tell me about your idea…" />
          </label>
          {status === 'error' && <p className="form-error mono" role="alert">{feedback}</p>}
          {status === 'sent' ? (
            <p className="form-success mono" role="status">✓ {feedback}</p>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE ↗'}
            </button>
          )}
        </motion.form>

        <motion.div className="contact-channels" {...rise(0.3)}>
          {CONTACT.channels.map((c) => {
            const href = c.action === 'whatsapp' ? CONTACT.api.whatsapp : c.href || null
            const external = c.action === 'link' || c.action === 'whatsapp'
            return (
              <div key={c.id} className="channel" data-cursor={href ? '3d' : undefined}>
                <span className="channel-label mono">{c.label}</span>
                {href ? (
                  <a
                    className="channel-link"
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    aria-label={`${c.label} — open contact`}
                  >
                    <span className="channel-display">{c.display}</span>
                    <span className="channel-arrow" aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="channel-value is-empty mono">{c.display}</span>
                )}
              </div>
            )
          })}
          <div className="contact-sign">
            <span className="mono">{IDENTITY.name}</span>
            <span className="mono dim">/ {IDENTITY.mark}</span>
          </div>
        </motion.div>
      </div>

      <footer className="footer mono">
        <span>© 2026 {IDENTITY.name} <span className="dim">/ {IDENTITY.mark}</span></span>
        <span className="dim">{IDENTITY.role}</span>
        <span className="dim">AI · DATA · WEB · 3D</span>
        <span className="footer-status"><span className="status-dot" aria-hidden="true" />AVAILABLE FOR OPPORTUNITIES</span>
      </footer>
    </section>
  )
}
