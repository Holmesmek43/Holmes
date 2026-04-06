// Maps from square -> destination square
// Ladders (go up): key < value
// Chutes (go down): key > value

export const BOARD_SPECIALS: Record<number, number> = {
  // Ladders (bottom -> top)
  4:  14,
  9:  31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,

  // Chutes (top -> bottom)
  17:  7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
}

export const LADDERS = Object.entries(BOARD_SPECIALS)
  .filter(([from, to]) => Number(to) > Number(from))
  .map(([from, to]) => ({ from: Number(from), to: Number(to) }))

export const CHUTES = Object.entries(BOARD_SPECIALS)
  .filter(([from, to]) => Number(to) < Number(from))
  .map(([from, to]) => ({ from: Number(from), to: Number(to) }))

// ─── Power-up squares ─────────────────────────────────────────────────────────
export type PowerupType = 'double_roll' | 'push_rival' | 'shield' | 'time_warp'

export const POWERUP_SQUARES: Record<number, PowerupType> = {
  15: 'shield',      // early  — immunity to next chute
  35: 'push_rival',  // mid    — nearest rival back 6 squares
  50: 'double_roll', // mid    — next roll ×2
  75: 'time_warp',   // late   — teleport to nearest ladder bottom ≤ your position
  90: 'double_roll', // end    — double roll when close to 100
}

export const POWERUP_LABELS: Record<PowerupType, { icon: string; name: string; desc: string }> = {
  double_roll: { icon: '⚡', name: 'Double Roll', desc: 'Next roll ×2!' },
  push_rival:  { icon: '💥', name: 'Push Rival',  desc: 'Rival knocked back 6!' },
  shield:      { icon: '🛡️', name: 'Shield',      desc: 'Immune to next chute!' },
  time_warp:   { icon: '⏩', name: 'Time Warp',   desc: 'Jump to a ladder!' },
}

// Returns { row, col } for board position 1-100 (row 0 = bottom, row 9 = top)
export function squareToPos(square: number): { row: number; col: number } {
  const idx = square - 1  // 0-based
  const row = Math.floor(idx / 10)  // 0 = bottom row
  const col = row % 2 === 0 ? idx % 10 : 9 - (idx % 10)
  return { row, col }
}

export const TOTAL_SQUARES = 100
