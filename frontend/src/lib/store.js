import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Current pack being generated / viewed
  currentPack: null,
  setCurrentPack: (pack) => set({ currentPack: pack }),

  // Brief form state
  brief: {
    event_name: '',
    theme: '',
    target_audience: '',
    vibe: 'energetic',
    date_time: '',
    venue: '',
    cta_link: '',
    organiser_name: '',
    club_name: '',
    extra_notes: '',
  },
  updateBrief: (updates) => set((s) => ({ brief: { ...s.brief, ...updates } })),
  resetBrief: () => set({
    brief: {
      event_name: '', theme: '', target_audience: '', vibe: 'energetic',
      date_time: '', venue: '', cta_link: '', organiser_name: '', club_name: '', extra_notes: '',
    }
  }),

  // Generation state
  isGenerating: false,
  generationError: null,
  setGenerating: (v) => set({ isGenerating: v }),
  setGenerationError: (e) => set({ generationError: e }),

  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // User's saved packs
  savedPacks: [],
  setSavedPacks: (packs) => set({ savedPacks: packs }),

  // Active tab in pack viewer
  activeTab: 'poster_text',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Theme
  theme: localStorage.getItem('theme') || 'light',
  setTheme: (theme) => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', theme)
    set({ theme })
  },
}))
