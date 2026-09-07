"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Footer from "@/components/footer"
import AuthModal from "@/components/modals/auth-modal"
import { useAuth } from "@/lib/auth"

export default function Home() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ✅ Top Navigation */}
      <Navigation
        onLoginClick={() => {
          setAuthMode('login')
          setShowAuthModal(true)
        }}
        onRegisterClick={() => {
          setAuthMode('register')
          setShowAuthModal(true)
        }}
      />

      {/* ✅ Hero section */}
      <Hero />

      {/* ✅ Footer */}
      <Footer />

      {/* ✅ Auth modal (Login/Register) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    </div>
  )
}
