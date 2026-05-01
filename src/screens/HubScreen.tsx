import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfileStore } from '../store/profileStore'
import { useGameStore } from '../store/gameStore'
import { useTranslation } from '../i18n/useTranslation'
import { useSettingsStore } from '../store/settingsStore'
import { RankBadge } from '../components/RankBadge'
import { AchievementGallery } from '../components/AchievementGallery'
import { StreakCalendar } from '../components/StreakCalendar'
import { ShopModal } from '../components/ShopModal'
import { getUnlockedLevels, getLevelById, LEVELS } from '../config/levels'
import { generateQuestion, makeErrorDrillQuestion } from '../engine/QuestionEngine'
import { getRankIndex, getNextRankBerries } from '../utils/rankSystem'
import { BOTS } from '../config/bots'
import { getDailyQuestions, DAILY_MULTIPLIER, todayDateString } from '../config/dailyChallenge'
import type { GameConfig, LevelConfig, BotConfig, Operation } from '../engine/types'
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
  onSettings: () => void
}

export function HubScreen({ onPlay, onBack, onSettings }: HubScreenProps) {
  const t = useTranslation()
  const locale = useSettingsStore(s => s.locale) as Locale
  const profiles = useProfileStore(s => s.profiles)
  const currentProfileId = useProfileStore(s => s.currentProfileId)
  const profile = profiles.find(p => p.id === currentProfileId) ?? null
  const { startGame } = useGameStore()

  if (!profile) return null

  const unlockedLevels = getUnlockedLevels(profile.berries)
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(unlockedLevels[unlockedLevels.length - 1])
  const inputMode = useSettingsStore(s => s.inputMode)
  const toggleInputMode = useSettingsStore(s => s.toggleInputMode)
  const markTutorialSeen = useProfileStore(s => s.markTutorialSeen)

  const [showLevelPicker, setShowLevelPicker] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showBotPicker, setShowBotPicker] = useState(false)
  const [showDuelPicker, setShowDuelPicker] = useState(false)
  const [showPracticePicker, setShowPracticePicker] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const showTutorial = !profile.hasSeenTutorial

  const rankIdx = getRankIndex(profile.berries)
  const nextBerries = getNextRankBerries(profile.berries)
  const nextLevel = LEVELS[rankIdx + 1]
  const prevThreshold = LEVELS[rankIdx]?.xpToUnlock ?? 0
  const progressPct = nextBerries
    ? Math.min(100, ((profile.berries - prevThreshold) / (nextBerries - prevThreshold)) * 100)
    : 100

  const todayStr = todayDateString()
  const dailyDone = profile.lastDailyDate === todayStr
  const dailyStreak = profile.dailyStreak ?? 0

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

  function launchDaily() {
    const questions = getDailyQuestions()
    const config: GameConfig = {
      mode: 'normal',
      levelId: 1,
      totalQuestions: 5,
      multiplier: DAILY_MULTIPLIER,
      isDaily: true,
    }
    startGame(config, questions)
    onPlay()
  }

  function launchTimeTrial() {
    const levelConfig = getLevelById(selectedLevel.id)
    if (!levelConfig) return
    const config: GameConfig = {
      mode: 'timeTrial',
      levelId: levelConfig.id,
      totalQuestions: 999,
      multiplier: 1,
    }
    const questions = Array.from({ length: 20 }, () => generateQuestion(levelConfig))
    startGame(config, questions)
    onPlay()
  }

  function launchPractice(operation: Operation) {
    const levelConfig = getLevelById(selectedLevel.id)
    if (!levelConfig) return
    const practiceLevel = { ...levelConfig, operations: [operation] }
    const config: GameConfig = {
      mode: 'practice',
      levelId: levelConfig.id,
      totalQuestions: 999,
      multiplier: 0,
      practiceOperation: operation,
    }
    const questions = Array.from({ length: 20 }, () => generateQuestion(practiceLevel))
    startGame(config, questions)
    setShowPracticePicker(false)
    onPlay()
  }

  function launchVersus(bot: BotConfig) {
    const levelConfig = getLevelById(selectedLevel.id)
    if (!levelConfig) return
    const config: GameConfig = { mode: 'versus', levelId: levelConfig.id, totalQuestions: 10, multiplier: 1, bot }
    const questions = Array.from({ length: 10 }, () => generateQuestion(levelConfig))
    startGame(config, questions)
    setShowBotPicker(false)
    onPlay()
  }

  function launchDuel(p2ProfileId: string) {
    const levelConfig = getLevelById(selectedLevel.id)
    if (!levelConfig) return
    const config: GameConfig = { mode: 'duel', levelId: levelConfig.id, totalQuestions: 10, multiplier: 1, duelPlayer2Id: p2ProfileId }
    const questions = Array.from({ length: 10 }, () => generateQuestion(levelConfig))
    startGame(config, questions)
    setShowDuelPicker(false)
    onPlay()
  }

  function launchErrorDrill() {
    if (!profile) return
    const wrong = profile.wrongQuestions ?? []
    if (wrong.length === 0) return
    const shuffled = [...wrong].sort(() => Math.random() - 0.5).slice(0, 10)
    const questions = shuffled.map(sq => makeErrorDrillQuestion(sq.display, sq.correctAnswer, sq.operation))
    const config: GameConfig = {
      mode: 'errorDrill',
      levelId: 1,
      totalQuestions: questions.length,
      multiplier: 0,
    }
    startGame(config, questions)
    onPlay()
  }

  const coreModes: CoreMode[] = ['normal', 'speed', 'survival', 'blitz']
  const isMaxLevel = unlockedLevels.length === 1
  const otherProfiles = profiles.filter(p => p.id !== currentProfileId)
  const availableOps = selectedLevel.operations

  return (
    <div className="h-full bg-navy-900 overflow-hidden pb-footer">
      <div className="h-full overflow-y-auto flex flex-col items-center px-4 pt-3">
      <div className="w-full max-w-md flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Volver" className="text-gray-400 hover:text-white font-nunito text-xl transition-colors">←</button>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{profile.avatar}</span>
            <div className="flex-1">
              <p className="font-nunito font-bold text-white text-sm">{profile.name}</p>
              <div className="flex items-center gap-2">
                <RankBadge berries={profile.berries} />
                <span className="font-nunito text-xs text-gold-400">🪙 {profile.berries.toLocaleString()}</span>
                {dailyStreak > 0 && (
                  <span className="font-nunito text-xs text-orange-400">🔥{dailyStreak}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleInputMode}
              title={t.inputModeLabel}
              className={`font-nunito text-xs px-2 py-1 rounded-lg border transition-colors ${
                inputMode === 'keyboard'
                  ? 'border-gold-400 text-gold-400 bg-gold-400/10'
                  : 'border-navy-600 text-gray-500 hover:text-gray-300'
              }`}
            >
              ⌨️
            </button>
            <button
              onClick={() => setShowShop(true)}
              className="text-gray-500 hover:text-gold-400 transition-colors text-xl"
              title={t.shopTitle}
            >
              🛒
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="relative text-gray-500 hover:text-gold-400 transition-colors text-xl"
            >
              🏆
              {(profile.achievements ?? []).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {(profile.achievements ?? []).length}
                </span>
              )}
            </button>
            <button
              onClick={onSettings}
              className="text-gray-500 hover:text-white transition-colors text-xl"
              title={t.settingsTitle}
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-nunito text-xs text-gray-400">
              {nextBerries ? t.nextRank(nextLevel?.name ?? '', nextBerries - profile.berries) : t.maxRankReached}
            </span>
            <span className="font-nunito text-xs text-gold-400">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gold-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>

        {/* Daily challenge banner */}
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={!dailyDone ? { scale: 0.97 } : {}}
          onClick={!dailyDone ? launchDaily : undefined}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-colors ${
            dailyDone
              ? 'border-navy-600 bg-navy-800 cursor-default'
              : 'border-gold-400 bg-gold-400/10 cursor-pointer [@media(hover:hover)]:hover:bg-gold-400/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{dailyDone ? '✅' : '⚓'}</span>
            <div className="text-left">
              <p className="font-bangers text-base text-gold-400 leading-tight">{dailyDone ? t.dailyDone : t.dailyChallenge}</p>
              <p className="font-nunito text-xs text-gray-400">
                {dailyDone
                  ? t.dailyStreakLabel(dailyStreak)
                  : `5 preguntas · ${t.dailyBonus}`}
              </p>
            </div>
          </div>
          {!dailyDone && <span className="font-nunito text-xs text-gold-400 font-bold">{t.dailyBonus}</span>}
        </motion.button>

        {/* Level selector */}
        <button
          onClick={() => !isMaxLevel && setShowLevelPicker(true)}
          className={`bg-navy-700 rounded-2xl px-4 py-3 border border-navy-600 flex items-center justify-between w-full text-left ${!isMaxLevel ? '[@media(hover:hover)]:hover:border-gold-400 transition-colors cursor-pointer' : 'cursor-default'}`}
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
        <h2 className="font-bangers text-lg text-white tracking-widest text-center">{t.battleMode}</h2>
        <div className="grid grid-cols-2 gap-2">
          {coreModes.map((mode, i) => {
            const mc = CORE_MODE_CONFIGS[mode]
            return (
              <motion.button
                key={mode}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
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

        {/* Solo free modes */}
        <h2 className="font-bangers text-lg text-white tracking-widest text-center">{t.soloMode}</h2>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.26 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={launchTimeTrial}
            className="flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 rounded-2xl border-2 border-navy-600 [@media(hover:hover)]:hover:bg-navy-600 [@media(hover:hover)]:hover:border-orange-400 transition-colors cursor-pointer"
          >
            <span className="text-2xl">⏱️</span>
            <p className="font-bangers text-base text-white">{t.modes.timeTrial.name}</p>
            <p className="font-nunito text-xs text-gray-400 text-center leading-tight">{t.modes.timeTrial.desc}</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.32 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowPracticePicker(true)}
            className="flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 rounded-2xl border-2 border-navy-600 [@media(hover:hover)]:hover:bg-navy-600 [@media(hover:hover)]:hover:border-emerald-400 transition-colors cursor-pointer"
          >
            <span className="text-2xl">📚</span>
            <p className="font-bangers text-base text-white">{t.modes.practice.name}</p>
            <p className="font-nunito text-xs text-gray-400 text-center leading-tight">{t.modes.practice.desc}</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.36 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={(profile.wrongQuestions ?? []).length > 0 ? launchErrorDrill : undefined}
            disabled={(profile.wrongQuestions ?? []).length === 0}
            className={`flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 rounded-2xl border-2 border-navy-600 transition-colors ${
              (profile.wrongQuestions ?? []).length > 0
                ? '[@media(hover:hover)]:hover:bg-navy-600 [@media(hover:hover)]:hover:border-gold-400 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <span className="text-2xl">🎯</span>
            <p className="font-bangers text-base text-white">{t.modes.errorDrill.name}</p>
            <p className="font-nunito text-xs text-gray-400 text-center leading-tight">
              {(profile.wrongQuestions ?? []).length === 0 ? t.noErrorsYet : t.modes.errorDrill.desc}
            </p>
          </motion.button>
        </div>

        {/* Competitive modes */}
        <h2 className="font-bangers text-lg text-white tracking-widest text-center">{t.competitiveMode}</h2>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.38 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowBotPicker(true)}
            className="flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 rounded-2xl border-2 border-navy-600 [@media(hover:hover)]:hover:bg-navy-600 [@media(hover:hover)]:hover:border-purple-400 transition-colors cursor-pointer"
          >
            <span className="text-2xl">🤖</span>
            <p className="font-bangers text-base text-white">{t.modes.versus.name}</p>
            <p className="font-nunito text-xs text-gray-400 text-center leading-tight">{t.modes.versus.desc}</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.44 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => otherProfiles.length > 0 ? setShowDuelPicker(true) : undefined}
            disabled={otherProfiles.length === 0}
            className={`flex flex-col items-center gap-1 py-3 px-2 bg-navy-700 rounded-2xl border-2 border-navy-600 transition-colors cursor-pointer ${otherProfiles.length > 0 ? '[@media(hover:hover)]:hover:bg-navy-600 [@media(hover:hover)]:hover:border-purple-400' : 'opacity-40 cursor-not-allowed'}`}
          >
            <span className="text-2xl">👥</span>
            <p className="font-bangers text-base text-white">{t.modes.duel.name}</p>
            <p className="font-nunito text-xs text-gray-400 text-center leading-tight">
              {otherProfiles.length === 0 ? 'Necesitas 2 piratas' : t.modes.duel.desc}
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

        {/* Operation breakdown */}
        {profile.operationStats && Object.keys(profile.operationStats).length > 0 && (
          <div className="flex flex-col gap-1.5 bg-navy-800 rounded-2xl p-3">
            <p className="font-nunito text-xs text-gray-500">{t.operationBreakdown}</p>
            {(Object.entries(profile.operationStats) as [string, { correct: number; attempted: number }][]).map(([op, st]) => {
              const pct = st.attempted > 0 ? Math.round((st.correct / st.attempted) * 100) : 0
              return (
                <div key={op} className="flex items-center gap-2">
                  <span className="font-nunito text-xs text-gray-400 w-24 shrink-0">{t.operationNames[op] ?? op}</span>
                  <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="font-nunito text-xs text-gray-400 w-8 text-right shrink-0">{pct}%</span>
                </div>
              )
            })}
          </div>
        )}

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

        {/* Activity calendar */}
        <StreakCalendar
          activityDates={profile.activityDates ?? []}
          lastDailyDate={profile.lastDailyDate}
          label={t.activityLabel}
        />

        <div className="pb-4" />
      </div>

      {/* Level picker */}
      <AnimatePresence>
        {showLevelPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setShowLevelPicker(false)}
          >
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl"
            >
              <p className="font-bangers text-xl text-gold-400 mb-3 text-center tracking-widest">{t.activeLevel}</p>
              <div className="flex flex-col gap-2">
                {unlockedLevels.map(level => (
                  <button key={level.id} onClick={() => { setSelectedLevel(level); setShowLevelPicker(false) }}
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

      {/* Practice operation picker */}
      <AnimatePresence>
        {showPracticePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setShowPracticePicker(false)}
          >
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl"
            >
              <p className="font-bangers text-xl text-emerald-400 mb-3 text-center tracking-widest">{t.chooseOperation}</p>
              <div className="flex flex-col gap-2">
                {availableOps.map(op => (
                  <button key={op} onClick={() => launchPractice(op)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-navy-600 hover:border-emerald-400 hover:bg-emerald-400/10 transition-colors"
                  >
                    <span className="text-2xl">{{ add: '➕', sub: '➖', mul: '✖️', div: '➗', frac: '½', pct: '%', exp: 'x²' }[op]}</span>
                    <p className="font-bangers text-lg text-white">{t.operationNames[op]}</p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setShowBotPicker(false)}
          >
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl"
            >
              <p className="font-bangers text-xl text-purple-400 mb-3 text-center tracking-widest">{t.chooseOpponent}</p>
              <div className="flex flex-col gap-2">
                {BOTS.map((bot, i) => (
                  <motion.button key={bot.id} whileTap={{ scale: 0.97 }} onClick={() => launchVersus(bot)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-navy-600 hover:border-purple-400 hover:bg-purple-400/10 transition-colors"
                  >
                    <span className="text-3xl">{bot.avatar}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bangers text-lg text-white">{bot.name}</p>
                      <p className="font-nunito text-xs text-gray-400">{t.difficulty[DIFFICULTY_LABELS[i]]}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: DIFFICULTY_STARS[i] }).map((_, s) => <span key={s} className="text-gold-400 text-sm">★</span>)}
                      {Array.from({ length: 4 - DIFFICULTY_STARS[i] }).map((_, s) => <span key={s} className="text-navy-600 text-sm">★</span>)}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duel picker */}
      <AnimatePresence>
        {showDuelPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
            onClick={() => setShowDuelPicker(false)}
          >
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl"
            >
              <p className="font-bangers text-xl text-purple-400 mb-1 text-center tracking-widest">{t.choosePlayer2}</p>
              <p className="font-nunito text-xs text-gray-500 text-center mb-3">{profile.avatar} {profile.name} vs …</p>
              <div className="flex flex-col gap-2">
                {otherProfiles.map(p2 => (
                  <motion.button key={p2.id} whileTap={{ scale: 0.97 }} onClick={() => launchDuel(p2.id)}
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
        <AchievementGallery unlockedIds={profile.achievements ?? []} locale={locale} onClose={() => setShowAchievements(false)} />
      )}

      <AnimatePresence>
        {showShop && (
          <ShopModal profileId={currentProfileId!} onClose={() => setShowShop(false)} />
        )}
      </AnimatePresence>

      {/* Onboarding tutorial */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="bg-navy-800 rounded-3xl p-6 w-full max-w-sm border border-navy-600 shadow-2xl flex flex-col gap-4"
            >
              <p className="font-bangers text-xl text-gold-400 text-center tracking-widest">{t.tutorialTitle}</p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tutorialStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center gap-2 text-center min-h-[80px] justify-center"
                >
                  <p className="font-bangers text-2xl text-white">{t.tutorialSlides[tutorialStep].title}</p>
                  <p className="font-nunito text-sm text-gray-400 leading-relaxed">{t.tutorialSlides[tutorialStep].body}</p>
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div className="flex justify-center gap-1.5">
                {t.tutorialSlides.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all ${i === tutorialStep ? 'w-4 h-1.5 bg-gold-400' : 'w-1.5 h-1.5 bg-navy-600'}`} />
                ))}
              </div>

              {tutorialStep < t.tutorialSlides.length - 1 ? (
                <button
                  onClick={() => setTutorialStep(s => s + 1)}
                  className="w-full py-3 rounded-xl font-nunito font-bold text-navy-900 bg-gold-400 hover:bg-gold-300 transition-colors"
                >
                  →
                </button>
              ) : (
                <button
                  onClick={() => markTutorialSeen(currentProfileId!)}
                  className="w-full py-3 rounded-xl font-bangers text-xl tracking-widest text-navy-900 bg-gold-400 hover:bg-gold-300 transition-colors"
                >
                  {t.tutorialStart}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
