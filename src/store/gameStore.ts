import { create } from 'zustand'
import type { Question, GameConfig, GameResult, BotSnap, DuelP1Snap, WrongAnswer, Operation, OperationEntry, StoredQuestion } from '../engine/types'

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
  pendingBotSnap: BotSnap | null
  pendingDuelP1Snap: DuelP1Snap | null
  wrongAnswers: WrongAnswer[]
  operationLog: OperationEntry[]
  wrongLog: StoredQuestion[]

  startGame: (config: GameConfig, questions: Question[]) => void
  answerQuestion: (isCorrect: boolean, pointValue: number) => void
  recordWrongAnswer: (display: string, correctAnswer: number, userAnswer: string) => void
  logOperation: (operation: Operation, correct: boolean) => void
  logWrong: (display: string, correctAnswer: number, operation: Operation) => void
  loseLife: () => void
  nextQuestion: () => void
  finishGame: () => void
  resetGame: () => void
  setPendingBotSnap: (snap: BotSnap) => void
  startDuelP2: (p1Id: string, p1Name: string, p1Avatar: string) => void
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
  pendingBotSnap: null,
  pendingDuelP1Snap: null,
  wrongAnswers: [],
  operationLog: [],
  wrongLog: [],

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
    pendingBotSnap: null,
    pendingDuelP1Snap: null,
    wrongAnswers: [],
    operationLog: [],
    wrongLog: [],
  }),

  recordWrongAnswer: (display, correctAnswer, userAnswer) => set(state => ({
    wrongAnswers: [...state.wrongAnswers, { display, correctAnswer, userAnswer }],
  })),

  logOperation: (operation, correct) => set(state => ({
    operationLog: [...state.operationLog, { operation, correct }],
  })),

  logWrong: (display, correctAnswer, operation) => set(state => ({
    wrongLog: [...state.wrongLog, { display, correctAnswer, operation }],
  })),

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

  loseLife: () => set(state => ({ lives: state.lives - 1, streak: 0 })),

  nextQuestion: () => set(state => ({ currentIndex: state.currentIndex + 1 })),

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
      ...(state.config?.isDaily ? { isDaily: true } : {}),
      ...(state.pendingBotSnap ? { botSnap: state.pendingBotSnap } : {}),
      ...(state.pendingDuelP1Snap ? { duelP1Snap: state.pendingDuelP1Snap } : {}),
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
    pendingBotSnap: null,
    pendingDuelP1Snap: null,
    wrongAnswers: [],
    operationLog: [],
    wrongLog: [],
  }),

  setPendingBotSnap: (snap) => set({ pendingBotSnap: snap }),

  startDuelP2: (p1Id, p1Name, p1Avatar) => set(state => ({
    pendingDuelP1Snap: {
      profileId: p1Id,
      profileName: p1Name,
      profileAvatar: p1Avatar,
      correct: state.correct,
      attempted: state.attempted,
      berriesEarned: state.berriesEarned,
      maxStreak: state.maxStreak,
    },
    currentIndex: 0,
    correct: 0,
    attempted: 0,
    streak: 0,
    maxStreak: 0,
    berriesEarned: 0,
    isFinished: false,
    operationLog: [],
    wrongLog: [],
  })),

  currentQuestion: () => {
    const { questions, currentIndex } = get()
    return questions[currentIndex] ?? null
  },
}))
