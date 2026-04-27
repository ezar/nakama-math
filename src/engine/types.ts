export type Operation = 'add' | 'sub' | 'mul' | 'div' | 'frac' | 'pct' | 'exp'

export interface LevelConstraints {
  maxA: number
  maxB: number
  allowNegativeResults: boolean
  requireIntegerResults: boolean
  mulMaxB?: number
  multiStep?: boolean
  fracDenominators?: number[]
  pctValues?: number[]
  expMax?: number
}

export interface LevelConfig {
  id: number
  name: string
  opLabel: string
  operations: Operation[]
  constraints: LevelConstraints
  berriesPerCorrect: number
  xpToUnlock: number
  timeLimit?: number
}

export interface Question {
  id: string
  display: string
  operands: number[]
  operation: Operation
  correctAnswer: number
  allAnswers: string[]
  pointValue: number
  opChar: string
}

export type GameMode = 'normal' | 'speed' | 'survival' | 'blitz'

export interface GameConfig {
  mode: GameMode
  levelId: number
  totalQuestions: number
  timePerQuestion?: number
  livesCount?: number
  multiplier: number
}

export interface Profile {
  id: string
  name: string
  avatar: string
  berries: number
  stats: {
    totalCorrect: number
    totalAttempted: number
    bestStreak: number
    gamesPlayed: number
  }
  createdAt: string
}

export interface GameResult {
  berriesEarned: number
  correct: number
  attempted: number
  maxStreak: number
  accuracy: number
  mode: GameMode
}
