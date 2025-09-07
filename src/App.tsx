import React, { useState } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { Dashboard } from '@/components/Dashboard'
import { HomePage } from '@/components/HomePage'
import '@/globals.css'

function AuthScreen() {
  const [showLogin, setShowLogin] = useState(false)

  if (showLogin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm onBack={() => setShowLogin(false)} />
        </div>
      </div>
    )
  }

  return <HomePage onLoginClick={() => setShowLogin(true)} />
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Φόρτωση...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <div className="dark">
        <AppContent />
      </div>
    </AuthProvider>
  )
}

export default App