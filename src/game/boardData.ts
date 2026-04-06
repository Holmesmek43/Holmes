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

// Returns { row, col } for board position 1-100 (row 0 = bottom, row 9 = top)
export function squareToPos(square: number): { row: number; col: number } {
  const idx = square - 1  // 0-based
  const row = Math.floor(idx / 10)  // 0 = bottom row
  const col = row % 2 === 0 ? idx % 10 : 9 - (idx % 10)
  return { row, col }
}

export const TOTAL_SQUARES = 100
