import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Download, RefreshCw, Share2, Loader2, QrCode, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { api } from '../lib/api'
import { useStore } from '../lib/store'

const TABS = [
  { id: 'image',        label: '🖼 Poster',       key: 'image' },
  { id: 'poster_text',  label: '📝 Copy',          key: 'poster_text' },
  { id: 'social',       label: '📱 Social',        key: 'social' },
  { id: 'emcee_script', label: '🎙 Emcee',         key: 'emcee_script' },
  { id: 'email',        label: '✉️ Email',         key: 'email' },
  { id: 'certificate',  label: '📜 Certificate',   key: 'certificate' },
  { id: 'schedule',     label: '📅 Schedule',      key: 'schedule' },
  { id: 'qr',           label: '🔗 QR & Signups',  key: 'qr' },
  { id: 'export',       label: '⬇ Export',         key: 'export' },
]

// Illustrated SVG sticker characters
const STICKER_SVGS = {
  trad_dancer: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <circle cx="50" cy="13" r="10" fill="#F5C17A"/>
      <circle cx="50" cy="5" r="7" fill="#2C1810"/>
      <circle cx="50" cy="9" r="2" fill="#D50000"/>
      <circle cx="46" cy="14" r="1.5" fill="#1A0A00"/><circle cx="54" cy="14" r="1.5" fill="#1A0A00"/>
      <path d="M40 23 L40 36 L60 36 L60 23 Q50 29 40 23Z" fill="#B71C1C"/>
      <path d="M15 38 Q40 44 50 42 Q60 44 85 38 L82 95 H18 Z" fill="#E91E8C"/>
      <path d="M18 95 Q50 101 82 95" stroke="#F9A825" strokeWidth="3" fill="none"/>
      <path d="M40 36 Q50 40 60 36" stroke="#F9A825" strokeWidth="1.5" fill="none"/>
      <line x1="60" y1="28" x2="80" y2="10" stroke="#F5C17A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="82" cy="8" r="4" fill="#F5C17A"/>
      <line x1="40" y1="28" x2="18" y2="44" stroke="#F5C17A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="16" cy="46" r="4" fill="#F5C17A"/>
      <ellipse cx="33" cy="97" rx="7" ry="3" fill="#F9A825"/>
      <ellipse cx="67" cy="97" rx="7" ry="3" fill="#F9A825"/>
      <path d="M43 24 Q50 27 57 24" stroke="#F9A825" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  western_dancer: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <circle cx="50" cy="14" r="11" fill="#C6956A"/>
      <rect x="36" y="5" width="28" height="6" rx="3" fill="#1565C0"/>
      <path d="M36 5 Q50 1 64 5Z" fill="#1565C0"/>
      <rect x="30" y="7" width="10" height="5" rx="2.5" fill="#1565C0"/>
      <circle cx="46" cy="15" r="2" fill="#1A0A00"/><circle cx="54" cy="15" r="2" fill="#1A0A00"/>
      <path d="M37 25 L37 57 L63 57 L63 25 Q50 32 37 25Z" fill="#ECEFF1"/>
      <circle cx="50" cy="42" r="5" fill="#FF1744" opacity="0.7"/>
      <path d="M37 57 L33 95 L47 95 L50 75 L53 95 L67 95 L63 57Z" fill="#1565C0"/>
      <path d="M29 95 L29 100 L48 100 L47 95Z" fill="#212121"/>
      <path d="M52 95 L53 100 L72 100 L71 95Z" fill="#212121"/>
      <line x1="63" y1="32" x2="82" y2="14" stroke="#C6956A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="84" cy="12" r="4" fill="#C6956A"/>
      <line x1="37" y1="32" x2="16" y2="50" stroke="#C6956A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="14" cy="52" r="4" fill="#C6956A"/>
    </svg>
  ),
  dj: (
    <svg viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="10" y="58" width="100" height="40" rx="5" fill="#212121"/>
      <circle cx="35" cy="78" r="18" fill="#333"/><circle cx="35" cy="78" r="12" fill="#444"/><circle cx="35" cy="78" r="5" fill="#222"/>
      <circle cx="85" cy="78" r="18" fill="#333"/><circle cx="85" cy="78" r="12" fill="#444"/><circle cx="85" cy="78" r="5" fill="#222"/>
      <rect x="50" y="62" width="20" height="28" rx="3" fill="#37474F"/>
      <rect x="53" y="65" width="3" height="12" rx="1" fill="#9C27B0"/>
      <rect x="57" y="67" width="3" height="10" rx="1" fill="#00BCD4"/>
      <rect x="61" y="64" width="3" height="13" rx="1" fill="#FF5722"/>
      <rect x="65" y="68" width="3" height="9" rx="1" fill="#4CAF50"/>
      <circle cx="60" cy="20" r="12" fill="#8B5E3C"/>
      <path d="M48 16 Q48 5 60 5 Q72 5 72 16" stroke="#111" strokeWidth="3.5" fill="none"/>
      <rect x="45" y="14" width="7" height="9" rx="3.5" fill="#111"/><rect x="68" y="14" width="7" height="9" rx="3.5" fill="#111"/>
      <circle cx="56" cy="20" r="1.5" fill="#1A0A00"/><circle cx="64" cy="20" r="1.5" fill="#1A0A00"/>
      <path d="M48 32 L48 58 L72 58 L72 32 Q60 38 48 32Z" fill="#7B1FA2"/>
      <line x1="48" y1="38" x2="35" y2="58" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round"/>
      <line x1="72" y1="38" x2="85" y2="58" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  ),
  mic_singer: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <circle cx="50" cy="13" r="11" fill="#F5C17A"/>
      <path d="M39 10 Q50 3 61 10 L58 6 Q50 2 42 6Z" fill="#2C1810"/>
      <circle cx="46" cy="13" r="1.5" fill="#1A0A00"/><circle cx="54" cy="13" r="1.5" fill="#1A0A00"/>
      <path d="M44 18 Q50 23 56 18 Q54 25 50 26 Q46 25 44 18Z" fill="#CC2200"/>
      <path d="M38 24 Q50 30 62 24 L68 80 H32 Z" fill="#AD1457"/>
      <circle cx="46" cy="40" r="2" fill="#FFD700"/><circle cx="54" cy="45" r="2" fill="#FFD700"/>
      <circle cx="42" cy="55" r="1.5" fill="#FFD700"/><circle cx="58" cy="62" r="1.5" fill="#FFD700"/>
      <circle cx="50" cy="70" r="2" fill="#FFD700"/>
      <line x1="62" y1="30" x2="80" y2="52" stroke="#F5C17A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="84" cy="50" r="8" fill="#444"/><circle cx="84" cy="50" r="6" fill="#666"/>
      <line x1="84" y1="58" x2="84" y2="72" stroke="#888" strokeWidth="3"/>
      <line x1="38" y1="30" x2="22" y2="48" stroke="#F5C17A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="20" cy="50" r="4" fill="#F5C17A"/>
      <text x="6" y="30" fontSize="14" fill="#FFD700" fontFamily="serif">♪</text>
      <text x="76" y="25" fontSize="10" fill="#FFD700" fontFamily="serif">♫</text>
    </svg>
  ),
  graduate: (
    <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <circle cx="50" cy="20" r="12" fill="#C6956A"/>
      <rect x="34" y="9" width="32" height="6" rx="1" fill="#1A237E"/>
      <polygon points="50,4 36,9 64,9" fill="#283593"/>
      <line x1="64" y1="12" x2="74" y2="24" stroke="#F9A825" strokeWidth="2"/>
      <line x1="74" y1="24" x2="74" y2="34" stroke="#F9A825" strokeWidth="2"/>
      <circle cx="74" cy="35" r="2.5" fill="#F9A825"/>
      <circle cx="46" cy="20" r="2" fill="#1A0A00"/><circle cx="54" cy="20" r="2" fill="#1A0A00"/>
      <path d="M45 25 Q50 29 55 25" stroke="#994400" strokeWidth="1.5" fill="none"/>
      <path d="M37 32 Q50 40 63 32 L70 95 H30 Z" fill="#1A237E"/>
      <path d="M41 32 L35 65 M59 32 L65 65" stroke="#F9A825" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="63" y1="38" x2="80" y2="58" stroke="#C6956A" strokeWidth="5" strokeLinecap="round"/>
      <rect x="76" y="55" width="18" height="22" rx="3" fill="#FFF8E1"/>
      <line x1="79" y1="61" x2="91" y2="61" stroke="#9E9E9E" strokeWidth="1.2"/>
      <line x1="79" y1="65" x2="91" y2="65" stroke="#9E9E9E" strokeWidth="1.2"/>
      <line x1="79" y1="69" x2="91" y2="69" stroke="#9E9E9E" strokeWidth="1.2"/>
      <line x1="37" y1="38" x2="20" y2="22" stroke="#C6956A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="18" cy="20" r="4" fill="#C6956A"/>
    </svg>
  ),
  trophy_winner: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="38" y="78" width="24" height="8" rx="2" fill="#F9A825"/>
      <rect x="32" y="86" width="36" height="6" rx="2" fill="#F57F17"/>
      <line x1="50" y1="74" x2="50" y2="78" stroke="#F9A825" strokeWidth="4"/>
      <path d="M32 32 Q30 60 38 74 L62 74 Q70 60 68 32 Z" fill="#F9A825"/>
      <path d="M32 35 Q20 45 32 55" stroke="#F57F17" strokeWidth="3" fill="none"/>
      <path d="M68 35 Q80 45 68 55" stroke="#F57F17" strokeWidth="3" fill="none"/>
      <ellipse cx="50" cy="32" rx="18" ry="5" fill="#FFD54F"/>
      <text x="50" y="61" fontSize="18" fill="#FFF" textAnchor="middle" fontFamily="serif">★</text>
      <text x="10" y="25" fontSize="14" fill="#F9A825" fontFamily="serif">★</text>
      <text x="82" y="30" fontSize="10" fill="#F9A825" fontFamily="serif">★</text>
      <text x="5" y="65" fontSize="10" fill="#F9A825" fontFamily="serif">✦</text>
      <text x="88" y="70" fontSize="8" fill="#F9A825" fontFamily="serif">✦</text>
      <circle cx="15" cy="40" r="3" fill="#FFD700" opacity="0.8"/>
      <circle cx="88" cy="50" r="2" fill="#FFD700" opacity="0.7"/>
    </svg>
  ),
  party_crowd: (
    <svg viewBox="0 0 130 115" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <circle cx="25" cy="28" r="11" fill="#F5C17A"/>
      <path d="M14 40 L14 75 L36 75 L36 40 Q25 47 14 40Z" fill="#E91E8C"/>
      <line x1="14" y1="46" x2="2" y2="26" stroke="#F5C17A" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="1" cy="24" r="3.5" fill="#F5C17A"/>
      <line x1="36" y1="46" x2="46" y2="30" stroke="#F5C17A" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="47" cy="28" r="3.5" fill="#F5C17A"/>
      <circle cx="65" cy="20" r="12" fill="#8B5E3C"/>
      <path d="M53 32 L53 72 L77 72 L77 32 Q65 40 53 32Z" fill="#1565C0"/>
      <line x1="53" y1="39" x2="38" y2="18" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="36" cy="16" r="4" fill="#8B5E3C"/>
      <line x1="77" y1="39" x2="92" y2="18" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="94" cy="16" r="4" fill="#8B5E3C"/>
      <circle cx="105" cy="28" r="11" fill="#F5C17A"/>
      <path d="M94 40 L94 75 L116 75 L116 40 Q105 47 94 40Z" fill="#4CAF50"/>
      <line x1="116" y1="46" x2="128" y2="26" stroke="#F5C17A" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="129" cy="24" r="3.5" fill="#F5C17A"/>
      <line x1="94" y1="46" x2="84" y2="30" stroke="#F5C17A" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="83" cy="28" r="3.5" fill="#F5C17A"/>
      <rect x="5" y="5" width="6" height="4" rx="1" fill="#FFD700" transform="rotate(25 5 5)"/>
      <rect x="55" y="2" width="5" height="3" rx="1" fill="#E91E8C" transform="rotate(-15 55 2)"/>
      <rect x="85" y="4" width="6" height="4" rx="1" fill="#9C27B0" transform="rotate(20 85 4)"/>
      <rect x="115" y="5" width="5" height="3" rx="1" fill="#4CAF50" transform="rotate(-10 115 5)"/>
      <circle cx="40" cy="10" r="3" fill="#FF5722"/>
      <circle cx="95" cy="8" r="2" fill="#00BCD4"/>
      <rect x="20" y="90" width="5" height="3" rx="1" fill="#FFD700" transform="rotate(30 20 90)"/>
      <rect x="70" y="85" width="4" height="3" rx="1" fill="#E91E8C" transform="rotate(-20 70 85)"/>
      <rect x="110" y="92" width="5" height="3" rx="1" fill="#1565C0" transform="rotate(15 110 92)"/>
    </svg>
  ),
  diya: (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="40" cy="35" rx="28" ry="32" fill="#FF9800" opacity="0.15"/>
      <path d="M40 8 Q58 22 52 44 Q40 56 28 44 Q22 22 40 8Z" fill="#FF6D00"/>
      <path d="M40 14 Q54 26 49 43 Q40 52 31 43 Q26 26 40 14Z" fill="#FF9800"/>
      <path d="M40 20 Q50 30 46 42 Q40 48 34 42 Q30 30 40 20Z" fill="#FFEB3B"/>
      <path d="M40 26 Q46 33 43 41 Q40 44 37 41 Q34 33 40 26Z" fill="#FFF9C4"/>
      <line x1="40" y1="52" x2="40" y2="60" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="40" cy="62" rx="20" ry="6" fill="#FF8F00"/>
      <path d="M18 62 Q40 56 62 62 Q66 75 58 84 Q40 90 22 84 Q14 75 18 62Z" fill="#E65100"/>
      <path d="M60 65 Q70 68 72 62 Q68 76 58 84" fill="#BF360C"/>
      <circle cx="30" cy="76" r="2" fill="#FF6D00"/>
      <circle cx="40" cy="79" r="2" fill="#FF6D00"/>
      <circle cx="50" cy="76" r="2" fill="#FF6D00"/>
      <line x1="10" y1="35" x2="14" y2="39" stroke="#FFD700" strokeWidth="1.5"/>
      <line x1="12" y1="37" x2="8" y2="37" stroke="#FFD700" strokeWidth="1.5"/>
      <line x1="70" y1="28" x2="74" y2="32" stroke="#FFD700" strokeWidth="1.5"/>
      <line x1="72" y1="30" x2="68" y2="30" stroke="#FFD700" strokeWidth="1.5"/>
    </svg>
  ),
}

