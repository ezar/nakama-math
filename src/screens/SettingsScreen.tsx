import { motion } from 'framer-motion'
import { useSettingsStore } from '../store/settingsStore'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/translations'

interface SettingsScreenProps {
  onBack: () => void
}

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'ca', label: '🏴󠁥󠁳󠁣󠁴󠁿 Català' },
]

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const t = useTranslation()
  const locale = useSettingsStore(s => s.locale) as Locale
  const setLocale = useSettingsStore(s => s.setLocale)
  const soundEnabled = useSettingsStore(s => s.soundEnabled)
  const toggleSound = useSettingsStore(s => s.toggleSound)
  const inputMode = useSettingsStore(s => s.inputMode)
  const toggleInputMode = useSettingsStore(s => s.toggleInputMode)

  return (
    <div className="h-full bg-navy-900 overflow-hidden pb-footer">
      <div className="h-full overflow-y-auto flex flex-col items-center px-4 pt-3">
        <div className="w-full max-w-md flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-400 hover:text-white font-nunito text-xl transition-colors">←</button>
            <p className="font-bangers text-2xl text-white tracking-widest">{t.settingsTitle}</p>
          </div>

          {/* Language */}
          <div className="bg-navy-800 rounded-2xl p-4 flex flex-col gap-3 border border-navy-700">
            <p className="font-nunito text-xs text-gray-500 uppercase tracking-wider">{t.language}</p>
            <div className="flex flex-col gap-2">
              {LOCALES.map(loc => (
                <motion.button
                  key={loc.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLocale(loc.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors text-left ${
                    locale === loc.value
                      ? 'border-gold-400 bg-gold-400/10 text-white'
                      : 'border-navy-600 text-gray-400 hover:border-navy-500'
                  }`}
                >
                  <span className="font-nunito text-sm">{loc.label}</span>
                  {locale === loc.value && <span className="text-gold-400 text-xs">✓</span>}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="bg-navy-800 rounded-2xl p-4 flex flex-col gap-3 border border-navy-700">
            <p className="font-nunito text-xs text-gray-500 uppercase tracking-wider">{t.sound}</p>
            <button
              onClick={toggleSound}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
                soundEnabled
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-navy-600 text-gray-500'
              }`}
            >
              <span className="font-nunito text-sm">{soundEnabled ? `🔊 ${t.soundOn}` : `🔇 ${t.soundOff}`}</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-navy-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${soundEnabled ? 'left-5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Input mode */}
          <div className="bg-navy-800 rounded-2xl p-4 flex flex-col gap-3 border border-navy-700">
            <p className="font-nunito text-xs text-gray-500 uppercase tracking-wider">{t.inputModeLabel}</p>
            <button
              onClick={toggleInputMode}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
                inputMode === 'keyboard'
                  ? 'border-gold-400 bg-gold-400/10 text-gold-400'
                  : 'border-navy-600 text-gray-500'
              }`}
            >
              <span className="font-nunito text-sm">
                {inputMode === 'keyboard' ? '⌨️ Teclado activo' : '🎮 Botones activos'}
              </span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${inputMode === 'keyboard' ? 'bg-gold-400' : 'bg-navy-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${inputMode === 'keyboard' ? 'left-5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
