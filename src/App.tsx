import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IntroScreen } from './screens/IntroScreen'
import { HubScreen } from './screens/HubScreen'
import { GameScreen } from './screens/GameScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { RankingScreen } from './screens/RankingScreen'
import { Footer } from './components/Footer'

type Screen = 'intro' | 'hub' | 'game' | 'results' | 'ranking'

const screenVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro')

  return (
    <div className="h-screen overflow-hidden bg-navy-900 text-white font-nunito flex flex-col">
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
        </motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
