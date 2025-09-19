'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeader } from './dashboard-header'
import { toast } from 'sonner'

export function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    user, 
    token, 
    isLoading, 
    checkAuth, 
    isSessionValid, 
    updateActivity,
    logout
  } = useAuthStore()
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  // 🔧 FIX: Add mounted ref to prevent state updates on unmounted component
  const mountedRef = useRef(true)
  const activityTimeoutRef = useRef(null)

  // 🔧 FIX: Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [])

  // Store current path for persistence
  useEffect(() => {
    if (pathname && token && mountedRef.current) {
      try {
        sessionStorage.setItem('ferdi_last_path', pathname)
      } catch (error) {
        console.warn('Failed to save current path:', error)
      }
    }
  }, [pathname, token])

  // 🔧 FIX: Enhanced authentication check with better error handling
  useEffect(() => {
    const initAuth = async () => {
      if (!mountedRef.current) return

      try {
        if (!token) {
          // Store intended path for redirect after login
          if (pathname !== '/') {
            try {
              sessionStorage.setItem('ferdi_intended_path', pathname)
            } catch (error) {
              console.warn('Failed to save intended path:', error)
            }
          }
          router.push('/auth/login')
          return
        }

        // Check if session is still valid
        if (!isSessionValid()) {
          toast.error('Session expirée', {
            description: 'Veuillez vous reconnecter'
          })
          logout()
          router.push('/auth/login')
          return
        }

        // Update activity and check auth if no user data
        updateActivity()
        
        if (!user) {
          await checkAuth()
        }
        
        if (mountedRef.current) {
          setIsCheckingAuth(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mountedRef.current) {
          setIsCheckingAuth(false)
          toast.error('Erreur d\'authentification', {
            description: 'Veuillez vous reconnecter'
          })
          router.push('/auth/login')
        }
      }
    }

    initAuth()
  }, [token, user, isSessionValid, checkAuth, updateActivity, logout, router, pathname])

  // 🔧 FIX: Enhanced activity tracking with throttling and proper cleanup
  const throttledUpdateActivity = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current)
    }
    
    // Throttle activity updates to prevent excessive calls
    activityTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && token && isSessionValid()) {
        updateActivity()
      }
    }, 1000) // 1-second throttle
  }, [token, isSessionValid, updateActivity])

  useEffect(() => {
    if (!token || !isSessionValid()) return

    // Track various user activities with throttling
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, { passive: true })
    })

    // 🔧 FIX: Enhanced cleanup to prevent memory leaks
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity)
      })
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [token, isSessionValid, throttledUpdateActivity])

  // 🔧 FIX: Enhanced session timeout check with race condition prevention
  useEffect(() => {
    if (!token) return

    const checkSessionTimeout = () => {
      if (!mountedRef.current) return
      
      if (token && !isSessionValid()) {
        toast.error('Session expirée', {
          description: 'Vous avez été déconnecté pour inactivité'
        })
        logout()
        router.push('/auth/login')
      }
    }

    // Check session every minute
    const intervalId = setInterval(checkSessionTimeout, 60 * 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [token, isSessionValid, logout, router])

  // Enhanced loading screen
  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse"></div>
            <LoadingSpinner size="lg" className="relative z-10" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chargement du tableau de bord</h3>
            <p className="text-sm text-gray-600 mt-1">Vérification des autorisations...</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user exists and session is valid
  if (!token || !user || !isSessionValid()) {
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}