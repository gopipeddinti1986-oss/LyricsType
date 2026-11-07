import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AudioSoundProvider } from '@/context/AudioSoundContext'
import { AuthProvider } from '@/context/AuthContext'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'

// Pages
import { LandingPage } from '@/pages/LandingPage'
import { SongCatalogPage } from '@/pages/SongCatalogPage'
import { TypingPracticePage } from '@/pages/TypingPracticePage'
import { ResultsPage } from '@/pages/ResultsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MultiplayerPage } from '@/pages/MultiplayerPage'
import { CoachPage } from '@/pages/CoachPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AuthPage } from '@/pages/AuthPage'

export function App() {
  return (
    <ThemeProvider>
      <AudioSoundProvider>
        <AuthProvider>
          <Router>
            <div className="flex min-h-screen flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
              <Navbar />
              <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/songs" element={<SongCatalogPage />} />
                  <Route path="/play/:id" element={<TypingPracticePage />} />
                  <Route path="/practice" element={<TypingPracticePage />} />
                  <Route path="/results/:sessionId" element={<ResultsPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/multiplayer" element={<MultiplayerPage />} />
                  <Route path="/coach" element={<CoachPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/auth/login" element={<AuthPage />} />
                  <Route path="/auth/register" element={<AuthPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </AudioSoundProvider>
    </ThemeProvider>
  )
}

export default App
