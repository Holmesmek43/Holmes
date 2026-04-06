import { motion } from 'framer-motion'
import { sounds } from '../game/sounds'

interface Props {
  muted: boolean
  speed: number
  onToggleMute: () => void
  onSetSpeed: (v: number) => void
}

const SPEEDS = [0.5, 1, 2]
const SPEED_LABELS: Record<number, string> = { 0.5: '½×', 1: '1×', 2: '2×' }

export function GameToolbar({ muted, speed, onToggleMute, onSetSpeed }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Mute button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => { sounds.click(); onToggleMute() }}
        className="w-8 h-8 rounded-xl flex items-center justify-center border text-sm transition-colors"
        style={{
          borderColor: muted ? '#ffffff30' : '#00f5ff',
          background: muted ? '#1a1a2e' : '#00f5ff18',
          color: muted ? '#ffffff50' : '#00f5ff',
          boxShadow: muted ? 'none' : '0 0 6px #00f5ff60',
        }}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </motion.button>

      {/* Speed buttons */}
      {SPEEDS.map(s => (
        <motion.button
          key={s}
          whileTap={{ scale: 0.88 }}
          onClick={() => { sounds.click(); onSetSpeed(s) }}
          className="h-8 px-2 rounded-xl font-game font-bold text-xs border transition-colors"
          style={{
            borderColor: speed === s ? '#ffe500' : '#ffffff20',
            background: speed === s ? '#ffe50018' : '#1a1a2e',
            color: speed === s ? '#ffe500' : '#ffffff40',
            boxShadow: speed === s ? '0 0 6px #ffe50060' : 'none',
          }}
        >
          {SPEED_LABELS[s]}
        </motion.button>
      ))}
    </div>
  )
}
