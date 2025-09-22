'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ROLE_DEFINITIONS, UserRole } from '@/lib/constants/enums'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User, Building2, TestTube, Clock, Shield, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ROLE_COLORS } from '@/lib/constants/colors'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

export function DashboardHeader() {
  const router = useRouter()
  const { 
    user, 
    company, 
    logout, 
    getRoleData,
    isSessionValid,
    extendSession,
    updateActivity,
    lastActivity,
    sessionTimeout
  } = useAuthStore()
  
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null)

  // Session countdown timer
  useEffect(() => {
    const updateTimer = () => {
      if (lastActivity && sessionTimeout) {
        const timeLeft = sessionTimeout - (Date.now() - lastActivity)
        setSessionTimeLeft(Math.max(0, timeLeft))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [lastActivity, sessionTimeout])

  // Format time remaining
  const formatTimeLeft = (ms) => {
    if (ms <= 0) return '0m'
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie', {
      description: 'Vous avez été déconnecté avec succès'
    })
    router.push('/auth/login')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
  }

  const handleExtendSession = () => {
    extendSession()
    toast.success('Session prolongée', {
      description: 'Votre session a été prolongée de 8 heures'
    })
  }

  const roleData = getRoleData()

  // Session warning when less than 30 minutes remaining
  const isSessionExpiringSoon = sessionTimeLeft && sessionTimeLeft < 30 * 60 * 1000

  return (
    <header className="bg-gradient-to-r from-white via-slate-50 to-blue-50/30 border-b border-slate-200/60 h-16 flex items-center justify-between px-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            👋 Salut, {user?.first_name} !
          </h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-slate-600">
                {roleData?.label} • {company?.name}
              </p>
              {roleData && (
                <Badge 
                  className={cn(
                    'text-xs font-semibold border-0 shadow-md transition-all duration-200 hover:scale-105',
                    ROLE_COLORS[user?.role]?.bg || 'bg-gradient-to-r from-blue-500 to-blue-600',
                    'text-white'
                  )}
                >
                  <Shield className="mr-1 h-3 w-3" />
                  {roleData.name}
                </Badge>
              )}
            </div>
            
            {USE_MOCK_DATA && (
              <Badge className="text-xs border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                <TestTube className="mr-1 h-3 w-3" />
                Mode Démo
              </Badge>
            )}

            {/* Session Timer - Plus discret et moderne */}
            {sessionTimeLeft && (
              <Badge 
                className={cn(
                  'text-xs border-0 shadow-md transition-all duration-200',
                  isSessionExpiringSoon 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                )}
              >
                <Clock className="mr-1 h-3 w-3" />
                {isSessionExpiringSoon ? 'Expire bientôt' : 'Session active'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Session warning and extend button */}
        {isSessionExpiringSoon && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExtendSession}
            className="text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100 transition-all duration-300 hover:scale-105 shadow-md"
          >
            <Activity className="mr-2 h-4 w-4" />
            Prolonger la session
          </Button>
        )}

        {/* User Info modernisée */}
        <div className="text-right hidden sm:block bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-800">
            {user?.full_name || `${user?.first_name} ${user?.last_name}`}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            {user?.email}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-slate-100 transition-all duration-200 hover:scale-105 shadow-lg ring-2 ring-slate-200/50">
              <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-white shadow-lg">
                <AvatarFallback className={cn(
                  'font-bold text-white text-lg shadow-inner',
                  ROLE_COLORS[user?.role]?.bg || 'bg-gradient-to-r from-blue-500 to-blue-600'
                )}>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/60 rounded-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-slate-200">
                    <AvatarFallback className={cn(
                      'text-white text-sm font-bold',
                      ROLE_COLORS[user?.role]?.bg || 'bg-gradient-to-r from-blue-500 to-blue-600'
                    )}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold leading-none text-slate-800">
                      {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                    </p>
                    <p className="text-xs leading-none text-slate-500 mt-1 font-medium">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                {roleData && (
                  <Badge 
                    className={cn(
                      'text-xs w-fit font-semibold border-0 shadow-md',
                      ROLE_COLORS[user?.role]?.bg || 'bg-gradient-to-r from-blue-500 to-blue-600',
                      'text-white'
                    )}
                  >
                    {roleData.label}
                  </Badge>
                )}

                {USE_MOCK_DATA && (
                  <Badge className="text-xs w-fit border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                    <TestTube className="mr-1 h-3 w-3" />
                    Mode Démo
                  </Badge>
                )}

                {/* Session info - Plus discrète */}
                {sessionTimeLeft && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Session : {isSessionExpiringSoon ? 'Expire bientôt' : 'Active'}
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="border-slate-200" />
            
            <DropdownMenuItem onClick={() => {
              updateActivity()
              router.push('/dashboard/profile')
            }} className="p-3 hover:bg-slate-50 transition-colors">
              <User className="mr-3 h-4 w-4 text-blue-500" />
              <span className="font-medium">Mon profil</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => {
              updateActivity()
              router.push('/dashboard/company')
            }} className="p-3 hover:bg-slate-50 transition-colors">
              <Building2 className="mr-3 h-4 w-4 text-green-500" />
              <span className="font-medium">Ma société</span>
            </DropdownMenuItem>
            
            {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) && (
              <DropdownMenuItem onClick={() => {
                updateActivity()
                router.push('/dashboard/settings')
              }} className="p-3 hover:bg-slate-50 transition-colors">
                <Settings className="mr-3 h-4 w-4 text-purple-500" />
                <span className="font-medium">Paramètres</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="border-slate-200" />
            
            {/* Session management */}
            <DropdownMenuItem onClick={handleExtendSession} className="p-3 hover:bg-slate-50 transition-colors">
              <Activity className="mr-3 h-4 w-4 text-orange-500" />
              <span className="font-medium">Prolonger la session</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="border-slate-200" />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 p-3 hover:bg-red-50 transition-colors">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}