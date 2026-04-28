export type RNG = () => number

export function createSeededRng(seed: number): RNG {
  let s = seed >>> 0
  return function (): number {
    s = (s + 0x6D2B79F5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function todaySeed(): number {
  const [y, m, d] = todayDateString().split('-').map(Number)
  return y * 10000 + m * 100 + d
}

export function yesterdayDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}
