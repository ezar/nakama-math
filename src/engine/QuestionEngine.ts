import type { LevelConfig, Operation, Question } from './types'
import type { RNG } from './seededRandom'

const OP_CHARS = ['🏴‍☠️', '⚔️', '🌊', '💀', '🔥', '⚓', '🐉', '🦁', '⚡', '🗡️']

function rnd(min: number, max: number, rng: RNG): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[], rng: RNG): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickOperation(ops: Operation[], rng: RNG): Operation {
  return ops[Math.floor(rng() * ops.length)]
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function pickOperands(op: Operation, c: LevelConfig['constraints'], rng: RNG): [number, number] {
  const mulMax = c.mulMaxB ?? c.maxB
  switch (op) {
    case 'add':
      return [rnd(1, c.maxA, rng), rnd(1, c.maxB, rng)]
    case 'sub': {
      const b = rnd(1, c.maxB, rng)
      const a = rnd(b, c.maxA, rng)
      return [a, b]
    }
    case 'mul':
      return [rnd(2, Math.min(c.maxA, 12), rng), rnd(2, Math.min(mulMax, 12), rng)]
    case 'div': {
      const b = rnd(2, Math.min(c.maxB, 12), rng)
      const quotient = rnd(1, Math.max(1, Math.floor(c.maxA / b)), rng)
      return [b * quotient, b]
    }
    case 'frac': {
      const dens = c.fracDenominators ?? [2, 4]
      const den = dens[rnd(0, dens.length - 1, rng)]
      const num = rnd(1, den - 1, rng)
      const factor = den / gcd(num, den)
      const maxWhole = Math.max(factor, Math.floor(c.maxA / factor)) * factor
      const whole = rnd(1, Math.max(1, Math.floor(maxWhole / factor)), rng) * factor
      return [whole * 1000 + num, den]
    }
    case 'pct': {
      const vals = c.pctValues ?? [10, 25, 50]
      const pct = vals[rnd(0, vals.length - 1, rng)]
      const factor = 100 / gcd(pct, 100)
      const maxMult = Math.max(1, Math.floor(c.maxA / factor))
      const base = rnd(1, maxMult, rng) * factor
      return [base, pct]
    }
    case 'exp': {
      const expMax = c.expMax ?? 3
      const exp = rnd(2, expMax, rng)
      const maxBase = Math.min(c.maxB, exp === 2 ? 20 : exp === 3 ? 10 : 5)
      const base = rnd(2, Math.max(2, maxBase), rng)
      return [base, exp]
    }
  }
}

export function compute(op: Operation, a: number, b: number): number {
  switch (op) {
    case 'add': return a + b
    case 'sub': return a - b
    case 'mul': return a * b
    case 'div': return a / b
    case 'frac': {
      const whole = Math.floor(a / 1000)
      const num = a % 1000
      return (whole * num) / b
    }
    case 'pct': return Math.round((a * b) / 100)
    case 'exp': return Math.pow(a, b)
  }
}

function buildDisplay(op: Operation, a: number, b: number): string {
  if (op === 'pct') return `${b}% de ${a} = ?`
  if (op === 'exp') return `${a}${b === 2 ? '²' : b === 3 ? '³' : `^${b}`} = ?`
  if (op === 'frac') {
    const whole = Math.floor(a / 1000)
    const num = a % 1000
    const fracStr = num === 1 ? `1/${b}` : `${num}/${b}`
    return `${fracStr} de ${whole} = ?`
  }
  const symbols: Record<string, string> = { add: '+', sub: '−', mul: '×', div: '÷' }
  return `${a} ${symbols[op]} ${b} = ?`
}

function generateDecoys(op: Operation, a: number, b: number, correct: number, rng: RNG): number[] {
  const candidates = new Set<number>()

  const add = (n: number) => {
    const rounded = Math.round(n)
    if (rounded !== correct && rounded >= 0) candidates.add(rounded)
  }

  add(correct + 1); add(correct - 1); add(correct + 10); add(correct - 10)

  switch (op) {
    case 'add': case 'sub':
      add(a + 1 + b); add(a - 1 + b); add(a * b)
      break
    case 'mul':
      add(a + b); add(a * (b + 1)); add(a * (b - 1)); add((a + 1) * b)
      break
    case 'div':
      add(b); add(a - b); add(correct + b); add(correct - b)
      break
    case 'frac': {
      const whole = Math.floor(a / 1000)
      add(whole); add(correct * b); add(correct + b); add(correct * 2)
      break
    }
    case 'pct':
      add(Math.round(a * b / 10)); add(a * b); add(b); add(correct * 2)
      break
    case 'exp':
      add(a * b); add(a + b); add(correct + a); add(correct - a)
      break
  }

  const result = Array.from(candidates).filter(n => n !== correct && n >= 0)

  let attempts = 0
  while (result.length < 3 && attempts < 100) {
    attempts++
    const spread = Math.max(5, Math.ceil(correct * 0.3))
    const noise = rnd(-spread, spread, rng)
    if (noise === 0) continue
    const candidate = correct + noise
    if (candidate !== correct && candidate >= 0 && !result.includes(candidate)) {
      result.push(Math.round(candidate))
    }
  }

  return result.slice(0, 3)
}

export function generateQuestion(config: LevelConfig, rng: RNG = Math.random): Question {
  const op = pickOperation(config.operations, rng)
  const [a, b] = pickOperands(op, config.constraints, rng)
  const correct = compute(op, a, b)

  if (config.constraints.requireIntegerResults && !Number.isInteger(correct)) {
    return generateQuestion(config, rng)
  }
  if (!config.constraints.allowNegativeResults && correct < 0) {
    return generateQuestion(config, rng)
  }

  const decoys = generateDecoys(op, a, b, correct, rng)
  const uniqueDecoys = Array.from(new Set(decoys.filter(d => d !== correct)))
  while (uniqueDecoys.length < 3) {
    let candidate = correct + rnd(1, 10, rng)
    if (uniqueDecoys.includes(candidate) || candidate === correct) {
      candidate = correct + rnd(-15, -1, rng)
    }
    if (candidate >= 0 && candidate !== correct && !uniqueDecoys.includes(candidate)) {
      uniqueDecoys.push(candidate)
    }
  }

  const allAnswers = shuffle([String(correct), ...uniqueDecoys.slice(0, 3).map(String)], rng)

  return {
    id: crypto.randomUUID(),
    display: buildDisplay(op, a, b),
    operands: [a, b],
    operation: op,
    correctAnswer: correct,
    allAnswers,
    pointValue: config.berriesPerCorrect,
    opChar: OP_CHARS[Math.floor(rng() * OP_CHARS.length)],
  }
}
