import { motion, AnimatePresence } from 'framer-motion'

interface UpdateBannerProps {
  onUpdate: () => void
}

export function UpdateBanner({ onUpdate }: UpdateBannerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-4"
      >
        <div className="flex items-center gap-3 bg-navy-700 border border-gold-400/40 rounded-2xl px-4 py-3 shadow-2xl max-w-sm w-full">
          <span className="text-xl">🆕</span>
          <p className="font-nunito text-sm text-white flex-1">Nueva versión disponible</p>
          <button
            onClick={onUpdate}
            className="font-nunito font-bold text-xs bg-gold-400 text-navy-900 px-3 py-1.5 rounded-xl hover:bg-gold-500 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
