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
import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export function DashboardHeader() {
  const router = useRouter()
  const { user, company, logout, getRoleName } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
    router.push('/auth/login')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
  }

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Bienvenue, {user?.first_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getRoleName()} • {company?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {user?.full_name || `${user?.first_name} ${user?.last_name}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/company')}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Ma société</span>
            </DropdownMenuItem>
            {(user?.role === '1' || user?.role === '2') && (
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}