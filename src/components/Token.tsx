import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { squareToPos } from '../game/boardData'
import { Player } from '../hooks/useGameState'

interface Props {
  player: Player
  cellSize: number
  tokenIndex: number
  totalOnSquare: number
}

export function Token({ player, cellSize, tokenIndex, totalOnSquare }: Props) {
  if (player.visualPosition === 0) return null

  const { row, col } = squareToPos(player.visualPosition)
  const displayRow = 9 - row

  const offsetX = totalOnSquare > 1
    ? (tokenIndex - (totalOnSquare - 1) / 2) * (cellSize * 0.28)
    : 0
  const offsetY = totalOnSquare > 1
    ? (tokenIndex % 2 === 0 ? -cellSize * 0.12 : cellSize * 0.12)
    : 0

  const targetTop  = displayRow * cellSize + offsetY
  const targetLeft = col * cellSize + offsetX

  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      style={{ width: cellSize, height: cellSize }}
      animate={{ top: targetTop, left: targetLeft }}
      initial={{ top: targetTop, left: targetLeft }}
      transition={{
        type: 'spring',
        stiffness: 520,
        damping: 38,
        mass: 0.7,
      }}
    >
      <TokenEmoji player={player} cellSize={cellSize} />
    </motion.div>
  )
}

// Separate component so useAnimation hook runs cleanly per token
function TokenEmoji({ player, cellSize }: { player: Player; cellSize: number }) {
  const hopControls = useAnimation()
  const prevPos = useRef(player.visualPosition)

  // Trigger a little hop every time visualPosition changes
  useEffect(() => {
    if (player.visualPosition !== prevPos.current && player.visualPosition > 0) {
      prevPos.current = player.visualPosition
      hopControls.start({
        y: [0, -cellSize * 0.28, 0],
        scaleX: [1, 0.85, 1],
        scaleY: [1, 1.2, 1],
        transition: { duration: 0.13, ease: 'easeOut' },
      })
    }
  }, [player.visualPosition, cellSize, hopControls])

  return (
    <motion.div
      animate={hopControls}
      className="absolute inset-0 flex items-center justify-center"
    >
      {/* Glow ring that pulses when it's this player's turn */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: cellSize * 0.75,
          height: cellSize * 0.75,
          background: `radial-gradient(circle, ${player.neonColor}22, transparent 70%)`,
          boxShadow: `0 0 ${cellSize * 0.25}px ${player.neonColor}60`,
        }}
        animate={player.isMoving
          ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
          : { scale: 1, opacity: 0.4 }}
        transition={{ duration: 0.4, repeat: player.isMoving ? Infinity : 0 }}
      />

      {/* Token body */}
      <motion.div
        className="relative flex items-center justify-center rounded-full select-none"
        style={{
          width: cellSize * 0.62,
          height: cellSize * 0.62,
          background: `radial-gradient(circle at 35% 30%, ${player.neonColor}dd, ${player.neonColor}55)`,
          border: `2px solid ${player.neonColor}`,
          boxShadow: `0 0 6px ${player.neonColor}, 0 2px 8px #00000060`,
          fontSize: cellSize * 0.33,
        }}
      >
        {player.emoji}

        {/* Specular highlight */}
        <div
          className="absolute rounded-full opacity-40"
          style={{
            width: '40%',
            height: '35%',
            top: '12%',
            left: '18%',
            background: 'radial-gradient(circle, white 0%, transparent 80%)',
          }}
        />
      </motion.div>
    </motion.div>
  )
}
