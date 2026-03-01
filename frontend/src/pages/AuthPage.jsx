import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const nav = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmail = async () => {
    if (!email || !password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    try {
      const fn = mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })
      const { error } = await fn
      if (error) throw error
      toast.success(mode === 'signup' ? 'Check your email to confirm!' : 'Welcome back!')
      nav(redirectTo, { replace: true })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) {
        toast.error(`Google sign-in failed: ${error.message}`)
        console.error('OAuth error:', error)
        return
      }
      toast.success('Redirecting to Google...')
    } catch (e) {
      toast.error(`Google sign-in error: ${e.message}. Make sure Google OAuth is configured in your Supabase project.`)
      console.error('OAuth exception:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-serif text-2xl font-bold text-cream mb-2">
            Fest<span className="text-gold">.</span>Box
          </div>
          <p className="font-mono text-[11px] text-muted uppercase tracking-widest">
            {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </p>
        </div>

        <div className="card p-8 space-y-5">
          {/* Google OAuth */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full btn-ghost flex items-center justify-center gap-3">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="font-mono text-[10px] text-muted uppercase">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div>
            <label className="label-mono block mb-2">Email</label>
            <input type="email" className="input-field" placeholder="you@college.edu"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label-mono block mb-2">Password</label>
            <input type="password" className="input-field" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmail()} />
          </div>

          <button onClick={handleEmail} disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="font-mono text-[11px] text-center text-muted">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button className="text-gold hover:underline"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <p className="font-mono text-[10px] text-center text-muted mt-6">
          You can also use Fest-in-a-Box without an account — packs won't be saved.
        </p>
      </motion.div>
    </div>
  )
}
