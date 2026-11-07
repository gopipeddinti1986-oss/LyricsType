import { useState, useEffect, useCallback, useRef } from 'react'
import type { LyricSegment, TypingMode, TypingMetrics } from '@/types'
import { calculateTypingMetrics } from '@/lib/wpmCalculator'

interface UseTypingEngineProps {
  segments: LyricSegment[]
  playbackTime: number
  mode: TypingMode
  onLineComplete?: (lineIndex: number, lineText: string) => void
  onSongComplete?: (finalMetrics: TypingMetrics) => void
  onCharacterTyped?: (char: string, isCorrect: boolean) => void
}

export function useTypingEngine({
  segments,
  playbackTime,
  mode,
  onLineComplete,
  onSongComplete,
  onCharacterTyped,
}: UseTypingEngineProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [inputBuffer, setInputBuffer] = useState('')
  const [totalTypedChars, setTotalTypedChars] = useState(0)
  const [correctChars, setCorrectChars] = useState(0)
  const [incorrectChars, setIncorrectChars] = useState(0)
  const [errorsCount, setErrorsCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [characterStats, setCharacterStats] = useState<Record<string, { correct: number; incorrect: number }>>({})
  const [wpmHistory, setWpmHistory] = useState<number[]>([])

  const totalTargetChars = useRef(0)
  const timerRef = useRef<number | null>(null)

  // Compute total target characters for completion percentage
  useEffect(() => {
    totalTargetChars.current = segments.reduce((sum, seg) => sum + seg.text.length, 0)
  }, [segments])

  // Timer loop for tracking elapsed practice time and live metrics
  useEffect(() => {
    if (startTime && !isPaused && !isCompleted) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 0.5
          // Track WPM history every 2 seconds
          if (Math.round(next) % 2 === 0) {
            const currentWpm = Math.round((correctChars / 5) / (Math.max(next, 1) / 60))
            setWpmHistory((hist) => [...hist.slice(-20), currentWpm])
          }
          return next
        })
      }, 500)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTime, isPaused, isCompleted, correctChars])

  // Rhythm mode: sync with playbackTime to automatically advance if the song outpaces user
  useEffect(() => {
    if (mode === 'rhythm' && segments.length > 0 && !isCompleted) {
      const activeSegment = segments[currentLineIndex]
      if (activeSegment && activeSegment.endTime && playbackTime > activeSegment.endTime + 0.5) {
        // Line timed out in rhythm mode
        if (currentLineIndex < segments.length - 1) {
          setCurrentLineIndex((prev) => prev + 1)
          setInputBuffer('')
        } else {
          finishSession()
        }
      }
    }
  }, [playbackTime, mode, segments, currentLineIndex, isCompleted])

  const finishSession = useCallback(() => {
    setIsCompleted(true)
    const metrics = calculateTypingMetrics({
      totalTypedChars,
      correctChars,
      incorrectChars,
      errorsCount,
      elapsedSeconds: Math.max(elapsedSeconds, 1),
      totalTargetChars: totalTargetChars.current,
      characterStats,
    })
    onSongComplete?.(metrics)
  }, [totalTypedChars, correctChars, incorrectChars, errorsCount, elapsedSeconds, characterStats, onSongComplete])

  // Handle keystroke input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (isPaused || isCompleted || segments.length === 0) return

      // Ignore modifier keys, functional shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Tab' || e.key === 'Escape') return

      const currentTargetLine = segments[currentLineIndex]?.text || ''

      // Start timing upon first keystroke
      if (!startTime) {
        setStartTime(Date.now())
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (inputBuffer.length > 0) {
          setInputBuffer((prev) => prev.slice(0, -1))
        }
        return
      }

      // We only accept single character keys (including Unicode letters, numbers, punctuation, spaces)
      if (e.key.length !== 1 && e.key !== 'Enter') return

      e.preventDefault()

      const inputChar = e.key === 'Enter' ? '\n' : e.key
      const targetIndex = inputBuffer.length
      const expectedChar = currentTargetLine[targetIndex]

      if (!expectedChar) {
        // Line already filled, user hits Enter or space to proceed
        if (e.key === 'Enter' || e.key === ' ') {
          advanceLine()
        }
        return
      }

      const isCorrect = inputChar === expectedChar

      // Challenge Mode: If user makes a mistake, reset current line as a precision penalty
      if (mode === 'challenge' && !isCorrect) {
        setErrorsCount((prev) => prev + 1)
        setIncorrectChars((prev) => prev + 1)
        setTotalTypedChars((prev) => prev + 1)
        setInputBuffer('') // Reset line!
        onCharacterTyped?.(inputChar, false)
        return
      }

      // Update character analytics
      setCharacterStats((prev) => {
        const charKey = expectedChar.toLowerCase()
        const existing = prev[charKey] || { correct: 0, incorrect: 0 }
        return {
          ...prev,
          [charKey]: {
            correct: existing.correct + (isCorrect ? 1 : 0),
            incorrect: existing.incorrect + (isCorrect ? 0 : 1),
          },
        }
      })

      setTotalTypedChars((prev) => prev + 1)
      if (isCorrect) {
        setCorrectChars((prev) => prev + 1)
      } else {
        setIncorrectChars((prev) => prev + 1)
        setErrorsCount((prev) => prev + 1)
      }

      onCharacterTyped?.(inputChar, isCorrect)

      const nextInput = inputBuffer + inputChar
      setInputBuffer(nextInput)

      // If finished typing current line
      if (nextInput.length >= currentTargetLine.length) {
        advanceLine()
      }
    },
    [
      isPaused,
      isCompleted,
      segments,
      currentLineIndex,
      startTime,
      inputBuffer,
      mode,
      onCharacterTyped,
    ]
  )

  const advanceLine = () => {
    onLineComplete?.(currentLineIndex, segments[currentLineIndex]?.text || '')

    if (currentLineIndex < segments.length - 1) {
      setCurrentLineIndex((prev) => prev + 1)
      setInputBuffer('')
    } else {
      finishSession()
    }
  }

  const restart = useCallback(() => {
    setCurrentLineIndex(0)
    setInputBuffer('')
    setTotalTypedChars(0)
    setCorrectChars(0)
    setIncorrectChars(0)
    setErrorsCount(0)
    setIsPaused(false)
    setIsCompleted(false)
    setStartTime(null)
    setElapsedSeconds(0)
    setCharacterStats({})
    setWpmHistory([])
  }, [])

  const currentMetrics = calculateTypingMetrics({
    totalTypedChars,
    correctChars,
    incorrectChars,
    errorsCount,
    elapsedSeconds,
    totalTargetChars: totalTargetChars.current,
    characterStats,
  })

  return {
    currentLineIndex,
    setCurrentLineIndex,
    inputBuffer,
    currentMetrics,
    wpmHistory,
    isPaused,
    setIsPaused,
    isCompleted,
    handleKeyDown,
    restart,
  }
}
