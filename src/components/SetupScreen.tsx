import { useState } from 'react'
import { motion } from 'framer-motion'
import { Player } from '../hooks/useGameState'
import { Difficulty } from '../game/gameEngine'
import { sounds } from '../game/sounds'

const PLAYER_CONFIGS = [
  { color: 'cyan',   neonColor: '#00f5ff', emoji: '🚀' },
  { color: 'pink',   neonColor: '#ff00e5', emoji: '🦄' },
  { color: 'green',  neonColor: '#00ff88', emoji: '🐲' },
  { color: 'yellow', neonColor: '#ffe500', emoji: '⚡' },
  { color: 'purple', neonColor: '#a855f7', emoji: '👾' },
  { color: 'orange', neonColor: '#ff6b00', emoji: '🔥' },
]

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; icon: string; desc: string }> = {
  easy:   { label: 'Easy',   icon: '😴', desc: 'Slow & unlucky' },
  medium: { label: 'Medium', icon: '🤔', desc: 'Balanced' },
  hard:   { label: 'Hard',   icon: '🤖', desc: 'Fast & ruthless' },
}

interface Props {
  onStart: (players: Player[]) => void
}

export function SetupScreen({ onStart }: Props) {
  const [playerName, setPlayerName] = useState('You')
  const [rivalCount, setRivalCount] = useState(1)
  const [difficulties, setDifficulties] = useState<Difficulty[]>(['medium', 'medium', 'medium', 'medium', 'medium'])

  const handleStart = () => {
    sounds.click()
    const players: Player[] = [
      {
        id: 0,
        name: playerName || 'You',
        type: 'human',
        color: PLAYER_CONFIGS[0].color,
        neonColor: PLAYER_CONFIGS[0].neonColor,
        emoji: PLAYER_CONFIGS[0].emoji,
        position: 0,
        isMoving: false,
      },
      ...Array.from({ length: rivalCount }, (_, i) => ({
        id: i + 1,
        name: `AI ${i + 1}`,
        type: 'ai' as const,
        difficulty: difficulties[i],
        color: PLAYER_CONFIGS[i + 1].color,
        neonColor: PLAYER_CONFIGS[i + 1].neonColor,
        emoji: PLAYER_CONFIGS[i + 1].emoji,
        position: 0,
        isMoving: false,
      })),
    ]
    onStart(players)
  }

  return (
    <div className="min-h-screen bg-board-dark flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="font-game font-black text-4xl text-white mb-1 tracking-tight">
          CHUTES <span className="text-neon-cyan" style={{ textShadow: '0 0 20px #00f5ff' }}>&</span> LADDERS
        </h1>
        <p className="text-neon-cyan/60 font-game text-sm tracking-widest uppercase">Neon Edition</p>
      </motion.div>

      {/* Setup Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full max-w-sm bg-board-card rounded-2xl p-6 border border-board-border space-y-6"
      >
        {/* Player name */}
        <div>
          <label className="font-game text-xs text-neon-cyan/70 uppercase tracking-wider mb-2 block">Your Name</label>
          <input
            className="w-full bg-board-cell border border-board-border rounded-xl px-4 py-3 font-game text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan transition-colors"
            placeholder="Enter your name..."
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            maxLength={16}
          />
        </div>

        {/* Number of rivals */}
        <div>
          <label className="font-game text-xs text-neon-cyan/70 uppercase tracking-wider mb-3 block">
            AI Rivals: <span className="text-neon-cyan font-bold">{rivalCount}</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => { sounds.click(); setRivalCount(n) }}
                className={`flex-1 py-3 rounded-xl font-game font-bold text-sm transition-all ${
                  rivalCount === n
                    ? 'bg-neon-cyan text-board-dark shadow-lg'
                    : 'bg-board-cell text-white/60 border border-board-border hover:border-neon-cyan/50'
                }`}
                style={rivalCount === n ? { boxShadow: '0 0 12px #00f5ff' } : {}}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Per-AI difficulty */}
        <div className="space-y-3">
          <label className="font-game text-xs text-neon-cyan/70 uppercase tracking-wider block">AI Brain Level</label>
          {Array.from({ length: rivalCount }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl w-8">{PLAYER_CONFIGS[i + 1].emoji}</span>
              <span className="font-game text-xs text-white/50 w-10">AI {i + 1}</span>
              <div className="flex gap-1.5 flex-1">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
                  const cfg = DIFFICULTY_LABELS[d]
                  const selected = difficulties[i] === d
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        sounds.click()
                        const next = [...difficulties]
                        next[i] = d
                        setDifficulties(next)
                      }}
                      className={`flex-1 py-2 rounded-lg font-game text-xs transition-all ${
                        selected
                          ? 'text-board-dark font-bold'
                          : 'bg-board-cell text-white/50 border border-board-border hover:border-white/30'
                      }`}
                      style={selected ? {
                        background: PLAYER_CONFIGS[i + 1].neonColor,
                        boxShadow: `0 0 10px ${PLAYER_CONFIGS[i + 1].neonColor}`,
                      } : {}}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Start button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-game font-black text-lg text-board-dark bg-neon-cyan transition-all"
          style={{ boxShadow: '0 0 20px #00f5ff, 0 0 40px #00f5ff40' }}
        >
          PLAY NOW 🎲
        </motion.button>
      </motion.div>
    </div>
  )
}
