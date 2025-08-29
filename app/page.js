'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FerdiLogoLoading } from '@/components/ui/ferdi-logo'
import { Bus, Zap, Shield, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Écran de chargement amélioré avec le logo Ferdi
const LoadingScreen = ({ status = 'checking' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="text-center space-y-6">
      <div className="relative">
        {/* Logo Ferdi animé */}
        <FerdiLogoLoading size="xl" className="mb-6" />
        
        <p className="text-gray-600 mt-4 font-medium">Gestion de flotte d'autocars</p>
      </div>
      
      <div className="space-y-3">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="text-sm text-gray-500">
          {status === 'checking' && 'Vérification de la session en cours...'}
          {status === 'validating' && 'Validation des permissions...'}
          {status === 'redirecting' && 'Redirection vers votre tableau de bord...'}
        </p>
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

// 🔧 FIX: Error screen for auth failures
const AuthErrorScreen = ({ error, onRetry, onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-xl text-red-800">Erreur d'authentification</CardTitle>
        <CardDescription className="text-red-600">
          Une erreur s'est produite lors de la vérification de votre session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="flex-1"
          >
            Réessayer
          </Button>
          <Button 
            onClick={onLogin} 
            className="flex-1"
          >
            Se connecter
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)

export default function HomePage() {
  const router = useRouter()
  const { token, user, isLoading, checkAuth, isSessionValid, updateActivity } = useAuthStore()
  const [authState, setAuthState] = useState('initial') // initial, checking, validating, authenticated, unauthenticated, error
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const authCheckRef = useRef(false) // Prevent multiple concurrent auth checks

  // 🔧 FIX: Single auth initialization with proper state management
  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent concurrent auth checks
      if (authCheckRef.current) return
      authCheckRef.current = true

      try {
        setAuthState('checking')
        setError(null)

        // Update activity to extend session if valid
        if (isSessionValid()) {
          updateActivity()
        }

        console.log('🔍 Starting auth check...')
        const result = await checkAuth()
        
        if (result.authenticated) {
          console.log('✅ Auth check successful:', result.reason)
          setAuthState('authenticated')
        } else {
          console.log('❌ Auth check failed:', result.reason)
          setAuthState('unauthenticated')
          
          if (result.error) {
            setError(result.error)
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setAuthState('error')
        setError(error.message || 'Erreur lors de la vérification de l\'authentification')
        
        toast.error('Erreur d\'authentification', {
          description: 'Impossible de vérifier votre session'
        })
      } finally {
        authCheckRef.current = false
      }
    }

    initializeAuth()
  }, [checkAuth, isSessionValid, updateActivity])

  // 🔧 FIX: Handle routing based on auth state
  useEffect(() => {
    if (authState === 'authenticated') {
      setAuthState('validating')
      
      // Double-check token and session validity before redirect
      if (token && isSessionValid()) {
        setAuthState('redirecting')
        
        // Get intended path with fallback
        const lastPath = sessionStorage.getItem('ferdi_last_path')
        const redirectPath = (lastPath && lastPath !== '/' && lastPath !== '/auth/login') 
          ? lastPath 
          : '/dashboard'
        
        console.log('🔄 Redirecting authenticated user to:', redirectPath)
        
        setTimeout(() => {
          router.push(redirectPath)
        }, 100) // Small delay to ensure smooth transition
      } else {
        // Token/session invalid, force logout
        console.log('❌ Token/session invalid during redirect, resetting auth state')
        setAuthState('unauthenticated')
      }
    } else if (authState === 'unauthenticated') {
      // Clear any invalid session data
      if (!isSessionValid()) {
        sessionStorage.removeItem('ferdi_last_path')
        sessionStorage.removeItem('ferdi_intended_path')
      }
      
      // Redirect to appropriate page - Always redirect unauthenticated users to login
      router.push('/auth/login')
    }
  }, [authState, token, isSessionValid, router])

  // 🔧 FIX: Retry handler with exponential backoff
  const handleRetry = async () => {
    if (retryCount >= 3) {
      toast.error('Trop de tentatives', {
        description: 'Veuillez rafraîchir la page'
      })
      return
    }
    
    setRetryCount(prev => prev + 1)
    setAuthState('initial') // Reset to trigger new auth check
  }

  const handleGoToLogin = () => {
    router.push('/auth/login')
  }

  // Show loading screen during auth checks
  if (authState === 'initial' || authState === 'checking' || isLoading) {
    return <LoadingScreen status="checking" />
  }

  if (authState === 'validating') {
    return <LoadingScreen status="validating" />
  }

  if (authState === 'redirecting') {
    return <LoadingScreen status="redirecting" />
  }

  // Show error screen for auth failures
  if (authState === 'error') {
    return (
      <AuthErrorScreen 
        error={error}
        onRetry={handleRetry}
        onLogin={handleGoToLogin}
      />
    )
  }

  // Default fallback loading screen
  return <LoadingScreen />
}