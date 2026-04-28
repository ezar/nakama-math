import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, RecentGame } from '../engine/types'

interface ProfileStore {
  profiles: Profile[]
  currentProfileId: string | null
  createProfile: (name: string, avatar: string) => void
  deleteProfile: (id: string) => void
  selectProfile: (id: string) => void
  addBerries: (id: string, amount: number) => void
  updateStats: (id: string, correct: number, attempted: number, streak: number) => void
  unlockAchievement: (id: string, achievementId: string) => boolean
  addRecentGame: (id: string, game: RecentGame) => void
  currentProfile: () => Profile | null
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      currentProfileId: null,

      createProfile: (name, avatar) => set(state => {
        if (state.profiles.length >= 6) return state
        return {
          profiles: [...state.profiles, {
            id: crypto.randomUUID(),
            name,
            avatar,
            berries: 0,
            stats: { totalCorrect: 0, totalAttempted: 0, bestStreak: 0, gamesPlayed: 0 },
            achievements: [],
            recentGames: [],
            createdAt: new Date().toISOString(),
          }],
        }
      }),

      deleteProfile: (id) => set(state => ({
        profiles: state.profiles.filter(p => p.id !== id),
        currentProfileId: state.currentProfileId === id ? null : state.currentProfileId,
      })),

      selectProfile: (id) => set({ currentProfileId: id }),

      addBerries: (id, amount) => set(state => ({
        profiles: state.profiles.map(p =>
          p.id === id ? { ...p, berries: p.berries + amount } : p
        ),
      })),

      updateStats: (id, correct, attempted, streak) => set(state => ({
        profiles: state.profiles.map(p => {
          if (p.id !== id) return p
          return {
            ...p,
            stats: {
              totalCorrect: p.stats.totalCorrect + correct,
              totalAttempted: p.stats.totalAttempted + attempted,
              bestStreak: Math.max(p.stats.bestStreak, streak),
              gamesPlayed: p.stats.gamesPlayed + 1,
            },
          }
        }),
      })),

      unlockAchievement: (id, achievementId) => {
        const profile = get().profiles.find(p => p.id === id)
        if (!profile || (profile.achievements ?? []).includes(achievementId)) return false
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === id ? { ...p, achievements: [...(p.achievements ?? []), achievementId] } : p
          ),
        }))
        return true
      },

      addRecentGame: (id, game) => set(state => ({
        profiles: state.profiles.map(p => {
          if (p.id !== id) return p
          const updated = [game, ...(p.recentGames ?? [])].slice(0, 10)
          return { ...p, recentGames: updated }
        }),
      })),

      currentProfile: () => {
        const { profiles, currentProfileId } = get()
        return profiles.find(p => p.id === currentProfileId) ?? null
      },
    }),
    { name: 'math-pirates-profiles' }
  )
)
