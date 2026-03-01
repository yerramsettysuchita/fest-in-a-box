import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Layout() {
  const user = useStore(s => s.user)
  const setUser = useStore(s => s.setUser)
  const theme = useStore(s => s.theme)
  const setTheme = useStore(s => s.setTheme)
  const nav = useNavigate()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignore network errors — still clear local state
    }
    setUser(null)   // clear immediately, don't wait for listener
    toast.success('Signed out')
    nav('/')
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center
                      px-4 sm:px-12 py-4 sm:py-6 backdrop-blur-xl border-b border-border
                      bg-[var(--c-nav-bg)]">
        <Link to="/" className="font-serif text-[1.25rem] font-bold text-cream flex-shrink-0">
          Fest<span className="text-gold">.</span>Box
        </Link>

        <div className="flex items-center gap-4 sm:gap-8">
          <button
            onClick={() => {
              if (user) { nav('/generate') }
              else { toast.error('Sign in to create a pack'); nav('/auth', { state: { from: '/generate' } }) }
            }}
            className="font-mono text-[12px] sm:text-[13px] uppercase tracking-widest text-muted hover:text-gold transition-colors">
            Create
          </button>
          {user && (
            <Link to="/dashboard" className="font-mono text-[12px] sm:text-[13px] uppercase tracking-widest text-muted hover:text-gold transition-colors">
              My Packs
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="font-mono text-[15px] text-muted hover:text-gold transition-colors w-8 h-8 flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>

          {user ? (
            <>
              <span className="hidden sm:inline font-mono text-[13px] text-muted truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
              <button onClick={handleSignOut}
                className="font-mono text-[11px] sm:text-[13px] uppercase tracking-widest border border-border
                           text-muted px-3 py-2 sm:px-5 sm:py-2.5 hover:border-muted hover:text-cream transition-all whitespace-nowrap">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth"
              className="font-mono text-[11px] sm:text-[13px] uppercase tracking-widest border border-gold
                         text-gold px-3 py-2 sm:px-5 sm:py-2.5 hover:bg-gold hover:text-bg transition-all whitespace-nowrap">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="pt-14 sm:pt-[73px]">
        <Outlet />
      </main>
    </div>
  )
}
