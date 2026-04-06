import { useReducer, useCallback } from 'react'
import { Difficulty, movePlayer, getMovementSteps } from '../game/gameEngine'
import { getAIMove, getAITaunt, TauntEvent } from '../game/aiEngine'
import { PowerupType, POWERUP_SQUARES, LADDERS } from '../game/boardData'
import { sounds } from '../game/sounds'
import { settings } from '../game/settings'

export type PlayerType = 'human' | 'ai'
export type GamePhase = 'setup' | 'playing' | 'won'

export interface PlayerStats {
  rolls: number
  ladders: number
  chutes: number
  squaresTravelled: number
}

export interface Player {
  id: number
  name: string
  type: PlayerType
  difficulty?: Difficulty
  color: string
  neonColor: string
  emoji: string
  position: number
  visualPosition: number
  isMoving: boolean
  activePowerup: PowerupType | null
  shieldActive: boolean
  stats: PlayerStats
}

export interface ActiveTaunt {
  playerId: number
  text: string
  neonColor: string
  emoji: string
}

export interface ActivatedSpecial {
  from: number
  to: number
  type: 'ladder' | 'chute'
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  currentTurn: number
  lastRoll: number | null
  lastSpecial: 'ladder' | 'chute' | null
  winner: Player | null
  message: string
  isAnimating: boolean
  activatedSpecial: ActivatedSpecial | null
  activeTaunt: ActiveTaunt | null
  bonusRollActive: boolean
}

type Action =
  | { type: 'START_GAME'; players: Player[] }
  | { type: 'ROLL_DICE'; roll: number }
  | { type: 'SET_VISUAL_POS'; playerId: number; pos: number }
  | { type: 'SET_ACTIVATED_SPECIAL'; special: ActivatedSpecial | null }
  | { type: 'SET_TAUNT'; taunt: ActiveTaunt | null }
  | { type: 'SET_POWERUP'; playerId: number; powerup: PowerupType | null; shieldActive?: boolean }
  | { type: 'SET_BONUS_ROLL'; active: boolean }
  | { type: 'SET_MESSAGE'; text: string }
  | { type: 'APPLY_MOVE'; playerId: number; result: ReturnType<typeof movePlayer>; squaresTravelled: number }
  | { type: 'PUSH_RIVAL'; rivalId: number; newPos: number }
  | { type: 'NEXT_TURN' }
  | { type: 'SET_ANIMATING'; value: boolean }
  | { type: 'RESET' }

const blankStats = (): PlayerStats => ({ rolls: 0, ladders: 0, chutes: 0, squaresTravelled: 0 })

