import { describe, it, expect } from 'vitest'
import { generateQuestion } from './QuestionEngine'
import { LEVELS } from '../config/levels'

const SAMPLE_SIZE = 500

describe('QuestionEngine', () => {
  LEVELS.forEach(level => {
    describe(`Nivel ${level.id} — ${level.name}`, () => {

      it('genera preguntas con respuesta correcta calculada', () => {
        for (let i = 0; i < SAMPLE_SIZE; i++) {
          const q = generateQuestion(level)
          expect(q.allAnswers).toContain(String(q.correctAnswer))
        }
      })

      it('siempre genera exactamente 4 respuestas', () => {
        for (let i = 0; i < SAMPLE_SIZE; i++) {
          const q = generateQuestion(level)
          expect(q.allAnswers).toHaveLength(4)
        }
      })

      it('las respuestas son únicas', () => {
        for (let i = 0; i < SAMPLE_SIZE; i++) {
          const q = generateQuestion(level)
          const unique = new Set(q.allAnswers)
          expect(unique.size).toBe(4)
        }
      })

      if (level.constraints.requireIntegerResults) {
        it('los resultados son siempre enteros', () => {
          for (let i = 0; i < SAMPLE_SIZE; i++) {
            const q = generateQuestion(level)
            expect(Number.isInteger(q.correctAnswer)).toBe(true)
          }
        })
      }

      if (!level.constraints.allowNegativeResults) {
        it('ninguna respuesta es negativa', () => {
          for (let i = 0; i < SAMPLE_SIZE; i++) {
            const q = generateQuestion(level)
            q.allAnswers.forEach(a => {
              expect(Number(a)).toBeGreaterThanOrEqual(0)
            })
          }
        })
      }

      it('tiene display y opChar', () => {
        const q = generateQuestion(level)
        expect(q.display).toContain('?')
        expect(q.opChar).toBeTruthy()
      })
    })
  })
})
