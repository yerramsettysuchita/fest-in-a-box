import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useStore } from '../lib/store'

const ASSETS = [
  { icon: '🖼️', name: 'Event Poster',       desc: 'Headline, subheading, CTA + AI background art' },
  { icon: '📱', name: 'Social Media Pack',   desc: 'Instagram caption, hashtags + WhatsApp broadcast' },
  { icon: '🎙️', name: 'Emcee Script',        desc: 'Intro, warm-ups, transitions & closing' },
  { icon: '✉️', name: 'Announcement Email',  desc: 'Faculty & student versions, ready to send' },
  { icon: '📜', name: 'Certificate',          desc: 'Print-ready participation certificate template' },
  { icon: '🔗', name: 'QR Signup Page',       desc: 'Auto-generated registration page with QR code' },
]

const STEPS = [
  { num: '01', title: 'Describe Your Event', desc: 'Fill a 2-minute form with event name, theme, venue, and vibe.' },
  { num: '02', title: 'Pick a Visual Tone',  desc: 'Energetic, Formal, Meme, Academic, or Fun — your brand.' },
  { num: '03', title: 'Receive Your Pack',   desc: 'Groq AI crafts all 8 assets simultaneously in under 60 seconds.' },
  { num: '04', title: 'Edit & Publish',      desc: 'Tweak inline, share a collaboration link, export.' },
]

