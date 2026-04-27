import { motion, AnimatePresence } from 'framer-motion'

interface StreakBadgeProps {
  streak: number
  baseMultiplier?: number
}

function streakMultiplier(streak: number, base: number): number {
  if (streak >= 10) return base * 3
  if (streak >= 5)  return base * 2
  if (streak >= 3)  return base * 1.2
  return base
}

export function StreakBadge({ streak, baseMultiplier = 1 }: StreakBadgeProps) {
  if (streak < 2) return null
  const color = streak >= 10 ? 'text-red-400' : streak >= 5 ? 'text-orange-400' : 'text-yellow-400'
  const mult = streakMultiplier(streak, baseMultiplier)
  const showMult = mult > 1

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={streak}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className={`flex items-center gap-1 font-bangers ${color}`}
      >
        <span className="text-2xl">🔥 {streak}</span>
        {showMult && (
          <motion.span
            key={mult}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-sm bg-white/10 rounded-lg px-1.5 py-0.5 leading-none"
          >
            ×{mult % 1 === 0 ? mult : mult.toFixed(1)}
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
