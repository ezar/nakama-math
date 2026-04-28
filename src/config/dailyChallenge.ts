import { createSeededRng, todaySeed, todayDateString } from '../engine/seededRandom'
import { generateQuestion } from '../engine/QuestionEngine'
import { LEVELS } from './levels'

const DAILY_LEVEL = LEVELS[0] // level 1: add/sub up to 10 — same for everyone
const DAILY_QUESTIONS = 5
const DAILY_MULTIPLIER = 3

export function getDailyQuestions() {
  const rng = createSeededRng(todaySeed())
  return Array.from({ length: DAILY_QUESTIONS }, () => generateQuestion(DAILY_LEVEL, rng))
}

export { DAILY_MULTIPLIER, DAILY_QUESTIONS, todayDateString }
