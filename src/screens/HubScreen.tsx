import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfileStore } from '../store/profileStore'
import { useGameStore } from '../store/gameStore'
import { useTranslation } from '../i18n/useTranslation'
import { useSettingsStore } from '../store/settingsStore'
import { RankBadge } from '../components/RankBadge'
import { AchievementGallery } from '../components/AchievementGallery'
import { getUnlockedLevels, getLevelById, LEVELS } from '../config/levels'
import { generateQuestion } from '../engine/QuestionEngine'
import { getRankIndex, getNextRankBerries } from '../utils/rankSystem'
import type { GameMode, GameConfig, LevelConfig } from '../engine/types'
import type { Locale } from '../i18n/translations'

const MODE_CONFIGS: Record<GameMode, { icon: string; questions: number; timePerQuestion?: number; livesCount?: number; multiplier: number }> = {
  normal:   { icon: '⚔️',  questions: 10, multiplier: 1 },
  speed:    { icon: '⚡',  questions: 10, timePerQuestion: 15, livesCount: 1, multiplier: 1.5 },
  survival: { icon: '❤️',  questions: 999, livesCount: 3, multiplier: 1 },
  blitz:    { icon: '🌊',  questions: 10, timePerQuestion: 8, livesCount: 1, multiplier: 2 },
}

interface HubScreenProps {
  onPlay: () => void
  onBack: () => void
}

