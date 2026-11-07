import React, { createContext, useContext, useEffect, useState } from 'react'
import type { UserProfile } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { DEFAULT_PREFERENCES, loadStoredPreferences } from '@/lib/storage'

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isGuest: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string, username: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  continueAsGuest: (customUsername?: string) => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const GUEST_KEY = 'lyricstype_guest_user'

function getInitialGuestUser(customUsername?: string): UserProfile {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}

  const guestName = customUsername || `RhythmTyper_${Math.floor(1000 + Math.random() * 9000)}`
  const newUser: UserProfile = {
    id: `guest_${Date.now()}`,
    email: `${guestName.toLowerCase()}@guest.local`,
    username: guestName,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestName}`,
    bio: 'Music and typing enthusiast.',
    createdAt: new Date().toISOString(),
    totalPracticeTimeSeconds: 0,
    totalSessions: 0,
    bestWpm: 0,
    averageWpm: 0,
    averageAccuracy: 100,
    preferences: loadStoredPreferences(),
  }
  localStorage.setItem(GUEST_KEY, JSON.stringify(newUser))
  return newUser
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession()
          if (data?.session?.user) {
            const sbUser = data.session.user
            // Fetch profile record
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sbUser.id)
              .single()

            if (profile) {
              setUser({
                id: profile.id,
                email: sbUser.email || '',
                username: profile.username || 'MusicTyper',
                avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`,
                bio: profile.bio || '',
                createdAt: profile.created_at || new Date().toISOString(),
                totalPracticeTimeSeconds: profile.total_practice_time_seconds || 0,
                totalSessions: profile.total_sessions || 0,
                bestWpm: profile.best_wpm || 0,
                averageWpm: profile.average_wpm || 0,
                averageAccuracy: profile.average_accuracy || 100,
                preferences: profile.preferences || DEFAULT_PREFERENCES,
              })
              setIsGuest(false)
              setIsLoading(false)
              return
            }
          }
        } catch (err) {
          console.warn('Supabase auth check failed, falling back to guest mode', err)
        }
      }

      // Default to guest session
      const guest = getInitialGuestUser()
      setUser(guest)
      setIsGuest(true)
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase is not configured yet. Using guest mode.') }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase is not configured yet. Using guest mode.') }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })
    if (data?.user && !error) {
      // create profile row
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        email,
      })
    }
    return { error: error ? new Error(error.message) : null }
  }

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    const guest = getInitialGuestUser()
    setUser(guest)
    setIsGuest(true)
  }

  const continueAsGuest = (customUsername?: string) => {
    const guest = getInitialGuestUser(customUsername)
    setUser(guest)
    setIsGuest(true)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    const updated = { ...user, ...updates }
    setUser(updated)

    if (isGuest) {
      localStorage.setItem(GUEST_KEY, JSON.stringify(updated))
    } else if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({
          username: updated.username,
          bio: updated.bio,
          avatar_url: updated.avatarUrl,
        })
        .eq('id', user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        continueAsGuest,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
