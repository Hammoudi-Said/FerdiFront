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
    <header className="bg-gradient-to-r from-background to-background/95 border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Bienvenue, {user?.first_name}
          </h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                {roleData?.label} • {company?.name}
              </p>
              {roleData && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'text-xs border',
                    roleData.textColor,
                    roleData.bgColor,
                    roleData.color.replace('bg-', 'border-')
                  )}
                >
                  <Shield className="mr-1 h-3 w-3" />
                  {roleData.name}
                </Badge>
              )}
            </div>
            
            {USE_MOCK_DATA && (
              <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                <TestTube className="mr-1 h-3 w-3" />
                Mode Démo
              </Badge>
            )}

            {/* Session Timer */}
            {sessionTimeLeft && (
              <Badge 
                variant={isSessionExpiringSoon ? "destructive" : "secondary"} 
                className="text-xs"
              >
                <Clock className="mr-1 h-3 w-3" />
                {formatTimeLeft(sessionTimeLeft)}
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
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Activity className="mr-2 h-4 w-4" />
            Prolonger
          </Button>
        )}

        {/* User Info */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {user?.full_name || `${user?.first_name} ${user?.last_name}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent">
              <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-primary/20">
                <AvatarFallback className={cn(
                  'font-bold text-white',
                  roleData?.color || 'bg-gray-500'
                )}>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn(
                      'text-white text-xs',
                      roleData?.color || 'bg-gray-500'
                    )}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                {roleData && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs w-fit',
                      roleData.textColor,
                      roleData.bgColor
                    )}
                  >
                    {roleData.label}
                  </Badge>
                )}

                {USE_MOCK_DATA && (
                  <Badge variant="outline" className="text-xs w-fit border-amber-200 bg-amber-50 text-amber-700">
                    <TestTube className="mr-1 h-3 w-3" />
                    Mode Démo
                  </Badge>
                )}

                {/* Session info */}
                {sessionTimeLeft && (
                  <div className="text-xs text-muted-foreground">
                    Session expire dans: {formatTimeLeft(sessionTimeLeft)}
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => {
              updateActivity()
              router.push('/dashboard/profile')
            }}>
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => {
              updateActivity()
              router.push('/dashboard/company')
            }}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Ma société</span>
            </DropdownMenuItem>
            
            {(user?.role === '1' || user?.role === '2') && (
              <DropdownMenuItem onClick={() => {
                updateActivity()
                router.push('/dashboard/settings')
              }}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            
            {/* Session management */}
            <DropdownMenuItem onClick={handleExtendSession}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Prolonger la session</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}