export default function LandingPage() {
  const { user } = useStore()
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-73px)] grid grid-cols-1 md:grid-cols-2 relative px-4 sm:px-8 md:px-12 py-10 md:py-16 max-w-7xl mx-auto items-center gap-8 md:gap-12">
        {/* Deco blobs */}
        <div className="pointer-events-none absolute w-96 h-96 rounded-full top-0 left-0
          bg-[rgba(201,168,76,0.04)] blur-[80px]" />
        <div className="pointer-events-none absolute w-64 h-64 rounded-full bottom-24 left-72
          bg-[rgba(196,96,42,0.06)] blur-[80px]" />

        {/* Left */}
        <div>
          <motion.div className="section-tag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Event Intelligence Platform
          </motion.div>
          <motion.h1 className="font-serif text-[clamp(2.5rem,8vw,5rem)] font-black leading-[1.02] text-cream mb-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            One Brief.<br />
            <em className="text-gold">Every Asset.</em><br />
            <span className="font-normal italic text-gold2 text-[0.88em]">Ready to publish.</span>
          </motion.h1>
          <motion.p className="font-sans text-base leading-relaxed text-muted max-w-md mb-8 md:mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            Describe your club event once — get the full creative pack instantly: poster copy, Insta script, emcee script, email, certificate, and QR signup page.
          </motion.p>
          <motion.div className="flex flex-wrap gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link to="/generate" className="btn-gold flex items-center gap-2">
              <Sparkles size={16} /> Generate Your Pack
            </Link>
            {user ? (
              <Link to="/dashboard" className="btn-ghost flex items-center gap-2">
                <LayoutDashboard size={14} /> My Packs
              </Link>
            ) : (
              <Link to="/auth" className="btn-ghost flex items-center gap-2">
                Sign In Free <ChevronRight size={14} />
              </Link>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div className="flex gap-6 sm:gap-10 mt-8 sm:mt-14 pt-6 sm:pt-8 border-t border-border flex-wrap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            {[['8+','Asset Types'], ['<60s','Generation Time'], ['100%','Editable']].map(([n, l]) => (
              <div key={l}>
                <div className="font-serif text-3xl font-bold text-cream">{n}</div>
                <div className="label-mono mt-1">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — mockup (hidden on mobile) */}
        <motion.div className="hidden md:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="border border-border bg-bg2 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            {/* Browser chrome */}
            <div className="bg-border px-4 py-3 flex items-center gap-2 border-b border-[rgba(255,255,255,0.04)]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <div className="flex-1 text-center font-mono text-[11px] text-muted">fest-in-a-box.app</div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="label-mono block mb-1.5">Event Name</span>
                <div className="input-field text-cream font-medium">
                  CodeStorm 2026<span className="animate-pulse text-gold">|</span>
                </div>
              </div>
              <div>
                <span className="label-mono block mb-2">Vibe</span>
                <div className="flex gap-2 flex-wrap">
                  {['⚡ Energetic', '🎓 Academic', '😂 Meme', '✨ Formal'].map((v, i) => (
                    <div key={v} className={`font-mono text-[11px] tracking-wide px-3 py-1.5 border rounded-full
                      ${i === 0 ? 'border-gold text-gold bg-[rgba(201,168,76,0.08)]' : 'border-border text-muted'}`}>
                      {v}
                    </div>
                  ))}
                </div>
              </div>
              <div className="btn-gold text-center text-sm cursor-default">✦ Generate Pack</div>
              <div className="grid grid-cols-2 gap-2">
                {['🖼 Poster', '📱 Insta', '🎙 Emcee', '✉️ Email', '📜 Certificate', '🔗 Signup'].map((a) => (
                  <div key={a} className="flex items-center gap-2 border border-[rgba(143,184,122,0.2)]
                    bg-[rgba(143,184,122,0.05)] px-3 py-2 font-mono text-[11px] text-accent">
                    <span>✓</span>{a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* TICKER */}
      <div className="overflow-hidden border-y border-border bg-bg2 py-4 my-0">
        <div className="flex whitespace-nowrap" style={{ animation: 'ticker 22s linear infinite' }}>
          {[...Array(2)].flatMap(() =>
            ['Poster Copy','Instagram Captions','WhatsApp Broadcast','Emcee Script',
             'Announcement Email','Participation Certificate','Schedule Graphic','QR Signup Page']
            .map(a => (
              <span key={a + Math.random()} className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted px-10
                before:content-['◆'] before:text-gold before:mr-4 before:text-[8px]">
                {a}
              </span>
            ))
          )}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-28 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 items-end mb-8 md:mb-16">
          <div>
            <div className="section-tag">Process</div>
            <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold text-cream leading-tight">
              Four steps.<br /><em className="text-gold">One complete pack.</em>
            </h2>
          </div>
          <p className="font-sans text-sm leading-relaxed text-muted max-w-sm">
            No design skills. No Canva subscription. No back-and-forth.
            Just describe your event and walk away with everything you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 border border-border divide-y divide-border md:divide-y-0 md:divide-x md:divide-border">
          {STEPS.map((s, i) => (
            <div key={s.num} className="p-5 md:p-8 hover:bg-bg2 transition-colors relative overflow-hidden group">
              <div className="label-mono text-gold mb-4 md:mb-6">{s.num} / {['Brief','Style','Generate','Publish'][i]}</div>
              <h3 className="font-serif text-lg md:text-xl font-bold text-cream mb-2 md:mb-3 leading-tight">{s.title}</h3>
              <p className="font-sans text-sm text-muted leading-relaxed">{s.desc}</p>
              <div className="absolute bottom-0 right-2 font-serif text-[7rem] font-black leading-none
                text-[rgba(201,168,76,0.04)] group-hover:text-[rgba(201,168,76,0.07)] transition-colors pointer-events-none select-none">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ASSETS GRID */}
      <section className="pb-16 md:pb-28 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
        <div className="section-tag">Generated Assets</div>
        <h2 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-bold text-cream max-w-xl mb-8 md:mb-12 leading-tight">
          Everything your club needs, <em className="text-gold">generated</em> at once.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 border border-border divide-x divide-y divide-border">
          {ASSETS.map(a => (
            <div key={a.name} className="p-5 md:p-8 hover:bg-bg2 transition-colors group">
              <div className="w-10 h-10 md:w-12 md:h-12 border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.06)]
                flex items-center justify-center text-lg md:text-xl mb-4 md:mb-6 group-hover:scale-105 transition-transform">
                {a.icon}
              </div>
              <h3 className="font-serif text-base md:text-xl font-bold text-cream mb-1 md:mb-2">{a.name}</h3>
              <p className="font-sans text-xs md:text-sm text-muted leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto border-t border-border grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center">
        <div className="font-serif text-[clamp(2.5rem,7vw,5.5rem)] font-black text-cream leading-[0.95]">
          Make<br /><em className="text-gold block">more.</em>
          Stress<br />less.
        </div>
        <div>
          <p className="font-sans text-sm leading-relaxed text-muted mb-6 md:mb-8">
            Club organisers spend hours bouncing between Canva, Google Docs, and WhatsApp.
            Fest-in-a-Box collapses the entire workflow into a single intelligent session.
          </p>
          <div className="space-y-3 mb-6 md:mb-8">
            {['No design experience needed','Collaborative editing via shared link',
              'Event QR signup — track registrations live','AI-safety guardrails built-in',
              'Dark & light mode — looks great anywhere'].map(c => (
              <div key={c} className="flex items-center gap-3 font-sans text-sm text-text">
                <div className="w-5 h-5 border border-[rgba(143,184,122,0.3)] bg-[rgba(143,184,122,0.1)]
                  flex items-center justify-center font-mono text-[10px] text-accent flex-shrink-0">✓</div>
                {c}
              </div>
            ))}
          </div>
          <Link to="/generate" className="btn-gold inline-flex items-center gap-2">
            <Sparkles size={16} /> Start Creating Free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-4 sm:px-12 py-5 sm:py-8 flex flex-col sm:flex-row gap-2 justify-between items-center max-w-7xl mx-auto">
        <div className="font-serif text-lg text-cream">Fest<span className="text-gold">.</span>Box</div>
        <div className="font-mono text-[11px] text-muted">© 2026 Fest-in-a-Box. All rights reserved.</div>
      </footer>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
