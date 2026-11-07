import React from 'react'

interface AudioVisualizerProps {
  isPlaying: boolean
  barCount?: number
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 12,
}) => {
  return (
    <div className="flex items-end gap-1 h-6 px-2 select-none">
      {Array.from({ length: barCount }).map((_, i) => {
        const heightPercent = isPlaying
          ? [40, 85, 60, 95, 50, 75, 100, 65, 90, 45, 80, 55][i % 12]
          : 15

        const animationDuration = isPlaying ? `${0.4 + (i % 5) * 0.15}s` : '0s'

        return (
          <span
            key={i}
            className="w-1 rounded-full bg-[var(--accent)] transition-all ease-in-out"
            style={{
              height: `${heightPercent}%`,
              transitionDuration: animationDuration,
              opacity: isPlaying ? 0.9 : 0.3,
            }}
          />
        )
      })}
    </div>
  )
}