const STICKER_META = [
  { key: 'trad_dancer',   label: 'Trad. Dancer',   vibes: ['fun', 'formal'] },
  { key: 'western_dancer', label: 'Western Dancer', vibes: ['energetic', 'meme'] },
  { key: 'dj',            label: 'DJ',              vibes: ['energetic', 'meme', 'fun'] },
  { key: 'mic_singer',    label: 'Singer',          vibes: ['energetic', 'meme', 'fun'] },
  { key: 'graduate',      label: 'Graduate',        vibes: ['academic', 'formal'] },
  { key: 'trophy_winner', label: 'Winner',          vibes: ['academic', 'formal', 'fun'] },
  { key: 'party_crowd',   label: 'Celebration',     vibes: ['fun', 'energetic', 'meme'] },
  { key: 'diya',          label: 'Diya Lamp',       vibes: ['fun', 'formal'] },
]

const CERT_STYLES = {
  classic:   { bg: 'linear-gradient(135deg,#0a0a08 0%,#111110 100%)', border: 'rgba(201,168,76,0.35)', title: '#c9a84c', body: '#d8d4c8', muted: '#6b6b5e', name: '#f5f0e8', divider: 'rgba(201,168,76,0.2)' },
  clean:     { bg: 'linear-gradient(135deg,#ffffff 0%,#f5f4f0 100%)', border: 'rgba(154,108,8,0.4)',   title: '#9a6c08', body: '#2a2a22', muted: '#6b6b5e', name: '#1a1a16', divider: 'rgba(154,108,8,0.2)' },
  parchment: { bg: 'linear-gradient(135deg,#f5e6c8 0%,#ede0c0 100%)', border: 'rgba(120,70,20,0.4)',   title: '#7a4a10', body: '#3a2a10', muted: '#6a5030', name: '#2a1a08', divider: 'rgba(120,70,20,0.25)' },
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest
      text-muted hover:text-gold transition-colors border border-border hover:border-gold px-3 py-1.5">
      <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function TextBlock({ label, content, editable = false, onUpdate }) {
  const [val, setVal] = useState(content || '')
  const [editing, setEditing] = useState(false)

  // Sync display when parent regenerates the asset
  useEffect(() => {
    if (!editing) setVal(content || '')
  }, [content])

  if (!content && content !== '') return null

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="label-mono">{label}</span>
        <div className="flex gap-2">
          {editable && (
            <button onClick={() => { if (editing && onUpdate) onUpdate(val); setEditing(!editing) }}
              className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-gold transition-colors
                border border-border hover:border-gold px-3 py-1.5">
              {editing ? 'Save' : 'Edit'}
            </button>
          )}
          <CopyButton text={val} />
        </div>
      </div>
      {editing ? (
        <textarea
          className="input-field w-full resize-none min-h-[100px]"
          value={val}
          onChange={e => setVal(e.target.value)}
          rows={Math.max(3, val.split('\n').length + 1)}
        />
      ) : (
        <div className="bg-bg2 border border-border p-4 font-sans text-sm text-text leading-relaxed whitespace-pre-wrap">
          {val}
        </div>
      )}
    </div>
  )
}

