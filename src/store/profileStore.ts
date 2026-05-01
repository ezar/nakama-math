import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, RecentGame, Operation, OperationEntry, StoredQuestion } from '../engine/types'

interface ProfileStore {
  profiles: Profile[]
  currentProfileId: string | null
  createProfile: (name: string, avatar: string) => void
  deleteProfile: (id: string) => void
  selectProfile: (id: string) => void
  addBerries: (id: string, amount: number) => void
  spendBerries: (id: string, amount: number) => boolean
  updateStats: (id: string, correct: number, attempted: number, streak: number) => void
  updateOperationStats: (id: string, log: OperationEntry[]) => void
  unlockAchievement: (id: string, achievementId: string) => boolean
  addRecentGame: (id: string, game: RecentGame) => void
  completeDailyChallenge: (id: string, todayStr: string, yesterdayStr: string) => void
  changeAvatar: (id: string, avatar: string) => void
  addOwnedAvatar: (id: string, avatar: string) => void
  addWrongQuestions: (id: string, questions: StoredQuestion[]) => void
  markTutorialSeen: (id: string) => void
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

      spendBerries: (id, amount) => {
        const profile = get().profiles.find(p => p.id === id)
        if (!profile || profile.berries < amount) return false
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === id ? { ...p, berries: p.berries - amount } : p
          ),
        }))
        return true
      },

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

      updateOperationStats: (id, log) => set(state => ({
        profiles: state.profiles.map(p => {
          if (p.id !== id) return p
          const stats = { ...(p.operationStats ?? {}) } as Partial<Record<Operation, { correct: number; attempted: number }>>
          for (const entry of log) {
            const prev = stats[entry.operation] ?? { correct: 0, attempted: 0 }
            stats[entry.operation] = {
              correct: prev.correct + (entry.correct ? 1 : 0),
              attempted: prev.attempted + 1,
            }
          }
          return { ...p, operationStats: stats }
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
          const today = game.date.slice(0, 10)
          const dates = [today, ...(p.activityDates ?? []).filter(d => d !== today)].slice(0, 90)
          return { ...p, recentGames: updated, activityDates: dates }
        }),
      })),

      completeDailyChallenge: (id, todayStr, yesterdayStr) => set(state => ({
        profiles: state.profiles.map(p => {
          if (p.id !== id) return p
          const prevDate = p.lastDailyDate ?? ''
          const prevStreak = p.dailyStreak ?? 0
          const newStreak = prevDate === yesterdayStr ? prevStreak + 1 : 1
          return { ...p, lastDailyDate: todayStr, dailyStreak: newStreak }
        }),
      })),

      changeAvatar: (id, avatar) => set(state => ({
        profiles: state.profiles.map(p =>
          p.id === id ? { ...p, avatar } : p
        ),
      })),

      addOwnedAvatar: (id, avatar) => set(state => ({
        profiles: state.profiles.map(p =>
          p.id === id ? { ...p, ownedAvatars: [...(p.ownedAvatars ?? []), avatar] } : p
        ),
      })),

      addWrongQuestions: (id, questions) => set(state => ({
        profiles: state.profiles.map(p => {
          if (p.id !== id) return p
          const existing = p.wrongQuestions ?? []
          const deduped = [...questions, ...existing]
            .filter((q, i, arr) => arr.findIndex(x => x.display === q.display) === i)
            .slice(0, 50)
          return { ...p, wrongQuestions: deduped }
        }),
      })),

      markTutorialSeen: (id) => set(state => ({
        profiles: state.profiles.map(p =>
          p.id === id ? { ...p, hasSeenTutorial: true } : p
        ),
      })),

      currentProfile: () => {
        const { profiles, currentProfileId } = get()
        return profiles.find(p => p.id === currentProfileId) ?? null
      },
    }),
    { name: 'math-pirates-profiles' }
  )
)
