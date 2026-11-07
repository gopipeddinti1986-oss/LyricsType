import type { TypingMetrics } from '@/types'

/**
 * Standard Typing Calculation Engine
 * 
 * Standard Applied:
 * - 1 Word = 5 keystrokes (standard international typing convention, Monkeytype/TypeRacer).
 * - Gross WPM = (Total characters typed / 5) / (Elapsed minutes)
 * - Net WPM = (Correct characters typed / 5) / (Elapsed minutes)
 * - Accuracy = (Correct characters / Total typed characters) * 100%
 */

export const STANDARD_WORD_LENGTH = 5

export interface CalculationInput {
  totalTypedChars: number
  correctChars: number
  incorrectChars: number
  errorsCount: number
  elapsedSeconds: number
  totalTargetChars: number
  characterStats?: Record<string, { correct: number; incorrect: number }>
}

/**
 * Calculates typing performance metrics in real time.
 */
export function calculateTypingMetrics(input: CalculationInput): TypingMetrics {
  const {
    totalTypedChars,
    correctChars,
    incorrectChars,
    errorsCount,
    elapsedSeconds,
    totalTargetChars,
    characterStats = {},
  } = input

  const minutes = Math.max(elapsedSeconds / 60, 0.001) // Prevent division by zero

  // Gross WPM: All typed characters including mistakes divided by standard word length (5)
  const grossWpm = Math.round((totalTypedChars / STANDARD_WORD_LENGTH) / minutes)

  // Net WPM: Correct characters only divided by 5 per minute
  const netWpm = Math.max(0, Math.round((correctChars / STANDARD_WORD_LENGTH) / minutes))

  // Accuracy percentage
  const accuracy = totalTypedChars > 0 
    ? Math.min(100, Math.max(0, parseFloat(((correctChars / totalTypedChars) * 100).toFixed(1))))
    : 100

  // Completion percentage of current lyrics
  const completionRate = totalTargetChars > 0
    ? Math.min(100, Math.max(0, parseFloat(((correctChars / totalTargetChars) * 100).toFixed(1))))
    : 0

  return {
    grossWpm,
    netWpm,
    accuracy,
    correctChars,
    incorrectChars,
    totalTypedChars,
    errorsCount,
    elapsedSeconds: Math.round(elapsedSeconds),
    completionRate,
    characterStats,
  }
}

/**
 * Evaluates typing consistency score (0 - 100%) based on WPM sample variance.
 */
export function calculateConsistency(wpmHistory: number[]): number {
  if (wpmHistory.length < 2) return 100

  const mean = wpmHistory.reduce((acc, v) => acc + v, 0) / wpmHistory.length
  if (mean === 0) return 100

  const variance = wpmHistory.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / wpmHistory.length
  const standardDeviation = Math.sqrt(variance)
  const coefficientOfVariation = (standardDeviation / mean) * 100

  // Lower variation means higher consistency
  return Math.max(0, Math.min(100, Math.round(100 - coefficientOfVariation)))
}
