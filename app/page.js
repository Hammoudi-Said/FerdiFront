'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FerdiLogoLoading } from '@/components/ui/ferdi-logo'
import { Bus, Zap, Shield, Users } from 'lucide-react'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Écran de chargement amélioré avec le logo Ferdi
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="text-center space-y-6">
      <div className="relative">
        {/* Logo Ferdi animé */}
        <FerdiLogoLoading size="xl" className="mb-6" />
        
        <p className="text-gray-600 mt-4 font-medium">Gestion de flotte d'autocars</p>
      </div>
      
      <div className="space-y-3">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="text-sm text-gray-500">Vérification de la session en cours...</p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600">Gestion d'équipe</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Bus className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600">Flotte complète</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-xs text-gray-600">En temps réel</p>
        </div>
      </div>
    </div>
  </div>
)

export default function HomePage() {
  const router = useRouter()
  const { token, user, isLoading, checkAuth, isSessionValid, updateActivity } = useAuthStore()
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      // Update activity to extend session if valid
      if (isSessionValid()) {
        updateActivity()
      }
      
      await checkAuth()
      setInitialLoad(false)
    }
    
    initAuth()
  }, [checkAuth, isSessionValid, updateActivity])

  useEffect(() => {
    if (!initialLoad && !isLoading) {
      if (token && isSessionValid()) {
        // Simple redirect to dashboard - no role-specific routing for now
        const lastPath = sessionStorage.getItem('ferdi_last_path')
        if (lastPath && lastPath !== '/' && lastPath !== '/auth/login') {
          router.push(lastPath)
        } else {
          // Always redirect to main dashboard
          router.push('/dashboard')
        }
      } else {
        // Clear any invalid session data
        if (!isSessionValid()) {
          sessionStorage.removeItem('ferdi_last_path')
          sessionStorage.removeItem('ferdi_intended_path')
        }
        
        // If in mock mode, show demo page first
        if (USE_MOCK_DATA) {
          router.push('/demo')
        } else {
          router.push('/auth/login')
        }
      }
    }
  }, [token, user, isLoading, router, initialLoad, isSessionValid])

  // Show enhanced loading screen during initial auth check
  return <LoadingScreen />
}