import { motion } from 'framer-motion'
import { squareToPos } from '../game/boardData'
import { Player } from '../hooks/useGameState'

interface Props {
  player: Player
  boardSize: number    // px width/height of the board
  cellSize: number     // px per cell
  tokenIndex: number   // for stacking offset when multiple on same square
  totalOnSquare: number
}

export function Token({ player, cellSize, tokenIndex, totalOnSquare }: Props) {
  if (player.position === 0) return null  // not yet on board (start)

  const { row, col } = squareToPos(player.position)

  // Grid is displayed with row 9 at top, row 0 at bottom
  const displayRow = 9 - row

  // Offset multiple tokens on same square
  const offsetX = totalOnSquare > 1 ? (tokenIndex - (totalOnSquare - 1) / 2) * (cellSize * 0.25) : 0
  const offsetY = totalOnSquare > 1 ? (tokenIndex % 2 === 0 ? -cellSize * 0.1 : cellSize * 0.1) : 0

  const x = col * cellSize + cellSize / 2 + offsetX
  const y = displayRow * cellSize + cellSize / 2 + offsetY

  return (
    <motion.div
      className="absolute flex items-center justify-center pointer-events-none z-10"
      style={{ width: cellSize, height: cellSize, top: displayRow * cellSize, left: col * cellSize }}
      animate={{ x: offsetX, y: offsetY }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full text-base select-none"
        style={{
          width: cellSize * 0.65,
          height: cellSize * 0.65,
          background: `radial-gradient(circle at 35% 35%, ${player.neonColor}cc, ${player.neonColor}44)`,
          border: `2px solid ${player.neonColor}`,
          boxShadow: `0 0 8px ${player.neonColor}, 0 0 16px ${player.neonColor}50`,
          fontSize: cellSize * 0.35,
        }}
        animate={player.isMoving ? { scale: [1, 1.3, 1], y: [0, -4, 0] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {player.emoji}
      </motion.div>
    </motion.div>
  )
}

// Invisible off-board position for animation start
export function getTokenPosition(position: number, cellSize: number): { x: number; y: number } {
  if (position === 0) return { x: -100, y: -100 }
  const { row, col } = squareToPos(position)
  const displayRow = 9 - row
  return {
    x: col * cellSize + cellSize / 2,
    y: displayRow * cellSize + cellSize / 2,
  }
}
