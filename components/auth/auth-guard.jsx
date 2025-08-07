'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FerdiLogoLoading } from '@/components/ui/ferdi-logo'
import { Shield, RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Enhanced Auth Guard Component - Protects the entire application
 */
export function AuthGuard({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    user, 
    token, 
    isLoading, 
    error,
    isInitialized,
    checkAuth, 
    clearError,
    saveCurrentPath,
    saveIntendedPath,
    getIntendedPath
  } = useAuthStore()
  
  const [authState, setAuthState] = useState('checking') // checking, authenticated, unauthenticated, error
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/demo', '/']
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    const performAuthCheck = async () => {
      console.log('🔍 AuthGuard: Performing auth check for path:', pathname)
      
      // Don't check auth for public routes
      if (isPublicRoute) {
        console.log('📖 Public route, skipping auth check')
        setAuthState('public')
        return
      }

      // Wait for store to be initialized
      if (!isInitialized) {
        console.log('⏳ Store not initialized, waiting...')
        return
      }

      // Save current path for navigation history
      saveCurrentPath(pathname)

      try {
        setAuthState('checking')
        clearError() // Clear any previous errors
        
        const result = await checkAuth()
        
        if (result.authenticated) {
          console.log('✅ Auth check passed')
          setAuthState('authenticated')
          setRetryCount(0) // Reset retry count on success
          
          // Handle intended path redirect
          const intendedPath = getIntendedPath()
          if (intendedPath && intendedPath !== pathname) {
            console.log('🔄 Redirecting to intended path:', intendedPath)
            router.push(intendedPath)
            return
          }
        } else {
          console.log('❌ Auth check failed:', result.reason)
          
          // Save intended path for redirect after login
          if (pathname !== '/auth/login') {
            saveIntendedPath(pathname)
          }
          
          setAuthState('unauthenticated')
          
          // Show appropriate toast message based on reason
          if (result.reason === 'session_timeout') {
            toast.warning('Votre session a expiré', {
              description: 'Veuillez vous reconnecter pour continuer'
            })
          } else if (result.reason === 'auth_failed') {
            toast.error('Erreur d\'authentification', {
              description: result.error || 'Veuillez vous reconnecter'
            })
          }
          
          // Redirect to login
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('❌ Auth check error:', error)
        setAuthState('error')
        
        toast.error('Erreur de vérification', {
          description: 'Impossible de vérifier votre authentification'
        })
      }
    }

    performAuthCheck()
  }, [
    pathname, 
    isInitialized, 
    checkAuth, 
    router, 
    isPublicRoute,
    clearError,
    saveCurrentPath,
    saveIntendedPath,
    getIntendedPath
  ])

  // Handle retry authentication
  const handleRetry = async () => {
    if (retryCount >= 3) {
      toast.error('Trop de tentatives', {
        description: 'Veuillez rafraîchir la page ou contacter le support'
      })
      return
    }
    
    setRetryCount(prev => prev + 1)
    
    // Force a fresh auth check
    try {
      const result = await checkAuth(true) // Skip cache
      if (result.authenticated) {
        setAuthState('authenticated')
        setRetryCount(0)
        toast.success('Connexion rétablie')
      } else {
        setAuthState('unauthenticated')
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Retry auth failed:', error)
      toast.error('Échec de la reconnexion')
    }
  }

  // Public routes - render directly
  if (authState === 'public') {
    return children
  }

  // Checking authentication - show loading with Ferdi logo
  if (authState === 'checking' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-6">
          <div className="relative">
            {/* Logo Ferdi avec animation d'authentification */}
            <FerdiLogoLoading size="xl" className="mb-6" />
            
            <p className="text-gray-600 mt-4 font-medium">Vérification de l'authentification</p>
          </div>
          
          <div className="space-y-3">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="text-sm text-gray-500">Contrôle des permissions en cours...</p>
            
            {!isOnline && (
              <div className="flex items-center justify-center space-x-2 text-amber-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Mode hors ligne détecté</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Authentication error - show retry option
  if (authState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-800">Erreur d'authentification</CardTitle>
            <CardDescription className="text-red-600">
              Impossible de vérifier votre authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {!isOnline && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <WifiOff className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Connexion internet requise pour la vérification
                  </p>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                className="flex-1"
                disabled={!isOnline || retryCount >= 3}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer {retryCount > 0 && `(${retryCount}/3)`}
              </Button>
              <Button 
                onClick={() => router.push('/auth/login')} 
                className="flex-1"
              >
                Se connecter
              </Button>
            </div>
            
            {retryCount >= 3 && (
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-gray-500"
                >
                  Rafraîchir la page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authenticated - render children
  if (authState === 'authenticated') {
    return children
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default AuthGuard