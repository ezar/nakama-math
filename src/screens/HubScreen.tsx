import { motion } from 'framer-motion'
import { useProfileStore } from '../store/profileStore'
import { useGameStore } from '../store/gameStore'
import { useTranslation } from '../i18n/useTranslation'
import { RankBadge } from '../components/RankBadge'
import { getUnlockedLevels, getLevelById, LEVELS } from '../config/levels'
import { generateQuestion } from '../engine/QuestionEngine'
import { getRankIndex, getNextRankBerries } from '../utils/rankSystem'
import type { GameMode, GameConfig } from '../engine/types'

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
  const profile = useProfileStore(s => s.profiles.find(p => p.id === s.currentProfileId) ?? null)
  const { startGame } = useGameStore()

  if (!profile) return null

  const unlockedLevels = getUnlockedLevels(profile.berries)
  const currentLevel = unlockedLevels[unlockedLevels.length - 1]

  const rankIdx = getRankIndex(profile.berries)
  const nextBerries = getNextRankBerries(profile.berries)
  const nextLevel = LEVELS[rankIdx + 1]
  const prevThreshold = LEVELS[rankIdx]?.xpToUnlock ?? 0
  const progressPct = nextBerries
    ? Math.min(100, ((profile.berries - prevThreshold) / (nextBerries - prevThreshold)) * 100)
    : 100

  function handleMode(mode: GameMode) {
    if (!profile) return
    const levelConfig = getLevelById(currentLevel.id)
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

  return (
    <div className="h-full overflow-hidden bg-navy-900 flex flex-col items-center px-4 py-3">
      <div className="w-full max-w-md flex flex-col gap-3">

        {/* Back + profile header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Volver"
            className="text-gray-400 hover:text-white font-nunito text-xl transition-colors"
          >
            ←
          </button>
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
        </div>

        {/* Progress to next rank */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-nunito text-xs text-gray-400">
              {nextBerries
                ? t.nextRank(nextLevel?.name ?? '', nextBerries - profile.berries)
                : t.maxRankReached}
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

        {/* Level info */}
        <div className="bg-navy-700 rounded-2xl px-4 py-3 border border-navy-600 flex items-center justify-between">
          <div>
            <p className="font-nunito text-gray-400 text-xs">{t.activeLevel}</p>
            <p className="font-bangers text-xl text-gold-400 leading-tight">{currentLevel.name}</p>
            <p className="font-nunito text-xs text-gray-300">{currentLevel.opLabel}</p>
          </div>
          <p className="font-nunito text-xs text-gold-400">{t.berriesPerCorrect(currentLevel.berriesPerCorrect)}</p>
        </div>

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
          <div className="bg-navy-800 rounded-xl p-2 text-center">
            <p className="font-bangers text-xl text-white">{profile.stats.gamesPlayed}</p>
            <p className="font-nunito text-xs text-gray-500">{t.gamesPlayed}</p>
          </div>
          <div className="bg-navy-800 rounded-xl p-2 text-center">
            <p className="font-bangers text-xl text-white">
              {profile.stats.totalAttempted > 0
                ? Math.round((profile.stats.totalCorrect / profile.stats.totalAttempted) * 100)
                : 0}%
            </p>
            <p className="font-nunito text-xs text-gray-500">{t.precision}</p>
          </div>
          <div className="bg-navy-800 rounded-xl p-2 text-center">
            <p className="font-bangers text-xl text-white">🔥{profile.stats.bestStreak}</p>
            <p className="font-nunito text-xs text-gray-500">{t.bestStreakShort}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
