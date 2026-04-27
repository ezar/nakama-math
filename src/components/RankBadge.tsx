import { getRankIndex } from '../utils/rankSystem'
import { useTranslation } from '../i18n/useTranslation'

const RANK_COLORS = [
  'bg-slate-600',
  'bg-blue-700',
  'bg-emerald-700',
  'bg-violet-700',
  'bg-amber-600',
  'bg-orange-600',
  'bg-red-700',
  'bg-gold-500',
]

interface RankBadgeProps {
  berries: number
  className?: string
}

export function RankBadge({ berries, className = '' }: RankBadgeProps) {
  const t = useTranslation()
  const idx = getRankIndex(berries)
  const color = RANK_COLORS[idx] ?? RANK_COLORS[0]
  return (
    <span className={`font-bangers text-sm px-2 py-0.5 rounded-md text-white ${color} ${className}`}>
      {t.ranks[idx]}
    </span>
  )
}
