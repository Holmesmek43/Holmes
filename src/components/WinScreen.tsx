import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Player } from '../hooks/useGameState'
import { sounds } from '../game/sounds'

interface Props {
  winner: Player
  players: Player[]
  onPlayAgain: () => void
}

// Simple confetti particle
function Confetti({ color }: { color: string }) {
  const x = Math.random() * 100
  const delay = Math.random() * 1.5
  const duration = 2 + Math.random() * 2
  const size = 6 + Math.random() * 8
  const rotate = Math.random() * 360

  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{ left: `${x}%`, top: -20, width: size, height: size * 0.6, background: color, rotate }}
      animate={{
        y: ['0vh', '110vh'],
        x: [0, (Math.random() - 0.5) * 100],
        rotate: [rotate, rotate + 360 * (Math.random() > 0.5 ? 1 : -1)],
        opacity: [1, 1, 0],
      }}
      transition={{ duration, delay, ease: 'linear' }}
    />
  )
}

const CONFETTI_COLORS = ['#00f5ff', '#ff00e5', '#00ff88', '#ffe500', '#a855f7', '#ff6b00']

export function WinScreen({ winner, players, onPlayAgain }: Props) {
  const particles = useRef(Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  })))

  // Sort players by position descending for ranking
  const sorted = [...players].sort((a, b) => b.position - a.position)

  return (
    <div className="fixed inset-0 bg-board-dark flex flex-col items-center justify-center overflow-hidden">
      {/* Confetti */}
      {particles.current.map(p => (
        <Confetti key={p.id} color={p.color} />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-sm w-full"
      >
        {/* Winner announcement */}
        <div className="text-center">
          <motion.div
            className="text-7xl mb-3"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {winner.emoji}
          </motion.div>
          <h1
            className="font-game font-black text-3xl text-white mb-1"
            style={{ textShadow: `0 0 20px ${winner.neonColor}` }}
          >
            {winner.name}
          </h1>
          <p className="font-game font-bold text-xl" style={{ color: winner.neonColor }}>
            WINS! 🏆
          </p>
        </div>

        {/* Rankings */}
        <div className="w-full bg-board-card rounded-2xl border border-board-border overflow-hidden">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < sorted.length - 1 ? 'border-b border-board-border' : ''}`}
              style={{ background: p.id === winner.id ? `${winner.neonColor}18` : 'transparent' }}
            >
              <span className="font-game font-black text-lg w-6 text-white/40">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span className="text-xl">{p.emoji}</span>
              <span className="font-game font-bold text-white text-sm flex-1">{p.name}</span>
              <span className="font-game text-sm font-bold" style={{ color: p.neonColor }}>#{p.position}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="w-full py-4 rounded-2xl font-game font-black text-lg text-board-dark"
            style={{
              background: winner.neonColor,
              boxShadow: `0 0 20px ${winner.neonColor}, 0 0 40px ${winner.neonColor}40`,
            }}
          >
            PLAY AGAIN 🎲
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="w-full py-3 rounded-2xl font-game font-bold text-sm text-white/60 border border-board-border"
          >
            Change Settings
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
