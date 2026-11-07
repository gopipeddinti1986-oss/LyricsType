import { describe, it, expect } from 'vitest'
import { calculateTypingMetrics, calculateConsistency, STANDARD_WORD_LENGTH } from '../lib/wpmCalculator'

describe('WPM and Accuracy Calculator', () => {
  it('standard word length is 5 characters', () => {
    expect(STANDARD_WORD_LENGTH).toBe(5)
  })

  it('calculates 60 WPM accurately for 300 correct characters in 60 seconds', () => {
    // 300 chars / 5 = 60 words in 1 minute = 60 WPM
    const metrics = calculateTypingMetrics({
      totalTypedChars: 300,
      correctChars: 300,
      incorrectChars: 0,
      errorsCount: 0,
      elapsedSeconds: 60,
      totalTargetChars: 300,
    })

    expect(metrics.grossWpm).toBe(60)
    expect(metrics.netWpm).toBe(60)
    expect(metrics.accuracy).toBe(100)
    expect(metrics.completionRate).toBe(100)
  })

  it('differentiates gross WPM and net WPM when errors exist', () => {
    // 300 total chars typed in 60 seconds (60 Gross WPM)
    // 250 correct chars (50 Net WPM)
    const metrics = calculateTypingMetrics({
      totalTypedChars: 300,
      correctChars: 250,
      incorrectChars: 50,
      errorsCount: 50,
      elapsedSeconds: 60,
      totalTargetChars: 300,
    })

    expect(metrics.grossWpm).toBe(60)
    expect(metrics.netWpm).toBe(50)
    expect(metrics.accuracy).toBeCloseTo(83.3, 1)
  })

  it('handles zero elapsed time safely without NaN or infinity', () => {
    const metrics = calculateTypingMetrics({
      totalTypedChars: 0,
      correctChars: 0,
      incorrectChars: 0,
      errorsCount: 0,
      elapsedSeconds: 0,
      totalTargetChars: 100,
    })

    expect(metrics.grossWpm).toBe(0)
    expect(metrics.netWpm).toBe(0)
    expect(metrics.accuracy).toBe(100)
    expect(metrics.completionRate).toBe(0)
  })

  it('calculates consistency score', () => {
    expect(calculateConsistency([60, 60, 60, 60])).toBe(100)
    expect(calculateConsistency([20, 80, 20, 80])).toBeLessThan(60)
  })
})
