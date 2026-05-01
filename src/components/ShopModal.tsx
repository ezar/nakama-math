import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfileStore } from '../store/profileStore'
import { useTranslation } from '../i18n/useTranslation'

const PREMIUM_AVATARS = [
  { emoji: '👑', cost: 100 },
  { emoji: '🌟', cost: 200 },
  { emoji: '💎', cost: 350 },
  { emoji: '🔱', cost: 500 },
  { emoji: '🐙', cost: 300 },
  { emoji: '🦅', cost: 450 },
  { emoji: '🐯', cost: 800 },
  { emoji: '🌸', cost: 250 },
  { emoji: '🧿', cost: 150 },
  { emoji: '⚜️', cost: 600 },
  { emoji: '🦊', cost: 400 },
  { emoji: '🦜', cost: 1000 },
]

interface ShopModalProps {
  profileId: string
  onClose: () => void
}

export function ShopModal({ profileId, onClose }: ShopModalProps) {
  const t = useTranslation()
  const profile = useProfileStore(s => s.profiles.find(p => p.id === profileId) ?? null)
  const spendBerries = useProfileStore(s => s.spendBerries)
  const addOwnedAvatar = useProfileStore(s => s.addOwnedAvatar)
  const changeAvatar = useProfileStore(s => s.changeAvatar)
  const [flash, setFlash] = useState<string | null>(null)

  if (!profile) return null

  const owned = profile.ownedAvatars ?? []

  function handleBuy(emoji: string, cost: number) {
    const ok = spendBerries(profileId, cost)
    if (!ok) {
      setFlash(t.notEnoughBerries)
      setTimeout(() => setFlash(null), 1800)
      return
    }
    addOwnedAvatar(profileId, emoji)
    changeAvatar(profileId, emoji)
  }

  function handleEquip(emoji: string) {
    changeAvatar(profileId, emoji)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 flex items-end justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="font-bangers text-xl text-gold-400 tracking-widest">{t.shopTitle}</p>
          <span className="font-nunito text-sm text-gold-400">🪙 {profile.berries.toLocaleString()}</span>
        </div>
        <p className="font-nunito text-xs text-gray-500 mb-3">{t.shopAvatars}</p>

        <AnimatePresence>
          {flash && (
            <motion.div
              key="flash"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-2 text-center font-nunito text-xs text-pirate-red bg-pirate-red/10 rounded-xl py-1.5"
            >
              {flash}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-y-auto grid grid-cols-3 gap-2">
          {PREMIUM_AVATARS.map(({ emoji, cost }) => {
            const isOwned = owned.includes(emoji)
            const isEquipped = profile.avatar === emoji
            return (
              <div key={emoji} className="flex flex-col items-center gap-1 bg-navy-700 rounded-2xl p-2 border border-navy-600">
                <span className="text-3xl">{emoji}</span>
                <span className="font-nunito text-[10px] text-gold-400">🪙 {cost}</span>
                {isEquipped ? (
                  <span className="font-nunito text-[10px] text-emerald-400 font-bold">{t.ownedLabel}</span>
                ) : isOwned ? (
                  <button
                    onClick={() => handleEquip(emoji)}
                    className="font-nunito text-[10px] text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg px-2 py-0.5 transition-colors"
                  >
                    {t.equipLabel}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(emoji, cost)}
                    disabled={profile.berries < cost}
                    className={`font-nunito text-[10px] rounded-lg px-2 py-0.5 transition-colors ${
                      profile.berries >= cost
                        ? 'text-navy-900 bg-gold-400 hover:bg-gold-300'
                        : 'text-gray-500 bg-navy-600 cursor-not-allowed'
                    }`}
                  >
                    Comprar
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full font-nunito text-sm text-gray-400 hover:text-white transition-colors py-1"
        >
          {t.cancel}
        </button>
      </motion.div>
    </motion.div>
  )
}
