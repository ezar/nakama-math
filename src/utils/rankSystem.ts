import { LEVELS } from '../config/levels'

export function getRankIndex(berries: number): number {
  let rank = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (berries >= LEVELS[i].xpToUnlock) rank = i
  }
  return rank
}

export function getRankName(berries: number, ranks: string[]): string {
  return ranks[getRankIndex(berries)] ?? ranks[0]
}

export function getNextRankBerries(berries: number): number | null {
  for (const level of LEVELS) {
    if (level.xpToUnlock > berries) return level.xpToUnlock
  }
  return null
}