const initialState: GameState = {
  phase: 'setup',
  players: [],
  currentTurn: 0,
  lastRoll: null,
  lastSpecial: null,
  winner: null,
  message: '',
  isAnimating: false,
  activatedSpecial: null,
  activeTaunt: null,
  bonusRollActive: false,
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return { ...initialState, phase: 'playing', players: action.players }

    case 'ROLL_DICE':
      return { ...state, lastRoll: action.roll, lastSpecial: null }

    case 'SET_VISUAL_POS':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.playerId ? { ...p, visualPosition: action.pos, isMoving: true } : p
        ),
      }

    case 'SET_ACTIVATED_SPECIAL':
      return { ...state, activatedSpecial: action.special }

    case 'SET_TAUNT':
      return { ...state, activeTaunt: action.taunt }

    case 'SET_POWERUP':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.playerId
            ? { ...p, activePowerup: action.powerup, shieldActive: action.shieldActive ?? p.shieldActive }
            : p
        ),
      }

    case 'SET_BONUS_ROLL':
      return { ...state, bonusRollActive: action.active }

    case 'SET_MESSAGE':
      return { ...state, message: action.text }

    case 'APPLY_MOVE': {
      const players = state.players.map(p => {
        if (p.id !== action.playerId) return p
        const stats: PlayerStats = {
          rolls: p.stats.rolls + 1,
          ladders: p.stats.ladders + (action.result.special === 'ladder' ? 1 : 0),
          chutes: p.stats.chutes + (action.result.special === 'chute' ? 1 : 0),
          squaresTravelled: p.stats.squaresTravelled + action.squaresTravelled,
        }
        return {
          ...p,
          position: action.result.newPosition,
          visualPosition: action.result.newPosition,
          isMoving: false,
          activePowerup: null,
          stats,
        }
      })
      const winner = action.result.won ? players.find(p => p.id === action.playerId) ?? null : null
      return {
        ...state,
        players,
        lastSpecial: action.result.special,
        winner,
        phase: winner ? 'won' : 'playing',
        activatedSpecial: null,
        message: action.result.special === 'ladder'
          ? '🪜 Ladder! Climbing up!'
          : action.result.special === 'chute'
          ? '🐍 Chute! Sliding down!'
          : '',
      }
    }

    case 'PUSH_RIVAL':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.rivalId
            ? { ...p, position: action.newPos, visualPosition: action.newPos }
            : p
        ),
      }

    case 'NEXT_TURN': {
      const next = (state.currentTurn + 1) % state.players.length
      return { ...state, currentTurn: next, lastRoll: null, lastSpecial: null, message: '', bonusRollActive: false }
    }

    case 'SET_ANIMATING':
      return { ...state, isAnimating: action.value }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms / settings.speed))
}

async function animateMove(
  dispatch: React.Dispatch<Action>,
  playerId: number,
  from: number,
  roll: number,
) {
  const steps = getMovementSteps(from, roll)
  for (const step of steps) {
    dispatch({ type: 'SET_VISUAL_POS', playerId, pos: step })
    sounds.move()
    await delay(130)
  }
  return steps
}

// Find nearest rival strictly ahead of player (higher position) or behind if none
function findNearestRival(players: Player[], currentId: number): Player | null {
  const current = players.find(p => p.id === currentId)
  if (!current) return null
  const rivals = players.filter(p => p.id !== currentId && p.type !== 'human' || p.id !== currentId)
  // prefer rivals ahead
  const ahead = rivals.filter(p => p.position > current.position).sort((a, b) => a.position - b.position)
  if (ahead.length) return ahead[0]
  const behind = rivals.filter(p => p.position < current.position).sort((a, b) => b.position - a.position)
  return behind[0] ?? null
}

function nearestLadderBottom(position: number): number | null {
  const bottoms = LADDERS.map(l => l.from).filter(f => f <= position)
  if (!bottoms.length) return null
  return bottoms.reduce((a, b) => Math.abs(a - position) < Math.abs(b - position) ? a : b)
}

// ─── Core turn logic (shared between human and AI) ────────────────────────────

