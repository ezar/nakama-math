import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useProfileStore } from '../store/profileStore'
import { useTranslation } from '../i18n/useTranslation'
import { RankBadge } from '../components/RankBadge'
import { getRankIndex } from '../utils/rankSystem'
import { useSoundEffect } from '../audio/useSoundEffect'

interface ResultsScreenProps {
  onPlayAgain: () => void
  onBack: () => void
}

export function ResultsScreen({ onPlayAgain, onBack }: ResultsScreenProps) {
  const t = useTranslation()
  const { play } = useSoundEffect()
  const { lastResult, resetGame } = useGameStore()
  const { currentProfile, addBerries, updateStats } = useProfileStore()
  const profile = currentProfile()
  const committed = useRef(false)
  const [showRankUp, setShowRankUp] = useState(false)

  useEffect(() => {
    if (!lastResult || !profile || committed.current) return
    committed.current = true

    const oldRank = getRankIndex(profile.berries)
    addBerries(profile.id, lastResult.berriesEarned)
    updateStats(profile.id, lastResult.correct, lastResult.attempted, lastResult.maxStreak)
    const newBerries = profile.berries + lastResult.berriesEarned
    const newRank = getRankIndex(newBerries)

    if (newRank > oldRank) {
      play('rankUp')
      setShowRankUp(true)
    }
  }, [lastResult, profile, addBerries, updateStats, play])

  if (!lastResult || !profile) return null

  const won = lastResult.correct > lastResult.attempted / 2
  const updatedProfile = currentProfile()

  const stats = [
    { label: t.berriesEarned, value: `+${lastResult.berriesEarned.toLocaleString()} 🪙` },
    { label: t.correct, value: `${lastResult.correct} / ${lastResult.attempted}` },
    { label: t.bestStreak, value: `🔥 ${lastResult.maxStreak}` },
    { label: t.accuracy, value: `${lastResult.accuracy}%` },
  ]

  return (
    <div className="h-full overflow-y-auto bg-navy-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        <motion.h1
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="font-bangers text-5xl text-gold-400 text-center"
        >
          {won ? t.victory : t.defeat}
        </motion.h1>

        <AnimatePresence>
          {showRankUp && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
              className="w-full py-3 px-4 rounded-2xl bg-gold-400/20 border-2 border-gold-400 text-center"
            >
              <p className="font-bangers text-2xl text-gold-400 tracking-widest">{t.rankUp}</p>
              {updatedProfile && (
                <p className="font-nunito text-sm text-gold-400 mt-1">
                  {updatedProfile.name} → <RankBadge berries={updatedProfile.berries} className="inline-flex" />
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile + rank */}
        {updatedProfile && (
          <div className="flex items-center gap-3">
            <span className="text-4xl">{updatedProfile.avatar}</span>
            <div>
              <p className="font-nunito font-bold text-white">{updatedProfile.name}</p>
              <div className="flex items-center gap-2">
                <RankBadge berries={updatedProfile.berries} />
                <span className="font-nunito text-xs text-gold-400">🪙 {updatedProfile.berries.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="w-full grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-navy-700 rounded-2xl p-4 text-center border border-navy-600"
            >
              <p className="font-bangers text-2xl text-white">{s.value}</p>
              <p className="font-nunito text-xs text-gray-400 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { resetGame(); onBack() }}
            className="flex-1 py-4 rounded-2xl font-nunito font-bold text-gray-300 border border-navy-600 hover:border-gray-500 hover:text-white transition-colors"
          >
            {t.backToCrew}
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { resetGame(); onPlayAgain() }}
            className="flex-1 py-4 rounded-2xl font-nunito font-bold bg-gold-400 text-navy-900 hover:bg-gold-500 transition-colors"
          >
            {t.playAgain}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
