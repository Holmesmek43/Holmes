import { useReducer, useCallback } from 'react'
import { Difficulty, movePlayer } from '../game/gameEngine'
import { getAIMove } from '../game/aiEngine'
import { sounds } from '../game/sounds'

export type PlayerType = 'human' | 'ai'
export type GamePhase = 'setup' | 'playing' | 'won'

export interface Player {
  id: number
  name: string
  type: PlayerType
  difficulty?: Difficulty
  color: string      // tailwind color key
  neonColor: string  // hex
  emoji: string
  position: number
  isMoving: boolean
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  currentTurn: number  // index into players
  lastRoll: number | null
  lastSpecial: 'ladder' | 'chute' | null
  winner: Player | null
  message: string
  isAnimating: boolean
}

type Action =
  | { type: 'START_GAME'; players: Player[] }
  | { type: 'ROLL_DICE'; roll: number }
  | { type: 'APPLY_MOVE'; playerId: number; result: ReturnType<typeof movePlayer> }
  | { type: 'NEXT_TURN' }
  | { type: 'SET_ANIMATING'; value: boolean }
  | { type: 'RESET' }

const initialState: GameState = {
  phase: 'setup',
  players: [],
  currentTurn: 0,
  lastRoll: null,
  lastSpecial: null,
  winner: null,
  message: '',
  isAnimating: false,
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return { ...initialState, phase: 'playing', players: action.players }

    case 'ROLL_DICE':
      return { ...state, lastRoll: action.roll, lastSpecial: null }

    case 'APPLY_MOVE': {
      const players = state.players.map(p =>
        p.id === action.playerId
          ? { ...p, position: action.result.newPosition, isMoving: false }
          : p
      )
      const winner = action.result.won ? players.find(p => p.id === action.playerId) ?? null : null
      return {
        ...state,
        players,
        lastSpecial: action.result.special,
        winner,
        phase: winner ? 'won' : 'playing',
        message: action.result.special === 'ladder'
          ? '🪜 Ladder! Climbing up!'
          : action.result.special === 'chute'
          ? '🐍 Chute! Sliding down!'
          : '',
      }
    }

    case 'NEXT_TURN': {
      const next = (state.currentTurn + 1) % state.players.length
      return { ...state, currentTurn: next, lastRoll: null, lastSpecial: null, message: '' }
    }

    case 'SET_ANIMATING':
      return { ...state, isAnimating: action.value }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const startGame = useCallback((players: Player[]) => {
    dispatch({ type: 'START_GAME', players })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  // Human rolls
  const humanRoll = useCallback(async () => {
    if (state.isAnimating || state.phase !== 'playing') return
    const currentPlayer = state.players[state.currentTurn]
    if (currentPlayer.type !== 'human') return

    dispatch({ type: 'SET_ANIMATING', value: true })
    sounds.dice()

    // Short delay for dice animation
    await delay(600)

    const roll = Math.floor(Math.random() * 6) + 1
    dispatch({ type: 'ROLL_DICE', roll })
    sounds.move()

    await delay(400)

    const result = movePlayer(currentPlayer.position, roll)
    dispatch({ type: 'APPLY_MOVE', playerId: currentPlayer.id, result })

    if (result.special === 'ladder') {
      await delay(200)
      sounds.ladder()
    } else if (result.special === 'chute') {
      await delay(200)
      sounds.chute()
    }

    if (result.won) {
      await delay(500)
      sounds.win()
      dispatch({ type: 'SET_ANIMATING', value: false })
      return
    }

    await delay(800)
    dispatch({ type: 'NEXT_TURN' })
    sounds.turn()
    dispatch({ type: 'SET_ANIMATING', value: false })
  }, [state])

  // AI takes its turn
  const aiTakeTurn = useCallback(async (playerIndex: number) => {
    const currentPlayer = state.players[playerIndex]
    if (!currentPlayer || currentPlayer.type !== 'ai') return

    dispatch({ type: 'SET_ANIMATING', value: true })

    const { roll, thinkTime } = getAIMove(currentPlayer.difficulty ?? 'medium')

    // "Thinking" delay
    await delay(thinkTime)
    sounds.dice()
    dispatch({ type: 'ROLL_DICE', roll })

    await delay(600)
    sounds.move()

    const result = movePlayer(currentPlayer.position, roll)
    dispatch({ type: 'APPLY_MOVE', playerId: currentPlayer.id, result })

    if (result.special === 'ladder') {
      await delay(200)
      sounds.ladder()
    } else if (result.special === 'chute') {
      await delay(200)
      sounds.chute()
    }

    if (result.won) {
      await delay(500)
      sounds.win()
      dispatch({ type: 'SET_ANIMATING', value: false })
      return
    }

    await delay(900)
    dispatch({ type: 'NEXT_TURN' })
    sounds.turn()
    dispatch({ type: 'SET_ANIMATING', value: false })
  }, [state])

  return { state, startGame, resetGame, humanRoll, aiTakeTurn, dispatch }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
