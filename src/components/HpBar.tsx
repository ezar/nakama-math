import { motion } from 'framer-motion'

interface HpBarProps {
  current: number
  max: number
}

export function HpBar({ current, max }: HpBarProps) {
  const pct = max > 0 ? (current / max) * 100 : 0
  const color = pct > 60 ? 'bg-emerald-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: max }).map((_, i) => (
        <motion.span
          key={i}
          animate={{ scale: i < current ? 1 : 0.7, opacity: i < current ? 1 : 0.3 }}
          className={`text-xl ${i < current ? '' : 'grayscale'}`}
        >
          ❤️
        </motion.span>
      ))}
      <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
      </div>
    </div>
  )
}
