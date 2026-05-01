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

export type GameMode =
  | 'normal' | 'speed' | 'survival' | 'blitz'
  | 'versus' | 'duel'
  | 'timeTrial' | 'practice' | 'errorDrill'

export interface StoredQuestion {
  display: string
  correctAnswer: number
  operation: Operation
}

export interface BotConfig {
  id: string
  name: string
  avatar: string
  accuracy: number
}

export interface GameConfig {
  mode: GameMode
  levelId: number
  totalQuestions: number
  timePerQuestion?: number
  livesCount?: number
  multiplier: number
  isDaily?: boolean
  practiceOperation?: Operation
  bot?: BotConfig
  duelPlayer2Id?: string
}

export interface WrongAnswer {
  display: string
  correctAnswer: number
  userAnswer: string
}

export interface RecentGame {
  mode: GameMode
  berriesEarned: number
  correct: number
  attempted: number
  accuracy: number
  date: string
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
  achievements: string[]
  recentGames: RecentGame[]
  createdAt: string
  lastDailyDate?: string
  dailyStreak?: number
  operationStats?: Partial<Record<Operation, { correct: number; attempted: number }>>
  ownedAvatars?: string[]
  activityDates?: string[]
  wrongQuestions?: StoredQuestion[]
  hasSeenTutorial?: boolean
}

export interface BotSnap {
  name: string
  avatar: string
  correct: number
  attempted: number
}

export interface DuelP1Snap {
  profileId: string
  profileName: string
  profileAvatar: string
  correct: number
  attempted: number
  berriesEarned: number
  maxStreak: number
}

export interface OperationEntry {
  operation: Operation
  correct: boolean
}

export interface GameResult {
  berriesEarned: number
  correct: number
  attempted: number
  maxStreak: number
  accuracy: number
  mode: GameMode
  isDaily?: boolean
  botSnap?: BotSnap
  duelP1Snap?: DuelP1Snap
}
