'use client'

import { useEffect, useState } from 'react'
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

  // Store current path for persistence
  useEffect(() => {
    if (pathname && token) {
      sessionStorage.setItem('ferdi_last_path', pathname)
    }
  }, [pathname, token])

  // Check authentication and session validity
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        // Store intended path for redirect after login
        if (pathname !== '/') {
          sessionStorage.setItem('ferdi_intended_path', pathname)
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
      
      setIsCheckingAuth(false)
    }

    initAuth()
  }, [token, user, isSessionValid, checkAuth, updateActivity, logout, router, pathname])

  // Activity tracking on user interactions
  useEffect(() => {
    const trackActivity = () => {
      if (token && isSessionValid()) {
        updateActivity()
      }
    }

    // Track various user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true })
    })

    // Clean up event listeners
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity)
      })
    }
  }, [token, isSessionValid, updateActivity])

  // Session timeout check
  useEffect(() => {
    const checkSessionTimeout = () => {
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

    return () => clearInterval(intervalId)
  }, [token, isSessionValid, logout, router])

  // Enhanced loading screen
  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
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