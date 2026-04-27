import { create } from 'zustand'
import type { Question, GameConfig, GameResult } from '../engine/types'

interface GameStore {
  config: GameConfig | null
  questions: Question[]
  currentIndex: number
  correct: number
  attempted: number
  streak: number
  maxStreak: number
  lives: number
  berriesEarned: number
  isFinished: boolean
  lastResult: GameResult | null

  startGame: (config: GameConfig, questions: Question[]) => void
  answerQuestion: (isCorrect: boolean, pointValue: number) => void
  loseLife: () => void
  nextQuestion: () => void
  finishGame: () => void
  resetGame: () => void
}

function streakMultiplier(streak: number, baseMultiplier: number): number {
  if (streak >= 10) return baseMultiplier * 3
  if (streak >= 5) return baseMultiplier * 2
  if (streak >= 3) return baseMultiplier * 1.2
  return baseMultiplier
}

export const useGameStore = create<GameStore>()((set, get) => ({
  config: null,
  questions: [],
  currentIndex: 0,
  correct: 0,
  attempted: 0,
  streak: 0,
  maxStreak: 0,
  lives: 3,
  berriesEarned: 0,
  isFinished: false,
  lastResult: null,

  startGame: (config, questions) => set({
    config,
    questions,
    currentIndex: 0,
    correct: 0,
    attempted: 0,
    streak: 0,
    maxStreak: 0,
    lives: config.livesCount ?? 3,
    berriesEarned: 0,
    isFinished: false,
    lastResult: null,
  }),

  answerQuestion: (isCorrect, pointValue) => set(state => {
    if (!state.config) return state
    const newStreak = isCorrect ? state.streak + 1 : 0
    const newMaxStreak = Math.max(state.maxStreak, newStreak)
    const mult = streakMultiplier(newStreak, state.config.multiplier)
    const earned = isCorrect ? Math.round(pointValue * mult) : 0
    return {
      correct: state.correct + (isCorrect ? 1 : 0),
      attempted: state.attempted + 1,
      streak: newStreak,
      maxStreak: newMaxStreak,
      berriesEarned: state.berriesEarned + earned,
    }
  }),

  loseLife: () => set(state => {
    const newLives = state.lives - 1
    return { lives: newLives, streak: 0 }
  }),

  nextQuestion: () => set(state => ({
    currentIndex: state.currentIndex + 1,
  })),

  finishGame: () => set(state => {
    const accuracy = state.attempted > 0
      ? Math.round((state.correct / state.attempted) * 100)
      : 0
    const result: GameResult = {
      berriesEarned: state.berriesEarned,
      correct: state.correct,
      attempted: state.attempted,
      maxStreak: state.maxStreak,
      accuracy,
      mode: state.config?.mode ?? 'normal',
    }
    return { isFinished: true, lastResult: result }
  }),

  resetGame: () => set({
    config: null,
    questions: [],
    currentIndex: 0,
    correct: 0,
    attempted: 0,
    streak: 0,
    maxStreak: 0,
    lives: 3,
    berriesEarned: 0,
    isFinished: false,
    lastResult: null,
  }),

  currentQuestion: () => {
    const { questions, currentIndex } = get()
    return questions[currentIndex] ?? null
  },
}))
