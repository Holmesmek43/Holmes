import { BOARD_SPECIALS, TOTAL_SQUARES } from './boardData'

export type Difficulty = 'easy' | 'medium' | 'hard'

// Weighted dice roll based on difficulty
// Easy: biased toward lower rolls, Hard: biased toward higher rolls
export function rollDice(difficulty?: Difficulty): number {
  if (!difficulty || difficulty === 'medium') {
    return Math.floor(Math.random() * 6) + 1
  }

  // Build weighted pool
  const pool: number[] = []
  if (difficulty === 'easy') {
    // More low numbers
    pool.push(1, 1, 1, 2, 2, 2, 3, 3, 4, 5, 6)
  } else {
    // Hard: more high numbers
    pool.push(1, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6)
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export interface MoveResult {
  newPosition: number
  special: 'ladder' | 'chute' | null
  previousPosition: number
  won: boolean
}

export function movePlayer(currentPosition: number, roll: number): MoveResult {
  let next = currentPosition + roll

  // Bounce back if overshoots 100
  if (next > TOTAL_SQUARES) {
    next = TOTAL_SQUARES - (next - TOTAL_SQUARES)
  }

  const previousPosition = next
  const special = BOARD_SPECIALS[next]
  let specialType: 'ladder' | 'chute' | null = null

  if (special !== undefined) {
    specialType = special > next ? 'ladder' : 'chute'
    next = special
  }

  return {
    newPosition: next,
    special: specialType,
    previousPosition,
    won: next === TOTAL_SQUARES,
  }
}
