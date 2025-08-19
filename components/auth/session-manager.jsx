'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Clock, RefreshCw, LogOut, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

/**
 * 🔧 FIXED: Session Manager - Handles session timeout warnings and automatic logout
 * Fixed memory leaks and improved cleanup
 */
export function SessionManager() {
  const { 
    isSessionValid, 
    getSessionInfo, 
    updateActivity, 
    logout, 
    extendSession,
    checkAuth
  } = useAuthStore()
  
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [autoExtendEnabled, setAutoExtendEnabled] = useState(true)
  
  // 🔧 FIX: Use refs to prevent stale closures and manage cleanup
  const warningShownRef = useRef(false)
  const intervalRef = useRef(null)
  const activityThrottleRef = useRef(0)
  const mountedRef = useRef(true)
  
  // 🔧 FIX: Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])
  
  // 🔧 FIX: Improved online/offline handling with proper cleanup
  useEffect(() => {
    const handleOnline = () => {
      if (!mountedRef.current) return
      setIsOnline(true)
      console.log('🌐 Connection restored')
      toast.success('Connexion rétablie')
    }
    
    const handleOffline = () => {
      if (!mountedRef.current) return
      setIsOnline(false)
      console.log('📡 Connection lost')
      toast.warning('Connexion perdue', {
        description: 'Mode hors ligne activé'
      })
    }
    
    // Check initial online status
    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // 🔧 FIX: Throttled activity handler to prevent excessive updates
  const handleActivity = useCallback(() => {
    if (!mountedRef.current || !autoExtendEnabled) return
    
    const now = Date.now()
    // Throttle to maximum once per 30 seconds
    if (now - activityThrottleRef.current < 30000) return
    
    activityThrottleRef.current = now
    updateActivity()
    
    // Reset warning if user becomes active
    if (showWarning) {
      setShowWarning(false)
      warningShownRef.current = false
      toast.success('Session prolongée automatiquement')
    }
  }, [updateActivity, showWarning, autoExtendEnabled])
  
  // 🔧 FIX: Improved activity tracking with proper cleanup
  useEffect(() => {
    if (!autoExtendEnabled) return
    
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    // Add passive listeners for better performance
    const addEventListeners = () => {
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true, capture: true })
      })
    }
    
    const removeEventListeners = () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, { capture: true })
      })
    }
    
    addEventListeners()
    
    return removeEventListeners
  }, [handleActivity, autoExtendEnabled])
  
  // 🔧 FIX: Improved session monitoring with better cleanup
  useEffect(() => {
    const checkSession = () => {
      if (!mountedRef.current) return
      
      if (!isSessionValid()) {
        console.log('💀 Session expired, logging out')
        logout('session_expired')
        toast.error('Session expirée', {
          description: 'Votre session a expiré, veuillez vous reconnecter'
        })
        return
      }
      
      const sessionInfo = getSessionInfo()
      const timeLeft = sessionInfo.remainingTime
      
      if (!mountedRef.current) return
      setRemainingTime(timeLeft)
      
      // Show warning when 5 minutes remain (300000 ms)
      if (timeLeft <= 300000 && timeLeft > 0 && !warningShownRef.current) {
        setShowWarning(true)
        warningShownRef.current = true
        console.log('⚠️ Session warning shown, time left:', Math.round(timeLeft / 1000), 'seconds')
      }
      
      // Auto logout when time is up
      if (timeLeft <= 0) {
        logout('session_timeout')
        toast.error('Session expirée', {
          description: 'Vous avez été déconnecté pour inactivité'
        })
      }
    }
    
    // Initial check
    checkSession()
    
    // Check every 30 seconds
    intervalRef.current = setInterval(checkSession, 30000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isSessionValid, getSessionInfo, logout])
  
  // 🔧 FIX: Enhanced session extension with proper error handling
  const handleExtendSession = async () => {
    if (!mountedRef.current) return
    
    try {
      if (isOnline) {
        // Refresh auth data from server
        console.log('🔄 Extending session with server refresh...')
        const result = await checkAuth(true) // Skip cache
        if (result.authenticated) {
          extendSession()
          if (mountedRef.current) {
            setShowWarning(false)
            warningShownRef.current = false
          }
          toast.success('Session prolongée avec succès')
        } else {
          throw new Error('Failed to extend session')
        }
      } else {
        // Offline mode - just extend locally
        console.log('🔄 Extending session offline...')
        extendSession()
        if (mountedRef.current) {
          setShowWarning(false)
          warningShownRef.current = false
        }
        toast.info('Session prolongée en mode hors ligne')
      }
    } catch (error) {
      console.error('❌ Failed to extend session:', error)
      toast.error('Échec de la prolongation', {
        description: 'Impossible de prolonger votre session'
      })
      
      // If extension fails, force logout after a delay
      setTimeout(() => {
        if (mountedRef.current) {
          logout('extension_failed')
        }
      }, 5000)
    }
  }
  
  // Handle manual logout
  const handleLogout = () => {
    logout('user_requested')
    toast.info('Déconnexion en cours...')
  }
  
  // Format remaining time for display
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Calculate progress percentage for progress bar
  const getProgressPercentage = () => {
    const sessionInfo = getSessionInfo()
    const totalTime = 8 * 60 * 60 * 1000 // 8 hours in ms
    return Math.max(0, (remainingTime / totalTime) * 100)
  }

  // 🔧 FIX: Handle dialog close properly
  const handleDialogChange = (open) => {
    if (!open && mountedRef.current) {
      setShowWarning(false)
    }
  }

  return (
    <>
      {/* Session Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-700">
              <Clock className="h-5 w-5 mr-2" />
              Session expire bientôt
            </DialogTitle>
            <DialogDescription>
              Votre session va expirer dans quelques minutes. Souhaitez-vous la prolonger ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Session expiring indicator */}
            <div className="text-center">
              <div className="text-lg font-medium text-amber-600 mb-2">
                Temps restant : {formatTime(remainingTime)}
              </div>
              <Progress value={getProgressPercentage()} className="w-full" />
            </div>
            
            {/* Offline indicator */}
            {!isOnline && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <WifiOff className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Mode hors ligne - Extension locale uniquement
                  </p>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={handleExtendSession}
                className="flex-1"
                disabled={remainingTime <= 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Prolonger la session
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
            
            {/* Auto-extend toggle */}
            <div className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                id="auto-extend"
                checked={autoExtendEnabled}
                onChange={(e) => setAutoExtendEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="auto-extend" className="text-gray-600">
                Prolonger automatiquement lors d'une activité
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SessionManager