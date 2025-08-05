'use client'

import { useEffect, useState, useRef } from 'react'
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
 * Session Manager - Handles session timeout warnings and automatic logout
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
  
  const warningShown = useRef(false)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  
  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🌐 Connection restored')
      toast.success('Connexion rétablie')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      console.log('📡 Connection lost')
      toast.warning('Connexion perdue', {
        description: 'Mode hors ligne activé'
      })
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Track user activity for auto-extension
  useEffect(() => {
    if (!autoExtendEnabled) return
    
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      updateActivity()
      
      // Reset warning if user becomes active
      if (showWarning) {
        setShowWarning(false)
        warningShown.current = false
        console.log('🔄 Session extended due to user activity')
        toast.success('Session prolongée automatiquement')
      }
    }
    
    // Throttle activity tracking to avoid excessive updates
    let lastActivity = 0
    const throttledActivity = () => {
      const now = Date.now()
      if (now - lastActivity > 30000) { // 30 seconds throttle
        lastActivity = now
        handleActivity()
      }
    }
    
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivity, true)
    })
    
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivity, true)
      })
    }
  }, [updateActivity, showWarning, autoExtendEnabled])
  
  // Session monitoring
  useEffect(() => {
    const checkSession = () => {
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
      
      setRemainingTime(timeLeft)
      
      // Show warning when 5 minutes remain (300000 ms)
      if (timeLeft <= 300000 && timeLeft > 0 && !warningShown.current) {
        setShowWarning(true)
        warningShown.current = true
      }
      
      // Auto logout when time is up
      if (timeLeft <= 0) {
        console.log('⏰ Session timeout reached')
        logout('session_timeout')
        toast.error('Session expirée', {
          description: 'Vous avez été déconnecté pour inactivité'
        })
      }
    }
    
    // Check every 30 seconds
    intervalRef.current = setInterval(checkSession, 30000)
    
    // Initial check
    checkSession()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isSessionValid, getSessionInfo, logout])
  
  // Handle session extension
  const handleExtendSession = async () => {
    try {
      console.log('🔄 Extending session...')
      
      if (isOnline) {
        // Refresh auth data from server
        const result = await checkAuth(true) // Skip cache
        if (result.authenticated) {
          extendSession()
          setShowWarning(false)
          warningShown.current = false
          toast.success('Session prolongée avec succès')
          console.log('✅ Session extended successfully')
        } else {
          throw new Error('Failed to extend session')
        }
      } else {
        // Offline mode - just extend locally
        extendSession()
        setShowWarning(false)
        warningShown.current = false
        toast.info('Session prolongée en mode hors ligne')
        console.log('📱 Session extended offline')
      }
    } catch (error) {
      console.error('❌ Failed to extend session:', error)
      toast.error('Échec de la prolongation', {
        description: 'Impossible de prolonger votre session'
      })
    }
  }
  
  // Handle manual logout
  const handleLogout = () => {
    console.log('👋 Manual logout requested')
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

  return (
    <>
      {/* Session Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
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
                Votre session va bientôt expirer
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