async function executeTurn(
  dispatch: React.Dispatch<Action>,
  getState: () => GameState,
  playerIndex: number,
  rollOverride?: number,
): Promise<void> {
  const state = getState()
  const player = state.players[playerIndex]
  if (!player) return

  // Roll dice
  let roll = rollOverride ?? Math.floor(Math.random() * 6) + 1
  sounds.dice()
  dispatch({ type: 'ROLL_DICE', roll })
  await delay(300)

  // Bonus roll on 6
  if (roll === 6) {
    sounds.bonusRoll()
    dispatch({ type: 'SET_BONUS_ROLL', active: true })
    if (player.type === 'ai') {
      const tauntText = getAITaunt(player.difficulty ?? 'medium', 'roll6')
      dispatch({ type: 'SET_TAUNT', taunt: { playerId: player.id, text: tauntText, neonColor: player.neonColor, emoji: player.emoji } })
    }
    await delay(700)
    dispatch({ type: 'SET_BONUS_ROLL', active: false })
    dispatch({ type: 'SET_TAUNT', taunt: null })
  }

  // Apply double_roll powerup
  const freshPlayer = getState().players[playerIndex]
  if (freshPlayer?.activePowerup === 'double_roll') {
    roll = Math.min(roll * 2, 12)
    dispatch({ type: 'ROLL_DICE', roll })
    dispatch({ type: 'SET_MESSAGE', text: '⚡ Double roll activated!' })
    await delay(300)
  }

  // Step-by-step movement
  const steps = await animateMove(dispatch, player.id, freshPlayer?.position ?? player.position, roll)
  const landingSquare = steps[steps.length - 1]
  const squaresTravelled = steps.length

  // Check for power-up square
  const powerup = POWERUP_SQUARES[landingSquare]
  if (powerup) {
    sounds.powerup()
    if (powerup === 'push_rival') {
      // Apply immediately: find nearest rival and push back
      const currentState = getState()
      const rival = findNearestRival(currentState.players, player.id)
      if (rival && rival.position > 0) {
        const newPos = Math.max(1, rival.position - 6)
        dispatch({ type: 'PUSH_RIVAL', rivalId: rival.id, newPos })
        dispatch({ type: 'SET_MESSAGE', text: `💥 ${rival.name} knocked back 6!` })
      } else {
        dispatch({ type: 'SET_MESSAGE', text: '💥 No rival to push!' })
      }
    } else if (powerup === 'time_warp') {
      // Jump to nearest ladder bottom immediately
      const ladderBottom = nearestLadderBottom(landingSquare)
      if (ladderBottom) {
        dispatch({ type: 'SET_VISUAL_POS', playerId: player.id, pos: ladderBottom })
        dispatch({ type: 'SET_MESSAGE', text: '⏩ Time Warp! Teleported to ladder!' })
        await delay(500)
      }
    } else {
      // shield or double_roll — grant for next turn
      dispatch({ type: 'SET_POWERUP', playerId: player.id, powerup, shieldActive: powerup === 'shield' })
      dispatch({ type: 'SET_MESSAGE', text: `${powerup === 'shield' ? '🛡️ Shield active!' : '⚡ Double roll next turn!'}` })
    }
    if (player.type === 'ai') {
      const tauntText = getAITaunt(player.difficulty ?? 'medium', 'powerup')
      dispatch({ type: 'SET_TAUNT', taunt: { playerId: player.id, text: tauntText, neonColor: player.neonColor, emoji: player.emoji } })
      await delay(600)
      dispatch({ type: 'SET_TAUNT', taunt: null })
    }
    await delay(400)
  }

  // Compute final result (chute/ladder)
  const currentPos = powerup === 'time_warp'
    ? (nearestLadderBottom(landingSquare) ?? landingSquare)
    : landingSquare
  const fromPos = freshPlayer?.position ?? player.position
  const result = movePlayer(fromPos, roll)

  // Override result position for time_warp (already moved)
  const effectiveResult = powerup === 'time_warp'
    ? { ...result, newPosition: currentPos, special: null as null }
    : result

  if (effectiveResult.special) {
    // Shield blocks chute
    const freshPlayer2 = getState().players.find(p => p.id === player.id)
    if (effectiveResult.special === 'chute' && freshPlayer2?.shieldActive) {
      dispatch({ type: 'SET_POWERUP', playerId: player.id, powerup: null, shieldActive: false })
      dispatch({ type: 'SET_MESSAGE', text: '🛡️ Shield blocked the chute!' })
      await delay(500)
      // Override to not slide down
      dispatch({ type: 'APPLY_MOVE', playerId: player.id, result: { ...effectiveResult, special: null, newPosition: effectiveResult.previousPosition }, squaresTravelled })
    } else {
      // Flash the triggered special on board
      dispatch({
        type: 'SET_ACTIVATED_SPECIAL',
        special: { from: effectiveResult.previousPosition, to: effectiveResult.newPosition, type: effectiveResult.special },
      })
      await delay(400)

      if (effectiveResult.special === 'ladder') sounds.ladder()
      else sounds.chute()

      // Animate token to destination
      dispatch({ type: 'SET_VISUAL_POS', playerId: player.id, pos: effectiveResult.newPosition })
      await delay(700)

      if (player.type === 'ai') {
        const event: TauntEvent = effectiveResult.special === 'ladder' ? 'ladder' : 'chute'
        const tauntText = getAITaunt(player.difficulty ?? 'medium', event)
        dispatch({ type: 'SET_TAUNT', taunt: { playerId: player.id, text: tauntText, neonColor: player.neonColor, emoji: player.emoji } })
        await delay(1800)
        dispatch({ type: 'SET_TAUNT', taunt: null })
      }

      dispatch({ type: 'APPLY_MOVE', playerId: player.id, result: effectiveResult, squaresTravelled })
    }
  } else {
    dispatch({ type: 'APPLY_MOVE', playerId: player.id, result: effectiveResult, squaresTravelled })
  }

  // Check near-win taunt for AI (position >= 90)
  const finalPlayer = getState().players.find(p => p.id === player.id)
  if (player.type === 'ai' && finalPlayer && finalPlayer.position >= 88 && !effectiveResult.won) {
    const tauntText = getAITaunt(player.difficulty ?? 'medium', 'nearWin')
    dispatch({ type: 'SET_TAUNT', taunt: { playerId: player.id, text: tauntText, neonColor: player.neonColor, emoji: player.emoji } })
    await delay(1500)
    dispatch({ type: 'SET_TAUNT', taunt: null })
  }

  if (effectiveResult.won) {
    await delay(300)
    sounds.win()
    dispatch({ type: 'SET_ANIMATING', value: false })
    return
  }

  // Bonus roll means same player goes again (don't advance turn)
  if (roll === 6) {
    await delay(400)
    sounds.turn()
    dispatch({ type: 'SET_ANIMATING', value: false })
    // Re-trigger same player
    dispatch({ type: 'SET_ANIMATING', value: true })
    if (player.type === 'ai') {
      const { roll: newRoll, thinkTime } = getAIMove(player.difficulty ?? 'medium')
      await delay(thinkTime)
      dispatch({ type: 'ROLL_DICE', roll: newRoll })
      await executeTurn(dispatch, getState, playerIndex, newRoll)
    } else {
      // Human's bonus roll: just unblock so they can roll again
      dispatch({ type: 'SET_ANIMATING', value: false })
    }
    return
  }

  await delay(500)
  dispatch({ type: 'NEXT_TURN' })
  sounds.turn()
  dispatch({ type: 'SET_ANIMATING', value: false })
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Keep a ref to latest state for async closures
  const stateRef = { current: state }
  stateRef.current = state
  const getState = () => stateRef.current

  const startGame = useCallback((players: Player[]) => {
    dispatch({ type: 'START_GAME', players })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const humanRoll = useCallback(async () => {
    if (state.isAnimating || state.phase !== 'playing') return
    const currentPlayer = state.players[state.currentTurn]
    if (currentPlayer.type !== 'human') return

    dispatch({ type: 'SET_ANIMATING', value: true })
    await delay(200) // brief pre-roll pause
    await executeTurn(dispatch, getState, state.currentTurn)
  }, [state])

  const aiTakeTurn = useCallback(async (playerIndex: number) => {
    const currentPlayer = state.players[playerIndex]
    if (!currentPlayer || currentPlayer.type !== 'ai') return

    dispatch({ type: 'SET_ANIMATING', value: true })

    const { thinkTime } = getAIMove(currentPlayer.difficulty ?? 'medium')
    await delay(thinkTime)

    await executeTurn(dispatch, getState, playerIndex)
  }, [state])

  return { state, startGame, resetGame, humanRoll, aiTakeTurn, dispatch }
}
