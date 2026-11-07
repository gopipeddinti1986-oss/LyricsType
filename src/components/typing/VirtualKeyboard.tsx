import React from 'react'

interface VirtualKeyboardProps {
  activeChar?: string
  lastTypedChar?: string
  isLastCorrect?: boolean
}

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Space'],
]

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeChar,
  lastTypedChar,
  isLastCorrect,
}) => {
  const normActive = activeChar ? (activeChar === ' ' ? 'Space' : activeChar.toUpperCase()) : ''
  const normLast = lastTypedChar ? (lastTypedChar === ' ' ? 'Space' : lastTypedChar.toUpperCase()) : ''

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-main)]/90 p-4 shadow-inner max-w-3xl mx-auto select-none">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const isTarget = key === normActive
            const isJustPressed = key === normLast

            let widthClass = 'w-9 sm:w-11'
            if (key === 'Space') widthClass = 'w-64 sm:w-80'
            else if (key === 'Backspace' || key === 'Enter') widthClass = 'w-16 sm:w-20'
            else if (key === 'Tab' || key === 'Caps') widthClass = 'w-14 sm:w-16'
            else if (key === 'Shift') widthClass = 'w-20 sm:w-24'

            let stateClass = 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]'

            if (isTarget) {
              stateClass = 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)] font-bold scale-105 shadow-md shadow-[var(--accent-glow)]'
            } else if (isJustPressed) {
              stateClass = isLastCorrect
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold'
                : 'border-red-500 bg-red-500/20 text-red-400 font-bold'
            }

            return (
              <div
                key={key}
                className={`flex h-9 sm:h-10 items-center justify-center rounded-lg border font-mono text-xs transition-all ${widthClass} ${stateClass}`}
              >
                {key === 'Space' ? 'SPACE' : key}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
