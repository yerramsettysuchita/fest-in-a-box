import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useStore } from '../lib/store'

const VIBES = [
  { id: 'energetic', label: '⚡ Energetic', desc: 'High-energy, pumped-up vibe' },
  { id: 'fun',       label: '🎉 Fun',       desc: 'Playful, colorful, casual' },
  { id: 'formal',    label: '🎩 Formal',    desc: 'Professional, elegant' },
  { id: 'academic',  label: '📚 Academic',  desc: 'Scholarly, informative' },
  { id: 'meme',      label: '😂 Meme',      desc: 'Internet culture, relatable' },
]

const STEPS = ['Brief', 'Style', 'Generate']

const Field = ({ label, name, placeholder, textarea = false, form, errors, update }) => (
  <div className="mb-2">
    <label className="label-mono block mb-1.5">{label}</label>
    {textarea ? (
      <textarea rows={3}
        className="input-field resize-none"
        placeholder={placeholder} value={form[name]}
        onChange={e => update(name, e.target.value)} />
    ) : (
      <input type="text"
        className={`input-field ${errors[name] ? 'border-[#c4602a]' : ''}`}
        placeholder={placeholder} value={form[name]}
        onChange={e => update(name, e.target.value)} />
    )}
    {errors[name] && (
      <p className="mt-1 font-mono text-[11px] text-[#c4602a]">{errors[name]}</p>
    )}
  </div>
)

