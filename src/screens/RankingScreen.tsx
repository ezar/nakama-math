import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProfileStore } from '../store/profileStore'
import { useTranslation } from '../i18n/useTranslation'
import { RankBadge } from '../components/RankBadge'
import type { Profile } from '../engine/types'

type Tab = 'berries' | 'correct' | 'streak'

interface RankingScreenProps {
  onBack: () => void
}

export function RankingScreen({ onBack }: RankingScreenProps) {
  const t = useTranslation()
  const { profiles } = useProfileStore()
  const [tab, setTab] = useState<Tab>('berries')

  function getSorted(): Profile[] {
    return [...profiles].sort((a, b) => {
      if (tab === 'berries') return b.berries - a.berries
      if (tab === 'correct') {
        const rA = a.stats.totalAttempted >= 10
          ? a.stats.totalCorrect / a.stats.totalAttempted : -1
        const rB = b.stats.totalAttempted >= 10
          ? b.stats.totalCorrect / b.stats.totalAttempted : -1
        return rB - rA
      }
      return b.stats.bestStreak - a.stats.bestStreak
    })
  }

  const sorted = getSorted()
  const tabs: { key: Tab; label: string }[] = [
    { key: 'berries', label: t.berriesTab },
    { key: 'correct', label: t.correctTab },
    { key: 'streak', label: t.streakTab },
  ]

  function getValue(p: Profile): string {
    if (tab === 'berries') return `🪙 ${p.berries.toLocaleString()}`
    if (tab === 'correct') {
      if (p.stats.totalAttempted < 10) return '—'
      return `${Math.round((p.stats.totalCorrect / p.stats.totalAttempted) * 100)}%`
    }
    return `🔥 ${p.stats.bestStreak}`
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white font-nunito text-xl transition-colors"
          >
            ←
          </button>
          <h1 className="font-bangers text-4xl text-gold-400 tracking-widest">{t.rankingTitle}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex-1 py-2 rounded-xl font-nunito font-bold text-sm transition-colors ${
                tab === tb.key ? 'bg-gold-400 text-navy-900' : 'bg-navy-700 text-gray-400 hover:text-white'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* List */}
        {sorted.length === 0 ? (
          <p className="text-center font-nunito text-gray-500 mt-10">{t.noPiratesYet}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-navy-700 rounded-2xl p-4 border border-navy-600"
              >
                <span className={`font-bangers text-2xl w-8 text-center ${i === 0 ? 'text-gold-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                <span className="text-3xl">{p.avatar}</span>
                <div className="flex-1">
                  <p className="font-nunito font-bold text-white">{p.name}</p>
                  <RankBadge berries={p.berries} />
                </div>
                <p className="font-bangers text-xl text-gold-400">{getValue(p)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
