import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '../i18n/translations'

interface SettingsStore {
  locale: Locale
  soundEnabled: boolean
  inputMode: 'buttons' | 'keyboard'
  setLocale: (locale: Locale) => void
  toggleSound: () => void
  toggleInputMode: () => void
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
      inputMode: 'buttons',
      setLocale: (locale) => set({ locale }),
      toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
      toggleInputMode: () => set(s => ({ inputMode: s.inputMode === 'buttons' ? 'keyboard' : 'buttons' })),
    }),
    { name: 'math-pirates-settings' }
  )
)
