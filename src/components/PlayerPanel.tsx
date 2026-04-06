import { motion } from 'framer-motion'
import { Player } from '../hooks/useGameState'
import { Dice } from './Dice'
import { sounds } from '../game/sounds'

interface Props {
  players: Player[]
  currentTurn: number
  lastRoll: number | null
  isAnimating: boolean
  onHumanRoll: () => void
  message: string
}

export function PlayerPanel({ players, currentTurn, lastRoll, isAnimating, onHumanRoll, message }: Props) {
  const current = players[currentTurn]
  const isHumanTurn = current?.type === 'human'

  return (
    <div className="w-full max-w-sm space-y-3">
      {/* Current turn indicator */}
      <motion.div
        key={currentTurn}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 bg-board-card rounded-2xl px-4 py-3 border border-board-border"
      >
        <span className="text-2xl">{current?.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-game font-bold text-white text-sm truncate">{current?.name}</p>
          <p className="font-game text-xs" style={{ color: current?.neonColor }}>
            {isHumanTurn
              ? isAnimating ? 'Rolling...' : 'Your turn — tap the dice!'
              : isAnimating ? 'Thinking...' : 'AI thinking...'}
          </p>
        </div>
        {/* Turn dot */}
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ background: current?.neonColor, boxShadow: `0 0 8px ${current?.neonColor}` }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>

      {/* Dice + roll button row */}
      <div className="flex items-center gap-4">
        <Dice
          value={lastRoll}
          rolling={isAnimating && lastRoll === null}
          neonColor={current?.neonColor ?? '#00f5ff'}
          onClick={isHumanTurn && !isAnimating ? onHumanRoll : undefined}
          disabled={!isHumanTurn || isAnimating}
        />
        <div className="flex-1">
          {lastRoll !== null ? (
            <motion.div
              key={lastRoll}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-game font-black text-3xl"
              style={{ color: current?.neonColor, textShadow: `0 0 12px ${current?.neonColor}` }}
            >
              {lastRoll}
            </motion.div>
          ) : (
            <p className="font-game text-white/30 text-sm">
              {isHumanTurn && !isAnimating ? 'Tap dice to roll' : '...'}
            </p>
          )}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-game text-xs font-bold mt-1"
              style={{ color: message.includes('Ladder') ? '#00ff88' : '#ff00e5' }}
            >
              {message}
            </motion.p>
          )}
        </div>
      </div>

      {/* All players scoreboard */}
      <div className="bg-board-card rounded-2xl border border-board-border overflow-hidden">
        {players.map((p, i) => (
          <motion.div
            key={p.id}
            className={`flex items-center gap-2 px-3 py-2 ${i < players.length - 1 ? 'border-b border-board-border' : ''}`}
            animate={{ backgroundColor: i === currentTurn ? `${p.neonColor}18` : 'transparent' }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg">{p.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-game text-xs font-bold text-white truncate">{p.name}</p>
              <p className="font-game text-xs text-white/40">
                {p.type === 'ai' ? `${p.difficulty} AI` : 'You'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-game font-bold text-sm" style={{ color: p.neonColor }}>
                {p.position === 0 ? 'Start' : `#${p.position}`}
              </p>
            </div>
            {i === currentTurn && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full ml-1"
                style={{ background: p.neonColor }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
