import { Difficulty, rollDice } from './gameEngine'

export interface AIMoveResult {
  roll: number
  thinkTime: number
}

const THINK_TIMES: Record<Difficulty, () => number> = {
  easy:   () => 1200 + Math.random() * 800,
  medium: () => 600  + Math.random() * 400,
  hard:   () => 200  + Math.random() * 200,
}

export function getAIMove(difficulty: Difficulty): AIMoveResult {
  return {
    roll:      rollDice(difficulty),
    thinkTime: THINK_TIMES[difficulty](),
  }
}

// ─── Event-specific taunts ────────────────────────────────────────────────────
export type TauntEvent = 'ladder' | 'chute' | 'roll6' | 'powerup' | 'nearWin' | 'generic'

export const EVENT_TAUNTS: Record<Difficulty, Record<TauntEvent, string[]>> = {
  easy: {
    ladder:  ["Oh wow, a ladder! 🙈", "I went up! Did I do that right?", "Wheee, climbing!"],
    chute:   ["Nooo! 😭", "Not fair...", "I slid all the way down!"],
    roll6:   ["Six! Wait, is that good?", "Ooh I rolled a six!", "Again? Really?"],
    powerup: ["Ooh shiny! ⭐", "What does this do?", "I got a power... thing!"],
    nearWin: ["Almost there... maybe? 😅", "I think I'm close!", "Don't mess this up..."],
    generic: ["Um...", "Your turn I think?", "I'm trying! 😅"],
  },
  medium: {
    ladder:  ["Nice ladder! 🪜", "Getting there!", "That's what I needed."],
    chute:   ["Ugh, setback.", "Not ideal.", "Fine. I'll recover."],
    roll6:   ["Bonus roll!", "Six! Let's go.", "Extra turn — nice."],
    powerup: ["Power-up claimed. ⭐", "That'll help.", "Smart play."],
    nearWin: ["Getting close!", "Almost at 100...", "I can see the finish."],
    generic: ["Good game.", "Interesting move.", "We'll see."],
  },
  hard: {
    ladder:  ["Calculated. 😎", "As planned.", "Inevitable.", "Naturally."],
    chute:   ["Irrelevant. I'll catch up.", "Minor inconvenience.", "Already adjusted my strategy."],
    roll6:   ["Six. Again. Naturally. 😏", "Did you expect anything less?", "Too easy."],
    powerup: ["Mine now. 😈", "I'll take that.", "Power secured."],
    nearWin: ["You can't stop me. 🤖", "Endgame.", "It's over."],
    generic: ["Too easy.", "You can try.", "Bored already."],
  },
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getAITaunt(difficulty: Difficulty, event: TauntEvent): string {
  return pick(EVENT_TAUNTS[difficulty][event])
}
