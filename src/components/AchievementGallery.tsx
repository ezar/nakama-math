import { motion, AnimatePresence } from 'framer-motion'
import { ACHIEVEMENTS, achievementNames } from '../config/achievements'
import type { Locale } from '../i18n/translations'

interface AchievementGalleryProps {
  unlockedIds: string[]
  locale: Locale
  onClose: () => void
}

export function AchievementGallery({ unlockedIds, locale, onClose }: AchievementGalleryProps) {
  const unlocked = unlockedIds ?? []
  const total = ACHIEVEMENTS.length
  const count = unlocked.length

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          onClick={e => e.stopPropagation()}
          className="bg-navy-800 rounded-3xl p-4 w-full max-w-sm border border-navy-600 shadow-2xl max-h-[80vh] flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-bangers text-xl text-gold-400 tracking-widest">🏆 LOGROS</p>
            <span className="font-nunito text-xs text-gray-400">{count} / {total}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(count / total) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="overflow-y-auto flex flex-col gap-2 pr-1">
            {ACHIEVEMENTS.map((a, i) => {
              const done = unlocked.includes(a.id)
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-2xl border ${
                    done
                      ? 'bg-purple-500/15 border-purple-500/40'
                      : 'bg-navy-700/50 border-navy-600/50'
                  }`}
                >
                  <span className={`text-2xl ${done ? '' : 'grayscale opacity-30'}`}>{a.icon}</span>
                  <p className={`font-nunito text-sm font-bold ${done ? 'text-white' : 'text-gray-600'}`}>
                    {achievementNames[a.nameKey][locale]}
                  </p>
                  {done && <span className="ml-auto text-purple-400 text-xs">✓</span>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
