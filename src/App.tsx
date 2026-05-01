import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IntroScreen } from './screens/IntroScreen'
import { HubScreen } from './screens/HubScreen'
import { GameScreen } from './screens/GameScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { RankingScreen } from './screens/RankingScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SplashScreen } from './screens/SplashScreen'
import { Footer } from './components/Footer'
import { OfflineBanner } from './components/OfflineBanner'
import { UpdateBanner } from './components/UpdateBanner'

type Screen = 'intro' | 'hub' | 'game' | 'results' | 'ranking' | 'settings'

const screenVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [splashDone, setSplashDone] = useState(false)
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const reloadRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    import('virtual:pwa-register').then(({ registerSW }) => {
      const update = registerSW({
        onNeedRefresh() { setNeedsUpdate(true) },
        onOfflineReady() {},
        immediate: false,
      })
      reloadRef.current = () => update(true)
    })
  }, [])

  return (
    <div className="h-dvh overflow-hidden bg-navy-900 text-white font-nunito flex flex-col safe-top safe-left safe-right md:w-[500px] md:mx-auto md:shadow-[4px_0_40px_rgba(0,0,0,0.6),-4px_0_40px_rgba(0,0,0,0.6)]">
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <OfflineBanner />
      {needsUpdate && <UpdateBanner onUpdate={() => reloadRef.current?.()} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="flex-1 min-h-0 overflow-hidden"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {screen === 'intro' && (
            <IntroScreen
              onStart={() => setScreen('hub')}
              onRanking={() => setScreen('ranking')}
            />
          )}
          {screen === 'hub' && (
            <HubScreen
              onPlay={() => setScreen('game')}
              onBack={() => setScreen('intro')}
              onSettings={() => setScreen('settings')}
            />
          )}
          {screen === 'game' && (
            <GameScreen
              onFinish={() => setScreen('results')}
              onExit={() => setScreen('hub')}
            />
          )}
          {screen === 'results' && (
            <ResultsScreen
              onPlayAgain={() => setScreen('hub')}
              onBack={() => setScreen('hub')}
            />
          )}
          {screen === 'ranking' && (
            <RankingScreen
              onBack={() => setScreen('intro')}
            />
          )}
          {screen === 'settings' && (
            <SettingsScreen
              onBack={() => setScreen('hub')}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
