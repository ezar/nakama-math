import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useProfileStore } from '../store/profileStore'
import { useTranslation } from '../i18n/useTranslation'
import { useSettingsStore } from '../store/settingsStore'
import { RankBadge } from '../components/RankBadge'
import { getRankIndex } from '../utils/rankSystem'
import { getUnlockedLevels } from '../config/levels'
import { ACHIEVEMENTS, achievementNames } from '../config/achievements'
import { useSoundEffect } from '../audio/useSoundEffect'
import { todayDateString, yesterdayDateString } from '../engine/seededRandom'
import type { Locale } from '../i18n/translations'

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

interface NewAchievement { icon: string; name: string }

export function ResultsScreen({ onPlayAgain, onBack }: ResultsScreenProps) {
  const t = useTranslation()
  const locale = useSettingsStore(s => s.locale) as Locale
  const { play } = useSoundEffect()
  const { lastResult, resetGame, wrongAnswers } = useGameStore()
  const { currentProfile, addBerries, updateStats, unlockAchievement, addRecentGame, completeDailyChallenge } = useProfileStore()
  const profile = currentProfile()
  const committed = useRef(false)
  const [showRankUp, setShowRankUp] = useState(false)
  const [newLevelName, setNewLevelName] = useState<string | null>(null)
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([])
  const [showErrors, setShowErrors] = useState(false)

  const berriesDisplay = useCountUp(lastResult?.berriesEarned ?? 0)

  const todayStr = todayDateString()
  const yesterdayStr = yesterdayDateString()

  useEffect(() => {
    if (!lastResult || !profile || committed.current) return
    committed.current = true

    const oldBerries = profile.berries
    const oldRank = getRankIndex(oldBerries)
    const oldLevelCount = getUnlockedLevels(oldBerries).length

    // Mark daily challenge complete and update streak
    if (lastResult.isDaily) {
      completeDailyChallenge(profile.id, todayStr, yesterdayStr)
    }

    // Update current player (P2 in duel, solo player in other modes)
    addBerries(profile.id, lastResult.berriesEarned)
    updateStats(profile.id, lastResult.correct, lastResult.attempted, lastResult.maxStreak)
    addRecentGame(profile.id, {
      mode: lastResult.mode,
      berriesEarned: lastResult.berriesEarned,
      correct: lastResult.correct,
      attempted: lastResult.attempted,
      accuracy: lastResult.accuracy,
      date: new Date().toISOString(),
    })

    // Also update P1 in duel mode
    if (lastResult.duelP1Snap) {
      const p1 = lastResult.duelP1Snap
      addBerries(p1.profileId, p1.berriesEarned)
      updateStats(p1.profileId, p1.correct, p1.attempted, p1.maxStreak)
      addRecentGame(p1.profileId, {
        mode: 'duel',
        berriesEarned: p1.berriesEarned,
        correct: p1.correct,
        attempted: p1.attempted,
        accuracy: p1.attempted > 0 ? Math.round((p1.correct / p1.attempted) * 100) : 0,
        date: new Date().toISOString(),
      })
    }

    const newBerries = oldBerries + lastResult.berriesEarned
    const newRank = getRankIndex(newBerries)
    const newLevelCount = getUnlockedLevels(newBerries).length

    if (newRank > oldRank) { play('rankUp'); setShowRankUp(true) }
    if (newLevelCount > oldLevelCount) {
      const levels = getUnlockedLevels(newBerries)
      setNewLevelName(levels[levels.length - 1].name)
    }

    const won = lastResult.correct > lastResult.attempted / 2
    const updatedStats = {
      gamesPlayed: profile.stats.gamesPlayed + 1,
      totalCorrect: profile.stats.totalCorrect + lastResult.correct,
      bestStreak: Math.max(profile.stats.bestStreak, lastResult.maxStreak),
    }

    const toCheck: Array<[string, boolean]> = [
      ['firstGame',   updatedStats.gamesPlayed >= 1],
      ['firstWin',    won],
      ['perfectGame', lastResult.accuracy === 100 && lastResult.attempted >= 5],
      ['streak3',     lastResult.maxStreak >= 3],
      ['streak5',     lastResult.maxStreak >= 5],
      ['streak10',    lastResult.maxStreak >= 10],
      ['games10',     updatedStats.gamesPlayed >= 10],
      ['games50',     updatedStats.gamesPlayed >= 50],
      ['correct100',  updatedStats.totalCorrect >= 100],
      ['correct500',  updatedStats.totalCorrect >= 500],
      ['levelUp',     newLevelCount > oldLevelCount],
    ]

    // Daily streak achievements — read fresh state after completeDailyChallenge
    if (lastResult.isDaily) {
      const freshProfile = useProfileStore.getState().profiles.find(p => p.id === profile.id)
      const newDailyStreak = freshProfile?.dailyStreak ?? 0
      toCheck.push(['daily7',  newDailyStreak >= 7])
      toCheck.push(['daily30', newDailyStreak >= 30])
    }

    const unlocked: NewAchievement[] = []
    for (const [id, condition] of toCheck) {
      if (condition) {
        const wasNew = unlockAchievement(profile.id, id)
        if (wasNew) {
          const def = ACHIEVEMENTS.find(a => a.id === id)
          if (def) unlocked.push({ icon: def.icon, name: achievementNames[def.nameKey][locale] })
        }
      }
    }
    if (unlocked.length > 0) {
      setNewAchievements(unlocked)
      setTimeout(() => play('achievement'), 600)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!lastResult || !profile) return null

  const won = lastResult.correct > lastResult.attempted / 2
  const updatedProfile = currentProfile()
  const isVersus = lastResult.mode === 'versus'
  const isDuel = lastResult.mode === 'duel'

  const botSnap = lastResult.botSnap
  const playerBeatsBot = botSnap ? lastResult.correct > botSnap.correct : false
  const botBeatsPlayer = botSnap ? botSnap.correct > lastResult.correct : false

  const p1Snap = lastResult.duelP1Snap
  const p2Correct = lastResult.correct
  const p1Correct = p1Snap?.correct ?? 0
  const duelWinnerName = p1Snap
    ? p2Correct > p1Correct ? profile.name
      : p1Correct > p2Correct ? p1Snap.profileName
      : null
    : null

  const headlineVictory = isVersus
    ? (playerBeatsBot ? t.victory : botBeatsPlayer ? t.defeat : '⚔️ DRAW')
    : isDuel
    ? (duelWinnerName ? t.duelWinner(duelWinnerName) : t.itsATie)
    : (won ? t.victory : t.defeat)

  const showConfetti = won || showRankUp || playerBeatsBot || (isDuel && duelWinnerName === profile.name)

  const stats = [
    { label: t.berriesEarned, value: `+${berriesDisplay.toLocaleString()} 🪙`, highlight: true, isDaily: lastResult.isDaily },
    { label: t.correct, value: `${lastResult.correct} / ${lastResult.attempted}`, highlight: false },
    { label: t.bestStreak, value: `🔥 ${lastResult.maxStreak}`, highlight: false },
    { label: t.accuracy, value: `${lastResult.accuracy}%`, highlight: false },
  ]

  return (
    <div className="h-full bg-navy-900 overflow-hidden pb-footer">
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center p-4 gap-4">
      {showConfetti && <Confetti />}

      <div className="w-full max-w-md flex flex-col items-center gap-3">

        <motion.h1
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="font-bangers text-5xl text-gold-400 text-center"
        >
          {headlineVictory}
        </motion.h1>

        {/* Versus comparison panel */}
        {isVersus && botSnap && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full rounded-2xl border border-purple-500/40 bg-purple-500/10 p-4"
          >
            <p className="font-bangers text-sm text-purple-400 text-center tracking-widest mb-3">{t.vsResult}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { avatar: updatedProfile?.avatar ?? '🏴‍☠️', name: t.youLabel, correct: lastResult.correct, accuracy: lastResult.accuracy, winner: playerBeatsBot },
                { avatar: botSnap.avatar, name: botSnap.name, correct: botSnap.correct, accuracy: botSnap.attempted > 0 ? Math.round((botSnap.correct / botSnap.attempted) * 100) : 0, winner: botBeatsPlayer },
              ].map((side) => (
                <div key={side.name} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 ${side.winner ? 'border-gold-400 bg-gold-400/10' : 'border-navy-600 bg-navy-700'}`}>
                  <span className="text-3xl">{side.avatar}</span>
                  <p className="font-nunito font-bold text-white text-sm">{side.name}</p>
                  <p className="font-bangers text-2xl text-white">{side.correct}/{lastResult.attempted}</p>
                  <p className="font-nunito text-xs text-gray-400">{side.accuracy}%</p>
                  {side.winner && <span className="text-gold-400 text-xs font-bold">🏆</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Duel comparison panel */}
        {isDuel && p1Snap && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full rounded-2xl border border-purple-500/40 bg-purple-500/10 p-4"
          >
            <p className="font-bangers text-sm text-purple-400 text-center tracking-widest mb-3">{t.duelResult}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { avatar: p1Snap.profileAvatar, name: p1Snap.profileName, correct: p1Correct, attempted: p1Snap.attempted, winner: p1Correct > p2Correct },
                { avatar: updatedProfile?.avatar ?? '🏴‍☠️', name: profile.name, correct: p2Correct, attempted: lastResult.attempted, winner: p2Correct > p1Correct },
              ].map((side) => (
                <div key={side.name} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 ${side.winner ? 'border-gold-400 bg-gold-400/10' : 'border-navy-600 bg-navy-700'}`}>
                  <span className="text-3xl">{side.avatar}</span>
                  <p className="font-nunito font-bold text-white text-sm">{side.name}</p>
                  <p className="font-bangers text-2xl text-white">{side.correct}/{side.attempted}</p>
                  <p className="font-nunito text-xs text-gray-400">{side.attempted > 0 ? Math.round((side.correct / side.attempted) * 100) : 0}%</p>
                  {side.winner && <span className="text-gold-400 text-xs font-bold">🏆</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rank up banner */}
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

        {/* New level unlocked */}
        <AnimatePresence>
          {newLevelName && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.5 }}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-center"
            >
              <p className="font-bangers text-xl text-emerald-400 tracking-widest">🗺️ {t.newLevelUnlocked}</p>
              <p className="font-bangers text-2xl text-white">{newLevelName}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New achievements */}
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full flex flex-col gap-1.5"
          >
            <p className="font-nunito text-xs text-purple-400 text-center">{t.achievementUnlocked}</p>
            {newAchievements.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.65 + i * 0.1 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-purple-500/20 border border-purple-400/50"
              >
                <span className="text-xl">{a.icon}</span>
                <p className="font-nunito text-sm font-bold text-white">{a.name}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

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
              {'isDaily' in s && s.isDaily && (
                <span className="inline-block font-nunito text-xs font-bold text-gold-400 bg-gold-400/20 px-2 py-0.5 rounded-full mt-1">
                  {t.dailyBonus}
                </span>
              )}
              <p className="font-nunito text-xs text-gray-400 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Error review */}
        {lastResult.attempted > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            {wrongAnswers.length === 0 ? (
              <p className="text-center font-nunito text-sm text-emerald-400">{t.noMistakes}</p>
            ) : (
              <>
                <button
                  onClick={() => setShowErrors(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-navy-700 border border-navy-600 font-nunito text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <span>{t.wrongAnswersTitle} ({wrongAnswers.length})</span>
                  <span>{showErrors ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                  {showErrors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2 mt-2">
                        {wrongAnswers.map((wa, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-navy-800 border border-navy-600">
                            <span className="font-nunito text-sm text-white">{wa.display} = ?</span>
                            <div className="flex items-center gap-3 font-nunito text-sm font-bold">
                              <span className="text-pirate-red">✗ {wa.userAnswer}</span>
                              <span className="text-emerald-400">✓ {wa.correctAnswer}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { resetGame(); onBack() }}
            className="flex-1 py-4 rounded-2xl font-nunito font-bold text-gray-300 border border-navy-600 hover:border-gray-500 hover:text-white transition-colors"
          >
            {t.backToCrew}
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { resetGame(); onPlayAgain() }}
            className="flex-1 py-4 rounded-2xl font-nunito font-bold bg-gold-400 text-navy-900 hover:bg-gold-500 transition-colors"
          >
            {t.playAgain}
          </motion.button>
        </div>

        {/* Share */}
        {typeof navigator.share === 'function' && updatedProfile && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
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
      </div>
    </div>
  )
}