export default function PackViewerPage() {
  const { packId } = useParams()
  const { currentPack, setCurrentPack, activeTab, setActiveTab, brief, updateBrief } = useStore()
  const [pack, setPack] = useState(currentPack)
  const [regenLoading, setRegenLoading] = useState(null)
  const [registrations, setRegistrations] = useState(null)
  const [regsLoading, setRegsLoading] = useState(false)
  const [certStyle, setCertStyle] = useState('clean')
  const [certName, setCertName] = useState('')
  const [posterTemplate, setPosterTemplate] = useState('bold')
  const [placedStickers, setPlacedStickers] = useState([])
  const certRef = useRef(null)
  const canvasRef = useRef(null)
  const posterContainerRef = useRef(null)
  const draggingRef = useRef(null)

  useEffect(() => {
    if (!pack && packId) {
      api.getPack(packId).then(data => {
        const packData = data?.pack_data || data
        setPack(packData)
        setCurrentPack(packData)
        if (packData?.brief) {
          updateBrief(packData.brief)
          try { localStorage.setItem(`brief_${packId}`, JSON.stringify(packData.brief)) } catch {}
        }
      }).catch(() => toast.error('Pack not found'))
    }
  }, [packId])

  // Resolves brief from 3 sources: Zustand store → pack.brief → localStorage
  const getActiveBrief = () => {
    if (brief?.event_name) return brief
    if (pack?.brief?.event_name) return pack.brief
    try {
      const saved = localStorage.getItem(`brief_${packId}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return null
  }

  const regenerate = async (assetType) => {
    const activeBrief = getActiveBrief()
    if (!activeBrief?.event_name) {
      toast.error('Brief not found — please regenerate the full pack')
      return
    }
    setRegenLoading(assetType)
    try {
      const result = await api.regenerateSingle(activeBrief, assetType)
      const updated = result?.data?.[assetType]
      if (!updated) {
        toast.error('Regeneration returned empty — please try again')
        return
      }
      setPack(prev => ({ ...prev, [assetType]: updated }))
      toast.success('Regenerated!')
    } catch (e) {
      toast.error(e.message || 'Regeneration failed')
    } finally {
      setRegenLoading(null)
    }
  }

  const generatePoster = (template = posterTemplate) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = 800
    const H = canvas.height = 1100
    const activeBrief = getActiveBrief()
    const vibe = activeBrief?.vibe || 'energetic'
    const eventKey = (activeBrief?.event_name || 'event') + (activeBrief?.theme || '')

    let seed = eventKey.split('').reduce((a, c) => a + c.charCodeAt(0), 42)
    const rand = (min = 0, max = 1) => {
      seed = (seed * 9301 + 49297) % 233280
      return min + (seed / 233280) * (max - min)
    }

    const PALETTES = {
      fun:       { bg: '#1a0828', blobs: ['#FF6B9D', '#FF8E53', '#FFD93D', '#6BCB77', '#FF6B35'] },
      formal:    { bg: '#080818', blobs: ['#C9A84C', '#D4AF37', '#FFD700', '#BFA980', '#E8D5A3'] },
      meme:      { bg: '#050014', blobs: ['#00FF87', '#FF0080', '#7928CA', '#00D2FF', '#FFFF00'] },
      academic:  { bg: '#060d1e', blobs: ['#4E9AF1', '#60EFFF', '#A8D8EA', '#FFFFFF',  '#5B8DB8'] },
      energetic: { bg: '#0f0015', blobs: ['#EE0979', '#FF6A00', '#F9D423', '#FF4E50', '#FF00FF'] },
    }
    const p = PALETTES[vibe] || PALETTES.energetic

    // ── Step 1: luminous blob background ──────────────────────────────────
    ctx.fillStyle = p.bg
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'screen'
    const positions = [
      [W * 0.3, H * 0.2], [W * 0.7, H * 0.38], [W * 0.5, H * 0.65],
      [W * 0.15, H * 0.82], [W * 0.85, H * 0.25],
      [rand(100, W - 100), rand(100, H - 100)],
      [rand(100, W - 100), rand(100, H - 100)],
    ]
    positions.forEach(([cx, cy], i) => {
      const color = p.blobs[i % p.blobs.length]
      const r = rand(220, 480)
      const blob = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      blob.addColorStop(0,   color)
      blob.addColorStop(0.4, color + 'aa')
      blob.addColorStop(1,   '#000000')
      ctx.globalAlpha = rand(0.6, 0.9)
      ctx.fillStyle = blob
      ctx.fillRect(0, 0, W, H)
    })
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1

    // Subtle diagonal lines
    ctx.save()
    ctx.globalAlpha = 0.10
    ctx.strokeStyle = p.blobs[0]
    ctx.lineWidth = 1
    for (let i = -3; i < 10; i++) {
      ctx.beginPath(); ctx.moveTo(i * 150, 0); ctx.lineTo(i * 150 + H * 0.5, H); ctx.stroke()
    }
    ctx.restore()

    // Dot grid
    ctx.save()
    ctx.globalAlpha = 0.07
    ctx.fillStyle = p.blobs[1]
    for (let x = 25; x < W; x += 50)
      for (let y = 25; y < H; y += 50) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill()
      }
    ctx.restore()

    // ── Helpers ────────────────────────────────────────────────────────────
    const hBar = () => {
      const g = ctx.createLinearGradient(0, 0, W, 0)
      p.blobs.forEach((c, i) => g.addColorStop(i / (p.blobs.length - 1), c))
      return g
    }

    // Wrap text and return final line's y
    const wrapText = (text, x, y, maxW, lineH) => {
      const words = String(text).split(' ')
      let line = '', ly = y
      for (const word of words) {
        const test = line + word + ' '
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line.trim(), x, ly); line = word + ' '; ly += lineH
        } else { line = test }
      }
      if (line.trim()) ctx.fillText(line.trim(), x, ly)
      return ly
    }

    const b = activeBrief || {}
    const title    = pack?.poster_text?.headline || b.event_name || 'Event'
    const subtitle = b.theme || pack?.poster_text?.subheading || ''
    const dateTime = b.date_time || ''
    const venue    = b.venue || ''
    const clubName = b.club_name || b.organiser_name || ''
    const cta      = pack?.poster_text?.cta || b.cta_link || ''
    const accent   = p.blobs[0]

    // ── Step 2: template overlay ───────────────────────────────────────────
    if (template === 'bold') {
      // Dark scrim for readability
      ctx.fillStyle = 'rgba(0,0,0,0.42)'
      ctx.fillRect(0, 0, W, H)

      // Top rainbow bar
      ctx.fillStyle = hBar(); ctx.fillRect(0, 0, W, 6)

      // Club name
      ctx.textAlign = 'center'
      ctx.fillStyle = accent
      ctx.font = '400 13px monospace'
      ctx.fillText((clubName || 'Club').toUpperCase(), W / 2, 55)

      // Thin rule
      ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = accent; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(W * 0.25, 70); ctx.lineTo(W * 0.75, 70); ctx.stroke()
      ctx.restore()

      // "PRESENTS"
      ctx.fillStyle = 'rgba(255,255,255,0.40)'
      ctx.font = '300 11px monospace'
      ctx.fillText('P R E S E N T S', W / 2, 96)

      // Event title (large serif)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold 64px 'Playfair Display', Georgia, serif`
      const titleEndY = wrapText(title, W / 2, 220, W * 0.82, 78)

      // Theme / subtitle
      ctx.fillStyle = accent
      ctx.font = `italic 24px 'Playfair Display', Georgia, serif`
      ctx.fillText(subtitle, W / 2, titleEndY + 46)

      // Decorative divider ◆ ──────◆────── ◆
      const divY = titleEndY + 100
      ctx.save()
      ctx.globalAlpha = 0.55; ctx.strokeStyle = accent; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(W * 0.08, divY); ctx.lineTo(W * 0.40, divY); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(W * 0.60, divY); ctx.lineTo(W * 0.92, divY); ctx.stroke()
      ctx.restore()
      ctx.save(); ctx.translate(W / 2, divY); ctx.rotate(Math.PI / 4)
      ctx.fillStyle = accent; ctx.globalAlpha = 0.9; ctx.fillRect(-6, -6, 12, 12)
      ctx.restore()

      // Date & venue
      let detY = divY + 55
      if (dateTime) {
        ctx.fillStyle = '#FFFFFF'; ctx.font = '400 17px monospace'; ctx.textAlign = 'center'
        ctx.fillText('📅  ' + dateTime, W / 2, detY); detY += 42
      }
      if (venue) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '400 15px monospace'
        ctx.fillText('📍  ' + venue, W / 2, detY); detY += 42
      }

      // CTA box
      if (cta) {
        const ctaText = cta.length > 52 ? cta.slice(0, 49) + '…' : cta
        ctx.font = 'bold 13px monospace'
        const bw = Math.min(ctx.measureText(ctaText).width + 80, W * 0.7)
        const bx = (W - bw) / 2
        const by = H - 220
        ctx.fillStyle = accent; ctx.fillRect(bx, by, bw, 48)
        ctx.fillStyle = '#000'; ctx.fillText(ctaText, W / 2, by + 29)
      }

      // Organiser line
      ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = '300 12px monospace'
      ctx.fillText(`Organised by ${clubName}`, W / 2, H - 130)

      // Bottom rainbow bar
      ctx.fillStyle = hBar(); ctx.fillRect(0, H - 4, W, 4)

    } else if (template === 'minimal') {
      // NO full scrim — top area shows art
      // Bottom dark panel
      const panelTop = H * 0.50
      const pg = ctx.createLinearGradient(0, panelTop - 100, 0, H)
      pg.addColorStop(0, 'rgba(0,0,0,0)')
      pg.addColorStop(0.22, 'rgba(0,0,0,0.85)')
      pg.addColorStop(1,   'rgba(0,0,0,0.96)')
      ctx.fillStyle = pg; ctx.fillRect(0, panelTop - 100, W, H - (panelTop - 100))

      // Club tag top-left
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '400 12px monospace'
      ctx.fillText((clubName || 'Club').toUpperCase(), 40, 55)
      ctx.save(); ctx.strokeStyle = accent; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(40, 63); ctx.lineTo(40 + ctx.measureText((clubName || 'Club').toUpperCase()).width, 63); ctx.stroke()
      ctx.restore()

      // Left gold accent bar on text area
      ctx.fillStyle = accent; ctx.fillRect(40, panelTop + 10, 3, H - panelTop - 80)

      // Event name (big, left-aligned)
      ctx.textAlign = 'left'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold 56px 'Playfair Display', Georgia, serif`
      const titleEndY = wrapText(title, 60, panelTop + 80, W - 100, 68)

      // Theme
      ctx.fillStyle = accent
      ctx.font = `italic 21px 'Playfair Display', Georgia, serif`
      ctx.fillText(subtitle, 60, titleEndY + 38)

      let detY = titleEndY + 84
      if (dateTime) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '400 15px monospace'
        ctx.fillText(dateTime, 60, detY); detY += 34
      }
      if (venue) {
        ctx.fillStyle = 'rgba(255,255,255,0.60)'; ctx.font = '400 13px monospace'
        ctx.fillText(venue, 60, detY); detY += 34
      }
      if (cta) {
        ctx.fillStyle = accent; ctx.font = 'bold 12px monospace'
        ctx.fillText('→  ' + (cta.length > 55 ? cta.slice(0, 52) + '…' : cta), 60, detY + 10)
      }

      // Bottom bar
      ctx.fillStyle = hBar(); ctx.fillRect(0, H - 4, W, 4)

    } else {
      // ── festive template ───────────────────────────────────────────────
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(0, 0, W, H)

      // Corner bracket helper
      const M = 32
      const bracket = (x, y, fx, fy) => {
        const S = 56
        ctx.save(); ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.75
        ctx.beginPath()
        ctx.moveTo(x + fx * S, y); ctx.lineTo(x, y); ctx.lineTo(x, y + fy * S)
        ctx.stroke()
        ctx.fillStyle = accent; ctx.globalAlpha = 1
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      bracket(M, M, 1, 1); bracket(W - M, M, -1, 1)
      bracket(M, H - M, 1, -1); bracket(W - M, H - M, -1, -1)

      // Thin inner border
      ctx.save(); ctx.strokeStyle = accent; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.30
      ctx.strokeRect(M + 18, M + 18, W - (M + 18) * 2, H - (M + 18) * 2)
      ctx.restore()

      // Top rainbow bar
      ctx.fillStyle = hBar(); ctx.fillRect(0, 0, W, 5)

      // Club name
      ctx.textAlign = 'center'; ctx.fillStyle = accent; ctx.font = '400 12px monospace'
      ctx.fillText((clubName || 'Club').toUpperCase(), W / 2, 70)

      // Diamond row
      const diamond = (x, y, s) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4)
        ctx.fillStyle = accent; ctx.globalAlpha = 0.75
        ctx.fillRect(-s / 2, -s / 2, s, s); ctx.restore()
      }
      diamond(W / 2 - 110, 104, 6); diamond(W / 2, 104, 10); diamond(W / 2 + 110, 104, 6)

      // "INVITATION" tag
      ctx.fillStyle = 'rgba(255,255,255,0.42)'; ctx.font = '300 11px monospace'
      ctx.fillText('— EVENT INVITATION —', W / 2, 130)

      // Event title (large, centered)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold 60px 'Playfair Display', Georgia, serif`
      const titleEndY = wrapText(title, W / 2, 260, W * 0.78, 72)

      // Theme
      ctx.fillStyle = accent
      ctx.font = `italic 23px 'Playfair Display', Georgia, serif`
      ctx.fillText(subtitle, W / 2, titleEndY + 44)

      // Decorative rule with diamonds
      const ruleY = titleEndY + 92
      ctx.save(); ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.globalAlpha = 0.45
      ctx.beginPath(); ctx.moveTo(W * 0.12, ruleY); ctx.lineTo(W * 0.88, ruleY); ctx.stroke()
      ctx.restore()
      diamond(W / 2, ruleY, 9); diamond(W / 2 - 36, ruleY, 4); diamond(W / 2 + 36, ruleY, 4)

      // Date & venue (labeled sections)
      let detY = ruleY + 60; ctx.textAlign = 'center'
      if (dateTime) {
        ctx.fillStyle = accent; ctx.font = '400 11px monospace'; ctx.fillText('DATE & TIME', W / 2, detY)
        ctx.fillStyle = 'rgba(255,255,255,0.90)'; ctx.font = '400 17px monospace'
        ctx.fillText(dateTime, W / 2, detY + 26); detY += 72
      }
      if (venue) {
        ctx.fillStyle = accent; ctx.font = '400 11px monospace'; ctx.fillText('VENUE', W / 2, detY)
        ctx.fillStyle = 'rgba(255,255,255,0.90)'; ctx.font = '400 17px monospace'
        ctx.fillText(venue, W / 2, detY + 26); detY += 72
      }

      // CTA outlined box
      if (cta) {
        detY += 12
        const ctaText = cta.length > 50 ? cta.slice(0, 47) + '…' : cta
        ctx.font = 'bold 13px monospace'
        const bw = 380, bx = (W - bw) / 2
        ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.strokeRect(bx, detY, bw, 44)
        ctx.fillStyle = accent; ctx.fillText(ctaText, W / 2, detY + 27)
      }

      // Organiser
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '300 12px monospace'
      ctx.fillText(`Organised by ${clubName}`, W / 2, H - 58)

      // Bottom bar
      ctx.fillStyle = hBar(); ctx.fillRect(0, H - 4, W, 4)
    }

    const dataURL = canvas.toDataURL('image/jpeg', 0.92)
    setPack(prev => ({ ...prev, poster_image_url: dataURL }))
    toast.success('Poster generated!')
  }

  const downloadCertificate = async () => {
    if (!certRef.current) return
    toast.loading('Generating PDF…', { id: 'cert-dl' })
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const w = canvas.width / 2
      const h = canvas.height / 2
      const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'px', format: [w, h] })
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
      const safeName = (certName || 'participant').replace(/\s+/g, '-').toLowerCase()
      pdf.save(`certificate-${safeName}.pdf`)
      toast.success('Certificate downloaded!', { id: 'cert-dl' })
    } catch {
      toast.error('Download failed', { id: 'cert-dl' })
    }
  }

  const placeSticker = (key) => {
    setPlacedStickers(prev => [...prev, { id: Date.now(), key, xPct: 50, yPct: 50, size: 90 }])
  }

  const removePlacedSticker = (id) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id))
  }

  const clearPlacedStickers = () => setPlacedStickers([])

  const onStickerPointerDown = (e, id) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    draggingRef.current = {
      id,
      offsetX: e.clientX - rect.left - rect.width / 2,
      offsetY: e.clientY - rect.top - rect.height / 2,
    }
  }

  const onContainerPointerMove = (e) => {
    if (!draggingRef.current) return
    const container = posterContainerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left - draggingRef.current.offsetX) / rect.width) * 100
    const yPct = ((e.clientY - rect.top - draggingRef.current.offsetY) / rect.height) * 100
    setPlacedStickers(prev => prev.map(s =>
      s.id === draggingRef.current.id
        ? { ...s, xPct: Math.max(0, Math.min(100, xPct)), yPct: Math.max(0, Math.min(100, yPct)) }
        : s
    ))
  }

  const onContainerPointerUp = () => { draggingRef.current = null }

  const downloadRegistrationsCSV = () => {
    if (!registrations?.length) { toast.error('No registrations to download'); return }
    const rows = [
      ['#', 'Name', 'Email', 'Roll No', 'Registered At'],
      ...registrations.map((r, i) => [
        i + 1,
        r.participant_name,
        r.participant_email,
        r.roll_no || '',
        new Date(r.registered_at).toLocaleString('en-IN'),
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(pack.event_name || 'event').replace(/\s+/g, '-')}-registrations.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('Registrations downloaded!')
  }

  const downloadFullPack = async () => {
    toast.loading('Building PDF…', { id: 'full-pdf' })
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const PW = 210, PH = 297, M = 18, CW = PW - M * 2
      const b = getActiveBrief() || {}

      // Palette — tuned for print (white bg)
      const G  = [165, 125, 35]
      const D  = [18, 15, 28]
      const TX = [28, 26, 22]
      const MU = [110, 105, 95]
      const LN = [215, 210, 198]
      const BG = [249, 248, 245]

      // Strip emojis & non-Latin chars that helvetica can't render
      const clean = s => (s || '')
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/[^\u0000-\u024F\u2010-\u2027\u2030-\u205E\u20A0-\u20CF]/g, '')
        .replace(/\s+/g, ' ').trim()

      // ── Helpers ───────────────────────────────────────────────────────────
      const rule = (y, col = LN) => {
        pdf.setDrawColor(...col); pdf.setLineWidth(0.25)
        pdf.line(M, y, PW - M, y)
      }
      const footer = () => {
        rule(PH - 16)
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(...MU)
        pdf.text('Fest-in-a-Box  ·  Event Asset Pack', M, PH - 10)
        pdf.text(
          new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          PW - M, PH - 10, { align: 'right' }
        )
      }

      // ════════════════════════════════════════════════════════════════════════
      // SINGLE PAGE — Full Event Pack Summary
      // ════════════════════════════════════════════════════════════════════════

      // Thin gold top bar
      pdf.setFillColor(...G); pdf.rect(0, 0, PW, 2, 'F')

      // Eyebrow
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(...MU)
      pdf.text('FEST-IN-A-BOX  ·  EVENT ASSET PACK', M, 13)

      // Event name
      let y = 26
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(28); pdf.setTextColor(...D)
      const nameLines = pdf.splitTextToSize(clean(pack.event_name) || 'Event Pack', CW)
      nameLines.slice(0, 2).forEach(line => { pdf.text(line, M, y); y += 11 })

      // Theme
      if (b.theme) {
        pdf.setFont('helvetica', 'italic'); pdf.setFontSize(11); pdf.setTextColor(...G)
        pdf.text(clean(b.theme), M, y + 1); y += 8
      }

      y += 3; rule(y); y += 8

      // Event details — 2-column
      const infoItems = [
        { label: 'Date & Time',  value: b.date_time },
        { label: 'Venue',        value: b.venue },
        { label: 'Organised By', value: b.club_name || b.organiser_name },
        { label: 'Vibe',         value: b.vibe ? b.vibe.charAt(0).toUpperCase() + b.vibe.slice(1) : null },
      ].filter(i => i.value)

      const COL = CW / 2 - 4
      infoItems.forEach((item, idx) => {
        const cx = M + (idx % 2) * (COL + 8)
        const iy = y + Math.floor(idx / 2) * 13
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6.5); pdf.setTextColor(...MU)
        pdf.text(item.label.toUpperCase(), cx, iy)
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(...TX)
        pdf.text(pdf.splitTextToSize(clean(String(item.value)), COL)[0], cx, iy + 5)
      })
      y += Math.ceil(infoItems.length / 2) * 13 + 5

      rule(y); y += 8

      // Asset status badges
      const ASSET_LIST = [
        { label: 'Event Poster',   key: 'poster_image_url' },
        { label: 'Poster Copy',    key: 'poster_text' },
        { label: 'Social Media',   key: 'social' },
        { label: 'Emcee Script',   key: 'emcee_script' },
        { label: 'Emails',         key: 'email' },
        { label: 'Certificate',    key: 'certificate' },
        { label: 'Schedule',       key: 'schedule' },
        { label: 'QR Signup',      key: 'qr_code_url' },
      ]
      const done = ASSET_LIST.filter(a => !!pack[a.key])
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7); pdf.setTextColor(...MU)
      pdf.text(`ASSETS  ·  ${done.length} OF ${ASSET_LIST.length} GENERATED`, M, y); y += 6

      let px = M
      ASSET_LIST.forEach(a => {
        const isReady = !!pack[a.key]
        pdf.setFont('helvetica', isReady ? 'bold' : 'normal'); pdf.setFontSize(7)
        const tw = pdf.getTextWidth(a.label) + 8
        if (px + tw > PW - M) { px = M; y += 7.5 }
        if (isReady) {
          pdf.setFillColor(243, 238, 215); pdf.roundedRect(px, y - 4.5, tw, 6.5, 1.2, 1.2, 'F')
          pdf.setTextColor(...G)
        } else {
          pdf.setFillColor(238, 237, 234); pdf.roundedRect(px, y - 4.5, tw, 6.5, 1.2, 1.2, 'F')
          pdf.setTextColor(160, 155, 145)
        }
        pdf.text(a.label, px + 4, y); px += tw + 3
      })
      y += 11; rule(y); y += 8

      // Content snippets (emoji-cleaned)
      const snippet = (heading, content, maxLines = 2, quoted = false) => {
        if (!content || y > 248) return
        const text = clean(content)
        if (!text) return
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7); pdf.setTextColor(...G)
        pdf.text(heading.toUpperCase(), M, y); y += 5
        const lines = pdf.splitTextToSize(text, quoted ? CW - 6 : CW).slice(0, maxLines)
        if (quoted) { pdf.setFillColor(...G); pdf.rect(M, y - 1.5, 1.5, lines.length * 5 + 1, 'F') }
        pdf.setFont('helvetica', quoted ? 'italic' : 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(...TX)
        pdf.text(lines, quoted ? M + 5 : M, y); y += lines.length * 5 + 5
      }

      snippet('Poster Headline', pack.poster_text?.headline, 2, true)
      snippet('Call to Action', pack.poster_text?.cta, 1)
      if (pack.poster_text?.hashtags?.length)
        snippet('Hashtags', pack.poster_text.hashtags.map(h => '#' + h).join('  '), 1)
      snippet('Instagram Caption', pack.social?.instagram_caption, 2, true)
      snippet('WhatsApp Broadcast', pack.social?.whatsapp_broadcast, 2)

      // Schedule table
      if (pack.schedule?.timeline?.length && y < 240) {
        rule(y); y += 7
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7); pdf.setTextColor(...G)
        pdf.text('EVENT SCHEDULE', M, y); y += 6
        pack.schedule.timeline.slice(0, 7).forEach((slot, i) => {
          if (y > 265) return
          if (i % 2 === 0) { pdf.setFillColor(...BG); pdf.rect(M, y - 3.5, CW, 6.5, 'F') }
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); pdf.setTextColor(...G)
          pdf.text(clean(slot.time), M + 2, y)
          pdf.setFont('helvetica', 'normal'); pdf.setTextColor(...TX)
          pdf.text(pdf.splitTextToSize(clean(slot.activity), CW - 50)[0], M + 30, y)
          pdf.setTextColor(...MU)
          pdf.text(clean(slot.duration), PW - M - 2, y, { align: 'right' }); y += 7
        })
      }

      // Emcee opening (if room)
      if (pack.emcee_script?.intro && y < 240) {
        rule(y); y += 7
        snippet('Emcee Opening', pack.emcee_script.intro, 2, true)
      }

      footer()

      pdf.save(`${(pack.event_name || 'event').replace(/\s+/g, '-')}-pack.pdf`)
      toast.success('Full pack downloaded!', { id: 'full-pdf' })
    } catch (e) {
      console.error(e)
      toast.error('PDF generation failed', { id: 'full-pdf' })
    }
  }

  useEffect(() => {
    if (activeTab === 'qr' && pack?.share_token && registrations === null) {
      setRegsLoading(true)
      api.getRegistrations(pack.share_token)
        .then(data => setRegistrations(data.registrations || []))
        .catch(() => setRegistrations([]))
        .finally(() => setRegsLoading(false))
    }
  }, [activeTab, pack?.share_token])

  // Auto-generate poster when Poster Art tab opens
  useEffect(() => {
    if (activeTab === 'image' && pack) generatePoster(posterTemplate)
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const downloadPosterImage = async () => {
    toast.loading('Preparing download…', { id: 'poster-dl' })
    try {
      const container = posterContainerRef.current
      if (container) {
        const canvas = await html2canvas(container, { scale: 2, useCORS: true, allowTaint: true })
        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/jpeg', 0.92)
        a.download = `${(pack.event_name || 'poster').replace(/\s+/g, '-')}-poster.jpg`
        a.click()
      } else if (pack.poster_image_url) {
        const a = document.createElement('a')
        a.href = pack.poster_image_url
        a.download = `${(pack.event_name || 'poster').replace(/\s+/g, '-')}-poster.jpg`
        a.click()
      }
      toast.success('Image downloaded!', { id: 'poster-dl' })
    } catch {
      toast.error('Download failed', { id: 'poster-dl' })
    }
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/signup/${pack?.share_token}`
    navigator.clipboard.writeText(url)
    toast.success('Share link copied!')
  }

  if (!pack) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-gold" size={24} />
    </div>
  )

  const RegenBtn = ({ type }) => (
    <button onClick={() => regenerate(type)}
      disabled={!!regenLoading}
      className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest
        text-muted hover:text-gold border border-border hover:border-gold px-3 py-1.5 transition-all disabled:opacity-50">
      {regenLoading === type ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
      Regenerate
    </button>
  )

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0 justify-between">
          <div>
            <div className="section-tag">Generated Pack</div>
            <h1 className="font-serif text-3xl font-black text-cream">{pack.event_name}</h1>
            {pack.created_at && (
              <p className="font-mono text-[11px] text-muted mt-1">
                {new Date(pack.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={copyShareLink}
              className="btn-ghost flex items-center gap-2 text-[11px]">
              <Share2 size={13} /> Share Link
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto mb-8 border-b border-border pb-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-all
              ${activeTab === tab.id
                ? 'text-gold border-b-2 border-gold -mb-[13px]'
                : 'text-muted hover:text-cream'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}>

          {/* POSTER TEXT */}
          {activeTab === 'poster_text' && pack.poster_text && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-serif text-xl text-cream">Poster Copy</h2>
                <RegenBtn type="poster_text" />
              </div>
              <TextBlock label="Headline" content={pack.poster_text.headline} editable />
              <TextBlock label="Subheading" content={pack.poster_text.subheading} editable />
              <TextBlock label="Details" content={pack.poster_text.details} editable />
              <TextBlock label="Call to Action" content={pack.poster_text.cta} editable />
              <div className="mb-5">
                <span className="label-mono block mb-2">Hashtags</span>
                <div className="flex flex-wrap gap-2">
                  {pack.poster_text.hashtags?.map(h => (
                    <span key={h} className="font-mono text-xs text-gold border border-[rgba(201,168,76,0.3)] px-3 py-1">
                      #{h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {activeTab === 'social' && pack.social && (
            <div>
              <div className="flex justify-between items-center mb-7">
                <h2 className="font-serif text-xl text-cream">Social Media Pack</h2>
                <RegenBtn type="social" />
              </div>

              {/* Instagram */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-gold border border-[rgba(201,168,76,0.35)] px-2.5 py-1">
                    Instagram
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <TextBlock label="Post Caption" content={pack.social.instagram_caption} editable />
                {pack.social.instagram_hashtags?.length > 0 && (
                  <div className="mb-5">
                    <span className="label-mono block mb-3">Hashtags</span>
                    <div className="flex flex-wrap gap-2">
                      {pack.social.instagram_hashtags.map(h => (
                        <span key={h}
                          className="font-mono text-[11px] text-gold bg-[rgba(201,168,76,0.07)] border border-[rgba(201,168,76,0.25)] px-3 py-1.5 rounded-full">
                          #{h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#4ade80] border border-[rgba(74,222,128,0.3)] px-2.5 py-1">
                    WhatsApp
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <TextBlock label="Broadcast Message" content={pack.social.whatsapp_broadcast} editable />
              </div>
            </div>
          )}

          {/* EMCEE */}
          {activeTab === 'emcee_script' && pack.emcee_script && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-serif text-xl text-cream">Emcee Script</h2>
                <RegenBtn type="emcee_script" />
              </div>
              <TextBlock label="Opening Introduction" content={pack.emcee_script.intro} editable />
              <TextBlock label="Crowd Warm-Up" content={pack.emcee_script.crowd_warmup} editable />
              {pack.emcee_script.segment_transitions?.map((t, i) => (
                <TextBlock key={i} label={`Transition ${i + 1}`} content={t} editable />
              ))}
              <TextBlock label="Closing Statement" content={pack.emcee_script.closing} editable />
            </div>
          )}

          {/* EMAIL */}
          {activeTab === 'email' && pack.email && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-serif text-xl text-cream">Announcement Emails</h2>
                <RegenBtn type="email" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-serif text-base text-gold mb-3">For Faculty</h3>
                  <TextBlock label="Subject Line" content={pack.email.subject_faculty} editable />
                  <TextBlock label="Email Body" content={pack.email.body_faculty} editable />
                </div>
                <div>
                  <h3 className="font-serif text-base text-gold mb-3">For Students</h3>
                  <TextBlock label="Subject Line" content={pack.email.subject_students} editable />
                  <TextBlock label="Email Body" content={pack.email.body_students} editable />
                </div>
              </div>
            </div>
          )}

          {/* CERTIFICATE */}
          {activeTab === 'certificate' && pack.certificate && (() => {
            const cs = CERT_STYLES[certStyle]
            return (
              <div>
                <div className="mb-4">
                  <h2 className="font-serif text-xl text-cream">Participation Certificate</h2>
                </div>
                {/* Style picker */}
                <div className="flex gap-2 mb-5">
                  {Object.keys(CERT_STYLES).map(s => (
                    <button key={s} onClick={() => setCertStyle(s)}
                      className={`font-mono text-[11px] uppercase tracking-widest px-4 py-1.5 border transition-all
                        ${certStyle === s ? 'border-gold text-gold bg-[rgba(201,168,76,0.08)]' : 'border-border text-muted hover:border-muted'}`}>
                      {s}
                    </button>
                  ))}
                </div>

                {/* Participant Name Input */}
                <div className="mb-5 p-5 border border-gold/30 bg-[rgba(201,168,76,0.04)]">
                  <label className="font-mono text-[11px] uppercase tracking-widest text-gold block mb-3">
                    Participant Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-transparent border-0 border-b-2 border-gold/40 focus:border-gold outline-none
                      font-serif text-3xl italic text-cream text-center pb-2 placeholder:text-muted/50
                      transition-colors"
                    placeholder="Enter participant name…"
                    value={certName}
                    onChange={e => setCertName(e.target.value)}
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  />
                  <p className="font-mono text-[10px] text-muted text-center mt-2">
                    This name appears on the certificate preview and PDF
                  </p>
                </div>

                {/* Preview */}
                <div className="p-8 mb-4 text-center" style={{ background: cs.bg, border: `1px solid ${cs.border}` }}>
                  <div className="p-8" style={{ border: `1px solid ${cs.border}` }}>
                    <p className="font-mono text-[10px] tracking-[0.3em] mb-4 uppercase" style={{ color: cs.title }}>
                      {pack.certificate.title}
                    </p>
                    <p className="font-mono text-xs mb-2" style={{ color: cs.muted }}>This is to certify that</p>
                    <p className="font-serif text-3xl italic mb-4" style={{ color: cs.name, fontFamily: 'Playfair Display, serif' }}>
                      {certName || '[Participant Name]'}
                    </p>
                    <p className="font-sans text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: cs.body }}>
                      {pack.certificate.body}
                    </p>
                    <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${cs.divider}` }}>
                      <p className="font-mono text-[11px] whitespace-pre-line" style={{ color: cs.muted }}>{pack.certificate.signatory_block}</p>
                    </div>
                  </div>
                </div>

                {/* Download button */}
                <button onClick={downloadCertificate}
                  className="w-full flex items-center justify-center gap-2 mb-6 border border-gold text-gold
                    font-mono text-[11px] uppercase tracking-widest py-3 hover:bg-[rgba(201,168,76,0.08)] transition-colors">
                  <Download size={13} /> Download Certificate as PDF
                </button>

                <TextBlock label="Certificate Body Text" content={pack.certificate.body} editable
                  onUpdate={val => setPack(prev => ({ ...prev, certificate: { ...prev.certificate, body: val } }))} />
                <TextBlock label="Signatory Block" content={pack.certificate.signatory_block} editable
                  onUpdate={val => setPack(prev => ({ ...prev, certificate: { ...prev.certificate, signatory_block: val } }))} />
              </div>
            )
          })()}

          {/* SCHEDULE */}
          {activeTab === 'schedule' && pack.schedule && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-serif text-xl text-cream">Event Schedule</h2>
                <RegenBtn type="schedule" />
              </div>
              <h3 className="font-serif text-lg text-gold mb-4">{pack.schedule.title}</h3>
              <div className="space-y-2">
                {pack.schedule.timeline?.map((slot, i) => (
                  <div key={i} className="flex items-center gap-4 border border-border p-4 hover:bg-bg2 transition-colors">
                    <span className="font-mono text-[11px] text-gold w-24 flex-shrink-0">{slot.time}</span>
                    <span className="font-sans text-sm text-cream flex-1">{slot.activity}</span>
                    <span className="font-mono text-[10px] text-muted">{slot.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR CODE */}
          {activeTab === 'qr' && (
            <div>
              <h2 className="font-serif text-xl text-cream mb-5">QR Signup Page</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  {pack.qr_code_url ? (
                    <img src={pack.qr_code_url} alt="QR Code" className="mx-auto border border-border" />
                  ) : (
                    <div className="w-48 h-48 bg-bg2 border border-border mx-auto flex items-center justify-center">
                      <QrCode size={40} className="text-muted" />
                    </div>
                  )}
                  <p className="font-mono text-[11px] text-muted mt-3">Scan to register for the event</p>
                </div>
                <div>
                  <p className="label-mono mb-2">Signup Page Link</p>
                  <div className="input-field font-mono text-xs break-all mb-3">
                    {`${window.location.origin}/signup/${pack.share_token}`}
                  </div>
                  <button onClick={copyShareLink} className="btn-ghost w-full flex items-center justify-center gap-2">
                    <Copy size={13} /> Copy Signup Link
                  </button>
                  <div className="mt-4 p-4 bg-bg2 border border-border">
                    <p className="label-mono mb-2">How to use</p>
                    <ul className="font-sans text-xs text-muted leading-relaxed space-y-1">
                      <li>• Print and place on event boards</li>
                      <li>• Add to Instagram stories</li>
                      <li>• Share in WhatsApp groups</li>
                      <li>• Embed in your email</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Registrations List */}
              <div className="mt-8 border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Users size={16} className="text-gold" />
                  <h3 className="font-serif text-lg text-cream">Registrations</h3>
                  {registrations && (
                    <span className="font-mono text-[11px] text-gold border border-[rgba(201,168,76,0.3)] px-2 py-0.5 ml-1">
                      {registrations.length}
                    </span>
                  )}
                  {registrations && registrations.length > 0 && (
                    <button onClick={downloadRegistrationsCSV}
                      className="ml-auto flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest
                        text-muted hover:text-gold border border-border hover:border-gold px-3 py-1.5 transition-all">
                      <Download size={11} /> Download CSV
                    </button>
                  )}
                </div>
                {regsLoading ? (
                  <div className="flex items-center gap-2 text-muted font-mono text-xs py-6">
                    <Loader2 size={14} className="animate-spin" /> Loading registrations…
                  </div>
                ) : registrations && registrations.length === 0 ? (
                  <p className="font-mono text-xs text-muted py-6 text-center border border-border bg-bg2">
                    No registrations yet. Share the QR code to get signups!
                  </p>
                ) : registrations && registrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="font-mono text-[10px] uppercase tracking-widest text-muted pb-2 pr-4">#</th>
                          <th className="font-mono text-[10px] uppercase tracking-widest text-muted pb-2 pr-4">Name</th>
                          <th className="font-mono text-[10px] uppercase tracking-widest text-muted pb-2 pr-4">Email</th>
                          <th className="font-mono text-[10px] uppercase tracking-widest text-muted pb-2 pr-4">Roll No</th>
                          <th className="font-mono text-[10px] uppercase tracking-widest text-muted pb-2">Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((r, i) => (
                          <tr key={r.id} className="border-b border-border/40 hover:bg-bg2 transition-colors">
                            <td className="font-mono text-[11px] text-muted py-3 pr-4">{i + 1}</td>
                            <td className="font-sans text-sm text-cream py-3 pr-4">{r.participant_name}</td>
                            <td className="font-mono text-xs text-text py-3 pr-4">{r.participant_email}</td>
                            <td className="font-mono text-xs text-muted py-3 pr-4">{r.roll_no || '—'}</td>
                            <td className="font-mono text-[11px] text-muted py-3">
                              {new Date(r.registered_at).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* POSTER IMAGE */}
          {activeTab === 'image' && (
            <div>
              <div className="mb-5">
                <h2 className="font-serif text-xl text-cream mb-1">Event Poster</h2>
                <p className="font-mono text-[11px] text-muted">Full poster with your event details — pick a template style</p>
              </div>

              {/* Template picker */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'bold',    label: 'Bold',    desc: 'Centered, large title' },
                  { id: 'minimal', label: 'Minimal', desc: 'Art-forward, text at bottom' },
                  { id: 'festive', label: 'Festive', desc: 'Ornate invitation style' },
                ].map(t => (
                  <button key={t.id}
                    onClick={() => { setPosterTemplate(t.id); generatePoster(t.id) }}
                    title={t.desc}
                    className={`font-mono text-[11px] uppercase tracking-widest px-5 py-2 border transition-all
                      ${posterTemplate === t.id
                        ? 'border-gold text-gold bg-[rgba(201,168,76,0.08)]'
                        : 'border-border text-muted hover:border-muted hover:text-cream'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Sticker palette */}
              {(() => {
                const b = getActiveBrief() || {}
                const vibe = b.vibe || 'energetic'
                const themeStickers = STICKER_META.filter(s => s.vibes.includes(vibe))
                const otherStickers = STICKER_META.filter(s => !s.vibes.includes(vibe))
                return (
                  <div className="mb-6 border border-border p-4 bg-bg2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="label-mono">Character Stickers</p>
                      {placedStickers.length > 0 && (
                        <button onClick={clearPlacedStickers}
                          className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-gold transition-colors">
                          Clear All
                        </button>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-muted mb-3">Click to add · Drag on poster to reposition · × to remove</p>

                    {/* Theme-matched stickers */}
                    <div className="mb-3">
                      <span className="font-mono text-[10px] text-gold uppercase tracking-widest block mb-2">For your event</span>
                      <div className="flex flex-wrap gap-2">
                        {themeStickers.map(meta => (
                          <button key={meta.key} onClick={() => placeSticker(meta.key)} title={meta.label}
                            className="w-14 h-14 border border-border hover:border-gold bg-bg hover:bg-[rgba(201,168,76,0.06)]
                              transition-all flex flex-col items-center justify-center gap-0.5 rounded overflow-hidden">
                            <div style={{ width: 40, height: 40 }}>{STICKER_SVGS[meta.key]}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Other stickers */}
                    {otherStickers.length > 0 && (
                      <div className="mb-3">
                        <span className="font-mono text-[10px] text-muted uppercase tracking-widest block mb-2">More stickers</span>
                        <div className="flex flex-wrap gap-2">
                          {otherStickers.map(meta => (
                            <button key={meta.key} onClick={() => placeSticker(meta.key)} title={meta.label}
                              className="w-14 h-14 border border-border hover:border-gold bg-bg hover:bg-[rgba(201,168,76,0.06)]
                                transition-all flex items-center justify-center rounded overflow-hidden">
                              <div style={{ width: 40, height: 40 }}>{STICKER_SVGS[meta.key]}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Placed sticker chips */}
                    {placedStickers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
                        {placedStickers.map(s => {
                          const meta = STICKER_META.find(m => m.key === s.key)
                          return (
                            <span key={s.id}
                              className="inline-flex items-center gap-1 font-mono text-[11px] bg-bg border border-border px-2 py-1">
                              <span style={{ width: 16, height: 16, display: 'inline-block' }}>{STICKER_SVGS[s.key]}</span>
                              {meta?.label}
                              <button onClick={() => removePlacedSticker(s.id)}
                                className="text-muted hover:text-gold leading-none ml-0.5">×</button>
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Poster with draggable sticker overlays */}
                <div
                  ref={posterContainerRef}
                  style={{ position: 'relative', display: 'inline-block', width: '100%' }}
                  onPointerMove={onContainerPointerMove}
                  onPointerUp={onContainerPointerUp}
                  onPointerLeave={onContainerPointerUp}>
                  {pack.poster_image_url ? (
                    <img src={pack.poster_image_url} alt="Event poster"
                      className="w-full border border-border shadow-lg" style={{ display: 'block' }} />
                  ) : (
                    <div className="aspect-[8/11] bg-bg2 border border-border flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-gold" />
                    </div>
                  )}
                  {placedStickers.map(s => (
                    <div key={s.id}
                      style={{
                        position: 'absolute',
                        left: `${s.xPct}%`,
                        top: `${s.yPct}%`,
                        width: s.size,
                        height: s.size,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'grab',
                        touchAction: 'none',
                        userSelect: 'none',
                        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))',
                      }}
                      onPointerDown={e => onStickerPointerDown(e, s.id)}>
                      {STICKER_SVGS[s.key]}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="border border-border p-4 bg-bg2">
                    <p className="label-mono mb-3">Poster Details</p>
                    {(() => {
                      const b = getActiveBrief() || {}
                      return (
                        <div className="space-y-2 font-mono text-[11px]">
                          <div className="flex gap-3"><span className="text-muted w-16">Event</span><span className="text-cream">{b.event_name || '—'}</span></div>
                          {b.theme    && <div className="flex gap-3"><span className="text-muted w-16">Theme</span><span className="text-cream">{b.theme}</span></div>}
                          {b.date_time && <div className="flex gap-3"><span className="text-muted w-16">Date</span><span className="text-cream">{b.date_time}</span></div>}
                          {b.venue    && <div className="flex gap-3"><span className="text-muted w-16">Venue</span><span className="text-cream">{b.venue}</span></div>}
                          {b.club_name && <div className="flex gap-3"><span className="text-muted w-16">Club</span><span className="text-cream">{b.club_name}</span></div>}
                          {b.vibe     && <div className="flex gap-3"><span className="text-muted w-16">Vibe</span><span className="text-gold capitalize">{b.vibe}</span></div>}
                        </div>
                      )
                    })()}
                  </div>

                  <p className="font-mono text-[10px] text-muted leading-relaxed">
                    Rendered in your browser — no external API. Safe for club use.
                  </p>

                  <button onClick={downloadPosterImage}
                    className="w-full flex items-center justify-center gap-2 border border-gold text-gold
                      font-mono text-[11px] uppercase tracking-widest py-3 hover:bg-[rgba(201,168,76,0.08)] transition-colors">
                    <Download size={13} /> Download Poster (JPG)
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* EXPORT */}
          {activeTab === 'export' && (
            <div>
              <div className="mb-6">
                <h2 className="font-serif text-xl text-cream mb-1">Export Full Pack</h2>
                <p className="font-mono text-[11px] text-muted">Download all generated assets as a single PDF or individual files</p>
              </div>

              {/* Asset checklist */}
              {(() => {
                const ASSET_LIST = [
                  { label: 'Event Poster (Image)',    key: 'poster_image_url' },
                  { label: 'Poster Copy',             key: 'poster_text' },
                  { label: 'Social Media Pack',       key: 'social' },
                  { label: 'Emcee Script',            key: 'emcee_script' },
                  { label: 'Announcement Emails',     key: 'email' },
                  { label: 'Participation Certificate', key: 'certificate' },
                  { label: 'Event Schedule',          key: 'schedule' },
                  { label: 'QR Signup Page',          key: 'qr_code_url' },
                ]
                const generated = ASSET_LIST.filter(a => !!pack[a.key])
                return (
                  <div className="border border-border bg-bg2 p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="label-mono">Assets Generated</p>
                      <span className="font-mono text-[13px] font-bold text-gold">
                        {generated.length} / {ASSET_LIST.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ASSET_LIST.map(a => {
                        const done = !!pack[a.key]
                        return (
                          <div key={a.key} className={`flex items-center gap-3 font-mono text-[11px] px-3 py-2 border
                            ${done ? 'border-[rgba(201,168,76,0.25)] text-cream' : 'border-border text-muted'}`}>
                            <span className={done ? 'text-gold' : 'text-muted/40'}>{done ? '✓' : '○'}</span>
                            {a.label}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Download buttons */}
              <div className="space-y-3">
                <button onClick={downloadFullPack}
                  className="w-full flex items-center justify-center gap-2 bg-gold text-bg
                    font-mono text-[12px] uppercase tracking-widest py-4 hover:bg-[#b8962e] transition-colors font-bold">
                  <Download size={14} /> Download Full Pack (PDF)
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={downloadPosterImage}
                    disabled={!pack.poster_image_url}
                    className="flex items-center justify-center gap-2 border border-border text-muted
                      font-mono text-[11px] uppercase tracking-widest py-3 hover:border-gold hover:text-gold
                      transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Download size={11} /> Poster (JPG)
                  </button>

                  <button onClick={downloadCertificate}
                    disabled={!pack.certificate}
                    className="flex items-center justify-center gap-2 border border-border text-muted
                      font-mono text-[11px] uppercase tracking-widest py-3 hover:border-gold hover:text-gold
                      transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Download size={11} /> Certificate (PDF)
                  </button>

                  {registrations && registrations.length > 0 && (
                    <button onClick={downloadRegistrationsCSV}
                      className="col-span-2 flex items-center justify-center gap-2 border border-border text-muted
                        font-mono text-[11px] uppercase tracking-widest py-3 hover:border-gold hover:text-gold transition-all">
                      <Download size={11} /> Registrations List (CSV) · {registrations.length} entries
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Hidden canvas — must always be in DOM */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden certificate div — always in DOM so certRef works from any tab */}
      {pack?.certificate && (() => {
        const cs = CERT_STYLES[certStyle]
        return (
          <div ref={certRef}
            style={{ position: 'fixed', left: '-9999px', top: 0, width: 640, pointerEvents: 'none', zIndex: -1,
              background: cs.bg, border: `1px solid ${cs.border}`, padding: 32, textAlign: 'center' }}>
            <div style={{ border: `1px solid ${cs.border}`, padding: 32 }}>
              <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.3em', marginBottom: 16, textTransform: 'uppercase', color: cs.title }}>
                {pack.certificate.title}
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 8, color: cs.muted }}>This is to certify that</p>
              <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 28, fontStyle: 'italic', marginBottom: 16, color: cs.name }}>
                {certName || '[Participant Name]'}
              </p>
              <p style={{ fontFamily: 'sans-serif', fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px', color: cs.body }}>
                {pack.certificate.body}
              </p>
              <div style={{ borderTop: `1px solid ${cs.divider}`, paddingTop: 16, marginTop: 16 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-line', color: cs.muted }}>
                  {pack.certificate.signatory_block}
                </p>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
