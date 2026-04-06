import { Difficulty, rollDice } from './gameEngine'

export interface AIMoveResult {
  roll: number
  thinkTime: number  // ms to "think" before acting
}

const THINK_TIMES: Record<Difficulty, () => number> = {
  easy:   () => 1200 + Math.random() * 800,   // 1.2 – 2.0s
  medium: () => 600  + Math.random() * 400,   // 0.6 – 1.0s
  hard:   () => 200  + Math.random() * 200,   // 0.2 – 0.4s
}

export function getAIMove(difficulty: Difficulty): AIMoveResult {
  return {
    roll:      rollDice(difficulty),
    thinkTime: THINK_TIMES[difficulty](),
  }
}

export const AI_TAUNTS: Record<Difficulty, string[]> = {
  easy: [
    'Umm... I think... that\'s good?',
    'Oops! Not my best roll...',
    'Wait, which way do I go?',
    'I\'m trying my best! 😅',
    'Oh dear, a chute...',
  ],
  medium: [
    'Not bad, not bad.',
    'Getting there!',
    'I\'ll catch up soon.',
    'Steady progress.',
    'This game is intense!',
  ],
  hard: [
    'Too easy. 😏',
    'You\'ll need more than luck.',
    'Calculated.',
    'Inevitable.',
    'You can\'t beat the machine. 🤖',
    'LADDER. Naturally. 😎',
  ],
}

export function getAITaunt(difficulty: Difficulty, event: 'ladder' | 'chute' | 'roll'): string {
  const taunts = AI_TAUNTS[difficulty]
  return taunts[Math.floor(Math.random() * taunts.length)]
}
