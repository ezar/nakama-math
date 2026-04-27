import { motion, AnimatePresence } from 'framer-motion'

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 2) return null
  const color = streak >= 10 ? 'text-red-400' : streak >= 5 ? 'text-orange-400' : 'text-yellow-400'
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={streak}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className={`flex items-center gap-1 font-bangers text-2xl ${color}`}
      >
        🔥 {streak}
      </motion.div>
    </AnimatePresence>
  )
}
