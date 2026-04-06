import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CHUTES, LADDERS, POWERUP_SQUARES, POWERUP_LABELS, squareToPos } from '../game/boardData'
import { Player, ActivatedSpecial } from '../hooks/useGameState'
import { Token } from './Token'

interface Props {
  players: Player[]
  size: number
  activatedSpecial: ActivatedSpecial | null
}

export function Board({ players, size, activatedSpecial }: Props) {
  const cellSize = size / 10

  const playersByPosition = useMemo(() => {
    const map: Record<number, Player[]> = {}
    players.forEach(p => {
      if (p.visualPosition > 0) {
        if (!map[p.visualPosition]) map[p.visualPosition] = []
        map[p.visualPosition].push(p)
      }
    })
    return map
  }, [players])

  const cells = useMemo(() => {
    return Array.from({ length: 100 }, (_, idx) => {
      const square = idx + 1
      const { row, col } = squareToPos(square)
      const displayRow = 9 - row
      const colorIdx = (displayRow + col) % 2
      return { square, row, col, displayRow, colorIdx }
    })
  }, [])

  const svgLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; type: 'ladder' | 'chute'; from: number }[] = []

    LADDERS.forEach(({ from, to }) => {
      const f = squareToPos(from)
      const t = squareToPos(to)
      lines.push({
        x1: f.col * cellSize + cellSize / 2,
        y1: (9 - f.row) * cellSize + cellSize / 2,
        x2: t.col * cellSize + cellSize / 2,
        y2: (9 - t.row) * cellSize + cellSize / 2,
        type: 'ladder',
        from,
      })
    })

    CHUTES.forEach(({ from, to }) => {
      const f = squareToPos(from)
      const t = squareToPos(to)
      lines.push({
        x1: f.col * cellSize + cellSize / 2,
        y1: (9 - f.row) * cellSize + cellSize / 2,
        x2: t.col * cellSize + cellSize / 2,
        y2: (9 - t.row) * cellSize + cellSize / 2,
        type: 'chute',
        from,
      })
    })

    return lines
  }, [cellSize])

  return (
    <div
      className="relative rounded-2xl overflow-hidden border-2"
      style={{
        width: size,
        height: size,
        borderColor: '#2a2a4a',
        boxShadow: '0 0 30px #00f5ff20, 0 8px 32px #00000060',
      }}
    >
      {/* Cells */}
      {cells.map(({ square, col, displayRow, colorIdx }) => {
        const powerup = POWERUP_SQUARES[square]
        return (
          <div
            key={square}
            className="absolute flex flex-col items-center justify-between p-0.5"
            style={{
              width: cellSize,
              height: cellSize,
              left: col * cellSize,
              top: displayRow * cellSize,
              background: colorIdx === 0 ? '#1a1a3e' : '#0d1b2a',
              borderRight: '1px solid #2a2a4a30',
              borderBottom: '1px solid #2a2a4a30',
            }}
          >
            <span
              className="font-game font-bold leading-none"
              style={{
                fontSize: cellSize * 0.22,
                color: square === 100 ? '#ffe500' : '#ffffff30',
              }}
            >
              {square === 100 ? '★' : square}
            </span>

            {/* Power-up square indicator */}
            {powerup && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: cellSize * 0.55,
                    height: cellSize * 0.55,
                    background: '#ffe50015',
                    border: '1.5px solid #ffe50060',
                    boxShadow: '0 0 6px #ffe50040',
                    fontSize: cellSize * 0.3,
                  }}
                >
                  {POWERUP_LABELS[powerup].icon}
                </div>
              </motion.div>
            )}
          </div>
        )
      })}

      {/* SVG overlay for chutes & ladders */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={size}
        height={size}
        style={{ zIndex: 5 }}
      >
        <defs>
          <filter id="glow-ladder">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-chute">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-active">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {svgLines.map((line, i) => {
          const isActive = activatedSpecial?.from === line.from
          const isLadder = line.type === 'ladder'

          return (
            <g key={i}>
              {isLadder ? (
                <>
                  <motion.line
                    x1={line.x1 - 4} y1={line.y1} x2={line.x2 - 4} y2={line.y2}
                    stroke="#00ff88" strokeWidth={isActive ? 4 : 3} strokeLinecap="round"
                    filter={isActive ? 'url(#glow-active)' : 'url(#glow-ladder)'}
                    animate={isActive ? { opacity: [1, 0.3, 1, 0.3, 1, 0.3, 1] } : { opacity: 0.85 }}
                    transition={isActive ? { duration: 0.6 } : {}}
                  />
                  <motion.line
                    x1={line.x1 + 4} y1={line.y1} x2={line.x2 + 4} y2={line.y2}
                    stroke="#00ff88" strokeWidth={isActive ? 4 : 3} strokeLinecap="round"
                    filter={isActive ? 'url(#glow-active)' : 'url(#glow-ladder)'}
                    animate={isActive ? { opacity: [1, 0.3, 1, 0.3, 1, 0.3, 1] } : { opacity: 0.85 }}
                    transition={isActive ? { duration: 0.6 } : {}}
                  />
                  {Array.from({ length: 4 }, (_, ri) => {
                    const t = (ri + 1) / 5
                    const rx = line.x1 + (line.x2 - line.x1) * t
                    const ry = line.y1 + (line.y2 - line.y1) * t
                    return (
                      <line key={ri}
                        x1={rx - 4} y1={ry} x2={rx + 4} y2={ry}
                        stroke="#00ff88" strokeWidth={2} strokeLinecap="round"
                        filter="url(#glow-ladder)" opacity={0.7}
                      />
                    )
                  })}
                  <circle cx={line.x1} cy={line.y1} r={isActive ? 7 : 5} fill="#00ff88" filter={isActive ? 'url(#glow-active)' : 'url(#glow-ladder)'} opacity={0.9} />
                  <circle cx={line.x2} cy={line.y2} r={isActive ? 7 : 5} fill="#00ff88" filter={isActive ? 'url(#glow-active)' : 'url(#glow-ladder)'} opacity={0.9} />
                </>
              ) : (
                <>
                  <motion.path
                    d={`M ${line.x1} ${line.y1} C ${line.x1 + 20} ${(line.y1 + line.y2) / 2 - 20}, ${line.x2 - 20} ${(line.y1 + line.y2) / 2 + 20}, ${line.x2} ${line.y2}`}
                    stroke="#ff00e5" strokeWidth={isActive ? 7 : 5} fill="none" strokeLinecap="round"
                    filter={isActive ? 'url(#glow-active)' : 'url(#glow-chute)'}
                    animate={isActive ? { opacity: [1, 0.3, 1, 0.3, 1, 0.3, 1] } : { opacity: 0.8 }}
                    transition={isActive ? { duration: 0.6 } : {}}
                  />
                  <circle cx={line.x1} cy={line.y1} r={isActive ? 8 : 6} fill="#ff00e5" filter={isActive ? 'url(#glow-active)' : 'url(#glow-chute)'} opacity={0.9} />
                  <circle cx={line.x2} cy={line.y2} r={isActive ? 6 : 4} fill="#ff00e5" filter={isActive ? 'url(#glow-active)' : 'url(#glow-chute)'} opacity={0.7} />
                </>
              )}
            </g>
          )
        })}
      </svg>

      {/* Player tokens */}
      {players.map(player => {
        const onSquare = playersByPosition[player.visualPosition] ?? []
        const idx = onSquare.findIndex(p => p.id === player.id)
        return (
          <Token
            key={player.id}
            player={player}
            cellSize={cellSize}
            tokenIndex={idx}
            totalOnSquare={onSquare.length}
          />
        )
      })}
    </div>
  )
}
