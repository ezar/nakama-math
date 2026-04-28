import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'
import type { GameConfig, Question } from '../engine/types'

function makeConfig(mode: 'normal' | 'speed' | 'survival' | 'blitz' = 'normal'): GameConfig {
  return { mode, levelId: 1, totalQuestions: 10, multiplier: 1, livesCount: 3 }
}

function makeQuestion(answer: number, pointValue = 10): Question {
  return {
    id: String(Math.random()),
    display: `? = ${answer}`,
    operands: [answer],
    operation: 'add',
    correctAnswer: answer,
    allAnswers: [String(answer), String(answer + 1), String(answer + 2), String(answer + 3)],
    pointValue,
    opChar: '+',
  }
}

beforeEach(() => {
  useGameStore.setState({
    config: null, questions: [], currentIndex: 0,
    correct: 0, attempted: 0, streak: 0, maxStreak: 0,
    lives: 3, berriesEarned: 0, isFinished: false, lastResult: null,
  })
})

describe('gameStore — startGame', () => {
  it('resets all counters on start', () => {
    const q = makeQuestion(5)
    useGameStore.getState().startGame(makeConfig(), [q])
    const s = useGameStore.getState()
    expect(s.correct).toBe(0)
    expect(s.attempted).toBe(0)
    expect(s.streak).toBe(0)
    expect(s.berriesEarned).toBe(0)
    expect(s.isFinished).toBe(false)
    expect(s.lives).toBe(3)
  })

  it('sets lives from config.livesCount', () => {
    useGameStore.getState().startGame({ ...makeConfig('speed'), livesCount: 1 }, [makeQuestion(1)])
    expect(useGameStore.getState().lives).toBe(1)
  })
})

describe('gameStore — answerQuestion', () => {
  it('increments correct + streak on correct answer', () => {
    useGameStore.getState().startGame(makeConfig(), [makeQuestion(5)])
    useGameStore.getState().answerQuestion(true, 10)
    const s = useGameStore.getState()
    expect(s.correct).toBe(1)
    expect(s.attempted).toBe(1)
    expect(s.streak).toBe(1)
    expect(s.berriesEarned).toBe(10)
  })

  it('resets streak on wrong answer and earns 0 berries', () => {
    useGameStore.getState().startGame(makeConfig(), [makeQuestion(5)])
    useGameStore.getState().answerQuestion(true, 10)  // streak = 1
    useGameStore.getState().answerQuestion(false, 10)
    const s = useGameStore.getState()
    expect(s.streak).toBe(0)
    expect(s.correct).toBe(1)
    expect(s.attempted).toBe(2)
    expect(s.berriesEarned).toBe(10) // no extra berries for wrong
  })

  it('applies ×1.2 multiplier at streak 3', () => {
    useGameStore.getState().startGame(makeConfig(), [])
    useGameStore.getState().answerQuestion(true, 10) // streak 1
    useGameStore.getState().answerQuestion(true, 10) // streak 2
    useGameStore.getState().answerQuestion(true, 10) // streak 3 → ×1.2
    expect(useGameStore.getState().berriesEarned).toBe(10 + 10 + 12)
  })

  it('applies ×2 multiplier at streak 5', () => {
    useGameStore.getState().startGame(makeConfig(), [])
    for (let i = 0; i < 5; i++) useGameStore.getState().answerQuestion(true, 10)
    // streak 1,2: ×1; streak 3,4: ×1.2; streak 5: ×2
    expect(useGameStore.getState().berriesEarned).toBe(10 + 10 + 12 + 12 + 20)
  })

  it('applies ×3 multiplier at streak 10', () => {
    useGameStore.getState().startGame(makeConfig(), [])
    for (let i = 0; i < 10; i++) useGameStore.getState().answerQuestion(true, 10)
    const earned = useGameStore.getState().berriesEarned
    // last answer should be ×3 = 30
    expect(earned).toBeGreaterThanOrEqual(30)
  })

  it('tracks maxStreak correctly', () => {
    useGameStore.getState().startGame(makeConfig(), [])
    useGameStore.getState().answerQuestion(true, 10)
    useGameStore.getState().answerQuestion(true, 10)
    useGameStore.getState().answerQuestion(true, 10) // streak 3
    useGameStore.getState().answerQuestion(false, 10) // break streak
    expect(useGameStore.getState().maxStreak).toBe(3)
    expect(useGameStore.getState().streak).toBe(0)
  })

  it('honors baseMultiplier from config', () => {
    useGameStore.getState().startGame({ ...makeConfig('blitz'), multiplier: 2 }, [])
    useGameStore.getState().answerQuestion(true, 10)
    expect(useGameStore.getState().berriesEarned).toBe(20) // 10 × 2
  })
})

describe('gameStore — finishGame', () => {
  it('calculates accuracy correctly', () => {
    useGameStore.getState().startGame(makeConfig(), [])
    useGameStore.getState().answerQuestion(true, 10)
    useGameStore.getState().answerQuestion(true, 10)
    useGameStore.getState().answerQuestion(false, 10)
    useGameStore.getState().answerQuestion(false, 10)
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().lastResult?.accuracy).toBe(50)
  })

  it('produces 0% accuracy when no attempts', () => {
    useGameStore.getState().startGame(makeConfig(), [])
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().lastResult?.accuracy).toBe(0)
  })

  it('sets isFinished to true', () => {
    useGameStore.getState().startGame(makeConfig(), [])
    useGameStore.getState().finishGame()
    expect(useGameStore.getState().isFinished).toBe(true)
  })
})

describe('gameStore — loseLife', () => {
  it('decrements lives and resets streak', () => {
    useGameStore.getState().startGame(makeConfig(), [])
    useGameStore.getState().answerQuestion(true, 10) // streak 1
    useGameStore.getState().loseLife()
    expect(useGameStore.getState().lives).toBe(2)
    expect(useGameStore.getState().streak).toBe(0)
  })
})