export function HubScreen({ onPlay, onBack }: HubScreenProps) {
  const t = useTranslation()
  const locale = useSettingsStore(s => s.locale) as Locale
  const profile = useProfileStore(s => s.profiles.find(p => p.id === s.currentProfileId) ?? null)
  const { startGame } = useGameStore()

  if (!profile) return null

  const unlockedLevels = getUnlockedLevels(profile.berries)
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(
    unlockedLevels[unlockedLevels.length - 1]
  )
  const [showLevelPicker, setShowLevelPicker] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)

  const rankIdx = getRankIndex(profile.berries)
  const nextBerries = getNextRankBerries(profile.berries)
  const nextLevel = LEVELS[rankIdx + 1]
  const prevThreshold = LEVELS[rankIdx]?.xpToUnlock ?? 0
  const progressPct = nextBerries
    ? Math.min(100, ((profile.berries - prevThreshold) / (nextBerries - prevThreshold)) * 100)
    : 100

  function handleMode(mode: GameMode) {
    if (!profile) return
    const levelConfig = getLevelById(selectedLevel.id)
    if (!levelConfig) return

    const mc = MODE_CONFIGS[mode]
    const config: GameConfig = {
      mode,
      levelId: levelConfig.id,
      totalQuestions: mc.questions,
      timePerQuestion: mc.timePerQuestion,
      livesCount: mc.livesCount,
      multiplier: mc.multiplier,
    }

    const questions = Array.from({ length: Math.min(mc.questions, 10) }, () =>
      generateQuestion(levelConfig)
    )

    startGame(config, questions)
    onPlay()
  }

  const modes: GameMode[] = ['normal', 'speed', 'survival', 'blitz']
  const isMaxLevel = unlockedLevels.length === 1

  return (
    <div className="h-full overflow-hidden bg-navy-900 flex flex-col items-center px-4 pt-3 pb-10">
      <div className="w-full max-w-md flex flex-col gap-3">

        {/* Back + profile header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Volver" className="text-gray-400 hover:text-white font-nunito text-xl transition-colors">←</button>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{profile.avatar}</span>
            <div className="flex-1">
              <p className="font-nunito font-bold text-white text-sm">{profile.name}</p>
              <div className="flex items-center gap-2">
                <RankBadge berries={profile.berries} />
                <span className="font-nunito text-xs text-gold-400">🪙 {profile.berries.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAchievements(true)}
            aria-label="Logros"
            className="relative text-gray-500 hover:text-gold-400 transition-colors text-xl"
          >
            🏆
            {(profile.achievements ?? []).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {(profile.achievements ?? []).length}
              </span>
            )}
          </button>
        </div>

        {/* Progress to next rank */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-nunito text-xs text-gray-400">
              {nextBerries ? t.nextRank(nextLevel?.name ?? '', nextBerries - profile.berries) : t.maxRankReached}
            </span>
            <span className="font-nunito text-xs text-gold-400">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Level selector */}
        <button
          onClick={() => !isMaxLevel && setShowLevelPicker(true)}
          className={`bg-navy-700 rounded-2xl px-4 py-3 border border-navy-600 flex items-center justify-between w-full text-left ${!isMaxLevel ? 'hover:border-gold-400 transition-colors cursor-pointer' : 'cursor-default'}`}
        >
          <div>
            <p className="font-nunito text-gray-400 text-xs">{t.activeLevel}</p>
            <p className="font-bangers text-xl text-gold-400 leading-tight">{selectedLevel.name}</p>
            <p className="font-nunito text-xs text-gray-300">{selectedLevel.opLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-nunito text-xs text-gold-400">{t.berriesPerCorrect(selectedLevel.berriesPerCorrect)}</p>
            {!isMaxLevel && <span className="text-gray-500 text-sm">›</span>}
          </div>
        </button>

        {/* Mode buttons */}
        <h2 className="font-bangers text-xl text-white tracking-widest text-center">{t.battleMode}</h2>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((mode, i) => {
            const mc = MODE_CONFIGS[mode]
            const modeT = t.modes[mode]
            return (
              <motion.button
                key={mode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMode(mode)}
                className="flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 hover:bg-navy-600 rounded-2xl border-2 border-navy-600 hover:border-gold-400 transition-colors cursor-pointer"
              >
                <span className="text-2xl">{mc.icon}</span>
                <p className="font-bangers text-base text-white">{modeT.name}</p>
                <p className="font-nunito text-xs text-gray-400 text-center leading-tight">{modeT.desc}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: profile.stats.gamesPlayed, label: t.gamesPlayed },
            { value: `${profile.stats.totalAttempted > 0 ? Math.round((profile.stats.totalCorrect / profile.stats.totalAttempted) * 100) : 0}%`, label: t.precision },
            { value: `🔥${profile.stats.bestStreak}`, label: t.bestStreakShort },
          ].map(s => (
            <div key={s.label} className="bg-navy-800 rounded-xl p-2 text-center">
              <p className="font-bangers text-xl text-white">{s.value}</p>
              <p className="font-nunito text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent games */}
        <div className="flex flex-col gap-1">
          <p className="font-nunito text-xs text-gray-500">{t.recentGames}</p>
          {(profile.recentGames ?? []).length === 0 ? (
            <p className="font-nunito text-xs text-gray-600 text-center py-1">⚔️ {t.playFirstGame}</p>
          ) : (
            (profile.recentGames ?? []).slice(0, 5).map((g, i) => (
              <div key={i} className="flex items-center justify-between bg-navy-800 rounded-xl px-3 py-1.5">
                <span className="font-nunito text-xs text-gray-400">{t.modes[g.mode].name}</span>
                <span className="font-nunito text-xs text-gold-400">+{g.berriesEarned} 🪙</span>
                <span className="font-nunito text-xs text-gray-500">{g.accuracy}%</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Level picker modal */}
      <AnimatePresence>
        {showLevelPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setShowLevelPicker(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl"
            >
              <p className="font-bangers text-xl text-gold-400 mb-3 text-center tracking-widest">{t.activeLevel}</p>
              <div className="flex flex-col gap-2">
                {unlockedLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => { setSelectedLevel(level); setShowLevelPicker(false) }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-colors ${
                      selectedLevel.id === level.id
                        ? 'border-gold-400 bg-gold-400/10'
                        : 'border-navy-600 hover:border-navy-500'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bangers text-lg text-white">{level.name}</p>
                      <p className="font-nunito text-xs text-gray-400">{level.opLabel}</p>
                    </div>
                    <span className="font-nunito text-xs text-gold-400">+{level.berriesPerCorrect} 🪙</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAchievements && (
        <AchievementGallery
          unlockedIds={profile.achievements ?? []}
          locale={locale}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  )
}
