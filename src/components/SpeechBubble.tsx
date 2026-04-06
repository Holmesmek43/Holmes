import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ActiveTaunt } from '../hooks/useGameState'

interface Props {
  taunt: ActiveTaunt | null
  onDismiss: () => void
}

export function SpeechBubble({ taunt, onDismiss }: Props) {
  // Auto-dismiss after 2.5s
  useEffect(() => {
    if (!taunt) return
    const id = setTimeout(onDismiss, 2500)
    return () => clearTimeout(id)
  }, [taunt, onDismiss])

  return (
    <AnimatePresence>
      {taunt && (
        <motion.div
          key={taunt.text + taunt.playerId}
          initial={{ opacity: 0, scale: 0.5, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -6 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          style={{ top: 6 }}
        >
          {/* Bubble */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-game font-bold text-white max-w-[220px] whitespace-nowrap"
            style={{
              background: `${taunt.neonColor}22`,
              border: `1.5px solid ${taunt.neonColor}`,
              boxShadow: `0 0 12px ${taunt.neonColor}60`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="text-base flex-shrink-0">{taunt.emoji}</span>
            <span className="text-xs leading-tight truncate" style={{ color: taunt.neonColor }}>
              {taunt.text}
            </span>
          </div>
          {/* Tail */}
          <div
            className="w-3 h-3 mx-auto -mt-1 rotate-45 rounded-sm"
            style={{ background: taunt.neonColor, opacity: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
