import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useProfileStore } from '../store/profileStore'
import { generateQuestion } from '../engine/QuestionEngine'
import { getLevelById } from '../config/levels'
import { QuestionCard } from '../components/QuestionCard'
import { AnswerButton } from '../components/AnswerButton'
import { StreakBadge } from '../components/StreakBadge'
import { HpBar } from '../components/HpBar'
import { useSoundEffect } from '../audio/useSoundEffect'
import { useTranslation } from '../i18n/useTranslation'
import type { Question } from '../engine/types'

type AnswerState = 'idle' | 'correct' | 'wrong'
type DuelPhase = 'p1' | 'handoff' | 'p2'

interface GameScreenProps {
  onFinish: () => void
  onExit: () => void
}

export function GameScreen({ onFinish, onExit }: GameScreenProps) {
  const t = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const { play } = useSoundEffect()

  const {
    config, questions, currentIndex,
    streak, lives,
    answerQuestion, loseLife, nextQuestion, finishGame, resetGame,
    setPendingBotSnap, startDuelP2, recordWrongAnswer,
  } = useGameStore()

  const profiles = useProfileStore(s => s.profiles)
  const currentProfileId = useProfileStore(s => s.currentProfileId)
  const p1Profile = profiles.find(p => p.id === currentProfileId) ?? null
  const p2Profile = profiles.find(p => p.id === config?.duelPlayer2Id) ?? null

  const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [duelPhase, setDuelPhase] = useState<DuelPhase>('p1')
  const [botLastAnswer, setBotLastAnswer] = useState<'correct' | 'wrong' | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const globalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const botCorrectRef = useRef(0)
  const finishedRef = useRef(false)

  const isVersus = config?.mode === 'versus'
  const isDuel = config?.mode === 'duel'
  const isSurvival = config?.mode === 'survival'
  const isTimeTrial = config?.mode === 'timeTrial'
  const isPractice = config?.mode === 'practice'
  const isInfinite = isSurvival || isTimeTrial || isPractice
  const hasTimer = !!config?.timePerQuestion

  // Initialize 60-second global countdown for timeTrial
  useEffect(() => {
    if (config?.mode !== 'timeTrial') return
    finishedRef.current = false
    setGlobalTimeLeft(60)
    return () => { if (globalTimerRef.current) clearInterval(globalTimerRef.current) }
  }, [config])

  // Tick global timer
  useEffect(() => {
    if (globalTimeLeft === null) return
    if (globalTimeLeft <= 0) {
      if (!finishedRef.current) {
        finishedRef.current = true
        play('timeout')
        finishGame()
        onFinish()
      }
      return
    }
    if (globalTimeLeft <= 5) play('tick')
    const id = setInterval(() => {
      setGlobalTimeLeft(prev => (prev === null || prev <= 1) ? 0 : prev - 1)
    }, 1000)
    globalTimerRef.current = id
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalTimeLeft])

  // Keyboard shortcuts: 1/2/3/4 map to answer buttons
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = ['1', '2', '3', '4'].indexOf(e.key)
      if (idx === -1 || !currentQuestion || locked || duelPhase === 'handoff') return
      const answer = currentQuestion.allAnswers[idx]
      if (answer !== undefined) handleAnswer(answer)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, locked, duelPhase])

  useEffect(() => {
    if (!config || duelPhase === 'handoff') return
    if (isInfinite) {
      const level = getLevelById(config.levelId)
      if (level) {
        const effectiveLevel = isPractice && config.practiceOperation
          ? { ...level, operations: [config.practiceOperation] }
          : level
        setCurrentQuestion(generateQuestion(effectiveLevel))
      }
    } else {
      setCurrentQuestion(questions[currentIndex] ?? null)
    }
    setAnswerStates({})
    setFeedback(null)
    setLocked(false)
    setBotLastAnswer(null)
    if (config.timePerQuestion) setTimeLeft(config.timePerQuestion)
  }, [currentIndex, config, isInfinite, isPractice, questions, duelPhase])

  useEffect(() => {
    if (!hasTimer || !timeLeft || locked) return
    if (timeLeft <= 3 && timeLeft > 0) play('tick')
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev === null || prev <= 1) ? 0 : prev - 1)
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timeLeft, hasTimer, locked, play])

  useEffect(() => {
    if (timeLeft !== 0) return
    if (locked) return
    play('timeout')
    setFeedback(t.timeUp)
    setLocked(true)
    if (config?.mode === 'speed' || config?.mode === 'blitz') {
      loseLife()
      setTimeout(() => advance(false), 1200)
    } else {
      answerQuestion(false, 0)
      setTimeout(() => advance(true), 1200)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const advance = useCallback((continueGame: boolean) => {
    if (!config || finishedRef.current) return
    const total = isInfinite ? Infinity : config.totalQuestions
    const nextIdx = currentIndex + 1

    if (!continueGame || nextIdx >= total) {
      if (isVersus && config.bot) {
        const attempted = useGameStore.getState().attempted
        setPendingBotSnap({
          name: config.bot.name,
          avatar: config.bot.avatar,
          correct: botCorrectRef.current,
          attempted,
        })
      }

      if (isDuel && duelPhase === 'p1' && p1Profile) {
        startDuelP2(p1Profile.id, p1Profile.name, p1Profile.avatar)
        setDuelPhase('handoff')
        return
      }

      if (!finishedRef.current) {
        finishedRef.current = true
        finishGame()
        onFinish()
      }
      return
    }

    if (isInfinite) {
      useGameStore.setState(s => ({ currentIndex: s.currentIndex + 1 }))
    } else {
      nextQuestion()
    }
  }, [config, currentIndex, isInfinite, isVersus, isDuel, duelPhase, p1Profile,
      finishGame, nextQuestion, onFinish, setPendingBotSnap, startDuelP2])

  function handleAnswer(answer: string) {
    if (locked || !currentQuestion || !config) return
    if (timerRef.current) clearInterval(timerRef.current)

    const isCorrect = answer === String(currentQuestion.correctAnswer)
    setLocked(true)

    const newStates: Record<string, AnswerState> = {}
    currentQuestion.allAnswers.forEach(a => {
      if (a === String(currentQuestion.correctAnswer)) newStates[a] = 'correct'
      else if (a === answer && !isCorrect) newStates[a] = 'wrong'
      else newStates[a] = 'idle'
    })
    setAnswerStates(newStates)

    if (isVersus && config.bot) {
      const delay = 450 + Math.random() * 550
      setTimeout(() => {
        const botGotIt = Math.random() < config.bot!.accuracy
        if (botGotIt) botCorrectRef.current++
        setBotLastAnswer(botGotIt ? 'correct' : 'wrong')
        setTimeout(() => setBotLastAnswer(null), 900)
      }, delay)
    }

    if (isCorrect) {
      play(streak >= 4 ? 'streak' : 'correct')
      navigator.vibrate?.(40)
      const msgs = streak >= 5 ? t.gearMessages : t.correctMessages
      setFeedback(msgs[Math.floor(Math.random() * msgs.length)])
      answerQuestion(true, currentQuestion.pointValue)
      setTimeout(() => advance(true), 900)
    } else {
      play('wrong')
      navigator.vibrate?.([60, 40, 60])
      recordWrongAnswer(currentQuestion.display, currentQuestion.correctAnswer, answer)
      setFeedback(t.wrongMessages[Math.floor(Math.random() * t.wrongMessages.length)])
      answerQuestion(false, 0)

      const delay = config.mode === 'blitz' ? 600 : 900
      if (config.mode === 'speed' || config.mode === 'blitz') {
        loseLife()
        if (!finishedRef.current) {
          finishedRef.current = true
          setTimeout(() => { finishGame(); onFinish() }, delay)
        }
      } else if (config.mode === 'survival') {
        loseLife()
        const newLives = useGameStore.getState().lives
        if (newLives <= 0) {
          if (!finishedRef.current) {
            finishedRef.current = true
            setTimeout(() => { finishGame(); onFinish() }, 900)
          }
        } else {
          setTimeout(() => advance(true), 900)
        }
      } else {
        setTimeout(() => advance(true), 900)
      }
    }
  }

  function handleExit() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (globalTimerRef.current) clearInterval(globalTimerRef.current)
    finishedRef.current = true
    resetGame()
    onExit()
  }

  if (!currentQuestion || !config) return (
    <div className="h-full flex items-center justify-center bg-navy-900">
      <p className="font-nunito text-white">{t.loadingChallenge}</p>
    </div>
  )

  const progress = isInfinite ? null : ((currentIndex + 1) / config.totalQuestions)
  const currentPlayer = isDuel ? (duelPhase === 'p2' ? p2Profile : p1Profile) : null

  return (
    <div className="h-full bg-navy-900 flex flex-col items-center px-4 pt-4 pb-footer">
      <div className="w-full max-w-md flex flex-col gap-3 h-full">

        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            aria-label={t.exitGame}
            className={`font-nunito transition-colors shrink-0 ${
              isPractice
                ? 'text-xs font-bold text-gray-300 hover:text-white'
                : 'text-xs text-gray-500 hover:text-pirate-red'
            }`}
          >
            {isPractice ? t.exitGame : '✕'}
          </button>

          {isSurvival ? (
            <div className="flex-1">
              <HpBar current={lives} max={config.livesCount ?? 3} />
            </div>
          ) : isTimeTrial || isPractice ? (
            <div className="flex-1" />
          ) : (
            <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
              {progress !== null && (
                <motion.div
                  className="h-full bg-gold-400 rounded-full"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ type: 'spring', stiffness: 80 }}
                />
              )}
            </div>
          )}

          {isDuel && currentPlayer && (
            <span className="font-nunito text-xs text-purple-400 font-bold shrink-0">
              {currentPlayer.avatar} {currentPlayer.name}
            </span>
          )}

          {isVersus && config.bot && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm">{config.bot.avatar}</span>
              <span className="font-nunito text-xs text-gray-400">
                {botCorrectRef.current}/{currentIndex + (locked ? 1 : 0)}
              </span>
            </div>
          )}

          {!isPractice && <StreakBadge streak={streak} baseMultiplier={config?.multiplier ?? 1} />}
        </div>

        {/* Gear Second banner */}
        <AnimatePresence>
          {streak >= 5 && !shouldReduceMotion && !isPractice && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              className="text-center font-bangers text-orange-400 text-sm tracking-widest bg-orange-400/10 rounded-xl py-1"
            >
              {t.gearSecondBanner}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global countdown for Time Trial */}
        {isTimeTrial && globalTimeLeft !== null && (
          <div className={`text-center font-bangers text-5xl leading-none ${
            globalTimeLeft <= 10 ? 'text-pirate-red animate-pulse' : 'text-gold-400'
          }`}>
            {globalTimeLeft}s
          </div>
        )}

        {/* Per-question timer (speed / blitz) */}
        {hasTimer && timeLeft !== null && (
          <div className={`text-center font-bangers text-4xl leading-none ${
            timeLeft <= 3 ? 'text-pirate-red animate-pulse' : 'text-gold-400'
          }`}>
            {timeLeft}
          </div>
        )}

        {/* Question */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <AnimatePresence mode="wait">
            <QuestionCard key={currentQuestion.id} question={currentQuestion} />
          </AnimatePresence>
        </div>

        {/* Feedback + bot reaction */}
        <div className="h-9 flex items-center justify-center gap-3">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.p
                key={feedback + currentIndex}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center font-bangers text-3xl text-gold-400 leading-none"
              >
                {feedback}
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {botLastAnswer && config.bot && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="font-nunito text-sm font-bold"
              >
                {config.bot.avatar} {botLastAnswer === 'correct' ? '✓' : '✗'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Answers */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.allAnswers.map(a => (
            <AnswerButton
              key={`${currentQuestion.id}-${a}`}
              label={a}
              state={answerStates[a] ?? 'idle'}
              disabled={locked}
              onClick={() => handleAnswer(a)}
            />
          ))}
        </div>

        {/* Counter */}
        <p className="text-center font-nunito text-xs text-gray-500 pb-1">
          {isSurvival ? t.lives(lives)
            : isTimeTrial ? `${currentIndex + 1} ✓`
            : isPractice ? `${currentIndex + 1}`
            : `${currentIndex + 1} / ${config.totalQuestions}`}
        </p>
      </div>

      {/* Duel handoff overlay */}
      <AnimatePresence>
        {duelPhase === 'handoff' && p2Profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center z-50 p-8 gap-6"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <span className="text-7xl">{p1Profile?.avatar}</span>
              <p className="font-bangers text-2xl text-gold-400">{t.p1Finished}</p>
              <div className="bg-navy-700 rounded-2xl px-6 py-3 border border-navy-600">
                <p className="font-nunito text-sm text-gray-400">{p1Profile?.name}</p>
                <p className="font-bangers text-3xl text-white">
                  {useGameStore.getState().pendingDuelP1Snap?.correct ?? 0} / {config?.totalQuestions ?? 10}
                </p>
              </div>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px w-16 bg-navy-600" />
                <span className="font-bangers text-2xl text-purple-400">VS</span>
                <div className="h-px w-16 bg-navy-600" />
              </div>

              <p className="font-nunito font-bold text-gray-300">{t.passTurnTo(p2Profile.name)}</p>
              <span className="text-7xl">{p2Profile.avatar}</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setDuelPhase('p2')}
              className="w-full max-w-xs py-4 rounded-2xl font-bangers text-2xl tracking-widest bg-purple-500 text-white hover:bg-purple-400 transition-colors shadow-lg"
            >
              {t.tapToStart}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-navy-800 rounded-3xl p-6 w-full max-w-xs border border-navy-600 shadow-2xl text-center"
            >
              <p className="font-nunito font-bold text-white mb-6">{t.exitConfirm}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-nunito font-bold text-gray-400 hover:text-white border border-navy-600 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 py-3 rounded-xl font-nunito font-bold bg-pirate-red text-white hover:bg-pirate-red-dark transition-colors"
                >
                  {t.exitGame}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
