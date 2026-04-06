import { motion, AnimatePresence } from 'framer-motion'

const DOTS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
}

interface Props {
  value: number | null
  rolling: boolean
  neonColor: string
  onClick?: () => void
  disabled?: boolean
}

export function Dice({ value, rolling, neonColor, onClick, disabled }: Props) {
  const displayValue = value ?? 1

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.88 } : {}}
      className={`relative w-16 h-16 rounded-2xl border-2 bg-board-cell flex items-center justify-center select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-90'
      }`}
      style={{
        borderColor: neonColor,
        boxShadow: rolling ? `0 0 20px ${neonColor}, 0 0 40px ${neonColor}50` : `0 0 8px ${neonColor}60`,
      }}
      animate={rolling ? { rotate: [0, 180, 360, 540, 720], scale: [1, 1.1, 0.9, 1.1, 1] } : { rotate: 0, scale: 1 }}
      transition={rolling ? { duration: 0.5, ease: 'easeInOut' } : { duration: 0.15 }}
    >
      <AnimatePresence mode="wait">
        <motion.svg
          key={displayValue}
          width="48"
          height="48"
          viewBox="0 0 100 100"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.15 }}
        >
          {DOTS[displayValue].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={10}
              fill={neonColor}
              style={{ filter: `drop-shadow(0 0 4px ${neonColor})` }}
            />
          ))}
        </motion.svg>
      </AnimatePresence>
    </motion.button>
  )
}
