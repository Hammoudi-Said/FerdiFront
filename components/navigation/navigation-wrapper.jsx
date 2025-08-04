'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Navigation Wrapper - Provides enhanced navigation controls and history management
 */
export function NavigationWrapper({ children, showBackButton = true, showHomeButton = true }) {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    navigationHistory, 
    saveCurrentPath, 
    updateActivity,
    getRoleDashboard,
    user 
  } = useAuthStore()

  // Save current path on route changes
  useEffect(() => {
    saveCurrentPath(pathname)
    updateActivity() // Update activity on navigation
  }, [pathname, saveCurrentPath, updateActivity])

  // Handle browser back/forward events
  useEffect(() => {
    const handlePopState = (event) => {
      console.log('🔙 Browser navigation detected:', event.state)
      updateActivity()
      
      // Show toast for navigation
      if (event.state?.fromHistory) {
        toast.info('Navigation dans l\'historique')
      }
    }

    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [updateActivity])

  // Enhanced back navigation
  const handleGoBack = () => {
    console.log('🔙 Go back requested, history:', navigationHistory)
    
    // If we have navigation history, use it
    if (navigationHistory.length > 1) {
      const previousPath = navigationHistory[1] // [0] is current, [1] is previous
      console.log('📍 Going to previous path:', previousPath)
      
      // Update history state
      window.history.pushState({ fromHistory: true }, '', previousPath)
      router.push(previousPath)
      
      toast.info('Retour à la page précédente')
    } else {
      // Fallback to browser back
      console.log('📍 Using browser back')
      
      if (window.history.length > 1) {
        router.back()
        toast.info('Retour')
      } else {
        // No history, go to dashboard
        const dashboardPath = getRoleDashboard()
        router.push(dashboardPath)
        toast.info('Retour au tableau de bord')
      }
    }
    
    updateActivity()
  }

  // Go to role-specific home
  const handleGoHome = () => {
    const dashboardPath = getRoleDashboard()
    console.log('🏠 Going to dashboard:', dashboardPath)
    
    router.push(dashboardPath)
    toast.success('Retour au tableau de bord')
    updateActivity()
  }

  // Don't show navigation on auth pages
  const isAuthPage = pathname.startsWith('/auth/') || pathname === '/demo' || pathname === '/'
  
  if (isAuthPage) {
    return children
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Enhanced Navigation Bar */}
      {(showBackButton || showHomeButton) && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Retour à la page précédente"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            )}
            
            {showHomeButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoHome}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Retour au tableau de bord"
              >
                <Home className="h-4 w-4 mr-1" />
                Accueil
              </Button>
            )}
          </div>
          
          {/* Breadcrumb indicator */}
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            {navigationHistory.length > 1 && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {navigationHistory.length} pages dans l'historique
              </span>
            )}
          </div>
          
          {/* User indicator */}
          <div className="flex items-center space-x-2">
            {user && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.first_name} {user.last_name}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

/**
 * Enhanced Link Component with activity tracking
 */
export function NavigationLink({ href, children, className, ...props }) {
  const router = useRouter()
  const { updateActivity, saveIntendedPath } = useAuthStore()

  const handleClick = (e) => {
    e.preventDefault()
    
    console.log('🔗 Navigation link clicked:', href)
    updateActivity()
    
    // Save intended path for auth guard
    saveIntendedPath(href)
    
    router.push(href)
    
    // Call original onClick if provided
    if (props.onClick) {
      props.onClick(e)
    }
  }

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}

/**
 * Hook for programmatic navigation with activity tracking
 */
export function useNavigationRouter() {
  const router = useRouter()
  const { updateActivity, saveIntendedPath } = useAuthStore()

  const push = (href, options) => {
    console.log('🚀 Programmatic navigation:', href)
    updateActivity()
    saveIntendedPath(href)
    return router.push(href, options)
  }

  const replace = (href, options) => {
    console.log('🔄 Programmatic replace:', href)
    updateActivity()
    return router.replace(href, options)
  }

  const back = () => {
    console.log('⬅️ Programmatic back')
    updateActivity()
    return router.back()
  }

  const forward = () => {
    console.log('➡️ Programmatic forward')
    updateActivity()
    return router.forward()
  }

  return {
    ...router,
    push,
    replace,
    back,
    forward
  }
}

export default NavigationWrapper