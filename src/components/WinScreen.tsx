import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Player } from '../hooks/useGameState'

interface Props {
  winner: Player
  players: Player[]
  onPlayAgain: () => void
}

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

const STAT_ITEMS = [
  { key: 'rolls',           label: 'Rolls',   icon: '🎲' },
  { key: 'ladders',         label: 'Ladders', icon: '🪜' },
  { key: 'chutes',          label: 'Chutes',  icon: '🐍' },
  { key: 'squaresTravelled',label: 'Squares', icon: '📍' },
] as const

export function WinScreen({ winner, players, onPlayAgain }: Props) {
  const particles = useRef(Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  })))

  const sorted = [...players].sort((a, b) => b.position - a.position)

  return (
    <div className="fixed inset-0 bg-board-dark flex flex-col items-center overflow-y-auto">
      {particles.current.map(p => (
        <Confetti key={p.id} color={p.color} />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 flex flex-col items-center gap-5 px-6 py-8 max-w-sm w-full"
      >
        {/* Winner */}
        <div className="text-center">
          <motion.div
            className="text-7xl mb-3"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {winner.emoji}
          </motion.div>
          <h1 className="font-game font-black text-3xl text-white mb-1" style={{ textShadow: `0 0 20px ${winner.neonColor}` }}>
            {winner.name}
          </h1>
          <p className="font-game font-bold text-xl" style={{ color: winner.neonColor }}>WINS! 🏆</p>
        </div>

        {/* Rankings */}
        <div className="w-full bg-board-card rounded-2xl border border-board-border overflow-hidden">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-4 py-2.5 ${i < sorted.length - 1 ? 'border-b border-board-border' : ''}`}
              style={{ background: p.id === winner.id ? `${winner.neonColor}18` : 'transparent' }}
            >
              <span className="font-game font-black text-lg w-6">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span className="text-xl">{p.emoji}</span>
              <span className="font-game font-bold text-white text-sm flex-1">{p.name}</span>
              <span className="font-game text-sm font-bold" style={{ color: p.neonColor }}>#{p.position}</span>
            </div>
          ))}
        </div>

        {/* Per-player stats */}
        <div className="w-full space-y-2">
          <p className="font-game text-xs text-white/40 uppercase tracking-wider text-center">Game Stats</p>
          {sorted.map(p => (
            <div
              key={p.id}
              className="bg-board-card rounded-2xl border border-board-border px-4 py-3"
              style={{ borderColor: p.id === winner.id ? `${p.neonColor}50` : '#2a2a4a' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{p.emoji}</span>
                <span className="font-game font-bold text-xs text-white">{p.name}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {STAT_ITEMS.map(({ key, label, icon }) => (
                  <div key={key} className="text-center">
                    <div className="text-sm">{icon}</div>
                    <div className="font-game font-black text-sm" style={{ color: p.neonColor }}>
                      {p.stats[key]}
                    </div>
                    <div className="font-game text-[9px] text-white/30 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
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
