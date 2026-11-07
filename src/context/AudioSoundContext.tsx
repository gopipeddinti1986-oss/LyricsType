import React, { createContext, useContext, useState } from 'react'
import type { KeyboardSound } from '@/types'
import { loadStoredPreferences, saveStoredPreferences } from '@/lib/storage'
import { soundSynth } from '@/lib/soundSynthesis'

interface AudioSoundContextType {
  soundEffect: KeyboardSound
  setSoundEffect: (sound: KeyboardSound) => void
  soundVolume: number
  setSoundVolume: (volume: number) => void
  playKeySound: (isError?: boolean) => void
  playSuccessSound: () => void
}

const AudioSoundContext = createContext<AudioSoundContextType | undefined>(undefined)

export const AudioSoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState(() => loadStoredPreferences())

  const setSoundEffect = (soundEffect: KeyboardSound) => {
    setPreferences((prev) => {
      const updated = { ...prev, soundEffect }
      saveStoredPreferences(updated)
      return updated
    })
  }

  const setSoundVolume = (soundVolume: number) => {
    setPreferences((prev) => {
      const updated = { ...prev, soundVolume }
      saveStoredPreferences(updated)
      return updated
    })
  }

  const playKeySound = (isError: boolean = false) => {
    soundSynth.playKey(preferences.soundEffect, preferences.soundVolume, isError)
  }

  const playSuccessSound = () => {
    soundSynth.playSuccess(preferences.soundVolume)
  }

  return (
    <AudioSoundContext.Provider
      value={{
        soundEffect: preferences.soundEffect,
        setSoundEffect,
        soundVolume: preferences.soundVolume,
        setSoundVolume,
        playKeySound,
        playSuccessSound,
      }}
    >
      {children}
    </AudioSoundContext.Provider>
  )
}

export function useAudioSound() {
  const context = useContext(AudioSoundContext)
  if (!context) {
    throw new Error('useAudioSound must be used within an AudioSoundProvider')
  }
  return context
}
