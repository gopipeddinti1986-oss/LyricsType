import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AppTheme, UserPreferences } from '@/types'
import { loadStoredPreferences, saveStoredPreferences } from '@/lib/storage'

interface ThemeContextType {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  fontSize: UserPreferences['fontSize']
  setFontSize: (size: UserPreferences['fontSize']) => void
  distractionFree: boolean
  setDistractionFree: (val: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadStoredPreferences())

  useEffect(() => {
    // Apply theme attribute to html document
    const root = document.documentElement
    root.setAttribute('data-theme', preferences.theme)

    // Apply font size class
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-huge')
    root.classList.add(`font-size-${preferences.fontSize}`)
  }, [preferences.theme, preferences.fontSize])

  const setTheme = (theme: AppTheme) => {
    setPreferences((prev) => {
      const updated = { ...prev, theme }
      saveStoredPreferences(updated)
      return updated
    })
  }

  const setFontSize = (fontSize: UserPreferences['fontSize']) => {
    setPreferences((prev) => {
      const updated = { ...prev, fontSize }
      saveStoredPreferences(updated)
      return updated
    })
  }

  const setDistractionFree = (distractionFree: boolean) => {
    setPreferences((prev) => {
      const updated = { ...prev, distractionFree }
      saveStoredPreferences(updated)
      return updated
    })
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: preferences.theme,
        setTheme,
        fontSize: preferences.fontSize,
        setFontSize,
        distractionFree: preferences.distractionFree,
        setDistractionFree,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
