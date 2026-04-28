import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfileStore } from '../store/profileStore'
import { useSettingsStore } from '../store/settingsStore'
import { ProfileCard } from '../components/ProfileCard'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/translations'

const AVATARS = ['🏴‍☠️', '⚓', '🗡️', '🌊', '🔥', '💀', '🐉', '⚡', '🦁', '🎯', '🧭', '🪙']

interface IntroScreenProps {
  onStart: () => void
  onRanking: () => void
}

export function IntroScreen({ onStart, onRanking }: IntroScreenProps) {
  const t = useTranslation()
  const { profiles, currentProfileId, createProfile, deleteProfile, selectProfile } = useProfileStore()
  const { locale, setLocale, soundEnabled, toggleSound } = useSettingsStore()

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleCreate() {
    if (!name.trim()) return
    createProfile(name.trim(), avatar)
    setName('')
    setAvatar(AVATARS[0])
    setShowCreate(false)
  }

  function handleSelect(id: string) {
    if (id === currentProfileId) {
      onStart()
    } else {
      selectProfile(id)
    }
  }

  const locales: Locale[] = ['es', 'en', 'ca']

  return (
    <div className="h-full overflow-hidden bg-navy-900 flex flex-col items-center justify-between p-4 pb-10 relative">
      {/* Top bar: language + sound */}
      <div className="w-full flex justify-end gap-3 mb-2">
        <div className="flex gap-1">
          {locales.map(loc => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`font-nunito font-bold text-xs px-2 py-1 rounded-lg transition-colors ${locale === loc ? 'bg-gold-400 text-navy-900' : 'bg-navy-700 text-gray-400 hover:text-white'}`}
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={toggleSound}
          aria-label={t.sound}
          className="font-nunito text-xs px-3 py-1 rounded-lg bg-navy-700 text-gray-400 hover:text-white transition-colors"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="font-bangers text-6xl text-gold-400 tracking-widest drop-shadow-lg"
        >
          NAKAMA MATH
        </motion.h1>
        <p className="font-nunito text-gray-400 text-sm tracking-wide">{t.appTagline}</p>
      </div>

      {/* Profiles grid */}
      <div className="w-full max-w-md flex flex-col gap-4 my-6">
        {profiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <p className="font-nunito text-gray-400 text-sm">{t.noPiratesYet}</p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="px-8 py-4 rounded-2xl font-bangers text-2xl tracking-widest bg-gold-400 text-navy-900 hover:bg-gold-500 transition-colors shadow-lg shadow-gold-400/30"
            >
              {t.newPirate}
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {profiles.map(p => (
              <ProfileCard
                key={p.id}
                profile={p}
                selected={p.id === currentProfileId}
                onSelect={() => handleSelect(p.id)}
                onDelete={() => setConfirmDelete(p.id)}
              />
            ))}
            {profiles.length < 6 && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-navy-600 hover:border-gold-400 text-gray-500 hover:text-gold-400 transition-colors cursor-pointer"
              >
                <span className="text-3xl">＋</span>
                <span className="font-nunito text-xs">{t.newPirate}</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Play button — visible once a profile is selected */}
      <div className="w-full max-w-md flex flex-col items-center gap-3 mb-4">
        <AnimatePresence>
          {currentProfileId && (
            <motion.button
              key="play-btn"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="w-full py-4 rounded-2xl font-bangers text-2xl tracking-widest bg-gold-400 text-navy-900 hover:bg-gold-500 transition-colors shadow-lg shadow-gold-400/30"
            >
              {t.setSail}
            </motion.button>
          )}
        </AnimatePresence>
        <button
          onClick={onRanking}
          className="font-nunito font-bold text-gray-400 hover:text-gold-400 transition-colors text-sm"
        >
          {t.ranking}
        </button>
      </div>

      {/* Create profile modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-navy-800 rounded-3xl p-6 w-full max-w-sm border border-navy-600 shadow-2xl"
            >
              <h2 className="font-bangers text-3xl text-gold-400 mb-4 text-center">{t.newPirate}</h2>

              {/* Avatar picker */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`text-2xl p-1 rounded-xl transition-colors ${avatar === av ? 'bg-gold-400/20 ring-2 ring-gold-400' : 'hover:bg-navy-700'}`}
                  >
                    {av}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder={t.pirateNamePlaceholder}
                maxLength={20}
                autoFocus
                className="w-full bg-navy-700 border border-navy-600 rounded-xl px-4 py-3 font-nunito text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl font-nunito font-bold text-gray-400 hover:text-white border border-navy-600 hover:border-gray-500 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="flex-1 py-3 rounded-xl font-nunito font-bold bg-gold-400 text-navy-900 hover:bg-gold-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t.joinCrew}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-navy-800 rounded-3xl p-6 w-full max-w-xs border border-navy-600 shadow-2xl text-center"
            >
              {(() => {
                const p = profiles.find(pr => pr.id === confirmDelete)
                return (
                  <div className="mb-6">
                    <p className="font-nunito font-bold text-white mb-2">
                      {t.deletePirateConfirm(p?.name ?? '')}
                    </p>
                    {p && p.berries > 0 && (
                      <p className="font-nunito text-sm text-gold-400">
                        🪙 {p.berries.toLocaleString()} berries perdidas
                      </p>
                    )}
                  </div>
                )
              })()}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 rounded-xl font-nunito font-bold text-gray-400 hover:text-white border border-navy-600 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => { deleteProfile(confirmDelete); setConfirmDelete(null) }}
                  className="flex-1 py-3 rounded-xl font-nunito font-bold bg-pirate-red text-white hover:bg-pirate-red-dark transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
