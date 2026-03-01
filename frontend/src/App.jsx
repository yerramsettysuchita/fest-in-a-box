import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useStore } from './lib/store'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import GeneratePage from './pages/GeneratePage'
import PackViewerPage from './pages/PackViewerPage'
import DashboardPage from './pages/DashboardPage'
import SignupPage from './pages/SignupPage'
import AuthPage from './pages/AuthPage'

export default function App() {
  const setUser = useStore(s => s.setUser)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="generate" element={<GeneratePage />} />
        <Route path="pack/:packId" element={<PackViewerPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="auth" element={<AuthPage />} />
      </Route>
      {/* Signup page is standalone (no nav) */}
      <Route path="signup/:token" element={<SignupPage />} />
    </Routes>
  )
}
