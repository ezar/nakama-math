import { motion } from 'framer-motion'

type AnswerState = 'idle' | 'correct' | 'wrong'

interface AnswerButtonProps {
  label: string
  state: AnswerState
  disabled: boolean
  onClick: () => void
}

const stateClasses: Record<AnswerState, string> = {
  idle: 'bg-navy-700 border-navy-600 text-white',
  correct: 'bg-emerald-600 border-emerald-400 text-white',
  wrong: 'bg-pirate-red border-pirate-red-dark text-white',
}

export function AnswerButton({ label, state, disabled, onClick }: AnswerButtonProps) {
  const hoverClasses = !disabled && state === 'idle' ? 'hover:bg-navy-600 hover:border-gold-400' : ''

  return (
    <motion.button
      whileHover={!disabled && state === 'idle' ? { scale: 1.03 } : {}}
      whileTap={!disabled && state === 'idle' ? { scale: 0.97 } : {}}
      animate={state === 'correct' ? { scale: [1, 1.08, 1] } : state === 'wrong' ? { x: [-6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Respuesta: ${label}`}
      className={`w-full py-4 px-6 rounded-2xl border-2 font-nunito font-bold text-xl transition-colors duration-150 ${stateClasses[state]} ${hoverClasses} ${disabled && state === 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {label}
    </motion.button>
  )
}
