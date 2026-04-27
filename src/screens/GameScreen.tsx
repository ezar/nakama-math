import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
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
  } = useGameStore()

  const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)

  const isSurvival = config?.mode === 'survival'
  const hasTimer = !!config?.timePerQuestion

  useEffect(() => {
    if (!config) return
    if (isSurvival) {
      const level = getLevelById(config.levelId)
      if (level) setCurrentQuestion(generateQuestion(level))
    } else {
      setCurrentQuestion(questions[currentIndex] ?? null)
    }
    setAnswerStates({})
    setFeedback(null)
    setLocked(false)
    if (config.timePerQuestion) setTimeLeft(config.timePerQuestion)
  }, [currentIndex, config, isSurvival, questions])

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
    if (!config) return
    const total = isSurvival ? Infinity : config.totalQuestions
    const nextIdx = currentIndex + 1

    if (!continueGame || nextIdx >= total) {
      finishGame()
      onFinish()
      return
    }

    if (isSurvival) {
      const level = getLevelById(config.levelId)
      if (level) setCurrentQuestion(generateQuestion(level))
      setAnswerStates({})
      setFeedback(null)
      setLocked(false)
      if (config.timePerQuestion) setTimeLeft(config.timePerQuestion)
      useGameStore.setState(s => ({ currentIndex: s.currentIndex + 1 }))
    } else {
      nextQuestion()
    }
  }, [config, currentIndex, isSurvival, finishGame, nextQuestion, onFinish])

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

    if (isCorrect) {
      play(streak >= 4 ? 'streak' : 'correct')
      const msgs = streak >= 5 ? t.gearMessages : t.correctMessages
      setFeedback(msgs[Math.floor(Math.random() * msgs.length)])
      answerQuestion(true, currentQuestion.pointValue)
      setTimeout(() => advance(true), 900)
    } else {
      play('wrong')
      setFeedback(t.wrongMessages[Math.floor(Math.random() * t.wrongMessages.length)])
      answerQuestion(false, 0)

      if (config.mode === 'speed' || config.mode === 'blitz') {
        loseLife()
        setTimeout(() => { finishGame(); onFinish() }, 1200)
      } else if (config.mode === 'survival') {
        loseLife()
        const newLives = useGameStore.getState().lives
        if (newLives <= 0) {
          setTimeout(() => { finishGame(); onFinish() }, 1200)
        } else {
          setTimeout(() => advance(true), 1200)
        }
      } else {
        setTimeout(() => advance(true), 1000)
      }
    }
  }

  function handleExit() {
    if (timerRef.current) clearInterval(timerRef.current)
    resetGame()
    onExit()
  }

  if (!currentQuestion || !config) return (
    <div className="h-full flex items-center justify-center bg-navy-900">
      <p className="font-nunito text-white">{t.loadingChallenge}</p>
    </div>
  )

  const progress = isSurvival ? null : ((currentIndex + 1) / config.totalQuestions)

  return (
    <div className="h-full bg-navy-900 flex flex-col items-center px-4 pt-4 pb-2">
      <div className="w-full max-w-md flex flex-col gap-3 h-full">

        {/* Top bar: exit + progress + streak */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            aria-label={t.exitGame}
            className="font-nunito text-xs text-gray-500 hover:text-pirate-red transition-colors shrink-0"
          >
            ✕
          </button>
          {isSurvival ? (
            <div className="flex-1">
              <HpBar current={lives} max={config.livesCount ?? 3} />
            </div>
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
          <StreakBadge streak={streak} />
        </div>

        {/* Gear Second banner */}
        <AnimatePresence>
          {streak >= 5 && !shouldReduceMotion && (
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

        {/* Timer */}
        {hasTimer && timeLeft !== null && (
          <div className={`text-center font-bangers text-4xl leading-none ${timeLeft <= 3 ? 'text-pirate-red animate-pulse' : 'text-gold-400'}`}>
            {timeLeft}
          </div>
        )}

        {/* Question — grows to fill available space */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <AnimatePresence mode="wait">
            <QuestionCard key={currentQuestion.id} question={currentQuestion} />
          </AnimatePresence>
        </div>

        {/* Feedback */}
        <div className="h-9 flex items-center justify-center">
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
          {isSurvival ? t.lives(lives) : `${currentIndex + 1} / ${config.totalQuestions}`}
        </p>
      </div>

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitConfirm && (
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
