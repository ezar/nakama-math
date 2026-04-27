import { motion } from 'framer-motion'
import type { Profile } from '../engine/types'
import { RankBadge } from './RankBadge'
import { useTranslation } from '../i18n/useTranslation'

interface ProfileCardProps {
  profile: Profile
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}

export function ProfileCard({ profile, selected, onSelect, onDelete }: ProfileCardProps) {
  const t = useTranslation()
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
        selected
          ? 'border-gold-400 bg-navy-700 shadow-lg shadow-gold-400/20'
          : 'border-navy-600 bg-navy-800 hover:border-navy-500'
      }`}
    >
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        aria-label={t.deletePirateConfirm(profile.name)}
        className="absolute top-2 right-2 text-xs text-gray-500 hover:text-pirate-red transition-colors leading-none"
      >
        ✕
      </button>
      <span className="text-4xl">{profile.avatar}</span>
      <p className="font-nunito font-bold text-white text-sm truncate max-w-full">{profile.name}</p>
      <RankBadge berries={profile.berries} />
      <p className="font-nunito text-xs text-gold-400">🪙 {profile.berries.toLocaleString()}</p>
    </motion.div>
  )
}
