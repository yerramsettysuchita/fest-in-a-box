import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}, timeoutMs = 45000) {
  const url = `${API_BASE}${path}`

  // Attach Supabase JWT if user is logged in
  const { data: { session } } = await supabase.auth.getSession()
  const authHeader = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...authHeader, ...options.headers },
      signal: controller.signal,
      ...options,
    })
    clearTimeout(timer)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      const detail = err.detail
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map(d => d.msg || JSON.stringify(d)).join('; ')
          : 'Request failed'
      throw new Error(msg)
    }
    return res.json()
  } catch (e) {
    clearTimeout(timer)
    if (e.name === 'AbortError') throw new Error('Request timed out — the server is starting up (free tier). Please wait 60 seconds and try again.')
    if (e.message === 'Failed to fetch') throw new Error('Cannot reach the server. Make sure VITE_API_URL is set in Render environment variables.')
    throw e
  }
}

// ─── GENERATION ───────────────────────────────────────────────────────────────

export const api = {
  /** Generate the full event pack — 90s timeout for cold-start + AI generation */
  generatePack: (brief, assets) =>
    request('/api/generate/', {
      method: 'POST',
      body: JSON.stringify({ brief, assets }),
    }, 90000),

  /** Regenerate a single asset — 90s timeout */
  regenerateSingle: (brief, assetType, customInstructions = '') =>
    request(`/api/generate/single?asset_type=${assetType}&custom_instructions=${encodeURIComponent(customInstructions)}`, {
      method: 'POST',
      body: JSON.stringify(brief),
    }, 90000),

  // ─── PACKS ───────────────────────────────────────────────────────────────
  getPack: (packId) => request(`/api/packs/${packId}`),
  getUserPacks: (userId) => request(`/api/packs/user/${userId}`),
  updatePack: (packId, updates) =>
    request(`/api/packs/${packId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deletePack: (packId) =>
    request(`/api/packs/${packId}`, { method: 'DELETE' }),

  // ─── SHARE ───────────────────────────────────────────────────────────────
  getSharedPack: (token) => request(`/api/share/${token}`),
  registerForEvent: (token, data) =>
    request(`/api/share/${token}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getRegistrations: (token) => request(`/api/share/${token}/registrations`),

  // ─── EMAIL ───────────────────────────────────────────────────────────────
  sendEmail: (packId, recipientEmail, emailType, emailContent = {}) =>
    request('/api/email/send', {
      method: 'POST',
      body: JSON.stringify({ pack_id: packId, recipient_email: recipientEmail, email_type: emailType, ...emailContent }),
    }),
}
