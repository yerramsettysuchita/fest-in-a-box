import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useStore } from '../lib/store'

export default function DashboardPage() {
  const { user, savedPacks, setSavedPacks } = useStore()
  const nav = useNavigate()

  useEffect(() => {
    if (!user) { nav('/auth'); return }
    api.getUserPacks(user.id).then(res => setSavedPacks(res.packs)).catch(console.error)
  }, [user])

  const deletePack = async (packId) => {
    if (!confirm('Delete this pack?')) return
    try {
      await api.deletePack(packId)
      setSavedPacks(savedPacks.filter(p => p.id !== packId))
      toast.success('Pack deleted')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 py-10 sm:py-12 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="section-tag">My Workspace</div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-0 justify-between">
          <h1 className="font-serif text-3xl font-black text-cream">Event Packs</h1>
          <Link to="/generate" className="btn-gold flex items-center gap-2 text-sm">
            <Plus size={16} /> New Pack
          </Link>
        </div>
      </motion.div>

      {savedPacks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <p className="font-serif text-xl text-muted mb-4">No packs yet</p>
          <Link to="/generate" className="btn-gold inline-flex items-center gap-2">
            <Plus size={16} /> Create your first pack
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {savedPacks.map((pack, i) => (
            <motion.div key={pack.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5 group">
              <p className="label-mono text-gold mb-2">Pack</p>
              <h3 className="font-serif text-lg text-cream mb-1 leading-tight">{pack.event_name}</h3>
              {pack.headline && (
                <p className="font-sans text-xs text-muted italic mb-3">"{pack.headline}"</p>
              )}
              <p className="font-mono text-[11px] text-muted mb-4">
                {new Date(pack.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="flex gap-2">
                <Link to={`/pack/${pack.id}`}
                  className="flex-1 btn-ghost flex items-center justify-center gap-1.5 text-[11px]">
                  <ExternalLink size={11} /> Open
                </Link>
                <button onClick={() => deletePack(pack.id)}
                  className="p-2 border border-border text-muted hover:border-rust hover:text-rust transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
