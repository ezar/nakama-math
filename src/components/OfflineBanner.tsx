import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

export function OfflineBanner() {
  const online = useOnline()
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-safe"
        >
          <div className="mt-2 px-4 py-1.5 bg-navy-700 border border-navy-500 rounded-full shadow-lg">
            <p className="font-nunito text-xs text-gray-400">📵 Sin conexión · modo offline</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
