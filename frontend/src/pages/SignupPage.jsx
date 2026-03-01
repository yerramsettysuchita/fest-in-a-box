import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'

export default function SignupPage() {
  const { token } = useParams()
  const [pack, setPack] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', roll_no: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.getSharedPack(token)
      .then(data => { setPack(data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [token])

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSubmitting(true)
    try {
      await api.registerForEvent(token, form)
      setSuccess(true)
    } catch (e) {
      toast.error(e.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const packData = pack?.pack_data || pack

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Loader2 className="animate-spin text-gold" size={28} />
    </div>
  )

  if (!pack) return (
    <div className="min-h-screen bg-bg flex items-center justify-center text-center p-6">
      <div>
        <p className="font-serif text-2xl text-cream mb-3">Event not found</p>
        <p className="font-mono text-sm text-muted">This link may have expired or is invalid.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6"
      style={{ fontFamily: 'Syne, sans-serif' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Syne:wght@400;600;700&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet" />

      <motion.div className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Event Card */}
        <div className="border border-border bg-bg2 mb-6 overflow-hidden">
          {packData?.poster_image_url && (
            <div className="h-32 overflow-hidden">
              <img src={packData.poster_image_url} alt="Event" className="w-full h-full object-cover opacity-60"
                onError={e => { if (packData.fallback_image_url) e.target.src = packData.fallback_image_url }} />
            </div>
          )}
          <div className="p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold mb-1">
              {packData?.brief?.club_name || 'Student Club'}
            </p>
            <h1 className="font-serif text-2xl font-black text-cream leading-tight mb-2">
              {packData?.event_name || pack?.event_name}
            </h1>
            {packData?.poster_text?.headline && (
              <p className="font-serif text-sm italic text-muted">{packData.poster_text.headline}</p>
            )}
            {packData?.brief && (
              <div className="mt-3 flex gap-4">
                {packData.brief.date_time && (
                  <span className="font-mono text-[11px] text-muted">📅 {packData.brief.date_time}</span>
                )}
                {packData.brief.venue && (
                  <span className="font-mono text-[11px] text-muted">📍 {packData.brief.venue}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Registration Form */}
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div key="form" className="border border-border bg-bg2 p-6 space-y-4"
              exit={{ opacity: 0, scale: 0.97 }}>
              <h2 className="font-serif text-lg text-cream">Register Now</h2>

              <div>
                <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-2">
                  Full Name *
                </label>
                <input type="text"
                  className="input-field"
                  placeholder="Your full name"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-2">
                  Email *
                </label>
                <input type="email"
                  className="input-field"
                  placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-2">
                  Roll Number (optional)
                </label>
                <input type="text"
                  className="input-field"
                  placeholder="e.g. 22CS001"
                  value={form.roll_no} onChange={e => setForm(p => ({ ...p, roll_no: e.target.value }))} />
              </div>

              <button onClick={submit} disabled={submitting}
                className="w-full bg-[#c9a84c] text-[#0a0a08] font-sans font-bold text-sm uppercase tracking-wider
                  py-4 border-0 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                style={{ transition: 'all 0.2s' }}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Register for Event
              </button>
            </motion.div>
          ) : (
            <motion.div key="success" className="border border-accent/30 bg-[rgba(143,184,122,0.06)] p-8 text-center"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckCircle size={40} className="text-accent mx-auto mb-4" />
              <h2 className="font-serif text-xl text-cream mb-2">You're registered!</h2>
              <p className="font-mono text-sm text-muted">
                See you at <span className="text-cream">{packData?.event_name || 'the event'}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="font-mono text-[10px] text-center text-muted mt-6">
          Powered by Fest-in-a-Box · Created with AI assistance
        </p>
      </motion.div>
    </div>
  )
}
