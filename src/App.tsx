import { useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'

export default function App() {
  const { state, startGame, resetGame, humanRoll, aiTakeTurn, dispatch } = useGameState()

  const handleAITurn = useCallback((playerIndex: number) => {
    aiTakeTurn(playerIndex)
  }, [aiTakeTurn])

  const handleClearTaunt = useCallback(() => {
    dispatch({ type: 'SET_TAUNT', taunt: null })
  }, [dispatch])

  return (
    <div className="font-game">
      <AnimatePresence mode="wait">
        {state.phase === 'setup' ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <SetupScreen onStart={startGame} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <GameScreen
              state={state}
              onHumanRoll={humanRoll}
              onAITurn={handleAITurn}
              onReset={resetGame}
              onClearTaunt={handleClearTaunt}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
