import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '../i18n/translations'

interface SettingsStore {
  locale: Locale
  soundEnabled: boolean
  setLocale: (locale: Locale) => void
  toggleSound: () => void
}

function detectLocale(): Locale {
  const lang = navigator.language
  if (lang.startsWith('ca')) return 'ca'
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      soundEnabled: true,
      setLocale: (locale) => set({ locale }),
      toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
    }),
    { name: 'math-pirates-settings' }
  )
)