export default function GeneratePage() {
  const nav = useNavigate()
  const location = useLocation()
  const user = useStore(s => s.user)
  const { setCurrentPack, isGenerating, setGenerating, updateBrief } = useStore()
  const [step, setStep] = useState(0)

  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    event_name: '', theme: '', target_audience: '', vibe: 'energetic',
    date_time: '', venue: '', cta_link: '', organiser_name: '', club_name: '', extra_notes: '',
  })

  // Auth guard — redirect to sign-in if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Sign in to create a pack')
      nav('/auth', { state: { from: location.pathname }, replace: true })
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.event_name.trim())      e.event_name      = 'Required'
    if (!form.theme.trim())           e.theme           = 'Required'
    if (!form.target_audience.trim()) e.target_audience = 'Required'
    if (!form.date_time.trim())       e.date_time       = 'Required'
    if (!form.venue.trim())           e.venue           = 'Required'
    if (!form.organiser_name.trim())  e.organiser_name  = 'Required'
    if (!form.club_name.trim())       e.club_name       = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleGenerate = async () => {
    if (!validate()) { setStep(0); return }
    setGenerating(true)
    try {
      const pack = await api.generatePack(form)
      updateBrief(form)
      setCurrentPack(pack)
      try { localStorage.setItem(`brief_${pack.pack_id}`, JSON.stringify(form)) } catch {}
      toast.success('Pack generated! ✦')
      nav(`/pack/${pack.pack_id}`)
    } catch (err) {
      toast.error(err.message || 'Generation failed. Is backend running?')
    } finally {
      setGenerating(false)
    }
  }

  const f = { form, errors, update }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 md:py-16 max-w-[720px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="section-tag">Event Creator</div>
        <h1 className="font-serif text-[clamp(2rem,4vw,2.8rem)] font-black text-cream leading-[1.1] m-0">
          Describe your event.<br />
          <em className="text-gold">Get everything.</em>
        </h1>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2.5">
            <div onClick={() => i < step && setStep(i)}
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em]"
              style={{
                color: i === step ? 'var(--c-gold)' : i < step ? '#8fb87a' : 'var(--c-muted)',
                cursor: i < step ? 'pointer' : 'default'
              }}>
              <span className="w-6 h-6 flex items-center justify-center text-[10px]"
                style={{ border: `1px solid ${i === step ? 'var(--c-gold)' : i < step ? '#8fb87a' : 'var(--c-border)'}` }}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </div>
            {i < STEPS.length - 1 && <span className="text-border">›</span>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-0">
              <Field label="Event Name *"          name="event_name"      placeholder="TechFest 2025" {...f} />
              <Field label="Club / Organisation *" name="club_name"       placeholder="CSE Club" {...f} />
            </div>
            <Field label="Theme *"                 name="theme"           placeholder="Futuristic tech, space exploration…" {...f} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Target Audience *"     name="target_audience" placeholder="Engineering students, Yr 1–4" {...f} />
              <Field label="Organiser Name *"      name="organiser_name"  placeholder="Your Name" {...f} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date & Time *"         name="date_time"       placeholder="March 15, 2025 · 10:00 AM" {...f} />
              <Field label="Venue *"               name="venue"           placeholder="Seminar Hall B" {...f} />
            </div>
            <Field label="CTA Link (optional)"     name="cta_link"        placeholder="https://forms.gle/…" {...f} />
            <Field label="Extra Notes (optional)"  name="extra_notes"     placeholder="Prizes, dress code…" textarea {...f} />
            <button onClick={() => { if (validate()) setStep(1) }}
              className="btn-gold w-full mt-5 flex items-center justify-center gap-2">
              Continue to Style <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="label-mono mb-5">
              Vibe for <span className="text-cream">{form.event_name || 'your event'}</span>
            </p>
            <div className="flex flex-col gap-2.5 mb-7">
              {VIBES.map(v => (
                <button key={v.id} onClick={() => update('vibe', v.id)}
                  className="flex justify-between items-center px-5 py-3.5 text-left w-full transition-colors"
                  style={{
                    border: `1px solid ${form.vibe === v.id ? 'var(--c-gold)' : 'var(--c-border)'}`,
                    background: form.vibe === v.id ? 'rgba(201,168,76,0.06)' : 'transparent',
                    color: form.vibe === v.id ? 'var(--c-cream)' : 'var(--c-muted)',
                  }}>
                  <span className="font-sans font-semibold">{v.label}</span>
                  <span className="font-mono text-[11px]">{v.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-ghost flex-1">← Back</button>
              <button onClick={() => setStep(2)} className="btn-gold flex-[2] flex items-center justify-center gap-2">
                Review & Generate <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-bg2 border border-border p-6 mb-4">
              <p className="label-mono mb-4">Event Summary</p>
              {[['Event', form.event_name], ['Club', form.club_name], ['Theme', form.theme],
                ['Audience', form.target_audience], ['Vibe', form.vibe],
                ['Date', form.date_time], ['Venue', form.venue], ['Organiser', form.organiser_name]
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 mb-2.5">
                  <span className="font-mono text-[11px] text-muted uppercase w-20 flex-shrink-0">{k}</span>
                  <span className="font-sans text-[13px] text-text text-right">{v || '—'}</span>
                </div>
              ))}
            </div>
            <div className="bg-bg2 border border-border p-5 mb-5">
              <p className="label-mono mb-3">8 assets being generated</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['🖼 Poster Text','📱 Insta Caption','💬 WhatsApp','🎙 Emcee Script',
                  '✉️ Email ×2','📜 Certificate','📅 Schedule','🔗 QR Signup'].map(a => (
                  <div key={a} className="font-mono text-[11px] text-accent flex gap-1.5">
                    <span>✓</span>{a}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
              <button onClick={handleGenerate} disabled={isGenerating}
                className="btn-gold flex-[2] flex items-center justify-center gap-2 disabled:opacity-60">
                {isGenerating
                  ? <><Loader2 size={16} className="animate-spin" /> Generating… (~30s)</>
                  : <><Sparkles size={16} /> Generate Pack</>}
              </button>
            </div>
            {isGenerating && (
              <div className="mt-4 p-3.5 border border-gold/20 bg-[rgba(201,168,76,0.04)]
                font-mono text-[11px] text-gold text-center">
                ✦ Groq AI is generating all 8 assets simultaneously…
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
