import type { LevelConfig, Operation, Question } from './types'

const OP_CHARS = ['🏴‍☠️', '⚔️', '🌊', '💀', '🔥', '⚓', '🐉', '🦁', '⚡', '🗡️']

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickOperation(ops: Operation[]): Operation {
  return ops[Math.floor(Math.random() * ops.length)]
}

function pickOperands(op: Operation, c: LevelConfig['constraints']): [number, number] {
  const mulMax = c.mulMaxB ?? c.maxB
  switch (op) {
    case 'add':
      return [rnd(1, c.maxA), rnd(1, c.maxB)]
    case 'sub': {
      const b = rnd(1, c.maxB)
      const a = rnd(b, c.maxA)
      return [a, b]
    }
    case 'mul':
      return [rnd(2, Math.min(c.maxA, 12)), rnd(2, Math.min(mulMax, 12))]
    case 'div': {
      const b = rnd(2, Math.min(c.maxB, 12))
      const quotient = rnd(1, Math.max(1, Math.floor(c.maxA / b)))
      return [b * quotient, b]
    }
    case 'frac': {
      const dens = c.fracDenominators ?? [2, 4]
      const den = dens[rnd(0, dens.length - 1)]
      // pick a whole number that is a multiple of den so result is integer
      const maxMultiple = Math.max(1, Math.floor(c.maxA / den))
      const whole = rnd(1, maxMultiple) * den
      return [whole, den]
    }
    case 'pct': {
      const vals = c.pctValues ?? [10, 25, 50]
      const pct = vals[rnd(0, vals.length - 1)]
      // base must give integer result: base * pct / 100 = integer
      // so base must be multiple of (100/gcd(pct,100))
      const factor = 100 / gcd(pct, 100)
      const maxMult = Math.max(1, Math.floor(c.maxA / factor))
      const base = rnd(1, maxMult) * factor
      return [base, pct]
    }
    case 'exp': {
      const expMax = c.expMax ?? 3
      const exp = rnd(2, expMax)
      // limit base so result stays reasonable
      const maxBase = Math.min(c.maxB, exp === 2 ? 20 : exp === 3 ? 10 : 5)
      const base = rnd(2, Math.max(2, maxBase))
      return [base, exp]
    }
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function compute(op: Operation, a: number, b: number): number {
  switch (op) {
    case 'add': return a + b
    case 'sub': return a - b
    case 'mul': return a * b
    case 'div': return a / b
    case 'frac': return Math.round((a / b))
    case 'pct': return Math.round((a * b) / 100)
    case 'exp': return Math.pow(a, b)
  }
}

function buildDisplay(op: Operation, a: number, b: number): string {
  if (op === 'pct') return `${b}% de ${a} = ?`
  if (op === 'exp') return `${a}${b === 2 ? '²' : b === 3 ? '³' : `^${b}`} = ?`
  if (op === 'frac') return `${a} ÷ ${b} = ?`
  const symbols: Record<string, string> = { add: '+', sub: '−', mul: '×', div: '÷' }
  return `${a} ${symbols[op]} ${b} = ?`
}

function generateDecoys(op: Operation, a: number, b: number, correct: number): number[] {
  const candidates = new Set<number>()

  const add = (n: number) => {
    const rounded = Math.round(n)
    if (rounded !== correct && rounded >= 0) candidates.add(rounded)
  }

  add(correct + 1)
  add(correct - 1)
  add(correct + 10)
  add(correct - 10)

  switch (op) {
    case 'add':
    case 'sub':
      add(a + 1 + b)
      add(a - 1 + b)
      add(a * b)
      break
    case 'mul':
      add(a + b)
      add(a * (b + 1))
      add(a * (b - 1))
      add((a + 1) * b)
      break
    case 'div':
      add(b)
      add(a - b)
      add(correct + b)
      add(correct - b)
      break
    case 'frac':
      add(a)
      add(b)
      add(correct + b)
      add(correct * 2)
      break
    case 'pct':
      add(Math.round(a * b / 10))
      add(a * b)
      add(b)
      add(correct * 2)
      break
    case 'exp':
      add(a * b)
      add(a + b)
      add(correct + a)
      add(correct - a)
      break
  }

  const result = Array.from(candidates).filter(n => n !== correct && n >= 0)

  // Fill up to 3 if needed
  let attempts = 0
  while (result.length < 3 && attempts < 100) {
    attempts++
    const spread = Math.max(5, Math.ceil(correct * 0.3))
    const noise = rnd(-spread, spread)
    if (noise === 0) continue
    const candidate = correct + noise
    if (candidate !== correct && candidate >= 0 && !result.includes(candidate)) {
      result.push(Math.round(candidate))
    }
  }

  return result.slice(0, 3)
}

export function generateQuestion(config: LevelConfig): Question {
  const op = pickOperation(config.operations)
  const [a, b] = pickOperands(op, config.constraints)
  const correct = compute(op, a, b)

  if (config.constraints.requireIntegerResults && !Number.isInteger(correct)) {
    return generateQuestion(config)
  }
  if (!config.constraints.allowNegativeResults && correct < 0) {
    return generateQuestion(config)
  }

  const decoys = generateDecoys(op, a, b, correct)

  // Ensure exactly 3 unique decoys different from correct
  const uniqueDecoys = Array.from(new Set(decoys.filter(d => d !== correct)))
  while (uniqueDecoys.length < 3) {
    let candidate = correct + rnd(1, 10)
    if (uniqueDecoys.includes(candidate) || candidate === correct) {
      candidate = correct + rnd(-15, -1)
    }
    if (candidate >= 0 && candidate !== correct && !uniqueDecoys.includes(candidate)) {
      uniqueDecoys.push(candidate)
    }
  }

  const allAnswers = shuffle([String(correct), ...uniqueDecoys.slice(0, 3).map(String)])

  return {
    id: crypto.randomUUID(),
    display: buildDisplay(op, a, b),
    operands: [a, b],
    operation: op,
    correctAnswer: correct,
    allAnswers,
    pointValue: config.berriesPerCorrect,
    opChar: OP_CHARS[Math.floor(Math.random() * OP_CHARS.length)],
  }
}
