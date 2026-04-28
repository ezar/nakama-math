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
import { BOTS } from '../config/bots'
import type { GameConfig, LevelConfig, BotConfig } from '../engine/types'
import type { Locale } from '../i18n/translations'

type CoreMode = 'normal' | 'speed' | 'survival' | 'blitz'

const CORE_MODE_CONFIGS: Record<CoreMode, { icon: string; questions: number; timePerQuestion?: number; livesCount?: number; multiplier: number }> = {
  normal:   { icon: '⚔️',  questions: 10, multiplier: 1 },
  speed:    { icon: '⚡',  questions: 10, timePerQuestion: 15, livesCount: 1, multiplier: 1.5 },
  survival: { icon: '❤️',  questions: 999, livesCount: 3, multiplier: 1 },
  blitz:    { icon: '🌊',  questions: 10, timePerQuestion: 8, livesCount: 1, multiplier: 2 },
}

const DIFFICULTY_LABELS = ['easy', 'medium', 'hard', 'legend'] as const
const DIFFICULTY_STARS = [1, 2, 3, 4]

interface HubScreenProps {
  onPlay: () => void
  onBack: () => void
}

export function HubScreen({ onPlay, onBack }: HubScreenProps) {
  const t = useTranslation()
  const locale = useSettingsStore(s => s.locale) as Locale
  const profiles = useProfileStore(s => s.profiles)
  const currentProfileId = useProfileStore(s => s.currentProfileId)
  const profile = profiles.find(p => p.id === currentProfileId) ?? null
  const { startGame } = useGameStore()

  if (!profile) return null

  const unlockedLevels = getUnlockedLevels(profile.berries)
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(unlockedLevels[unlockedLevels.length - 1])
  const [showLevelPicker, setShowLevelPicker] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showBotPicker, setShowBotPicker] = useState(false)
  const [showDuelPicker, setShowDuelPicker] = useState(false)

  const rankIdx = getRankIndex(profile.berries)
  const nextBerries = getNextRankBerries(profile.berries)
  const nextLevel = LEVELS[rankIdx + 1]
  const prevThreshold = LEVELS[rankIdx]?.xpToUnlock ?? 0
  const progressPct = nextBerries
    ? Math.min(100, ((profile.berries - prevThreshold) / (nextBerries - prevThreshold)) * 100)
    : 100

  function launchCoreMode(mode: CoreMode) {
    const levelConfig = getLevelById(selectedLevel.id)
    if (!levelConfig) return
    const mc = CORE_MODE_CONFIGS[mode]
    const config: GameConfig = {
      mode,
      levelId: levelConfig.id,
      totalQuestions: mc.questions,
      timePerQuestion: mc.timePerQuestion,
      livesCount: mc.livesCount,
      multiplier: mc.multiplier,
    }
    const questions = Array.from({ length: Math.min(mc.questions, 10) }, () => generateQuestion(levelConfig))
    startGame(config, questions)
    onPlay()
  }

  function launchVersus(bot: BotConfig) {
    const levelConfig = getLevelById(selectedLevel.id)
    if (!levelConfig) return
    const config: GameConfig = {
      mode: 'versus',
      levelId: levelConfig.id,
      totalQuestions: 10,
      multiplier: 1,
      bot,
    }
    const questions = Array.from({ length: 10 }, () => generateQuestion(levelConfig))
    startGame(config, questions)
    setShowBotPicker(false)
    onPlay()
  }

  function launchDuel(p2ProfileId: string) {
    const levelConfig = getLevelById(selectedLevel.id)
    if (!levelConfig) return
    const config: GameConfig = {
      mode: 'duel',
      levelId: levelConfig.id,
      totalQuestions: 10,
      multiplier: 1,
      duelPlayer2Id: p2ProfileId,
    }
    const questions = Array.from({ length: 10 }, () => generateQuestion(levelConfig))
    startGame(config, questions)
    setShowDuelPicker(false)
    onPlay()
  }

  const coreModes: CoreMode[] = ['normal', 'speed', 'survival', 'blitz']
  const isMaxLevel = unlockedLevels.length === 1
  const otherProfiles = profiles.filter(p => p.id !== currentProfileId)

  return (
    <div className="h-full overflow-y-auto bg-navy-900 flex flex-col items-center px-4 pt-3 pb-footer">
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

        {/* Battle modes */}
        <h2 className="font-bangers text-xl text-white tracking-widest text-center">{t.battleMode}</h2>
        <div className="grid grid-cols-2 gap-2">
          {coreModes.map((mode, i) => {
            const mc = CORE_MODE_CONFIGS[mode]
            return (
              <motion.button
                key={mode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => launchCoreMode(mode)}
                className="flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 rounded-2xl border-2 border-navy-600 [@media(hover:hover)]:hover:bg-navy-600 [@media(hover:hover)]:hover:border-gold-400 transition-colors cursor-pointer"
              >
                <span className="text-2xl">{mc.icon}</span>
                <p className="font-bangers text-base text-white">{t.modes[mode].name}</p>
                <p className="font-nunito text-xs text-gray-400 text-center leading-tight">{t.modes[mode].desc}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Competitive modes */}
        <h2 className="font-bangers text-xl text-white tracking-widest text-center">{t.competitiveMode}</h2>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowBotPicker(true)}
            className="flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 rounded-2xl border-2 border-navy-600 [@media(hover:hover)]:hover:bg-navy-600 [@media(hover:hover)]:hover:border-purple-400 transition-colors cursor-pointer"
          >
            <span className="text-2xl">🤖</span>
            <p className="font-bangers text-base text-white">{t.modes.versus.name}</p>
            <p className="font-nunito text-xs text-gray-400 text-center leading-tight">{t.modes.versus.desc}</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.34 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => otherProfiles.length > 0 ? setShowDuelPicker(true) : undefined}
            disabled={otherProfiles.length === 0}
            className={`flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 rounded-2xl border-2 border-navy-600 transition-colors cursor-pointer ${otherProfiles.length > 0 ? '[@media(hover:hover)]:hover:bg-navy-600 [@media(hover:hover)]:hover:border-purple-400' : 'opacity-40 cursor-not-allowed'}`}
          >
            <span className="text-2xl">👥</span>
            <p className="font-bangers text-base text-white">{t.modes.duel.name}</p>
            <p className="font-nunito text-xs text-gray-400 text-center leading-tight">
              {otherProfiles.length === 0 ? '2 piratas necesarios' : t.modes.duel.desc}
            </p>
          </motion.button>
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

      {/* Level picker */}
      <AnimatePresence>
        {showLevelPicker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setShowLevelPicker(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
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
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-colors ${selectedLevel.id === level.id ? 'border-gold-400 bg-gold-400/10' : 'border-navy-600 hover:border-navy-500'}`}
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

      {/* Bot picker */}
      <AnimatePresence>
        {showBotPicker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setShowBotPicker(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl"
            >
              <p className="font-bangers text-xl text-purple-400 mb-3 text-center tracking-widest">{t.chooseOpponent}</p>
              <div className="flex flex-col gap-2">
                {BOTS.map((bot, i) => {
                  const diffKey = DIFFICULTY_LABELS[i]
                  return (
                    <motion.button
                      key={bot.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => launchVersus(bot)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-navy-600 hover:border-purple-400 hover:bg-purple-400/10 transition-colors"
                    >
                      <span className="text-3xl">{bot.avatar}</span>
                      <div className="flex-1 text-left">
                        <p className="font-bangers text-lg text-white">{bot.name}</p>
                        <p className="font-nunito text-xs text-gray-400">{t.difficulty[diffKey]}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: DIFFICULTY_STARS[i] }).map((_, s) => (
                          <span key={s} className="text-gold-400 text-sm">★</span>
                        ))}
                        {Array.from({ length: 4 - DIFFICULTY_STARS[i] }).map((_, s) => (
                          <span key={s} className="text-navy-600 text-sm">★</span>
                        ))}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duel player picker */}
      <AnimatePresence>
        {showDuelPicker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setShowDuelPicker(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl"
            >
              <p className="font-bangers text-xl text-purple-400 mb-1 text-center tracking-widest">{t.choosePlayer2}</p>
              <p className="font-nunito text-xs text-gray-500 text-center mb-3">{profile.avatar} {profile.name} vs …</p>
              <div className="flex flex-col gap-2">
                {otherProfiles.map(p2 => (
                  <motion.button
                    key={p2.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => launchDuel(p2.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-navy-600 hover:border-purple-400 hover:bg-purple-400/10 transition-colors"
                  >
                    <span className="text-3xl">{p2.avatar}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bangers text-lg text-white">{p2.name}</p>
                      <div className="flex items-center gap-1">
                        <RankBadge berries={p2.berries} />
                        <span className="font-nunito text-xs text-gold-400">🪙 {p2.berries.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.button>
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
