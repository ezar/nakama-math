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

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']

function Confetti() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 200,
    }))
  )

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {particles.current.map(p => (
        <motion.div
          key={p.id}
          initial={{ top: '-5%', left: `${p.x}%`, opacity: 1, rotate: p.rotate, x: 0 }}
          animate={{ top: '110%', opacity: 0, rotate: p.rotate + 360, x: p.drift }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: 'easeIn' }}
          style={{ position: 'absolute', width: p.size, height: p.size, backgroundColor: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
        />
      ))}
    </div>
  )
}

function useCountUp(target: number, duration = 1200, startDelay = 400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const steps = 30
    const stepMs = duration / steps
    let current = 0
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current++
        setValue(Math.round((current / steps) * target))
        if (current >= steps) clearInterval(interval)
      }, stepMs)
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(timer)
  }, [target, duration, startDelay])
  return value
}

export function ResultsScreen({ onPlayAgain, onBack }: ResultsScreenProps) {
  const t = useTranslation()
  const { play } = useSoundEffect()
  const { lastResult, resetGame } = useGameStore()
  const { currentProfile, addBerries, updateStats } = useProfileStore()
  const profile = currentProfile()
  const committed = useRef(false)
  const [showRankUp, setShowRankUp] = useState(false)

  const berriesDisplay = useCountUp(lastResult?.berriesEarned ?? 0)

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
    { label: t.berriesEarned, value: `+${berriesDisplay.toLocaleString()} 🪙`, highlight: true },
    { label: t.correct, value: `${lastResult.correct} / ${lastResult.attempted}`, highlight: false },
    { label: t.bestStreak, value: `🔥 ${lastResult.maxStreak}`, highlight: false },
    { label: t.accuracy, value: `${lastResult.accuracy}%`, highlight: false },
  ]

  return (
    <div className="h-full overflow-hidden bg-navy-900 flex flex-col items-center justify-center p-4 pb-10 gap-4">
      {(won || showRankUp) && <Confetti />}

      <div className="w-full max-w-md flex flex-col items-center gap-4">

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
              className={`rounded-2xl p-4 text-center border ${s.highlight ? 'bg-gold-400/10 border-gold-400' : 'bg-navy-700 border-navy-600'}`}
            >
              <p className={`font-bangers text-2xl ${s.highlight ? 'text-gold-400' : 'text-white'}`}>{s.value}</p>
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

        {/* Share */}
        {typeof navigator.share === 'function' && updatedProfile && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            onClick={() => navigator.share({
              title: 'Nakama Math',
              text: t.shareText(updatedProfile.name, lastResult.berriesEarned, lastResult.accuracy),
            }).catch(() => {})}
            className="w-full py-2 rounded-xl font-nunito text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t.shareResult}
          </motion.button>
        )}
      </div>
    </div>
  )
}
