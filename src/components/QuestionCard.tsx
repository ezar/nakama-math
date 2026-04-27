import { motion } from 'framer-motion'
import type { Question } from '../engine/types'

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center gap-4 py-8 px-6 bg-navy-700 rounded-3xl border-2 border-navy-600 shadow-2xl"
    >
      <span className="text-5xl">{question.opChar}</span>
      <p className="font-bangers text-5xl text-white tracking-wide text-center leading-tight">
        {question.display}
      </p>
    </motion.div>
  )
}
