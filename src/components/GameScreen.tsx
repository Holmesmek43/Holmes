import { useEffect, useRef, useState } from 'react'
import { GameState } from '../hooks/useGameState'
import { Board } from './Board'
import { PlayerPanel } from './PlayerPanel'
import { WinScreen } from './WinScreen'

interface Props {
  state: GameState
  onHumanRoll: () => void
  onAITurn: (playerIndex: number) => void
  onReset: () => void
}

export function GameScreen({ state, onHumanRoll, onAITurn, onReset }: Props) {
  const { players, currentTurn, lastRoll, isAnimating, message, phase, winner } = state
  const aiTriggered = useRef(false)
  const [boardSize, setBoardSize] = useState(340)

  // Responsive board size
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      // Board sits in top portion, panel in bottom ~200px
      const available = Math.min(vw - 16, vh - 220)
      setBoardSize(Math.max(280, Math.min(400, available)))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // Auto-trigger AI turn
  useEffect(() => {
    if (phase !== 'playing' || isAnimating) {
      aiTriggered.current = false
      return
    }
    const currentPlayer = players[currentTurn]
    if (currentPlayer?.type === 'ai' && !aiTriggered.current) {
      aiTriggered.current = true
      onAITurn(currentTurn)
    } else if (currentPlayer?.type === 'human') {
      aiTriggered.current = false
    }
  }, [currentTurn, phase, isAnimating, players, onAITurn])

  if (phase === 'won' && winner) {
    return <WinScreen winner={winner} players={players} onPlayAgain={onReset} />
  }

  return (
    <div
      className="min-h-screen bg-board-dark flex flex-col items-center"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="w-full max-w-sm px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={onReset}
          className="font-game text-white/40 text-sm px-3 py-1.5 rounded-xl border border-board-border active:opacity-60"
        >
          ← Menu
        </button>
        <span
          className="font-game font-black text-sm text-neon-cyan"
          style={{ textShadow: '0 0 10px #00f5ff' }}
        >
          CHUTES & LADDERS
        </span>
        <div className="w-16" />
      </div>

      {/* Board */}
      <div className="px-2 mt-1">
        <Board players={players} size={boardSize} />
      </div>

      {/* Player panel */}
      <div className="w-full max-w-sm px-4 mt-3 pb-4">
        <PlayerPanel
          players={players}
          currentTurn={currentTurn}
          lastRoll={lastRoll}
          isAnimating={isAnimating}
          onHumanRoll={onHumanRoll}
          message={message}
        />
      </div>
    </div>
  )
}
